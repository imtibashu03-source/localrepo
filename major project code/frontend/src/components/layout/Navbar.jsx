import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Shield, Menu, X, ChevronDown, LogOut,
  User, Bell, LayoutDashboard, Globe
} from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Security', href: '#security' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 24px',
        background: scrolled
          ? 'rgba(2, 8, 20, 0.95)'
          : 'rgba(2, 8, 20, 0.5)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.1)' : '1px solid transparent',
        transition: 'all 0.4s ease',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 40, height: 40, background: 'linear-gradient(135deg, #0EA5E9, #00D4FF)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,212,255,0.3)'
          }}>
            <Shield size={22} color="#020814" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              BhoomiRaksha
            </div>
            <div style={{ fontSize: '0.65rem', color: '#00D4FF', letterSpacing: '0.1em', fontWeight: 500 }}>
              GOV DIGITAL PLATFORM
            </div>
          </div>
        </Link>

        {/* Desktop nav links (landing only) */}
        {isLanding && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            className="hidden md:flex">
            {navLinks.map(link => (
              <a key={link.label} href={link.href} style={{
                padding: '8px 14px', borderRadius: 8, color: '#475569',
                fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s'
              }}
                onMouseEnter={e => { e.target.style.color = '#00D4FF'; e.target.style.background = 'rgba(0,212,255,0.06)'; }}
                onMouseLeave={e => { e.target.style.color = '#475569'; e.target.style.background = 'transparent'; }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, cursor: 'pointer', color: '#0F172A', transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: 28, height: 28, background: 'linear-gradient(135deg, #0EA5E9, #00D4FF)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#020814' }}>
                    {user.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.name}</span>
                <ChevronDown size={14} color="#334155" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute', right: 0, top: '110%', width: 220,
                      background: '#0D1F3C', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 14, padding: 8, boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                    }}
                  >
                    <div style={{ padding: '10px 12px 14px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#334155' }}>{user.email}</div>
                      <span className={`badge badge-${user.role === 'admin' ? 'medium' : 'safe'}`} style={{ marginTop: 6 }}>
                        {user.role}
                      </span>
                    </div>
                    <div style={{ padding: '8px 0' }}>
                      <Link
                        to={user.role === 'admin' ? '/admin' : '/dashboard'}
                        onClick={() => setProfileOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: '#475569', textDecoration: 'none', fontSize: '0.875rem', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      <Link
                        to="/blockchain"
                        onClick={() => setProfileOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: '#475569', textDecoration: 'none', fontSize: '0.875rem', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Globe size={15} /> Blockchain Explorer
                      </Link>
                      <button
                        onClick={() => { logout(); setProfileOpen(false); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: '#FF4757', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', width: '100%', textAlign: 'left', transition: 'all 0.2s', marginTop: 4 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,71,87,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ padding: '9px 20px', fontSize: '0.875rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '9px 20px', fontSize: '0.875rem' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
