import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import FloorAssignment from './floor-assignment'

import { getCurrentUserCompanyId } from '@/lib/auth-utils'

export default async function AssignFloorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Get user's company_id
    const companyId = await getCurrentUserCompanyId()

    if (!companyId) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Access Denied</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Your account is not associated with a company.
                </p>
            </div>
        )
    }

    // Get contractor details - VERIFY COMPANY
    const { data: contractor } = await supabase
        .from('contractors')
        .select('*, floors(id, name, floor_code)')
        .eq('id', id)
        .eq('company_id', companyId)
        .single()

    // Get all sites with their sections and floors - FILTER BY COMPANY
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
                    floor_code
                )
            )
        `)
        .eq('company_id', companyId)
        .order('name')

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
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Assign Floor</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Assign a floor to <strong>{contractor.name}</strong>
                </p>
            </div>

            <FloorAssignment
                contractorId={id}
                sites={sites || []}
                currentFloorId={contractor.floor_id}
            />
        </div>
    )
}
