'use client'

import { Search, Filter, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

type Props = {
    sites: { id: string; name: string }[]
}

export function WorkerToolbar({ sites }: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [showFilters, setShowFilters] = useState(false)

    // Current State
    const query = searchParams.get('q') || ''
    const siteId = searchParams.get('site') || ''
    const status = searchParams.get('status') || ''

    // Debounce timer for search
    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('q', term)
        } else {
            params.delete('q')
        }
        replaceUrl(params)
    }

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        // Reset page if we had pagination (optional)
        replaceUrl(params)
    }

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams)
        params.delete('site')
        params.delete('status')
        params.delete('q')
        replaceUrl(params)
        setShowFilters(false)
    }

    const replaceUrl = (params: URLSearchParams) => {
        startTransition(() => {
            router.replace(`/workers?${params.toString()}`)
        })
    }

    const activeFilterCount = (siteId ? 1 : 0) + (status ? 1 : 0)

    return (
        <div className="card glass-panel" style={{ padding: '0', marginBottom: '1.5rem' }}>
            {/* Main Bar */}
            <div style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: showFilters ? '1px solid hsl(var(--border))' : 'none' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                    <input
                        defaultValue={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        type="text"
                        placeholder="Search by Name, RFID, or Code..."
                        style={{
                            width: '100%',
                            padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                            borderRadius: 'var(--radius)',
                            background: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            color: 'inherit',
                            outline: 'none'
                        }}
                    />
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn btn-ghost"
                    style={{
                        border: '1px solid hsl(var(--border))',
                        gap: '0.5rem',
                        backgroundColor: showFilters || activeFilterCount > 0 ? 'hsla(var(--primary), 0.1)' : 'transparent',
                        color: showFilters || activeFilterCount > 0 ? 'hsl(var(--primary))' : 'inherit'
                    }}
                >
                    <Filter size={18} />
                    Filters
                    {activeFilterCount > 0 && (
                        <span style={{
                            background: 'hsl(var(--primary))',
                            color: 'hsl(var(--primary-foreground))',
                            borderRadius: '50%',
                            width: '1.25rem',
                            height: '1.25rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem'
                        }}>
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {activeFilterCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="btn btn-ghost"
                        style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: 'hsla(var(--muted), 0.2)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' }}>Site</label>
                        <select
                            value={siteId}
                            onChange={(e) => handleFilterChange('site', e.target.value)}
                            style={{
                                padding: '0.5rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid hsl(var(--border))',
                                background: 'hsl(var(--background))',
                                minWidth: '200px',
                                outline: 'none'
                            }}
                        >
                            <option value="">All Sites</option>
                            {sites.map(site => (
                                <option key={site.id} value={site.id}>{site.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' }}>Status</label>
                        <select
                            value={status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            style={{
                                padding: '0.5rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid hsl(var(--border))',
                                background: 'hsl(var(--background))',
                                minWidth: '150px',
                                outline: 'none'
                            }}
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    )
}
