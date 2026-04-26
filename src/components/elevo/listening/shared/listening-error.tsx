import { Button } from "@/components/base/buttons/button"


interface ListeningErrorProps {
  title: string
  message: string
  onRetry: () => void
}

export function ListeningError({ title, message, onRetry }: ListeningErrorProps) {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="elevo-card elevo-card-border p-8 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center">
          <span className="text-error text-xl">!</span>
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface mb-1">Yuklashda xatolik</p>
          <p className="text-xs text-on-surface-variant">{message}</p>
        </div>
        <div className="flex gap-3">
          <Button size="sm" color="secondary" onClick={() => window.location.reload()}>
            Sahifani yangilash
          </Button>
          <Button size="sm" color="primary" onClick={onRetry}>
            Qayta urinish
          </Button>
        </div>
      </div>
    </div>
  )
}
