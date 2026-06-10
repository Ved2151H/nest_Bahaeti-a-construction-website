import React, { useState, useRef } from 'react';
import { User, Project } from './data';
import { FileText, Download, AlertCircle, Upload, CheckCircle, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BuyerDocumentVaultProps {
  user: User;
  projects: Project[];
}

interface VaultDoc {
  id: string;
  name: string;
  date: string;
  status: string;
  isUserUploaded: boolean;
  content?: string;
}

export const BuyerDocumentVault: React.FC<BuyerDocumentVaultProps> = ({ user, projects }) => {
  // Document List State
  const [documents, setDocuments] = useState<VaultDoc[]>([
    { id: '1', name: 'Booking Form', date: 'Mar 10, 2026', status: 'Verified', isUserUploaded: false, content: 'Official property booking form for Unit 402. Status: Verified.' },
    { id: '2', name: 'Aadhar Card', date: 'Mar 11, 2026', status: 'Verified', isUserUploaded: false, content: 'Aadhaar Identification Document. Status: Verified.' },
    { id: '3', name: 'Payment Receipt - Booking Amount', date: 'Mar 12, 2026', status: 'Generated', isUserUploaded: false, content: 'Receipt token payment collection of ₹10,00,000. Status: Generated.' },
    { id: '4', name: 'Payment Receipt - Slab 1', date: 'Mar 20, 2026', status: 'Generated', isUserUploaded: false, content: 'Receipt of Slab 1 completion payment of ₹12,00,000. Status: Generated.' },
  ]);

  // Actions & Modal States
  const [atsSigned, setAtsSigned] = useState(false);
  const [atsSigning, setAtsSigning] = useState(false);
  const [atsModalOpen, setAtsModalOpen] = useState(false);
  const [panUploaded, setPanUploaded] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<VaultDoc | null>(null);

  // File Input References
  const genericInputRef = useRef<HTMLInputElement>(null);
  const panInputRef = useRef<HTMLInputElement>(null);

  const handleGenericUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newDoc: VaultDoc = {
      id: 'usr_' + Date.now(),
      name: file.name,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Uploaded',
      isUserUploaded: true,
      content: `Uploaded User Document: ${file.name}. Size: ${(file.size / 1024).toFixed(1)} KB. Type: ${file.type}.`
    };
    setDocuments(prev => [...prev, newDoc]);
    if (genericInputRef.current) genericInputRef.current.value = '';
  };

  const handlePanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newDoc: VaultDoc = {
      id: 'pan_' + Date.now(),
      name: 'PAN Card - ' + file.name,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Verification Pending',
      isUserUploaded: true,
      content: `KYC Document: PAN Card (${file.name}). Pending administrative verification review.`
    };
    setDocuments(prev => [...prev, newDoc]);
    setPanUploaded(true);
    if (panInputRef.current) panInputRef.current.value = '';
  };

  const handleDeleteDocument = (id: string) => {
    const docToDelete = documents.find(d => d.id === id);
    if (docToDelete?.name.startsWith('PAN Card -')) {
      setPanUploaded(false);
    }
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleSignATS = () => {
    setAtsSigning(true);
    setTimeout(() => {
      setAtsSigning(false);
      setAtsSigned(true);
      setAtsModalOpen(false);
      
      const signedATS: VaultDoc = {
        id: 'ats_' + Date.now(),
        name: 'Agreement to Sale (Signed)',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'e-Signed',
        isUserUploaded: false,
        content: 'Agreement to Sale (ATS) executed between Baheti Housing and the buyer. Digitally e-Signed using Aadhaar verification.'
      };
      setDocuments(prev => [...prev, signedATS]);
    }, 2500);
  };

  const handleDownloadAll = () => {
    alert(`Initiating download for ${documents.length} secure documents as a ZIP archive...`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hidden file inputs */}
      <input 
        type="file" 
        ref={genericInputRef} 
        onChange={handleGenericUpload} 
        className="hidden" 
        accept="image/*,application/pdf,.doc,.docx"
      />
      <input 
        type="file" 
        ref={panInputRef} 
        onChange={handlePanUpload} 
        className="hidden" 
        accept="image/*,application/pdf"
      />

      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-sm uppercase tracking-widest font-semibold flex items-center gap-2 mb-1">
              <FileText size={16} className="text-brand-accent" /> Document Vault
            </h2>
            <p className="text-brand-ink/60 text-sm">Manage your property documents, agreements, and receipts.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => genericInputRef.current?.click()}
              className="btn-premium-primary text-xs uppercase tracking-widest px-4 py-2 flex items-center gap-2 shadow-sm"
            >
              <Upload size={14} /> Upload File
            </button>
            <button 
              onClick={handleDownloadAll}
              className="btn-premium-secondary text-xs uppercase tracking-widest px-4 py-2 flex items-center gap-2 shadow-sm"
            >
              <Download size={14} /> Download All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Action Required (1 col) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card-premium overflow-hidden">
              <div className="p-5 border-b border-brand-border/20 bg-brand-bg/50">
                <h3 className="font-serif text-lg mb-1 text-brand-accent">Action Required</h3>
                <p className="text-xs text-brand-ink/50">Pending signatures and uploads.</p>
              </div>
              <div className="p-5 space-y-4">
                
                {/* Sign ATS Card */}
                {!atsSigned ? (
                  <div className="flex items-start gap-3 p-4 bg-brand-secondary border border-brand-accent/30 rounded-lg">
                    <AlertCircle size={18} className="text-brand-accent mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-brand-ink mb-1">Sign Agreement to Sale</h4>
                      <p className="text-xs text-brand-ink/60 mb-4">Your advisor has prepared the ATS. Please review and e-sign.</p>
                      <button 
                        onClick={() => setAtsModalOpen(true)}
                        className="btn-premium-primary text-xs uppercase tracking-widest w-full py-2"
                      >
                        Review & Sign
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-brand-secondary border border-green-500/20 rounded-lg">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-brand-ink mb-1">Agreement to Sale Signed</h4>
                      <p className="text-xs text-brand-ink/60">The document was digitally signed and logged in the briefcase.</p>
                    </div>
                  </div>
                )}

                {/* Upload PAN Card Card */}
                {!panUploaded ? (
                  <div className="flex items-start gap-3 p-4 border border-brand-border rounded-lg hover:border-brand-accent/50 transition-colors">
                    <Upload size={18} className="text-brand-ink/50 mt-0.5 shrink-0" />
                    <div className="w-full">
                      <h4 className="text-sm font-semibold text-brand-ink mb-1">Upload PAN Card</h4>
                      <p className="text-xs text-brand-ink/60 mb-4">Required for KYC verification.</p>
                      <button 
                        onClick={() => panInputRef.current?.click()}
                        className="btn-premium-secondary text-xs uppercase tracking-widest w-full py-2 border-dashed"
                      >
                        Click to Upload
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-brand-secondary border border-green-500/20 rounded-lg">
                    <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-brand-ink mb-1">PAN Card Uploaded</h4>
                      <p className="text-xs text-brand-ink/60">KYC verification is under review.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Completed Documents (2 cols) */}
          <div className="lg:col-span-2">
            <div className="card-premium overflow-hidden h-full">
              <div className="p-5 border-b border-brand-border/20 bg-brand-bg/50">
                <h3 className="font-serif text-lg mb-1">Completed Documents</h3>
                <p className="text-xs text-brand-ink/60">Your secure digital briefcase.</p>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-brand-border/20 bg-brand-bg/20">
                      <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/50">Document Name</th>
                      <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/50">Date Added</th>
                      <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/50">Status</th>
                      <th className="p-4 text-xs uppercase tracking-widest font-semibold text-brand-ink/50 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc, idx) => (
                      <tr key={doc.id} className="border-b border-brand-border/10 hover:bg-brand-bg/30 transition-colors last:border-0">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div 
                              onClick={() => setPreviewDoc(doc)}
                              className="w-8 h-8 rounded bg-brand-bg flex items-center justify-center text-brand-ink/50 hover:text-brand-accent transition-colors shrink-0 cursor-pointer"
                            >
                              <FileText size={14} />
                            </div>
                            <span 
                              onClick={() => setPreviewDoc(doc)}
                              className="text-sm font-medium cursor-pointer hover:text-brand-accent transition-colors"
                            >
                              {doc.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-brand-ink/60">{doc.date}</td>
                        <td className="p-4">
                          <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded border ${
                            doc.status === 'Verified' || doc.status === 'e-Signed' ? 'badge-premium-success' : 
                            doc.status === 'Verification Pending' ? 'badge-premium-warning' :
                            'badge-premium-primary'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end items-center gap-2">
                          <button 
                            onClick={() => alert(`Downloading ${doc.name} as PDF...`)}
                            className="text-brand-ink/50 hover:text-brand-accent transition-colors p-2 rounded hover:bg-brand-bg"
                          >
                            <Download size={16} />
                          </button>
                          {doc.isUserUploaded && (
                            <button 
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-red-400/60 hover:text-red-500 transition-colors p-2 rounded hover:bg-brand-bg"
                              title="Delete Uploaded Document"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================================== */}
      {/* Modals & Dialogs */}
      {/* =============================================================== */}
      <AnimatePresence>
        
        {/* ATS Review & Signing Modal */}
        {atsModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm z-50"
              onClick={() => setAtsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto max-w-lg h-[500px] card-premium z-50 overflow-hidden flex flex-col p-6 justify-between"
            >
              <div className="flex justify-between items-center border-b border-brand-border/20 pb-4 bg-brand-bg/50 -mx-6 -mt-6 p-6">
                <div>
                  <h3 className="font-serif text-lg text-brand-ink">Agreement to Sale (ATS)</h3>
                  <p className="text-[10px] uppercase tracking-widest text-brand-ink/40">Review & Execute Signatures</p>
                </div>
                <button onClick={() => setAtsModalOpen(false)} className="text-brand-ink/50 hover:text-brand-ink"><X size={20}/></button>
              </div>

              <div className="flex-1 py-4 overflow-y-auto text-xs leading-relaxed text-brand-ink/70 custom-scrollbar font-mono bg-brand-bg/20 p-4 border border-brand-border/10 rounded my-4 space-y-4">
                <p className="font-bold border-b border-brand-border/10 pb-2 text-brand-accent">AGREEMENT TO SALE (ATS) SUMMARY</p>
                <p>This Agreement is executed by and between Baheti Housing (Developer) and the Buyer ({user.name.toUpperCase()}) for the absolute sale and transfer of Unit 402, Block A at My Nest Residency on Beed Bypass Road.</p>
                <p><strong>1. Purchase Price:</strong> The purchase price is fixed as outlined in the booking schedule, payable in instalments matching the construction milestones.</p>
                <p><strong>2. Possession date:</strong> Target possession date is March 2028, subject to RERA guidelines and extensions.</p>
                <p><strong>3. Specifications:</strong> Detailed specifications and flooring layouts are incorporated in Appendix A.</p>
                <p className="text-yellow-600/80 italic">Note: Pressing the sign button executes a legally binding digital signature verified through Aadhaar e-Sign systems.</p>
              </div>

              <div className="flex gap-4">
                {atsSigning ? (
                  <div className="w-full flex flex-col items-center justify-center py-2 space-y-3">
                    <motion.div 
                      animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full"
                    />
                    <p className="text-xs uppercase tracking-widest text-brand-ink/50">Securing e-signature via Aadhaar...</p>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => setAtsModalOpen(false)}
                      className="btn-premium-secondary flex-1 py-2.5 text-xs uppercase tracking-widest font-semibold"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSignATS}
                      className="btn-premium-primary flex-1 py-2.5 text-xs uppercase tracking-widest flex items-center justify-center gap-1 shadow-lg"
                    >
                      e-Sign Agreement <Check size={14}/>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}

        {/* Document Content Viewer Modal */}
        {previewDoc && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/85 backdrop-blur-sm z-50"
              onClick={() => setPreviewDoc(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto max-w-md h-[400px] card-premium z-50 overflow-hidden flex flex-col p-6 justify-between"
            >
              <div className="flex justify-between items-center border-b border-brand-border/20 pb-4 bg-brand-bg/50 -mx-6 -mt-6 p-6">
                <div>
                  <h3 className="font-serif text-lg text-brand-ink">{previewDoc.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-brand-ink/40">Vault briefcase preview — {previewDoc.date}</p>
                </div>
                <button onClick={() => setPreviewDoc(null)} className="text-brand-ink/50 hover:text-brand-ink"><X size={20}/></button>
              </div>

              <div className="flex-1 py-6 overflow-y-auto text-xs leading-relaxed text-brand-ink/70 custom-scrollbar font-mono bg-brand-bg/20 p-4 border border-brand-border/10 rounded my-4">
                {previewDoc.content || "No text content available for preview."}
              </div>

              <button 
                onClick={() => {
                  setPreviewDoc(null);
                  alert(`Downloading ${previewDoc.name} copy...`);
                }}
                className="btn-premium-primary w-full py-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Download size={14}/> Download PDF
              </button>
            </motion.div>
          </>
        )}

      </AnimatePresence>
    </div>
  );
};
