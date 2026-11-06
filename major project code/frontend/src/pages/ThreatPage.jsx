import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { threatAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Brain, AlertTriangle, Shield, Activity, Zap, RefreshCw,
  Clock, CheckCircle2, TrendingUp, BarChart2, Info
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const THREAT_COLORS = { safe: '#00E676', low: '#FFEB3B', medium: '#FFA726', high: '#FF4757' };
const PIE_COLORS = ['#00E676', '#FFEB3B', '#FFA726', '#FF4757'];

const ThreatGauge = ({ score }) => {
  const angle = (score / 100) * 180 - 90;
  const color = score <= 25 ? '#00E676' : score <= 50 ? '#FFEB3B' : score <= 75 ? '#FFA726' : '#FF4757';
  const level = score <= 25 ? 'SAFE' : score <= 50 ? 'LOW RISK' : score <= 75 ? 'MEDIUM RISK' : 'HIGH RISK';

  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 200 120" style={{ width: 200, height: 120 }}>
        {/* Track */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" strokeLinecap="round" />
        {/* Safe zone */}
        <path d="M 20 100 A 80 80 0 0 1 60 39" fill="none" stroke="rgba(0,230,118,0.3)" strokeWidth="12" strokeLinecap="round" />
        {/* Low zone */}
        <path d="M 60 39 A 80 80 0 0 1 100 24" fill="none" stroke="rgba(255,235,59,0.3)" strokeWidth="12" strokeLinecap="round" />
        {/* Med zone */}
        <path d="M 100 24 A 80 80 0 0 1 140 39" fill="none" stroke="rgba(255,167,38,0.3)" strokeWidth="12" strokeLinecap="round" />
        {/* High zone */}
        <path d="M 140 39 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,71,87,0.3)" strokeWidth="12" strokeLinecap="round" />
        {/* Needle */}
        <motion.line
          x1="100" y1="100" x2="100" y2="30"
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
          style={{ transformOrigin: '100px 100px' }}
          animate={{ rotate: angle }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        />
        <circle cx="100" cy="100" r="6" fill={color} />
        {/* Score */}
        <text x="100" y="90" textAnchor="middle" fill="#0F172A" fontSize="18" fontWeight="800" fontFamily="Inter">{score}</text>
        <text x="100" y="108" textAnchor="middle" fill="#334155" fontSize="9" fontFamily="Inter">THREAT SCORE</text>
      </svg>
      <div style={{ marginTop: 8 }}>
        <span style={{ fontSize: '1rem', fontWeight: 800, color, letterSpacing: '0.05em' }}>{level}</span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0D1F3C', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ fontSize: '0.75rem', color: '#334155', marginBottom: 4 }}>{label}</p>
      {payload.map(p => <p key={p.dataKey} style={{ fontSize: '0.85rem', color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

const ThreatPage = () => {
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [simFeatures, setSimFeatures] = useState({
    failedLogins: 0, accessFrequency: 10, ipMismatch: 0,
    modificationAttempts: 0, offHoursAccess: 0, geoAnomalies: 0,
    unusualPatterns: 0, sessionDuration: 30
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [lRes, aRes, sRes] = await Promise.allSettled([
        threatAPI.getLogs({ limit: 20 }),
        threatAPI.getAlerts(),
        threatAPI.getStats(),
      ]);
      if (lRes.status === 'fulfilled') setLogs(lRes.value.data?.data?.logs || []);
      if (aRes.status === 'fulfilled') setAlerts(aRes.value.data?.data || []);
      if (sRes.status === 'fulfilled') setStats(sRes.value.data?.data);
    } finally { setLoading(false); }
  };

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const { data } = await threatAPI.predict(simFeatures);
      if (data.success) {
        setLatestPrediction(data.data);
        toast.success('Threat analysis complete!');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed');
    } finally { setPredicting(false); }
  };

  const handleResolve = async (id) => {
    try {
      await threatAPI.resolveAlert(id);
      toast.success('Alert resolved');
      fetchData();
    } catch { toast.error('Failed to resolve'); }
  };

  // Build chart data from stats
  const trendData = stats?.trend || [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), count: Math.floor(Math.random() * 5) };
  });

  const distData = stats?.distribution
    ? Object.entries(stats.distribution).map(([name, value]) => ({ name: name.toUpperCase(), value }))
    : [{ name: 'SAFE', value: 60 }, { name: 'LOW', value: 25 }, { name: 'MEDIUM', value: 12 }, { name: 'HIGH', value: 3 }];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #FF4757, #FFA726)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={22} color="#0F172A" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              AI Threat Intelligence
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#334155', marginTop: 2 }}>
              Machine Learning powered cyber threat prediction & analysis
            </p>
          </div>
        </div>
      </motion.div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Threat Logs', value: stats?.totalLogs || logs.length, color: '#00D4FF', icon: Activity },
          { label: 'Active Alerts', value: alerts.filter(a => !a.isResolved).length, color: '#FF4757', icon: AlertTriangle },
          { label: 'Avg Threat Score', value: `${Math.round(stats?.avgScore || 0)}%`, color: '#FFA726', icon: TrendingUp },
          { label: 'High Risk Events', value: stats?.distribution?.high || 0, color: '#FF4757', icon: Zap },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card">
            <div style={{ width: 38, height: 38, background: `${s.color}18`, border: `1px solid ${s.color}30`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: 6 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Simulator + Gauge */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Feature simulator */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>AI Threat Simulator</h3>
              <p style={{ fontSize: '0.78rem', color: '#334155', marginTop: 3 }}>Adjust behavioral features and run prediction</p>
            </div>
            <button onClick={handlePredict} disabled={predicting} className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.85rem' }}>
              {predicting
                ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Analyzing...</>
                : <><Zap size={15} /> Run AI Prediction</>
              }
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { key: 'failedLogins', label: 'Failed Logins', min: 0, max: 10, step: 1, unit: '' },
              { key: 'accessFrequency', label: 'Access Frequency', min: 0, max: 100, step: 1, unit: '/hr' },
              { key: 'modificationAttempts', label: 'Modification Attempts', min: 0, max: 10, step: 1, unit: '' },
              { key: 'sessionDuration', label: 'Session Duration', min: 0, max: 120, step: 5, unit: 'min' },
            ].map(field => (
              <div key={field.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>{field.label}</label>
                  <span className="mono" style={{ fontSize: '0.75rem', color: '#00D4FF', fontWeight: 600 }}>
                    {simFeatures[field.key]}{field.unit}
                  </span>
                </div>
                <input type="range" min={field.min} max={field.max} step={field.step}
                  value={simFeatures[field.key]}
                  onChange={e => setSimFeatures({ ...simFeatures, [field.key]: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#00D4FF', cursor: 'pointer' }}
                />
              </div>
            ))}

            {/* Toggles */}
            {[
              { key: 'ipMismatch', label: 'IP Mismatch' },
              { key: 'offHoursAccess', label: 'Off-Hours Access' },
              { key: 'geoAnomalies', label: 'Geographic Anomaly' },
              { key: 'unusualPatterns', label: 'Unusual Patterns' },
            ].map(field => (
              <div key={field.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: `1px solid ${simFeatures[field.key] ? 'rgba(255,71,87,0.3)' : 'rgba(0,0,0,0.1)'}` }}>
                <label style={{ fontSize: '0.78rem', color: '#475569', cursor: 'pointer' }}>{field.label}</label>
                <div
                  onClick={() => setSimFeatures({ ...simFeatures, [field.key]: simFeatures[field.key] ? 0 : 1 })}
                  style={{
                    width: 36, height: 20, borderRadius: 10, cursor: 'pointer', transition: 'all 0.25s',
                    background: simFeatures[field.key] ? '#FF4757' : 'rgba(255,255,255,0.1)',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 3, transition: 'all 0.25s',
                    left: simFeatures[field.key] ? 18 : 3
                  }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Gauge + Result */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 20, alignSelf: 'flex-start' }}>
            Threat Meter
          </h3>

          <ThreatGauge score={latestPrediction?.prediction?.threatScore ?? 0} />

          {latestPrediction && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ width: '100%', marginTop: 16 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Confidence', value: `${Math.round(latestPrediction.prediction?.confidence || 0)}%`, color: '#818CF8' },
                  { label: 'RF Prediction', value: latestPrediction.prediction?.rfPrediction?.toUpperCase(), color: '#00D4FF' },
                  { label: 'DT Prediction', value: latestPrediction.prediction?.dtPrediction?.toUpperCase(), color: '#FFA726' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.75rem', color: '#334155' }}>{item.label}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(255,167,38,0.06)', border: '1px solid rgba(255,167,38,0.2)', borderRadius: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Info size={14} color="#FFA726" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: '0.75rem', color: '#FFA726', lineHeight: 1.6 }}>
                    {latestPrediction.prediction?.recommendation}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="chart-container">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Threat Events — 7 Day Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4757" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF4757" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#FF4757" fill="url(#threatGrad)" strokeWidth={2} name="Threats" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="chart-container">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>Threat Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={distData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {distData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ color: '#334155', fontSize: '0.75rem' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Alerts + Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {/* Alerts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Security Alerts</h3>
            <span className="badge badge-critical">{alerts.filter(a => !a.isResolved).length} Active</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#334155' }}>
                <CheckCircle2 size={32} color="#00E676" style={{ marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '0.85rem' }}>All clear!</p>
              </div>
            ) : (
              alerts.slice(0, 8).map((alert, i) => (
                <div key={alert._id || i} style={{
                  padding: '10px 12px', borderRadius: 10, position: 'relative',
                  background: alert.isResolved ? 'rgba(255,255,255,0.02)' : (alert.type === 'critical' ? 'rgba(255,71,87,0.07)' : 'rgba(255,167,38,0.07)'),
                  border: `1px solid ${alert.isResolved ? 'rgba(255,255,255,0.05)' : (alert.type === 'critical' ? 'rgba(255,71,87,0.2)' : 'rgba(255,167,38,0.2)')}`,
                  opacity: alert.isResolved ? 0.5 : 1
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: alert.type === 'critical' ? '#FF4757' : '#FFA726', marginBottom: 3 }}>
                      {alert.title || 'Security Alert'}
                    </div>
                    {!alert.isResolved && (
                      <button onClick={() => handleResolve(alert._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00E676', padding: 0 }}>
                        <CheckCircle2 size={14} />
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#334155', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} /> {new Date(alert.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Threat log table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass" style={{ padding: '24px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Recent Threat Logs</h3>
            <button onClick={fetchData} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#334155' }}>
              <Brain size={40} style={{ opacity: 0.3, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
              <p>No threat events yet. Use the simulator above to run predictions.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Threat Level</th>
                  <th>Score</th>
                  <th>Confidence</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log._id || i}>
                    <td><span className="mono" style={{ fontSize: '0.8rem', color: '#475569' }}>{log.ipAddress || 'N/A'}</span></td>
                    <td>
                      <span className={`badge badge-${log.threatLevel}`}>
                        {log.threatLevel}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 4, background: 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden', maxWidth: 60 }}>
                          <div style={{ height: '100%', width: `${log.threatScore}%`, background: THREAT_COLORS[log.threatLevel] || '#00D4FF', borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: THREAT_COLORS[log.threatLevel] }}>{log.threatScore}</span>
                      </div>
                    </td>
                    <td><span style={{ fontSize: '0.8rem', color: '#818CF8' }}>{Math.round(log.confidence || 0)}%</span></td>
                    <td style={{ fontSize: '0.75rem', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} /> {new Date(log.timestamp || log.createdAt).toLocaleString('en-IN')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ThreatPage;
