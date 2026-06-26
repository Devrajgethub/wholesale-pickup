'use client';

import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect, useRef } from 'react';
import { Phone, User, Building, Loader2, ArrowRight, ShieldCheck, KeyRound, RotateCcw } from 'lucide-react';

type Step = 'details' | 'otp';

export default function LoginPage() {
  const { login } = useAuthStore();
  const [step, setStep] = useState<Step>('details');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isDemo, setIsDemo] = useState(false);
  const [smsFailed, setSmsFailed] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = async () => {
    setError('');
    if (mobile.length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError(data.error || 'Please wait before requesting a new OTP');
          setLoading(false);
          return;
        }
        const detail = data.detail ? ` (${data.detail})` : '';
        throw new Error((data.error || 'Failed to send OTP') + detail);
      }

      setOtpSent(true);
      setIsDemo(data.demo || false);
      setSmsFailed(data.smsFailed || false);
      setResendTimer(60);
      setStep('otp');
    } catch (e: any) {
      setError(e?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    const otpString = otp.join('');

    if (otpString.length < 4) {
      setError('Enter the complete 4-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: otpString, name, businessName }),
      });

      const data = await res.json();

      if (!res.ok) {
        const detail = data.detail ? ` (${data.detail})` : '';
        setError(data.error + detail);
        setLoading(false);
        return;
      }

      // Login successful
      if (!data.user) {
        setError('Login response invalid. Please try again.');
        setLoading(false);
        return;
      }

      login({
        id: data.user.id,
        name: data.user.name,
        mobile: data.user.mobile,
        businessName: data.user.businessName || '',
        isAdmin: data.user.isAdmin,
      });

      const { useNavStore } = await import('@/lib/store');
      useNavStore.getState().navigate('home');
    } catch (e: any) {
      console.error('[Login verify error]', e);
      setError(e?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 4) {
      setTimeout(() => handleVerifyOTP(), 300);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '']);
    setSmsFailed(false);
    setError('');
    // Re-send OTP directly instead of going back
    handleSendOTP();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0C831F] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏪</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {step === 'details' ? 'Welcome!' : 'Verify OTP'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === 'details' ? 'Login to place orders & track them' : `OTP sent to ${mobile}`}
          </p>
        </div>

        {/* Step 1: Details Form */}
        {step === 'details' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="login-name" className="text-sm font-medium">Full Name *</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="login-mobile" className="text-sm font-medium">Mobile Number *</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-mobile"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="pl-10"
                    required
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="login-business" className="text-sm font-medium">Business / Shop Name</Label>
                <div className="relative mt-1.5">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-business"
                    placeholder="Your shop name (optional)"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold h-12 rounded-xl"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send OTP <KeyRound className="h-4 w-4 ml-2" /></>}
              </Button>
            </form>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="h-7 w-7 text-[#0C831F]" />
              </div>
              <p className="text-sm text-gray-600">
                Enter the 4-digit OTP sent to<br />
                <span className="font-bold text-gray-900">+91 {mobile}</span>
              </p>
            </div>

            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-14 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-200 focus:border-[#0C831F] focus:ring-[#0C831F] transition-colors"
                  disabled={loading}
                />
              ))}
            </div>

            {isDemo && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-center">
                <p className="text-xs text-yellow-700 font-medium">Demo Mode: Your OTP is <span className="text-lg font-bold">1234</span></p>
              </div>
            )}

            {smsFailed && !isDemo && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 text-center">
                <p className="text-xs text-orange-700">SMS could not be sent. Please try Resend OTP.</p>
              </div>
            )}

            {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

            {/* Verify Button */}
            <Button
              onClick={handleVerifyOTP}
              className="w-full bg-[#0C831F] hover:bg-[#0a6e1a] text-white font-bold h-12 rounded-xl mb-3"
              disabled={loading || otp.some(d => !d)}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Verify OTP <ArrowRight className="h-4 w-4 ml-2" /></>}
            </Button>

            {/* Resend / Change Number */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => { setStep('details'); setOtp(['', '', '', '']); setError(''); }}
                className="text-sm text-[#0C831F] font-medium hover:underline"
              >
                Change Number
              </button>

              <button
                onClick={handleResend}
                disabled={resendTimer > 0}
                className="text-sm text-gray-500 font-medium hover:text-[#0C831F] disabled:text-gray-300 flex items-center gap-1"
              >
                {resendTimer > 0 ? (
                  <>Resend in {resendTimer}s</>
                ) : (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" /> Resend OTP
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}