'use client'

import React, { useState, useMemo } from 'react'
import { Edit, Trash2, Save, X, Briefcase, MapPin, Plus, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Contractor = {
    id: string
    name: string
    company_worker_code: string
    floor_id: string | null
    floors?: {
        id: string
        name: string
        floor_code: string
        sections: {
            name: string
            sites: {
                id: string
                name: string
            }
        }
    }
}

type Site = {
    id: string
    name: string
}

export default function ContractorList({
    initialContractors,
    sites
}: {
    initialContractors: Contractor[]
    sites: Site[]
}) {
    const [contractors, setContractors] = useState(initialContractors)
    const [editingContractor, setEditingContractor] = useState<{ id: string, name: string, company_worker_code: string } | null>(null)

    // Client-side filters
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSite, setSelectedSite] = useState('')
    const [hasFloor, setHasFloor] = useState('')

    const router = useRouter()
    const supabase = createClient()

    // Filter contractors client-side
    const filteredContractors = useMemo(() => {
        let filtered = contractors

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(c =>
                c.name?.toLowerCase().includes(query) ||
                c.company_worker_code?.toLowerCase().includes(query)
            )
        }

        // Site filter
        if (selectedSite) {
            filtered = filtered.filter(c =>
                c.floors?.sections?.sites?.id === selectedSite
            )
        }

        // Floor assignment filter
        if (hasFloor === 'true') {
            filtered = filtered.filter(c => c.floor_id !== null)
        } else if (hasFloor === 'false') {
            filtered = filtered.filter(c => c.floor_id === null)
        }

        return filtered
    }, [contractors, searchQuery, selectedSite, hasFloor])

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this contractor?')) return

        const { error } = await supabase.from('contractors').delete().eq('id', id)

        if (error) {
            alert('Error deleting contractor: ' + error.message)
            return
        }

        setContractors(contractors.filter(c => c.id !== id))
        router.refresh()
    }

    const handleUpdate = async () => {
        if (!editingContractor) return

        const { error } = await supabase
            .from('contractors')
            .update({
                name: editingContractor.name,
                company_worker_code: editingContractor.company_worker_code
            })
            .eq('id', editingContractor.id)

        if (error) {
            alert('Error updating contractor: ' + error.message)
            return
        }

        setContractors(contractors.map(c =>
            c.id === editingContractor.id ? { ...c, name: editingContractor.name, company_worker_code: editingContractor.company_worker_code } : c
        ))
        setEditingContractor(null)
        router.refresh()
    }

    const handleClearFilters = () => {
        setSearchQuery('')
        setSelectedSite('')
        setHasFloor('')
    }

    const hasActiveFilters = searchQuery || selectedSite || hasFloor

    return (
        <div>
            {/* Filter Toolbar */}
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

                {/* Results count */}
                {filteredContractors.length > 0 && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                        Showing <strong>{filteredContractors.length}</strong> {filteredContractors.length === 1 ? 'contractor' : 'contractors'}
                        {hasActiveFilters && ' (filtered)'}
                    </div>
                )}
            </div>

            {/* Contractors List */}
            {filteredContractors.length === 0 ? (
                <div className="card glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                    <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'hsla(var(--muted), 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <Briefcase size={28} style={{ color: 'hsla(var(--muted-foreground), 0.5)' }} />
                    </div>
                    <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                        {hasActiveFilters ? 'No contractors found' : 'No contractors yet'}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1.5rem' }}>
                        {hasActiveFilters
                            ? 'Try adjusting your search or filters'
                            : 'Start by adding your first contractor'}
                    </p>
                    {!hasActiveFilters && (
                        <Link href="/settings/contractors/add" className="btn btn-primary">
                            <Plus size={16} /> Add Contractor
                        </Link>
                    )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    {filteredContractors.map(contractor => (
                        <div key={contractor.id} className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                            {editingContractor?.id === contractor.id ? (
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', display: 'block', marginBottom: '0.5rem' }}>
                                                Contractor Name
                                            </label>
                                            <input
                                                value={editingContractor.name}
                                                onChange={e => setEditingContractor({ ...editingContractor, name: e.target.value })}
                                                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', display: 'block', marginBottom: '0.5rem' }}>
                                                Worker Code
                                            </label>
                                            <input
                                                value={editingContractor.company_worker_code}
                                                onChange={e => setEditingContractor({ ...editingContractor, company_worker_code: e.target.value })}
                                                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', fontSize: '0.875rem', fontFamily: 'monospace' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={handleUpdate} className="btn btn-primary" style={{ fontSize: '0.875rem', gap: '0.375rem' }}>
                                            <Save size={14} /> Save Changes
                                        </button>
                                        <button onClick={() => setEditingContractor(null)} className="btn btn-ghost" style={{ fontSize: '0.875rem', gap: '0.375rem' }}>
                                            <X size={14} /> Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))' }}>
                                        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                                            <div style={{ height: '3.5rem', width: '3.5rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, hsla(var(--primary), 0.1), hsla(var(--primary), 0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid hsla(var(--primary), 0.2)', flexShrink: 0 }}>
                                                <Briefcase size={24} style={{ color: 'hsl(var(--primary))' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{contractor.name}</h3>
                                                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', fontFamily: 'monospace' }}>
                                                    Code: {contractor.company_worker_code || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Link
                                                href={`/settings/contractors/${contractor.id}/assign-floor`}
                                                className="btn btn-ghost"
                                                style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem', height: 'auto', gap: '0.375rem' }}
                                            >
                                                <MapPin size={14} /> Assign Floor
                                            </Link>
                                            <button
                                                onClick={() => setEditingContractor({ id: contractor.id, name: contractor.name, company_worker_code: contractor.company_worker_code })}
                                                className="btn btn-ghost"
                                                style={{ padding: '0.5rem', height: 'auto' }}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(contractor.id)}
                                                className="btn btn-ghost"
                                                style={{ padding: '0.5rem', height: 'auto', color: 'hsl(var(--destructive))' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.5rem', background: 'hsla(var(--muted), 0.1)' }}>
                                        {contractor.floors ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ height: '2.5rem', width: '2.5rem', borderRadius: '0.5rem', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid hsla(var(--primary), 0.2)' }}>
                                                    <MapPin size={16} style={{ color: 'hsl(var(--primary))' }} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.125rem' }}>Assigned Floor</p>
                                                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                                        {contractor.floors.floor_code} - {contractor.floors.name}
                                                    </p>
                                                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                                        {contractor.floors.sections.name} • {contractor.floors.sections.sites.name}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '1rem', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', fontStyle: 'italic' }}>
                                                No floor assigned yet
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
