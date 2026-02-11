import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router'

const DashboardLayout = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[16rem_1fr]">
      <aside className="md:sticky md:top-0 md:h-screen">
        <Sidebar />
      </aside>

      <main className="min-w-0 bg-slate-50 p-4 md:p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout