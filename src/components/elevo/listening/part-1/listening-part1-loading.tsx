import { ExamLoading } from "@/components/elevo/shared/exam-loading"
import { PageHeaderWithBack } from "@/components/elevo/shared/page-header-with-back"

export function ListeningPart1Loading() {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <PageHeaderWithBack title="Part 1 — Short Conversations" />
      <ExamLoading />
    </div>
  )
}
