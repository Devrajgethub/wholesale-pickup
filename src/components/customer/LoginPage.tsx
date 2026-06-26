'use client';

import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Phone, User, Building, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuthStore();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || mobile.length < 10) {
      setError('Name and valid mobile number required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, businessName }),
      });

      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      login({
        id: data.id,
        name: data.name,
        mobile: data.mobile,
        businessName: data.businessName || '',
        isAdmin: data.isAdmin,
      });

      const navStore = await import('@/lib/store').then(m => m.useNavStore.getState());
      navStore.navigate('home');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0C831F] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏪</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome!</h1>
          <p className="text-sm text-gray-500 mt-1">Login to place orders & track them</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="login-name" className="text-sm font-medium">Full Name *</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="login-name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div>
              <Label htmlFor="login-mobile" className="text-sm font-medium">Mobile Number *</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="login-mobile" type="tel" placeholder="10-digit mobile number" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} className="pl-10" required />
              </div>
            </div>
            <div>
              <Label htmlFor="login-business" className="text-sm font-medium">Business / Shop Name</Label>
              <div className="relative mt-1.5">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="login-business" placeholder="Your shop name (optional)" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="pl-10" />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold h-12 rounded-xl" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4 ml-2" /></>}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}