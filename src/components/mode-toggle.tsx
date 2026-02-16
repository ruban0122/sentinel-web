"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div style={{ width: '2.5rem', height: '2.5rem' }} /> // Placeholder
        )
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="btn btn-ghost"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
            style={{
                width: '2.5rem',
                height: '2.5rem',
                padding: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid hsl(var(--border))',
                background: 'hsla(var(--background), 0.5)',
            }}
        >
            {theme === "dark" ? (
                <Moon size={18} />
            ) : (
                <Sun size={18} />
            )}
        </button>
    )
}
