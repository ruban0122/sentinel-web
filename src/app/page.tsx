import Link from 'next/link'
import { Shield, Users, Activity, ChevronRight, Lock, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'radial-gradient(circle at top center, hsl(var(--primary)/0.05) 0%, transparent 50%)' }}>

      {/* Navigation */}
      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'hsl(var(--primary-foreground))',
            fontWeight: 700,
            fontSize: '1.25rem'
          }}>S</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>Sentinel</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login" style={{ color: 'hsl(var(--muted-foreground))', textDecoration: 'none', fontWeight: 500, fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
            Login
          </Link>
          <Link href="/signup" className="btn btn-primary" style={{ height: '2.25rem', fontSize: '0.875rem' }}>
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center' }}>

        <div style={{
          marginBottom: '1.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '99px',
          background: 'hsl(var(--secondary))',
          border: '1px solid hsla(var(--border), 0.5)',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'hsl(var(--muted-foreground))',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(142, 70%, 50%)' }}></span>
          <span>System Operational v2.0</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: '1.5rem',
          maxWidth: '800px',
          letterSpacing: '-0.03em',
          background: 'linear-gradient(to bottom, hsl(var(--foreground)) 0%, hsl(var(--muted-foreground)) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Next-Generation Worker Surveillance & Safety.
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: 'hsl(var(--muted-foreground))',
          marginBottom: '2.5rem',
          maxWidth: '600px',
          lineHeight: 1.6
        }}>
          A comprehensive platform for monitoring attendance, managing secure access, and ensuring compliance across all your sites.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/signup" className="btn btn-primary" style={{ height: '3.5rem', padding: '0 2rem', fontSize: '1.125rem', borderRadius: '99px' }}>
            Get Started
            <ChevronRight size={20} style={{ marginLeft: '0.5rem' }} />
          </Link>
          <Link href="/login" className="btn btn-ghost" style={{ height: '3.5rem', padding: '0 2rem', fontSize: '1.125rem', borderRadius: '99px', border: '1px solid hsl(var(--border))' }}>
            Existing User
          </Link>
        </div>

        {/* Features Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '6rem', width: '100%', maxWidth: '1200px', padding: '0 1rem' }}>
          <FeatureCard
            icon={Shield}
            title="Secure Access Control"
            description="Manage site access with granular permissions and real-time verification for all contractors."
          />
          <FeatureCard
            icon={Activity}
            title="Real-Time Monitoring"
            description="Track worker attendance, floor occupancy, and incidents as they happen with live dashboards."
          />
          <FeatureCard
            icon={BarChart3}
            title="Advanced Analytics"
            description="Gain insights into workforce productivity and safety compliance with detailed reporting tools."
          />
        </div>

      </main>

      {/* Footer */}
      <footer style={{ padding: '2rem', borderTop: '1px solid hsl(var(--border))', textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
        <p>&copy; {new Date().getFullYear()} Sentinel Systems. All rights reserved.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="card glass-panel hover-item" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{
        width: '3rem',
        height: '3rem',
        borderRadius: '0.75rem',
        background: 'hsl(var(--secondary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'hsl(var(--primary))'
      }}>
        <Icon size={24} />
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
      <p style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>{description}</p>
    </div>
  )
}
