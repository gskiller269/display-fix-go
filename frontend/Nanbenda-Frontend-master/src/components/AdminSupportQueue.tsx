import React, { useState } from 'react';
import { 
  CheckCircle, Hammer, AlertTriangle, ShieldCheck, Clock, User, UserPlus, 
  ChevronRight, Filter, AlertCircle, X, Search
} from 'lucide-react';
import { SupportTicket, Technician } from '../types';

interface AdminSupportQueueProps {
  tickets: SupportTicket[];
  technicians: Technician[];
  onAssignTicket: (ticketId: string, techId: string) => void;
  onResolveTicket: (ticketId: string) => void;
}

export default function AdminSupportQueue({
  tickets,
  technicians,
  onAssignTicket,
  onResolveTicket
}: AdminSupportQueueProps) {
  const [filterCategory, setFilterCategory] = useState<'All' | 'Technical' | 'Billing' | 'General'>('All');
  const [selectedTicketForAssign, setSelectedTicketForAssign] = useState<SupportTicket | null>(null);

  // Stats calculation
  const unresolvedCount = tickets.filter(t => t.status !== 'Resolved').length;
  const highPriorityCount = tickets.filter(t => t.priority === 'High' && t.status !== 'Resolved').length;

  // Filter logic
  const filteredTickets = tickets.filter(ticket => {
    if (filterCategory === 'All') return true;
    return ticket.category === filterCategory;
  });

  return (
    <div className="flex-grow p-4 bg-[#f9f9fc] animate-fadeIn">
      {/* Overview stats header */}
      <section className="mb-6">
        <h2 className="text-xl font-black text-slate-900 leading-tight">Support Queue</h2>
        <div className="mt-3 flex gap-2">
          <span className="bg-red-550 bg-red-50 text-red-600 border border-red-150 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" /> {unresolvedCount} Unresolved
          </span>
          <span className="bg-amber-50 text-amber-700 border border-amber-150 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 animate-pulse" /> {highPriorityCount} Urgent
          </span>
        </div>
      </section>

      {/* Category Tags filter slider */}
      <section className="mb-6 flex gap-1.5 overflow-x-auto pb-1 select-none">
        {(['All', 'Technical', 'Billing', 'General'] as const).map((cat) => {
          const isActive = filterCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 text-xs font-black rounded-xl border transition-all select-none whitespace-nowrap ${
                isActive 
                  ? 'bg-[#004c4c] text-white border-transparent shadow-xs' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-350'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </section>

      {/* Tickets Container list */}
      <div className="space-y-3">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((t) => {
            const assignedTech = technicians.find(tc => tc.id === t.assignedTechId);
            return (
              <div 
                key={t.id}
                className={`bg-white border rounded-xl p-4 transition-all shadow-2xs relative overflow-hidden flex flex-col gap-3 border ${
                  t.status === 'Resolved' ? 'border-dashed border-slate-200 opacity-60' : 'border-slate-150'
                }`}
              >
                {/* Priority edge color strip */}
                <div className={`absolute top-0 bottom-0 left-0 w-[4px] ${
                  t.priority === 'High' ? 'bg-red-500' : t.priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-400'
                }`} />

                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold font-mono tracking-wider">
                      {t.id} • {t.category}
                    </span>
                    <h3 className="text-xs font-black text-slate-800 leading-tight mt-1">{t.title}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    t.priority === 'High' ? 'bg-red-50 text-red-500' : t.priority === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {t.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed font-sans">{t.description}</p>

                {/* Assignment detail container */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    {assignedTech ? (
                      <div className="flex items-center gap-1.5">
                        <img 
                          src={assignedTech.avatar} 
                          alt={assignedTech.name} 
                          className="w-5 h-5 rounded-full object-cover border border-slate-250 border-slate-200" 
                        />
                        <span className="text-[10px] font-bold text-slate-600">Assigned: {assignedTech.name}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        Awaiting Assignment
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {t.status !== 'Resolved' && (
                      <button
                        onClick={() => onResolveTicket(t.id)}
                        className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-150 rounded-lg active:scale-95 transition-transform flex items-center gap-1 leading-none"
                      >
                        <CheckCircle className="h-3 w-3" /> Resolve
                      </button>
                    )}
                    
                    {t.status !== 'Resolved' && (
                      <button
                        onClick={() => setSelectedTicketForAssign(t)}
                        className="px-2.5 py-1 text-[10px] font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg active:scale-95 transition-transform flex items-center gap-1 leading-none"
                      >
                        <UserPlus className="h-3 w-3" /> {assignedTech ? 'Reassign' : 'Assign'}
                      </button>
                    )}

                    {t.status === 'Resolved' && (
                      <span className="bg-slate-50 text-slate-400 border border-slate-100 text-[10px] px-2 py-1 rounded-lg font-black uppercase flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-emerald-500" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate-450 text-slate-400 italic text-center py-10 border border-dashed border-slate-200 rounded-xl bg-white">
            No support tickets match this category.
          </p>
        )}
      </div>

      {/* ASSIGNMENT OPTIONS OVERLAY MODAL */}
      {selectedTicketForAssign && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[990]">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl animate-scaleIn">
            
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-[#004c4c] uppercase tracking-wider">Assign Ticket</h3>
              <button 
                onClick={() => setSelectedTicketForAssign(null)}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-semibold leading-relaxed">
              Ticket: <span className="font-extrabold text-slate-800">#{selectedTicketForAssign.id}</span> - Choose online technician to allocate.
            </p>

            <div className="space-y-2">
              {technicians.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => {
                    onAssignTicket(selectedTicketForAssign.id, tech.id);
                    setSelectedTicketForAssign(null);
                  }}
                  className="w-full p-3 bg-slate-540 bg-slate-50 hover:bg-teal-50 border border-slate-150 hover:border-[#004c4c] rounded-xl flex items-center justify-between text-left transition-all active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={tech.avatar} 
                      alt={tech.name} 
                      className="w-8 h-8 rounded-full object-cover border border-white shadow-xs" 
                    />
                    <div>
                      <p className="text-xs font-black text-slate-800 leading-none">{tech.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-none font-bold">{tech.specialty}</p>
                    </div>
                  </div>
                  <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded ${
                    tech.status === 'Online' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {tech.status}
                  </span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setSelectedTicketForAssign(null)}
              className="mt-5 w-full py-2.5 bg-slate-100 hover:bg-slate-250 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-transform active:scale-95"
            >
              Cancel Allocation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
