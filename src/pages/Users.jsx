import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Shield,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { addUser, getUsers, updateUser, deleteUser } from '../services/userService';
import UserForm from '@/components/users/UserForm';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'user',
    password: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  // Ambil data user dari Supabase
  const loadUsers = async () => {
    const { data, error } = await getUsers();
    if (data) {
      setUsers(
        data.map(user => ({
          ...user,
          name: user.nama_lengkap,
          phone: user.no_telepon,
          createdAt: user.created_at
        }))
      );
    } else if (error) {
      toast({
        title: 'Gagal Memuat Data Pengguna',
        description: error.message
      });
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        user =>
          (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  // Tambah/Edit user ke Supabase
  const handleSubmit = async e => {
    e.preventDefault();

    // Validasi password minimal 6 karakter saat tambah user
    if (!editingUser && formData.password.length < 6) {
      toast({
        title: 'Password terlalu pendek',
        description: 'Password minimal 6 karakter.'
      });
      return;
    }

    if (editingUser) {
      // Edit user
      const updatedUser = {
        nama_lengkap: formData.name,
        username: formData.username,
        email: formData.email,
        no_telepon: formData.phone,
        role: formData.role
      };
      // Jika password diisi, update juga
      if (formData.password) updatedUser.password = formData.password;

      const { error } = await updateUser(editingUser.id, updatedUser);

      if (!error) {
        toast({
          title: 'Pengguna Berhasil Diperbarui!',
          description: `${formData.name} telah diperbarui.`
        });
        loadUsers();
      } else {
        toast({
          title: 'Gagal Edit Pengguna',
          description: error.message
        });
      }
    } else {
      // Tambah user
      const newUser = {
        nama_lengkap: formData.name,
        username: formData.username,
        email: formData.email,
        no_telepon: formData.phone,
        role: formData.role,
        password: formData.password,
        created_at: new Date().toISOString()
      };

      const { error } = await addUser(newUser);

      if (!error) {
        toast({
          title: 'Pengguna Berhasil Ditambahkan!',
          description: `${formData.name} telah ditambahkan sebagai ${formData.role}.`
        });
        loadUsers();
      } else {
        toast({
          title: 'Gagal Menambah Pengguna',
          description: error.message
        });
      }
    }

    resetForm();
  };

  const handleEdit = user => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async userId => {
    if (!window.confirm('Yakin ingin menghapus pengguna ini?')) return;
    const { error } = await deleteUser(userId);
    if (!error) {
      toast({
        title: 'Pengguna dihapus',
        description: 'Data pengguna berhasil dihapus.'
      });
      loadUsers();
    } else {
      toast({
        title: 'Gagal hapus pengguna',
        description: error.message
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      role: 'user',
      password: ''
    });
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sky-900">Kelola Pengguna</h1>
          <p className="text-sky-600 mt-1">Tambah dan kelola pengguna sistem</p>
        </div>
        <Button
          onClick={() => {
            setEditingUser(null);
            setIsDialogOpen(true);
          }}
          className="bg-sky-600 hover:bg-sky-700 mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pengguna
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-sky-200"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari pengguna..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id || user.username}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-sky-200 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-sky-100 rounded-full">
                  <User className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sky-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {user.role === 'admin' && (
                  <Shield className="h-4 w-4 text-yellow-500" />
                )}
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    user.role === 'admin'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {user.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{user.phone}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-sky-100">
              <span className="text-xs text-gray-500">
                Dibuat:{' '}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('id-ID')
                  : '-'}
              </span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(user)}
                  className="border-sky-200 text-sky-700 hover:bg-sky-50"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                {user.role !== 'admin' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(user.id)}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Tidak ada pengguna ditemukan</p>
        </motion.div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <h3 className="text-lg font-semibold text-sky-900 mb-4">
            {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
          </h3>
          <UserForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            editingUser={editingUser}
            resetForm={resetForm}
          />
        </motion.div>
      </Dialog>
    </div>
  );
};

export default Users;