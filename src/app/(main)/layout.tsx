import { Sidebar } from '@/components/layout/Sidebar'
import { Bell, Search, User } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { HeaderProfileMenu } from '@/components/layout/HeaderProfileMenu'
import { SiteSelector } from '@/components/layout/SiteSelector'
import { Suspense } from 'react'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
            <Sidebar />
            <div className="main-content">
                <header className="glass-panel" style={{
                    height: '4rem',
                    marginBottom: '2.5rem',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 1.5rem',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: '1rem',
                    zIndex: 40
                }}>
                    <Suspense fallback={<div>Loading...</div>}>
                        <SiteSelector />
                    </Suspense>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{
                            position: 'relative',
                            marginRight: '0.5rem',
                            display: 'none' // Hide on mobile if needed, but we assume desktop for dash
                        }} className="hidden md:block">
                            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))', zIndex: 10 }} />
                            <input
                                type="text"
                                placeholder="Search..."
                                style={{
                                    paddingLeft: '2.5rem',
                                    height: '2.25rem',
                                    width: '240px',
                                    borderRadius: '99px',
                                    background: 'hsl(var(--secondary))',
                                    border: 'none',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>

                        <ModeToggle />

                        <button className="btn btn-ghost" style={{ padding: '0.5rem', color: 'hsl(var(--muted-foreground))', borderRadius: '50%', height: '2.5rem', width: '2.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Bell size={20} />
                                <span style={{ position: 'absolute', top: '-1px', right: '-1px', height: '8px', width: '8px', background: 'hsl(var(--destructive))', borderRadius: '50%', border: '2px solid hsl(var(--background))' }}></span>
                            </div>
                        </button>

                        <HeaderProfileMenu />
                    </div>
                </header>
                {children}
            </div>
        </div>
    )
}
