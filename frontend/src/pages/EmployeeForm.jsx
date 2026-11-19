import { useEffect, useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

const emptyForm = {
  username: '', email: '', password: '', first_name: '', last_name: '', phone: '',
  department: '', designation: '', joining_date: '', employment_status: 'ACTIVE',
  address: '', date_of_birth: '',
}

export default function EmployeeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const departmentResponse = await api.get('/departments/')
        setDepartments(departmentResponse.data.results || departmentResponse.data)
        if (isEdit) {
          const employeeResponse = await api.get(`/employees/${id}/`)
          const employee = employeeResponse.data
          setForm({
            username: '', email: '', password: '', first_name: employee.first_name,
            last_name: employee.last_name, phone: employee.phone || '', department: employee.department,
            designation: employee.designation, joining_date: employee.joining_date,
            employment_status: employee.employment_status, address: employee.address || '',
            date_of_birth: employee.date_of_birth || '',
          })
        }
      } catch (requestError) {
        setError(requestError.response?.data?.detail || 'Unable to load employee information.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isEdit])

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, department: Number(form.department) }
      if (!payload.date_of_birth) delete payload.date_of_birth
      if (isEdit) {
        delete payload.username
        delete payload.password
        await api.patch(`/employees/${id}/`, payload)
      } else {
        await api.post('/employees/', payload)
      }
      navigate('/employees')
    } catch (requestError) {
      const data = requestError.response?.data
      const message = data?.detail || Object.entries(data || {}).map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(' ') : value}`).join(' ') || 'Unable to save employee.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-gray-500">Loading employee...</p>

  return (
    <div>
      <button type="button" onClick={() => navigate('/employees')} className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" />Back to directory</button>
      <div className="mb-6"><p className="text-sm font-medium text-violet-700">People</p><h1 className="mt-1 text-3xl font-bold text-gray-900">{isEdit ? 'Edit employee' : 'Add employee'}</h1></div>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          {!isEdit && <><label className="text-sm font-medium text-gray-700">Username<input value={form.username} onChange={(event) => update('username', event.target.value)} required className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3" /></label><label className="text-sm font-medium text-gray-700">Password<input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} required minLength="8" className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3" /></label></>}
          <label className="text-sm font-medium text-gray-700">First name<input value={form.first_name} onChange={(event) => update('first_name', event.target.value)} required className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3" /></label>
          <label className="text-sm font-medium text-gray-700">Last name<input value={form.last_name} onChange={(event) => update('last_name', event.target.value)} required className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3" /></label>
          {!isEdit && <label className="text-sm font-medium text-gray-700">Email<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3" /></label>}
          <label className="text-sm font-medium text-gray-700">Phone<input value={form.phone} onChange={(event) => update('phone', event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3" /></label>
          <label className="text-sm font-medium text-gray-700">Department<select value={form.department} onChange={(event) => update('department', event.target.value)} required className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3"><option value="">Select department</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">Designation<input value={form.designation} onChange={(event) => update('designation', event.target.value)} required className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3" /></label>
          <label className="text-sm font-medium text-gray-700">Joining date<input type="date" value={form.joining_date} onChange={(event) => update('joining_date', event.target.value)} required className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3" /></label>
          <label className="text-sm font-medium text-gray-700">Date of birth<input type="date" value={form.date_of_birth} onChange={(event) => update('date_of_birth', event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3" /></label>
          <label className="text-sm font-medium text-gray-700">Employment status<select value={form.employment_status} onChange={(event) => update('employment_status', event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="RESIGNED">Resigned</option></select></label>
          <label className="text-sm font-medium text-gray-700 md:col-span-2">Address<textarea value={form.address} onChange={(event) => update('address', event.target.value)} rows="3" className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>
        </div>
        <button type="submit" disabled={saving} className="mt-6 flex h-10 items-center gap-2 rounded-lg bg-violet-700 px-5 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create employee'}</button>
      </form>
    </div>
  )
}
