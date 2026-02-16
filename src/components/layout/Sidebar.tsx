'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, ClipboardCheck, AlertTriangle, MessageSquare, FileBarChart, Settings, Hotel, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import clsx from 'clsx'
import styles from './Layout.module.css'

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Workers', href: '/workers', icon: Users },
    { name: 'Attendance', href: '/attendance', icon: ClipboardCheck },
    { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
    { name: 'Complaints', href: '/complaints', icon: MessageSquare },
    { name: 'Reports', href: '/reports', icon: FileBarChart },
    { name: 'Sites', href: '/settings/sites', icon: Hotel },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="sidebar">
            <div className={styles.brand}>
                <div className={styles.logo}>S</div>
                <span className={styles.brandName}>Sentinel</span>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {navItems.map((item) => {
                    const isActive = item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(styles.navItem, isActive && styles.navItemActive)}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid hsl(var(--border))' }}>
                <LogoutButton />
            </div>
        </aside>
    )
}

function LogoutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} />
            Sign Out
        </button>
    )
}
