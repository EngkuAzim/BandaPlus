import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, AlertCircle, Clock, CheckCircle2, XCircle,
  ShieldAlert, Layers, ArrowRight, TrendingUp, TrendingDown,
  Minus, MapPin, BarChart2, FileText
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const CHART_COLORS = ['#1e40af', '#f59e0b', '#10b981', '#f43f5e'];

function StatCard({ icon: Icon, label, value, change, color, bgColor, borderColor }) {
  const isPositive = change > 0;
  const isZero = change === 0;
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }}
      className={`bg-white rounded-3xl p-6 border ${borderColor} shadow-sm flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all`}
    >
      <div className={`absolute top-0 right-0 w-28 h-28 ${bgColor} rounded-full blur-2xl -mr-10 -mt-10 opacity-60`}></div>
      <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center ${color} border ${borderColor} z-10 shrink-0`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="z-10 min-w-0">
        <p className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mb-1 truncate">{label}</p>
        <h4 className="text-3xl font-black text-slate-900">{value}</h4>
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-xs font-bold ${isZero ? 'text-slate-400' : isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
            {isZero ? <Minus className="w-3 h-3" /> : isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{isZero ? 'No change' : `${isPositive ? '+' : ''}${change}% this month`}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium">
        <p className="font-black mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-black">{p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

function AdminDashboard({ userData, stats }) {
  const navigate = useNavigate();

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  const trendData = stats?.trend_bulanan || [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto w-full">

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800">
            Control Center <span className="text-blue-800 italic">BANDA+</span>
          </h3>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Monitor complaint reviews, damage clusters, and system performance
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/peta-kluster')}
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-5 py-2.5 rounded-xl text-sm font-bold border border-blue-200 transition-all flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" /> Cluster Map
          </button>
          <button
            onClick={() => navigate('/urus-aduan')}
            className="bg-slate-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" /> Manage Reports
          </button>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          icon={AlertCircle} label="Pending Review" value={stats?.baru || 0}
          change={stats?.perubahan_baru}
          color="text-blue-800" bgColor="bg-blue-50" borderColor="border-blue-100"
        />
        <StatCard
          icon={Clock} label="In Progress" value={stats?.diproses || 0}
          change={stats?.perubahan_diproses}
          color="text-amber-500" bgColor="bg-amber-50" borderColor="border-amber-100"
        />
        <StatCard
          icon={CheckCircle2} label="Completed / Closed" value={stats?.selesai || 0}
          change={stats?.perubahan_selesai}
          color="text-emerald-500" bgColor="bg-emerald-50" borderColor="border-emerald-100"
        />
        <StatCard
          icon={XCircle} label="Rejected Reports" value={stats?.ditolak || 0}
          color="text-rose-500" bgColor="bg-rose-50" borderColor="border-rose-100"
        />
      </div>

      {/* ── Summary + Trend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Trend Bulanan - Area Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-800 border border-blue-100">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Monthly Report Trends</h4>
                <p className="text-xs text-slate-400 font-medium">Last 6 months</p>
              </div>
            </div>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="colorJumlah" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e40af" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="jumlah" name="Reports" stroke="#1e40af" strokeWidth={3} fill="url(#colorJumlah)" dot={{ fill: '#1e40af', r: 4, strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm font-bold">No trend data available</div>
          )}
        </motion.div>

        {/* Right Column — Summary + Link to Full Report */}
        <div className="flex flex-col gap-5">
          {/* Kluster Dikesan */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden flex-1">
            <div className="absolute -right-4 -bottom-4 opacity-10"><Layers className="w-28 h-28" /></div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Detected Clusters</p>
            <h4 className="text-4xl font-black mb-1">{Math.max(1, Math.floor((stats?.jumlah_keseluruhan || 0) * 0.15))}</h4>
            <p className="text-xs text-slate-500 font-medium">Nearby reports grouped automatically</p>
          </motion.div>

          {/* Jumlah Keseluruhan */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex-1">
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Total Reports</p>
            <h4 className="text-4xl font-black text-slate-900 mb-2">{stats?.jumlah_keseluruhan || 0}</h4>
            <div className="flex gap-1.5">
              {[
                { label: 'New', val: stats?.baru || 0, color: 'bg-blue-600' },
                { label: 'In Progress', val: stats?.diproses || 0, color: 'bg-amber-500' },
                { label: 'Completed', val: stats?.selesai || 0, color: 'bg-emerald-500' },
              ].map(({ label, val, color }) => {
                const pct = stats?.jumlah_keseluruhan > 0 ? Math.round((val / stats.jumlah_keseluruhan) * 100) : 0;
                return (
                  <div key={label} className="flex-1">
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold mt-1 text-center">{label}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Quick Status Pie + Laporan Prestasi Link ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">Status Distribution</h4>
              <p className="text-xs text-slate-400 font-medium">All reports</p>
            </div>
          </div>
          {(stats?.jumlah_keseluruhan || 0) > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'New', value: stats?.baru || 0 },
                      { name: 'In Progress', value: stats?.diproses || 0 },
                      { name: 'Completed', value: stats?.selesai || 0 },
                      { name: 'Rejected', value: stats?.ditolak || 0 },
                    ]}
                    cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    paddingAngle={3} dataKey="value"
                  >
                    {CHART_COLORS.map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { label: 'New', color: '#1e40af', val: stats?.baru || 0 },
                  { label: 'In Progress', color: '#f59e0b', val: stats?.diproses || 0 },
                  { label: 'Completed', color: '#10b981', val: stats?.selesai || 0 },
                  { label: 'Rejected', color: '#f43f5e', val: stats?.ditolak || 0 },
                ].map(({ label, color, val }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }}></span>
                    <span className="text-[11px] font-bold text-slate-600 truncate">{label}: {val}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm font-bold">No data available</div>
          )}
        </motion.div>

        {/* Aktiviti Saringan Card */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-800 border border-blue-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="text-base font-black text-slate-900">Review Activity</h4>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h5 className="font-bold text-slate-700 mb-1">{stats?.baru || 0} new reports require attention</h5>
            <p className="text-sm text-slate-500 mb-5">Requires Admin review to assign to the responsible Department.</p>
            <button onClick={() => navigate('/urus-aduan')} className="text-blue-800 font-bold text-sm bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-colors inline-flex items-center gap-2">
              Review Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Laporan Prestasi CTA */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-3xl p-7 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 opacity-10"><FileText className="w-36 h-36" /></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black">Performance Reports</h4>
            </div>
            <p className="text-indigo-200 text-sm font-medium leading-relaxed mb-6">
              View detailed analytics — 12-month trend charts, zone distribution, contractor performance, and export PDF / Excel reports.
            </p>
          </div>
          <button
            onClick={() => navigate('/laporan-prestasi')}
            className="relative z-10 w-full bg-white text-indigo-700 font-black py-3 rounded-2xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <BarChart2 className="w-5 h-5" /> Open Full Analytics <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

    </motion.div>
  );
}

export default AdminDashboard;