"use client"

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme } from "next-themes"
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"

export type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'rose'
export type ContrastMode = 'normal' | 'high'
export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemePreset = 'work' | 'relax' | 'focus' | 'creative'

interface ThemeContextType {
  colorScheme: ColorScheme
  setColorScheme: (scheme: ColorScheme) => void
  contrastMode: ContrastMode
  setContrastMode: (mode: ContrastMode) => void
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  autoTheme: boolean
  setAutoTheme: (enabled: boolean) => void
  currentPreset: ThemePreset | null
  applyPreset: (preset: ThemePreset) => void
  scheduleTheme: (time: string, theme: 'light' | 'dark') => void
  scheduledThemes: Array<{ time: string; theme: 'light' | 'dark' }>
  themeAnalytics: {
    totalSwitches: number
    preferredTime: string
    mostUsedScheme: ColorScheme
    autoThemeUsage: number
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider')
  }
  return context
}

// Calculate sunrise/sunset times based on location
function getSunTimes(latitude: number = 40.7128, longitude: number = -74.0060) {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000)

  // Simplified sunrise/sunset calculation
  const solarNoon = 12
  const dayLength = 4 * Math.acos(-Math.tan(latitude * Math.PI / 180) * Math.tan(23.45 * Math.PI / 180 * Math.sin(2 * Math.PI * (dayOfYear - 81) / 365))) / Math.PI

  const sunrise = solarNoon - dayLength / 2
  const sunset = solarNoon + dayLength / 2

  return {
    sunrise: Math.max(6, Math.min(18, sunrise)), // Clamp between 6AM and 6PM
    sunset: Math.max(18, Math.min(22, sunset))   // Clamp between 6PM and 10PM
  }
}

