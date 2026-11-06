import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Shield, LayoutDashboard, FileText, Globe, AlertTriangle,
  Users, Settings, Activity, LogOut, ChevronRight
} from 'lucide-react';

const userNav = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: FileText, label: 'Land Records', to: '/records' },
  { icon: Globe, label: 'Blockchain Explorer', to: '/blockchain' },
  { icon: AlertTriangle, label: 'Threat Intelligence', to: '/threats' },
];

const adminNav = [
  { icon: LayoutDashboard, label: 'Admin Dashboard', to: '/admin' },
  { icon: FileText, label: 'Land Records', to: '/records' },
  { icon: Globe, label: 'Blockchain Explorer', to: '/blockchain' },
  { icon: AlertTriangle, label: 'Threat Intelligence', to: '/threats' },
  { icon: Users, label: 'User Management', to: '/admin/users' },
  { icon: Activity, label: 'System Logs', to: '/admin/logs' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navItems = user?.role === 'admin' ? adminNav : userNav;

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        width: 240,
        minHeight: '100vh',
        background: 'rgba(13, 31, 60, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 12px',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: '0 4px', marginBottom: 32 }}>
        <div style={{
          width: 38, height: 38, background: 'linear-gradient(135deg, #0EA5E9, #00D4FF)',
          borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(0,212,255,0.3)', flexShrink: 0
        }}>
          <Shield size={20} color="#020814" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>BhoomiRaksha</div>
          <div style={{ fontSize: '0.6rem', color: '#00D4FF', letterSpacing: '0.08em' }}>GOV PLATFORM</div>
        </div>
      </Link>

      {/* User info */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px',
        background: 'rgba(0,0,0,0.05)', borderRadius: 12,
        border: '1px solid rgba(0,0,0,0.1)', marginBottom: 24
      }}>
        <div style={{
          width: 36, height: 36, background: 'linear-gradient(135deg, #0EA5E9, #00D4FF)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#020814' }}>
            {user?.name?.[0]?.toUpperCase()}
          </span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
          <span className={`badge badge-${user?.role === 'admin' ? 'medium' : 'active'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Nav section label */}
      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#334155', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0 4px', marginBottom: 8 }}>
        Navigation
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: 16, marginTop: 16 }}>
        <button
          onClick={logout}
          className="nav-item"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#FF4757', fontSize: '0.9rem' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,71,87,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
