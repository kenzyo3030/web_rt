import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const UserForm = ({
  formData,
  setFormData,
  handleSubmit,
  editingUser,
  resetForm
}) => (
  <form onSubmit={handleSubmit} className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          placeholder="Masukkan nama lengkap"
          required
        />
      </div>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={e => setFormData({ ...formData, username: e.target.value })}
          placeholder="Masukkan username"
          required
        />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          placeholder="Masukkan email"
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">No. Telepon</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={e => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Masukkan no. telepon"
          required
        />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          value={formData.role}
          onChange={e => setFormData({ ...formData, role: e.target.value })}
          className="w-full mt-1 p-2 border border-sky-200 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <Label htmlFor="password">
          {editingUser ? 'Password Baru (opsional)' : 'Password'}
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
          placeholder="Masukkan password"
          required={!editingUser}
          minLength={editingUser ? 0 : 6}
        />
      </div>
    </div>
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={resetForm}>
        Batal
      </Button>
      <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
        {editingUser ? 'Perbarui' : 'Tambah'} Pengguna
      </Button>
    </div>
  </form>
);

export default UserForm;