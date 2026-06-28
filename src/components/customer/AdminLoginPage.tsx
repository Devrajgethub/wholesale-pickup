'use client';

import { useAuthStore, useNavStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Lock, Loader2, Package, ShieldCheck, Phone, User, ArrowRight } from 'lucide-react';

const ADMIN_PHONES = ['7908117295', '9682022501'];

export default function LoginPage() {
  const { login, adminLogin } = useAuthStore();
  const { navigate } = useNavStore();

  // Step 1: Name + Phone
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [stepError, setStepError] = useState('');
  const [stepLoading, setStepLoading] = useState(false);

  // Step 2: Admin password (shown only for admin phone)
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const isStep2 = mobile.length === 10 && ADMIN_PHONES.includes(mobile);

  // Step 1: Continue button
  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setStepError('');

    if (!name.trim()) { setStepError('Please enter your name'); return; }
    if (mobile.length < 10) { setStepError('Please enter valid 10-digit mobile number'); return; }

    // If admin phone, show step 2 (password)
    if (ADMIN_PHONES.includes(mobile)) {
      return; // Step 2 will show automatically via isStep2
    }

    // Normal customer → go to home
    setStepLoading(true);
    login(name.trim(), mobile, false);
    navigate('home');
    setStepLoading(false);
  };

  // Step 2: Admin login with password
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!password) { setPasswordError('Please enter the admin password'); return; }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || 'Incorrect password');
        setPasswordLoading(false);
        return;
      }

      adminLogin(name.trim());
      navigate('admin-dashboard');
    } catch {
      setPasswordError('Something went wrong');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Skip → go as normal customer
  const handleSkip = () => {
    login(name.trim(), mobile, false);
    navigate('home');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0C831F] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Mitra Bros Mart</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your details to continue</p>
        </div>

        {/* Step 1: Name + Phone */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleContinue} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <Label htmlFor="mobile" className="text-sm font-medium">Mobile Number</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {stepError && <p className="text-sm text-red-500">{stepError}</p>}

            {/* For non-admin: Continue button goes to home */}
            {mobile.length === 10 && !ADMIN_PHONES.includes(mobile) ? (
              <Button
                type="submit"
                className="w-full bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold h-12 rounded-xl"
                disabled={stepLoading}
              >
                {stepLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            ) : !isStep2 ? (
              <Button
                type="submit"
                className="w-full bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold h-12 rounded-xl"
                disabled={stepLoading || mobile.length < 10}
              >
                {stepLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            ) : null}
          </form>
        </div>

        {/* Step 2: Admin Password (only when admin phone is entered) */}
        {isStep2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mt-4 border-2 border-green-100">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-[#0C831F]" />
              <p className="text-sm font-bold text-[#0C831F]">Admin Access Detected</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div>
                <Label htmlFor="admin-password" className="text-sm font-medium">Admin Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                </div>
              </div>

              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 rounded-xl font-medium"
                  onClick={handleSkip}
                >
                  Skip
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold h-12 rounded-xl"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Login <Lock className="h-4 w-4 ml-1" /></>}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}