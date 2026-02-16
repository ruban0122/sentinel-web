'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export function StatusTabs() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentTab = searchParams.get('tab') || 'active'

    const handleTabChange = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', tab)
        router.push(`?${params.toString()}`)
    }

    return (
        <div style={{ display: 'inline-flex', background: 'hsl(var(--secondary))', padding: '0.25rem', borderRadius: '0.75rem', marginBottom: '2rem' }}>
            {['active', 'resolved'].map((tab) => {
                const isActive = currentTab === tab
                return (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: isActive ? 'hsl(var(--background))' : 'transparent',
                            color: isActive ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                            fontWeight: isActive ? 600 : 500,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {tab}
                    </button>
                )
            })}
        </div>
    )
}
