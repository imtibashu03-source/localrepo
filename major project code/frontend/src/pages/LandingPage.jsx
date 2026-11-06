import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView as useInViewIO } from 'react-intersection-observer';
import {
  Shield, Lock, Brain, Zap, Globe, Eye, Database, AlertTriangle,
  ChevronRight, Check, ArrowRight, ExternalLink, AtSign, Mail, Phone,
  MapPin, Star, Users, FileText, Activity, TrendingUp, Search
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';

/* ── Blockchain network SVG animation ── */
const BlockchainViz = () => {
  const nodes = [
    { x: 160, y: 120, label: 'Block #1' },
    { x: 340, y: 80,  label: 'Block #2' },
    { x: 520, y: 130, label: 'Block #3' },
    { x: 680, y: 90,  label: 'Block #4' },
  ];
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <svg viewBox="0 0 800 240" style={{ width: '100%', maxWidth: 800, height: 'auto', overflow: 'visible' }}>
      <defs>
        <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.8" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Connecting lines */}
      {nodes.slice(0,-1).map((n, i) => (
        <g key={i}>
          <line x1={n.x} y1={n.y} x2={nodes[i+1].x} y2={nodes[i+1].y}
            stroke="rgba(0,212,255,0.2)" strokeWidth="1.5" strokeDasharray="6 4" />
          <motion.circle
            r={5} fill="#00D4FF" filter="url(#glow)"
            animate={{
              cx: [n.x, nodes[i+1].x],
              cy: [n.y, nodes[i+1].y],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 2, delay: i * 0.5 + (tick % 3) * 0.2, ease: 'linear' }}
          />
        </g>
      ))}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={i}>
          <motion.circle cx={n.x} cy={n.y} r={36}
            fill="url(#nodeGrad)" stroke="rgba(0,212,255,0.4)" strokeWidth="1.5"
            animate={{ r: [34, 38, 34] }}
            transition={{ duration: 3, delay: i * 0.7, repeat: Infinity, ease: 'easeInOut' }}
            filter="url(#glow)"
          />
          <text x={n.x} y={n.y - 2} textAnchor="middle" fill="#00D4FF" fontSize="9" fontFamily="JetBrains Mono" fontWeight="600">
            {n.label}
          </text>
          <text x={n.x} y={n.y + 12} textAnchor="middle" fill="rgba(0,212,255,0.6)" fontSize="7" fontFamily="JetBrains Mono">
            0x{(Math.abs(Math.sin(i + tick * 0.1)) * 0xffffff | 0).toString(16).padStart(6,'0')}
          </text>
          {/* Hash link icon */}
          <rect x={n.x-12} y={n.y+22} width={24} height={14} rx={4} fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.2)" strokeWidth="0.5" />
          <text x={n.x} y={n.y+31} textAnchor="middle" fill="rgba(0,212,255,0.5)" fontSize="6" fontFamily="JetBrains Mono">SECURED</text>
        </g>
      ))}

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.circle
          key={`p${i}`}
          r={1.5} fill="rgba(0,212,255,0.4)"
          animate={{
            cx: [100 + i*85, 100 + i*85 + 20, 100 + i*85],
            cy: [180 + (i%3)*10, 160 + (i%3)*10, 180 + (i%3)*10],
            opacity: [0.2, 0.8, 0.2]
          }}
          transition={{ duration: 3 + i*0.4, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </svg>
  );
};

/* ── Stat counter ── */
const StatCard = ({ value, suffix, label, icon: Icon, color }) => {
  const [ref, inView] = useInViewIO({ triggerOnce: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="glass glass-hover"
      style={{ padding: '28px 24px', textAlign: 'center' }}
    >
      <div style={{
        width: 48, height: 48, background: `${color}18`, border: `1px solid ${color}30`,
        borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px'
      }}>
        <Icon size={22} color={color} />
      </div>
      <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
        {value}{suffix}
      </div>
      <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: 8 }}>{label}</div>
    </motion.div>
  );
};

/* ── Feature card ── */
const FeatureCard = ({ icon: Icon, title, desc, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="glass glass-hover"
    style={{ padding: '28px', height: '100%' }}
  >
    <div style={{
      width: 52, height: 52, background: `${color}18`, border: `1px solid ${color}30`,
      borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20
    }}>
      <Icon size={24} color={color} />
    </div>
    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>{title}</h3>
    <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>{desc}</p>
  </motion.div>
);

/* ── Step card ── */
const StepCard = ({ num, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}
  >
    <div style={{
      width: 48, height: 48, minWidth: 48, background: 'linear-gradient(135deg, #0EA5E9, #00D4FF)',
      borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: '1.1rem', color: '#020814',
      boxShadow: '0 0 20px rgba(0,212,255,0.3)'
    }}>{num}</div>
    <div>
      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>{title}</h4>
      <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.7 }}>{desc}</p>
    </div>
  </motion.div>
);

