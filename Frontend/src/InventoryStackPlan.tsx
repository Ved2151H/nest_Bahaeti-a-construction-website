import React, { useState, useEffect } from 'react';
import { Building, DollarSign, TrendingUp, ShieldCheck, ShoppingCart, Info, X, Edit2 } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Project, Unit, User, Deal } from './data';
import { UpdateUnitModal } from './components/UpdateUnitModal';

interface InventoryStackPlanProps {
  project: Project;
  user: User;
  deals?: Deal[];
  onOpenDeal?: (deal: Deal) => void;
  onCreateLead?: (unit: Unit) => void;
}

export const InventoryStackPlan: React.FC<InventoryStackPlanProps> = ({ project, user, deals = [], onOpenDeal, onCreateLead }) => {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isUpdateUnitModalOpen, setIsUpdateUnitModalOpen] = useState(false);
  const [firebaseUnits, setFirebaseUnits] = useState<Record<string, any>>({});
  const [isAdjustingPrice, setIsAdjustingPrice] = useState(false);
  const [newPriceVal, setNewPriceVal] = useState('');
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);

  useEffect(() => {
    if (selectedUnit) {
      setIsAdjustingPrice(false);
      const parsed = parseFloat(selectedUnit.price.replace(/[^0-9.]/g, '')) || 50;
      setNewPriceVal(parsed.toString());
    }
  }, [selectedUnit]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'units'), (snapshot) => {
      const unitsMap: Record<string, any> = {};
      snapshot.forEach(doc => {
        unitsMap[doc.id] = { id: doc.id, ...doc.data() };
      });
      setFirebaseUnits(unitsMap);
    });
    return () => unsubscribe();
  }, []);

  // Calculate Financials
  const parsePrice = (priceStr: string) => {
    if (priceStr.includes('Cr')) return parseFloat(priceStr.replace(/[^0-9.]/g, '')) * 10000000;
    if (priceStr.includes('L')) return parseFloat(priceStr.replace(/[^0-9.]/g, '')) * 100000;
    return 0;
  };

  const formatPrice = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value}`;
  };

  // Merge static units with Firebase updates
  const mergedUnits = project.units.map(u => {
    const fbUnit = firebaseUnits[u.id];
    if (fbUnit) {
      return { 
        ...u, 
        status: fbUnit.status || u.status,
        price: fbUnit.price ? formatPrice(fbUnit.price) : u.price
      };
    }
    return u;
  });

  // Group units by wing
  const wings = ['A', 'B'];
  const unitsByWing = wings.reduce((acc, wing) => {
    acc[wing] = mergedUnits.filter(u => u.wing === wing).sort((a, b) => b.floor - a.floor);
    return acc;
  }, {} as Record<string, Unit[]>);

  const totalTIV = mergedUnits.reduce((sum, u) => sum + parsePrice(u.price), 0);
  const realizedRevenue = mergedUnits
    .filter(u => u.status === 'Sold' || u.status === 'Booked')
    .reduce((sum, u) => sum + parsePrice(u.price), 0);

  const available2BHK = mergedUnits.filter(u => u.typeId === 't_2bhk' && u.status === 'Available').length;
  const available3BHK = mergedUnits.filter(u => u.typeId === 't_3bhk' && u.status === 'Available').length;

  // Map deals to units
  const dealsByUnit = deals.reduce((acc, deal) => {
    const unitIds = new Set<string>();
    if (deal.unitId) unitIds.add(deal.unitId);
    if (deal.finalUnitId) unitIds.add(deal.finalUnitId);
    if (deal.interestedUnitIds) {
      deal.interestedUnitIds.forEach(id => unitIds.add(id));
    }
    
    unitIds.forEach(id => {
      if (!acc[id]) acc[id] = [];
      acc[id].push(deal);
    });
    return acc;
  }, {} as Record<string, Deal[]>);

  const getStatusColor = (unit: Unit) => {
    const unitDeals = dealsByUnit[unit.id] || [];
    const activeDeal = unitDeals.find(d => !['Lost', 'Closed'].includes(d.status));
    
    if (activeDeal) {
      switch (activeDeal.status) {
        case 'Negotiation': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30';
        case 'Booked': return 'bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30';
        default: return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20';
      }
    }

    switch (unit.status) {
      case 'Available': return 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30';
      case 'On Hold': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30';
      case 'Booked': return 'bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30';
      case 'Sold': return 'bg-brand-secondary/40 border border-brand-border text-brand-ink/40 opacity-70';
    }
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;

    try {
      const unitRef = doc(db, 'units', selectedUnit.id);
      const numericPrice = parseFloat(newPriceVal);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        alert('Please enter a valid price');
        return;
      }
      
      const priceInBytes = numericPrice * 100000;
      
      await setDoc(unitRef, {
        price: priceInBytes,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setSelectedUnit(prev => prev ? { ...prev, price: formatPrice(priceInBytes) } : null);
      setIsAdjustingPrice(false);
      alert('Base price updated successfully in real-time!');
    } catch (err) {
      console.error('Error updating price:', err);
      alert('Failed to update price. Please try again.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Financials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-6 md:col-span-2 flex flex-col justify-between relative overflow-hidden">
          <div>
            <h2 className="font-serif text-2xl mb-1 flex items-center gap-2">
              <Building className="text-brand-accent" /> {project.name} - Stack Plan
            </h2>
            <p className="text-sm text-brand-ink/60">Real-time inventory matrix & financial tracking</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mb-1">Total Inventory Value (TIV)</p>
              <p className="font-serif text-2xl text-brand-accent">{formatPrice(totalTIV)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-brand-ink/50 mb-1">Realized Revenue</p>
              <p className="font-serif text-2xl text-brand-ink">{formatPrice(realizedRevenue)}</p>
            </div>
            <div className="col-span-2 mt-2">
              <div className="w-full h-1.5 bg-brand-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-accent rounded-full transition-all duration-1000"
                  style={{ width: `${(realizedRevenue / totalTIV) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-brand-ink/50 mt-2 text-right">
                {Math.round((realizedRevenue / totalTIV) * 100)}% Sold
              </p>
            </div>
          </div>
        </div>

        <div className="card-premium p-6 flex flex-col justify-center">
          <h3 className="text-xs uppercase tracking-widest font-semibold text-brand-ink/50 mb-4 flex items-center gap-2">
            <TrendingUp size={14} /> Scarcity Indicators
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-brand-secondary border border-red-500/20 rounded-lg">
              <p className="text-sm font-medium text-red-400">
                {available3BHK === 1 ? 'Only 1 3BHK remaining!' : `${available3BHK} 3BHKs available`}
              </p>
              <p className="text-[10px] text-red-500/80 uppercase tracking-widest mt-1">High Demand</p>
            </div>
            <div className="p-3 bg-brand-secondary border border-blue-500/20 rounded-lg">
              <p className="text-sm font-medium text-blue-400">
                {available2BHK} 2BHKs available
              </p>
              <p className="text-[10px] text-blue-500/80 uppercase tracking-widest mt-1">Steady Velocity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stack Plan Grid */}
      <div className="card-premium p-6 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-serif text-xl">Building Layout</h3>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Available</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> On Hold</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Booked</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-400"></span> Sold</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {wings.map(wing => {
            const wingUnits = unitsByWing[wing] || [];
            // Group by floor for the visual stack
            const floors = Array.from(new Set(wingUnits.map(u => u.floor))).sort((a, b) => b - a);
            
            return (
              <div key={wing} className="flex flex-col items-center">
                <div className="w-full text-center mb-6 pb-2 border-b-2 border-brand-ink">
                  <h4 className="font-serif text-2xl">Wing {wing}</h4>
                </div>
                
                <div className="flex flex-col gap-2 w-full max-w-2xl">
                  {floors.map(floor => {
                    const floorUnits = wingUnits.filter(u => u.floor === floor).sort((a, b) => a.unitNumber.localeCompare(b.unitNumber));
                    return (
                      <div key={floor} className="flex items-center gap-2">
                        <div className="w-8 text-right font-serif text-sm text-brand-ink/40">F{floor}</div>
                        <div className="flex-1 grid grid-cols-4 gap-2">
                          {floorUnits.map(unit => {
                            const unitDeals = dealsByUnit[unit.id] || [];
                            const activeDeal = unitDeals.find(d => !['Lost', 'Closed'].includes(d.status));
                            const hasConflict = unitDeals.filter(d => !['Lost', 'Closed'].includes(d.status)).length > 1;

                            return (
                              <div key={unit.id} className="relative group">
                                <button
                                  onClick={() => setSelectedUnit(unit)}
                                  className={`w-full p-2 rounded-md border-2 text-center transition-all duration-200 transform hover:scale-105 shadow-sm ${getStatusColor(unit)} ${selectedUnit?.id === unit.id ? 'ring-2 ring-brand-ink ring-offset-2' : ''}`}
                                >
                                  <div className="font-bold text-sm mb-0.5 flex items-center justify-center gap-1">
                                    {unit.unitNumber}
                                    {hasConflict && <span title="Multiple active leads!" className="text-red-500">🔥</span>}
                                  </div>
                                  <div className="text-[10px] font-medium opacity-90">{unit.typeId === 't_2bhk' ? '2 BHK' : '3 BHK'}</div>
                                </button>
                                
                                {/* Rich Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 card-premium text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-xl">
                                  <div className="font-bold mb-1 border-b border-brand-border pb-1">Unit {unit.unitNumber}</div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-brand-ink/50">Status:</span>
                                    <span className="font-medium">{unit.status}</span>
                                  </div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-brand-ink/50">Price:</span>
                                    <span className="font-medium">{unit.price}</span>
                                  </div>
                                  {activeDeal && (
                                    <div className="mt-2 pt-2 border-t border-brand-border">
                                      <div className="text-brand-accent font-medium mb-1">{activeDeal.buyerName}</div>
                                      <div className="flex justify-between">
                                        <span className="text-brand-ink/50">Stage:</span>
                                        <span>{activeDeal.status}</span>
                                      </div>
                                    </div>
                                  )}
                                  {/* Tooltip Arrow */}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-brand-surface"></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Ground / Lobby indicator */}
                <div className="w-full max-w-2xl mt-4 h-8 bg-brand-bg/50 border border-brand-border/30 rounded flex items-center justify-center text-[10px] uppercase tracking-widest text-brand-ink/40">
                  Lobby / Ground / Parking
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role-Specific Action Drawer / Modal */}
      {selectedUnit && (() => {
        const unitDeals = dealsByUnit[selectedUnit.id] || [];
        const activeDeal = unitDeals.find(d => !['Lost', 'Closed'].includes(d.status));
        const hasConflict = unitDeals.filter(d => !['Lost', 'Closed'].includes(d.status)).length > 1;

        return (
        <div className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUnit(null)}>
          <div className="card-premium w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-brand-border/20 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${selectedUnit.status === 'Available' ? 'bg-green-500' : selectedUnit.status === 'Sold' ? 'bg-gray-500' : 'bg-yellow-500'}`} />
                  <span className="text-xs uppercase tracking-widest font-semibold text-brand-ink/50">{selectedUnit.status}</span>
                </div>
                <h3 className="font-serif text-3xl flex items-center gap-2">
                  Unit {selectedUnit.unitNumber}
                  {hasConflict && <span title="Multiple active leads!" className="text-red-500 text-xl">🔥</span>}
                </h3>
                <p className="text-brand-ink/70">{selectedUnit.typeId === 't_2bhk' ? '2 BHK Premium' : '3 BHK Ultra Luxury'} • Wing {selectedUnit.wing}</p>
              </div>
              <button onClick={() => setSelectedUnit(null)} className="p-2 hover:bg-brand-bg rounded-full transition-colors">
                <X size={20} className="text-brand-ink/50" />
              </button>
            </div>
            
            <div className="p-6 bg-brand-bg/30">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-brand-ink/60 uppercase tracking-widest">Base Price</span>
                <span className="font-serif text-2xl text-brand-accent">{selectedUnit.price}</span>
              </div>

              {activeDeal && (user.roleId === 'r_sales_director' || user.roleId === 'r_sales_exec' || user.roleId === 'r_dir') && (
                <div className="mb-6 p-4 bg-brand-secondary border border-brand-border rounded-lg shadow-sm">
                  <h4 className="text-xs uppercase tracking-widest font-semibold text-brand-ink/50 mb-3">Active Pipeline Deal</h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{activeDeal.buyerName}</span>
                    <span className="text-xs px-2 py-1 bg-brand-bg rounded-md text-brand-ink">{activeDeal.status}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-brand-ink/70 mb-4">
                    <span>{activeDeal.temperature} Lead</span>
                    <span className="font-medium text-brand-accent">{activeDeal.amount}</span>
                  </div>
                  {onOpenDeal && (
                    <button 
                      onClick={() => {
                        setSelectedUnit(null);
                        onOpenDeal(activeDeal);
                      }}
                      className="btn-premium-secondary w-full py-2 text-xs uppercase tracking-widest font-semibold"
                    >
                      View Deal Details
                    </button>
                  )}
                </div>
              )}

              {/* Role-Specific Actions */}
              <div className="space-y-3">
                {user.roleId === 'r_developer' && (
                  <div className="space-y-3">
                    {isAdjustingPrice ? (
                      <form onSubmit={handleSavePrice} className="space-y-3 pt-3 border-t border-brand-border/20">
                        <label className="block text-xs uppercase tracking-widest text-brand-ink/60 font-semibold mb-1">
                          New Price (in Lakhs)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-ink/40">₹</span>
                          <input
                            type="number"
                            value={newPriceVal}
                            onChange={(e) => setNewPriceVal(e.target.value)}
                            className="w-full pl-8 pr-16 py-2 border border-brand-border bg-[#16161A] text-brand-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all text-sm"
                            placeholder="e.g. 52"
                            required
                            min="1"
                            step="0.01"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-ink/40 text-xs">Lakhs</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setIsAdjustingPrice(false)}
                            className="btn-premium-secondary flex-1 py-2 text-xs uppercase tracking-widest font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn-premium-primary flex-1 py-2 text-xs uppercase tracking-widest font-semibold"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <button 
                          onClick={() => setIsAdjustingPrice(true)}
                          className="btn-premium-primary w-full py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <TrendingUp size={14} /> Adjust Base Price
                        </button>
                        <button 
                          onClick={() => setIsComplianceOpen(true)}
                          className="btn-premium-secondary w-full py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <ShieldCheck size={14} /> View Compliance Status
                        </button>
                      </>
                    )}
                  </div>
                )}

                {(user.roleId === 'r_sales_director' || user.roleId === 'r_sales_exec') && (
                  <>
                    <button 
                      onClick={() => setIsUpdateUnitModalOpen(true)}
                      className="btn-premium-primary w-full py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Edit2 size={14} /> Update Unit Status
                    </button>
                    {selectedUnit.status === 'Available' && onCreateLead && (
                      <button 
                        onClick={() => {
                          setSelectedUnit(null);
                          onCreateLead(selectedUnit);
                        }}
                        className="btn-premium-secondary w-full py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={14} /> Create Lead for Unit
                      </button>
                    )}
                  </>
                )}

                {user.roleId === 'r_buyer' && selectedUnit.status === 'Available' && (
                  <>
                    <button className="btn-premium-primary w-full py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                      <ShoppingCart size={14} /> Express Interest
                    </button>
                    <button className="btn-premium-secondary w-full py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                      <Info size={14} /> Download Floor Plan
                    </button>
                  </>
                )}

                {selectedUnit.status !== 'Available' && user.roleId === 'r_buyer' && (
                  <div className="p-4 bg-brand-secondary rounded-lg text-center border border-brand-border">
                    <p className="text-sm text-brand-ink/55">This unit is currently {selectedUnit.status.toLowerCase()}.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {selectedUnit && (
        <UpdateUnitModal 
          isOpen={isUpdateUnitModalOpen} 
          onClose={() => setIsUpdateUnitModalOpen(false)} 
          unit={selectedUnit} 
          userId={user.id}
        />
      )}

      {/* Compliance Modal */}
      {isComplianceOpen && selectedUnit && (
        <div className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsComplianceOpen(false)}>
          <div className="card-premium w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-brand-border/20 flex justify-between items-start bg-brand-bg/30">
              <div>
                <h3 className="font-serif text-xl text-brand-ink">Compliance Status</h3>
                <p className="text-xs text-brand-ink/50 uppercase tracking-widest">Unit {selectedUnit.unitNumber} • Wing {selectedUnit.wing}</p>
              </div>
              <button onClick={() => setIsComplianceOpen(false)} className="p-2 hover:bg-brand-bg rounded-full transition-colors">
                <X size={20} className="text-brand-ink/50" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {[
                { name: 'RERA Registration', status: 'Approved', desc: 'RERA-Approved Project (Reg No: PRM/KA/RERA/1251/472)', date: 'Oct 10, 2025' },
                { name: 'Environmental Clearance', status: 'Approved', desc: 'State Pollution Control Board NOC', date: 'Nov 14, 2025' },
                { name: 'Fire Safety Certificate', status: 'Approved', desc: 'Department of Fire & Emergency Services NOC', date: 'Jan 22, 2026' },
                { name: 'Structural Stability Certificate', status: 'Approved', desc: 'Certified by IIT Structural Board Architect', date: 'Feb 18, 2026' },
                { name: 'Occupancy Certificate (OC)', status: 'In Progress', desc: 'Final audit phase by Municipal Corporation', date: 'Est: Dec 2026' }
              ].map((item, idx) => (
                <div key={idx} className="bg-brand-secondary/40 border border-brand-border/10 p-3 rounded-lg flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-medium text-brand-ink">{item.name}</h4>
                    <p className="text-[10px] text-brand-ink/40 mt-0.5">{item.desc}</p>
                    <p className="text-[9px] text-brand-accent mt-1">{item.date}</p>
                  </div>
                  <span className={`text-[9px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded ${
                    item.status === 'Approved' 
                      ? 'text-green-400 bg-green-500/10 border border-green-500/20' 
                      : 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-brand-border/20 bg-brand-bg/30 flex gap-3">
              <button
                onClick={() => {
                  setIsComplianceOpen(false);
                  alert('RERA compliance report downloaded successfully.');
                }}
                className="btn-premium-primary w-full py-2.5 text-xs uppercase tracking-widest font-semibold"
              >
                Download Full RERA Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
