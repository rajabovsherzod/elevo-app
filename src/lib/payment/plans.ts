/* ═══════════════════════════════════════
   Payment Plans Configuration
   ═══════════════════════════════════════ */

import { BookOpen, Headphones, Mic, PenLine, Sparkles, type LucideIcon } from "lucide-react"

export interface PaymentPlan {
  id: string
  title: string
  price: number
  icon: LucideIcon
  iconColor: string
  description: string
  features: string[]
}

export const PAYMENT_PLANS: Record<string, PaymentPlan> = {
  full: {
    id: "full",
    title: "Full Bundle",
    price: 75000,
    icon: Sparkles,
    iconColor: "#6366f1",
    description: "Barcha ko'nikmalar uchun to'liq kirish",
    features: [
      "Reading — barcha qismlar va mashqlar",
      "Listening — audio mashqlar va testlar",
      "Speaking — AI tutor bilan amaliyot",
      "Writing — essay va task yozish",
      "Cheksiz mashq qilish imkoniyati",
      "Batafsil tahlil va feedback",
      "Offline rejimda ishlash",
      "Sertifikat olish imkoniyati",
    ],
  },
  reading: {
    id: "reading",
    title: "Reading",
    price: 25000,
    icon: BookOpen,
    iconColor: "#10b981",
    description: "Faqat Reading ko'nikmasini rivojlantiring",
    features: [
      "Barcha Reading qismlari (Part 1.1, 1.2, 2)",
      "100+ mashq va test",
      "Batafsil tahlil va javoblar",
      "Progress tracking",
      "30 kunlik kirish",
    ],
  },
  listening: {
    id: "listening",
    title: "Listening",
    price: 25000,
    icon: Headphones,
    iconColor: "#3b82f6",
    description: "Eshitib tushunish ko'nikmasini oshiring",
    features: [
      "Barcha Listening qismlari",
      "Audio mashqlar va testlar",
      "Turli aksent va tezliklar",
      "Batafsil tahlil",
      "30 kunlik kirish",
    ],
  },
  speaking: {
    id: "speaking",
    title: "Speaking",
    price: 30000,
    icon: Mic,
    iconColor: "#ec4899",
    description: "AI tutor bilan nutq ko'nikmasini rivojlantiring",
    features: [
      "Barcha Speaking qismlari (Part 1-3)",
      "AI tutor bilan real-time amaliyot",
      "Talaffuz va grammatika tahlili",
      "Video va audio feedback",
      "30 kunlik kirish",
    ],
  },
  writing: {
    id: "writing",
    title: "Writing",
    price: 30000,
    icon: PenLine,
    iconColor: "#f59e0b",
    description: "Yozish ko'nikmasini professional darajaga olib chiqing",
    features: [
      "Task 1 va Task 2 mashqlari",
      "AI tomonidan batafsil tahlil",
      "Grammatika va lug'at tavsiyalari",
      "Sample essays va templates",
      "30 kunlik kirish",
    ],
  },
}

export function getPlanById(planId: string): PaymentPlan | null {
  return PAYMENT_PLANS[planId] || null
}
