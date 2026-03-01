import { useEffect, useState } from 'react';
import { Loader2, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { api } from '../lib/api';

const fmt  = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n ?? 0);

const COLOURS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#84cc16','#f97316'];

function buildLastNMonths(n = 6) {
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

export default function Reports() {
  const [monthlyData, setMonthly] = useState([]);
  const [loading, setLoading]     = useState(true);
  const months = buildLastNMonths(6);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const results = await Promise.allSettled(
          months.map(m => api.transactions.summary(m))
        );
        const rows = results.map((r, i) => {
          const d = r.status === 'fulfilled' ? r.value.data : null;
          return {
            month:     months[i].slice(5) + '/' + months[i].slice(0, 4),
            billSpend: d?.billSpend   ?? 0,
            total:     d?.totalSpend  ?? 0,
          };
        });
        setMonthly(rows);
      } catch { /* no-op */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const latestMonth = monthlyData[monthlyData.length - 1];
  const hasData = monthlyData.some(m => m.total > 0 || m.billSpend > 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">Spending analysis for your business bills over the last 6 months</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : !hasData ? (
        <div className="text-center py-24 text-slate-400">
          <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-slate-600">No spending data yet</p>
          <p className="text-sm mt-1">Connect your bank account and sync transactions to see reports.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bill vs Total spend trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Bills vs total spend (6 months)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData} margin={{ top: 0, right: 50, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left"  tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `£${v}`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#3b82f6' }} axisLine={false} tickLine={false} tickFormatter={v => `£${v}`} />
                <Tooltip formatter={v => fmt(v)} />
                <Legend />
                <Line yAxisId="left"  type="monotone" dataKey="total"     stroke="#94a3b8" strokeWidth={2} name="Total spend" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="billSpend" stroke="#3b82f6" strokeWidth={2} name="Bill spend"  dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly bill spend bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Monthly bill spend</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `£${v}`} />
                <Tooltip formatter={v => fmt(v)} />
                <Bar dataKey="billSpend" name="Bill spend" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary row */}
          {latestMonth && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Bill spend (latest month)',  value: fmt(latestMonth.billSpend) },
                { label: 'Total spend (latest month)', value: fmt(latestMonth.total) },
                { label: 'Bills as % of spend',
                  value: latestMonth.total > 0
                    ? `${((latestMonth.billSpend / latestMonth.total) * 100).toFixed(0)}%`
                    : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
