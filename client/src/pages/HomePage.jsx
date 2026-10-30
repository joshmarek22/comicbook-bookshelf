import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import CurrentlyReading from '../components/reading/CurrentlyReading'
import RecentActivity from '../components/activity/RecentActivity'
import RightColumn from '../components/dashboard/RightColumn'

function HomePage() {
  return (
    <>
      <Header />
      <div className="layout">
        <Sidebar />
        <main className="main-content">
          <CurrentlyReading />
          <RecentActivity />
        </main>
        <RightColumn />
      </div>
    </>
  )
}

export default HomePage
