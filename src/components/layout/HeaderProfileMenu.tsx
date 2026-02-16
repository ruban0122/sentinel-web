'use client'

import { useState, useRef, useEffect } from 'react'
import { User, LogOut, Link as LinkIcon, ChevronDown, UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function HeaderProfileMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const supabase = createClient()
    const [userInitial, setUserInitial] = useState('U')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            if (user.email) setUserInitial(user.email[0].toUpperCase())

            const { data: profile } = await supabase
                .from('users')
                .select('profile_image_url')
                .eq('uid', user.id)
                .single()

            if (profile?.profile_image_url) {
                setAvatarUrl(profile.profile_image_url)
            }
        }
    }

    useEffect(() => {
        fetchProfile()

        const handleProfileUpdate = () => {
            fetchProfile()
        }
        window.addEventListener('profile-updated', handleProfileUpdate)

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            window.removeEventListener('profile-updated', handleProfileUpdate)
        }
    }, [supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem'
                }}
            >
                <div style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'hsl(var(--primary-foreground))',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    fontWeight: 600,
                    overflow: 'hidden'
                }}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        userInitial
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '200px',
                    padding: '0.5rem',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                }}>
                    <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="hover-item"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            color: 'hsl(var(--foreground))',
                            textDecoration: 'none',
                            transition: 'background 0.2s'
                        }}
                    >
                        <UserCircle size={18} style={{ color: 'hsl(var(--muted-foreground))' }} />
                        Profile Settings
                    </Link>

                    <button
                        onClick={handleSignOut}
                        className="hover-item"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            color: 'hsl(var(--destructive))',
                            background: 'transparent',
                            border: 'none',
                            width: '100%',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    )
}
