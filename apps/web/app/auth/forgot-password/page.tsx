'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PasswordForm from '../../components/PasswordForm';

type Step = 'email' | 'otp' | 'password';

export default function ForgetPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();



  useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send verification code');
      }

      setStep('otp');
      setTimer(60);
      setCanResend(false);
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('Cannot connect to server. Check if backend is running and CORS is enabled.');
      } else {
        setError(err.message || 'Failed to send verification code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError(false);
    
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Check if all fields are filled
    if (index === 5 && value) {
      const otpCode = newOtp.join('');
      if (otpCode.length === 6) {
        verifyOtp(otpCode);
      }
    }
  };

  const verifyOtp = async (otpCode: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpCode }),
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid verification code');
      }

      setStep('password');
    } catch (err: any) {
      setOtpError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      verifyOtp(otpCode);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend code');
      }

      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setOtpError(false);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };



  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => setStep('email')}
          className="mb-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#D7656A] mb-4">Verification code</h2>
            <p className="text-gray-600">Enter OTP (one time password) send to {email}</p>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <div className="flex justify-center space-x-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => otpRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D7656A] ${
                    otpError ? 'border-red-500' : 'border-gray-600'
                  }`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digit && index > 0) {
                      otpRefs.current[index - 1]?.focus();
                    }
                  }}
                />
              ))}
            </div>
            {otpError && (
              <p className="text-red-500 text-sm text-center mb-4">Code doesn't match</p>
            )}
          </div>

          {/* Resend and Timer */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleResendOtp}
              disabled={!canResend || loading}
              className={`font-medium ${
                canResend ? 'text-[#D7656A] hover:underline' : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              Resend
            </button>
            <span className="text-gray-600">
              {timer > 0 ? `00:${timer.toString().padStart(2, '0')}` : '00:00'}
            </span>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyCode}
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-[#D7656A] text-white py-2 px-4 rounded-md hover:bg-[#c55a64] transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'password') {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => setStep('otp')}
          className="mb-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <PasswordForm
          mode="forgot"
          email={email}
          onSubmit={async (data) => {
            const response = await fetch('http://localhost:5000/auth/reset-password', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, newPassword: data.newPassword }),
              mode: 'cors',
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to update password');
            }

            router.push('/auth/login');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.push('/auth/login')}
        className="mb-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#D7656A] mb-4">Forgot Password?</h2>
          <p className="text-gray-600">Provide the Email linked with your account to reset your password.</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D7656A] focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D7656A] text-white py-2 px-4 rounded-md hover:bg-[#c55a64] transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Submit'}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/auth/login')}
            className="w-full border border-[#D7656A] bg-white text-black py-2 px-4 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}