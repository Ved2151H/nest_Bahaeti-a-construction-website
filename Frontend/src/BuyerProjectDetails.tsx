import React from 'react';
import { User, Project } from './data';
import { Layers, Image as ImageIcon, Map, ShieldCheck, Download, CheckCircle, FileText } from 'lucide-react';

interface BuyerProjectDetailsProps {
  user: User;
  projects: Project[];
}

export const BuyerProjectDetails: React.FC<BuyerProjectDetailsProps> = ({ user, projects }) => {
  const project = projects[0];
  const bookedUnit = project?.units.find(u => u.status === 'Booked' || u.status === 'Sold');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2 mb-1">
            <Layers size={16} className="text-brand-accent" /> Project Details
          </h2>
          <p className="text-brand-ink/60 text-sm">Everything you need to know about {project?.name || 'your project'}.</p>
        </div>
        <button className="text-xs uppercase tracking-widest font-semibold text-brand-ink bg-brand-bg px-4 py-2 rounded-sm border border-brand-border/50 hover:bg-brand-surface transition-colors flex items-center gap-2 shadow-sm">
          <Download size={14} /> Download Brochure
        </button>
      </div>

      {/* Showcase Gallery */}
      <section className="card-premium overflow-hidden p-6">
        <h3 className="font-serif text-xl mb-4 flex items-center gap-2"><ImageIcon size={18} className="text-brand-accent"/> Showcase Gallery</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 h-64 bg-brand-bg rounded-lg overflow-hidden relative group">
            <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000" alt="Exterior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-white font-medium">Grand Elevation</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-[calc(50%-0.5rem)] bg-brand-bg rounded-lg overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800" alt="Amenities" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-white text-sm font-medium">Clubhouse</p>
              </div>
            </div>
            <div className="h-[calc(50%-0.5rem)] bg-brand-bg rounded-lg overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800" alt="Interiors" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-white text-sm font-medium">Sample Flat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit-Specific Floor Plans */}
        <section className="card-premium overflow-hidden p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-serif text-xl flex items-center gap-2"><Map size={18} className="text-brand-accent"/> Your Floor Plan</h3>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded">Unit {bookedUnit?.unitNumber || 'A-101'}</span>
          </div>
          <div className="aspect-square bg-brand-bg rounded-lg border border-brand-border flex items-center justify-center p-4 relative group">
            {/* Placeholder for floor plan image */}
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" alt="Floor Plan" className="w-full h-full object-contain opacity-80 mix-blend-multiply" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button className="bg-brand-surface text-brand-ink px-4 py-2 rounded-sm shadow-md text-xs font-semibold uppercase tracking-widest flex items-center gap-2 hover:bg-brand-bg transition-colors">
                <Download size={14} /> Download High-Res
              </button>
            </div>
          </div>
        </section>

        {/* Brand Standards & Specifications */}
        <section className="card-premium overflow-hidden p-6">
          <h3 className="font-serif text-xl mb-4 flex items-center gap-2"><CheckCircle size={18} className="text-brand-accent"/> Brand Standards</h3>
          <p className="text-sm text-brand-ink/60 mb-6">Premium specifications curated for your home.</p>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { category: 'Bath Fittings', brand: 'Kohler / Grohe', desc: 'Premium CP fittings and sanitaryware.' },
              { category: 'Flooring', brand: 'Italian Marble', desc: 'Living, dining, and passage areas.' },
              { category: 'Elevators', brand: 'Schindler', desc: 'High-speed passenger & service lifts.' },
              { category: 'Home Automation', brand: 'Schneider', desc: 'Smart switches and lighting control.' },
              { category: 'Kitchen', brand: 'Granite Platform', desc: 'With stainless steel sink and dado tiles.' },
              { category: 'Security', brand: 'Yale / Godrej', desc: 'Digital door locks and video door phones.' },
            ].map((spec, idx) => (
              <div key={idx} className="p-4 border border-brand-border rounded-lg bg-brand-bg/30">
                <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mb-1">{spec.category}</p>
                <p className="text-sm font-bold text-brand-ink mb-1">{spec.brand}</p>
                <p className="text-xs text-brand-ink/60">{spec.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Master Plan & Approvals */}
      <section className="card-premium overflow-hidden p-6">
        <h3 className="font-serif text-xl mb-4 flex items-center gap-2"><ShieldCheck size={18} className="text-brand-accent"/> Master Plan & Approvals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-brand-border rounded-lg flex items-center justify-between hover:bg-brand-bg/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">RERA Certificate</p>
                <p className="text-xs text-brand-ink/50">P51800000000</p>
              </div>
            </div>
            <Download size={16} className="text-brand-ink/40" />
          </div>
          <div className="p-4 border border-brand-border rounded-lg flex items-center justify-between hover:bg-brand-bg/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Map size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">Master Layout</p>
                <p className="text-xs text-brand-ink/50">Sanctioned Plan</p>
              </div>
            </div>
            <Download size={16} className="text-brand-ink/40" />
          </div>
          <div className="p-4 border border-brand-border rounded-lg flex items-center justify-between hover:bg-brand-bg/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">Environment Clearance</p>
                <p className="text-xs text-brand-ink/50">EC Certificate</p>
              </div>
            </div>
            <Download size={16} className="text-brand-ink/40" />
          </div>
        </div>
      </section>
    </div>
  );
};