// Get user's preferred color scheme from system
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function ThemeProviderInner({ children, ...props }: Readonly<ThemeProviderProps>) {
  const { theme, setTheme } = useTheme()
  const [colorScheme, setColorScheme] = useState<ColorScheme>('default')
  const [contrastMode, setContrastMode] = useState<ContrastMode>('normal')
  const [themeMode, setThemeMode] = useState<ThemeMode>('system')
  const [autoTheme, setAutoTheme] = useState(false)
  const [currentPreset, setCurrentPreset] = useState<ThemePreset | null>(null)
  const [scheduledThemes, setScheduledThemes] = useState<Array<{ time: string; theme: 'light' | 'dark' }>>([])
  const [themeAnalytics, setThemeAnalytics] = useState({
    totalSwitches: 0,
    preferredTime: '',
    mostUsedScheme: 'default' as ColorScheme,
    autoThemeUsage: 0
  })

  // Theme presets configuration
  const themePresets = {
    work: { colorScheme: 'blue' as ColorScheme, contrastMode: 'normal' as ContrastMode },
    relax: { colorScheme: 'green' as ColorScheme, contrastMode: 'normal' as ContrastMode },
    focus: { colorScheme: 'purple' as ColorScheme, contrastMode: 'high' as ContrastMode },
    creative: { colorScheme: 'orange' as ColorScheme, contrastMode: 'normal' as ContrastMode }
  }

  // Apply theme preset
  const applyPreset = useCallback((preset: ThemePreset) => {
    const config = themePresets[preset]
    setColorScheme(config.colorScheme)
    setContrastMode(config.contrastMode)
    setCurrentPreset(preset)

    // Update analytics
    setThemeAnalytics(prev => ({
      ...prev,
      totalSwitches: prev.totalSwitches + 1
    }))
  }, [])

  // Schedule theme change
  const scheduleTheme = useCallback((time: string, theme: 'light' | 'dark') => {
    setScheduledThemes(prev => {
      const filtered = prev.filter(s => s.time !== time)
      return [...filtered, { time, theme }].sort((a, b) => a.time.localeCompare(b.time))
    })
  }, [])

  // Intelligent auto theme switching
  useEffect(() => {
    if (!autoTheme && themeMode !== 'system') return

    const updateTheme = () => {
      let targetTheme: 'light' | 'dark'

      if (themeMode === 'system') {
        targetTheme = getSystemTheme()
      } else {
        // Use sunrise/sunset calculation
        const now = new Date()
        const currentHour = now.getHours() + now.getMinutes() / 60
        const { sunrise, sunset } = getSunTimes()

        targetTheme = currentHour >= sunrise && currentHour < sunset ? 'light' : 'dark'
      }

      // Check scheduled themes
      const currentTime = new Date().toTimeString().slice(0, 5) // HH:MM format
      const scheduledTheme = scheduledThemes.find(s => s.time === currentTime)
      if (scheduledTheme) {
        targetTheme = scheduledTheme.theme
      }

      // Apply theme with smooth transition
      setTheme(targetTheme)

      // Update analytics
      setThemeAnalytics(prev => ({
        ...prev,
        autoThemeUsage: prev.autoThemeUsage + 1
      }))
    }

    updateTheme()
    const interval = setInterval(updateTheme, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [autoTheme, themeMode, scheduledThemes, setTheme])

  // System theme change listener
  useEffect(() => {
    if (themeMode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      setTheme(getSystemTheme())
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [themeMode, setTheme])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + T: Toggle theme
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault()
        setTheme(theme === 'light' ? 'dark' : 'light')
        setThemeAnalytics(prev => ({
          ...prev,
          totalSwitches: prev.totalSwitches + 1
        }))
      }

      // Ctrl/Cmd + Shift + C: Toggle contrast
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
        event.preventDefault()
        setContrastMode(prev => prev === 'normal' ? 'high' : 'normal')
      }

      // Ctrl/Cmd + Shift + 1-6: Color schemes
      if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
        const schemes: ColorScheme[] = ['default', 'blue', 'green', 'purple', 'orange', 'rose']
        const index = parseInt(event.key) - 1
        if (index >= 0 && index < schemes.length) {
          event.preventDefault()
          setColorScheme(schemes[index])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [theme, setTheme])

  // Apply color scheme and contrast mode with smooth transitions
  useEffect(() => {
    const root = document.documentElement

    // Add transition class for smooth changes
    root.style.setProperty('--theme-transition-duration', '300ms')
    root.classList.add('theme-transitioning')

    // Remove previous color scheme classes
    root.classList.remove('color-blue', 'color-green', 'color-purple', 'color-orange', 'color-rose')
    root.classList.remove('contrast-high')

    // Add current color scheme
    if (colorScheme !== 'default') {
      root.classList.add(`color-${colorScheme}`)
    }

    // Add contrast mode
    if (contrastMode === 'high') {
      root.classList.add('contrast-high')
    }

    // Remove transition class after animation
    setTimeout(() => {
      root.classList.remove('theme-transitioning')
    }, 300)

    // Store preferences
    localStorage.setItem('budget-buddy-color-scheme', colorScheme)
    localStorage.setItem('budget-buddy-contrast-mode', contrastMode)
    localStorage.setItem('budget-buddy-theme-mode', themeMode)
    localStorage.setItem('budget-buddy-auto-theme', autoTheme.toString())
    localStorage.setItem('budget-buddy-scheduled-themes', JSON.stringify(scheduledThemes))
    localStorage.setItem('budget-buddy-theme-analytics', JSON.stringify(themeAnalytics))
  }, [colorScheme, contrastMode, themeMode, autoTheme, scheduledThemes, themeAnalytics])

  // Load saved preferences
  useEffect(() => {
    const savedColorScheme = localStorage.getItem('budget-buddy-color-scheme') as ColorScheme
    const savedContrastMode = localStorage.getItem('budget-buddy-contrast-mode') as ContrastMode
    const savedThemeMode = localStorage.getItem('budget-buddy-theme-mode') as ThemeMode
    const savedAutoTheme = localStorage.getItem('budget-buddy-auto-theme') === 'true'
    const savedScheduledThemes = localStorage.getItem('budget-buddy-scheduled-themes')
    const savedAnalytics = localStorage.getItem('budget-buddy-theme-analytics')

    if (savedColorScheme) setColorScheme(savedColorScheme)
    if (savedContrastMode) setContrastMode(savedContrastMode)
    if (savedThemeMode) setThemeMode(savedThemeMode)
    setAutoTheme(savedAutoTheme)

    if (savedScheduledThemes) {
      try {
        setScheduledThemes(JSON.parse(savedScheduledThemes))
      } catch (error) {
        console.warn('Failed to parse saved scheduled themes:', error)
      }
    }

    if (savedAnalytics) {
      try {
        setThemeAnalytics(JSON.parse(savedAnalytics))
      } catch (error) {
        console.warn('Failed to parse saved analytics:', error)
      }
    }
  }, [])

  const value = useMemo(() => ({
    colorScheme,
    setColorScheme,
    contrastMode,
    setContrastMode,
    themeMode,
    setThemeMode,
    autoTheme,
    setAutoTheme,
    currentPreset,
    applyPreset,
    scheduleTheme,
    scheduledThemes,
    themeAnalytics
  }), [colorScheme, contrastMode, themeMode, autoTheme, currentPreset, applyPreset, scheduleTheme, scheduledThemes, themeAnalytics])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function ThemeProvider({ children, ...props }: Readonly<ThemeProviderProps>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeProviderInner {...props}>
        {children}
      </ThemeProviderInner>
    </NextThemesProvider>
  )
} 