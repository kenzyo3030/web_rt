import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Layout = ({ children, currentPage, setCurrentPage, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transaksi', icon: Receipt },
    { id: 'reports', label: 'Laporan', icon: FileText },
    { id: 'users', label: 'Pengguna', icon: Users },
  ];

  const Sidebar = ({ mobile = false }) => (
    <motion.div
      initial={mobile ? { x: -300 } : { x: 0 }}
      animate={mobile ? { x: sidebarOpen ? 0 : -300 } : { x: 0 }}
      className={`${
        mobile 
          ? 'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden' 
          : 'hidden lg:flex lg:w-64 lg:flex-col'
      } bg-white border-r border-sky-200`}
    >
      <div className="flex h-16 items-center justify-between px-6 border-b border-sky-200">
        <div className="flex items-center space-x-2">
          <Wallet className="h-8 w-8 text-sky-600" />
          <div>
            <h1 className="text-lg font-bold text-sky-900">Kas RT 06</h1>
            <p className="text-xs text-sky-600">Online</p>
          </div>
        </div>
        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                if (mobile) setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                currentPage === item.id
                  ? 'bg-sky-100 text-sky-900 border border-sky-200'
                  : 'text-gray-600 hover:bg-sky-50 hover:text-sky-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sky-200">
        <Button
          variant="outline"
          onClick={onLogout}
          className="w-full flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar</span>
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen bg-sky-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <Sidebar mobile />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-sky-200 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-sky-900 capitalize">
                  {currentPage === 'dashboard' ? 'Dashboard' : 
                   currentPage === 'transactions' ? 'Transaksi' :
                   currentPage === 'reports' ? 'Laporan' : 'Pengguna'}
                </h2>
                <p className="text-sm text-sky-600">Transparansi Keuangan RT Lebih Mudah</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-sky-900">Admin RT 06</p>
                <p className="text-xs text-sky-600">Bendahara</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;