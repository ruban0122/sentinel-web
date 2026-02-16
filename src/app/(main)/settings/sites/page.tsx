import { createClient } from '@/lib/supabase/server'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import SiteList from './site-list'
import { getCurrentUserCompanyId } from '@/lib/auth-utils'

export default async function SitesPage() {
    const supabase = await createClient()

    // Get the logged-in user's company_id
    const companyId = await getCurrentUserCompanyId()

    if (!companyId) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Access Denied</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Your account is not associated with a company. Please contact your administrator.
                </p>
            </div>
        )
    }

    // Fetch Sites with nested Sections and Floors - ONLY for the user's company
    const { data: sites } = await supabase
        .from('sites')
        .select(`
            *,
            sections (
                *,
                floors (*)
            )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Sites Management</h1>
                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Manage sites, sections, and floors structure.</p>
                </div>
                <Link href="/settings/sites/add" className="btn btn-primary" style={{ gap: '0.5rem' }}>
                    <Plus size={18} /> Add Site
                </Link>
            </div>

            <SiteList initialSites={sites || []} />

            {(!sites || sites.length === 0) && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
                    No sites found. Add one to get started.
                </div>
            )}
        </div>
    )
}
