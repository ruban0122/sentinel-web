import { createClient } from '@/lib/supabase/server'
import { getCurrentUserCompanyId } from '@/lib/auth-utils'
import { ArrowLeft, Mail, Phone, Calendar, Shield, Building2, User } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const companyId = await getCurrentUserCompanyId()

    if (!companyId) {
        return <div>Access Denied</div>
    }

    // Fetch user details - Ensure scoped to company
    const { data: user, error } = await supabase
        .from('users')
        .select(`
            *,
            company:companies(name)
        `)
        .eq('id', id)
        .eq('company_id', companyId)
        .single()

    if (error || !user) {
        notFound()
    }

    const { data: authUser } = await supabase.auth.admin.getUserById(user.uid)
    // Note: getUserById only works if service_role used, but here we are using standard client.
    // Standard client cannot access other users' auth data typically. 
    // We'll rely on public.users table data.

    const getRoleColor = (role: string) => {
        switch (role?.toLowerCase()) {
            case 'admin': return 'hsl(var(--destructive))'
            case 'senior_staff': return 'hsl(142, 71%, 45%)'
            default: return 'hsl(var(--muted-foreground))'
        }
    }

    const formatRole = (role: string) => {
        return role?.replace(/_/g, ' ') || ''
    }

    return (
        <div>
            <Link
                href="/settings/users"
                className="btn btn-ghost"
                style={{ marginBottom: '1.5rem', paddingLeft: 0, gap: '0.5rem', justifyContent: 'flex-start' }}
            >
                <ArrowLeft size={16} />
                Back to Users
            </Link>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>

                {/* Profile Header */}
                <div className="card glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{
                        width: '6rem',
                        height: '6rem',
                        borderRadius: '50%',
                        background: 'hsl(var(--secondary))',
                        marginBottom: '1.5rem',
                        border: '4px solid hsla(var(--background), 0.5)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        {user.profile_image_url ? (
                            <img src={user.profile_image_url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={48} style={{ color: 'hsl(var(--muted-foreground))' }} />
                        )}
                    </div>

                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {user.name}
                    </h1>

                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.375rem 1rem',
                        borderRadius: '99px',
                        background: `${getRoleColor(user.role)}15`,
                        color: getRoleColor(user.role),
                        border: `1px solid ${getRoleColor(user.role)}30`,
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        textTransform: 'capitalize'
                    }}>
                        <Shield size={14} />
                        {formatRole(user.role)}
                    </div>
                </div>

                {/* Contact Information */}
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="card glass-panel">
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid hsl(var(--border))' }}>
                            Contact Information
                        </h3>
                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <Mail size={18} style={{ color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }} />
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}>Email Address</div>
                                    <div>{user.email}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <Phone size={18} style={{ color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }} />
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}>Phone Number</div>
                                    <div>{user.phone_number || 'Not provided'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card glass-panel">
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid hsl(var(--border))' }}>
                            System Information
                        </h3>
                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <Building2 size={18} style={{ color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }} />
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}>Company</div>
                                    <div>{user.company?.name || 'Unknown Company'}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <Calendar size={18} style={{ color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }} />
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}>Joined Date</div>
                                    <div>{new Date(user.created_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    color: 'hsl(var(--muted-foreground))',
                                    fontFamily: 'monospace',
                                    fontWeight: 700
                                }}>ID</div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}>User ID</div>
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{user.id}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
