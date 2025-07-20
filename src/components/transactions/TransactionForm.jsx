import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addTransaction } from '../../services/transactionService';

const TransactionForm = ({ onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    type: 'pemasukan',
    paymentType: 'iuran_bulanan',
    amount: '',
    residentName: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'lunas'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'pemasukan',
        paymentType: initialData.paymentType || 'iuran_bulanan',
        amount: initialData.amount || '',
        residentName: initialData.residentName || '',
        description: initialData.description || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        status: initialData.status || 'lunas'
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mapping ke struktur tabel Supabase
    const transaction = {
      jenis_transaksi: formData.type,
      tipe_pembayaran: formData.paymentType,
      amount: Number(formData.amount),
      tanggal: formData.date,
      nama_warga: formData.residentName,
      keterangan: formData.description,
      status: formData.status
    };
    const { data, error } = await addTransaction(transaction);
    if (error) {
      alert('Gagal menyimpan transaksi: ' + error.message);
    } else {
      alert('Transaksi berhasil disimpan!');
      setFormData({
        type: 'pemasukan',
        paymentType: 'iuran_bulanan',
        amount: '',
        residentName: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        status: 'lunas'
      });
      if (onCancel) onCancel(); // Tutup form jika ada fungsi onCancel
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Jenis Transaksi</Label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full mt-1 p-2 border border-sky-200 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="pemasukan">Pemasukan</option>
            <option value="pengeluaran">Pengeluaran</option>
          </select>
        </div>
        <div>
          <Label htmlFor="paymentType">Tipe Pembayaran</Label>
          <select
            id="paymentType"
            value={formData.paymentType}
            onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
            className="w-full mt-1 p-2 border border-sky-200 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="iuran_bulanan">Iuran Bulanan</option>
            <option value="fasilitas_umum">Fasilitas Umum</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Jumlah (Rp)</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="date">Tanggal</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
      </div>
      {formData.type === 'pemasukan' && (
        <div>
          <Label htmlFor="residentName">Nama Warga</Label>
          <Input
            id="residentName"
            value={formData.residentName}
            onChange={(e) => setFormData({ ...formData, residentName: e.target.value })}
            placeholder="Masukkan nama warga"
            required
          />
        </div>
      )}
      <div>
        <Label htmlFor="description">Keterangan</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Masukkan keterangan"
          required
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full mt-1 p-2 border border-sky-200 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        >
          <option value="lunas">Lunas</option>
          <option value="belum_lunas">Belum Lunas</option>
        </select>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit" className="bg-sky-600 hover:bg-sky-700">Simpan Transaksi</Button>
      </div>
    </form>
  );
};

export default TransactionForm;