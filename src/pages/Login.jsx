import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const Login = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Login dengan username dan password (query ke tabel users)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Query ke tabel users
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', formData.username)
      .eq('password', formData.password) // Untuk demo, plaintext!
      .single();

    if (error || !data) {
      toast({
        title: "Login Gagal",
        description: "Username atau password salah",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Login sukses
    toast({
      title: "Login Berhasil!",
      description: `Selamat datang, ${data.nama || data.username}`,
    });

    // Simpan user ke localStorage/sessionStorage (opsional)
    localStorage.setItem('loggedInUser', JSON.stringify(data));

    // Panggil onLogin jika ada
    if (typeof onLogin === 'function') onLogin(data);

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-sky-200">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4"
            >
              <Wallet className="h-8 w-8 text-sky-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-sky-900 mb-2">Kas RT 06 Online</h1>
            <p className="text-sky-600">Transparansi Keuangan RT Lebih Mudah</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sky-900">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="border-sky-200 focus:border-sky-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sky-900">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="border-sky-200 focus:border-sky-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sky-600 hover:text-sky-800"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Masuk...' : 'Masuk'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;