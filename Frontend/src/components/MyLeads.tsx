import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { User, Phone, Mail, Calendar, Edit2, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react';

interface MyLeadsProps {
  showAll?: boolean;
  userId: string;
}

export const MyLeads: React.FC<MyLeadsProps> = ({ showAll = false, userId }) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let q;
    if (showAll) {
      q = query(collection(db, 'leads'));
    } else {
      q = query(
        collection(db, 'leads'),
        where('assignedTo', '==', userId)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
        return dateB - dateA;
      });
      setLeads(leadsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching leads:", err);
      setError("Failed to load leads.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showAll, userId]);

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const leadRef = doc(db, 'leads', leadId);
      const leadData = leads.find(l => l.id === leadId);
      
      await updateDoc(leadRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      if (newStatus === 'Lost' && leadData) {
        const unitToRelease = leadData.finalUnitId || leadData.unitId;
        if (unitToRelease) {
          await updateDoc(doc(db, 'units', unitToRelease), {
            status: 'Available',
            linkedLeadId: null,
            updatedAt: serverTimestamp()
          });
        }
      }
    } catch (err) {
      console.error("Error updating lead status:", err);
      alert("Failed to update lead status.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lead': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Site Visit': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Negotiation': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Booked': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Lost': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-white/10 text-gray-300 border-white/20';
    }
  };

  if (loading) return <div className="p-6 text-center text-brand-ink/60">Loading leads...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="card-premium overflow-hidden">
      <div className="p-6 border-b border-brand-border/20 bg-[#16161A]/50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-serif text-brand-ink flex items-center gap-2">
            <User size={20} className="text-brand-accent" /> My Active Leads
          </h2>
          <p className="text-xs text-brand-ink/60 mt-1">Manage and update your assigned leads</p>
        </div>
      </div>
      
      {leads.length === 0 ? (
        <div className="p-8 text-center text-brand-ink/50 flex flex-col items-center">
          <User size={48} className="mb-4 opacity-20" />
          <p>No leads assigned to you yet.</p>
          <p className="text-sm mt-2">Click "Add New Lead" to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-bg/30 border-b border-brand-border/20">
              <tr>
                <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Lead Details</th>
                <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Contact Info</th>
                <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Status</th>
                <th className="p-4 font-medium text-brand-ink/60 uppercase tracking-widest text-[10px]">Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-brand-border/10 last:border-0 hover:bg-brand-bg/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-brand-ink">{lead.name}</div>
                    <div className="text-xs text-brand-ink/60 mt-1 flex items-center gap-1">
                      <Clock size={12} /> {lead.createdAt?.toDate().toLocaleDateString() || 'Just now'}
                    </div>
                    {lead.budget && (
                      <div className="text-xs text-brand-ink/60 mt-1 font-mono">
                        Budget: ₹{lead.budget}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="text-xs text-brand-ink hover:text-brand-accent flex items-center gap-1">
                          <Phone size={12} /> {lead.phone}
                        </a>
                      )}
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="text-xs text-brand-ink hover:text-brand-accent flex items-center gap-1">
                          <Mail size={12} /> {lead.email}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={lead.status}
                      onChange={(e) => {
                        if (e.target.value === 'Booked' || e.target.value === 'Negotiation') {
                          alert('Please use the Pipeline view to advance to Negotiation or Booked stages to assign units.');
                          return;
                        }
                        updateLeadStatus(lead.id, e.target.value);
                      }}
                      className={`text-xs uppercase tracking-widest font-semibold px-2 py-1 rounded-sm border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-accent/50 ${getStatusColor(lead.status)}`}
                    >
                      <option value="Lead">Lead</option>
                      <option value="Site Visit">Site Visit</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Booked">Booked</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateLeadStatus(lead.id, 'Site Visit')}
                        className="p-1.5 text-brand-ink/60 hover:text-purple-400 hover:bg-purple-500/15 rounded transition-colors cursor-pointer"
                        title="Schedule Site Visit"
                      >
                        <MapPin size={16} />
                      </button>
                      <button 
                        onClick={() => alert('Please use the Pipeline view to advance to Booked stage to assign a unit.')}
                        className="p-1.5 text-brand-ink/60 hover:text-green-400 hover:bg-green-500/15 rounded transition-colors cursor-pointer"
                        title="Mark as Booked"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button 
                        onClick={() => updateLeadStatus(lead.id, 'Lost')}
                        className="p-1.5 text-brand-ink/60 hover:text-red-400 hover:bg-red-500/15 rounded transition-colors cursor-pointer"
                        title="Mark as Lost"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
