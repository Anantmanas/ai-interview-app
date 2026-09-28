'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Bell, Lock, KeyRound, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'

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

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, name: string) => (checked: boolean) => {
    setter(checked)
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
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-8 pb-32">
      <div>
        <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px] text-[#60a5fa] uppercase tracking-widest font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] led-pulse" />
          <span>SYSTEM CONFIGURATION // PREFERENCES</span>
        </div>
        <h1 className="font-display text-[30px] sm:text-[36px] font-bold text-[#f8fafc] leading-[1.08] tracking-[-0.03em]">
          Settings
        </h1>
        <p className="font-body text-[14px] sm:text-[15px] text-[#cbd5e1] mt-1">
          Configure security, notifications, and candidate telemetry settings.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Notifications Card */}
        <div className="rounded-2xl border border-[#142347] bg-[#060b18] shadow-[0_10px_35px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-6 h-12 border-b border-[#142347] bg-[#0a1226]/80 select-none">
            <span className="font-mono text-[11px] text-[#cbd5e1] font-semibold tracking-wider uppercase">
              COMMUNICATION CHANNELS
            </span>
          </div>

          <div className="p-6 border-b border-[#142347]/50 bg-[#0a1226]/30">
            <p className="font-mono text-[11px] text-[#f8fafc] uppercase tracking-[0.08em] font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#3b82f6]" />
              Telemetry Notifications
            </p>
            <p className="font-body text-[13px] text-[#94a3b8] mt-1">
              Configure how you receive session debriefs and weekly weakness reports.
            </p>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <p className="font-mono text-[12px] text-[#f8fafc] uppercase font-semibold">Email Debriefs</p>
                <p className="font-body text-[13px] text-[#cbd5e1]">Receive weekly accuracy summaries and roadmap progress.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                  emailNotifs
                    ? 'bg-[#064e3b]/30 border border-[#065f46] text-[#34d399]'
                    : 'bg-[#0a1226] border border-[#142347] text-[#64748b]'
                }`}>
                  {emailNotifs ? 'ON' : 'OFF'}
                </span>
                <Switch checked={emailNotifs} onCheckedChange={handleToggle(setEmailNotifs, 'Email notifications')} aria-label="Toggle email notifications" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#142347]">
              <div className="space-y-0.5 pr-4">
                <p className="font-mono text-[12px] text-[#f8fafc] uppercase font-semibold">Practice Cadence Reminders</p>
                <p className="font-body text-[13px] text-[#cbd5e1]">Get notified when identified blindspots need spaced repetition practice.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                  reminders
                    ? 'bg-[#064e3b]/30 border border-[#065f46] text-[#34d399]'
                    : 'bg-[#0a1226] border border-[#142347] text-[#64748b]'
                }`}>
                  {reminders ? 'ON' : 'OFF'}
                </span>
                <Switch checked={reminders} onCheckedChange={handleToggle(setReminders, 'Interview reminders')} aria-label="Toggle interview reminders" />
              </div>
            </div>
          </div>
        </div>

        {/* Security Card with Password Change Flow */}
        <div className="rounded-2xl border border-[#142347] bg-[#060b18] shadow-[0_10px_35px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-6 h-12 border-b border-[#142347] bg-[#0a1226]/80 select-none">
            <span className="font-mono text-[11px] text-[#cbd5e1] font-semibold tracking-wider uppercase">
              AUTHENTICATION & CREDENTIALS
            </span>
          </div>

          <div className="p-6 border-b border-[#142347]/50 bg-[#0a1226]/30">
            <p className="font-mono text-[11px] text-[#f8fafc] uppercase tracking-[0.08em] font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#3b82f6]" />
              Privacy & Security
            </p>
            <p className="font-body text-[13px] text-[#94a3b8] mt-1">
              Manage your credentials, password, and public telemetry visibility.
            </p>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <p className="font-mono text-[12px] text-[#f8fafc] uppercase font-semibold">Public Verification</p>
                <p className="font-body text-[13px] text-[#cbd5e1]">Allow tech recruiters to verify your mock interview telemetry scores.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                  publicProfile
                    ? 'bg-[#064e3b]/30 border border-[#065f46] text-[#34d399]'
                    : 'bg-[#0a1226] border border-[#142347] text-[#64748b]'
                }`}>
                  {publicProfile ? 'ON' : 'OFF'}
                </span>
                <Switch checked={publicProfile} onCheckedChange={handleToggle(setPublicProfile, 'Public profile')} aria-label="Toggle public profile" />
              </div>
            </div>

            {/* Change Password Section */}
            <div className="pt-5 border-t border-[#142347] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="space-y-0.5">
                  <p className="font-mono text-[12px] text-[#f8fafc] uppercase font-semibold flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-[#3b82f6]" />
                    Access Password
                  </p>
                  <p className="font-body text-[13px] text-[#94a3b8]">
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
                  className="bg-[#0a1226] text-[#cbd5e1] font-mono text-[12px] uppercase tracking-wider px-4 py-2 rounded-xl border border-[#142347] hover:bg-[#0f1a36] hover:border-[#2563eb] hover:text-[#60a5fa] transition-colors cursor-pointer"
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
                    className="pt-3 overflow-hidden space-y-4 border-t border-[#142347]/60"
                  >
                    <div className="p-5 rounded-2xl bg-[#02040a] border border-[#142347] space-y-4">
                      <p className="font-mono text-[11px] text-[#60a5fa] uppercase tracking-wider font-semibold">
                        Enter New Password
                      </p>

                      {errorMsg && (
                        <div className="p-3 rounded-xl bg-[#2a0e15] border border-[#5c1d28] flex items-center gap-2 text-xs text-[#f43f5e] font-mono">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      {successMsg && (
                        <div className="p-3 rounded-xl bg-[#052016] border border-[#065f46] flex items-center gap-2 text-xs text-[#34d399] font-mono">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>{successMsg}</span>
                        </div>
                      )}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="font-mono text-[11px] text-[#94a3b8] uppercase block">
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
                              className="w-full bg-[#060b18] border border-[#142347] focus:border-[#2563eb] rounded-xl px-4 py-3 text-[13px] text-white placeholder:text-[#64748b] focus:outline-none transition-all font-mono pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword((p) => !p)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white"
                              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-mono text-[11px] text-[#94a3b8] uppercase block">
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
                              className="w-full bg-[#060b18] border border-[#142347] focus:border-[#2563eb] rounded-xl px-4 py-3 text-[13px] text-white placeholder:text-[#64748b] focus:outline-none transition-all font-mono pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((p) => !p)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white"
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
                          className="px-4 py-2 rounded-xl font-mono text-xs text-[#94a3b8] hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading || !newPassword || !confirmPassword}
                          data-testid="submit-password-btn"
                          className="btn-cobalt font-mono text-[12px] font-semibold uppercase tracking-wider px-6 py-2.5 rounded-xl disabled:opacity-40 inline-flex items-center gap-2 cursor-pointer shadow-sm transition-all"
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
