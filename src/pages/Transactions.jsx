import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import TransactionTable from '@/components/transactions/TransactionTable';

// Import service Supabase
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction
} from "../services/transactionService";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    year: '',
    month: '',
    type: '',
  });
  const [editTransaction, setEditTransaction] = useState(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Fetch data transaksi dari Supabase pada mount dan setiap setelah aksi CRUD
  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await getTransactions();
    if (error) {
      toast({
        title: 'Gagal memuat data transaksi',
        description: error.message,
      });
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const searchTermMatch = filters.searchTerm
          ? (t.residentName || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            (t.description || '').toLowerCase().includes(filters.searchTerm.toLowerCase())
          : true;

        const yearMatch = filters.year
          ? new Date(t.date).getFullYear() === parseInt(filters.year)
          : true;
        const monthMatch = filters.month
          ? new Date(t.date).getMonth() + 1 === parseInt(filters.month)
          : true;

        const typeMatch = filters.type ? t.type === filters.type : true;

        return searchTermMatch && yearMatch && monthMatch && typeMatch;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filters]);

  // Simpan transaksi baru atau hasil edit via Supabase
  const handleSaveTransaction = async (formData) => {
    setLoading(true);
    if (editTransaction) {
      // Edit mode
      const { error } = await updateTransaction(editTransaction.id, {
        ...formData,
        amount: parseInt(formData.amount),
      });
      if (!error) {
        toast({
          title: 'Transaksi Berhasil Diedit!',
          description: 'Transaksi telah diperbarui.',
        });
        setEditTransaction(null);
        setIsDialogOpen(false);
        await fetchTransactions();
      } else {
        toast({
          title: 'Gagal Edit Transaksi',
          description: error.message,
        });
      }
    } else {
      // Tambah baru
      const { error } = await addTransaction({
        ...formData,
        amount: parseInt(formData.amount),
      });
      if (!error) {
        toast({
          title: 'Transaksi Berhasil Ditambahkan!',
          description: `${
            formData.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'
          } sebesar ${new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
          }).format(formData.amount)} telah dicatat.`,
        });
        setIsDialogOpen(false);
        await fetchTransactions();
      } else {
        toast({
          title: 'Gagal Menambah Transaksi',
          description: error.message,
        });
      }
    }
    setLoading(false);
  };

  // Hapus transaksi via Supabase
  const handleDeleteTransaction = async (id) => {
    setLoading(true);
    const { error } = await deleteTransaction(id);
    if (!error) {
      toast({
        title: 'Transaksi Dihapus',
        description: 'Transaksi berhasil dihapus.',
      });
      await fetchTransactions();
    } else {
      toast({
        title: 'Gagal Hapus Transaksi',
        description: error.message,
      });
    }
    setLoading(false);
  };

  // Edit transaksi: buka dialog & isi initialData
  const handleEditTransaction = (transaction) => {
    setEditTransaction(transaction);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sky-900">Transaksi</h1>
          <p className="text-sky-600 mt-1">Kelola pemasukan dan pengeluaran kas RT</p>
        </div>
        <Button
          onClick={() => {
            setIsDialogOpen(true);
            setEditTransaction(null);
          }}
          className="bg-sky-600 hover:bg-sky-700 mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Transaksi
        </Button>
      </div>

      <TransactionFilters onFilterChange={setFilters} transactions={transactions} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-sky-200 overflow-hidden"
      >
        <TransactionTable
          transactions={filteredTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          loading={loading}
        />
        {filteredTransactions.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada transaksi ditemukan</p>
          </div>
        )}
        {loading && (
          <div className="text-center py-12">
            <span className="text-gray-400">Memuat data...</span>
          </div>
        )}
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <h3 className="text-lg font-semibold text-sky-900 mb-4">
            {editTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h3>
          <TransactionForm
            onSave={handleSaveTransaction}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditTransaction(null);
            }}
            initialData={editTransaction}
            loading={loading}
          />
        </motion.div>
      </Dialog>
    </div>
  );
};

export default Transactions;