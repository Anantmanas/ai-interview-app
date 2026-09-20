'use client'

import { Switch } from '@/components/ui/switch'
import { Bell, Lock } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <p className="font-mono text-[11px] text-[#c084fc] uppercase tracking-[0.15em] mb-1 font-semibold">// CONFIGURATION</p>
        <h1 className="font-display text-[32px] font-bold text-[#fdfcff] leading-[1.1] tracking-[-0.02em]">Settings</h1>
        <p className="font-body text-[14px] text-[#c8c0e0] mt-1">
          Manage your account preferences and application settings.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="card-console">
          <div className="p-5 border-b border-[#291a45]">
            <p className="font-mono text-[11px] text-[#fdfcff] uppercase tracking-[0.08em] font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#a855f7]" />
              Notifications
            </p>
            <p className="font-body text-[13px] text-[#948bb0] mt-1">
              Configure how you receive updates and reminders.
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-mono text-[12px] text-[#fdfcff] uppercase">Email Notifications</p>
                <p className="font-body text-[13px] text-[#948bb0]">Receive weekly progress reports and weakness analytics.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#140e24]">
              <div className="space-y-0.5">
                <p className="font-mono text-[12px] text-[#fdfcff] uppercase">Interview Reminders</p>
                <p className="font-body text-[13px] text-[#948bb0]">Get reminded of scheduled practice sessions.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <div className="card-console">
          <div className="p-5 border-b border-[#291a45]">
            <p className="font-mono text-[11px] text-[#fdfcff] uppercase tracking-[0.08em] font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#6366f1]" />
              Privacy & Security
            </p>
            <p className="font-body text-[13px] text-[#948bb0] mt-1">
              Manage your account security and data privacy.
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-mono text-[12px] text-[#fdfcff] uppercase">Public Profile</p>
                <p className="font-body text-[13px] text-[#948bb0]">Allow others to see your verified interview scores.</p>
              </div>
              <Switch />
            </div>
            <div className="pt-3 border-t border-[#140e24]">
              <button className="bg-[#140e24] text-[#f5f3ff] font-mono text-[12px] uppercase tracking-[0.05em] px-5 py-2.5 rounded-[6px] border border-[#291a45] hover:bg-[#1b1330] hover:border-[#4c1d95] hover:text-[#c084fc] transition-colors cursor-pointer">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
