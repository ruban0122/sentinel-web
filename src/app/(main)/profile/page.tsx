'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useRef } from 'react'
import { User, Camera, Lock, Save, Mail, Shield, ShieldCheck, KeyRound, UserCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfileSettingsPage() {
    const supabase = createClient()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [savingProfile, setSavingProfile] = useState(false)
    const [savingPassword, setSavingPassword] = useState(false)

    // Profile State
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Password State
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Feedback
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                setEmail(user.email || '')

                // Fetch public user data
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('uid', user.id)
                    .single()

                if (profile) {
                    setName(profile.name || '')
                    setRole(profile.role || '')
                    setAvatarUrl(profile.profile_image_url)
                }
            }
            setLoading(false)
        }
        getProfile()
    }, [supabase])

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        setSavingProfile(true)
        setMessage(null)

        // Upload to Supabase Storage
        // Bucket: profile_images
        const { error: uploadError } = await supabase.storage
            .from('profile_images')
            .upload(filePath, file)

        if (uploadError) {
            setMessage({ type: 'error', text: 'Error uploading image: ' + uploadError.message })
            setSavingProfile(false)
            return
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage.from('profile_images').getPublicUrl(filePath)

        // Update Profile
        await updateProfile(name, publicUrl)
        setAvatarUrl(publicUrl)
        setSavingProfile(false)
    }

    const updateProfile = async (newName: string, newAvatarUrl: string | null) => {
        const updates = {
            name: newName,
            profile_image_url: newAvatarUrl,
        }

        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('uid', user.id)

        if (error) {
            setMessage({ type: 'error', text: 'Failed to update profile: ' + error.message })
        } else {
            setMessage({ type: 'success', text: 'Profile updated successfully' })
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('profile-updated'))
            }
            router.refresh()
        }
    }

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSavingProfile(true)
        setMessage(null)
        await updateProfile(name, avatarUrl)
        setSavingProfile(false)
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' })
            return
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
            return
        }

        setSavingPassword(true)
        setMessage(null)

        const { error } = await supabase.auth.updateUser({ password: newPassword })

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({ type: 'success', text: 'Password updated successfully' })
            setNewPassword('')
            setConfirmPassword('')
        }
        setSavingPassword(false)
    }

    const formatRole = (r: string) => r?.replace(/_/g, ' ') || 'User'

    const getRoleColor = (r: string) => {
        switch (r?.toLowerCase()) {
            case 'admin': return 'hsl(var(--destructive))'
            case 'senior_staff': return 'hsl(142, 71%, 45%)'
            default: return 'hsl(var(--muted-foreground))'
        }
    }

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Account Settings</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))' }}>Manage your profile and security credentials.</p>
            </div>

            {message && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                    background: message.type === 'error' ? 'hsla(var(--destructive), 0.1)' : 'hsla(142, 71%, 45%, 0.1)',
                    color: message.type === 'error' ? 'hsl(var(--destructive))' : 'hsl(142, 71%, 45%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontWeight: 500
                }}>
                    {message.type === 'success' ? <ShieldCheck size={18} /> : <Shield size={18} />}
                    {message.text}
                </div>
            )}

            {/* Profile Header Card */}
            <div className="card glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '6rem',
                        height: '6rem',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'hsl(var(--secondary))',
                        border: '4px solid hsla(var(--background), 0.5)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={48} style={{ color: 'hsl(var(--muted-foreground))' }} />
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            background: 'hsl(var(--primary))',
                            color: 'hsl(var(--primary-foreground))',
                            border: '4px solid hsl(var(--background))',
                            borderRadius: '50%',
                            width: '2.25rem',
                            height: '2.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    >
                        <Camera size={14} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{name || 'Unknown'}</h2>

                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.375rem 1rem',
                    borderRadius: '99px',
                    background: `${getRoleColor(role)}15`,
                    color: getRoleColor(role),
                    border: `1px solid ${getRoleColor(role)}30`,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textTransform: 'capitalize'
                }}>
                    <Shield size={14} />
                    {formatRole(role)}
                </div>
            </div>

            {/* Personal Details */}
            <div className="card glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserCircle size={20} /> Personal Information
                </h3>
                <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
                            placeholder="Your Name"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                            <input
                                type="email"
                                value={email}
                                disabled
                                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsla(var(--muted), 0.5)', color: 'hsl(var(--muted-foreground))', cursor: 'not-allowed' }}
                            />
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                            {savingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Security Settings */}
            <div className="card glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={20} /> Security Settings
                </h3>

                <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid hsl(var(--border))' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Change Password</h4>
                    <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                        Ensure your account is using a long, random password to stay secure.
                    </p>
                </div>

                <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <KeyRound size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <KeyRound size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                            {savingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
