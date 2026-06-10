import React, { useState } from 'react';
import { FileText, Upload, Trash2, Download, Loader2 } from 'lucide-react';

interface DealDocument {
  id: string;
  dealId: string;
  name: string;
  url: string;
  uploadedBy: string;
  uploadedAt: any;
}

export const DealDocuments = ({ dealId }: { dealId: string }) => {
  const [documents, setDocuments] = useState<DealDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Mock upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      const newDoc: DealDocument = {
        id: `doc_${Date.now()}`,
        dealId,
        name: file.name,
        url: '#',
        uploadedBy: 'Current User',
        uploadedAt: new Date()
      };
      setDocuments(prev => [...prev, newDoc]);
      setIsUploading(false);
      setUploadProgress(0);
    }, 2000);
  };

  const handleDelete = async (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  return (
    <div className="card-premium p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-brand-ink flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-accent" />
          Deal Documents
        </h3>
        <div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className={`btn-premium-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
              isUploading 
                ? 'bg-brand-secondary text-brand-ink/40 cursor-not-allowed opacity-55' 
                : ''
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading {Math.round(uploadProgress)}%
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Document
              </>
            )}
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="text-center py-8 bg-brand-bg rounded-2xl border border-dashed border-brand-border">
            <FileText className="w-8 h-8 text-brand-ink/40 mx-auto mb-2" />
            <p className="text-sm text-brand-ink/80">No documents uploaded yet.</p>
            <p className="text-xs text-brand-ink/50 mt-1">Upload contracts, IDs, or receipts here.</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-brand-bg rounded-2xl border border-brand-border hover:border-brand-accent/30 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-secondary border border-brand-border rounded-md shadow-sm">
                  <FileText className="w-4 h-4 text-brand-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-ink">{doc.name}</p>
                  <p className="text-xs text-brand-ink/50">
                    Uploaded by {doc.uploadedBy} • {doc.uploadedAt instanceof Date ? doc.uploadedAt.toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 text-brand-ink/50 hover:text-brand-accent hover:bg-brand-accent/15 rounded-md transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 text-brand-ink/50 hover:text-red-500 hover:bg-red-500/15 rounded-md transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
