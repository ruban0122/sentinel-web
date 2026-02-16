'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, Clock, PlayCircle, CheckCircle2, XCircle } from 'lucide-react'

type Status = 'pending' | 'in_progress' | 'resolved' | 'dismissed'

interface StatusOption {
    value: Status
    label: string
    color: string
    icon: any
}

const OPTIONS: StatusOption[] = [
    { value: 'pending', label: 'Pending', color: 'hsl(45, 90%, 55%)', icon: Clock },
    { value: 'in_progress', label: 'In Progress', color: 'hsl(210, 80%, 60%)', icon: PlayCircle },
    { value: 'resolved', label: 'Resolved', color: 'hsl(142, 70%, 50%)', icon: CheckCircle2 },
    { value: 'dismissed', label: 'Dismissed', color: 'hsl(var(--muted-foreground))', icon: XCircle }
]

export function StatusSelect({ tableName, id, initialStatus }: { tableName: 'incidents' | 'complaints', id: string, initialStatus: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [status, setStatus] = useState<Status>((initialStatus as Status) || 'pending')
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = async (newStatus: Status) => {
        if (newStatus === status) {
            setIsOpen(false)
            return
        }

        setLoading(true)

        // Track who updated
        const { data: { user } } = await supabase.auth.getUser()
        let updatedBy = user?.email || 'System'

        if (user) {
            // Try to get display name
            const { data: profile } = await supabase
                .from('users')
                .select('name')
                .eq('uid', user.id)
                .single()

            if (profile?.name) updatedBy = profile.name
        }

        const updates = {
            status: newStatus,
            status_updated_at: new Date().toISOString(),
            status_updated_by: updatedBy,
            status_updated_by_id: user?.id
        }

        const { error } = await supabase
            .from(tableName)
            .update(updates)
            .eq('id', id)

        if (!error) {
            setStatus(newStatus)
            router.refresh()
        }
        setLoading(false)
        setIsOpen(false)
    }

    const currentOption = OPTIONS.find(o => o.value === status) || OPTIONS[0]

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    background: `${currentOption.color}20`,
                    color: currentOption.color,
                    border: `1px solid ${currentOption.color}40`,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                {loading ? (
                    <span>Updating...</span>
                ) : (
                    <>
                        <currentOption.icon size={16} />
                        {currentOption.label}
                        <ChevronDown size={14} style={{ opacity: 0.7 }} />
                    </>
                )}
            </button>

            {isOpen && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '180px',
                    padding: '0.5rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 50
                }}>
                    {OPTIONS.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className="hover-item"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                color: option.value === status ? option.color : 'hsl(var(--foreground))',
                                background: option.value === status ? `${option.color}10` : 'transparent'
                            }}
                        >
                            <option.icon size={16} />
                            {option.label}
                            {option.value === status && <Check size={14} style={{ marginLeft: 'auto' }} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
