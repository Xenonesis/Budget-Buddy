'use client';

import { useTheme } from 'next-themes';
import { useThemeContext } from './theme-provider';
import {
  Moon,
  Sun,
  Palette,
  Contrast,
  Clock,
  ChevronDown,
  Settings,
  Zap,
  Calendar,
  BarChart3,
  Monitor,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const {
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
    themeAnalytics,
  } = useThemeContext();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'themes' | 'presets' | 'schedule' | 'analytics'>(
    'themes'
  );
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleThemeType, setScheduleThemeType] = useState<'light' | 'dark'>('light');

  const colorSchemes = [
    {
      value: 'default',
      label: 'Default',
      color: 'bg-primary',
      description: 'Classic purple theme',
    },
    { value: 'blue', label: 'Blue', color: 'bg-blue-500', description: 'Professional blue' },
    { value: 'green', label: 'Green', color: 'bg-green-500', description: 'Calming green' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500', description: 'Creative purple' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500', description: 'Energetic orange' },
    { value: 'rose', label: 'Rose', color: 'bg-rose-500', description: 'Warm rose' },
  ] as const;

  const themePresets = [
    { id: 'work', label: 'Work', icon: '💼', description: 'Blue theme, normal contrast' },
    { id: 'relax', label: 'Relax', icon: '🌿', description: 'Green theme, normal contrast' },
    { id: 'focus', label: 'Focus', icon: '🎯', description: 'Purple theme, high contrast' },
    { id: 'creative', label: 'Creative', icon: '🎨', description: 'Orange theme, normal contrast' },
  ] as const;

  // Keyboard shortcuts effect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      // Escape to close
      if (event.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      // Tab navigation
      if (event.key === 'Tab') {
        event.preventDefault();
        const tabs = ['themes', 'presets', 'schedule', 'analytics'];
        const currentIndex = tabs.indexOf(activeTab);
        const nextIndex = event.shiftKey
          ? (currentIndex - 1 + tabs.length) % tabs.length
          : (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex] as typeof activeTab);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, activeTab]);

  const handleScheduleSubmit = () => {
    if (scheduleTime) {
      scheduleTheme(scheduleTime, scheduleThemeType);
      setScheduleTime('');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
        aria-label="Theme settings"
        title="Theme Settings (Ctrl+Shift+T)"
      >
        {theme === 'light' ? (
          <Sun className="h-5 w-5 group-hover:rotate-12 transition-transform" />
        ) : (
          <Moon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-lg shadow-xl p-0 z-50 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Theme Settings</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span>{themeAnalytics.totalSwitches} switches</span>
              </div>
              <div className="flex items-center gap-1">
                <Palette className="h-4 w-4" />
                <span>{colorScheme}</span>
              </div>
              {autoTheme && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Auto</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {[
              { id: 'themes', label: 'Themes', icon: Palette },
              { id: 'presets', label: 'Presets', icon: Zap },
              { id: 'schedule', label: 'Schedule', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`flex-1 p-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {activeTab === 'themes' && (
              <div className="space-y-4">
                {/* Theme Mode */}
                <div>
                  <label className="block text-sm font-medium mb-3">Theme Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'system', label: 'System', icon: Monitor },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setThemeMode(value as typeof themeMode);
                          if (value !== 'system') {
                            setTheme(value as 'light' | 'dark');
                          }
                        }}
                        className={`flex flex-col items-center gap-2 p-3 rounded-md text-xs transition-all theme-preview ${
                          (themeMode === value && value !== 'system') ||
                          (value === 'system' && themeMode === 'system')
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'hover:bg-muted'
                        }`}
                        title={`${label} mode`}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Theme Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <div>
                      <span className="text-sm font-medium">Auto Theme</span>
                      <p className="text-xs text-muted-foreground">Follow sunrise/sunset</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAutoTheme(!autoTheme)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoTheme ? 'bg-primary' : 'bg-muted'
                    }`}
                    title={autoTheme ? 'Disable auto theme' : 'Enable auto theme'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoTheme ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Color Scheme */}
                <div>
                  <label className="block text-sm font-medium mb-3">Color Scheme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {colorSchemes.map((scheme) => (
                      <button
                        key={scheme.value}
                        onClick={() => setColorScheme(scheme.value)}
                        onMouseEnter={() => setShowPreview(scheme.value)}
                        onMouseLeave={() => setShowPreview(null)}
                        className={`flex items-center gap-3 p-3 rounded-md text-sm transition-all theme-preview ${
                          colorScheme === scheme.value
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'hover:bg-muted'
                        }`}
                        title={scheme.description}
                      >
                        <div className={`w-4 h-4 rounded-full ${scheme.color} flex-shrink-0`} />
                        <span>{scheme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contrast Mode */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2">
                    <Contrast className="h-4 w-4" />
                    <div>
                      <span className="text-sm font-medium">High Contrast</span>
                      <p className="text-xs text-muted-foreground">Better accessibility</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setContrastMode(contrastMode === 'normal' ? 'high' : 'normal')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      contrastMode === 'high' ? 'bg-primary' : 'bg-muted'
                    }`}
                    title={
                      contrastMode === 'high' ? 'Disable high contrast' : 'Enable high contrast'
                    }
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        contrastMode === 'high' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'presets' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Quick theme presets for different activities
                </p>
                {themePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id as any)}
                    className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-all theme-preview ${
                      currentPreset === preset.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'hover:bg-muted'
                    }`}
                    title={preset.description}
                  >
                    <span className="text-lg">{preset.icon}</span>
                    <div>
                      <span className="text-sm font-medium">{preset.label}</span>
                      <p className="text-xs text-muted-foreground">{preset.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Schedule automatic theme changes</p>

                {/* Add Schedule */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md"
                      placeholder="Select time"
                    />
                    <select
                      value={scheduleThemeType}
                      onChange={(e) => setScheduleThemeType(e.target.value as 'light' | 'dark')}
                      className="px-3 py-2 text-sm bg-background border border-border rounded-md"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                    <button
                      onClick={handleScheduleSubmit}
                      className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Scheduled Themes */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Scheduled Themes</h4>
                  {scheduledThemes.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No scheduled themes</p>
                  ) : (
                    scheduledThemes.map((scheduled) => (
                      <div
                        key={scheduled.time}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                      >
                        <span className="text-sm">
                          {scheduled.time} - {scheduled.theme}
                        </span>
                        <button
                          onClick={() => {
                            /* Remove functionality would need to be implemented */
                          }}
                          className="text-xs text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Your theme usage patterns</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-md">
                    <div className="text-2xl font-bold text-primary">
                      {themeAnalytics.totalSwitches}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Switches</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md">
                    <div className="text-2xl font-bold text-primary">
                      {themeAnalytics.autoThemeUsage}
                    </div>
                    <div className="text-xs text-muted-foreground">Auto Theme Uses</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Most Used Scheme</div>
                  <div className="text-lg capitalize">{themeAnalytics.mostUsedScheme}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Preferred Time</div>
                  <div className="text-lg">
                    {themeAnalytics.preferredTime || 'Not analyzed yet'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Keyboard shortcuts available</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-background border rounded text-xs">Ctrl</kbd>
                <kbd className="px-1 py-0.5 bg-background border rounded text-xs">Shift</kbd>
                <kbd className="px-1 py-0.5 bg-background border rounded text-xs">T</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />}
    </div>
  );
}
