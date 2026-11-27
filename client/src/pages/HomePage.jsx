import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import CurrentlyReading from '../components/reading/CurrentlyReading'
import RecentActivity from '../components/activity/RecentActivity'
import RightColumn from '../components/dashboard/RightColumn'
import { useReadingList } from '../hooks/useReadingList'
import { getCurrentlyReading, getShelfCounts, getUpNext } from '../utils/dashboard'

function HomePage() {
  const { user, items, volumeDetails, status, error } = useReadingList()
  const isLoading = status === 'loading'

  return (
    <>
      <Header />
      <div className="mx-auto grid max-w-[1280px] gap-6 px-5 py-5 md:grid-cols-[220px_minmax(0,1fr)] md:px-8 md:py-6 lg:grid-cols-[220px_minmax(0,668px)_280px]">
        <Sidebar shelves={getShelfCounts(items)} isLoading={isLoading} />
        <main className="main-content">
          <p className="mb-6 text-lg">Welcome{user?.name ? `, ${user.name}` : ''}.</p>
          {status === 'error' && <p role="alert">{error}</p>}
          <CurrentlyReading series={getCurrentlyReading(items, volumeDetails)} isLoading={isLoading} />
          <RecentActivity />
        </main>
        <RightColumn upNext={getUpNext(items)} isLoading={isLoading} />
      </div>
    </>
  )
}

export default HomePage
