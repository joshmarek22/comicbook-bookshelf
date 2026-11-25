import { BrowserRouter, Route, Routes } from 'react-router-dom'
import RequireAuth from './components/auth/RequireAuth'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import BrowsePage from './pages/BrowsePage'
import PlaceholderPage from './pages/PlaceholderPage'
import RegisterPage from './pages/RegisterPage'
import VolumePage from './pages/VolumePage'
import ReadingListPage from './pages/ReadingListPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/browse/volumes/:volumeId" element={<VolumePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/lists" element={<RequireAuth><ReadingListPage /></RequireAuth>} />
        <Route path="*" element={<PlaceholderPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
