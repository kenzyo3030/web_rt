import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  FileText,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { exportToPDF, exportToCSV } from '@/lib/exportUtils';
import { supabase } from '@/lib/supabaseClient';

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [reportData, setReportData] = useState({
    totalPemasukan: 0,
    totalPengeluaran: 0,
    saldoAkhir: 0,
    jumlahTransaksi: 0
  });
  const [filter, setFilter] = useState({
    type: 'monthly',
    year: new Date().getFullYear(),
    month: (new Date().getMonth() + 1).toString().padStart(2, '0')
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*');
      if (error) {
        toast({ title: "Gagal mengambil data transaksi!", description: error.message, variant: "destructive" });
        setTransactions([]);
        return;
      }
      setTransactions(data || []);
    };
    fetchTransactions();
  }, [toast]);

  useEffect(() => {
    calculateReportData();
  }, [transactions, filter]);

  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const transactionYear = t.tanggal ? new Date(t.tanggal).getFullYear() : null;
      if (filter.type === 'annual') {
        return transactionYear === filter.year;
      }
      const transactionMonth = t.tanggal ? (new Date(t.tanggal).getMonth() + 1).toString().padStart(2, '0') : null;
      return transactionYear === filter.year && transactionMonth === filter.month;
    });
  };

  const calculateReportData = () => {
    const filtered = getFilteredTransactions();
    const pemasukan = filtered.filter(t => t.jenis_transaksi === 'pemasukan').reduce((sum, t) => sum + (t.amount || 0), 0);
    const pengeluaran = filtered.filter(t => t.jenis_transaksi === 'pengeluaran').reduce((sum, t) => sum + (t.amount || 0), 0);

    setReportData({
      totalPemasukan: pemasukan,
      totalPengeluaran: pengeluaran,
      saldoAkhir: pemasukan - pengeluaran,
      jumlahTransaksi: filtered.length
    });
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  // Export PDF sesuai kolom tabel
  const handleExportPDF = () => {
    const reportTitle = `Laporan Keuangan ${getReportPeriod()}`;
    const pdfData = getFilteredTransactions().map(t => [
      t.tanggal && !isNaN(new Date(t.tanggal))
        ? new Date(t.tanggal).toLocaleDateString('id-ID')
        : '-',
      t.jenis_transaksi === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
      t.tipe_pembayaran ? t.tipe_pembayaran.replace(/_/g, " ") : '-',
      t.keterangan || '-',
      t.nama_warga || '-',
      t.status || '-',
      typeof t.amount === 'number' && !isNaN(t.amount)
        ? (t.jenis_transaksi === 'pemasukan' ? '+' : '-') + formatCurrency(t.amount)
        : '-'
    ]);
    exportToPDF(pdfData, reportTitle, reportData);
    toast({ title: "Laporan PDF berhasil dibuat!" });
  };

  // Export CSV/Excel sesuai kolom tabel
  const handleExportCSV = () => {
    const csvData = getFilteredTransactions().map(t => [
      t.tanggal && !isNaN(new Date(t.tanggal))
        ? new Date(t.tanggal).toLocaleDateString('id-ID')
        : '-',
      t.jenis_transaksi === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
      t.tipe_pembayaran ? t.tipe_pembayaran.replace(/_/g, " ") : '-',
      t.keterangan || '-',
      t.nama_warga || '-',
      t.status || '-',
      typeof t.amount === 'number' && !isNaN(t.amount)
        ? (t.jenis_transaksi === 'pemasukan' ? '+' : '-') + formatCurrency(t.amount)
        : '-'
    ]);
    exportToCSV(csvData, `laporan_${getReportPeriod().replace(' ', '_').toLowerCase()}`);
    toast({ title: "Laporan CSV berhasil dibuat!" });
  };

  const getReportPeriod = () => {
    if (filter.type === 'annual') {
      return `Tahun ${filter.year}`;
    }
    const monthName = new Date(`${filter.year}-${filter.month}-01`).toLocaleDateString('id-ID', { month: 'long' });
    return `${monthName} ${filter.year}`;
  };

  const filteredTransactions = getFilteredTransactions();

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-sky-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sky-900">Laporan Keuangan</h1>
          <p className="text-sky-600 mt-1">Laporan transparan keuangan RT 06</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })} className="p-2 border border-sky-200 rounded-md">
            <option value="monthly">Bulanan</option>
            <option value="annual">Tahunan</option>
          </select>
          {filter.type === 'monthly' && (
            <select value={filter.month} onChange={(e) => setFilter({ ...filter, month: e.target.value })} className="p-2 border border-sky-200 rounded-md">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={(i + 1).toString().padStart(2, '0')}>
                  {new Date(0, i).toLocaleDateString('id-ID', { month: 'long' })}
                </option>
              ))}
            </select>
          )}
          <select value={filter.year} onChange={(e) => setFilter({ ...filter, year: parseInt(e.target.value) })} className="p-2 border border-sky-200 rounded-md">
            {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Pemasukan" value={formatCurrency(reportData.totalPemasukan)} icon={TrendingUp} color="bg-gradient-to-r from-green-500 to-green-600" description={`${filteredTransactions.filter(t => t.jenis_transaksi === 'pemasukan').length} transaksi`} />
        <StatCard title="Total Pengeluaran" value={formatCurrency(reportData.totalPengeluaran)} icon={TrendingDown} color="bg-gradient-to-r from-red-500 to-red-600" description={`${filteredTransactions.filter(t => t.jenis_transaksi === 'pengeluaran').length} transaksi`} />
        <StatCard title="Saldo Akhir" value={formatCurrency(reportData.saldoAkhir)} icon={BarChart3} color="bg-gradient-to-r from-sky-500 to-sky-600" description={reportData.saldoAkhir >= 0 ? 'Surplus' : 'Defisit'} />
        <StatCard title="Total Transaksi" value={reportData.jumlahTransaksi} icon={FileText} color="bg-gradient-to-r from-purple-500 to-purple-600" description={`Transaksi untuk ${getReportPeriod()}`} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-lg border border-sky-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-sky-900">Laporan Detail - {getReportPeriod()}</h3>
          <div className="flex items-center space-x-2 text-sm text-sky-600"><Calendar className="h-4 w-4" /><span>Periode: {getReportPeriod()}</span></div>
        </div>
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sky-50 border-b border-sky-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-sky-900">Tanggal</th>
                  <th className="text-left p-3 font-semibold text-sky-900">Jenis</th>
                  <th className="text-left p-3 font-semibold text-sky-900">Tipe Pembayaran</th>
                  <th className="text-left p-3 font-semibold text-sky-900">Keterangan</th>
                  <th className="text-left p-3 font-semibold text-sky-900">Nama Warga</th>
                  <th className="text-left p-3 font-semibold text-sky-900">Status</th>
                  <th className="text-right p-3 font-semibold text-sky-900">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-sky-100">
                    <td className="p-3 text-sm text-gray-900">
                      {t.tanggal && !isNaN(new Date(t.tanggal))
                        ? new Date(t.tanggal).toLocaleDateString('id-ID')
                        : '-'}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${t.jenis_transaksi === 'pemasukan' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {t.jenis_transaksi === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-900">{t.tipe_pembayaran ? t.tipe_pembayaran.replace(/_/g, " ") : '-'}</td>
                    <td className="p-3 text-sm text-gray-900">{t.keterangan || '-'}</td>
                    <td className="p-3 text-sm text-gray-900">{t.nama_warga || '-'}</td>
                    <td className="p-3 text-sm text-gray-900">{t.status || '-'}</td>
                    <td className={`p-3 text-sm font-semibold text-right ${t.jenis_transaksi === 'pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.jenis_transaksi === 'pemasukan' ? '+' : '-'}
                      {typeof t.amount === 'number' && !isNaN(t.amount) ? formatCurrency(t.amount) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-sky-50 border-t-2 border-sky-200">
                <tr>
                  <td colSpan="6" className="p-3 font-semibold text-sky-900">Total Saldo:</td>
                  <td className={`p-3 font-bold text-right ${reportData.saldoAkhir >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(reportData.saldoAkhir)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center py-8"><FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">Tidak ada transaksi pada periode ini</p></div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-lg border border-sky-200">
        <h3 className="text-lg font-semibold text-sky-900 mb-4">Opsi Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700 text-white p-4 h-auto flex-col space-y-2"><Download className="h-5 w-5" /><span className="text-sm">Export PDF</span></Button>
          <Button onClick={handleExportCSV} variant="outline" className="border-green-200 text-green-700 p-4 h-auto flex-col space-y-2 hover:bg-green-50"><FileText className="h-5 w-5" /><span className="text-sm">Export CSV (Excel)</span></Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;