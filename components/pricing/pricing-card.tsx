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
      className={`relative flex flex-col rounded-[8px] p-8 border ${
        recommended
          ? 'border-[#71d083] bg-[#0a1a0e] shadow-[0_0_60px_rgba(113,208,131,0.08),inset_0_1px_0_rgba(113,208,131,0.15)]'
          : 'border-[#2b292d] bg-[#0c0c10] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
      }`}
    >
      {/* Recommended badge */}
      {recommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 bg-[#71d083] text-[#04040b] font-mono text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1 rounded-full">
            <Zap className="h-3 w-3" />
            Recommended
          </span>
        </div>
      )}

      {/* Plan name */}
      <div className="mb-6">
        <p className="font-mono text-[10px] text-[#71d083] uppercase tracking-[0.2em] mb-1">
          // {plan}
        </p>
        <h3 className="font-display text-[24px] font-bold text-[#e5e5e5] capitalize">
          {plan === 'free' ? 'Starter' : 'Pro'}
        </h3>
      </div>

      {/* Price */}
      <div className="mb-8">
        {plan === 'free' ? (
          <div className="flex items-baseline gap-1">
            <span className="font-display text-[48px] font-bold text-[#e5e5e5] leading-none">
              ₹0
            </span>
            <span className="font-mono text-[13px] text-[#49474e]">/month</span>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-[48px] font-bold text-[#e5e5e5] leading-none">
                ₹{pricePerMonth}
              </span>
              <span className="font-mono text-[13px] text-[#49474e]">/month</span>
            </div>
            {billingCycle === 'yearly' && (
              <p className="font-mono text-[11px] text-[#71d083] mt-1">
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
          className="w-full mb-8 flex items-center justify-center gap-2 bg-[#0e0e12] border border-[#2b292d] hover:border-[#4b494e] text-[#e5e5e5] font-mono text-[13px] font-bold uppercase tracking-[0.06em] py-3 rounded-[6px] transition-colors"
        >
          {cta}
        </Link>
      ) : (
        <motion.button
          onClick={onUpgrade}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="w-full mb-8 flex items-center justify-center gap-2 bg-[#71d083] text-[#04040b] font-mono text-[13px] font-bold uppercase tracking-[0.06em] py-3 rounded-[6px] border border-[#366740] hover:bg-[#82dba2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
        >
          {loading ? (
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-[#04040b]"
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
      <div className="border-t border-[#2b292d]/60 mb-6" />

      {/* Features */}
      <ul className="space-y-3 flex-1">
        {features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-2.5">
            <div className={`mt-0.5 flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center ${
              feature.available
                ? 'bg-[#71d083]/15 text-[#71d083]'
                : 'bg-[#2b292d]/50 text-[#49474e]'
            }`}>
              <Check className="h-2.5 w-2.5" />
            </div>
            <span className={`font-mono text-[12px] ${
              feature.available ? 'text-[#b5b2bc]' : 'text-[#49474e] line-through'
            }`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
