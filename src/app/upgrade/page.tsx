/* ═══════════════════════════════════════
   Upgrade Page — Premium plans
   Professional pricing cards
   ═══════════════════════════════════════ */

"use client"

import { PageHeader } from "@/components/elevo/shared/page-header"
import { PricingCard } from "@/components/elevo/upgrade/pricing-card"
import { Sparkles, BookOpen, Headphones, Mic, PenLine } from "@/lib/icons"

export default function UpgradePage() {
  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Page Header */}
      <PageHeader
        title="Premium"
        subtitle="O'z darajangizni oshiring"
        icon={Sparkles}
      />

      {/* Hero section */}
      <div className="elevo-card elevo-card-border p-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-black text-on-surface mb-2">
          Premium imkoniyatlar
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-md mx-auto">
          IELTS imtihoniga professional tayyorgarlik ko'ring va maqsadingizga tezroq yeting
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="flex flex-col gap-4">
        {/* Full Bundle - Popular */}
        <PricingCard
          title="Full Bundle"
          description="Barcha ko'nikmalar uchun to'liq kirish"
          price={75000}
          icon={Sparkles}
          iconColor="#6366f1"
          popular={true}
          features={[
            "Reading — barcha qismlar va mashqlar",
            "Listening — audio mashqlar va testlar",
            "Speaking — AI tutor bilan amaliyot",
            "Writing — essay va task yozish",
            "Cheksiz mashq qilish imkoniyati",
            "Batafsil tahlil va feedback",
            "Offline rejimda ishlash",
            "Sertifikat olish imkoniyati",
          ]}
          buttonText="Sotib olish — 75,000 so'm"
          buttonUrl="/payment?plan=full"
        />

        {/* Reading Only */}
        <PricingCard
          title="Reading"
          description="Faqat Reading ko'nikmasini rivojlantiring"
          price={25000}
          icon={BookOpen}
          iconColor="#10b981"
          features={[
            "Barcha Reading qismlari (Part 1.1, 1.2, 2)",
            "100+ mashq va test",
            "Batafsil tahlil va javoblar",
            "Progress tracking",
            "30 kunlik kirish",
          ]}
          buttonText="Sotib olish — 25,000 so'm"
          buttonUrl="/payment?plan=reading"
        />

        {/* Listening Only */}
        <PricingCard
          title="Listening"
          description="Eshitib tushunish ko'nikmasini oshiring"
          price={25000}
          icon={Headphones}
          iconColor="#3b82f6"
          features={[
            "Barcha Listening qismlari",
            "Audio mashqlar va testlar",
            "Turli aksent va tezliklar",
            "Batafsil tahlil",
            "30 kunlik kirish",
          ]}
          buttonText="Sotib olish — 25,000 so'm"
          buttonUrl="/payment?plan=listening"
        />

        {/* Speaking Only */}
        <PricingCard
          title="Speaking"
          description="AI tutor bilan nutq ko'nikmasini rivojlantiring"
          price={30000}
          icon={Mic}
          iconColor="#ec4899"
          features={[
            "Barcha Speaking qismlari (Part 1-3)",
            "AI tutor bilan real-time amaliyot",
            "Talaffuz va grammatika tahlili",
            "Video va audio feedback",
            "30 kunlik kirish",
          ]}
          buttonText="Sotib olish — 30,000 so'm"
          buttonUrl="/payment?plan=speaking"
        />

        {/* Writing Only */}
        <PricingCard
          title="Writing"
          description="Yozish ko'nikmasini professional darajaga olib chiqing"
          price={30000}
          icon={PenLine}
          iconColor="#f59e0b"
          features={[
            "Task 1 va Task 2 mashqlari",
            "AI tomonidan batafsil tahlil",
            "Grammatika va lug'at tavsiyalari",
            "Sample essays va templates",
            "30 kunlik kirish",
          ]}
          buttonText="Sotib olish — 30,000 so'm"
          buttonUrl="/payment?plan=writing"
        />
      </div>

      {/* FAQ or additional info */}
      <div className="elevo-card elevo-card-border p-5">
        <h3 className="text-sm font-bold text-on-surface mb-3">
          💡 Foydali ma'lumot
        </h3>
        <div className="flex flex-col gap-2 text-xs text-on-surface-variant leading-relaxed">
          <p>• Full Bundle 25% arzonroq — eng foydali tanlov</p>
          <p>• Barcha to'lovlar xavfsiz Telegram Stars orqali amalga oshiriladi</p>
          <p>• Obuna muddati tugagandan keyin ham o'z natijalaringizni ko'rishingiz mumkin</p>
          <p>• Savollar bo'lsa, yordam markaziga murojaat qiling</p>
        </div>
      </div>
    </div>
  )
}
