export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'hsl(var(--background))'
        }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '1rem' }}>
                {children}
            </div>
        </div>
    )
}
