'use client'

import React, { useState } from 'react'
import { Plus, Trash2, Edit, Save, X, Check, Building2, MapPin, Layers } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { useRouter } from 'next/navigation'

type Floor = {
    id: string
    name: string
    floor_code: string
}

type Section = {
    id: string
    name: string
    floors: Floor[]
}

type Site = {
    id: string
    name: string
    company_id: string
    latitude: number
    longitude: number
    sections: Section[]
}

export default function SiteList({ initialSites }: { initialSites: Site[] }) {
    const [sites, setSites] = useState(initialSites)
    const router = useRouter()
    const supabase = createClient()

    const [addingSection, setAddingSection] = useState<string | null>(null)
    const [newSectionName, setNewSectionName] = useState('')

    const [addingFloor, setAddingFloor] = useState<string | null>(null)
    const [newFloorData, setNewFloorData] = useState({ name: '', floor_code: '' })

    const [editingSite, setEditingSite] = useState<{ id: string, name: string, latitude: number, longitude: number } | null>(null)
    const [editingSection, setEditingSection] = useState<{ id: string, name: string } | null>(null)
    const [editingFloor, setEditingFloor] = useState<{ id: string, name: string, floor_code: string } | null>(null)

    const handleAddSection = async (siteId: string) => {
        if (!newSectionName.trim()) return

        // Get the site's company_id
        const site = sites.find(s => s.id === siteId)
        if (!site?.company_id) {
            alert('Site company information not found')
            return
        }

        const { data, error } = await supabase.from('sections').insert({
            id: crypto.randomUUID(),
            name: newSectionName,
            site_id: siteId,
            company_id: site.company_id
        }).select().single()

        if (error) {
            alert('Error adding section: ' + error.message)
            return
        }

        router.refresh()
        setSites(sites.map(s => {
            if (s.id === siteId) {
                return { ...s, sections: [{ ...data, floors: [] }, ...(s.sections || [])] }
            }
            return s
        }))
        setNewSectionName('')
        setAddingSection(null)
    }

    const handleAddFloor = async (sectionId: string) => {
        if (!newFloorData.name.trim()) return

        const { data, error } = await supabase.from('floors').insert({
            id: crypto.randomUUID(),
            name: newFloorData.name,
            floor_code: newFloorData.floor_code,
            section_id: sectionId
        }).select().single()

        if (error) {
            alert('Error adding floor: ' + error.message)
            return
        }

        router.refresh()
        setSites(sites.map(s => {
            return {
                ...s,
                sections: s.sections?.map(sec => {
                    if (sec.id === sectionId) {
                        return { ...sec, floors: [...(sec.floors || []), data] }
                    }
                    return sec
                })
            }
        }))
        setNewFloorData({ name: '', floor_code: '' })
        setAddingFloor(null)
    }

    const handleDeleteSite = async (id: string) => {
        if (!confirm('Delete site? This will cascade delete sections and floors.')) return
        await supabase.from('sites').delete().eq('id', id)
        setSites(sites.filter(s => s.id !== id))
        router.refresh()
    }

    const handleDeleteSection = async (siteId: string, sectionId: string) => {
        if (!confirm('Delete section?')) return
        await supabase.from('sections').delete().eq('id', sectionId)
        setSites(sites.map(s => {
            if (s.id === siteId) {
                return { ...s, sections: s.sections.filter(sec => sec.id !== sectionId) }
            }
            return s
        }))
        router.refresh()
    }

    const handleDeleteFloor = async (sectionId: string, floorId: string) => {
        if (!confirm('Delete floor?')) return
        await supabase.from('floors').delete().eq('id', floorId)
        setSites(sites.map(s => {
            return {
                ...s,
                sections: s.sections.map(sec => {
                    if (sec.id === sectionId) {
                        return { ...sec, floors: sec.floors.filter(f => f.id !== floorId) }
                    }
                    return sec
                })
            }
        }))
        router.refresh()
    }

    const handleUpdateSite = async () => {
        if (!editingSite || !editingSite.name.trim()) return

        const { error } = await supabase.from('sites').update({
            name: editingSite.name,
            latitude: editingSite.latitude,
            longitude: editingSite.longitude
        }).eq('id', editingSite.id)

        if (error) {
            alert('Error updating site: ' + error.message)
            return
        }

        setSites(sites.map(s => s.id === editingSite.id ? { ...s, name: editingSite.name, latitude: editingSite.latitude, longitude: editingSite.longitude } : s))
        setEditingSite(null)
        router.refresh()
    }

    const handleUpdateSection = async (siteId: string) => {
        if (!editingSection || !editingSection.name.trim()) return

        const { error } = await supabase.from('sections').update({ name: editingSection.name }).eq('id', editingSection.id)
        if (error) {
            alert('Error updating section: ' + error.message)
            return
        }

        setSites(sites.map(s => {
            if (s.id === siteId) {
                return {
                    ...s,
                    sections: s.sections.map(sec => sec.id === editingSection.id ? { ...sec, name: editingSection.name } : sec)
                }
            }
            return s
        }))
        setEditingSection(null)
        router.refresh()
    }

    const handleUpdateFloor = async (sectionId: string) => {
        if (!editingFloor || !editingFloor.name.trim()) return

        const { error } = await supabase.from('floors').update({
            name: editingFloor.name,
            floor_code: editingFloor.floor_code
        }).eq('id', editingFloor.id)

        if (error) {
            alert('Error updating floor: ' + error.message)
            return
        }

        setSites(sites.map(s => {
            return {
                ...s,
                sections: s.sections.map(sec => {
                    if (sec.id === sectionId) {
                        return {
                            ...sec,
                            floors: sec.floors.map(f => f.id === editingFloor.id ? { ...f, name: editingFloor.name, floor_code: editingFloor.floor_code } : f)
                        }
                    }
                    return sec
                })
            }
        }))
        setEditingFloor(null)
        router.refresh()
    }


    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {sites.map(site => (
                <div key={site.id} className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                    {/* Site Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))' }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', flex: 1 }}>
                            <div style={{ height: '3.5rem', width: '3.5rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, hsla(var(--primary), 0.1), hsla(var(--primary), 0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))', flexShrink: 0, border: '1px solid hsla(var(--primary), 0.2)' }}>
                                <Building2 size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                {editingSite?.id === site.id ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <input
                                            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: '0.875rem', fontWeight: 600 }}
                                            value={editingSite.name}
                                            onChange={e => setEditingSite({ ...editingSite, name: e.target.value })}
                                            placeholder="Site Name"
                                        />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <input
                                                type="number"
                                                step="any"
                                                style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: '0.75rem' }}
                                                value={editingSite.latitude}
                                                onChange={e => setEditingSite({ ...editingSite, latitude: parseFloat(e.target.value) || 0 })}
                                                placeholder="Latitude"
                                            />
                                            <input
                                                type="number"
                                                step="any"
                                                style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: '0.75rem' }}
                                                value={editingSite.longitude}
                                                onChange={e => setEditingSite({ ...editingSite, longitude: parseFloat(e.target.value) || 0 })}
                                                placeholder="Longitude"
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={handleUpdateSite} className="btn btn-primary" style={{ fontSize: '0.75rem', height: '2rem', gap: '0.25rem' }}>
                                                <Save size={14} /> Save
                                            </button>
                                            <button onClick={() => setEditingSite(null)} className="btn btn-ghost" style={{ fontSize: '0.75rem', height: '2rem', gap: '0.25rem' }}>
                                                <X size={14} /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{site.name}</h3>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.625rem', fontWeight: 600, background: 'hsla(142, 71%, 45%, 0.1)', color: 'hsl(142, 71%, 45%)', border: '1px solid hsla(142, 71%, 45%, 0.2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Active
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                            <MapPin size={12} />
                                            <span style={{ fontFamily: 'monospace' }}>{site.latitude?.toFixed(4)}, {site.longitude?.toFixed(4)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        {editingSite?.id !== site.id && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    style={{ height: '2.25rem', width: '2.25rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'hsl(var(--muted-foreground))', cursor: 'pointer', transition: 'all 0.2s' }}
                                    className="btn btn-ghost"
                                    onClick={() => setEditingSite({ id: site.id, name: site.name, latitude: site.latitude, longitude: site.longitude })}
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    style={{ height: '2.25rem', width: '2.25rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'hsl(var(--muted-foreground))', cursor: 'pointer', transition: 'all 0.2s' }}
                                    className="btn btn-ghost"
                                    onClick={() => handleDeleteSite(site.id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sections Area */}
                    <div style={{ padding: '1.5rem', background: 'hsla(var(--muted), 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <Layers size={14} />
                                Sections ({site.sections?.length || 0})
                            </h4>
                            <button
                                className="btn btn-ghost"
                                style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', height: 'auto', gap: '0.375rem' }}
                                onClick={() => setAddingSection(addingSection === site.id ? null : site.id)}
                            >
                                {addingSection === site.id ? <X size={14} /> : <Plus size={14} />}
                                {addingSection === site.id ? 'Cancel' : 'Add Section'}
                            </button>
                        </div>

                        {addingSection === site.id && (
                            <div style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid hsla(var(--primary), 0.2)', background: 'hsla(var(--primary), 0.05)', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        autoFocus
                                        style={{ flex: 1, height: '2.25rem', padding: '0 0.75rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: '0.875rem' }}
                                        placeholder="Section Name (e.g. Manufacturing Plant A)"
                                        value={newSectionName}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSection(site.id)}
                                        onChange={e => setNewSectionName(e.target.value)}
                                    />
                                    <button className="btn btn-primary" style={{ height: '2.25rem', gap: '0.375rem' }} onClick={() => handleAddSection(site.id)}>
                                        <Save size={14} /> Save
                                    </button>
                                </div>
                            </div>
                        )}

                        <Accordion type="multiple" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                            {site.sections?.map((section, index) => (
                                <AccordionItem
                                    key={section.id}
                                    value={section.id}
                                    style={{
                                        borderBottom: index === (site.sections?.length || 0) - 1 ? 'none' : '1px solid hsl(var(--border))',
                                        background: 'transparent',
                                        width: '100%'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '1rem', transition: 'background 0.2s' }} className="hover:bg-muted/50">
                                        <AccordionTrigger style={{ flex: 1, padding: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                                                {editingSection?.id === section.id ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }} onClick={e => e.stopPropagation()}>
                                                        <input
                                                            value={editingSection.name}
                                                            onChange={e => setEditingSection({ ...editingSection, name: e.target.value })}
                                                            style={{ flex: 1, padding: '0.25rem 0.5rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', fontSize: '0.875rem' }}
                                                            onClick={e => e.stopPropagation()}
                                                        />
                                                        <button onClick={(e) => { e.stopPropagation(); handleUpdateSection(site.id); }} className="btn btn-ghost" style={{ padding: '0.25rem', height: 'auto' }}>
                                                            <Check size={14} />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); setEditingSection(null); }} className="btn btn-ghost" style={{ padding: '0.25rem', height: 'auto' }}>
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div style={{ height: '2rem', width: '2rem', borderRadius: '0.375rem', background: 'hsl(var(--muted))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--muted-foreground))' }}>
                                                            <Layers size={16} />
                                                        </div>
                                                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{section.name}</span>
                                                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginLeft: '0.5rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', background: 'hsla(var(--muted), 0.5)', border: '1px solid hsla(var(--border), 0.5)' }}>
                                                            {section.floors?.length || 0} floors
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </AccordionTrigger>
                                        {editingSection?.id !== section.id && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '1rem', paddingLeft: '0.75rem', borderLeft: '1px solid hsla(var(--border), 0.3)' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setEditingSection({ id: section.id, name: section.name }); }}
                                                    className="btn btn-ghost"
                                                    style={{ height: '1.75rem', width: '1.75rem', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteSection(site.id, section.id); }}
                                                    className="btn btn-ghost"
                                                    style={{ height: '1.75rem', width: '1.75rem', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--destructive))' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <AccordionContent style={{ background: 'transparent', padding: '0' }}>
                                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {section.floors?.map(floor => (
                                                <div
                                                    key={floor.id}
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid transparent', transition: 'all 0.2s' }}
                                                    className="hover-item"
                                                >
                                                    {editingFloor?.id === floor.id ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                                            <input
                                                                value={editingFloor.name}
                                                                onChange={e => setEditingFloor({ ...editingFloor, name: e.target.value })}
                                                                style={{ flex: 1, padding: '0.25rem 0.5rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', fontSize: '0.875rem' }}
                                                                placeholder="Floor Name"
                                                            />
                                                            <input
                                                                value={editingFloor.floor_code}
                                                                onChange={e => setEditingFloor({ ...editingFloor, floor_code: e.target.value })}
                                                                style={{ width: '5rem', padding: '0.25rem 0.5rem', border: '1px solid hsl(var(--border))', borderRadius: '4px', fontSize: '0.875rem', fontFamily: 'monospace' }}
                                                                placeholder="Code"
                                                            />
                                                            <button onClick={() => handleUpdateFloor(section.id)} className="btn btn-ghost" style={{ padding: '0.25rem', height: 'auto' }}>
                                                                <Check size={14} />
                                                            </button>
                                                            <button onClick={() => setEditingFloor(null)} className="btn btn-ghost" style={{ padding: '0.25rem', height: 'auto' }}>
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', background: 'hsla(var(--muted), 0.5)', color: 'hsl(var(--muted-foreground))', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid hsla(var(--border), 0.5)', minWidth: '2.25rem', textAlign: 'center' }}>
                                                                    {floor.floor_code}
                                                                </div>
                                                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{floor.name}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '0.25rem', opacity: 0 }} className="action-buttons">
                                                                <button
                                                                    onClick={() => setEditingFloor({ id: floor.id, name: floor.name, floor_code: floor.floor_code })}
                                                                    className="btn btn-ghost"
                                                                    style={{ padding: '0.25rem', height: 'auto' }}
                                                                >
                                                                    <Edit size={13} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteFloor(section.id, floor.id)}
                                                                    className="btn btn-ghost"
                                                                    style={{ padding: '0.25rem', height: 'auto', color: 'hsl(var(--destructive))' }}
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}

                                            {(!section.floors || section.floors.length === 0) && (
                                                <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', fontStyle: 'italic' }}>
                                                    No floors added yet. Start by adding one below.
                                                </div>
                                            )}

                                            <div style={{ paddingTop: '0.5rem' }}>
                                                {addingFloor === section.id ? (
                                                    <div style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid hsla(var(--primary), 0.2)', background: 'hsla(var(--primary), 0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <input
                                                            autoFocus
                                                            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: '0.875rem' }}
                                                            placeholder="Floor Name (e.g. Ground Floor)"
                                                            value={newFloorData.name}
                                                            onChange={e => setNewFloorData({ ...newFloorData, name: e.target.value })}
                                                        />
                                                        <input
                                                            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: '0.875rem', fontFamily: 'monospace' }}
                                                            placeholder="Code (e.g. GF)"
                                                            value={newFloorData.floor_code}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleAddFloor(section.id)}
                                                            onChange={e => setNewFloorData({ ...newFloorData, floor_code: e.target.value })}
                                                        />
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button className="btn btn-primary" style={{ fontSize: '0.75rem', height: '2rem', gap: '0.375rem' }} onClick={() => handleAddFloor(section.id)}>
                                                                <Check size={14} /> Add Floor
                                                            </button>
                                                            <button className="btn btn-ghost" style={{ fontSize: '0.75rem', height: '2rem', gap: '0.375rem' }} onClick={() => setAddingFloor(null)}>
                                                                <X size={14} /> Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setAddingFloor(section.id)}
                                                        className="btn btn-ghost"
                                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'hsl(var(--primary))', padding: '0.5rem' }}
                                                    >
                                                        <Plus size={14} /> Add Floor
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}

                            {(!site.sections || site.sections.length === 0) && !addingSection && (
                                <div style={{ padding: '3rem', textAlign: 'center', border: '2px dashed hsla(var(--border), 0.5)', borderRadius: '0.5rem', background: 'hsla(var(--muted), 0.1)' }}>
                                    <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'hsla(var(--muted), 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                                        <Layers size={20} style={{ color: 'hsla(var(--muted-foreground), 0.5)' }} />
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>No sections created yet</p>
                                    <button
                                        onClick={() => setAddingSection(site.id)}
                                        className="btn btn-ghost"
                                        style={{ fontSize: '0.75rem', fontWeight: 500, color: 'hsl(var(--primary))' }}
                                    >
                                        Create your first section
                                    </button>
                                </div>
                            )}
                        </Accordion>
                    </div>
                </div>
            ))}
        </div>
    )
}
