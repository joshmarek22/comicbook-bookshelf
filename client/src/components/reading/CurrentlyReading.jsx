import { currentlyReading } from '../../data/dashboard'
import ReadingCard from './ReadingCard'

function CurrentlyReading() {
  return (
    <section className="section currently-reading">
      <div className="section-heading">
        <h1>CURRENTLY READING</h1>
        <button className="primary-button">+ Log an issue</button>
      </div>
      <div className="reading-grid">
        {currentlyReading.map(([detail, progress], index) => (
          <ReadingCard key={detail} index={index} detail={detail} progress={progress} />
        ))}
      </div>
    </section>
  )
}

export default CurrentlyReading
