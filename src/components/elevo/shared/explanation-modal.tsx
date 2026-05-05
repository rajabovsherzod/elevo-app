"use client"

import { useState } from "react"
import { 
  Dialog as AriaDialog, 
  Modal as AriaModal, 
  ModalOverlay as AriaModalOverlay 
} from "react-aria-components"
import { cx } from "@/utils/cx"

interface ExplanationModalProps {
  isOpen: boolean
  onClose: () => void
  position: number
  correctAnswer: string
  explanation_uz?: string | null
  explanation_en?: string | null
}

/**
 * React Aria Modal - Professional & Reliable
 * - Automatic backdrop click handling
 * - Body scroll lock (no layout shift)
 * - Smooth animations
 * - Centered positioning
 * - ESC key support
 */
export function ExplanationModal({ 
  isOpen, 
  onClose, 
  position, 
  correctAnswer, 
  explanation_uz, 
  explanation_en 
}: ExplanationModalProps) {
  const [language, setLanguage] = useState<'en' | 'uz'>('en')

  const hasUz = !!explanation_uz
  const hasEn = !!explanation_en
  const currentExplanation = language === 'uz' ? explanation_uz : explanation_en

  return (
    <AriaModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      isDismissable
      className={(renderProps) =>
        cx(
          // Full screen backdrop - centered
          "fixed inset-0 z-[9999] flex items-center justify-center",
          "bg-black/40 backdrop-blur-[2px]",
          "p-4",
          // Smooth animations
          renderProps.isEntering && "duration-200 ease-out animate-in fade-in",
          renderProps.isExiting && "duration-150 ease-in animate-out fade-out"
        )
      }
    >
      <AriaModal
        className={(renderProps) =>
          cx(
            "w-full max-w-sm max-h-[90vh] outline-none",
            // Smooth animations
            renderProps.isEntering && "duration-200 ease-out animate-in zoom-in-95",
            renderProps.isExiting && "duration-150 ease-in animate-out zoom-out-95"
          )
        }
      >
        <AriaDialog className="outline-none" aria-labelledby="modal-title">
          {({ close }) => (
            <div className="elevo-card elevo-card-border w-full h-full flex flex-col shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-outline-variant flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                    {position}
                  </span>
                  <div>
                    <p id="modal-title" className="text-xs font-semibold text-on-surface">
                      Answer Explanation
                    </p>
                    <p className="text-[11px] text-green-600 font-semibold">Correct: {correctAnswer}</p>
                  </div>
                </div>
                
                {/* Language Switcher */}
                {hasUz && hasEn && (
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface-container">
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={cx(
                        "px-2 py-1 rounded-md text-[11px] font-semibold transition-all duration-150",
                        language === 'en'
                          ? "bg-primary text-on-primary shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      )}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('uz')}
                      className={cx(
                        "px-2 py-1 rounded-md text-[11px] font-semibold transition-all duration-150",
                        language === 'uz'
                          ? "bg-primary text-on-primary shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      )}
                    >
                      UZ
                    </button>
                  </div>
                )}
              </div>

              {/* Content - Scrollable */}
              <div className="p-3 overflow-y-auto flex-1">
                {currentExplanation ? (
                  <p className="text-[13px] leading-relaxed text-on-surface whitespace-pre-wrap">
                    {currentExplanation}
                  </p>
                ) : (
                  <p className="text-[13px] text-on-surface-variant italic">
                    No explanation available in {language === 'uz' ? 'Uzbek' : 'English'}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-outline-variant flex-shrink-0 flex justify-end">
                <button
                  type="button"
                  onClick={() => close()}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 active:scale-95 transition-all outline-none focus:outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  )
}
