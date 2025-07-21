import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Components
import Layout from './components/Layout/Layout.tsx';
import ProtectedRoute from './components/Auth/ProtectedRoute.tsx';

// Pages
import Login from './pages/Auth/Login.tsx';
import Register from './pages/Auth/Register.tsx';
import Dashboard from './pages/Dashboard/Dashboard.tsx';
import Products from './pages/Products/Products.tsx';
import ProductDetail from './pages/Products/ProductDetail.tsx';
import Users from './pages/Users/Users.tsx';
import UserDetail from './pages/Users/UserDetail.tsx';
import Profile from './pages/Profile/Profile.tsx';
import Settings from './pages/Settings/Settings.tsx';
import NotFound from './pages/NotFound/NotFound.tsx';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Products */}
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetail />} />
              
              {/* Users */}
              <Route path="users" element={<Users />} />
              <Route path="users/:id" element={<UserDetail />} />
              
              {/* Profile & Settings */}
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;