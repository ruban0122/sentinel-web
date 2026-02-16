'use client'

import React, { useState } from 'react'
import { Building2, Layers, Check, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'

type Floor = {
    id: string
    name: string
    floor_code: string
    contractor_id: string | null
}

type Section = {
    id: string
    name: string
    floors: Floor[]
}

type Site = {
    id: string
    name: string
    sections: Section[]
}

export default function FloorAssignment({
    contractorId,
    sites,
    initialAssignedFloorIds
}: {
    contractorId: string
    sites: Site[]
    initialAssignedFloorIds: string[]
}) {
    const [selectedFloorIds, setSelectedFloorIds] = useState<Set<string>>(
        new Set(initialAssignedFloorIds)
    )
    const [saving, setSaving] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const toggleFloor = (floorId: string) => {
        const newSet = new Set(selectedFloorIds)
        if (newSet.has(floorId)) {
            newSet.delete(floorId)
        } else {
            newSet.add(floorId)
        }
        setSelectedFloorIds(newSet)
    }

    const handleSave = async () => {
        setSaving(true)

        // First, unassign all floors for this contractor
        await supabase
            .from('floors')
            .update({ contractor_id: null })
            .eq('contractor_id', contractorId)

        // Then, assign selected floors
        if (selectedFloorIds.size > 0) {
            await supabase
                .from('floors')
                .update({ contractor_id: contractorId })
                .in('id', Array.from(selectedFloorIds))
        }

        setSaving(false)
        router.refresh()
        alert('Floor assignments saved successfully!')
    }

    const totalFloors = sites.reduce((acc, site) =>
        acc + site.sections.reduce((sAcc, section) => sAcc + section.floors.length, 0), 0
    )

    return (
        <div>
            <div className="card glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}>
                            Selected Floors
                        </p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            {selectedFloorIds.size} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'hsl(var(--muted-foreground))' }}>/ {totalFloors}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn btn-primary"
                        style={{ gap: '0.5rem' }}
                    >
                        {saving ? (
                            <>Saving...</>
                        ) : (
                            <>
                                <Save size={16} />
                                Save Assignments
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sites.map(site => (
                    <div key={site.id} className="card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))', background: 'linear-gradient(to right, hsla(var(--muted), 0.2), transparent)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ height: '3rem', width: '3rem', borderRadius: '0.75rem', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid hsla(var(--primary), 0.2)' }}>
                                    <Building2 size={20} style={{ color: 'hsl(var(--primary))' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.125rem' }}>{site.name}</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                        {site.sections.length} sections
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <Accordion type="multiple" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {site.sections.map(section => (
                                    <AccordionItem
                                        key={section.id}
                                        value={section.id}
                                        style={{ border: '1px solid hsla(var(--border), 0.6)', borderRadius: '0.5rem', overflow: 'hidden' }}
                                    >
                                        <AccordionTrigger style={{ padding: '0.75rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                                                <div style={{ height: '2rem', width: '2rem', borderRadius: '0.375rem', background: 'hsl(var(--muted))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Layers size={16} />
                                                </div>
                                                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{section.name}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginLeft: '0.5rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', background: 'hsla(var(--muted), 0.5)' }}>
                                                    {section.floors.filter(f => selectedFloorIds.has(f.id)).length} / {section.floors.length} selected
                                                </span>
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent style={{ background: 'hsla(var(--muted), 0.1)', borderTop: '1px solid hsla(var(--border), 0.5)' }}>
                                            <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
                                                {section.floors.map(floor => {
                                                    const isSelected = selectedFloorIds.has(floor.id)
                                                    const isAssignedToOther = floor.contractor_id && floor.contractor_id !== contractorId

                                                    return (
                                                        <button
                                                            key={floor.id}
                                                            onClick={() => !isAssignedToOther && toggleFloor(floor.id)}
                                                            disabled={!!isAssignedToOther}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                padding: '0.75rem 1rem',
                                                                borderRadius: '0.5rem',
                                                                border: isSelected
                                                                    ? '2px solid hsl(var(--primary))'
                                                                    : '1px solid hsl(var(--border))',
                                                                background: isSelected
                                                                    ? 'hsla(var(--primary), 0.1)'
                                                                    : isAssignedToOther
                                                                        ? 'hsla(var(--muted), 0.3)'
                                                                        : 'hsl(var(--background))',
                                                                cursor: isAssignedToOther ? 'not-allowed' : 'pointer',
                                                                transition: 'all 0.2s',
                                                                opacity: isAssignedToOther ? 0.5 : 1,
                                                                textAlign: 'left'
                                                            }}
                                                            className={!isAssignedToOther ? 'hover-item' : ''}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                <div style={{
                                                                    fontSize: '0.75rem',
                                                                    fontFamily: 'monospace',
                                                                    background: 'hsla(var(--muted), 0.5)',
                                                                    padding: '0.25rem 0.5rem',
                                                                    borderRadius: '0.25rem',
                                                                    minWidth: '2.25rem',
                                                                    textAlign: 'center',
                                                                    fontWeight: 600
                                                                }}>
                                                                    {floor.floor_code}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{floor.name}</div>
                                                                    {isAssignedToOther && (
                                                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                                                            Already assigned
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {isSelected && (
                                                                <div style={{
                                                                    height: '1.5rem',
                                                                    width: '1.5rem',
                                                                    borderRadius: '50%',
                                                                    background: 'hsl(var(--primary))',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: 'hsl(var(--primary-foreground))'
                                                                }}>
                                                                    <Check size={14} />
                                                                </div>
                                                            )}
                                                        </button>
                                                    )
                                                })}

                                                {section.floors.length === 0 && (
                                                    <div style={{
                                                        gridColumn: '1 / -1',
                                                        padding: '2rem',
                                                        textAlign: 'center',
                                                        fontSize: '0.875rem',
                                                        color: 'hsl(var(--muted-foreground))',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        No floors in this section
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}

                                {site.sections.length === 0 && (
                                    <div style={{
                                        padding: '2rem',
                                        textAlign: 'center',
                                        fontSize: '0.875rem',
                                        color: 'hsl(var(--muted-foreground))',
                                        border: '2px dashed hsla(var(--border), 0.5)',
                                        borderRadius: '0.5rem'
                                    }}>
                                        No sections in this site
                                    </div>
                                )}
                            </Accordion>
                        </div>
                    </div>
                ))}

                {sites.length === 0 && (
                    <div className="card glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                        <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'hsla(var(--muted), 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Building2 size={28} style={{ color: 'hsla(var(--muted-foreground), 0.5)' }} />
                        </div>
                        <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No sites available</h3>
                        <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                            Create sites and floors first to assign them to contractors
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
