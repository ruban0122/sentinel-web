'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

type SyncResult = {
    success: boolean
    total?: number
    processed?: number
    skipped?: number
    errors?: string[]
    message?: string
    error?: string
}

export default function AttendanceSyncButton() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<SyncResult | null>(null)
    const [showResult, setShowResult] = useState(false)

    const handleSync = async () => {
        setLoading(true)
        setResult(null)
        try {
            const res = await fetch('/api/rfid/process-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: 200 })
            })
            const data: SyncResult = await res.json()
            setResult(data)
            setShowResult(true)
            // Auto-hide after 5 seconds, then refresh
            setTimeout(() => {
                setShowResult(false)
                window.location.reload()
            }, 5000)
        } catch {
            setResult({ success: false, error: 'Network error. Please try again.' })
            setShowResult(true)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={handleSync}
                disabled={loading}
                id="rfid-sync-btn"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius)',
                    background: loading ? 'hsl(var(--muted))' : 'hsl(var(--primary))',
                    color: loading ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary-foreground))',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.7 : 1
                }}
            >
                <RefreshCw
                    size={15}
                    style={{
                        animation: loading ? 'spin 1s linear infinite' : 'none'
                    }}
                />
                {loading ? 'Syncing…' : 'Sync RFID Logs'}
            </button>

            {/* Result tooltip */}
            {showResult && result && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 0.5rem)',
                    minWidth: '260px',
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius)',
                    background: 'hsl(var(--card))',
                    border: `1px solid ${result.success ? 'hsla(142, 71%, 45%, 0.3)' : 'hsla(0, 71%, 55%, 0.3)'}`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                    zIndex: 50,
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {result.success
                            ? <CheckCircle size={16} style={{ color: 'hsl(142, 71%, 45%)', flexShrink: 0 }} />
                            : <AlertCircle size={16} style={{ color: 'hsl(0, 71%, 55%)', flexShrink: 0 }} />
                        }
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {result.success ? 'Sync Complete' : 'Sync Failed'}
                        </span>
                    </div>
                    {result.success && result.total !== undefined && (
                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                            <div>📥 {result.total} logs read</div>
                            <div>✅ {result.processed} records processed</div>
                            <div>⏭ {result.skipped} skipped</div>
                        </div>
                    )}
                    {result.message && (
                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>{result.message}</div>
                    )}
                    {result.error && (
                        <div style={{ fontSize: '0.8rem', color: 'hsl(0, 71%, 55%)' }}>{result.error}</div>
                    )}
                    {result.errors && result.errors.length > 0 && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'hsl(38, 92%, 50%)' }}>
                            ⚠ {result.errors.length} tag(s) not matched to workers
                        </div>
                    )}
                    <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>
                        Page will refresh automatically…
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    )
}
