import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import FloorAssignment from './floor-assignment'

export default async function AssignFloorsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Get contractor details
    const { data: contractor } = await supabase
        .from('contractors')
        .select('*, sites(name)')
        .eq('id', id)
        .single()

    // Get all sites with their sections and floors
    const { data: sites } = await supabase
        .from('sites')
        .select(`
            id,
            name,
            sections(
                id,
                name,
                floors(
                    id,
                    name,
                    floor_code,
                    contractor_id
                )
            )
        `)
        .order('name')

    // Get current floor assignments for this contractor
    const { data: assignedFloors } = await supabase
        .from('floors')
        .select('id')
        .eq('contractor_id', id)

    const assignedFloorIds = assignedFloors?.map(f => f.id) || []

    if (!contractor) {
        return <div>Contractor not found</div>
    }

    return (
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link
                    href="/settings/contractors"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem', textDecoration: 'none' }}
                    className="btn btn-ghost"
                >
                    <ArrowLeft size={16} />
                    Back to Contractors
                </Link>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Assign Floors</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Assign floors to <strong>{contractor.name}</strong>
                </p>
            </div>

            <FloorAssignment
                contractorId={id}
                sites={sites || []}
                initialAssignedFloorIds={assignedFloorIds}
            />
        </div>
    )
}
