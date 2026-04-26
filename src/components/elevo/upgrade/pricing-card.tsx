/* ═══════════════════════════════════════
   PricingCard — Reusable pricing card component
   Professional design with features list
   ═══════════════════════════════════════ */

import Link from "next/link"
import { Check, type LucideIcon } from "@/lib/icons"

export interface PricingCardProps {
  title: string
  price: number
  currency?: string
  icon: LucideIcon
  iconColor: string
  features: string[]
  buttonText?: string
  buttonUrl: string
  popular?: boolean
  description?: string
}

export function PricingCard({
  title,
  price,
  currency = "so'm",
  icon: Icon,
  iconColor,
  features,
  buttonText = "Sotib olish",
  buttonUrl,
  popular = false,
  description,
}: PricingCardProps) {
  return (
    <div className={`relative elevo-card elevo-card-border p-6 flex flex-col ${
      popular ? "ring-2 ring-primary" : ""
    }`}>
      {/* Popular badge */}
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest rounded-full">
          Mashhur
        </div>
      )}

      {/* Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{
          backgroundColor: `${iconColor}15`,
          borderWidth: 1,
          borderColor: `${iconColor}25`,
        }}
      >
        <Icon
          className="w-7 h-7"
          style={{ color: iconColor }}
          strokeWidth={2}
          aria-hidden
        />
      </div>

      {/* Title & Description */}
      <h3 className="text-xl font-extrabold text-on-surface mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-on-surface-variant mb-4">
          {description}
        </p>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-4xl font-black text-primary">
          {price.toLocaleString('uz-UZ')}
        </span>
        <span className="text-lg font-semibold text-on-surface-variant">
          {currency}
        </span>
      </div>

      {/* Features */}
      <div className="flex-1 flex flex-col gap-3 mb-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="shrink-0 w-5 h-5 bg-green-500/15 rounded-full flex items-center justify-center mt-0.5">
              <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={3} />
            </div>
            <span className="text-sm text-on-surface leading-relaxed">
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* Button */}
      <Link
        href={buttonUrl}
        className={`w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all ${
          popular
            ? "bg-primary text-on-primary hover:bg-primary/90 active:scale-[0.98]"
            : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest active:scale-[0.98]"
        }`}
      >
        {buttonText}
      </Link>
    </div>
  )
}
