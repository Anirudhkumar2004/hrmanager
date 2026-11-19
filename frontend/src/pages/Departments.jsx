import { useEffect, useState } from 'react'
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react'
import api from '../services/api'

export default function Departments() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })

  const load = async () => {
    try {
      const response = await api.get('/departments/')
      setDepartments(response.data.results || response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to load departments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      if (editing) {
        await api.patch(`/departments/${editing.id}/`, form)
        setSuccess('Department updated successfully.')
      } else {
        await api.post('/departments/', form)
        setSuccess('Department added successfully.')
      }
      setForm({ name: '', description: '' })
      setEditing(null)
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.name?.[0] || requestError.response?.data?.detail || 'Unable to save department.')
    }
  }

  const remove = async (department) => {
    if (!window.confirm(`Delete ${department.name}?`)) return
    setError('')
    setSuccess('')
    try {
      await api.delete(`/departments/${department.id}/`)
      setSuccess('Department deleted successfully.')
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to delete department.')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-medium text-violet-700">Organization</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">Departments</h1>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={submit} className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{editing ? 'Edit department' : 'Add department'}</h2>
          <label className="block text-sm font-medium text-gray-700">Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-violet-600" />
          </label>
          <label className="mt-4 block text-sm font-medium text-gray-700">Description
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="4" className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-violet-600" />
          </label>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="flex h-10 items-center gap-2 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white hover:bg-violet-800"><Plus className="h-4 w-4" />{editing ? 'Save changes' : 'Add department'}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', description: '' }) }} className="h-10 rounded-lg border px-4 text-sm">Cancel</button>}
          </div>
        </form>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          {loading ? <p className="p-6 text-gray-500">Loading departments...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50 text-gray-600"><tr><th className="px-5 py-3">Department</th><th className="px-5 py-3">Employees</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
                <tbody>
                  {departments.map((department) => (
                    <tr key={department.id} className="border-b last:border-0">
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><Building2 className="h-4 w-4" /></div><div><p className="font-semibold text-gray-900">{department.name}</p><p className="max-w-sm truncate text-xs text-gray-500">{department.description || 'No description'}</p></div></div></td>
                      <td className="px-5 py-4 font-medium">{department.employee_count}</td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" title="Edit" onClick={() => { setEditing(department); setForm({ name: department.name, description: department.description }) }} className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50"><Pencil className="h-4 w-4" /></button><button type="button" title="Delete" onClick={() => remove(department)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!departments.length && <p className="p-8 text-center text-gray-500">No departments added yet.</p>}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
