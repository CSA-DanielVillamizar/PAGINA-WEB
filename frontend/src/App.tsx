              <Route path="ranking" element={<RankingAsistenciaPage />} />
import RankingAsistenciaPage from './pages/RankingAsistenciaPage'
            <Route path="/ranking-asistencia" element={<RankingAsistenciaPage />} />
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'

// Public Pages
import Home from './pages/Home'
import About from './pages/About'
import History from './pages/History'
import MotoTouring from './pages/MotoTouring'
import Members from './pages/Members'
import Souvenirs from './pages/Souvenirs'
import News from './pages/News'
import Gallery from './pages/Gallery'
import Donations from './pages/Donations'
import Subscribe from './pages/Subscribe'
import InscriptionForm from './pages/InscriptionForm'
import MembershipRequirements from './pages/MembershipRequirements'
import ImpactoPage from './pages/ImpactoPage'
import DamasPage from './pages/DamasPage'
import CapitulosPage from './pages/CapitulosPage'
import EventosPage from './pages/EventosPage'
import EventoDetallePage from './pages/EventoDetallePage'
import EventosPage from './pages/EventosPage'

// Admin Pages
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import UsersAdmin from './pages/admin/UsersAdmin'
import EventsAdmin from './pages/admin/EventsAdmin'
import SouvenirsAdmin from './pages/admin/SouvenirsAdmin'
import NewsAdmin from './pages/admin/NewsAdmin'
import GalleryAdmin from './pages/admin/GalleryAdmin'
import ReportsAdmin from './pages/admin/ReportsAdmin'
import FeaturedProjectsAdmin from './pages/admin/FeaturedProjectsAdmin'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen dark">
        <Nav />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/historia" element={<History />} />
            <Route path="/Historia" element={<Navigate to="/historia" replace />} />
            <Route path="/moto-touring" element={<MotoTouring />} />
            <Route path="/members" element={<Members />} />
            <Route path="/souvenirs" element={<Souvenirs />} />
            <Route path="/news" element={<News />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/inscripcion" element={<InscriptionForm />} />
            <Route path="/requisitos-membresia" element={<MembershipRequirements />} />
            <Route path="/impacto" element={<ImpactoPage />} />
            <Route path="/damas" element={<DamasPage />} />
            <Route path="/capitulos" element={<CapitulosPage />} />
            <Route path="/eventos" element={<EventosPage />} />
            <Route path="/eventos/:slug" element={<EventoDetallePage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UsersAdmin />} />
              <Route path="events" element={<EventsAdmin />} />
              <Route path="souvenirs" element={<SouvenirsAdmin />} />
              <Route path="news" element={<NewsAdmin />} />
              <Route path="gallery" element={<GalleryAdmin />} />
              <Route path="reports" element={<ReportsAdmin />} />
              <Route path="projects" element={<FeaturedProjectsAdmin />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
