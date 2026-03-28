import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

/**
 * POST /api/rfid/process-logs
 *
 * Reads entries from `updated_rfid_log` and converts them into proper
 * `attendance` records. Can be called:
 *  - Manually from the Attendance page (Sync button)
 *  - By a cron job
 *  - Via an IoT device webhook trigger
 *
 * Body (optional): { limit?: number }  — max rows to process per call (default 200)
 */
export async function POST(request: Request) {
    const supabase = await createClient()

    try {
        const body = await request.json().catch(() => ({}))
        const limit = Math.min(Number(body?.limit) || 200, 500)

        // ── 1. Pull recent updated_rfid_log entries ─────────────────────────
        const { data: rfidLogs, error: rfidError } = await supabase
            .from('updated_rfid_log')
            .select('*')
            .order('id', { ascending: false })
            .limit(limit)

        if (rfidError) {
            return NextResponse.json({ error: rfidError.message }, { status: 500 })
        }

        if (!rfidLogs || rfidLogs.length === 0) {
            return NextResponse.json({ message: 'No RFID logs to process.', processed: 0 })
        }

        let processed = 0
        let skipped = 0
        const errors: string[] = []

        for (const log of rfidLogs) {
            const { tag_hex, work_date, event_time, attendance: attendanceType, total_working_hour } = log

            if (!tag_hex || !work_date || !event_time || !attendanceType) {
                skipped++
                continue
            }

            // ── 2. Find the worker by RFID tag ───────────────────────────────
            // NOTE: workers table does NOT have floor_id — only site_id, section_id
            const { data: worker, error: workerError } = await supabase
                .from('workers')
                .select('id, name, worker_code, rfid_tag, company_id, site_id, section_id')
                .eq('rfid_tag', tag_hex)
                .maybeSingle()

            if (workerError || !worker) {
                errors.push(`Tag ${tag_hex}: worker not found`)
                skipped++
                continue
            }

            // ── 3. Build timestamps ───────────────────────────────────────────
            // event_time from device has no timezone — treat as UTC
            const checkOutMs = new Date(event_time).getTime()
            const checkOutTimestamp = new Date(checkOutMs).toISOString()

            // Derive check-in time from total_working_hour (in hours) if available
            // check_in = check_out - total_hours_in_milliseconds
            const workingHours = parseFloat(total_working_hour || '0')
            const derivedCheckInTimestamp = workingHours > 0
                ? new Date(checkOutMs - workingHours * 3600 * 1000).toISOString()
                : null

            // Day range: use work_date string directly to avoid timezone parsing issues
            const dayStart = `${work_date}T00:00:00.000Z`
            const dayEnd = `${work_date}T23:59:59.999Z`

            const isCheckIn = attendanceType.toLowerCase().includes('check in')
            const isCheckOut = attendanceType.toLowerCase().includes('check out')

            if (isCheckIn) {
                // ── 4a. CHECK IN ──────────────────────────────────────────────
                const { data: existingRecord } = await supabase
                    .from('attendance')
                    .select('id, check_in_time')
                    .eq('worker_id', worker.id)
                    .gte('date', dayStart)
                    .lte('date', dayEnd)
                    .maybeSingle()

                if (!existingRecord) {
                    // Create new attendance record (worker just scanned in, still working)
                    const { error: insertError } = await supabase
                        .from('attendance')
                        .insert({
                            id: randomUUID(),
                            worker_id: worker.id,
                            worker_code: worker.worker_code,
                            rfid_tag: tag_hex,
                            company_id: worker.company_id,
                            site_id: worker.site_id,
                            section_id: worker.section_id,
                            check_in_time: checkOutTimestamp,  // event_time IS the check-in time
                            date: checkOutTimestamp,
                            status: 'present',
                            notes: 'Auto-synced from RFID device'
                        })

                    if (insertError) {
                        errors.push(`Tag ${tag_hex} check-in: ${insertError.message}`)
                        skipped++
                    } else {
                        processed++
                    }
                } else {
                    // Record already exists — update check_in only if this event is earlier
                    const existingTime = new Date(existingRecord.check_in_time)
                    const incomingTime = new Date(checkOutTimestamp)
                    if (incomingTime < existingTime) {
                        await supabase
                            .from('attendance')
                            .update({ check_in_time: checkOutTimestamp })
                            .eq('id', existingRecord.id)
                        processed++
                    } else {
                        skipped++
                    }
                }

            } else if (isCheckOut) {
                // ── 4b. CHECK OUT ─────────────────────────────────────────────
                // The IoT device embeds total_working_hour in the check-out event.
                // We derive check_in_time = check_out_time - total_working_hours
                const { data: openRecord } = await supabase
                    .from('attendance')
                    .select('id, check_in_time, check_out_time')
                    .eq('worker_id', worker.id)
                    .gte('date', dayStart)
                    .lte('date', dayEnd)
                    .maybeSingle()

                if (openRecord) {
                    const existingOut = openRecord.check_out_time
                        ? new Date(openRecord.check_out_time)
                        : null
                    const incomingTime = new Date(checkOutTimestamp)

                    // Update if no checkout yet, or if this event is later
                    if (!existingOut || incomingTime > existingOut) {
                        const updatePayload: Record<string, any> = { check_out_time: checkOutTimestamp }
                        // Also fill in check_in if it was missing and we can derive it
                        if (!openRecord.check_in_time && derivedCheckInTimestamp) {
                            updatePayload.check_in_time = derivedCheckInTimestamp
                            updatePayload.date = derivedCheckInTimestamp
                        }
                        const { error: updateError } = await supabase
                            .from('attendance')
                            .update(updatePayload)
                            .eq('id', openRecord.id)

                        if (updateError) {
                            errors.push(`Tag ${tag_hex} check-out: ${updateError.message}`)
                            skipped++
                        } else {
                            processed++
                        }
                    } else {
                        skipped++
                    }
                } else {
                    // No record for this day at all → create a full record
                    // Derive check_in from total_working_hour
                    const { error: insertError } = await supabase
                        .from('attendance')
                        .insert({
                            id: randomUUID(),
                            worker_id: worker.id,
                            worker_code: worker.worker_code,
                            rfid_tag: tag_hex,
                            company_id: worker.company_id,
                            site_id: worker.site_id,
                            section_id: worker.section_id,
                            check_in_time: derivedCheckInTimestamp,   // derived from total_working_hour
                            check_out_time: checkOutTimestamp,
                            date: derivedCheckInTimestamp ?? checkOutTimestamp,
                            status: 'checked_out',
                            notes: derivedCheckInTimestamp
                                ? 'Auto-synced from RFID device (check-in derived from total_working_hour)'
                                : 'Auto-synced from RFID device (check-out only — no working hours data)'
                        })

                    if (insertError) {
                        errors.push(`Tag ${tag_hex} checkout-only: ${insertError.message}`)
                        skipped++
                    } else {
                        processed++
                    }
                }
            } else {
                // Unknown attendance type
                errors.push(`Tag ${tag_hex}: unknown attendance type "${attendanceType}"`)
                skipped++
            }
        }

        return NextResponse.json({
            success: true,
            total: rfidLogs.length,
            processed,
            skipped,
            errors: errors.length > 0 ? errors : undefined
        })

    } catch (err: any) {
        console.error('[process-logs]', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

/** GET — health check */
export async function GET() {
    return NextResponse.json({ status: 'ok', endpoint: '/api/rfid/process-logs' })
}
