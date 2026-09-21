'use client'

import { Switch } from '@/components/ui/switch'
import { Bell, Lock } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <p className="font-mono text-[11px] text-[#818cf8] uppercase tracking-[0.15em] mb-1 font-semibold">// CONFIGURATION</p>
        <h1 className="font-display text-[32px] font-bold text-white leading-[1.1] tracking-[-0.02em]">Settings</h1>
        <p className="font-body text-[14px] text-[#9ca3af] mt-1">
          Manage your account preferences and application settings.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="card-console">
          <div className="p-5 border-b border-[#1e1e2f]">
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
              <div className="space-y-0.5">
                <p className="font-mono text-[12px] text-white uppercase">Email Notifications</p>
                <p className="font-body text-[13px] text-[#9ca3af]">Receive weekly progress reports and weakness analytics.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#1e1e2f]">
              <div className="space-y-0.5">
                <p className="font-mono text-[12px] text-white uppercase">Interview Reminders</p>
                <p className="font-body text-[13px] text-[#9ca3af]">Get reminded of scheduled practice sessions.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <div className="card-console">
          <div className="p-5 border-b border-[#1e1e2f]">
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
              <div className="space-y-0.5">
                <p className="font-mono text-[12px] text-white uppercase">Public Profile</p>
                <p className="font-body text-[13px] text-[#9ca3af]">Allow others to see your verified interview scores.</p>
              </div>
              <Switch />
            </div>
            <div className="pt-3 border-t border-[#1e1e2f]">
              <button className="bg-[#000000] text-white font-mono text-[12px] uppercase tracking-[0.05em] px-5 py-2.5 rounded-[6px] border border-[#1e1e2f] hover:bg-[#09090e] hover:border-[#3730a3] hover:text-[#818cf8] transition-colors cursor-pointer">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
