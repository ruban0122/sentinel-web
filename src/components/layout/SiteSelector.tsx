'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Building2, Check, ChevronsUpDown } from 'lucide-react'

interface Site {
    id: string
    name: string
}

export function SiteSelector() {
    const [open, setOpen] = useState(false)
    const [sites, setSites] = useState<Site[]>([])
    const [selectedSiteName, setSelectedSiteName] = useState('All Sites')

    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()
    const dropdownRef = useRef<HTMLDivElement>(null)

    const currentSiteId = searchParams.get('site')

    useEffect(() => {
        const fetchSites = async () => {
            const { data } = await supabase
                .from('sites')
                .select('id, name')
                .eq('status', 'active')
                .order('name')

            if (data) {
                setSites(data)

                if (currentSiteId) {
                    const site = data.find(s => s.id === currentSiteId)
                    if (site) setSelectedSiteName(site.name)
                } else {
                    setSelectedSiteName('All Sites')
                }
            }
        }
        fetchSites()

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [supabase, currentSiteId])

    const handleSelect = (siteId: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (siteId) {
            params.set('site', siteId)
        } else {
            params.delete('site')
        }
        router.push(`?${params.toString()}`)
        setOpen(false)
    }

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="hover-item"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'hsl(var(--foreground))',
                    transition: 'background 0.2s'
                }}
            >
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Organization</span>
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>/</span>
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {selectedSiteName}
                    <ChevronsUpDown size={14} style={{ opacity: 0.5 }} />
                </span>
            </button>

            {open && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '120%',
                    left: 0,
                    width: '240px',
                    padding: '0.5rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 50,
                    maxHeight: '300px',
                    overflowY: 'auto'
                }}>
                    <div
                        onClick={() => handleSelect(null)}
                        className="hover-item"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            color: !currentSiteId ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                            background: !currentSiteId ? 'hsla(var(--primary), 0.1)' : 'transparent'
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Building2 size={16} /> All Sites
                        </span>
                        {!currentSiteId && <Check size={16} />}
                    </div>

                    {sites.map(site => (
                        <div
                            key={site.id}
                            onClick={() => handleSelect(site.id)}
                            className="hover-item"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                color: currentSiteId === site.id ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                                background: currentSiteId === site.id ? 'hsla(var(--primary), 0.1)' : 'transparent',
                                marginTop: '0.25rem'
                            }}
                        >
                            <span>{site.name}</span>
                            {currentSiteId === site.id && <Check size={16} />}
                        </div>
                    ))}

                    {sites.length === 0 && (
                        <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                            No active sites found
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
