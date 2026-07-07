import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingDown, CheckCircle2, Wrench,
  Loader2, Building2, Receipt, AlertTriangle, ArrowDownLeft, BrainCircuit
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';

/* ─────────────── helper formatters ─────────────── */
const fmt = (num) =>
  Number(num).toLocaleString('ms-MY', { minimumFractionDigits: 2 });

const statusStyle = {
  'Selesai':      'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Dalam Proses': 'bg-indigo-50  text-indigo-700  border-indigo-200',
  'Ditolak':      'bg-rose-50    text-rose-700    border-rose-200',
};

/* ─────────────── sub‑components ─────────────── */
function StatCard({ icon: Icon, label, value, sub, color, bg, border }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className={`bg-white rounded-3xl p-6 border ${border} shadow-sm flex flex-col gap-3`}
    >
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center ${color} border ${border}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
        <h4 className="text-2xl font-black text-slate-900 mt-0.5">{value}</h4>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

/* ─────────────── main page ─────────────── */
export default function LogBajet() {
  const [userData,  setUserData]  = useState(null);
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const displayStatus = (s) => ({ 'Selesai': 'Completed', 'Dalam Proses': 'In Progress', 'Ditolak': 'Rejected' })[s] || s;
  
  const displayCategory = (c) => ({
    'Jalan Berlubang': 'Pothole',
    'Banjir': 'Flood',
    'Anjing Liar / Haiwan Terbiar': 'Stray Animal',
    'Haiwan Liar': 'Stray Animal',
    'Pembuangan Sampah Haram': 'Illegal Dumping',
    'Lampu Jalan Rosak': 'Faulty Streetlight',
    'Longkang Tersumbat/Pecah': 'Clogged Drain',
    'Longkang Tersumbat': 'Clogged Drain',
    'Pokok Tumbang': 'Fallen Tree',
    'Infrastruktur Awam': 'Public Infrastructure',
    'Lain-lain': 'Others'
  })[c] || c;

  useEffect(() => {
    const fetchAll = async (isInitial = true) => {
      const token = localStorage.getItem('token');
      const h = { Authorization: `Bearer ${token}` };
      try {
        if (isInitial) setLoading(true);
        const [userRes, bajetRes] = await Promise.all([
          axios.get(`/api/user`,         { headers: h }),
          axios.get(`/api/pegawai/bajet`,{ headers: h }),
        ]);
        setUserData(userRes.data);
        setData(bajetRes.data);
      } catch (err) {
        console.error("Ralat memuatkan data bajet:", err);
      } finally {
        if (isInitial) setLoading(false);
      }
    };
    fetchAll(true);
    const interval = setInterval(() => fetchAll(false), 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-800" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="text-center text-slate-500">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-rose-400" />
          <p className="font-medium">No budget data found or server is being updated.</p>
          <p className="text-xs mt-1">Please ensure the server is running (restart if necessary).</p>
        </div>
      </div>
    );
  }

  const { jabatan, ringkasan, transaksi } = data;
  const peratus   = ringkasan.peratus_penggunaan;
  const isKritis  = peratus >= 85;
  const barColor  = peratus >= 85 ? 'bg-rose-500' : peratus >= 60 ? 'bg-amber-400' : 'bg-blue-600';

  const containerVariants = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar userData={userData} />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <header className="px-8 py-6 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-800">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Micro-Budget Log</h2>
              <p className="text-sm text-slate-500 font-medium">
                {jabatan.nama_jabatan} &bull; Annual Allocation: RM {fmt(jabatan.bajet_tahunan)}
              </p>
            </div>
          </div>

          {/* Peringatan kritis */}
          {isKritis && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-2 rounded-2xl">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Budget exceeds 85% — please review expenditures!
            </div>
          )}
        </header>

        <main className="flex-1 overflow-auto p-8 space-y-8">
          <motion.div variants={containerVariants} initial="hidden" animate="show">

            {/* ── Budget Meter Card ── */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden mb-8"
            >
              {/* decorative bg icon */}
              <div className="absolute -top-6 -right-6 opacity-5">
                <Wallet className="w-52 h-52" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                {/* left — baki + used */}
                <div>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Current Department Balance</p>
                  <h3 className="text-5xl font-black mb-4">RM {fmt(jabatan.baki_semasa)}</h3>

                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Annual Allocation</p>
                      <p className="font-black text-white">RM {fmt(jabatan.bajet_tahunan)}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-600" />
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Spent</p>
                      <p className="font-black text-rose-400">RM {fmt(ringkasan.jumlah_dibelanjakan)}</p>
                    </div>
                  </div>
                </div>

                {/* right — donut‑style percentage */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="10" />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke={peratus >= 85 ? '#f87171' : peratus >= 60 ? '#fbbf24' : '#2563eb'}
                        strokeWidth="10"
                        strokeDasharray={`${peratus * 2.513} 251.3`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-black">
                      {peratus}%
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Budget Utilization</p>
                </div>
              </div>

              {/* progress bar */}
              <div className="relative z-10 mt-6">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                  <span>0%</span>
                  <span className={peratus >= 85 ? 'text-rose-400' : 'text-slate-400'}>
                    {peratus}% utilized
                  </span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className={`${barColor} h-3 rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min(peratus, 100)}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
              <StatCard
                icon={Receipt} label="Total Orders" value={ringkasan.bilangan_kerja}
                sub="work orders issued"
                color="text-blue-800" bg="bg-blue-50" border="border-blue-100"
              />
              <StatCard
                icon={CheckCircle2} label="Completed Jobs" value={ringkasan.kerja_selesai}
                sub="successfully resolved"
                color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100"
              />
              <StatCard
                icon={Wrench} label="In Progress" value={ringkasan.kerja_dalam_proses}
                sub="currently active"
                color="text-indigo-600" bg="bg-indigo-50" border="border-indigo-100"
              />
              <StatCard
                icon={TrendingDown} label="Expenditure" value={`RM ${fmt(ringkasan.jumlah_dibelanjakan)}`}
                sub={`balance RM ${fmt(jabatan.baki_semasa)}`}
                color="text-rose-600" bg="bg-rose-50" border="border-rose-100"
              />
              <StatCard
                icon={BrainCircuit} label="AI Cost Savings" value={`RM ${fmt(ringkasan.jumlah_penjimatan)}`}
                sub="avoided from clustered jobs"
                color="text-purple-600" bg="bg-purple-50" border="border-purple-100"
              />
            </div>

            {/* ── Transaction Log Table ── */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownLeft className="w-5 h-5 text-blue-800" />
                  <h4 className="text-lg font-black text-slate-800">Expenditure Transaction Log</h4>
                </div>
                <span className="text-xs text-slate-400 font-bold">{transaksi.length} records</span>
              </div>

              <div className="overflow-x-auto">
                {transaksi.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 font-medium">
                    No expenditure transactions recorded yet.
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Order No.</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Job Type</th>
                        <th className="px-6 py-4">Contractor</th>
                        <th className="px-6 py-4 text-right">Estimated Cost (RM)</th>
                        <th className="px-6 py-4 text-right">Cluster Savings (RM)</th>
                        <th className="px-6 py-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transaksi.map((t, i) => (
                        <motion.tr
                          key={t.id_arahan}
                          variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono text-xs font-black text-blue-800">{t.id_arahan}</td>
                          <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{t.tarikh}</td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800">{displayCategory(t.jenis_kerosakan)}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[180px]">{t.alamat_lokasi}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-700">{t.kontraktor}</p>
                            <p className="text-xs text-slate-400">{t.no_pengguna_kontraktor}</p>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-slate-800">
                            RM {fmt(t.kos_anggaran)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-purple-600">
                            {t.penjimatan_ai > 0 ? `+ RM ${fmt(t.penjimatan_ai)}` : '-'}
                            {t.anak_aduan_count > 0 && <p className="text-[10px] text-purple-400 font-medium">({t.anak_aduan_count} clusters)</p>}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle[t.status_kerja] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                              {displayStatus(t.status_kerja)}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                    {/* total row */}
                    <tfoot>
                      <tr className="bg-slate-50 border-t-2 border-slate-200">
                        <td colSpan={4} className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                          Total Summary
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900 text-base">
                          RM {fmt(ringkasan.jumlah_dibelanjakan)}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-purple-600 text-base">
                          RM {fmt(ringkasan.jumlah_penjimatan)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </motion.div>

          </motion.div>
        </main>
      </div>
    </div>
  );
}
