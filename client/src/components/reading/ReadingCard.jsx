function ReadingCard({ index, progress, detail }) {
  return (
    <article className="reading-card">
      <div className="cover" aria-label={`Placeholder cover ${index + 1}`} />
      <p>Series Title</p>
      <div className="progress"><span style={{ width: `${progress}%` }} /></div>
      <small>{detail}</small>
    </article>
  )
}

export default ReadingCard
