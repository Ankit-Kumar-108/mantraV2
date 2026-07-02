'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, UserPlus } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  // Inputs state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Theme Vibe State
  const [theme, setTheme] = useState<'sonic-deep' | 'electric-pulse' | 'pure-minimalist' | 'retro-futurist'>('sonic-deep');

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('aura-theme') as any;
    if (savedTheme && ['sonic-deep', 'electric-pulse', 'pure-minimalist', 'retro-futurist'].includes(savedTheme)) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  // Update theme state and persist
  const handleThemeChange = (newTheme: 'sonic-deep' | 'electric-pulse' | 'pure-minimalist' | 'retro-futurist') => {
    setTheme(newTheme);
    localStorage.setItem('aura-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          agreeTerms,
        }),
      })

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create account');
      }
      const loginRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/'
      })

      if (!loginRes.ok){
        setError("Creation Successfull But Login failed, PLease Login Manually")
      }else {
        window.location.href = "/"
      }  
    } catch (error: any) {
      setError(error.message || "An error occured during Sign Up");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    signIn('google', {callbackUrl: "/"})
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-y-auto bg-[#0a0c0c] select-none">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--accent-color)]/10 blur-[120px] pointer-events-none transition-all duration-700" />

      {/* Main Card */}
      <div className="w-full max-w-md glass-panel p-8 rounded-[16px] border border-[var(--glass-border)] shadow-2xl relative z-10 animate-fade-in flex flex-col justify-between">
        
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="relative w-9 h-9 rounded-[8px] bg-gradient-to-br from-[var(--accent-color)] to-purple-600 flex items-center justify-center shadow-lg border border-white/10">
              <span className="text-black font-black text-xl tracking-tighter">M</span>
              <div className="absolute inset-0 rounded-[8px] border-glow pointer-events-none" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">Mantra</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-glow bg-gradient-to-r from-white to-[var(--text-secondary)] bg-clip-text text-transparent">
            Create Your Account
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Join AURA to start listening and building collections.
          </p>
        </div>

        {/* Error/Success Display */}
        {error && (
          <div className="mb-4 p-3 text-sm rounded-[8px] border border-red-500/50 bg-red-500/10 text-red-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2.5 pl-11 pr-4 text-sm placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all shadow-md focus:shadow-[0_0_15px_var(--accent-glow)]"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2.5 pl-11 pr-4 text-sm placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all shadow-md focus:shadow-[0_0_15px_var(--accent-glow)]"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2.5 pl-11 pr-11 text-sm placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all shadow-md focus:shadow-[0_0_15px_var(--accent-glow)]"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Accept Terms */}
          <div className="flex items-center pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-secondary)] select-none">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded border-[var(--glass-border)] bg-white/5 checked:bg-[var(--accent-color)] focus:ring-0 w-4 h-4 cursor-pointer accent-[var(--accent-color)]"
              />
              I agree to the Terms of Service & Privacy Policy
            </label>
          </div>

          {/* Primary signup button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-black font-semibold text-sm py-2.5 rounded-[8px] active-scale transition-all border-glow shadow-lg mt-3 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-black" />
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-3 text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Or sign up with</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignUp}
          className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] text-white font-medium text-sm py-2.5 rounded-[8px] active-scale transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google Accounts
        </button>

        {/* Redirect to Login */}
        <p className="text-center text-xs text-[var(--text-secondary)] mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--accent-color)] font-bold hover:underline">
            Sign In
          </Link>
        </p>

        {/* Theme Vibe Sync Picker (Glow dots) */}
        <div className="mt-6 border-t border-white/5 pt-4 flex flex-col items-center gap-2">
          <span className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[var(--accent-color)]" />
            Switch AURA Vibe
          </span>
          <div className="flex items-center gap-3">
            {[
              { id: 'sonic-deep', color: 'bg-[#1db954]', title: 'Sonic Deep' },
              { id: 'electric-pulse', color: 'bg-[#ff007f]', title: 'Electric Pulse' },
              { id: 'pure-minimalist', color: 'bg-[#f5f5f7]', title: 'Pure Minimalist' },
              { id: 'retro-futurist', color: 'bg-[#00ffff]', title: 'Retro-Futurist' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => handleThemeChange(v.id as any)}
                title={v.title}
                className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-all hover:scale-125 ${v.color} ${
                  theme === v.id ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110 shadow-[0_0_10px_currentColor]' : 'opacity-65'
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
