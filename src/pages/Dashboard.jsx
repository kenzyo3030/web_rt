import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const Dashboard = ({ setCurrentPage }) => {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterYear, setFilterYear] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [years, setYears] = useState([]);

  useEffect(() => {
    async function fetchData() {
      // Fetch data transactions dari Supabase
      const { data: trxData } = await supabase.from('transactions').select('*');
      setTransactions(trxData || []);
      // Fetch data users dari Supabase
      const { data: userData } = await supabase.from('users').select('id');
      setUsers(userData || []);

      // Ambil daftar tahun unik dari transaksi
      const tahunUnik = Array.from(new Set((trxData || []).map(t => new Date(t.tanggal).getFullYear()))).sort((a, b) => b - a);
      setYears(tahunUnik);
    }
    fetchData();
  }, []);

  // Mapping transaksi ke format yang dipakai di UI
  const mappedTransactions = transactions.map(t => ({
    ...t,
    date: t.tanggal,
    type: t.jenis_transaksi,         // <- gunakan jenis_transaksi dari Supabase
    amount: Number(t.amount) || 0,   // <- gunakan amount dari Supabase
    description: t.keterangan
  }));

  // Filter transaksi sesuai tahun & bulan
  const filteredTransactions = mappedTransactions.filter(t =>
    (filterYear === 'all' || new Date(t.date).getFullYear() === Number(filterYear)) &&
    (filterMonth === 'all' || new Date(t.date).getMonth() === Number(filterMonth))
  );

  // Statistik
  const totalPemasukan = filteredTransactions
    .filter(t => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPengeluaran = filteredTransactions
    .filter(t => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSaldo = totalPemasukan - totalPengeluaran;

  // --- Pertumbuhan pemasukan bulan ini dibanding bulan lalu (dinamis) ---
  const now = new Date();
  const thisMonthIdx = now.getMonth();
  const thisYear = now.getFullYear();

  const pemasukanThisMonth = mappedTransactions
    .filter(t =>
      t.type === 'pemasukan' &&
      new Date(t.date).getMonth() === thisMonthIdx &&
      new Date(t.date).getFullYear() === thisYear
    ).reduce((sum, t) => sum + t.amount, 0);

  const pemasukanLastMonth = mappedTransactions
    .filter(t => {
      const d = new Date(t.date);
      let lastMonth = thisMonthIdx - 1;
      let year = thisYear;
      if (lastMonth < 0) { lastMonth = 11; year--; }
      return t.type === 'pemasukan' && d.getMonth() === lastMonth && d.getFullYear() === year;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const pemasukanGrowth = pemasukanLastMonth === 0
    ? (pemasukanThisMonth === 0 ? 0 : 100)
    : ((pemasukanThisMonth - pemasukanLastMonth) / Math.abs(pemasukanLastMonth)) * 100;

  // --- Pertumbuhan pengeluaran bulan ini dibanding bulan lalu (opsional) ---
  const pengeluaranThisMonth = mappedTransactions
    .filter(t =>
      t.type === 'pengeluaran' &&
      new Date(t.date).getMonth() === thisMonthIdx &&
      new Date(t.date).getFullYear() === thisYear
    ).reduce((sum, t) => sum + t.amount, 0);

  const pengeluaranLastMonth = mappedTransactions
    .filter(t => {
      const d = new Date(t.date);
      let lastMonth = thisMonthIdx - 1;
      let year = thisYear;
      if (lastMonth < 0) { lastMonth = 11; year--; }
      return t.type === 'pengeluaran' && d.getMonth() === lastMonth && d.getFullYear() === year;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const pengeluaranGrowth = pengeluaranLastMonth === 0
    ? (pengeluaranThisMonth === 0 ? 0 : 100)
    : ((pengeluaranThisMonth - pengeluaranLastMonth) / Math.abs(pengeluaranLastMonth)) * 100;

  // Transaksi terbaru
  const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentTransactions = sortedTransactions.slice(0, 4);

  // Grafik bulanan
  let monthlyData;
  if (filterMonth === 'all') {
    monthlyData = Array.from({ length: 12 }, (_, i) => {
      return {
        month: monthNames[i],
        pemasukan: mappedTransactions
          .filter(t =>
            t.type === 'pemasukan' &&
            (filterYear === 'all' || new Date(t.date).getFullYear() === Number(filterYear)) &&
            new Date(t.date).getMonth() === i
          )
          .reduce((sum, t) => sum + t.amount, 0),
        pengeluaran: mappedTransactions
          .filter(t =>
            t.type === 'pengeluaran' &&
            (filterYear === 'all' || new Date(t.date).getFullYear() === Number(filterYear)) &&
            new Date(t.date).getMonth() === i
          )
          .reduce((sum, t) => sum + t.amount, 0)
      };
    });
  } else {
    monthlyData = Array.from({ length: 12 }, (_, i) => {
      if (i === Number(filterMonth)) {
        return {
          month: monthNames[i],
          pemasukan: mappedTransactions
            .filter(t =>
              t.type === 'pemasukan' &&
              (filterYear === 'all' || new Date(t.date).getFullYear() === Number(filterYear)) &&
              new Date(t.date).getMonth() === i
            )
            .reduce((sum, t) => sum + t.amount, 0),
          pengeluaran: mappedTransactions
            .filter(t =>
              t.type === 'pengeluaran' &&
              (filterYear === 'all' || new Date(t.date).getFullYear() === Number(filterYear)) &&
              new Date(t.date).getMonth() === i
            )
            .reduce((sum, t) => sum + t.amount, 0)
        };
      } else {
        return {
          month: monthNames[i],
          pemasukan: 0,
          pengeluaran: 0
        };
      }
    });
  }

  const maxValue = Math.max(...monthlyData.flatMap(d => [d.pemasukan, d.pengeluaran]));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(amount) || 0);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-xl p-6 shadow-lg border border-sky-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trendValue > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trendValue > 0 ? 'text-green-600' : trendValue < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {trendValue > 0 ? '+' : ''}
                {trendValue.toFixed(1)}% dari bulan lalu
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const ChartBar = ({ month, pemasukan, pengeluaran, maxValue }) => (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-end space-x-1 h-32">
        <div
          className="bg-sky-500 rounded-t w-6 transition-all duration-500"
          style={{ height: `${maxValue ? (pemasukan / maxValue) * 100 : 0}%` }}
          title={`Pemasukan: ${formatCurrency(pemasukan)}`}
        />
        <div
          className="bg-red-400 rounded-t w-6 transition-all duration-500"
          style={{ height: `${maxValue ? (pengeluaran / maxValue) * 100 : 0}%` }}
          title={`Pengeluaran: ${formatCurrency(pengeluaran)}`}
        />
      </div>
      <span className="text-xs text-gray-600 font-medium">{month}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filter di kanan atas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sky-900">Dashboard</h1>
          <p className="text-sky-600 mt-1">Ringkasan keuangan RT 06</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="flex items-center gap-2">
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value="all">Semua Tahun</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="all">Semua Bulan</option>
              {monthNames.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <Calendar className="h-4 w-4 text-sky-600" />
          <span className="text-sm text-sky-600">
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Saldo"
          value={totalPemasukan === 0 && totalPengeluaran === 0 ? '-' : formatCurrency(totalSaldo)}
          icon={Wallet}
          color="bg-gradient-to-r from-sky-500 to-sky-600"
        />
        <StatCard
          title="Total Pemasukan"
          value={totalPemasukan === 0 ? '-' : formatCurrency(totalPemasukan)}
          icon={TrendingUp}
          color="bg-gradient-to-r from-green-500 to-green-600"
          trend={true}
          trendValue={pemasukanGrowth}
        />
       <StatCard
          title="Total Pengeluaran"
          value={totalPengeluaran === 0 ? '-' : formatCurrency(totalPengeluaran)}
          icon={TrendingDown}
          color="bg-gradient-to-r from-red-500 to-red-600"
          trend={true}
          trendValue={pengeluaranGrowth === 100 && pengeluaranLastMonth === 0 ? -100 : pengeluaranGrowth}
          />
        <StatCard
          title="Total Warga"
          value={`${users.length} Pengguna`}
          icon={Users}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-sky-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-sky-900">Grafik Bulanan</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-sky-500 rounded mr-2"></div>
                <span className="text-gray-600">Pemasukan</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded mr-2"></div>
                <span className="text-gray-600">Pengeluaran</span>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between space-x-2 px-4">
            {monthlyData.every(d => d.pemasukan === 0 && d.pengeluaran === 0) ? (
              <div className="w-full text-center text-gray-400 py-12">Tidak ada data grafik pada filter ini.</div>
            ) : (
              monthlyData.map((data, index) => (
                <ChartBar
                  key={index}
                  month={data.month}
                  pemasukan={data.pemasukan}
                  pengeluaran={data.pengeluaran}
                  maxValue={maxValue}
                />
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-sky-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-sky-900">Transaksi Terbaru</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage('transactions')}
            >
              Lihat Semua
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentTransactions.length > 0 ? recentTransactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-sky-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'pemasukan' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'pemasukan' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  transaction.type === 'pemasukan' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'pemasukan' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
            )) : <p className="text-sm text-gray-500 text-center py-4">Belum ada transaksi.</p>}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-sky-200"
      >
        <h3 className="text-lg font-semibold text-sky-900 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white p-4 h-auto flex-col space-y-2"
            onClick={() => setCurrentPage('transactions')}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm">Tambah Pemasukan</span>
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white p-4 h-auto flex-col space-y-2"
            onClick={() => setCurrentPage('transactions')}
          >
            <TrendingDown className="h-5 w-5" />
            <span className="text-sm">Tambah Pengeluaran</span>
          </Button>
          <Button 
            variant="outline"
            className="border-sky-200 text-sky-700 p-4 h-auto flex-col space-y-2"
            onClick={() => setCurrentPage('reports')}
          >
            <DollarSign className="h-5 w-5" />
            <span className="text-sm">Lihat Laporan</span>
          </Button>
          <Button 
            variant="outline"
            className="border-sky-200 text-sky-700 p-4 h-auto flex-col space-y-2"
            onClick={() => setCurrentPage('users')}
          >
            <Users className="h-5 w-5" />
            <span className="text-sm">Kelola Pengguna</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;