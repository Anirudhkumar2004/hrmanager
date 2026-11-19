import { useEffect, useState } from 'react'
import { CalendarDays, CheckCircle, Plus, XCircle } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const emptyForm = { leave_type: 'CASUAL', start_date: '', end_date: '', reason: '' }

export default function Leaves() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [balance, setBalance] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const requestsResponse = await api.get('/leaves/leaves/')
      setRequests(requestsResponse.data.results || requestsResponse.data)
      if (user?.role === 'EMPLOYEE') {
        const balanceResponse = await api.get('/leaves/leaves/balance/')
        setBalance(balanceResponse.data)
      }
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to load leave requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const apply = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.post('/leaves/leaves/', form)
      setForm(emptyForm)
      setSuccess('Leave request submitted successfully.')
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.response?.data?.end_date?.[0] || 'Unable to submit leave request.')
    }
  }

  const decide = async (leave, action) => {
    setError('')
    setSuccess('')
    try {
      let payload = {}
      if (action === 'reject') {
        const comments = window.prompt('Rejection reason') || ''
        if (!comments.trim()) return
        payload = { rejection_comments: comments.trim() }
      }
      await api.post(`/leaves/leaves/${leave.id}/${action}/`, payload)
      setSuccess(action === 'approve' ? 'Leave request approved.' : 'Leave request rejected.')
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to update leave request.')
    }
  }

  const statusClass = (leaveStatus) => {
    if (leaveStatus === 'APPROVED') return 'bg-green-100 text-green-700'
    if (leaveStatus === 'REJECTED') return 'bg-red-100 text-red-700'
    return 'bg-amber-100 text-amber-700'
  }

  return (
    <div>
      <div className="mb-6"><p className="text-sm font-medium text-violet-700">Time off</p><h1 className="mt-1 text-3xl font-bold text-gray-900">Leave Management</h1></div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

      {balance && <div className="mb-5 grid gap-4 sm:grid-cols-3">{Object.entries(balance).map(([type, value]) => <article key={type} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">{type} Leave</p><p className="mt-1 text-2xl font-bold text-gray-900">{value.remaining}</p><p className="text-xs text-gray-500">{value.used} used of {value.allowance} days</p></article>)}</div>}

      {user?.role === 'EMPLOYEE' && <form onSubmit={apply} className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-5"><label className="text-sm font-medium text-gray-700">Leave type<select value={form.leave_type} onChange={(event) => setForm({ ...form, leave_type: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3"><option value="CASUAL">Casual Leave</option><option value="SICK">Sick Leave</option><option value="EARNED">Earned Leave</option></select></label><label className="text-sm font-medium text-gray-700">Start date<input type="date" required value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3" /></label><label className="text-sm font-medium text-gray-700">End date<input type="date" required value={form.end_date} onChange={(event) => setForm({ ...form, end_date: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3" /></label><label className="text-sm font-medium text-gray-700 md:col-span-1">Reason<input required value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 px-3" /></label><button type="submit" className="mt-[22px] flex h-10 items-center justify-center gap-2 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Apply</button></form>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="p-6 text-gray-500">Loading leave requests...</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50 text-gray-600"><tr><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Dates</th><th className="px-5 py-3">Days</th><th className="px-5 py-3">Reason</th><th className="px-5 py-3">Status</th>{['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER'].includes(user?.role) && <th className="px-5 py-3 text-right">Actions</th>}</tr></thead><tbody>{requests.map((leave) => <tr key={leave.id} className="border-b last:border-0"><td className="px-5 py-4"><p className="font-medium text-gray-900">{leave.employee_name}</p><p className="text-xs text-gray-500">{leave.employee_code}</p></td><td className="px-5 py-4">{leave.leave_type}</td><td className="px-5 py-4">{leave.start_date} to {leave.end_date}</td><td className="px-5 py-4">{leave.total_days}</td><td className="max-w-xs px-5 py-4">{leave.reason}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(leave.status)}`}>{leave.status}</span>{leave.rejection_comments && <p className="mt-1 max-w-xs text-xs text-red-600">{leave.rejection_comments}</p>}</td>{['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER'].includes(user?.role) && leave.status === 'PENDING' && <td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" title="Approve" onClick={() => decide(leave, 'approve')} className="rounded-lg border border-green-200 p-2 text-green-700"><CheckCircle className="h-4 w-4" /></button><button type="button" title="Reject" onClick={() => decide(leave, 'reject')} className="rounded-lg border border-red-200 p-2 text-red-700"><XCircle className="h-4 w-4" /></button></div></td>}</tr>)}</tbody></table>{!requests.length && <p className="p-8 text-center text-gray-500">No leave requests found.</p>}</div>}
      </div>
    </div>
  )
}
