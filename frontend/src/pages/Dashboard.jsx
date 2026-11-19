import { useEffect, useState } from 'react'
import { BarChart3, Building2, CalendarCheck, Clock3, DollarSign, ShieldCheck, Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const roleNames = {
  ADMIN: 'Admin Dashboard',
  HR_MANAGER: 'HR Dashboard',
  DEPARTMENT_MANAGER: 'Manager Dashboard',
  EMPLOYEE: 'Employee Dashboard',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard/summary/')
      .then((response) => setData(response.data))
      .catch((requestError) => setError(requestError.response?.data?.detail || 'Unable to load dashboard.'))
  }, [])

  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
  if (!data) return <p className="text-gray-500">Loading dashboard...</p>

  const organizationCards = data.scope === 'organization' ? [
    { label: 'Total employees', value: data.total_employees, icon: Users, color: 'bg-blue-100 text-blue-700' },
    { label: 'Active employees', value: data.active_employees, icon: ShieldCheck, color: 'bg-violet-100 text-violet-700' },
    { label: 'Departments', value: data.total_departments, icon: Building2, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Today attendance', value: data.today_attendance, icon: CalendarCheck, color: 'bg-amber-100 text-amber-700' },
  ] : []

  const departmentCards = data.scope === 'department' ? [
    { label: 'Department', value: data.department_name || 'Not assigned', icon: Building2, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Team employees', value: data.department_employee_count, icon: Users, color: 'bg-blue-100 text-blue-700' },
    { label: 'Today attendance', value: data.today_attendance, icon: CalendarCheck, color: 'bg-amber-100 text-amber-700' },
    { label: 'Pending leaves', value: data.pending_leaves, icon: Clock3, color: 'bg-red-100 text-red-700' },
  ] : []

  const employeeCards = data.scope === 'employee' ? [
    { label: 'Department', value: data.personal_info?.department || 'Not assigned', icon: Building2, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Today status', value: data.today_attendance?.status?.replace('_', ' ') || 'Not checked in', icon: CalendarCheck, color: 'bg-amber-100 text-amber-700' },
    { label: 'Casual leave left', value: data.leave_balance?.CASUAL?.remaining ?? 0, icon: Clock3, color: 'bg-violet-100 text-violet-700' },
    { label: 'Latest net salary', value: data.latest_payroll ? data.latest_payroll.net_salary : '—', icon: DollarSign, color: 'bg-blue-100 text-blue-700' },
  ] : []

  const cards = organizationCards.length ? organizationCards : departmentCards.length ? departmentCards : employeeCards

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-medium text-violet-700">Overview</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">{roleNames[user.role]}</h1>
        <p className="mt-2 text-gray-500">Welcome, {user.first_name || user.username}.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}><Icon className="h-5 w-5" /></div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="mt-1 font-semibold text-gray-900">{card.value}</p>
            </article>
          )
        })}
      </div>

      {data.scope === 'organization' && (
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="mb-4 font-semibold text-gray-900">Employees by department</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.employees_by_department}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="employee_count" fill="#6D28D9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">HR Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pending leaves</span>
                <strong>{data.pending_leaves}</strong>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Monthly payroll net</span>
                <strong>{data.monthly_payroll}</strong>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Today's attendance</span>
                <strong>{data.today_attendance}</strong>
              </div>
            </div>
          </section>
        </div>
      )}

      {data.scope === 'employee' && (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">Attendance summary</h2>
            {data.attendance_summary?.length ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.attendance_summary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No attendance records this month.</p>
            )}
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">Recent leave requests</h2>
            <div className="space-y-3">
              {data.recent_leaves?.length ? data.recent_leaves.map((leave) => (
                <div key={leave.id} className="flex justify-between border-b pb-3 text-sm last:border-0">
                  <span>{leave.leave_type}<small className="block text-gray-500">{leave.start_date} to {leave.end_date}</small></span>
                  <span className="font-semibold">{leave.status}</span>
                </div>
              )) : <p className="text-sm text-gray-500">No leave requests.</p>}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
