import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import CurrentlyReading from '../components/reading/CurrentlyReading'
import RecentActivity from '../components/activity/RecentActivity'
import RightColumn from '../components/dashboard/RightColumn'

function HomePage() {
  return (
    <>
      <Header />
      <div className="mx-auto grid max-w-[1280px] gap-6 px-5 py-5 md:grid-cols-[220px_minmax(0,1fr)] md:px-8 md:py-6 lg:grid-cols-[220px_minmax(0,668px)_280px]">
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
