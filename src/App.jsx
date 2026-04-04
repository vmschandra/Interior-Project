import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

// Layouts
import PublicLayout from '@/layouts/PublicLayout'
import DashboardLayout from '@/layouts/DashboardLayout'

// Public pages
import Landing from '@/pages/Landing'
import Designers from '@/pages/Designers'
import DesignerProfile from '@/pages/DesignerProfile'
import Pricing from '@/pages/Pricing'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'

// Customer dashboard
import CustomerOverview from '@/pages/customer/Overview'
import CustomerMessages from '@/pages/customer/Messages'
import CustomerFavorites from '@/pages/customer/Favorites'
import CustomerSubscription from '@/pages/customer/Subscription'
import CustomerSettings from '@/pages/customer/Settings'

// Designer dashboard
import DesignerOverview from '@/pages/designer/Overview'
import DesignerProjects from '@/pages/designer/Projects'
import DesignerMessages from '@/pages/designer/Messages'
import DesignerSubscription from '@/pages/designer/Subscription'
import DesignerSettings from '@/pages/designer/Settings'

function ProtectedRoute({ children, allowedRole }) {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/dashboard" replace />
  return children
}

function RoleRedirect() {
  const { user } = useAuthStore()
  if (user?.role === 'DESIGNER') return <Navigate to="/dashboard/designer" replace />
  return <Navigate to="/dashboard/customer" replace />
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#101F36',
            color: '#E0FFD6',
            border: '1px solid rgba(57,255,20,0.25)',
            borderRadius: '2px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#39FF14', secondary: '#0B1929' } },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/designers" element={<Designers />} />
          <Route path="/designers/:slug" element={<DesignerProfile />} />
          <Route path="/pricing" element={<Pricing />} />
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Dashboard router */}
        <Route path="/dashboard" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

        {/* Customer dashboard */}
        <Route
          path="/dashboard/customer"
          element={<ProtectedRoute allowedRole="CUSTOMER"><DashboardLayout role="CUSTOMER" /></ProtectedRoute>}
        >
          <Route index element={<CustomerOverview />} />
          <Route path="messages" element={<CustomerMessages />} />
          <Route path="favorites" element={<CustomerFavorites />} />
          <Route path="subscription" element={<CustomerSubscription />} />
          <Route path="settings" element={<CustomerSettings />} />
        </Route>

        {/* Designer dashboard */}
        <Route
          path="/dashboard/designer"
          element={<ProtectedRoute allowedRole="DESIGNER"><DashboardLayout role="DESIGNER" /></ProtectedRoute>}
        >
          <Route index element={<DesignerOverview />} />
          <Route path="projects" element={<DesignerProjects />} />
          <Route path="messages" element={<DesignerMessages />} />
          <Route path="subscription" element={<DesignerSubscription />} />
          <Route path="settings" element={<DesignerSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
