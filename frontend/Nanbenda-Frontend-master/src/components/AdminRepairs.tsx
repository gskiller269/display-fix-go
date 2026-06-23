import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, CheckCircle, Clock, Calendar, MapPin, Shield, Wrench, ChevronRight, X, User,
  Smartphone, Laptop, Loader2, Phone, AlertCircle, Navigation, Gift
} from 'lucide-react';
import TechnicianTracker from './TechnicianTracker';
import { API_URL, BASE_URL } from '../api/api';

interface AdminRepairsProps {
  token: string;
}

export default function AdminRepairs({ token }: AdminRepairsProps) {
  const [repairs, setRepairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'All' | 'Active' | 'Pending' | 'History'>('All');
  const [searchVal, setSearchVal] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showTracker, setShowTracker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchRepairs();
    const interval = setInterval(fetchRepairs, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sync selected order if repairs change
  useEffect(() => {
    if (selectedOrder) {
      const updated = repairs.find(r => r.id === selectedOrder.id);
      if (updated) setSelectedOrder(updated);
    } else {
      setShowTracker(false);
    }
  }, [repairs]);

  const fetchRepairs = async () => {
    try {
      const response = await fetch(`${API_URL}/repairs/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRepairs(data.data);
      }
    } catch (error) {
      console.error('Error fetching repairs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Status mapping
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

  // Filter list
  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch = 
      repair.id.toString().includes(searchVal) ||
      repair.customer_name?.toLowerCase().includes(searchVal.toLowerCase()) ||
      repair.device_model?.toLowerCase().includes(searchVal.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterTab === 'All') return true;
    if (filterTab === 'Pending') return repair.status === 'pending';
    if (filterTab === 'Active') return ['technician_assigned', 'on_the_way', 'reached', 'repaired', 'payment_done'].includes(repair.status);
    if (filterTab === 'History') return repair.status === 'completed';
    return true;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'payment_done': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'repaired': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-teal-50 text-teal-700 border-teal-100';
    }
  };

  return (
    <div className="flex-grow p-5 bg-[#f9f9fc] animate-fadeIn select-none pb-28">
      {!selectedOrder ? (
        <div className="space-y-6">
          <header className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Repair Logistics</h2>
            <div className="bg-[#004c4c]/10 text-[#004c4c] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Live Monitoring
            </div>
          </header>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Repair ID, Customer, or Model..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#004c4c]/40 transition-all shadow-xs"
            />
          </div>

          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
            {(['All', 'Active', 'Pending', 'History'] as const).map((tab) => {
              const isActive = filterTab === tab;
              let count = 0;
              if (tab === 'All') count = repairs.length;
              else if (tab === 'Pending') count = repairs.filter(r => r.status === 'pending').length;
              else if (tab === 'Active') count = repairs.filter(r => ['technician_assigned', 'on_the_way', 'reached', 'repaired', 'payment_done'].includes(r.status)).length;
              else if (tab === 'History') count = repairs.filter(r => r.status === 'completed').length;

              return (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-white text-[#004c4c] shadow-sm ring-1 ring-slate-200' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">{tab}</span>
                  <span className={`text-lg font-black leading-none mt-0.5 ${isActive ? 'text-[#004c4c]' : 'text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-[#004c4c] animate-spin mb-4" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing with database...</p>
            </div>
          ) : filteredRepairs.length > 0 ? (
            <div className="grid gap-4">
              {filteredRepairs.map((repair) => (
                <div 
                  key={repair.id}
                  onClick={() => setSelectedOrder(repair)}
                  className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-[#004c4c]/30 transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 text-[#004c4c] rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-[#004c4c] group-hover:text-white transition-colors">
                        <Smartphone className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">REP-{repair.id}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${getStatusBadgeClass(repair.status)}`}>
                            {statusLabels[repair.status] || repair.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 mt-0.5">{repair.device_brand} {repair.device_model}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-800 leading-none">₹{repair.repair_price || '---'}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">EST. PRICE</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="h-3 w-3 text-slate-500" />
                      </div>
                      <span className="text-xs font-black text-slate-600 truncate max-w-[120px]">{repair.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span className="text-[10px] font-bold">{new Date(repair.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-sm font-black text-slate-800">No repairs found</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Adjust your filters or search query.</p>
            </div>
          )}
        </div>
      ) : (
        /* Detailed Repair Journey */
        <div className="animate-fadeIn">
          <header className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-[#004c4c]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Repair Details</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">REP-{selectedOrder.id}</p>
            </div>
          </header>

          <div className="space-y-6">
            {/* Main Info Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-[#004c4c]">{selectedOrder.device_brand} {selectedOrder.device_model}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-amber-100">
                      {selectedOrder.problem_type}
                    </span>
                    <span className="bg-slate-100 text-slate-900 px-2.5 py-1 rounded-lg text-[10px] font-black border border-slate-200">
                      ₹{Number(selectedOrder.price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-[#004c4c] border border-teal-100">
                  <Smartphone className="h-8 w-8" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                  <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Customer</p>
                    <p className="text-sm font-bold text-slate-800">{selectedOrder.customer_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-3 w-3 text-[#004c4c]" />
                      <a href={`tel:${selectedOrder.mobile_number}`} className="text-xs font-medium text-[#004c4c] underline">{selectedOrder.mobile_number}</a>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Service Location</p>
                    <p className="text-xs font-bold text-slate-800 leading-relaxed">
                      {selectedOrder.address_line1}, {selectedOrder.city} - {selectedOrder.pincode}
                    </p>
                  </div>
                </div>

                {selectedOrder.problem_description && (
                  <div className="flex gap-4 p-4 bg-red-50/30 rounded-2xl border border-red-50">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none mb-1">Issue Reported</p>
                      <p className="text-xs font-medium text-slate-700 italic">"{selectedOrder.problem_description}"</p>
                    </div>
                  </div>
                )}

                {selectedOrder.reward && (
                  <div className="flex gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden animate-fadeIn">
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                      <Gift className="w-24 h-24 text-emerald-500" />
                    </div>
                    <Gift className="h-5 w-5 text-emerald-500 mt-0.5 relative z-10" />
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Customer Won Reward</p>
                      <p className="text-xs font-bold text-emerald-800">{selectedOrder.reward}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Uploaded Diagnostic Images */}
            {selectedOrder.image_url && (
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Uploaded Images</h4>
                <div className="flex gap-3 overflow-x-auto py-2">
                  {selectedOrder.image_url.split(',').map((imgUrl: string, idx: number) => {
                    const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${BASE_URL}${imgUrl}`;
                    return (
                      <img
                        key={idx}
                        src={fullUrl}
                        alt="Diagnostic"
                        onClick={() => setSelectedImage(fullUrl)}
                        className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Track Technician Button */}
            {selectedOrder.status === 'technician_assigned' && (
              <div className="animate-bounceIn">
                {!showTracker ? (
                  <button 
                    onClick={() => setShowTracker(true)}
                    className="w-full py-4 bg-[#004c4c] text-white rounded-3xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-teal-900/20 active:scale-95 transition-all"
                  >
                    <Navigation className="h-5 w-5" />
                    Track Technician Live
                  </button>
                ) : (
                  <TechnicianTracker 
                    repairId={selectedOrder.id} 
                    customerLat={parseFloat(selectedOrder.user_lat || '11.6643')} 
                    customerLng={parseFloat(selectedOrder.user_lng || '78.1460')} 
                    token={token} 
                  />
                )}
              </div>
            )}

            {/* Journey Timeline */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Service Progress</h4>
              
              <div className="space-y-8 relative">
                <div className="absolute top-2 bottom-2 left-[11px] w-[2px] bg-slate-100" />

                {[
                  { key: 'pending', label: 'Repair Logged', sub: 'Repair request logged' },
                  { key: 'technician_assigned', label: 'Technician Assigned', sub: 'Assigned to nearest expert' },
                  { key: 'on_the_way', label: 'On the Way', sub: 'Technician is travelling' },
                  { key: 'reached', label: 'At Destination', sub: 'Repair started at doorstep' },
                  { key: 'repaired', label: 'Repaired Successful', sub: 'Quality testing complete' },
                  { key: 'payment_done', label: 'Payment Done', sub: 'Payment received' },
                  { key: 'completed', label: 'Service Completed', sub: 'Service closed successfully' }
                ].map((item, idx) => {
                  const currentIdx = statusIndexes[selectedOrder.status];
                  const isDone = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;
                  
                  return (
                    <div key={item.key} className="flex gap-6 relative pl-7">
                      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 border-4 border-white shadow-sm transition-all ${
                        isDone ? 'bg-[#004c4c] scale-110' : 'bg-slate-200'
                      }`}>
                        {isDone && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h5 className={`text-xs font-black transition-colors ${
                          isDone ? 'text-slate-900' : 'text-slate-400'
                        } ${isCurrent ? 'text-[#004c4c] flex items-center gap-2' : ''}`}>
                          {item.label}
                          {isCurrent && <span className="w-2 h-2 rounded-full bg-[#004c4c] animate-ping" />}
                        </h5>
                        <p className={`text-[10px] font-bold transition-colors ${
                          isDone ? 'text-slate-500' : 'text-slate-350'
                        }`}>
                          {item.sub}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Support Link for Admins */}
            <div className="bg-[#004c4c]/5 border border-[#004c4c]/10 p-6 rounded-3xl text-center">
              <p className="text-xs font-bold text-[#004c4c] mb-3">System management view only</p>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-xs font-black text-white bg-[#004c4c] px-6 py-2.5 rounded-xl uppercase tracking-widest hover:bg-[#004c4c]/90 transition-all active:scale-95"
              >
                Back to Logistics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-full max-h-[80vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white active:scale-90 transition-transform"
            >
              <X className="h-6 w-6" />
            </button>
            <img src={selectedImage} alt="Fullscreen View" className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl animate-scaleIn" />
          </div>
        </div>
      )}
    </div>
  );
}
