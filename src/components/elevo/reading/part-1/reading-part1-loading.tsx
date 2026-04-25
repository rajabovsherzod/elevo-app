export function ReadingPart1Loading() {
  return (
    <div className="elevo-card elevo-card-border p-10 flex flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="flex items-center gap-2.5">
        <span
          className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: "200ms" }}
        />
      </div>
      <p className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">
        Preparing exam...
      </p>
    </div>
  )
}
