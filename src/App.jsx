import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import InstitutionalPage from './pages/InstitutionalPage';
import TrackOrderPage from './pages/TrackOrderPage';
import DigitalCardPage from './pages/DigitalCardPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminInteressesPage from './pages/admin/AdminInteressesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminAuditPage from './pages/admin/AdminAuditPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import ScrollToTop from './components/ScrollToTop';
import MobileCartBar from './components/MobileCartBar';
import WelcomeModal from './components/WelcomeModal';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-shell">
      <ScrollToTop />
      {!isAdminRoute ? <Header /> : null}
      <WelcomeModal />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/produto/:productId" element={<ProductDetailsPage />} />
          <Route path="/servicos" element={<ServicesPage />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/carrinho" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/acompanhar-pedido" element={<TrackOrderPage />} />
          <Route path="/cartao" element={<DigitalCardPage />} />
          <Route path="/institucional/:slug" element={<InstitutionalPage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<ProtectedAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/produtos" element={<AdminProductsPage />} />
              <Route path="/admin/produtos/novo" element={<AdminProductFormPage />} />
              <Route path="/admin/produtos/editar/:id" element={<AdminProductFormPage />} />
              <Route path="/admin/categorias" element={<AdminCategoriesPage />} />
              <Route path="/admin/configuracoes" element={<AdminSettingsPage />} />
              <Route path="/admin/interesses" element={<AdminInteressesPage />} />
              <Route path="/admin/pedidos" element={<AdminOrdersPage />} />
              <Route path="/admin/pagamentos" element={<AdminPaymentsPage />} />
              <Route path="/admin/auditoria" element={<AdminAuditPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdminRoute ? <MobileCartBar /> : null}
      {!isAdminRoute ? <Footer /> : null}
    </div>
  );
}

export default App;
