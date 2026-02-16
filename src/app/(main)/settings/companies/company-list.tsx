'use client'

import { useState } from 'react'
import { Edit, Trash2, Save, X, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Company = {
    id: string
    name: string
    address: string | null
    created_at: string
}

export default function CompanyList({ initialCompanies }: { initialCompanies: Company[] }) {
    const [companies, setCompanies] = useState(initialCompanies)
    const [editingCompany, setEditingCompany] = useState<{ id: string, name: string, address: string } | null>(null)

    const router = useRouter()
    const supabase = createClient()

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this company? This will affect all associated data (sites, workers, etc.).')) return

        const { error } = await supabase.from('companies').delete().eq('id', id)

        if (error) {
            alert('Error deleting company: ' + error.message)
            return
        }

        setCompanies(companies.filter(c => c.id !== id))
        router.refresh()
    }

    const handleUpdate = async () => {
        if (!editingCompany) return

        const { error } = await supabase
            .from('companies')
            .update({
                name: editingCompany.name,
                address: editingCompany.address
            })
            .eq('id', editingCompany.id)

        if (error) {
            alert('Error updating company: ' + error.message)
            return
        }

        setCompanies(companies.map(c =>
            c.id === editingCompany.id
                ? { ...c, name: editingCompany.name, address: editingCompany.address }
                : c
        ))
        setEditingCompany(null)
        router.refresh()
    }

    if (companies.length === 0) {
        return (
            <div className="card glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'hsla(var(--muted), 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Building2 size={28} style={{ color: 'hsla(var(--muted-foreground), 0.5)' }} />
                </div>
                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No companies yet</h3>
                <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1.5rem' }}>
                    Start by adding your first company
                </p>
                <Link href="/settings/companies/add" className="btn btn-primary">
                    <Building2 size={16} /> Add Company
                </Link>
            </div>
        )
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {companies.map(company => (
                <div key={company.id} className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                    {editingCompany?.id === company.id ? (
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', display: 'block', marginBottom: '0.5rem' }}>
                                        Company Name
                                    </label>
                                    <input
                                        value={editingCompany.name}
                                        onChange={e => setEditingCompany({ ...editingCompany, name: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', display: 'block', marginBottom: '0.5rem' }}>
                                        Address
                                    </label>
                                    <textarea
                                        value={editingCompany.address}
                                        onChange={e => setEditingCompany({ ...editingCompany, address: e.target.value })}
                                        rows={3}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', fontSize: '0.875rem', resize: 'vertical' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button onClick={handleUpdate} className="btn btn-primary" style={{ fontSize: '0.875rem', gap: '0.375rem' }}>
                                    <Save size={14} /> Save Changes
                                </button>
                                <button onClick={() => setEditingCompany(null)} className="btn btn-ghost" style={{ fontSize: '0.875rem', gap: '0.375rem' }}>
                                    <X size={14} /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                                    <div style={{ height: '3.5rem', width: '3.5rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, hsla(var(--primary), 0.1), hsla(var(--primary), 0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid hsla(var(--primary), 0.2)', flexShrink: 0 }}>
                                        <Building2 size={24} style={{ color: 'hsl(var(--primary))' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{company.name}</h3>
                                        {company.address && (
                                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
                                                {company.address}
                                            </p>
                                        )}
                                        <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                            Created {new Date(company.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => setEditingCompany({
                                            id: company.id,
                                            name: company.name,
                                            address: company.address || ''
                                        })}
                                        className="btn btn-ghost"
                                        style={{ padding: '0.5rem', height: 'auto' }}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(company.id)}
                                        className="btn btn-ghost"
                                        style={{ padding: '0.5rem', height: 'auto', color: 'hsl(var(--destructive))' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
