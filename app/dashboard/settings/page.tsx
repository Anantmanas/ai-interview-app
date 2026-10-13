'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Bell, Lock, KeyRound, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'

const EMAIL_NOTIFS_KEY = 'interviewai_setting_email_debriefs'
const REMINDERS_KEY = 'interviewai_setting_reminders'

export default function SettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [reminders, setReminders] = useState(true)
  const [publicProfile, setPublicProfile] = useState(false)

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem(EMAIL_NOTIFS_KEY)
      if (storedEmail !== null) {
        setEmailNotifs(storedEmail === 'true')
      }
      const storedReminders = localStorage.getItem(REMINDERS_KEY)
      if (storedReminders !== null) {
        setReminders(storedReminders === 'true')
      }

      if (typeof window !== 'undefined') {
        const query = window.location.search
        const hash = window.location.hash
        if (query.includes('reset=true') || hash.includes('type=recovery') || query.includes('type=recovery')) {
          setShowPasswordForm(true)
        }
      }
    } catch {}
  }, [])

  const handleToggle = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    name: string,
    storageKey?: string
  ) => (checked: boolean) => {
    setter(checked)
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, String(checked))
      } catch {}
    }
    toast.success(`${name} ${checked ? 'enabled' : 'disabled'}`)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify and try again.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) {
        throw error
      }

      setSuccessMsg('Your password has been changed successfully.')
      toast.success('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setShowPasswordForm(false)
        setSuccessMsg(null)
      }, 2500)
    } catch (err: any) {
      const msg = err?.message || 'Failed to update password. Please re-authenticate and try again.'
      setErrorMsg(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-8 pb-32 font-sans">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px] text-[#8052ff] uppercase tracking-[0.18em] font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
          <span>SYSTEM CONFIGURATION // PREFERENCES</span>
        </div>
        <h1 className="font-display text-[28px] sm:text-[34px] font-normal text-white leading-[1.1] tracking-[-0.03em]">
          Settings
        </h1>
        <p className="font-sans text-[13px] sm:text-[14px] text-zinc-400 mt-1.5 font-light">
          Configure security, notifications, and candidate telemetry settings.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Notifications Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all overflow-hidden">
          <div className="flex items-center justify-between px-6 sm:px-7 h-12 border-b border-white/10 bg-white/[0.02] select-none">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
              <span className="font-mono text-[11px] text-zinc-400 font-semibold tracking-wider uppercase">
                COMMUNICATION CHANNELS
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#15846e] bg-[#15846e]/20 border border-[#15846e]/40 px-3 py-0.5 rounded-full uppercase tracking-wider font-semibold">
              TELEMETRY DISPATCH
            </span>
          </div>

          <div className="p-6 sm:p-7 border-b border-white/10 bg-white/[0.01]">
            <p className="font-mono text-[11px] text-white uppercase tracking-[0.12em] font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#8052ff]" />
              Telemetry Notifications
            </p>
            <p className="font-sans text-[13px] text-zinc-400 mt-1 font-light">
              Configure how you receive session debriefs and weekly weakness reports.
            </p>
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1 pr-4">
                <p className="font-mono text-[12px] text-white uppercase font-semibold">Email Debriefs</p>
                <p className="font-sans text-[13px] text-zinc-400 font-light">Receive weekly accuracy summaries and roadmap progress.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                  emailNotifs
                    ? 'bg-[#15846e]/20 border border-[#15846e]/40 text-[#15846e]'
                    : 'bg-white/5 border border-white/10 text-zinc-500'
                }`}>
                  {emailNotifs ? 'ON' : 'OFF'}
                </span>
                <Switch checked={emailNotifs} onCheckedChange={handleToggle(setEmailNotifs, 'Email debriefs', EMAIL_NOTIFS_KEY)} aria-label="Toggle email notifications" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-5 border-t border-white/10">
              <div className="space-y-1 pr-4">
                <p className="font-mono text-[12px] text-white uppercase font-semibold">Practice Cadence Reminders</p>
                <p className="font-sans text-[13px] text-zinc-400 font-light">Get notified when identified blindspots need spaced repetition practice.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                  reminders
                    ? 'bg-[#15846e]/20 border border-[#15846e]/40 text-[#15846e]'
                    : 'bg-white/5 border border-white/10 text-zinc-500'
                }`}>
                  {reminders ? 'ON' : 'OFF'}
                </span>
                <Switch checked={reminders} onCheckedChange={handleToggle(setReminders, 'Interview reminders', REMINDERS_KEY)} aria-label="Toggle interview reminders" />
              </div>
            </div>
          </div>
        </div>

        {/* Security Card with Password Change Flow */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all overflow-hidden">
          <div className="flex items-center justify-between px-6 sm:px-7 h-12 border-b border-white/10 bg-white/[0.02] select-none">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
              <span className="font-mono text-[11px] text-zinc-400 font-semibold tracking-wider uppercase">
                AUTHENTICATION & CREDENTIALS
              </span>
            </div>
            <span className="font-mono text-[10px] text-zinc-400 bg-white/5 border border-white/10 px-3 py-0.5 rounded-full uppercase tracking-wider font-medium">
              ACCESS KEYS
            </span>
          </div>

          <div className="p-6 sm:p-7 border-b border-white/10 bg-white/[0.01]">
            <p className="font-mono text-[11px] text-white uppercase tracking-[0.12em] font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#8052ff]" />
              Privacy & Security
            </p>
            <p className="font-sans text-[13px] text-zinc-400 mt-1 font-light">
              Manage your credentials, password, and public telemetry visibility.
            </p>
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1 pr-4">
                <p className="font-mono text-[12px] text-white uppercase font-semibold">Public Verification</p>
                <p className="font-sans text-[13px] text-zinc-400 font-light">Allow tech recruiters to verify your mock interview telemetry scores.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                  publicProfile
                    ? 'bg-[#15846e]/20 border border-[#15846e]/40 text-[#15846e]'
                    : 'bg-white/5 border border-white/10 text-zinc-500'
                }`}>
                  {publicProfile ? 'ON' : 'OFF'}
                </span>
                <Switch checked={publicProfile} onCheckedChange={handleToggle(setPublicProfile, 'Public profile')} aria-label="Toggle public profile" />
              </div>
            </div>

            {/* Change Password Section */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="space-y-1">
                  <p className="font-mono text-[12px] text-white uppercase font-semibold flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-[#8052ff]" />
                    Access Password
                  </p>
                  <p className="font-sans text-[13px] text-zinc-400 font-light">
                    Update your account sign-in password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm((prev) => !prev)
                    setErrorMsg(null)
                    setSuccessMsg(null)
                  }}
                  className="bg-white/5 text-zinc-300 font-mono text-[11px] uppercase tracking-wider px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all cursor-pointer"
                  data-testid="change-password-btn"
                >
                  {showPasswordForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {/* Password Change Form */}
              <AnimatePresence>
                {showPasswordForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    onSubmit={handlePasswordSubmit}
                    className="pt-4 overflow-hidden space-y-4"
                  >
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
                      <p className="font-mono text-[11px] text-[#8052ff] uppercase tracking-wider font-semibold">
                        // ENTER NEW CREDENTIALS
                      </p>

                      {errorMsg && (
                        <div className="p-3.5 rounded-xl bg-[#f43f5e]/10 border border-[#f43f5e]/25 flex items-center gap-2 text-xs text-[#f43f5e] font-mono">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      {successMsg && (
                        <div className="p-3.5 rounded-xl bg-[#15846e]/15 border border-[#15846e]/30 flex items-center gap-2 text-xs text-[#15846e] font-mono">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>{successMsg}</span>
                        </div>
                      )}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="font-mono text-[11px] text-zinc-400 uppercase block font-medium">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Min. 6 characters"
                              required
                              minLength={6}
                              data-testid="new-password-input"
                              className="w-full bg-white/[0.04] border border-white/10 focus:border-[#8052ff] rounded-xl px-4 py-3 text-[13px] text-white placeholder:text-zinc-500 focus:outline-none transition-all font-mono pr-10 focus:ring-1 focus:ring-[#8052ff]/40"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword((p) => !p)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-mono text-[11px] text-zinc-400 uppercase block font-medium">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-enter new password"
                              required
                              minLength={6}
                              data-testid="confirm-password-input"
                              className="w-full bg-white/[0.04] border border-white/10 focus:border-[#8052ff] rounded-xl px-4 py-3 text-[13px] text-white placeholder:text-zinc-500 focus:outline-none transition-all font-mono pr-10 focus:ring-1 focus:ring-[#8052ff]/40"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((p) => !p)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm(false)
                            setErrorMsg(null)
                            setSuccessMsg(null)
                            setNewPassword('')
                            setConfirmPassword('')
                          }}
                          className="px-4 py-2 rounded-full font-mono text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading || !newPassword || !confirmPassword}
                          data-testid="submit-password-btn"
                          className="btn-dala-primary font-mono text-[11px] font-bold uppercase tracking-wider px-6 py-2.5 rounded-full disabled:opacity-40 inline-flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(128,82,255,0.35)] transition-all hover:scale-[1.02]"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Updating...</span>
                            </>
                          ) : (
                            <span>Update Password</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
