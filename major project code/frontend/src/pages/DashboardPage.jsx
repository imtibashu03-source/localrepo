import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordsAPI, threatAPI, blockchainAPI } from '../services/api';
import {
  FileText, Shield, AlertTriangle, Activity, Bell, Eye,
  TrendingUp, ChevronRight, Clock, MapPin, Hash, CheckCircle2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0D1F3C', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ fontSize: '0.75rem', color: '#334155', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ fontSize: '0.85rem', color: p.color, fontWeight: 600 }}>{p.value}</p>
      ))}
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [chainStats, setChainStats] = useState(null);
  const [threatStats, setThreatStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rRes, aRes, bRes, tRes] = await Promise.allSettled([
        recordsAPI.getAll({ limit: 5 }),
        threatAPI.getAlerts(),
        blockchainAPI.getStats(),
        threatAPI.getStats(),
      ]);
      if (rRes.status === 'fulfilled') setRecords(rRes.value.data?.data?.records || []);
      if (aRes.status === 'fulfilled') setAlerts(aRes.value.data?.data?.slice(0,5) || []);
      if (bRes.status === 'fulfilled') setChainStats(bRes.value.data?.data);
      if (tRes.status === 'fulfilled') setThreatStats(tRes.value.data?.data);
    } catch {}
    finally { setLoading(false); }
  };

  // Build mock activity chart (last 7 days)
  const activityData = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      records: Math.floor(Math.random() * 8) + 1,
      threats: Math.floor(Math.random() * 4),
    };
  });

  const stats = [
    { label: 'My Land Records', value: records.length, icon: FileText, color: '#00D4FF', link: '/records' },
    { label: 'Active Alerts', value: alerts.filter(a => !a.isResolved).length, icon: AlertTriangle, color: '#FF4757', link: '/threats' },
    { label: 'Blockchain Blocks', value: chainStats?.totalBlocks || 0, icon: Shield, color: '#818CF8', link: '/blockchain' },
    { label: 'Threat Score', value: threatStats ? `${Math.round(threatStats.avgScore || 0)}%` : '0%', icon: Activity, color: '#00E676', link: '/threats' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #0EA5E9, #00D4FF)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}>
            <TrendingUp size={22} color="#020814" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#334155' }}>Here's your land records overview</p>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
          >
            <Link to={stat.link} style={{ textDecoration: 'none' }}>
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 42, height: 42, background: `${stat.color}18`, border: `1px solid ${stat.color}30`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <stat.icon size={20} color={stat.color} />
                  </div>
                  <ChevronRight size={16} color="#334155" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#334155', marginTop: 6 }}>{stat.label}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts + Alerts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Activity chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="chart-container"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Weekly Activity</h3>
              <p style={{ fontSize: '0.8rem', color: '#334155', marginTop: 2 }}>Records added vs threats detected</p>
            </div>
            <span className="badge badge-active">7 Days</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="records" stroke="#00D4FF" strokeWidth={2} dot={{ fill: '#00D4FF', r: 4 }} name="Records" />
              <Line type="monotone" dataKey="threats" stroke="#FF4757" strokeWidth={2} dot={{ fill: '#FF4757', r: 4 }} name="Threats" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Active Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass"
          style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Security Alerts</h3>
            <Bell size={18} color="#FFA726" />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <CheckCircle2 size={32} color="#00E676" />
                <span style={{ fontSize: '0.85rem', color: '#334155', textAlign: 'center' }}>No active alerts. System is secure.</span>
              </div>
            ) : (
              alerts.slice(0, 4).map((alert, i) => (
                <div key={alert._id || i} style={{
                  padding: '10px 12px', borderRadius: 10,
                  background: alert.type === 'critical' ? 'rgba(255,71,87,0.08)' : 'rgba(255,167,38,0.08)',
                  border: `1px solid ${alert.type === 'critical' ? 'rgba(255,71,87,0.2)' : 'rgba(255,167,38,0.2)'}`,
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: alert.type === 'critical' ? '#FF4757' : '#FFA726', marginBottom: 3 }}>
                    {alert.title || 'Security Alert'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#334155' }}>
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
          <Link to="/threats" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00D4FF', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            View All <ChevronRight size={14} />
          </Link>
        </motion.div>
      </div>

      {/* Recent Records */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass"
        style={{ padding: '24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Recent Land Records</h3>
          <Link to="/records" className="btn-secondary" style={{ padding: '7px 14px', fontSize: '0.8rem', gap: 6 }}>
            View All <ChevronRight size={14} />
          </Link>
        </div>

        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#334155' }}>
            <FileText size={40} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: '0.9rem' }}>No land records yet.</p>
            <Link to="/records" className="btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>
              Add First Record
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Owner</th>
                  <th>Survey No.</th>
                  <th>Location</th>
                  <th>Area</th>
                  <th>Blockchain Hash</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r._id || i}>
                    <td style={{ fontWeight: 600, color: '#0F172A' }}>{r.ownerName}</td>
                    <td><span className="mono" style={{ color: '#818CF8' }}>{r.surveyNumber}</span></td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} color="#334155" />{r.district}, {r.state}
                      </span>
                    </td>
                    <td>{r.area} {r.areaUnit}</td>
                    <td>
                      <span className="hash-display">{r.blockchainHash ? r.blockchainHash.slice(0, 14) + '...' : 'Pending'}</span>
                    </td>
                    <td><span className={`badge badge-${r.status || 'active'}`}>{r.status || 'active'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardPage;
