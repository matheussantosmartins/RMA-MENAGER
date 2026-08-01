import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';
import { NotFoundPage } from './routes/NotFoundPage';
import { FullPageSpinner } from './components/ui/Spinner';

const LoginPage = lazy(() =>
  import('./features/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
  import('./features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const RmasPage = lazy(() =>
  import('./features/rmas/RmasPage').then((m) => ({ default: m.RmasPage })),
);
const CustomersPage = lazy(() =>
  import('./features/customers/CustomersPage').then((m) => ({ default: m.CustomersPage })),
);
const ProductsPage = lazy(() =>
  import('./features/products/ProductsPage').then((m) => ({ default: m.ProductsPage })),
);
const UsersPage = lazy(() =>
  import('./features/users/UsersPage').then((m) => ({ default: m.UsersPage })),
);

export function App() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="rmas" element={<RmasPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route element={<AdminRoute />}>
              <Route path="users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
