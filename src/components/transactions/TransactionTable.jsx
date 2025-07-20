import React from 'react';
import { Calendar, User, FileText, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';

function TransactionTable({ transactions, onEdit, onDelete }) {
  return (
    <table className="min-w-full rounded-xl overflow-hidden shadow border border-sky-100">
      <thead className="bg-sky-50">
        <tr>
          <th className="px-4 py-3 text-left text-base font-bold text-sky-900">Tanggal</th>
          <th className="px-4 py-3 text-left text-base font-bold text-sky-900">Jenis</th>
          <th className="px-4 py-3 text-left text-base font-bold text-sky-900">Tipe</th>
          <th className="px-4 py-3 text-left text-base font-bold text-sky-900">Nama Warga</th>
          <th className="px-4 py-3 text-left text-base font-bold text-sky-900">Keterangan</th>
          <th className="px-4 py-3 text-left text-base font-bold text-sky-900">Jumlah</th>
          <th className="px-4 py-3 text-left text-base font-bold text-sky-900">Status</th>
          <th className="px-4 py-3 text-left text-base font-bold text-sky-900">Aksi</th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {transactions.map(transaction => {
          // Sesuaikan field dengan Supabase: jenis_transaksi, tipe_pembayaran, nama_warga, keterangan, tanggal, amount, status
          const isIncome = transaction.jenis_transaksi === 'pemasukan';
          const tanggalValid = transaction.tanggal && !isNaN(new Date(transaction.tanggal));
          return (
            <tr key={transaction.id || transaction.uuid} className="border-b last:border-b-0">
              <td className="px-4 py-3 align-middle">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-sky-500" />
                  <span className="font-medium text-sky-900">
                    {tanggalValid
                      ? new Date(transaction.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                      : '-'}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 align-middle">
                <div className="flex items-center gap-2 font-semibold">
                  {isIncome ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                  <span className={isIncome ? "text-green-600" : "text-red-500"}>
                    {isIncome ? "Pemasukan" : "Pengeluaran"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 align-middle">
                {transaction.tipe_pembayaran
                  ? transaction.tipe_pembayaran.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                  : '-'}
              </td>
              <td className="px-4 py-3 align-middle">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-sky-500" />
                  <span>
                    {transaction.nama_warga && transaction.nama_warga.trim() !== "" 
                      ? transaction.nama_warga 
                      : '-'}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 align-middle">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-sky-500" />
                  <span>
                    {transaction.keterangan && transaction.keterangan.trim() !== ""
                      ? transaction.keterangan
                      : '-'}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 align-middle font-bold">
                <span className={isIncome ? "text-green-600" : "text-red-500"}>
                  {isIncome ? '+' : '-'}
                  {typeof transaction.amount === 'number' && !isNaN(transaction.amount)
                    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(transaction.amount)
                    : '-'}
                </span>
              </td>
              <td className="px-4 py-3 align-middle">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold ${
                  transaction.status === 'lunas'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-yellow-50 text-yellow-600'
                }`}>
                  <CheckCircle className="h-4 w-4" />
                  {transaction.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                </span>
              </td>
              <td className="px-4 py-3 align-middle">
                <button
                  className="text-blue-600 hover:underline mr-3 font-semibold"
                  onClick={() => onEdit(transaction)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:underline font-semibold"
                  onClick={() => onDelete(transaction.id || transaction.uuid)}
                >
                  Hapus
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default TransactionTable;