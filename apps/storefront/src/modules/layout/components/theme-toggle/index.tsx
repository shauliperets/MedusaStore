"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

const STORAGE_KEY = "medusa-theme"

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const root = document.documentElement
    const saved = localStorage.getItem(STORAGE_KEY)
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
    const nextTheme =
      saved === "dark" || (!saved && prefersDark) ? "dark" : "light"

    root.classList.toggle("dark", nextTheme === "dark")
    setTheme(nextTheme)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark"
    const root = document.documentElement

    root.classList.toggle("dark", nextTheme === "dark")
    localStorage.setItem(STORAGE_KEY, nextTheme)
    setTheme(nextTheme)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--surface-border)] bg-[var(--surface-elevated)] text-[var(--text-muted)] transition-all hover:text-[var(--text-base)] hover:border-sky-300/70"
      aria-label="Toggle theme"
      data-testid="theme-toggle"
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}
