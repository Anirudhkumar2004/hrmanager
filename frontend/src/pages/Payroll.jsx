import { useEffect, useState } from 'react'
import { Download, WandSparkles } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Payroll() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    try {
      const monthDate = `${month}-01`
      const response = await api.get(`/payroll/payroll/?month=${monthDate}`)
      setRecords(response.data.results || response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to load payroll.')
    }
  }

  useEffect(() => { load() }, [month])

  const generate = async () => {
    setError('')
    setSuccess('')
    try {
      const response = await api.post('/payroll/payroll/generate/', { month: `${month}-01` })
      setSuccess(`Created ${response.data.created} payroll record(s); skipped ${response.data.skipped}.`)
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to generate payroll.')
    }
  }

  const updateStatus = async (record, paymentStatus) => {
    try {
      await api.post(`/payroll/payroll/${record.id}/payment-status/`, { payment_status: paymentStatus })
      setSuccess('Payment status updated.')
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to update status.')
    }
  }

  const downloadPayslip = async (record) => {
    try {
      const response = await api.get(`/payroll/payroll/${record.id}/payslip/`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `payslip-${record.employee_code}-${record.payroll_month}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Unable to download payslip.')
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-violet-700">Compensation</p><h1 className="mt-1 text-3xl font-bold text-gray-900">Monthly Payroll</h1></div><div className="flex gap-2"><input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="h-10 rounded-lg border border-gray-300 px-3 text-sm" /><button type="button" onClick={generate} className="flex h-10 items-center gap-2 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white"><WandSparkles className="h-4 w-4" />Generate payroll</button></div></div>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50 text-gray-600"><tr><th className="px-5 py-3">Employee</th><th className="px-5 py-3">Gross</th><th className="px-5 py-3">Deductions</th><th className="px-5 py-3">Net</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{records.map((record) => <tr key={record.id} className="border-b last:border-0"><td className="px-5 py-4"><p className="font-medium text-gray-900">{record.employee_name}</p><p className="text-xs text-gray-500">{record.employee_code}</p></td><td className="px-5 py-4">{record.gross_salary}</td><td className="px-5 py-4">{record.total_deductions}</td><td className="px-5 py-4 font-semibold text-gray-900">{record.net_salary}</td><td className="px-5 py-4"><select value={record.payment_status} onChange={(event) => updateStatus(record, event.target.value)} className="h-9 rounded-lg border border-gray-300 px-2 text-xs"><option value="PENDING">Pending</option><option value="PAID">Paid</option><option value="CANCELLED">Cancelled</option></select></td><td className="px-5 py-4 text-right"><button type="button" onClick={() => downloadPayslip(record)} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-gray-700"><Download className="h-4 w-4" />Payslip</button></td></tr>)}</tbody></table>{!records.length && <p className="p-8 text-center text-gray-500">No payroll records for this month.</p>}</div></div>
    </div>
  )
}
