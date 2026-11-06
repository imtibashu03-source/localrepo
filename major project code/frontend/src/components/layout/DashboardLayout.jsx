import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';

const DashboardLayout = ({ adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFFFF' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: 240,
        padding: '32px',
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 20% 20%, rgba(30,58,138,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(0,212,255,0.04) 0%, transparent 60%)',
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
