import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Check } from 'lucide-react';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = pw => {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', '#FF4757', '#FFA726', '#FFEB3B', '#00E676'];
    return { score, label: labels[score], color: colors[score] };
  };

  const strength = passwordStrength(form.password);

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const data = await register(form.name, form.email, form.password);
      if (data.success) {
        toast.success('Account created successfully!');
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#FFFFFF', padding: '24px',
      backgroundImage: 'radial-gradient(ellipse at 70% 30%, rgba(30,58,138,0.12) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(0,212,255,0.06) 0%, transparent 60%)'
    }} className="bg-grid">
      <div style={{ position: 'absolute', top: 24, left: 24 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #0EA5E9, #00D4FF)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} color="#020814" />
          </div>
          <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>BhoomiRaksha</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 460 }}
      >
        <div className="glass" style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64, background: 'linear-gradient(135deg, #1E3A8A, #0EA5E9)',
              borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', boxShadow: '0 0 30px rgba(30,58,138,0.4)'
            }}>
              <User size={30} color="#0F172A" strokeWidth={2} />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Create Account
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#334155' }}>
              Register as a citizen user on BhoomiRaksha
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 10, marginBottom: 20 }}
            >
              <AlertCircle size={16} color="#FF4757" />
              <span style={{ fontSize: '0.85rem', color: '#FF4757' }}>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 8 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#334155" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" required className="input-field" style={{ paddingLeft: 42 }}
                  placeholder="Enter your full name"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 8 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#334155" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input type="email" required className="input-field" style={{ paddingLeft: 42 }}
                  placeholder="your@email.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#334155" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input type={showPw ? 'text' : 'password'} required className="input-field"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  placeholder="Create a strong password"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: strength.color, fontWeight: 600, marginTop: 4, display: 'block' }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 8 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#334155" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input type={showPw ? 'text' : 'password'} required className="input-field"
                  style={{ paddingLeft: 42, paddingRight: 42, borderColor: form.confirm && form.confirm !== form.password ? 'rgba(255,71,87,0.4)' : '' }}
                  placeholder="Confirm your password"
                  value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
                {form.confirm && form.confirm === form.password && (
                  <Check size={16} color="#00E676" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }} />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginTop: 4 }}>
              <input type="checkbox" required id="terms" style={{ marginTop: 2, accentColor: '#00D4FF' }} />
              <label htmlFor="terms" style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.5, cursor: 'pointer' }}>
                I agree to the Terms of Service and understand this is a government digital platform
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? (
                <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating Account...</>
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            <span style={{ fontSize: '0.875rem', color: '#334155' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#00D4FF', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
