'use client'

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useTransition } from 'react'

type Site = {
    id: string
    name: string
}

export function ContractorToolbar({ sites }: { sites: Site[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
    const [selectedSite, setSelectedSite] = useState(searchParams.get('site') || '')
    const [hasFloor, setHasFloor] = useState(searchParams.get('hasFloor') || '')

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateURL()
        }, 300) // 300ms debounce

        return () => clearTimeout(timer)
    }, [searchQuery, selectedSite, hasFloor])

    const updateURL = () => {
        const params = new URLSearchParams()

        if (searchQuery.trim()) params.set('q', searchQuery.trim())
        if (selectedSite) params.set('site', selectedSite)
        if (hasFloor) params.set('hasFloor', hasFloor)

        const queryString = params.toString()
        startTransition(() => {
            router.push(`/settings/contractors${queryString ? `?${queryString}` : ''}`)
        })
    }

    const handleClearFilters = () => {
        setSearchQuery('')
        setSelectedSite('')
        setHasFloor('')
    }

    const hasActiveFilters = searchQuery || selectedSite || hasFloor

    return (
        <div className="card glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Search Input */}
                <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '200px' }}>
                    <Search
                        size={16}
                        style={{
                            position: 'absolute',
                            left: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'hsl(var(--muted-foreground))'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search by name or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--background))',
                            fontSize: '0.875rem'
                        }}
                    />
                    {isPending && (
                        <div style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '0.75rem',
                            color: 'hsl(var(--muted-foreground))'
                        }}>
                            Searching...
                        </div>
                    )}
                </div>

                {/* Site Filter */}
                <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--background))',
                        fontSize: '0.875rem',
                        minWidth: '140px'
                    }}
                >
                    <option value="">All Sites</option>
                    {sites.map(site => (
                        <option key={site.id} value={site.id}>{site.name}</option>
                    ))}
                </select>

                {/* Floor Assignment Filter */}
                <select
                    value={hasFloor}
                    onChange={(e) => setHasFloor(e.target.value)}
                    style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--background))',
                        fontSize: '0.875rem',
                        minWidth: '140px'
                    }}
                >
                    <option value="">All Status</option>
                    <option value="true">Assigned</option>
                    <option value="false">Unassigned</option>
                </select>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <button
                        onClick={handleClearFilters}
                        className="btn btn-ghost"
                        style={{ gap: '0.375rem', fontSize: '0.875rem', padding: '0.5rem 0.75rem', height: 'auto' }}
                    >
                        <X size={14} />
                        Clear
                    </button>
                )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid hsla(var(--border), 0.5)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>
                        Active filters:
                    </span>
                    {searchQuery && (
                        <span style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: 'hsla(var(--primary), 0.1)',
                            color: 'hsl(var(--primary))',
                            border: '1px solid hsla(var(--primary), 0.2)',
                            fontWeight: 500
                        }}>
                            Search: "{searchQuery}"
                        </span>
                    )}
                    {selectedSite && (
                        <span style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: 'hsla(var(--primary), 0.1)',
                            color: 'hsl(var(--primary))',
                            border: '1px solid hsla(var(--primary), 0.2)',
                            fontWeight: 500
                        }}>
                            Site: {sites.find(s => s.id === selectedSite)?.name}
                        </span>
                    )}
                    {hasFloor && (
                        <span style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            background: 'hsla(var(--primary), 0.1)',
                            color: 'hsl(var(--primary))',
                            border: '1px solid hsla(var(--primary), 0.2)',
                            fontWeight: 500
                        }}>
                            {hasFloor === 'true' ? 'Assigned to Floor' : 'Not Assigned'}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
