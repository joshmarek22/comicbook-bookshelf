function ReadingCard({ index, progress, detail }) {
  return (
    <article>
      <div className="aspect-[2/3] border border-[var(--line)] bg-[var(--placeholder)] sm:aspect-auto sm:h-[233px]" aria-label={`Placeholder cover ${index + 1}`} />
      <p className="my-3 text-[13px]">Series Title</p>
      <div className="h-2 bg-[#4a4a4a]"><span className="block h-full bg-[var(--ink)]" style={{ width: `${progress}%` }} /></div>
      <small className="mt-2 block text-xs text-[var(--muted)]">{detail}</small>
    </article>
  )
}

export default ReadingCard
