import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const TransactionFilters = ({ onFilterChange, transactions }) => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    year: '',
    month: '',
    type: ''
  });

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleReset = () => {
    setFilters({ searchTerm: '', year: '', month: '', type: '' });
  };

  // Dapatkan tahun unik dari transaksi, pastikan hasil bukan NaN dan value adalah string
  const years = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [String(new Date().getFullYear())];
    }
    const uniqueYears = [
      ...new Set(
        transactions
          .map(t => {
            const year = new Date(t.date).getFullYear();
            return !isNaN(year) ? String(year) : null;
          })
          .filter(year => year !== null)
      )
    ];
    return uniqueYears.sort((a, b) => b - a);
  }, [transactions]);

  // Array bulan: value dan label
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(0, i).toLocaleDateString('id-ID', { month: 'long' })
  })), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-sky-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari transaksi..."
            value={filters.searchTerm}
            onChange={e => setFilters({ ...filters, searchTerm: e.target.value })}
            className="pl-10"
          />
        </div>
        {/* Tahun */}
        <select
          value={filters.year}
          onChange={e => setFilters({ ...filters, year: e.target.value })}
          className="p-2 border border-sky-200 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        >
          <option value="">Semua Tahun</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        {/* Bulan */}
        <select
          value={filters.month}
          onChange={e => setFilters({ ...filters, month: e.target.value })}
          className="p-2 border border-sky-200 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        >
          <option value="">Semua Bulan</option>
          {months.map(month => (
            <option key={month.value} value={month.value}>{month.label}</option>
          ))}
        </select>
        {/* Jenis Transaksi */}
        <select
          value={filters.type}
          onChange={e => setFilters({ ...filters, type: e.target.value })}
          className="p-2 border border-sky-200 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        >
          <option value="">Semua Jenis</option>
          <option value="pemasukan">Pemasukan</option>
          <option value="pengeluaran">Pengeluaran</option>
        </select>
        {/* Reset */}
        <Button
          variant="outline"
          className="border-sky-200 md:col-span-5"
          onClick={handleReset}
        >
          <Filter className="h-4 w-4 mr-2" />
          Reset Semua Filter
        </Button>
      </div>
    </motion.div>
  );
};

export default TransactionFilters;