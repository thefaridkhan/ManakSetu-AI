import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { ShieldCheck, Mail, Lock, User, Building2, Loader2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'CONSUMER' | 'INDUSTRY_USER'>('CONSUMER');
  const [organization, setOrganization] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        email,
        password,
        name,
        role,
        organization: organization || undefined
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F2C59] to-[#1E40AF] text-white flex items-center justify-center mx-auto shadow-md mb-3">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-2xl font-black text-[#0F2C59]">Create BIS Account</h2>
          <p className="text-xs text-slate-500 mt-1">Register as a Citizen or Manufacturing Representative</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs rounded-r-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Rajesh Sharma"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F2C59]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rajesh@company.in"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F2C59]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F2C59]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Category</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('CONSUMER')}
                className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                  role === 'CONSUMER'
                    ? 'bg-[#0F2C59] text-white border-[#0F2C59]'
                    : 'bg-slate-50 text-slate-700 border-slate-300'
                }`}
              >
                Consumer / Citizen
              </button>
              <button
                type="button"
                onClick={() => setRole('INDUSTRY_USER')}
                className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                  role === 'INDUSTRY_USER'
                    ? 'bg-[#0F2C59] text-white border-[#0F2C59]'
                    : 'bg-slate-50 text-slate-700 border-slate-300'
                }`}
              >
                Manufacturer / Lab
              </button>
            </div>
          </div>

          {role === 'INDUSTRY_USER' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Enterprise / Organization</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Apex Plastics & Cable Manufacturing Ltd."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#0F2C59]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F2C59] hover:bg-[#1E40AF] disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          <span>Already registered? </span>
          <Link to="/login" className="font-bold text-[#0F2C59] hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
