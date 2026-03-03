import { useEffect, useState } from 'react';
import { Loader2, BarChart2, Download } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { api } from '../lib/api';

const fmt  = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n ?? 0);

const COLOURS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#84cc16','#f97316','#64748b','#94a3b8'];

const CATEGORY_LABELS = {
  energy: 'Energy', water: 'Water', telecoms: 'Telecoms',
  insurance: 'Insurance', software: 'Software', rates: 'Business Rates',
  rent: 'Rent', mortgage: 'Mortgage', waste: 'Waste',
  tax: 'Tax', postage: 'Postage', payment_processing: 'Payment Processing',
  compliance: 'Compliance', unknown: 'Other',
};

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

function CustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function Reports() {
  const [monthlyData, setMonthly] = useState([]);
  const [bills, setBills]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const months = buildLastNMonths(6);

  useEffect(() => {
    document.title = 'Reports | Vpayit';
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [summaryResults, billsRes] = await Promise.allSettled([
        Promise.allSettled(months.map(m => api.transactions.summary(m))),
        api.bills.list({ status: 'active' }),
      ]);

      if (summaryResults.status === 'fulfilled') {
        const rows = summaryResults.value.map((r, i) => {
          const d = r.status === 'fulfilled' ? r.value.data : null;
          return {
            month:     months[i].slice(5) + '/' + months[i].slice(0, 4),
            billSpend: d?.billSpend   ?? 0,
            total:     d?.totalSpend  ?? 0,
          };
        });
        setMonthly(rows);
      }

      if (billsRes.status === 'fulfilled') {
        setBills(billsRes.value.data ?? []);
      }
    } catch { /* no-op */ }
    finally { setLoading(false); }
  }

  function downloadCsv() {
    const rows = [['Month', 'Bill Spend (£)', 'Total Spend (£)']];
    monthlyData.forEach(r => rows.push([r.month, r.billSpend.toFixed(2), r.total.toFixed(2)]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vpayit-reports-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const latestMonth = monthlyData[monthlyData.length - 1];
  const hasData = monthlyData.some(m => m.total > 0 || m.billSpend > 0);

  const totalBillSpend  = monthlyData.reduce((s, m) => s + m.billSpend, 0);
  const avgMonthlyBill  = monthlyData.length > 0 ? totalBillSpend / monthlyData.length : 0;
  const annualEstimate  = avgMonthlyBill * 12;
  const highestMonth    = monthlyData.reduce(
    (best, m) => m.billSpend > (best?.billSpend ?? 0) ? m : best, null
  );

  // Pie chart data: group active bills by category
  const pieData = Object.entries(
    bills.reduce((acc, b) => {
      const cat = b.category || 'unknown';
      acc[cat] = (acc[cat] || 0) + (b.current_amount || 0);
      return acc;
    }, {})
  )
    .map(([cat, value]) => ({
      name: CATEGORY_LABELS[cat] || cat,
      value: parseFloat(value.toFixed(2)),
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 text-sm mt-0.5">Spending analysis for your business bills over the last 6 months</p>
        </div>
        {hasData && (
          <button
            onClick={downloadCsv}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-800 font-medium text-sm rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
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
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Annual bill estimate',  value: fmt(annualEstimate),          sub: 'Based on 6-month avg' },
              { label: 'Monthly average',       value: fmt(avgMonthlyBill),          sub: 'Last 6 months' },
              { label: 'Highest month',         value: fmt(highestMonth?.billSpend), sub: highestMonth?.month || '—' },
              { label: 'Bills as % of spend',
                value: latestMonth?.total > 0
                  ? `${((latestMonth.billSpend / latestMonth.total) * 100).toFixed(0)}%`
                  : '—',
                sub: 'Latest month' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
              </div>
            ))}
          </div>

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

          {/* Monthly bill spend bar + Category pie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            {/* Bills by category pie */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Bills by category</h2>
              {pieData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="55%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        labelLine={false}
                        label={<CustomPieLabel />}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLOURS[i % COLOURS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={v => fmt(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2 overflow-hidden">
                    {pieData.map((entry, i) => (
                      <div key={entry.name} className="flex items-center gap-2 text-sm">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: COLOURS[i % COLOURS.length] }}
                        />
                        <span className="text-slate-700 truncate flex-1">{entry.name}</span>
                        <span className="text-slate-900 font-semibold shrink-0">{fmt(entry.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                  No active bills to display.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
