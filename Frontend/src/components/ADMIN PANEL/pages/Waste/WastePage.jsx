import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';
import { Button, CircularProgress } from '@mui/material';

const WastePage = () => {
  const { token } = useAuth();
  const [plants, setPlants] = useState([]);
  const [wastes, setWastes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [report, setReport] = useState({ year: new Date().getFullYear(), month: (new Date().getMonth() + 1) });

  const [form, setForm] = useState({
    plantId: '',
    reason: '',
    size: 'small',
    quantity: ''
  });

  const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const fetchPlants = async () => {
    const res = await axios.get('http://localhost:8020/api/admin/plants/all', authHeaders);
    if (!res.data?.success) throw new Error(res.data?.message || 'Failed to load plants');
    return res.data.data || [];
  };

  const fetchWastes = async () => {
    const res = await axios.get('http://localhost:8020/api/waste', authHeaders);
    if (!res.data?.success) throw new Error(res.data?.message || 'Failed to load waste');
    return res.data.data || [];
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [plantsData, wastesData] = await Promise.all([fetchPlants(), fetchWastes()]);
        if (!isMounted) return;
        setPlants(plantsData);
        setWastes(wastesData);
      } catch (e) {
        if (!isMounted) return;
        setError(e.message || 'Failed to load data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const payload = {
        plantId: form.plantId,
        reason: form.reason.trim(),
        size: form.size,
        quantity: Number(form.quantity)
      };

      const res = await axios.post('http://localhost:8020/api/waste', payload, authHeaders);
      if (!res.data?.success) throw new Error(res.data?.message || 'Failed to create waste');

      setSuccess('Waste recorded, stock decreased, and receipt PDF generated');
      setForm({ plantId: '', reason: '', size: 'small', quantity: '' });

      const [plantsData, wastesData] = await Promise.all([fetchPlants(), fetchWastes()]);
      setPlants(plantsData);
      setWastes(wastesData);
      // Notify dashboard to refresh stats
      window.dispatchEvent(new Event('wasteUpdated'));
    } catch (e1) {
      setError(e1.response?.data?.message || e1.message || 'Failed to submit waste');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  const download = async (url, filename) => {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to download');
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDownloadReceipt = async (id) => {
    try {
      await download(`http://localhost:8020/api/waste/pdf/${id}`, `waste_${id}.pdf`);
      setSuccess('Waste receipt PDF downloaded');
    } catch (e) {
      setError(e.message || 'Failed to download receipt');
    } finally {
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  const handleDownloadMonthly = async (e) => {
    e.preventDefault();
    try {
      const y = report.year; const m = report.month;
      await download(`http://localhost:8020/api/waste/pdf/monthly/${y}/${m}`, `waste_report_${y}_${m}.pdf`);
      setSuccess('Monthly waste report PDF downloaded');
    } catch (e1) {
      setError(e1.message || 'Failed to download report');
    } finally {
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  return (
    <div className="p-6 bg-green-950 rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold text-yellow-500">Wasted Plants</h2>

      {loading ? (
        <div className="text-center text-yellow-500 py-8">Loading...</div>
      ) : (
        <div className="space-y-6">
          {/* Add Waste Form */}
          <div className="bg-green-900 rounded-lg p-4 border border-yellow-500/20 shadow">
            <h3 className="text-xl text-white mb-4">Add Waste</h3>
            {error && <div className="mb-3 text-red-400">{error}</div>}
            {success && <div className="mb-3 text-green-400">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-yellow-500 mb-1">Plant</label>
                <select name="plantId" value={form.plantId} onChange={handleChange} className="w-full p-2 rounded bg-green-950 text-white border border-yellow-500/40" required>
                  <option value="">Select a plant</option>
                  {plants.map(p => (
                    <option key={p._id} value={p._id}>{p._id} - {p.plantName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-yellow-500 mb-1">Reason (optional)</label>
                <input type="text" name="reason" value={form.reason} onChange={handleChange} className="w-full p-2 rounded bg-green-950 text-white border border-yellow-500/40" placeholder="e.g., disease, expired" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-yellow-500 mb-1">Size</label>
                  <select name="size" value={form.size} onChange={handleChange} className="w-full p-2 rounded bg-green-950 text-white border border-yellow-500/40" required>
                    <option value="small">small</option>
                    <option value="medium">medium</option>
                    <option value="large">large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-yellow-500 mb-1">Quantity</label>
                  <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min={1} className="w-full p-2 rounded bg-green-950 text-white border border-yellow-500/40" placeholder="e.g., 5" required />
                </div>
              </div>
              <div>
                <Button type="submit" disabled={submitting} variant="contained" className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600 !px-6">
                  {submitting ? <CircularProgress size={20} className="!text-green-950" /> : 'Add Waste'}
                </Button>
              </div>
            </form>
          </div>

          {/* Waste History */}
          <div className="bg-green-900 rounded-lg p-4 border border-yellow-500/20 overflow-x-auto shadow">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h3 className="text-xl text-white">Waste History</h3>
              <form onSubmit={handleDownloadMonthly} className="flex flex-wrap gap-2 items-end">
                <div>
                  <label className="block text-yellow-500 mb-1">Year</label>
                  <input type="number" className="p-2 rounded bg-green-950 text-white border border-yellow-500/40" value={report.year} onChange={e => setReport(r => ({ ...r, year: Number(e.target.value) }))} min={2000} max={2100} />
                </div>
                <div>
                  <label className="block text-yellow-500 mb-1">Month</label>
                  <select className="p-2 rounded bg-green-950 text-white border border-yellow-500/40" value={report.month} onChange={e => setReport(r => ({ ...r, month: Number(e.target.value) }))}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" variant="contained" className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600">Download Monthly Waste Report</Button>
              </form>
            </div>
            <div className="border-t border-yellow-500/10 my-4" />
            <table className="w-full">
              <thead className="bg-green-50">
                <tr>
                  <th className="p-3 text-left text-white bg-yellow-500">Waste ID</th>
                  <th className="p-3 text-left text-white bg-yellow-500">Plant Name</th>
                  <th className="p-3 text-left text-white bg-yellow-500">Size</th>
                  <th className="p-3 text-left text-white bg-yellow-500">Quantity</th>
                  <th className="p-3 text-left text-white bg-yellow-500">Reason</th>
                  <th className="p-3 text-left text-white bg-yellow-500">Date</th>
                  <th className="p-3 text-left text-white bg-yellow-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {wastes.map(w => (
                  <tr key={w._id} className="border-b text-white border-green-100 hover:bg-green-800/50">
                    <td className="p-3 font-mono text-xs break-all">{w._id}</td>
                    <td className="p-3">{w.plantId?.plantName || 'N/A'}</td>
                    <td className="p-3">{w.size}</td>
                    <td className="p-3">{w.quantity}</td>
                    <td className="p-3">{w.reason || '-'}</td>
                    <td className="p-3">{new Date(w.createdAt || w.date).toLocaleString()}</td>
                    <td className="p-3">
                      <Button onClick={() => handleDownloadReceipt(w._id)} className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600 !py-1 !px-3" variant="contained">Download PDF</Button>
                    </td>
                  </tr>
                ))}
                {wastes.length === 0 && (
                  <tr><td className="p-4 text-center text-green-400" colSpan={7}>No waste records yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WastePage;


