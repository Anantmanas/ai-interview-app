'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Check, Zap, Shield } from 'lucide-react'

interface PricingCardProps {
  plan: 'free' | 'pro'
  monthlyPrice: number
  yearlyPrice: number
  billingCycle: 'monthly' | 'yearly'
  features: Array<{ text: string; available: boolean }>
  cta: string
  ctaHref: string
  recommended?: boolean
  onUpgrade?: () => void
  loading?: boolean
}

export function PricingCard({
  plan,
  monthlyPrice,
  yearlyPrice,
  billingCycle,
  features,
  cta,
  ctaHref,
  recommended = false,
  onUpgrade,
  loading = false,
}: PricingCardProps) {
  const price = billingCycle === 'monthly' ? monthlyPrice : yearlyPrice
  const pricePerMonth = billingCycle === 'yearly' ? Math.round(yearlyPrice / 12) : monthlyPrice

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col rounded-xl p-8 border ${
        recommended
          ? 'border-[#4f46e5] bg-[#0c0c18] shadow-[0_0_50px_rgba(79,70,229,0.18)]'
          : 'border-[#1e1e2f] bg-[#09090e] shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
      }`}
    >
      {/* Recommended badge */}
      {recommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 bg-[#4f46e5] text-white font-mono text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            <Zap className="h-3 w-3" />
            Recommended
          </span>
        </div>
      )}

      {/* Plan name */}
      <div className="mb-6">
        <p className="font-mono text-[10px] text-[#818cf8] uppercase tracking-[0.2em] mb-1">
          // {plan}
        </p>
        <h3 className="font-display text-[24px] font-bold text-[#ffffff] capitalize">
          {plan === 'free' ? 'Starter' : 'Pro'}
        </h3>
      </div>

      {/* Price */}
      <div className="mb-8">
        {plan === 'free' ? (
          <div className="flex items-baseline gap-1">
            <span className="font-display text-[48px] font-bold text-[#ffffff] leading-none">
              ₹0
            </span>
            <span className="font-mono text-[13px] text-[#64748b]">/month</span>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-[48px] font-bold text-[#ffffff] leading-none">
                ₹{pricePerMonth}
              </span>
              <span className="font-mono text-[13px] text-[#64748b]">/month</span>
            </div>
            {billingCycle === 'yearly' && (
              <p className="font-mono text-[11px] text-[#818cf8] mt-1">
                ₹{yearlyPrice} billed annually — 2 months free
              </p>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      {plan === 'free' ? (
        <Link
          href={ctaHref}
          className="w-full mb-8 flex items-center justify-center gap-2 bg-[#000000] border border-[#27272a] hover:bg-[#121216] hover:border-[#3f3f46] text-white font-medium text-[13px] tracking-[0.02em] py-3 rounded-md transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        >
          {cta}
        </Link>
      ) : (
        <motion.button
          onClick={onUpgrade}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="w-full mb-8 flex items-center justify-center gap-2 bg-[#4f46e5] text-white font-medium text-[13px] tracking-[0.02em] py-3 rounded-md border border-[#6366f1]/40 hover:bg-[#5865f2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_20px_rgba(79,70,229,0.35)]"
        >
          {loading ? (
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-white"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                />
              ))}
            </span>
          ) : (
            cta
          )}
        </motion.button>
      )}

      {/* Divider */}
      <div className="border-t border-[#1e1e2f] mb-6" />

      {/* Features */}
      <ul className="space-y-3 flex-1">
        {features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-2.5">
            <div className={`mt-0.5 flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center ${
              feature.available
                ? 'bg-[#14142b] text-[#818cf8] border border-[#3730a3]/50'
                : 'bg-[#1e1e2f]/50 text-[#64748b]'
            }`}>
              <Check className="h-2.5 w-2.5" />
            </div>
            <span className={`font-mono text-[12px] ${
              feature.available ? 'text-[#d1d5db]' : 'text-[#64748b] line-through'
            }`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
