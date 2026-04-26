
import { ExamLoading } from "@/components/elevo/shared/exam-loading"

interface ListeningLoadingProps {
  title: string
}

export function ListeningLoading({ title }: ListeningLoadingProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <ExamLoading />
    </div>
  )
}
