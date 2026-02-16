import Link from 'next/link'
import { Hotel, User, Shield, Briefcase, Building2 } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Settings</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <Link href="/settings/sites" className="card glass-panel" style={{ textDecoration: 'none', transition: 'transform 0.2s', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'hsl(var(--muted))', borderRadius: '0.5rem' }}>
                            <Hotel size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 600 }}>Sites & Floors</h3>
                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Manage locations</p>
                        </div>
                    </div>
                </Link>

                <Link href="/settings/contractors" className="card glass-panel" style={{ textDecoration: 'none', transition: 'transform 0.2s', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'hsl(var(--muted))', borderRadius: '0.5rem' }}>
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 600 }}>Contractors</h3>
                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Manage contractors & assignments</p>
                        </div>
                    </div>
                </Link>

                <Link href="/settings/companies" className="card glass-panel" style={{ textDecoration: 'none', transition: 'transform 0.2s', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'hsl(var(--muted))', borderRadius: '0.5rem' }}>
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 600 }}>Companies</h3>
                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Manage companies</p>
                        </div>
                    </div>
                </Link>

                <Link href="/settings/users" className="card glass-panel" style={{ textDecoration: 'none', transition: 'transform 0.2s', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'hsl(var(--muted))', borderRadius: '0.5rem' }}>
                            <User size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 600 }}>System Users</h3>
                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Manage admins & staff</p>
                        </div>
                    </div>
                </Link>

                <div className="card glass-panel" style={{ opacity: 0.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'hsl(var(--muted))', borderRadius: '0.5rem' }}>
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 600 }}>Roles & Permissions</h3>
                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Access control (Coming Soon)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
