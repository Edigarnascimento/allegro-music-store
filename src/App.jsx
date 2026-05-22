import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminLayout from './components/admin/AdminLayout';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-shell">
      {!isAdminRoute ? <Header /> : null}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/produto/:productId" element={<ProductDetailsPage />} />
          <Route path="/servicos" element={<ServicesPage />} />
          <Route path="/contato" element={<ContactPage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<ProtectedAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/produtos" element={<AdminProductsPage />} />
              <Route path="/admin/produtos/novo" element={<AdminProductFormPage />} />
              <Route path="/admin/produtos/editar/:id" element={<AdminProductFormPage />} />
              <Route path="/admin/categorias" element={<AdminCategoriesPage />} />
              <Route path="/admin/configuracoes" element={<AdminSettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdminRoute ? <Footer /> : null}
    </div>
  );
}

export default App;
