import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'

function PlaceholderPage() {
  return (
    <>
      <Header />
      <main className="px-8 py-12">
        <h1 className="mb-2 text-[28px]">Coming soon</h1>
        <p>This route is ready for the next Panelhaus feature.</p>
        <Link to="/">Back to dashboard</Link>
      </main>
    </>
  )
}

export default PlaceholderPage
