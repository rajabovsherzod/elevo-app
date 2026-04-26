/* ═══════════════════════════════════════
   Payment Page — Professional payment flow
   Card details, clipboard copy, screenshot upload
   ═══════════════════════════════════════ */

"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, Suspense } from "react"
import { Copy, Check, Send, CreditCard as CreditCardIcon, Info, CheckCircle2 } from "@/lib/icons"
import { CreditCard } from "@/components/shared-assets/credit-card/credit-card"
import { getPlanById } from "@/lib/payment/plans"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planId = searchParams.get("plan") || "full"
  
  const plan = getPlanById(planId)
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-on-surface-variant">Plan topilmadi</p>
        <button
          onClick={() => router.push("/upgrade")}
          className="px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold"
        >
          Orqaga qaytish
        </button>
      </div>
    )
  }

  const Icon = plan.icon
  const cardNumber = "9860 1901 0470 6915"
  const cardNumberRaw = cardNumber.replace(/\s/g, "")

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardNumberRaw)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  const handleSendScreenshot = () => {
    setUploading(true)
    // Open Telegram chat with admin
    const telegramUrl = "https://t.me/Sherzod_Rajabov"
    const message = `Salom! ${plan.title} uchun to'lov qildim. Screenshot yubormoqchiman.`
    window.open(`${telegramUrl}?text=${encodeURIComponent(message)}`, "_blank")
    
    setTimeout(() => setUploading(false), 1000)
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Header with back button */}
      <PageHeaderWithBack
        title="To'lov"
        description="Xavfsiz to'lov jarayoni"
        onBack={() => router.back()}
      />

      {/* Plan details card */}
      <div className="elevo-card elevo-card-border p-5">
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${plan.iconColor}15`,
              borderWidth: 1,
              borderColor: `${plan.iconColor}25`,
            }}
          >
            <Icon
              className="w-6 h-6"
              style={{ color: plan.iconColor }}
              strokeWidth={2}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-on-surface mb-1">{plan.title}</h2>
            <p className="text-sm text-on-surface-variant">{plan.description}</p>
          </div>
        </div>

        <div className="flex items-baseline gap-2 pt-4 border-t border-outline-variant/20">
          <span className="text-sm text-on-surface-variant">To'lov summasi:</span>
          <span className="text-3xl font-black text-primary ml-auto">
            {plan.price.toLocaleString('uz-UZ')}
          </span>
          <span className="text-lg font-semibold text-on-surface-variant">so'm</span>
        </div>
      </div>

      {/* Payment instructions */}
      <div className="elevo-card elevo-card-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-primary" strokeWidth={2} />
          </div>
          <h3 className="text-sm font-bold text-on-surface">
            To'lov qilish bo'yicha ko'rsatma
          </h3>
        </div>
        <ol className="flex flex-col gap-2.5 text-sm text-on-surface-variant leading-relaxed">
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span>Quyidagi karta raqamiga pul o'tkazing</span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span>To'lov screenshotini oling</span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span>"Screenshot yuborish" tugmasini bosing</span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <span>Adminga screenshotni yuboring</span>
          </li>
        </ol>
      </div>

      {/* Credit Card */}
      <div className="elevo-card elevo-card-border p-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 self-start">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <CreditCardIcon className="w-4 h-4 text-primary" strokeWidth={2} />
          </div>
          <h3 className="text-sm font-bold text-on-surface">
            Karta ma'lumotlari
          </h3>
        </div>
        
        <div className="w-full flex justify-center py-2">
          <CreditCard
            type="gray-dark"
            width={280}
            company="Elevo Premium"
            cardNumber={cardNumber}
            cardHolder="SHERZOD RAJABOV"
            cardExpiration="12/28"
          />
        </div>

        {/* Card number with copy button */}
        <div className="w-full flex items-center gap-3 p-4 bg-surface-container-low rounded-xl">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-on-surface-variant mb-1">Karta raqami</p>
            <p className="text-lg font-mono font-bold text-on-surface tracking-wider">
              {cardNumber}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 w-12 h-12 bg-primary/10 hover:bg-primary/20 rounded-xl flex items-center justify-center transition-colors active:scale-95"
            aria-label="Nusxa olish"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-600" strokeWidth={2.5} />
            ) : (
              <Copy className="w-5 h-5 text-primary" strokeWidth={2} />
            )}
          </button>
        </div>

        <p className="text-xs text-on-surface-variant text-center leading-relaxed">
          Karta raqamini nusxalash uchun tugmani bosing
        </p>
      </div>

      {/* Send screenshot button */}
      <button
        onClick={handleSendScreenshot}
        disabled={uploading}
        className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-base flex items-center justify-center gap-2.5 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {uploading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Ochilmoqda...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" strokeWidth={2} />
            <span>Screenshot yuborish</span>
          </>
        )}
      </button>

      {/* Additional info */}
      <div className="elevo-card elevo-card-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Info className="w-4 h-4 text-blue-600" strokeWidth={2} />
          </div>
          <h3 className="text-sm font-bold text-on-surface">
            Muhim ma'lumot
          </h3>
        </div>
        <div className="flex flex-col gap-2 text-xs text-on-surface-variant leading-relaxed">
          <p>• To'lov tasdiqlangandan keyin 1-2 soat ichida obuna faollashadi</p>
          <p>• Screenshot aniq va o'qilishi oson bo'lishi kerak</p>
          <p>• Savollar bo'lsa, @Sherzod_Rajabov ga murojaat qiling</p>
          <p>• To'lov xavfsiz va ishonchli</p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
