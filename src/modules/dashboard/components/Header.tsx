
import { clearAuthSession, getAuthSession } from "@/modules/auth/utils/authStorage"


const Header = () => {
    const session = getAuthSession()
   
  return (
    <header className="w-full bg-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-6 lg:px-8">
            <h1 className="min-w-0 flex-1 text-2xl font-bold text-gray-800 sm:text-3xl">
              <span>Hola </span>
              <span className="inline-block max-w-full truncate align-bottom">{session?.email ?? ""}</span>
            </h1>

            <button
              type="button"
              onClick={clearAuthSession}
              className="w-full cursor-pointer rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white sm:w-auto sm:text-base"
            >
              Cerrar sesión
            </button>
        </div>
    </header>
  )
}

export default Header