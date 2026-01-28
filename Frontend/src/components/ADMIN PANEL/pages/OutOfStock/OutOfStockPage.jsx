import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';
import { Button } from '@mui/material';
import logo from "../../../../../public/img/logo.png"

const OutOfStockPage = () => {
  const { token } = useAuth();
  const [plants, setPlants] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [plantsRes, purchasesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/plants/all`, authHeaders),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/purchases`, authHeaders)
        ]);

        if (!mounted) return;
        const plantData = plantsRes.data?.data || [];
        const purchaseData = purchasesRes.data?.data || [];
        setPlants(plantData);
        setPurchases(purchaseData);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || 'Failed to load data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (token) load();
    return () => { mounted = false; };
  }, [token]);

  const plantIdToLastPurchase = useMemo(() => {
    const map = new Map();
    purchases.forEach(p => {
      const key = p.plantId?._id || p.plantId;
      const date = new Date(p.createdAt || p.date);
      if (key) {
        const prev = map.get(key);
        if (!prev || date > prev) map.set(key, date);
      }
    });
    return map;
  }, [purchases]);

  const outOfStockPlants = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (plants || []).filter(p => {
      const totalQty = (p.stockQuantity?.small || 0) + (p.stockQuantity?.medium || 0) + (p.stockQuantity?.large || 0);
      if (totalQty !== 0) return false;
      if (!q) return true;
      const name = (p.plantName || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      return name.includes(q) || category.includes(q);
    });
  }, [plants, search]);

  const handleExportPdf = () => {
    const popup = window.open('', '_blank');
    if (!popup) return;
    const rows = outOfStockPlants.map(p => {
      const last = plantIdToLastPurchase.get(p._id);
      return `<tr>
        <td style="padding:8px;border:1px solid #ddd">${p.plantName || ''}</td>
        <td style="padding:8px;border:1px solid #ddd">${p.category || ''}</td>
        <td style="padding:8px;border:1px solid #ddd">0</td>
        <td style="padding:8px;border:1px solid #ddd">${last ? new Date(last).toLocaleString() : '-'}</td>
      </tr>`;
    }).join('');
    popup.document.write(`
      <html>
        <head>
          <title>Out of Stock Plants</title>
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { text-align:center; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #eab308; color: #052e16; padding: 8px; border: 1px solid #ddd; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Out of Stock Plants</h1>
          <table>
            <thead>
              <tr>
                <th>Plant Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Last Purchased</th>
              </tr>
            </thead>
            <tbody>
              ${rows || ''}
            </tbody>
          </table>
          <div style="margin-top:12px;text-align:right;font-size:12px">Generated: ${new Date().toLocaleString()}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    popup.document.close();
  };

  return (
    <div className="p-6 bg-green-950 rounded-lg shadow space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-2xl font-bold text-yellow-500">Out of Stock Plants</h2>
        <div className="flex gap-2 items-center">
          <input
            className="p-2 rounded bg-green-900 text-white border border-yellow-500/30 min-w-[220px]"
            placeholder="Search by name or category"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button onClick={handleExportPdf} variant="contained" className="!bg-yellow-500 !text-green-950 hover:!bg-yellow-600">Export PDF</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-yellow-500 py-8">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-400 py-8">{error}</div>
      ) : (
        <div className="bg-green-900 rounded-lg p-4 border border-yellow-500/20 overflow-x-auto">
          {outOfStockPlants.length === 0 ? (
            <div className="text-center text-green-400">All plants in stock <span className="ml-2 px-2 py-1 bg-green-800 text-green-200 rounded-full text-xs">0 out-of-stock</span></div>
          ) : (
            <table className="w-full">
              <thead className="bg-green-50">
                <tr>
                  <th className="p-3 text-left text-white bg-yellow-500">Image</th>
                  <th className="p-3 text-left text-white bg-yellow-500">Plant Name</th>
                  <th className="p-3 text-left text-white bg-yellow-500">Category</th>
                  <th className="p-3 text-left text-white bg-yellow-500">Quantity</th>
                  <th className="p-3 text-left text-white bg-yellow-500">Last Purchased Date</th>
                </tr>
              </thead>
              <tbody>
                {outOfStockPlants.map(p => {
                  const last = plantIdToLastPurchase.get(p._id);
                  return (
                    <tr key={p._id} className="border-b text-white border-green-100 hover:bg-green-900/60">
                      <td className="p-3">
                        <div className="w-16 h-16 overflow-hidden rounded bg-green-800 flex items-center justify-center">
                          <img
                            src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${p.plantImage}`}
                          alt={p.plantName}
                            className="object-cover w-full h-full"
                            onError={(e) => { e.currentTarget.src = {logo}; }}
                          />
                        </div>
                      </td>
                      <td className="p-3">{p.plantName}</td>
                      <td className="p-3">{p.category}</td>
                      <td className="p-3">0</td>
                      <td className="p-3">{last ? new Date(last).toLocaleString() : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default OutOfStockPage;


