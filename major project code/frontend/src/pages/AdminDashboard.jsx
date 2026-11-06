import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI, threatAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, FileText, Shield, Activity, AlertTriangle,
  TrendingUp, RefreshCw, UserCheck, UserX, Trash2, Clock, Eye,
  BarChart2, Database, CheckCircle2, Search, X
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0D1F3C', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ fontSize: '0.75rem', color: '#334155', marginBottom: 4 }}>{label}</p>
      {payload.map(p => <p key={p.dataKey} style={{ fontSize: '0.85rem', color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

const PIE_COLORS = ['#00E676', '#FFEB3B', '#FFA726', '#FF4757'];

/* ── Users Sub-page ── */
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await adminAPI.getUsers();
      setUsers(data.data?.users || []);
    } finally { setLoading(false); }
  };

  const toggleActive = async (user) => {
    try {
      await adminAPI.updateUser(user._id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch { toast.error('Failed to delete user'); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>All Users ({users.length})</h3>
        <div style={{ position: 'relative', width: 280 }}>
          <Search size={14} color="#334155" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" className="input-field" style={{ paddingLeft: 36, paddingRight: 36, fontSize: '0.85rem' }}
            placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: 0 }}><X size={12} /></button>}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Login Attempts</th>
              <th>Joined</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <tr key={user._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #1E3A8A, #0EA5E9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', flexShrink: 0 }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: '0.85rem' }}>{user.email}</td>
                <td><span className={`badge badge-${user.role === 'admin' ? 'medium' : 'active'}`}>{user.role}</span></td>
                <td><span className={`badge badge-${user.isActive ? 'active' : 'inactive'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <span style={{ color: user.loginAttempts >= 3 ? '#FF4757' : '#334155', fontWeight: user.loginAttempts >= 3 ? 700 : 400, fontSize: '0.85rem' }}>
                    {user.loginAttempts || 0}/5
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem', color: '#334155' }}>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button onClick={() => toggleActive(user)} title={user.isActive ? 'Deactivate' : 'Activate'}
                      style={{ width: 30, height: 30, background: user.isActive ? 'rgba(255,167,38,0.1)' : 'rgba(0,230,118,0.1)', border: `1px solid ${user.isActive ? 'rgba(255,167,38,0.3)' : 'rgba(0,230,118,0.3)'}`, borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: user.isActive ? '#FFA726' : '#00E676' }}>
                      {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                    </button>
                    <button onClick={() => deleteUser(user._id)} title="Delete"
                      style={{ width: 30, height: 30, background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF4757' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ── Logs Sub-page ── */
const LogsTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getLogs()
      .then(r => setLogs(r.data?.data || []))
      .catch(() => toast.error('Failed to load logs'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>System Activity Logs</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr><th>Action</th><th>Record</th><th>User</th><th>Block Hash</th><th>Timestamp</th></tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#334155' }}>No logs yet</td></tr>
            ) : logs.map((log, i) => (
              <tr key={log._id || i}>
                <td><span className={`badge badge-${log.type === 'delete' ? 'critical' : log.type === 'update' ? 'warning' : 'active'}`}>{log.type?.toUpperCase()}</span></td>
                <td style={{ fontSize: '0.8rem' }}>{log.recordId?.surveyNumber || 'N/A'}</td>
                <td style={{ fontSize: '0.85rem', color: '#475569' }}>{log.userId?.name || 'System'}</td>
                <td><span className="hash-display" style={{ fontSize: '0.65rem' }}>{log.blockHash ? log.blockHash.slice(0, 14) + '...' : 'N/A'}</span></td>
                <td style={{ fontSize: '0.75rem', color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} /> {new Date(log.timestamp).toLocaleString('en-IN')}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ── Admin Main ── */
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const { data } = await adminAPI.getStats();
      setStats(data.data);
    } catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const threatDist = stats?.threatDistribution
    ? Object.entries(stats.threatDistribution).map(([name, value]) => ({ name: name.toUpperCase(), value }))
    : [{ name: 'SAFE', value: 60 }, { name: 'LOW', value: 25 }, { name: 'MEDIUM', value: 10 }, { name: 'HIGH', value: 5 }];

  const activityData = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      records: Math.floor(Math.random() * 12) + 1,
      users: Math.floor(Math.random() * 5),
      threats: Math.floor(Math.random() * 6),
    };
  });

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, color: '#00D4FF', icon: Users },
    { label: 'Land Records', value: stats?.totalRecords ?? 0, color: '#818CF8', icon: FileText },
    { label: 'Blockchain Blocks', value: stats?.totalBlocks ?? 0, color: '#00E676', icon: Database },
    { label: 'Total Transactions', value: stats?.totalTransactions ?? 0, color: '#FFA726', icon: Activity },
    { label: 'Active Alerts', value: stats?.activeAlerts ?? 0, color: '#FF4757', icon: AlertTriangle },
    { label: 'Threat Logs', value: stats?.totalThreatLogs ?? 0, color: '#C084FC', icon: Shield },
  ];

  const tabs = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'logs', label: 'System Logs', icon: Activity },
  ];

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #818CF8, #C084FC)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LayoutDashboard size={22} color="#0F172A" strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Admin Dashboard</h1>
              <p style={{ fontSize: '0.8rem', color: '#334155', marginTop: 2 }}>System oversight & management</p>
            </div>
          </div>
          <button onClick={fetchStats} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, cursor: 'pointer', color: '#475569', fontSize: '0.85rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
              background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid #00D4FF' : '2px solid transparent',
              cursor: 'pointer', color: tab === t.key ? '#00D4FF' : '#334155',
              fontSize: '0.875rem', fontWeight: tab === t.key ? 700 : 500, transition: 'all 0.2s',
              marginBottom: -1
            }}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" style={{ width: 48, height: 48 }} /></div>
      ) : (
        <>
          {tab === 'overview' && (
            <div>
              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
                {statCards.map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="stat-card">
                    <div style={{ width: 38, height: 38, background: `${s.color}18`, border: `1px solid ${s.color}30`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                      <s.icon size={18} color={s.color} />
                    </div>
                    <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: 6 }}>{s.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="chart-container">
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>System Activity — 7 Days</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={activityData} barSize={10}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="day" tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="records" fill="#00D4FF" name="Records" radius={[4,4,0,0]} />
                      <Bar dataKey="users" fill="#818CF8" name="New Users" radius={[4,4,0,0]} />
                      <Bar dataKey="threats" fill="#FF4757" name="Threats" radius={[4,4,0,0]} />
                      <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#334155', fontSize: '0.75rem' }}>{v}</span>} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="chart-container">
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Threat Level Distribution</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={threatDist} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={3}>
                        {threatDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#334155', fontSize: '0.75rem' }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Recent activity */}
              {stats?.recentActivity?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass" style={{ padding: '24px', overflowX: 'auto' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Recent Activity</h3>
                  <table className="data-table">
                    <thead>
                      <tr><th>Action</th><th>Record</th><th>User</th><th>Time</th></tr>
                    </thead>
                    <tbody>
                      {stats.recentActivity.slice(0, 8).map((act, i) => (
                        <tr key={act._id || i}>
                          <td><span className={`badge badge-${act.type === 'delete' ? 'critical' : act.type === 'update' ? 'warning' : 'active'}`}>{act.type?.toUpperCase()}</span></td>
                          <td style={{ fontSize: '0.85rem' }}>{act.recordId?.surveyNumber || 'N/A'}</td>
                          <td style={{ fontSize: '0.85rem', color: '#475569' }}>{act.userId?.name || 'System'}</td>
                          <td style={{ fontSize: '0.75rem', color: '#334155' }}>{new Date(act.timestamp).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </div>
          )}

          {tab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: '24px', overflowX: 'auto' }}>
              <UsersTab />
            </motion.div>
          )}

          {tab === 'logs' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: '24px', overflowX: 'auto' }}>
              <LogsTab />
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
