import { useState } from 'react'
import { Building2, CalendarCheck, DollarSign, LayoutDashboard, LogOut, Menu, Plane, Users, WalletCards, X } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleNames = {
  ADMIN: 'Admin',
  HR_MANAGER: 'HR Manager',
  DEPARTMENT_MANAGER: 'Department Manager',
  EMPLOYEE: 'Employee',
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="min-h-screen bg-slate-50">
      {mobileMenuOpen && <button type="button" aria-label="Close navigation overlay" onClick={closeMobileMenu} className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 p-5 text-white shadow-2xl transition-transform duration-200 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-lg font-bold shadow-lg shadow-violet-950/30">H</div>
          <div>
            <p className="font-bold tracking-tight">HRGenius</p>
            <p className="text-xs text-slate-400">Human Resources</p>
          </div>
          <button type="button" onClick={closeMobileMenu} className="ml-auto rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 space-y-1.5">
          <NavLink
            onClick={closeMobileMenu}
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold
              ${isActive ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          {['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER'].includes(user?.role) && (
            <NavLink
              onClick={closeMobileMenu}
              to="/employees"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold
                ${isActive ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
              }
            >
              <Users className="h-4 w-4" />
              Employees
            </NavLink>
          )}
          {['ADMIN', 'HR_MANAGER'].includes(user?.role) && (
            <NavLink
              onClick={closeMobileMenu}
              to="/departments"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold
                ${isActive ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
              }
            >
              <Building2 className="h-4 w-4" />
              Departments
            </NavLink>
          )}
          <NavLink
            onClick={closeMobileMenu}
            to="/attendance"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold
              ${isActive ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <CalendarCheck className="h-4 w-4" />
            Attendance
          </NavLink>
          <NavLink
            onClick={closeMobileMenu}
            to="/leaves"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold
              ${isActive ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <Plane className="h-4 w-4" />
            Leave
          </NavLink>
          {['ADMIN', 'HR_MANAGER'].includes(user?.role) && (
            <NavLink
              onClick={closeMobileMenu}
              to="/salary"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold
                ${isActive ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
              }
            >
              <DollarSign className="h-4 w-4" />
              Salary
            </NavLink>
          )}
          <NavLink
            onClick={closeMobileMenu}
            to="/payroll"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold
              ${isActive ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
            }
          >
            <WalletCards className="h-4 w-4" />
            Payroll
          </NavLink>
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{user?.first_name || user?.username}</p>
              <p className="text-xs text-slate-500">{roleNames[user?.role]}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
