import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { blockchainAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Globe, Search, Shield, Hash, Clock, Link2, CheckCircle2, XCircle, Database, TrendingUp } from 'lucide-react';

const BlockCard = ({ block, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.06 }}
    className="glass glass-hover"
    style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}
  >
    {/* Block number accent */}
    <div style={{
      position: 'absolute', top: 0, right: 0, background: 'linear-gradient(135deg, rgba(0,212,255,0.15), transparent)',
      width: 80, height: 80, borderRadius: '0 16px 0 80px'
    }} />
    <div style={{ position: 'absolute', top: 10, right: 14, fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'rgba(0,212,255,0.5)', fontWeight: 700 }}>
      #{block.blockNumber}
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{
        width: 36, height: 36,
        background: block.blockNumber === 0 ? 'linear-gradient(135deg, #818CF8, #C084FC)' : 'linear-gradient(135deg, #0EA5E9, #00D4FF)',
        borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 12px rgba(0,212,255,0.3)`
      }}>
        {block.blockNumber === 0 ? <Database size={16} color="#0F172A" /> : <Shield size={16} color="#020814" />}
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
          {block.blockNumber === 0 ? 'Genesis Block' : `Block #${block.blockNumber}`}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#334155', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={10} /> {new Date(block.timestamp).toLocaleString('en-IN')}
        </div>
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div>
        <div style={{ fontSize: '0.65rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Current Hash</div>
        <div className="hash-display" style={{ fontSize: '0.7rem' }}>{block.hash}</div>
      </div>
      <div>
        <div style={{ fontSize: '0.65rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Previous Hash</div>
        <div className="hash-display" style={{ fontSize: '0.7rem', background: 'rgba(129,140,248,0.08)', borderColor: 'rgba(129,140,248,0.2)', color: '#818CF8' }}>
          {block.previousHash}
        </div>
      </div>
      {block.recordId && (
        <div style={{ padding: '8px 10px', background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle2 size={12} color="#00E676" />
          <span style={{ fontSize: '0.72rem', color: '#00E676', fontWeight: 500 }}>
            Record: {typeof block.recordId === 'object' ? block.recordId?.surveyNumber : 'Linked'}
          </span>
        </div>
      )}
    </div>
  </motion.div>
);

const BlockchainPage = () => {
  const [chain, setChain] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchChain();
  }, []);

  const fetchChain = async () => {
    try {
      const [cRes, sRes] = await Promise.allSettled([
        blockchainAPI.getChain(),
        blockchainAPI.getStats(),
      ]);
      if (cRes.status === 'fulfilled') setChain(cRes.value.data?.data || []);
      if (sRes.status === 'fulfilled') setStats(sRes.value.data?.data);
    } catch {
      toast.error('Failed to load blockchain');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyHash.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const { data } = await blockchainAPI.verify(verifyHash.trim());
      setVerifyResult(data.data);
    } catch {
      setVerifyResult({ valid: false, message: 'Hash not found in blockchain' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #00D4FF, #0EA5E9)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}>
            <Globe size={22} color="#020814" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Blockchain Explorer</h1>
            <p style={{ fontSize: '0.8rem', color: '#334155', marginTop: 2 }}>Transparent, immutable ledger of all land record transactions</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Blocks', value: stats?.totalBlocks ?? chain.length, color: '#00D4FF', icon: Database },
          { label: 'Chain Valid', value: stats?.isValid ? 'Yes ✓' : 'No ✗', color: stats?.isValid ? '#00E676' : '#FF4757', icon: Shield },
          { label: 'Land Records', value: stats?.totalRecords ?? (chain.length > 0 ? chain.length - 1 : 0), color: '#818CF8', icon: Hash },
          { label: 'Chain Length', value: `${chain.length} Blocks`, color: '#FFA726', icon: Link2 },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, background: `${s.color}18`, border: `1px solid ${s.color}30`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: 6 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Verify tool */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass" style={{ padding: '24px', marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
          Record Authenticity Verifier
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#334155', marginBottom: 16 }}>
          Enter a blockchain hash to verify if a land record is authentic and untampered.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Hash size={16} color="#334155" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" className="input-field mono" style={{ paddingLeft: 42, fontSize: '0.85rem' }}
              placeholder="Enter SHA-256 hash to verify..."
              value={verifyHash} onChange={e => setVerifyHash(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
            />
          </div>
          <button onClick={handleVerify} disabled={verifying || !verifyHash.trim()} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            {verifying ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><Search size={16} /> Verify</>}
          </button>
        </div>

        {verifyResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 16, padding: '16px', borderRadius: 12,
              background: verifyResult.valid ? 'rgba(0,230,118,0.06)' : 'rgba(255,71,87,0.06)',
              border: `1px solid ${verifyResult.valid ? 'rgba(0,230,118,0.2)' : 'rgba(255,71,87,0.2)'}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: verifyResult.block ? 12 : 0 }}>
              {verifyResult.valid
                ? <CheckCircle2 size={20} color="#00E676" />
                : <XCircle size={20} color="#FF4757" />
              }
              <span style={{ fontWeight: 700, color: verifyResult.valid ? '#00E676' : '#FF4757', fontSize: '0.9rem' }}>
                {verifyResult.valid ? 'AUTHENTIC — Record is genuine and untampered' : 'INVALID — Record not found in blockchain'}
              </span>
            </div>
            {verifyResult.block && (
              <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Block Number', value: `#${verifyResult.block.blockNumber}` },
                  { label: 'Timestamp', value: new Date(verifyResult.block.timestamp).toLocaleString('en-IN') },
                  { label: 'Nonce', value: verifyResult.block.nonce },
                  { label: 'Chain Status', value: verifyResult.chainValid ? '✓ Valid' : '✗ Invalid' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.65rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</div>
                    <div className="mono" style={{ fontSize: '0.8rem', color: '#00E676', fontWeight: 600, marginTop: 2 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Chain visualization - linear flow */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <TrendingUp size={18} color="#00D4FF" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Block Chain Ledger</h3>
          <span className="badge badge-active">{chain.length} Blocks</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 48, height: 48 }} />
          </div>
        ) : chain.length === 0 ? (
          <div className="glass" style={{ padding: 60, textAlign: 'center', color: '#334155' }}>
            <Database size={48} style={{ opacity: 0.3, marginBottom: 16, display: 'block', margin: '0 auto 16px' }} />
            <p>No blocks yet. Add land records to start the blockchain.</p>
          </div>
        ) : (
          <div>
            {/* Chain connector visual */}
            <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
              <div style={{ display: 'flex', gap: 0, alignItems: 'center', minWidth: 'fit-content' }}>
                {chain.map((block, i) => (
                  <div key={block._id} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      padding: '12px 16px', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,212,255,0.2)',
                      borderRadius: 10, minWidth: 160, position: 'relative'
                    }}>
                      <div style={{ fontSize: '0.65rem', color: '#00D4FF', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>
                        {block.blockNumber === 0 ? 'GENESIS' : `BLOCK #${block.blockNumber}`}
                      </div>
                      <div className="mono" style={{ fontSize: '0.65rem', color: '#334155' }}>
                        {block.hash.slice(0, 16)}...
                      </div>
                    </div>
                    {i < chain.length - 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(0,212,255,0.4)', padding: '0 4px' }}>
                        <div style={{ width: 20, height: 1, background: 'rgba(0,212,255,0.3)' }} />
                        <span style={{ fontSize: 12 }}>▶</span>
                        <div style={{ width: 20, height: 1, background: 'rgba(0,212,255,0.3)' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Block cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginTop: 24 }}>
              {[...chain].reverse().map((block, i) => (
                <BlockCard key={block._id} block={block} index={i} />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BlockchainPage;
