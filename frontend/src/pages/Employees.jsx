import { useEffect, useState } from 'react'
import { Eye, Plus, Search, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Employees() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (department) params.set('department', department)
      if (status) params.set('employment_status', status)
      const [employeeResponse, departmentResponse] = await Promise.all([
        api.get(`/employees/?${params.toString()}`),
        api.get('/departments/'),
      ])
      setEmployees(employeeResponse.data.results || employeeResponse.data)
      setDepartments(departmentResponse.data.results || departmentResponse.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to load employees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-violet-700">People</p><h1 className="mt-1 text-3xl font-bold text-gray-900">Employee Directory</h1></div>
        {['ADMIN', 'HR_MANAGER'].includes(user?.role) && (
          <button type="button" onClick={() => navigate('/employees/add')} className="flex h-10 items-center gap-2 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white hover:bg-violet-800"><Plus className="h-4 w-4" />Add employee</button>
        )}
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <label className="relative md:col-span-2"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && load()} placeholder="Search name, code, designation..." className="h-10 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-violet-600" /></label>
        <select value={department} onChange={(event) => setDepartment(event.target.value)} className="h-10 rounded-lg border border-gray-300 px-3 text-sm"><option value="">All departments</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-gray-300 px-3 text-sm"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="RESIGNED">Resigned</option></select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="p-6 text-gray-500">Loading employees...</p> : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50 text-gray-600"><tr><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Code</th><th className="px-5 py-3">Department</th><th className="px-5 py-3">Designation</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
            <tbody>{employees.map((employee) => <tr key={employee.id} className="border-b last:border-0"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700"><Users className="h-4 w-4" /></div><p className="font-semibold text-gray-900">{employee.first_name} {employee.last_name}</p></div></td><td className="px-5 py-4">{employee.employee_code}</td><td className="px-5 py-4">{employee.department_name}</td><td className="px-5 py-4">{employee.designation}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${employee.employment_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{employee.employment_status}</span></td><td className="px-5 py-4 text-right"><button type="button" onClick={() => navigate(`/employees/${employee.id}`)} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-gray-700 hover:bg-gray-50"><Eye className="h-4 w-4" />View</button></td></tr>)}</tbody>
          </table>{!employees.length && <p className="p-8 text-center text-gray-500">No employees match this view.</p>}</div>
        )}
      </div>
    </div>
  )
}
