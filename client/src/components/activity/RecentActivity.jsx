import { recentActivity } from '../../data/dashboard'

function RecentActivity() {
  return (
    <section className="section activity">
      <h1>YOUR RECENT ACTIVITY</h1>
      <div className="activity-list">
        {recentActivity.map(([title, detail]) => (
          <article className="activity-row" key={title}>
            <div className="activity-avatar" />
            <div>
              <p>{title}</p>
              {detail && <small>{detail}</small>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default RecentActivity
