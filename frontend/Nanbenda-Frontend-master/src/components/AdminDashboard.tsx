import React, { useState } from 'react';
import { 
  TrendingUp, Settings, Smartphone, Laptop, Watch, Download, Plus, UserPlus, 
  Search, AlertCircle, Wrench, Coins, ChevronRight, X 
} from 'lucide-react';
import { RepairOrder } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AdminDashboardProps {
  repairs: any[];
  activeRepairsCount: number;
  pendingCount: number;
  revenueTotal: number;
  onNavigateToTab: (tab: 'dashboard' | 'staff' | 'repairs' | 'mart' | 'account') => void;
  onSelectRepair: (repair: any) => void;
}

export default function AdminDashboard({
  repairs,
  activeRepairsCount,
  pendingCount,
  revenueTotal,
  onNavigateToTab,
  onSelectRepair
}: AdminDashboardProps) {

  // Horizontal bar hover tooltip status
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Bar Data
  const chartsData = [
    { day: 'Mon', count: 42, height: 'h-[40%]' },
    { day: 'Tue', count: 68, height: 'h-[65%]' },
    { day: 'Wed', count: 94, height: 'h-[90%]' },
    { day: 'Thu', count: 58, height: 'h-[55%]' },
    { day: 'Fri', count: 79, height: 'h-[75%]' },
    { day: 'Sat', count: 26, height: 'h-[25%]' },
    { day: 'Sun', count: 15, height: 'h-[15%]' }
  ];

  const [selectedRepair, setSelectedRepair] = useState<any | null>(null);

  // Slice to only show top 3 repairs
  const top3Repairs = (repairs || []).slice(0, 3);

  const statusLabels: Record<string, string> = {
    'pending': 'Pending',
    'technician_assigned': 'Assigned',
    'on_the_way': 'On the Way',
    'reached': 'At Location',
    'repaired': 'Repaired',
    'payment_done': 'Payment Done',
    'completed': 'Completed'
  };

  const statusIndexes: Record<string, number> = {
    'pending': 0,
    'technician_assigned': 1,
    'on_the_way': 2,
    'reached': 3,
    'repaired': 4,
    'payment_done': 5,
    'completed': 6
  };

  const potentialRevenue = (repairs || [])
    .filter(r => r.status !== 'completed')
    .reduce((acc, r) => acc + parseFloat(r.repair_price || r.price || 0), 0);

  // Calculate weekly revenue data (Mon-Sun)
  const totalRevenueData = [0, 0, 0, 0, 0, 0, 0];
  const expectedRevenueData = [0, 0, 0, 0, 0, 0, 0];

  (repairs || []).forEach(r => {
    const dateStr = r.created_at || r.submittedAt;
    if (!dateStr) return;
    const date = new Date(dateStr);
    const dayIndex = date.getDay(); // 0: Sun, 1: Mon, ...
    const chartIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Map Sun to index 6, Mon to 0

    const cost = parseFloat((r as any).repair_price || (r as any).price || 0);
    const isCompleted = ['repaired', 'payment_done', 'completed'].includes(String(r.status).toLowerCase());

    if (isCompleted) {
      totalRevenueData[chartIndex] += cost;
    } else {
      expectedRevenueData[chartIndex] += cost;
    }
  });

  return (
    <div className="flex-grow p-5 bg-[#f9f9fc] animate-fadeIn relative">
      {/* Bento Metric Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-teal-50 rounded-xl text-[#004c4c]">
              <Coins className="h-5 w-5" />
            </div>
            <span className="text-emerald-600 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              <TrendingUp className="h-2.5 w-2.5" /> +12%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              Total Revenue
            </p>
            <p className="text-base font-black text-[#004c4c] truncate">₹{revenueTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Expected Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-700">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              Expected Revenue
            </p>
            <p className="text-base font-black text-blue-700 truncate">₹{potentialRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Active Repairs */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="p-2 bg-amber-50 rounded-xl text-amber-700 w-fit">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              Active Repairs
            </p>
            <p className="text-base font-black text-slate-800">{activeRepairsCount}</p>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="p-2 bg-red-50 rounded-xl text-red-500 w-fit">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              Pending Tasks
            </p>
            <p className="text-base font-black text-slate-800">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Chart 1: Weekly Revenue Performance */}
      <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4 animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xs font-black text-[#004c4c] uppercase tracking-wider">
              Weekly Revenue Trend
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Revenue breakdown by days</p>
          </div>
          <button 
            onClick={() => alert("Downloading formatted weekly performance report...")}
            className="text-[#0a6969] hover:underline text-[9px] font-black uppercase tracking-wider flex items-center gap-1"
          >
            Export <Download className="h-3 w-3" />
          </button>
        </div>

        {/* Realtime ChartJS Line Chart */}
        <div className="relative w-full h-36 px-1">
          <Line 
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [
                {
                  label: 'Total Revenue',
                  data: totalRevenueData,
                  fill: false,
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  borderWidth: 2.5,
                  tension: 0.38,
                  pointBackgroundColor: '#fff',
                  pointBorderColor: '#10b981',
                  pointBorderWidth: 2,
                  pointRadius: 4.5,
                  pointHoverRadius: 6.5,
                  pointHoverBackgroundColor: '#10b981',
                  pointHoverBorderColor: '#fff',
                  pointHoverBorderWidth: 2,
                },
                {
                  label: 'Expected Revenue',
                  data: expectedRevenueData,
                  fill: false,
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  borderWidth: 2.5,
                  tension: 0.38,
                  pointBackgroundColor: '#fff',
                  pointBorderColor: '#3b82f6',
                  pointBorderWidth: 2,
                  pointRadius: 4.5,
                  pointHoverRadius: 6.5,
                  pointHoverBackgroundColor: '#3b82f6',
                  pointHoverBorderColor: '#fff',
                  pointHoverBorderWidth: 2,
                }
              ]
            }} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  labels: {
                    boxWidth: 8,
                    font: { size: 8, weight: 'bold' }
                  }
                },
                tooltip: {
                  enabled: true,
                  backgroundColor: '#0f172a',
                  titleFont: { size: 9, weight: 'bold' },
                  bodyFont: { size: 9 },
                  padding: 8,
                  cornerRadius: 8,
                  displayColors: true,
                  callbacks: {
                    label: (context) => ` ${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`
                  }
                }
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    font: {
                      size: 8,
                      weight: 'bold',
                    },
                    color: '#94a3b8',
                  }
                },
                y: {
                  grid: {
                    color: '#f1f5f9',
                  },
                  ticks: {
                    font: {
                      size: 8,
                      weight: 'bold',
                    },
                    color: '#94a3b8',
                  }
                }
              }
            }}
          />
        </div>
      </section>

      {/* Grid of Chart 2 & Chart 3 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Chart 2: Device Share (Progress Bars) */}
        <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-[#004c4c] uppercase tracking-wider mb-0.5">
              Device Shares
            </h3>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-4">Volume per category</p>
          </div>
          
          <div className="space-y-3">
            {[
              { type: 'Smartphone', share: 58, color: 'bg-teal-600' },
              { type: 'Laptop', share: 26, color: 'bg-amber-500' },
              { type: 'TV/Audio', share: 11, color: 'bg-emerald-500' },
              { type: 'Others', share: 5, color: 'bg-slate-400' }
            ].map(cat => (
              <div key={cat.type} className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase">
                  <span>{cat.type}</span>
                  <span>{cat.share}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chart 3: Revenue Trend (Spark Area Trend) */}
        <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-[#004c4c] uppercase tracking-wider mb-0.5">
              Revenue Growth
            </h3>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-4">Growth trajectory (Jan-May)</p>
          </div>

          <div className="h-20 w-full flex items-end justify-between gap-1.5 px-0.5 relative pt-4">
            {[
              { month: 'Jan', val: 40, height: 'h-[40%]' },
              { month: 'Feb', val: 55, height: 'h-[55%]' },
              { month: 'Mar', val: 50, height: 'h-[50%]' },
              { month: 'Apr', val: 78, height: 'h-[78%]' },
              { month: 'May', val: 95, height: 'h-[95%]' }
            ].map((pt, idx, arr) => (
              <div key={pt.month} className="flex-1 h-full flex flex-col justify-end items-center relative group">
                <div className="absolute -top-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs z-10">
                  +{pt.val}%
                </div>
                
                {/* Simulated area blocks with varying gradients */}
                <div className={`w-full bg-gradient-to-t from-[#004c4c]/5 to-[#004c4c]/30 group-hover:to-[#004c4c]/50 rounded-t-xs transition-all duration-300 ${pt.height}`} />
                <span className="text-[8px] font-black text-slate-400 mt-2.5 uppercase">{pt.month}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent Activity List */}
      <section className="space-y-3 mb-6">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">Recent Activity</h3>
          <button 
            onClick={() => onNavigateToTab('repairs')}
            className="text-xs text-[#0a6969] hover:underline font-extrabold"
          >
            View All
          </button>
        </div>

        <div className="space-y-2">
          {top3Repairs.map((ord) => (
            <div 
              key={ord.id}
              onClick={() => setSelectedRepair(ord)}
              className="bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-4 hover:border-[#004c4c] transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-[#004c4c] group-hover:bg-[#004c4c]/10 transition-colors">
                {ord.deviceType === 'Laptop' ? <Laptop className="h-6 w-6" /> : ord.deviceType === 'Other' ? <Watch className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-800 leading-none">{ord.deviceModel}</p>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-none">
                  REP-{ord.id} • Customer: {ord.customerName || 'Guest'}
                </p>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-50 text-teal-700">
                  {ord.status}
                </span>
                <p className="text-[9.5px] text-slate-400 mt-1.5 font-medium">Just now</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="grid grid-cols-2 gap-3 mb-4">
        <button 
          onClick={() => onNavigateToTab('repairs')}
          className="bg-[#004c4c] hover:bg-[#006666] text-white py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md leading-none"
        >
          <Plus className="h-4 w-4" /> New Repair
        </button>
        <button 
          onClick={() => onNavigateToTab('staff')}
          className="bg-slate-200 text-slate-700 hover:bg-slate-300 py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition-all leading-none"
        >
          <UserPlus className="h-4 w-4" /> Add Tech
        </button>
      </section>

      {/* Slide-Up Detailed Journey Modal */}
      {selectedRepair && (
        <div className="fixed inset-0 z-[100000] bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end p-5 animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 shadow-2xl animate-slideUp space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedRepair.deviceBrand || ''} {selectedRepair.deviceModel}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">REP-{selectedRepair.id}</p>
              </div>
              <button 
                onClick={() => setSelectedRepair(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3.5 text-xs font-bold text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 uppercase text-[9px] tracking-wider">Client Name</span>
                <span>{selectedRepair.customerName || 'Not Provided'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 uppercase text-[9px] tracking-wider">Device Type</span>
                <span>{selectedRepair.deviceType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 uppercase text-[9px] tracking-wider">Estimated Cost</span>
                <span className="text-[#004c4c] font-black">₹{selectedRepair.price || '0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 uppercase text-[9px] tracking-wider">Current Status</span>
                <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded uppercase text-[9px] font-black">{selectedRepair.status}</span>
              </div>
            </div>

            {/* Journey Progress */}
            <div className="space-y-4 pt-2">
              <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Progress Timeline</p>
              <div className="space-y-4 relative">
                <div className="absolute top-1 bottom-1 left-[7px] w-[2px] bg-slate-100" />
                {[
                  { key: 'pending', label: 'Logged', desc: 'Repair booking placed' },
                  { key: 'technician_assigned', label: 'Assigned', desc: 'Partner assigned' },
                  { key: 'on_the_way', label: 'Travelling', desc: 'Partner en-route' },
                  { key: 'reached', label: 'Arrived', desc: 'Work started' },
                  { key: 'repaired', label: 'Fixed', desc: 'Repairs completed' },
                  { key: 'payment_done', label: 'Payment Done', desc: 'Payment received' },
                  { key: 'completed', label: 'Completed', desc: 'Service completed & closed' }
                ].map((step, idx) => {
                  const currentIdx = statusIndexes[selectedRepair.status.toLowerCase().replace(/ /g, '_')] || 0;
                  const isDone = currentIdx >= idx;
                  return (
                    <div key={step.key} className="flex gap-4 relative pl-5 text-xs">
                      <div className={`absolute left-0 top-0.5 w-3.5 h-3.5 rounded-full z-10 border-2 border-white shadow-xs ${
                        isDone ? 'bg-[#004c4c]' : 'bg-slate-200'
                      }`} />
                      <div>
                        <p className={`font-black uppercase tracking-wider ${isDone ? 'text-[#004c4c]' : 'text-slate-400'}`}>{step.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setSelectedRepair(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-2 transition-all active:scale-95"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
