import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
    const supabase = await createClient()
    try {
        const { rfid_tag, site_id } = await request.json()

        if (!rfid_tag || !site_id) {
            return NextResponse.json({ error: 'Missing rfid_tag or site_id' }, { status: 400 })
        }

        // 1. Find Worker
        const { data: worker, error: workerError } = await supabase
            .from('workers')
            .select('*')
            .eq('rfid_tag', rfid_tag)
            .single()

        if (workerError || !worker) {
            return NextResponse.json({ error: 'Worker not found or Invalid Tag' }, { status: 404 })
        }

        if (worker.status !== 'active') {
            // Assuming status 'active' is lower case based on previous context, 
            // user schema didn't specify constraint but assuming 'active' is the string.
            // If unsure, we might skip this check or use case-insensitive.
            // For now, let's strictly check 'active' but be graceful if status is null.
            if (worker.status && worker.status.toLowerCase() !== 'active') {
                return NextResponse.json({ error: 'Worker is not active' }, { status: 403 })
            }
        }

        // 2. Check for open session for Today
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        // According to user schema: table is `attendance`
        const { data: lastLog } = await supabase
            .from('attendance')
            .select('*')
            .eq('worker_id', worker.id)
            .is('check_out_time', null)
            .gte('check_in_time', startOfDay.toISOString())
            .maybeSingle()

        let action = 'check_in'

        if (lastLog) {
            // Check Out
            const checkOutTime = new Date()

            const { error: updateError } = await supabase
                .from('attendance')
                .update({
                    check_out_time: checkOutTime.toISOString()
                })
                .eq('id', lastLog.id)

            if (updateError) throw updateError
            action = 'check_out'
        } else {
            // Check In
            const now = new Date()
            const { error: insertError } = await supabase
                .from('attendance')
                .insert({
                    id: randomUUID(), // Generate ID manually as it is text NOT NULL
                    worker_id: worker.id,
                    worker_code: worker.worker_code,
                    rfid_tag: worker.rfid_tag,
                    site_id: site_id,
                    company_id: worker.company_id, // Propagate company_id
                    check_in_time: now.toISOString(),
                    date: now.toISOString(), // Store the date
                    status: 'present'
                })

            if (insertError) throw insertError
        }

        return NextResponse.json({
            success: true,
            worker: { name: worker.name, id: worker.id },
            action,
            timestamp: new Date().toISOString()
        })

    } catch (error: any) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
