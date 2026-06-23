import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Coins, Smartphone, Key, Search } from 'lucide-react';
import { API_URL, BASE_URL } from '../api/api';

interface AdminPricingProps {
  token: string;
}

export default function AdminPricing({ token }: AdminPricingProps) {
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');

  const filteredRules = pricingRules.filter(rule => 
    (rule.brand || '').toLowerCase().includes(searchVal.toLowerCase()) ||
    (rule.model || '').toLowerCase().includes(searchVal.toLowerCase()) ||
    (rule.type || '').toLowerCase().includes(searchVal.toLowerCase()) ||
    (rule.damage_type || '').toLowerCase().includes(searchVal.toLowerCase())
  );

  // Form Fields
  const [deviceType, setDeviceType] = useState('Smartphone');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [damageType, setDamageType] = useState('');
  const [repairPrice, setRepairPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPricingRules = async () => {
    try {
      const res = await fetch(`${API_URL}/devices/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setPricingRules(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingRules();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: deviceType,
          brand,
          model,
          damage_type: damageType,
          repair_price: parseFloat(repairPrice)
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Pricing rule created successfully!');
        setBrand('');
        setModel('');
        setDamageType('');
        setRepairPrice('');
        fetchPricingRules();
      } else {
        alert(data.message || 'Failed to create pricing rule');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while creating pricing rule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ruleId: number) => {
    if (!confirm('Are you sure you want to delete this pricing rule?')) return;

    try {
      const res = await fetch(`${API_URL}/devices/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setPricingRules(prev => prev.filter(r => r.id !== ruleId));
      } else {
        alert(data.message || 'Failed to delete pricing rule');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting pricing rule');
    }
  };

  return (
    <div className="p-5 bg-[#f9f9fc] min-h-screen space-y-6">
      {/* Add Pricing Rule Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-[#004c4c] uppercase tracking-wider flex items-center gap-1.5">
          <Coins className="h-4 w-4" /> Add Pricing Rule
        </h3>

        {/* Device Type */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Device Category</label>
          <select
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#004c4c] transition-colors"
          >
            {['Smartphone', 'Laptop', 'TV', 'Tablet', 'Smartwatch', 'Audio'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Brand Name</label>
          <input
            type="text"
            required
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Apple, Samsung, Dell"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#004c4c] transition-colors"
          />
        </div>

        {/* Model */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Model Name</label>
          <input
            type="text"
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. iPhone 15 Pro, Galaxy S24, XPS 15"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#004c4c] transition-colors"
          />
        </div>

        {/* Damage Type */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Damage / Issue Type</label>
          <input
            type="text"
            required
            value={damageType}
            onChange={(e) => setDamageType(e.target.value)}
            placeholder="e.g. Broken Screen, Battery Issue, Charging Port"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#004c4c] transition-colors"
          />
        </div>

        {/* Price */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Repair Cost (₹)</label>
          <input
            type="number"
            required
            value={repairPrice}
            onChange={(e) => setRepairPrice(e.target.value)}
            placeholder="e.g. 1999"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#004c4c] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 bg-[#004c4c] hover:bg-[#006666] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Add Rate Rule</>}
        </button>
      </form>

      {/* Pricing list table */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Pricing Inventory</h3>
          {pricingRules.length > 0 && (
            <span className="text-[10px] font-bold text-slate-400">{filteredRules.length} of {pricingRules.length} rules</span>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by brand, model, type, or issue..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#004c4c]/40 transition-all shadow-xs"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 text-amber-600 animate-spin" />
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl text-center border border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-400">
              {pricingRules.length > 0 ? "No matching pricing rules found." : "No pricing rules set up yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredRules.map((rule) => (
              <div key={rule.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#004c4c]">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 leading-tight">
                      {rule.brand} {rule.model}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                      {rule.damage_type} • <span className="text-slate-500">{rule.type}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-[#004c4c]">₹{rule.repair_price}</span>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 hover:text-red-600 transition-colors active:scale-90"
                    title="Delete Pricing Rule"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
