"use client"

import Lottie from "lottie-react"
import animationData from "../../../../public/loading/exam-loading.json"

const STEPS = [
  "Analysing your answers...",
  "Checking accuracy...",
  "Calculating score...",
]

export function CalculatingResults() {
  return (
    <div className="elevo-card elevo-card-border w-full min-h-[55vh] flex flex-col items-center justify-center gap-5 p-8">
      {/* Lottie animation */}
      <div className="w-36 h-36">
        <Lottie animationData={animationData} loop autoPlay className="w-full h-full" />
      </div>

      {/* Title */}
      <div className="flex flex-col items-center gap-1 -mt-2">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-on-surface">
          Calculating Results
        </p>
        <div className="flex items-center gap-1 mt-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              style={{
                animation: `calculating-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col items-center gap-2 mt-1">
        {STEPS.map((step, i) => (
          <p
            key={step}
            className="text-xs text-on-surface-variant font-medium"
            style={{
              animation: `calculating-fade 2.4s ease-in-out ${i * 0.8}s infinite`,
              opacity: 0,
            }}
          >
            {step}
          </p>
        ))}
      </div>

      <style jsx global>{`
        @keyframes calculating-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        @keyframes calculating-fade {
          0%, 100%  { opacity: 0;   transform: translateY(4px);  }
          20%, 70%  { opacity: 1;   transform: translateY(0);    }
        }
      `}</style>
    </div>
  )
}
