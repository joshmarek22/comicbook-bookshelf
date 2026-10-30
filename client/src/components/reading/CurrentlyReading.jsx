import { currentlyReading } from '../../data/dashboard'
import ReadingCard from './ReadingCard'

function CurrentlyReading() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="mb-4 text-[13px] tracking-[1px]">CURRENTLY READING</h1>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {currentlyReading.map(([detail, progress], index) => (
          <ReadingCard key={detail} index={index} detail={detail} progress={progress} />
        ))}
      </div>
    </section>
  )
}

export default CurrentlyReading
