import { useEffect, useState } from 'react'
import { ArrowLeft, Pencil, UserRound } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function EmployeeDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [employee, setEmployee] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/employees/${id}/`)
      .then((response) => setEmployee(response.data))
      .catch((requestError) => setError(requestError.response?.data?.detail || 'Unable to load employee.'))
  }, [id])

  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
  if (!employee) return <p className="text-gray-500">Loading employee...</p>

  const fields = [
    ['Employee code', employee.employee_code], ['Department', employee.department_name],
    ['Designation', employee.designation], ['Joining date', employee.joining_date],
    ['Employment status', employee.employment_status], ['Phone', employee.phone || 'Not provided'],
    ['Date of birth', employee.date_of_birth || 'Not provided'], ['Address', employee.address || 'Not provided'],
  ]

  return (
    <div>
      <button type="button" onClick={() => navigate('/employees')} className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" />Back to directory</button>
      <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-sm font-medium text-violet-700">Employee profile</p><h1 className="mt-1 text-3xl font-bold text-gray-900">{employee.first_name} {employee.last_name}</h1></div>
        {['ADMIN', 'HR_MANAGER'].includes(user?.role) && (
          <button type="button" onClick={() => navigate(`/employees/${id}/edit`)} className="flex h-10 items-center gap-2 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white"><Pencil className="h-4 w-4" />Edit employee</button>
        )}
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4 border-b pb-6"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-700"><UserRound className="h-8 w-8" /></div><div><p className="text-xl font-bold text-gray-900">{employee.first_name} {employee.last_name}</p><p className="text-sm text-gray-500">{employee.designation}</p></div></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{fields.map(([label, value]) => <div key={label}><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p><p className="mt-1 font-medium text-gray-800">{value}</p></div>)}</div>
      </section>
    </div>
  )
}
