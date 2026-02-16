import { createClient } from '@/lib/supabase/server'
import { getCurrentUserCompanyId } from '@/lib/auth-utils'
import UserList from './user-list'
import { ArrowLeft, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default async function SystemUsersPage() {
    const supabase = await createClient()
    const companyId = await getCurrentUserCompanyId()

    if (!companyId) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Access Denied</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>Company ID not found.</p>
            </div>
        )
    }

    // Fetch Admin and Senior Staff users for this company
    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', companyId)
        .in('role', ['admin', 'senior_staff'])
        .order('name')

    if (error) {
        console.error('Error fetching users:', error)
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <Link
                    href="/settings"
                    className="btn btn-ghost"
                    style={{ marginBottom: '1rem', paddingLeft: 0, gap: '0.5rem', justifyContent: 'flex-start' }}
                >
                    <ArrowLeft size={16} />
                    Back to Settings
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>System Users</h1>
                        <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                            Manage administrators and senior staff members.
                        </p>
                    </div>
                </div>
            </div>

            <UserList users={users || []} />
        </div>
    )
}
