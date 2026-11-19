import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Departments from './pages/Departments'
import Employees from './pages/Employees'
import EmployeeForm from './pages/EmployeeForm'
import EmployeeDetails from './pages/EmployeeDetails'
import Login from './pages/Login'
import Attendance from './pages/Attendance'
import Leaves from './pages/Leaves'
import Salary from './pages/Salary'
import Payroll from './pages/Payroll'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/departments" element={<ProtectedRoute allowedRoles={["ADMIN", "HR_MANAGER"]} />}>
                <Route index element={<Departments />} />
              </Route>
              <Route path="/employees" element={<Employees />} />
              <Route path="/employees/add" element={<ProtectedRoute allowedRoles={["ADMIN", "HR_MANAGER"]} />}>
                <Route index element={<EmployeeForm />} />
              </Route>
              <Route path="/employees/:id" element={<EmployeeDetails />} />
              <Route path="/employees/:id/edit" element={<ProtectedRoute allowedRoles={["ADMIN", "HR_MANAGER"]} />}>
                <Route index element={<EmployeeForm />} />
              </Route>
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/leaves" element={<Leaves />} />
              <Route path="/salary" element={<ProtectedRoute allowedRoles={["ADMIN", "HR_MANAGER"]} />}><Route index element={<Salary />} /></Route>
              <Route path="/payroll" element={<Payroll />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
