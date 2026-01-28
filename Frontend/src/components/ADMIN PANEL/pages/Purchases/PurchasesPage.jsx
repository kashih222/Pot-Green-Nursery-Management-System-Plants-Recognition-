import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';
import { Button, CircularProgress } from '@mui/material';
import { Helmet } from 'react-helmet-async';

const PurchasesPage = () => {
  const { token } = useAuth();
  const [plants, setPlants] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [report, setReport] = useState({ year: new Date().getFullYear(), month: (new Date().getMonth() + 1) });

  const [form, setForm] = useState({
    plantId: '',
    nurseryName: '',
    size: 'small',
    quantity: ''
  });

  const authHeaders = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  const fetchPlants = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/plants/all`, authHeaders);
    if (!res.data?.success) throw new Error(res.data?.message || 'Failed to load plants');
    return res.data.data || [];
  };

  const fetchPurchases = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/purchases`, authHeaders);
    if (!res.data?.success) throw new Error(res.data?.message || 'Failed to load purchases');
    return res.data.data || [];
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [plantsData, purchasesData] = await Promise.all([fetchPlants(), fetchPurchases()]);
        if (!isMounted) return;
        setPlants(plantsData);
        setPurchases(purchasesData);
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
        nurseryName: form.nurseryName.trim(),
        size: form.size,
        quantity: Number(form.quantity)
      };

      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/purchases`, payload, authHeaders);
      if (!res.data?.success) throw new Error(res.data?.message || 'Failed to create purchase');

      setSuccess('Purchase recorded, stock updated, and receipt PDF generated');
      setForm({ plantId: '', nurseryName: '', size: 'small', quantity: '' });

      // Refresh lists
      const [plantsData, purchasesData] = await Promise.all([fetchPlants(), fetchPurchases()]);
      setPlants(plantsData);
      setPurchases(purchasesData);
      // Notify dashboard to refresh stats
      window.dispatchEvent(new Event('purchasesUpdated'));
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to submit purchase');
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
      await download(`${import.meta.env.VITE_API_BASE_URL}/api/purchases/pdf/${id}`, `purchase_${id}.pdf`);
      setSuccess('Receipt PDF downloaded');
    } catch (e) {
      setError(e.message || 'Failed to download receipt');
    } finally {
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  const handleDownloadMonthly = async (e) => {
    e.preventDefault();
    try {
      const y = report.year;
      const m = report.month;
      await download(`${import.meta.env.VITE_API_BASE_URL}/api/purchases/pdf/monthly/${y}/${m}`, `purchase_report_${y}_${m}.pdf`);
      setSuccess('Monthly report PDF downloaded');
    } catch (e1) {
      setError(e1.message || 'Failed to download report');
    } finally {
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  return (
    <div className="p-6 bg-green-950 rounded-lg shadow space-y-6">
      <Helmet>
        <title> Purchases | Pot Green Nursery</title>
      </Helmet>
      <h2 className="text-2xl font-bold text-yellow-500">Purchases</h2>

      {loading ? (
        <div className="text-center text-yellow-500 py-8">Loading...</div>
      ) : (
        <div className="space-y-6">
          {/* Add Purchase Form */}
          <div className="bg-green-900 rounded-lg p-4 border border-yellow-500/20 shadow">
            <h3 className="text-xl text-white mb-4">Add Purchase</h3>
            {error && <div className="mb-3 text-red-400">{error}</div>}
            {success && <div className="mb-3 text-green-400">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-yellow-500 mb-1">Plant</label>
                <select
                  name="plantId"
                  value={form.plantId}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-green-950 text-white border border-yellow-500/40"
                  required
                >
                  <option value="">Select a plant</option>
                  {plants.map(p => (
                    <option key={p._id} value={p._id}>
                      {p._id} - {p.plantName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-yellow-500 mb-1">Nursery Name</label>
                <input
                  type="text"
                  name="nurseryName"
                  value={form.nurseryName}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-green-950 text-white border border-yellow-500/40"
                  placeholder="Enter nursery name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-yellow-500 mb-1">Size</label>
                  <select
                    name="size"
                    value={form.size}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-green-950 text-white border border-yellow-500/40"
                    required
                  >
                    <option value="small">small</option>
                    <option value="medium">medium</option>
                    <option value="large">large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-yellow-500 mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    min={1}
                    className="w-full p-2 rounded bg-green-950 text-white border border-yellow-500/40"
                    placeholder="e.g., 10"
                    required
                  />
                </div>
              </div>
              <div>
                <Button
                  type="submit"
                  disabled={submitting}
                  variant="contained"
                  className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600 !px-6"
                >
                  {submitting ? <CircularProgress size={20} className="!text-green-950" /> : 'Add Purchase'}
                </Button>
              </div>
            </form>
          </div>

          {/* Purchase History with PDF controls */}
          <div className="bg-green-900 rounded-lg p-4 border border-yellow-500/20 overflow-x-auto shadow">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h3 className="text-xl text-white">Purchase History</h3>
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
                <Button type="submit" variant="contained" className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600">Download Monthly Report</Button>
              </form>
            </div>
            <div className="border-t border-yellow-500/10 my-4" />
            <table className="w-full">
              <thead className="bg-green-50">
                <tr>
                  <th className="p-3 text-left text-white bg-yellow-500">Purchase ID</th>
                  <th className="p-3 text-left text-white bg-yellow-500">Plant Name</th>
                  <th className="p-3 text-left text-white bg-yellow-500">Nursery</th>
                  <th className="p-3 text-left text-white bg-yellow-500">Size</th>
                  <th className="p-3 text-left text-white bg-yellow-500">Quantity</th>
                  <th className="p-3 text-left text-white bg-yellow-500">Date</th>
                  <th className="p-3 text-left text-white bg-yellow-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(ph => (
                  <tr key={ph._id} className="border-b text-white border-green-100 hover:bg-green-800/50">
                    <td className="p-3 font-mono text-xs break-all">{ph._id}</td>
                    <td className="p-3">{ph.plantId?.plantName || 'N/A'}</td>
                    <td className="p-3">{ph.nurseryName}</td>
                    <td className="p-3">{ph.size}</td>
                    <td className="p-3">{ph.quantity}</td>
                    <td className="p-3">{new Date(ph.createdAt || ph.date).toLocaleString()}</td>
                    <td className="p-3">
                      <Button onClick={() => handleDownloadReceipt(ph._id)} className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600 !py-1 !px-3" variant="contained">Download PDF</Button>
                    </td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr><td className="p-4 text-center text-green-400" colSpan={7}>No purchases yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;


