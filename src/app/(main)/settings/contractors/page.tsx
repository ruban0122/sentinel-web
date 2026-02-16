import { createClient } from '@/lib/supabase/server'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import ContractorList from './contractor-list'
import { getCurrentUserCompanyId } from '@/lib/auth-utils'
import { Suspense } from 'react'

export default async function ContractorsPage() {
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

    // Parallel Fetching
    const [contractorsResult, sitesResult] = await Promise.all([
        supabase
            .from('contractors')
            .select(`
                *,
                floors(
                    id,
                    name,
                    floor_code,
                    sections(
                        name,
                        sites(
                            id,
                            name
                        )
                    )
                )
            `)
            .eq('company_id', companyId)
            .order('name'),

        supabase
            .from('sites')
            .select('id, name')
            .eq('company_id', companyId)
            .order('name')
    ])

    const contractors = contractorsResult.data
    const sites = sitesResult.data

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Contractors Management</h1>
                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                        Manage contractors and assign them to floors
                    </p>
                </div>
                <Link href="/settings/contractors/add" className="btn btn-primary" style={{ gap: '0.5rem' }}>
                    <Plus size={18} />
                    Add Contractor
                </Link>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <ContractorList
                    initialContractors={contractors || []}
                    sites={sites || []}
                />
            </Suspense>
        </div>
    )
}
