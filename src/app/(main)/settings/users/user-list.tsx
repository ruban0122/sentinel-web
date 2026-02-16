'use client'

import React, { useState } from 'react'
import { Search, MoreVertical, Shield, User, Phone, Mail, Eye } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type SystemUser = {
    id: string
    name: string
    email: string
    role: string
    phone_number: string | null
    profile_image_url: string | null
    created_at: string
}

export default function UserList({ users }: { users: SystemUser[] }) {
    const [searchQuery, setSearchQuery] = useState('')
    const router = useRouter()

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getRoleBadgeColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'hsl(var(--destructive))' // Red for Admin
            case 'senior_staff':
                return 'hsl(142, 71%, 45%)' // Green for Senior Staff
            default:
                return 'hsl(var(--muted-foreground))'
        }
    }

    const formatRole = (role: string) => {
        return role.replace(/_/g, ' ')
    }

    return (
        <div>
            {/* Toolbar */}
            <div className="card glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '2.5rem', width: '100%' }}
                    />
                </div>
                <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                    Total: <strong>{filteredUsers.length}</strong>
                </div>
            </div>

            {/* User List Grid */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {filteredUsers.length === 0 ? (
                    <div className="card glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                        No users found matching your search.
                    </div>
                ) : (
                    filteredUsers.map(user => (
                        <div key={user.id} className="card glass-panel hover-item" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {/* Avatar */}
                                <div style={{
                                    width: '3rem',
                                    height: '3rem',
                                    borderRadius: '50%',
                                    background: 'hsl(var(--secondary))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid hsla(var(--border), 0.5)',
                                    overflow: 'hidden'
                                }}>
                                    {user.profile_image_url ? (
                                        <img src={user.profile_image_url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <User size={20} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                    )}
                                </div>

                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{user.name || 'Unknown Name'}</div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            padding: '0.125rem 0.5rem',
                                            borderRadius: '99px',
                                            background: `${getRoleBadgeColor(user.role || '')}15`, // 10% opacity
                                            color: getRoleBadgeColor(user.role || ''),
                                            border: `1px solid ${getRoleBadgeColor(user.role || '')}30`,
                                            textTransform: 'capitalize'
                                        }}>
                                            {formatRole(user.role || '')}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                            <Mail size={14} />
                                            {user.email}
                                        </div>
                                        {user.phone_number && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                <Phone size={14} />
                                                {user.phone_number}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Link href={`/settings/users/${user.id}`} className="btn btn-ghost" style={{ gap: '0.5rem' }}>
                                <Eye size={16} />
                                Details
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
