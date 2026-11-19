import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import api from '../services/api'

export default function Salary() {
  const [employees, setEmployees] = useState([])
  const [salaries, setSalaries] = useState([])
  const [form, setForm] = useState({ employee: '', basic_salary: '', allowances: '0', deductions: '0', effective_from: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    try {
      const [employeeResponse, salaryResponse] = await Promise.all([api.get('/employees/?employment_status=ACTIVE'), api.get('/payroll/salaries/')])
      setEmployees(employeeResponse.data.results || employeeResponse.data)
      setSalaries(salaryResponse.data.results || salaryResponse.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to load salary data.')
    }
  }

  useEffect(() => { load() }, [])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.post('/payroll/salaries/', { ...form, employee: Number(form.employee) })
      setForm({ employee: '', basic_salary: '', allowances: '0', deductions: '0', effective_from: '' })
      setSuccess('Salary configuration saved.')
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to save salary.')
    }
  }

  return (
    <div>
      <div className="mb-6"><p className="text-sm font-medium text-violet-700">Compensation</p><h1 className="mt-1 text-3xl font-bold text-gray-900">Salary Management</h1></div>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

      <form onSubmit={submit} className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-6">
        <label className="text-sm font-medium text-gray-700 md:col-span-2">Employee<select required value={form.employee} onChange={(event) => setForm({ ...form, employee: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3"><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.employee_code} - {employee.first_name} {employee.last_name}</option>)}</select></label>
        <label className="text-sm font-medium text-gray-700">Basic salary<input type="number" step="0.01" required value={form.basic_salary} onChange={(event) => setForm({ ...form, basic_salary: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3" /></label>
        <label className="text-sm font-medium text-gray-700">Allowances<input type="number" step="0.01" value={form.allowances} onChange={(event) => setForm({ ...form, allowances: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3" /></label>
        <label className="text-sm font-medium text-gray-700">Deductions<input type="number" step="0.01" value={form.deductions} onChange={(event) => setForm({ ...form, deductions: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3" /></label>
        <label className="text-sm font-medium text-gray-700">Effective from<input type="date" required value={form.effective_from} onChange={(event) => setForm({ ...form, effective_from: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3" /></label>
        <button type="submit" className="md:col-start-6 mt-[22px] flex h-10 items-center justify-center gap-2 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Save salary</button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50 text-gray-600"><tr><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Basic</th><th className="px-5 py-3">Allowances</th><th className="px-5 py-3">Deductions</th><th className="px-5 py-3">Effective</th></tr></thead><tbody>{salaries.map((salary) => <tr key={salary.id} className="border-b last:border-0"><td className="px-5 py-4"><p className="font-medium text-gray-900">{salary.employee_name}</p><p className="text-xs text-gray-500">{salary.employee_code}</p></td><td className="px-5 py-4">{salary.basic_salary}</td><td className="px-5 py-4">{salary.allowances}</td><td className="px-5 py-4">{salary.deductions}</td><td className="px-5 py-4">{salary.effective_from}</td></tr>)}</tbody></table>{!salaries.length && <p className="p-8 text-center text-gray-500">No salary records configured.</p>}</div></div>
    </div>
  )
}