/* ── Team member ── */
const TeamCard = ({ name, role, dept, initials, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="glass glass-hover"
    style={{ padding: '28px 20px', textAlign: 'center' }}
  >
    <div style={{
      width: 72, height: 72, background: 'linear-gradient(135deg, #1E3A8A, #0EA5E9)',
      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 16px', fontSize: '1.4rem', fontWeight: 800, color: '#0F172A',
      boxShadow: '0 0 20px rgba(0,212,255,0.2)'
    }}>
      {initials}
    </div>
    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{name}</h4>
    <p style={{ fontSize: '0.8rem', color: '#00D4FF', fontWeight: 500, marginBottom: 4 }}>{role}</p>
    <p style={{ fontSize: '0.75rem', color: '#334155' }}>{dept}</p>
  </motion.div>
);

/* ══════════════════════════════════════════════════ */
const LandingPage = () => {
  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '100px 24px 60px',
        background: 'radial-gradient(ellipse at 30% 40%, rgba(30,58,138,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(0,212,255,0.06) 0%, transparent 60%)',
        position: 'relative', overflow: 'hidden'
      }}
        className="bg-grid"
      >
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '15%', left: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(30,58,138,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="section-tag">
                <Shield size={12} /> Government of India · Ministry of Rural Development
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: 24, letterSpacing: '-0.03em' }}
            >
              National Land Record<br />
              Portal <span className="gradient-text">(BhoomiRaksha)</span><br />
              Digital India Initiative
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ fontSize: '1.1rem', color: '#334155', lineHeight: 1.8, marginBottom: 36, maxWidth: 520 }}
            >
              The official centralized platform for secure, tamper-proof land governance. Empowering citizens through transparency and safeguarding property rights with advanced cryptographic security under the Digital India mission.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}
            >
              <Link to="/register" className="btn-primary">
                Get Started <ArrowRight size={16} />
              </Link>
              <a href="#features" className="btn-secondary">
                Explore Features <ChevronRight size={16} />
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}
            >
              {[
                { icon: Lock, label: 'SHA-256 Encrypted' },
                { icon: Brain, label: 'AI Threat Detection' },
                { icon: Shield, label: 'Tamper-Proof Records' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <item.icon size={14} color="#00D4FF" />
                  <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Blockchain viz */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div className="glass" style={{ padding: '24px', position: 'relative' }}>
              <div style={{ fontSize: '0.7rem', color: '#334155', marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                Live Blockchain Network
              </div>
              <BlockchainViz />
              {/* Live indicator */}
              <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <motion.div
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ width: 8, height: 8, background: '#00E676', borderRadius: '50%' }}
                />
                <span style={{ fontSize: '0.7rem', color: '#00E676', fontWeight: 600 }}>LIVE</span>
              </div>
            </div>

            {/* Mini threat indicator */}
            <div className="glass" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: '#334155', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Threat Monitor</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 6, background: 'rgba(0,0,0,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: ['15%', '28%', '15%'] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #00E676, #FFEB3B)', borderRadius: 3 }}
                    />
                  </div>
                  <span className="badge badge-safe">Safe</span>
                </div>
              </div>
              <Brain size={28} color="#00D4FF" style={{ opacity: 0.7 }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: '100px 24px', background: 'rgba(241,245,249,0.8)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}><Database size={12} /> About the Project</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 20 }}>
              India's Most Advanced <span className="gradient-text">Land Record</span> Platform
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#334155', maxWidth: 700, margin: '0 auto', lineHeight: 1.8 }}>
              Traditional land record systems face fraud, unauthorized access, and data tampering.
              BhoomiRaksha combines blockchain immutability with machine learning threat intelligence
              to create an unbreakable, transparent land governance system.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { icon: AlertTriangle, color: '#FF4757', title: 'Problem', points: ['Land record fraud is rampant', 'Unauthorized modifications occur', 'No real-time threat detection', 'Centralized data risks'] },
              { icon: Shield, color: '#00D4FF', title: 'Solution', points: ['Blockchain-secured records', 'AI-powered threat prediction', 'Real-time monitoring & alerts', 'Decentralized integrity checks'] },
              { icon: TrendingUp, color: '#00E676', title: 'Impact', points: ['Zero data tampering possible', 'Instant threat detection', 'Full audit trail maintained', 'Transparent governance'] },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass glass-hover"
                style={{ padding: '28px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 42, height: 42, background: `${card.color}18`, border: `1px solid ${card.color}30`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <card.icon size={20} color={card.color} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>{card.title}</h3>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {card.points.map(pt => (
                    <li key={pt} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', color: '#334155' }}>
                      <Check size={14} color={card.color} style={{ flexShrink: 0 }} /> {pt}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <StatCard value={15000} suffix="+" label="Land Records Secured" icon={FileText} color="#00D4FF" />
            <StatCard value={98} suffix="%" label="Threat Detection Accuracy" icon={Brain} color="#818CF8" />
            <StatCard value={500} suffix="+" label="Cyber Threats Prevented" icon={Shield} color="#00E676" />
            <StatCard value={1200} suffix="+" label="Registered Users" icon={Users} color="#FFA726" />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 24px', background: 'rgba(241,245,249,0.8)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}><Zap size={12} /> Platform Features</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Everything You Need for <span className="gradient-text">Secure Governance</span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <FeatureCard delay={0} icon={Lock} color="#00D4FF" title="Blockchain-Secured Records" desc="Every land record is cryptographically hashed and linked in an immutable blockchain. Any tampering attempt is instantly detected." />
            <FeatureCard delay={0.1} icon={Brain} color="#818CF8" title="AI Threat Prediction" desc="Random Forest and Decision Tree ensemble analyzes 8 behavioral features to predict cyber threats before they materialize." />
            <FeatureCard delay={0.2} icon={AlertTriangle} color="#FFA726" title="Real-Time Alerts" desc="Automatic alerts triggered by failed login attempts, suspicious patterns, IP mismatches, and unauthorized modification attempts." />
            <FeatureCard delay={0.3} icon={Eye} color="#00E676" title="Ownership Verification" desc="Instantly verify any land record's authenticity by checking its blockchain hash against the distributed ledger." />
            <FeatureCard delay={0.4} icon={Activity} color="#FF4757" title="Threat Analytics" desc="Comprehensive dashboard with threat heatmaps, trend analysis, and predictive risk scoring for proactive security." />
            <FeatureCard delay={0.5} icon={Globe} color="#00D4FF" title="Blockchain Explorer" desc="Transparent, public-facing blockchain explorer shows every block, hash, and transaction for complete audit trails." />
            <FeatureCard delay={0.6} icon={Users} color="#C084FC" title="Role-Based Access" desc="Granular user roles with admin oversight, user permissions, and full audit logging of all system interactions." />
            <FeatureCard delay={0.7} icon={Search} color="#FFA726" title="Smart Search & Filter" desc="Powerful search across owner names, survey numbers, districts, and states with real-time filtering capabilities." />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="section-tag"><Activity size={12} /> How It Works</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, marginBottom: 40, letterSpacing: '-0.03em' }}>
              A 4-Step Framework for <span className="gradient-text">Absolute Security</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <StepCard delay={0} num="01" title="Record Submission" desc="Land records are submitted through verified government portals with owner identity validation and document authentication." />
              <StepCard delay={0.1} num="02" title="Blockchain Hashing" desc="Each record is SHA-256 hashed and linked to the previous block, creating an immutable chain of custody." />
              <StepCard delay={0.2} num="03" title="AI Threat Analysis" desc="Machine learning models continuously monitor access patterns, flagging anomalies in real-time with confidence scores." />
              <StepCard delay={0.3} num="04" title="Alert & Response" desc="Automated alerts notify administrators of threats with recommended actions. All incidents are logged in the audit trail." />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="glass" style={{ padding: '32px', position: 'relative' }}>
              <div style={{ fontSize: '0.7rem', color: '#334155', marginBottom: 20, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sample Blockchain Block</div>
              {[
                { label: 'Block Number', value: '#4829', color: '#818CF8' },
                { label: 'Hash', value: '0xa3f8c2d...e91b', color: '#00D4FF' },
                { label: 'Previous Hash', value: '0x72bc19f...d34a', color: '#00D4FF' },
                { label: 'Timestamp', value: new Date().toISOString().split('T')[0], color: '#334155' },
                { label: 'Record ID', value: 'SUR-MH-2024-0891', color: '#00E676' },
                { label: 'Status', value: 'VERIFIED ✓', color: '#00E676' },
              ].map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 5 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                >
                  <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500 }}>{row.label}</span>
                  <span className="mono" style={{ fontSize: '0.8rem', color: row.color, fontWeight: 600 }}>{row.value}</span>
                </motion.div>
              ))}
              <div style={{ marginTop: 20, padding: '12px', background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#00E676', fontWeight: 600 }}>
                  <Check size={14} /> Chain Integrity Verified — No Tampering Detected
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section id="security" style={{ padding: '100px 24px', background: 'rgba(241,245,249,0.8)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}><Shield size={12} /> Cyber Threat Prevention</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              AI-Powered Threat <span className="gradient-text">Intelligence Engine</span>
            </h2>
            <p style={{ fontSize: '1rem', color: '#334155', maxWidth: 600, margin: '20px auto 0', lineHeight: 1.8 }}>
              Our ensemble ML model analyzes 8 behavioral features to classify threats with high accuracy.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
            {/* Feature list */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { feature: 'Failed Login Attempts', risk: 'High', color: '#FF4757' },
                { feature: 'IP Address Mismatches', risk: 'High', color: '#FF4757' },
                { feature: 'Abnormal Access Frequency', risk: 'Medium', color: '#FFA726' },
                { feature: 'Off-Hours Access', risk: 'Medium', color: '#FFA726' },
                { feature: 'Modification Attempts', risk: 'High', color: '#FF4757' },
                { feature: 'Geographic Anomalies', risk: 'Medium', color: '#FFA726' },
                { feature: 'Unusual Patterns', risk: 'Low', color: '#FFEB3B' },
                { feature: 'Session Duration', risk: 'Low', color: '#FFEB3B' },
              ].map((item, i) => (
                <motion.div
                  key={item.feature}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass"
                  style={{ padding: '14px', position: 'relative' }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500, marginBottom: 6 }}>{item.feature}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, background: item.color, borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.65rem', color: item.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.risk} Risk Factor</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Threat levels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { level: 'SAFE', score: '0–25', desc: 'Normal system access. All patterns within expected thresholds.', color: '#00E676', pct: 25 },
                { level: 'LOW RISK', score: '26–50', desc: 'Minor anomalies detected. Increased monitoring recommended.', color: '#FFEB3B', pct: 50 },
                { level: 'MEDIUM RISK', score: '51–75', desc: 'Suspicious activity detected. Immediate admin review required.', color: '#FFA726', pct: 75 },
                { level: 'HIGH RISK', score: '76–100', desc: 'Critical threat! Block suspicious IPs and escalate immediately.', color: '#FF4757', pct: 100 },
              ].map((item, i) => (
                <motion.div
                  key={item.level}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass"
                  style={{ padding: '16px 20px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, background: item.color, borderRadius: '50%', boxShadow: `0 0 8px ${item.color}` }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: item.color, letterSpacing: '0.05em' }}>{item.level}</span>
                    </div>
                    <span className="mono" style={{ fontSize: '0.75rem', color: '#334155' }}>Score: {item.score}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(0,0,0,0.1)', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                      style={{ height: '100%', background: `linear-gradient(90deg, ${item.color}80, ${item.color})`, borderRadius: 2 }}
                    />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#334155' }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DEVELOPER ── */}
      <section id="team" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}><Users size={12} /> Project Developer</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Developed By <span className="gradient-text">ANANYA kamath s</span>
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, maxWidth: 400, margin: '0 auto' }}>
            <TeamCard delay={0} name="ANANYA kamath s" role="Lead Developer" dept="Full Stack & ML Integration" initials="AK" />
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding: '100px 24px', background: 'rgba(241,245,249,0.8)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}><Mail size={12} /> Get In Touch</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
              Have Questions? <span className="gradient-text">Reach Out</span>
            </h2>
            <p style={{ color: '#334155', marginBottom: 48, lineHeight: 1.8 }}>
              This project is developed as a final year engineering project. For inquiries about the technology and implementation, contact us.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              {[
                { icon: Mail, label: 'Email', value: 'bhoomiraksha@gov.in' },
                { icon: Phone, label: 'Phone', value: '+91 11 2338 7000' },
                { icon: MapPin, label: 'Address', value: 'New Delhi, India - 110001' },
              ].map(item => (
                <div key={item.label} className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <item.icon size={20} color="#00D4FF" />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</div>
                  <div style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '48px 24px 32px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #0EA5E9, #00D4FF)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={18} color="#020814" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>BhoomiRaksha</div>
                  <div style={{ fontSize: '0.6rem', color: '#00D4FF', letterSpacing: '0.1em' }}>GOV DIGITAL PLATFORM</div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.8, maxWidth: 300 }}>
                Intelligent Cyber Threat Prediction Model for Blockchain-Enabled Land Revenue Records. Ministry of Electronics & IT, Government of India.
              </p>
            </div>
            {[
              { title: 'Platform', links: ['Land Records', 'Blockchain Explorer', 'Threat Intelligence', 'Admin Dashboard'] },
              { title: 'Security', links: ['SHA-256 Hashing', 'JWT Authentication', 'Rate Limiting', 'Audit Trails'] },
              { title: 'Tech Stack', links: ['React.js + Vite', 'Node.js + Express', 'MongoDB', 'Python Flask ML'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(link => (
                    <li key={link}><a href="#" style={{ fontSize: '0.85rem', color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#00D4FF'}
                      onMouseLeave={e => e.target.style.color = '#334155'}
                    >{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: '0.8rem', color: '#334155' }}>© 2024 BhoomiRaksha | Government of India Digital Initiative</span>
            <span style={{ fontSize: '0.8rem', color: '#334155' }}>Built with ❤️ for India's Digital Future · Final Year Project</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
