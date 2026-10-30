import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'

function PlaceholderPage() {
  return (
    <>
      <Header />
      <main className="placeholder-page">
        <h1>Coming soon</h1>
        <p>This route is ready for the next Panelhaus feature.</p>
        <Link to="/">Back to dashboard</Link>
      </main>
    </>
  )
}

export default PlaceholderPage
