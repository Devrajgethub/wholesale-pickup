'use client';

import { useAuthStore, useNavStore, useLanguageStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Lock, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const { adminLogin } = useAuthStore();
  const { navigate } = useNavStore();
  const { t } = useLanguageStore();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError(t('adminLogin.errorPassword'));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('adminLogin.loginFailed'));
        setLoading(false);
        return;
      }

      adminLogin('Admin');
      navigate('admin-dashboard');
    } catch {
      setError(t('adminLogin.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0C831F] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">{t('adminLogin.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('adminLogin.subtitle')}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="admin-password" className="text-sm font-medium">{t('adminLogin.password')}</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="admin-password"
                  type="password"
                  placeholder={t('adminLogin.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold h-12 rounded-xl"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{t('adminLogin.login')} <Lock className="h-4 w-4 ml-2" /></>}
            </Button>
          </form>
        </div>

        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0C831F] mt-6 mx-auto transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('adminLogin.backToStore')}
        </button>
      </div>
    </div>
  );
}
