'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Bell, Lock, KeyRound, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { MacTrafficLights } from '@/components/ui/terminal-card'
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
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 pb-28">
      <div>
        <p className="font-mono text-[11px] text-[#818cf8] uppercase tracking-[0.15em] mb-1 font-semibold">// CONFIGURATION</p>
        <h1 className="font-display text-[28px] sm:text-[32px] font-bold text-white leading-[1.1] tracking-[-0.02em]">Settings</h1>
        <p className="font-body text-[13px] sm:text-[14px] text-[#9ca3af] mt-1">
          Manage your account preferences and application settings.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Notifications Card */}
        <div className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
          <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
            <div className="flex items-center gap-3">
              <MacTrafficLights size="sm" />
              <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
                notifications.conf — bash
              </span>
            </div>
          </div>
          <div className="p-5 border-b border-[#1e1e2f]/50 bg-[#0c0d15]/40">
            <p className="font-mono text-[11px] text-white uppercase tracking-[0.08em] font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#818cf8]" />
              Notifications
            </p>
            <p className="font-body text-[13px] text-[#9ca3af] mt-1">
              Configure how you receive updates and reminders.
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <p className="font-mono text-[12px] text-white uppercase">Email Notifications</p>
                <p className="font-body text-[13px] text-[#9ca3af]">Receive weekly progress reports and weakness analytics.</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  emailNotifs
                    ? 'bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e]'
                    : 'bg-[#1e1e2f] border border-[#2e2e42] text-[#64748b]'
                }`}>
                  {emailNotifs ? 'ON' : 'OFF'}
                </span>
                <Switch checked={emailNotifs} onCheckedChange={handleToggle(setEmailNotifs, 'Email notifications')} aria-label="Toggle email notifications" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#1e1e2f]">
              <div className="space-y-0.5 pr-4">
                <p className="font-mono text-[12px] text-white uppercase">Interview Reminders</p>
                <p className="font-body text-[13px] text-[#9ca3af]">Get reminded of scheduled practice sessions.</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  reminders
                    ? 'bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e]'
                    : 'bg-[#1e1e2f] border border-[#2e2e42] text-[#64748b]'
                }`}>
                  {reminders ? 'ON' : 'OFF'}
                </span>
                <Switch checked={reminders} onCheckedChange={handleToggle(setReminders, 'Interview reminders')} aria-label="Toggle interview reminders" />
              </div>
            </div>
          </div>
        </div>

        {/* Security Card with Password Change Flow */}
        <div className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
          <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
            <div className="flex items-center gap-3">
              <MacTrafficLights size="sm" />
              <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
                security.conf — bash
              </span>
            </div>
          </div>
          <div className="p-5 border-b border-[#1e1e2f]/50 bg-[#0c0d15]/40">
            <p className="font-mono text-[11px] text-white uppercase tracking-[0.08em] font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#818cf8]" />
              Privacy & Security
            </p>
            <p className="font-body text-[13px] text-[#9ca3af] mt-1">
              Manage your account security and data privacy.
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <p className="font-mono text-[12px] text-white uppercase">Public Profile</p>
                <p className="font-body text-[13px] text-[#9ca3af]">Allow others to see your verified interview scores.</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  publicProfile
                    ? 'bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e]'
                    : 'bg-[#1e1e2f] border border-[#2e2e42] text-[#64748b]'
                }`}>
                  {publicProfile ? 'ON' : 'OFF'}
                </span>
                <Switch checked={publicProfile} onCheckedChange={handleToggle(setPublicProfile, 'Public profile')} aria-label="Toggle public profile" />
              </div>
            </div>

            {/* Change Password Section */}
            <div className="pt-4 border-t border-[#1e1e2f] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-0.5">
                  <p className="font-mono text-[12px] text-white uppercase flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-[#818cf8]" />
                    Account Password
                  </p>
                  <p className="font-body text-[13px] text-[#9ca3af]">
                    Update your sign-in password to keep your account secure.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm((prev) => !prev)
                    setErrorMsg(null)
                    setSuccessMsg(null)
                  }}
                  className="bg-[#0c0d15] text-white font-mono text-[12px] uppercase tracking-[0.05em] px-4 py-2 rounded-[6px] border border-[#1e2030] hover:bg-[#14142b] hover:border-[#3730a3] hover:text-[#818cf8] transition-colors cursor-pointer"
                  data-testid="change-password-btn"
                >
                  {showPasswordForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {/* Password Change Interface Form */}
              <AnimatePresence>
                {showPasswordForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    onSubmit={handlePasswordSubmit}
                    className="pt-3 overflow-hidden space-y-3.5 border-t border-[#1e2030]/60"
                  >
                    <div className="p-4 rounded-lg bg-[#050508] border border-[#1e2030] space-y-3.5">
                      <p className="font-mono text-[11px] text-[#818cf8] uppercase tracking-wider font-semibold">
                        Enter New Password
                      </p>

                      {errorMsg && (
                        <div className="p-3 rounded-md bg-[#f87171]/10 border border-[#f87171]/30 flex items-center gap-2 text-xs text-[#f87171] font-mono">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      {successMsg && (
                        <div className="p-3 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center gap-2 text-xs text-[#22c55e] font-mono">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>{successMsg}</span>
                        </div>
                      )}

                      <div className="grid gap-3 sm:grid-cols-2">
                        {/* New Password Input */}
                        <div className="space-y-1.5">
                          <label className="font-mono text-[11px] text-[#9ca3af] uppercase block">
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
                              className="w-full bg-[#0c0d15] border border-[#1e2030] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/40 rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder:text-[#64748b] focus:outline-none transition-all font-mono pr-10"
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

                        {/* Confirm Password Input */}
                        <div className="space-y-1.5">
                          <label className="font-mono text-[11px] text-[#9ca3af] uppercase block">
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
                              className="w-full bg-[#0c0d15] border border-[#1e2030] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/40 rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder:text-[#64748b] focus:outline-none transition-all font-mono pr-10"
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

                      <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm(false)
                            setErrorMsg(null)
                            setSuccessMsg(null)
                            setNewPassword('')
                            setConfirmPassword('')
                          }}
                          className="px-3.5 py-2 rounded-lg font-mono text-xs text-[#9ca3af] hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading || !newPassword || !confirmPassword}
                          data-testid="submit-password-btn"
                          className="btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-5 py-2.5 rounded-lg disabled:opacity-40 inline-flex items-center gap-2 cursor-pointer shadow-sm transition-all"
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
