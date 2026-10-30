import { Link } from 'react-router-dom'
import { upNext } from '../../data/dashboard'

function RightColumn() {
  return (
    <aside className="right-column">
      <section className="panel releases">
        <h2>NEW THIS WEDNESDAY</h2>
        <div className="release-grid">
          {Array.from({ length: 6 }, (_, index) => <div className="small-cover" key={index} />)}
        </div>
        <Link to="/calendar">Full release calendar</Link>
      </section>
      <section className="panel up-next">
        <h2>UP NEXT</h2>
        {upNext.map((title) => <Link to="/reading-orders" key={title}>{title}</Link>)}
      </section>
    </aside>
  )
}

export default RightColumn
