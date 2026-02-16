export default function Loading() {
    return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
            <div style={{ height: '40px', width: '200px', background: 'hsl(var(--muted))', borderRadius: 'var(--radius)' }}></div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ height: '160px', background: 'hsl(var(--muted))', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }}></div>
                ))}
            </div>
        </div>
    )
}
