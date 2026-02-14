import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import { Outlet } from 'react-router'

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 md:grid md:grid-cols-[16rem_1fr]">
      <aside className="md:sticky md:top-0 md:h-screen">
        <Sidebar />
      </aside>

      <div className="min-w-0 flex flex-col">
        <Header />

        <main className="min-w-0 flex-1 bg-slate-50 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default DashboardLayout