import { useEffect, useState } from 'react'
import { CalendarCheck, Clock3, LogIn, LogOut } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Attendance() {
  const { user } = useAuth()
  const [today, setToday] = useState(null)
  const [records, setRecords] = useState([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const requests = [api.get(`/attendance/?month=${month}`)]
      if (user?.role === 'EMPLOYEE') requests.push(api.get('/attendance/today/'))
      const responses = await Promise.all(requests)
      setRecords(responses[0].data.results || responses[0].data)
      if (responses[1]) setToday(responses[1].data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to load attendance.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [month])

  const runAction = async (action) => {
    setError('')
    setSuccess('')
    try {
      const response = await api.post(`/attendance/${action}/`)
      setToday(response.data)
      setSuccess(action === 'check-in' ? 'Checked in successfully.' : 'Checked out successfully.')
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || `Unable to ${action.replace('-', ' ')}.`)
    }
  }

  const formatTime = (value) => value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-violet-700">Time tracking</p><h1 className="mt-1 text-3xl font-bold text-gray-900">Attendance</h1></div>
        {user?.role === 'EMPLOYEE' && <div className="flex gap-2"><button type="button" disabled={Boolean(today?.check_in)} onClick={() => runAction('check-in')} className="flex h-10 items-center gap-2 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><LogIn className="h-4 w-4" />Check in</button><button type="button" disabled={!today?.check_in || Boolean(today?.check_out)} onClick={() => runAction('check-out')} className="flex h-10 items-center gap-2 rounded-lg border border-violet-700 px-4 text-sm font-semibold text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"><LogOut className="h-4 w-4" />Check out</button></div>}
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

      {user?.role === 'EMPLOYEE' && (
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><CalendarCheck className="h-5 w-5" /></div>
            <p className="text-sm text-gray-500">Today's status</p>
            <p className="mt-1 font-semibold text-gray-900">{today?.status?.replace('_', ' ') || 'Not checked in'}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><Clock3 className="h-5 w-5" /></div>
            <p className="text-sm text-gray-500">Check-in</p>
            <p className="mt-1 font-semibold text-gray-900">{formatTime(today?.check_in)}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><Clock3 className="h-5 w-5" /></div>
            <p className="text-sm text-gray-500">Working hours</p>
            <p className="mt-1 font-semibold text-gray-900">{today?.working_hours ? `${today.working_hours} hours` : '—'}</p>
          </article>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Monthly attendance</h2>
        <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="h-10 rounded-lg border border-gray-300 px-3 text-sm" />
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-gray-500">Loading attendance...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-gray-600">
                <tr><th className="px-5 py-3">Date</th>{user?.role !== 'EMPLOYEE' && <th className="px-5 py-3">Employee</th>}<th className="px-5 py-3">Check-in</th><th className="px-5 py-3">Check-out</th><th className="px-5 py-3">Hours</th><th className="px-5 py-3">Status</th></tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b last:border-0">
                    <td className="px-5 py-4">{record.attendance_date}</td>
                    {user?.role !== 'EMPLOYEE' && <td className="px-5 py-4"><p className="font-medium text-gray-900">{record.employee_name}</p><p className="text-xs text-gray-500">{record.employee_code}</p></td>}
                    <td className="px-5 py-4">{formatTime(record.check_in)}</td>
                    <td className="px-5 py-4">{formatTime(record.check_out)}</td>
                    <td className="px-5 py-4">{record.working_hours}</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{record.status.replace('_', ' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!records.length && <p className="p-8 text-center text-gray-500">No attendance records for this month.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
