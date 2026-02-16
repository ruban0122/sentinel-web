import { createClient } from '@/lib/supabase/server'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import CompanyList from './company-list'

export default async function CompaniesPage() {
    const supabase = await createClient()

    // Get the logged-in user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Access Denied</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                    You must be logged in to manage companies.
                </p>
            </div>
        )
    }

    // Fetch ALL companies (not filtered by created_by)
    const { data: companies } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Companies Management</h1>
                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                        Manage all companies in the system
                    </p>
                </div>
                <Link href="/settings/companies/add" className="btn btn-primary" style={{ gap: '0.5rem' }}>
                    <Plus size={18} />
                    Add Company
                </Link>
            </div>

            <CompanyList initialCompanies={companies || []} />
        </div>
    )
}
