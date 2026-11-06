import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { recordsAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FileText, Plus, Search, X, Edit2, Trash2, Eye, MapPin,
  Calendar, Hash, ChevronLeft, ChevronRight, History, Check, AlertCircle
} from 'lucide-react';

const INITIAL_FORM = {
  ownerName: '', surveyNumber: '', location: '', district: '',
  state: '', area: '', areaUnit: 'acres', registrationDate: ''
};

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi'];

/* Modal */
const RecordModal = ({ record, onClose, onSave, mode }) => {
  const [form, setForm] = useState(record || INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      let res;
      if (mode === 'edit') {
        res = await recordsAPI.update(record._id, form);
      } else {
        res = await recordsAPI.create(form);
      }
      if (res.data.success) {
        toast.success(mode === 'edit' ? 'Record updated & blockchain rehashed!' : 'Record created on blockchain!');
        onSave();
      } else {
        toast.error(res.data.message || 'Failed to save');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="modal-content"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
              {mode === 'view' ? 'Record Details' : mode === 'edit' ? 'Edit Land Record' : 'Add Land Record'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#334155', marginTop: 4 }}>
              {mode !== 'view' && 'Will be automatically hashed and added to blockchain'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#475569' }}>
            <X size={16} />
          </button>
        </div>

        {mode === 'view' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Owner Name', value: record?.ownerName },
              { label: 'Survey Number', value: record?.surveyNumber },
              { label: 'Location', value: record?.location },
              { label: 'District', value: record?.district },
              { label: 'State', value: record?.state },
              { label: 'Area', value: `${record?.area} ${record?.areaUnit}` },
              { label: 'Registration Date', value: record?.registrationDate ? new Date(record.registrationDate).toLocaleDateString('en-IN') : 'N/A' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: '0.875rem', color: '#0F172A', fontWeight: 600 }}>{item.value || 'N/A'}</span>
              </div>
            ))}
            <div style={{ padding: '12px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 10 }}>
              <div style={{ fontSize: '0.75rem', color: '#334155', marginBottom: 6 }}>Blockchain Hash</div>
              <div className="hash-display">{record?.blockchainHash || 'N/A'}</div>
            </div>
            {/* Ownership history */}
            {record?.ownershipHistory?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', color: '#334155', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <History size={14} /> Ownership History
                </div>
                {record.ownershipHistory.map((h, i) => (
                  <div key={i} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 6, fontSize: '0.8rem', color: '#475569' }}>
                    <strong>{h.ownerName}</strong> · {new Date(h.transferDate).toLocaleDateString('en-IN')}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { key: 'ownerName', label: 'Owner Name', type: 'text', placeholder: 'Full legal name' },
              { key: 'surveyNumber', label: 'Survey Number', type: 'text', placeholder: 'e.g. MH-2024-001' },
              { key: 'location', label: 'Location / Village', type: 'text', placeholder: 'Village/Taluk' },
              { key: 'district', label: 'District', type: 'text', placeholder: 'District name' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 7 }}>{field.label}</label>
                <input type={field.type} className="input-field" placeholder={field.placeholder}
                  value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  disabled={mode === 'view'}
                />
              </div>
            ))}
            {/* State dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 7 }}>State</label>
              <select className="input-field" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}>
                <option value="">Select State</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* Area */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 7 }}>Area</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" className="input-field" placeholder="0.00" style={{ flex: 1 }}
                  value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
                <select className="input-field" style={{ width: 100 }} value={form.areaUnit} onChange={e => setForm({ ...form, areaUnit: e.target.value })}>
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                  <option value="sqft">Sq.Ft</option>
                </select>
              </div>
            </div>
            {/* Date */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 7 }}>Registration Date</label>
              <input type="date" className="input-field"
                value={form.registrationDate ? form.registrationDate.split('T')[0] : ''}
                onChange={e => setForm({ ...form, registrationDate: e.target.value })}
              />
            </div>
          </div>
        )}

        {mode !== 'view' && (
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Saving...</> : <><Check size={16} /> {mode === 'edit' ? 'Update Record' : 'Add to Blockchain'}</>}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

/* ── Main Component ── */
const RecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(null); // { mode, record }
  const LIMIT = 10;

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await recordsAPI.getAll({ search, page, limit: LIMIT });
      if (data.success) {
        setRecords(data.data.records || []);
        setTotal(data.data.total || 0);
      }
    } catch {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will remove the land record.')) return;
    try {
      await recordsAPI.delete(id);
      toast.success('Record deleted');
      fetchRecords();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #818CF8, #C084FC)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} color="#0F172A" strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Land Records</h1>
              <p style={{ fontSize: '0.8rem', color: '#334155', marginTop: 2 }}>{total} records · Blockchain secured</p>
            </div>
          </div>
          <button onClick={() => setModal({ mode: 'add', record: null })} className="btn-primary">
            <Plus size={16} /> Add Record
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 480 }}>
          <Search size={16} color="#334155" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" className="input-field" style={{ paddingLeft: 44 }}
            placeholder="Search by owner, survey number, location..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass" style={{ padding: '8px 0', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <FileText size={48} color="#334155" style={{ opacity: 0.3, marginBottom: 16 }} />
            <p style={{ color: '#334155', marginBottom: 16 }}>{search ? 'No records match your search.' : 'No land records yet.'}</p>
            {!search && (
              <button onClick={() => setModal({ mode: 'add', record: null })} className="btn-primary">
                <Plus size={16} /> Add First Record
              </button>
            )}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Owner Name</th>
                <th>Survey Number</th>
                <th>Location</th>
                <th>Area</th>
                <th>Blockchain Hash</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <motion.tr key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <td style={{ fontWeight: 600, color: '#0F172A' }}>{r.ownerName}</td>
                  <td><span className="mono" style={{ color: '#818CF8', fontSize: '0.8rem' }}>{r.surveyNumber}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} color="#334155" />
                      <span style={{ fontSize: '0.85rem' }}>{r.district}, {r.state}</span>
                    </div>
                  </td>
                  <td>{r.area} {r.areaUnit}</td>
                  <td>
                    {r.blockchainHash ? (
                      <span className="hash-display">{r.blockchainHash.slice(0, 12)}...</span>
                    ) : <span style={{ color: '#334155', fontSize: '0.75rem' }}>Pending</span>}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} />
                      {r.registrationDate ? new Date(r.registrationDate).toLocaleDateString('en-IN') : 'N/A'}
                    </div>
                  </td>
                  <td><span className={`badge badge-${r.status || 'active'}`}>{r.status || 'active'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button onClick={() => setModal({ mode: 'view', record: r })} title="View"
                        style={{ width: 30, height: 30, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00D4FF', transition: 'all 0.2s' }}>
                        <Eye size={14} />
                      </button>
                      <button onClick={() => setModal({ mode: 'edit', record: r })} title="Edit"
                        style={{ width: 30, height: 30, background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8', transition: 'all 0.2s' }}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(r._id)} title="Delete"
                        style={{ width: 30, height: 30, background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF4757', transition: 'all 0.2s' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.8rem', color: '#334155' }}>
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ width: 32, height: 32, background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: page === 1 ? 'not-allowed' : 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.4 : 1 }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ width: 32, height: 32, background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: page === totalPages ? 'not-allowed' : 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages ? 0.4 : 1 }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <RecordModal
            record={modal.record}
            mode={modal.mode}
            onClose={() => setModal(null)}
            onSave={() => { setModal(null); fetchRecords(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecordsPage;
