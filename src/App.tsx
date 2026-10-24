import React, { useEffect } from 'react';
import { RouterProvider, useRouter } from './router/Router';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { testFirestoreConnection } from './firebase/config';

// Storefront Components
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

// Storefront Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CustomPackagingPage } from './pages/CustomPackagingPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { AboutPage } from './pages/AboutPage';
import { ProcessPage } from './pages/ProcessPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage, TermsPage } from './pages/LegalPages';

// Admin Pages
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { Link } from './router/Router';
import { Package, ArrowLeft } from 'lucide-react';

const AppContent: React.FC = () => {
  const { pathname } = useRouter();

  useEffect(() => {
    // Validate Firestore connection on boot as mandated
    testFirestoreConnection();
  }, []);

  // Determine current page based on pathname (normalize trailing slash)
  let content = null;
  const normalizedPath = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const isAdminRoute =
    normalizedPath === '/admin' ||
    normalizedPath === '/admin/login' ||
    normalizedPath === '/admin-login';

  if (normalizedPath === '/') {
    content = <HomePage />;
  } else if (normalizedPath === '/shop') {
    content = <ShopPage />;
  } else if (normalizedPath.startsWith('/category/')) {
    const slug = normalizedPath.replace('/category/', '').split('/')[0];
    content = <CategoryPage slug={slug} />;
  } else if (normalizedPath.startsWith('/product/')) {
    const slug = normalizedPath.replace('/product/', '').split('/')[0];
    content = <ProductDetailPage slug={slug} />;
  } else if (normalizedPath === '/custom-packaging') {
    content = <CustomPackagingPage />;
  } else if (normalizedPath === '/portfolio') {
    content = <PortfolioPage />;
  } else if (normalizedPath === '/about') {
    content = <AboutPage />;
  } else if (normalizedPath === '/our-process') {
    content = <ProcessPage />;
  } else if (normalizedPath === '/faq') {
    content = <FAQPage />;
  } else if (normalizedPath === '/contact') {
    content = <ContactPage />;
  } else if (normalizedPath === '/privacy') {
    content = <PrivacyPage />;
  } else if (normalizedPath === '/terms') {
    content = <TermsPage />;
  } else if (normalizedPath === '/admin/login' || normalizedPath === '/admin-login') {
    content = <AdminLoginPage />;
  } else if (normalizedPath === '/admin') {
    content = <AdminDashboardPage />;
  } else {
    // 404 Fallback
    content = (
      <div className="min-h-[70vh] bg-[#FAF7F2] flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white p-8 border border-[#E8E2D8] text-center rounded-sm shadow-xs space-y-4">
          <Package className="w-12 h-12 text-[#8C6D3B] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#1E1B18]">
            Page Not Found
          </h2>
          <p className="text-xs text-[#6B6357]">
            The requested page does not exist or has been relocated.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E1B18] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2C2723]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1E1B18] selection:bg-[#D4AF37]/20 w-full max-w-full">
      {!isAdminRoute && <AnnouncementBar />}
      {!isAdminRoute && <Navbar />}

      <main className="flex-1 w-full max-w-full min-w-0">{content}</main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FloatingWhatsApp />}
    </div>
  );
};

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
