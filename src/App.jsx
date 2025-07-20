import React, { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async'; 
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Transactions from '@/pages/Transactions';
import Reports from '@/pages/Reports';
import Users from '@/pages/Users';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  useEffect(() => {
    const handleNavigation = (event) => {
      setCurrentPage(event.detail);
    };

    window.addEventListener('navigate', handleNavigation);

    return () => {
      window.removeEventListener('navigate', handleNavigation);
    };
  }, []);

  const renderPage = () => {
    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'transactions':
        return <Transactions />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <Users />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <HelmetProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
          <Helmet>
            <title>Kas RT 06 Online - Transparansi Keuangan RT Lebih Mudah</title>
            <meta name="description" content="Aplikasi pencatatan kas RT yang membantu bendahara mencatat pemasukan dan pengeluaran dengan transparan dan mudah." />
          </Helmet>
          
          {isAuthenticated ? (
            <Layout 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage}
              onLogout={handleLogout}
            >
              {renderPage()}
            </Layout>
          ) : (
            renderPage()
          )}
          
          <Toaster />
        </div>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
