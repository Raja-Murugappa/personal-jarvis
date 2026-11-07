import { useState, useRef } from 'react';
import { Upload, X, Star, FileText, Award, AlertCircle, Loader2 } from 'lucide-react';
import type { Attachment } from '@/types/attachment';
import { attachmentsApi } from '@/lib/api';

export interface PendingUpload {
  file: File;
  kind: 'image' | 'document' | 'certificate';
  caption: string;
  altText: string;
  previewUrl?: string;
  error?: string;
}

interface AttachmentDropzoneProps {
  existingAttachments?: Attachment[];
  pendingFiles: PendingUpload[];
  onPendingFilesChange: (files: PendingUpload[]) => void;
  onUpdateExisting?: (id: number, isCover: boolean) => void;
  onDeleteExisting?: (id: number) => void;
  isUploading?: boolean;
}

export function AttachmentDropzone({
  existingAttachments = [],
  pendingFiles,
  onPendingFilesChange,
  onUpdateExisting,
  onDeleteExisting,
  isUploading = false,
}: AttachmentDropzoneProps) {
  const [selectedKind, setSelectedKind] = useState<'image' | 'document' | 'certificate'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newPending: PendingUpload[] = [];

    Array.from(fileList).forEach((file) => {
      // Validate size
      const maxMb = selectedKind === 'image' ? 5 : 10;
      let error: string | undefined;

      if (file.size > maxMb * 1024 * 1024) {
        error = `Exceeds ${maxMb} MB limit`;
      }

      // Validate format
      if (selectedKind === 'image') {
        const valid = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type);
        if (!valid) error = 'Only JPEG, PNG, WebP, GIF allowed';
      } else {
        if (file.type !== 'application/pdf') error = 'Only PDF allowed';
      }

      const previewUrl = selectedKind === 'image' && !error ? URL.createObjectURL(file) : undefined;

      newPending.push({
        file,
        kind: selectedKind,
        caption: '',
        altText: '',
        previewUrl,
        error,
      });
    });

    onPendingFilesChange([...pendingFiles, ...newPending]);
  };

  const removePending = (index: number) => {
    const updated = [...pendingFiles];
    if (updated[index].previewUrl) {
      URL.revokeObjectURL(updated[index].previewUrl!);
    }
    updated.splice(index, 1);
    onPendingFilesChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Upload Kind Selector */}
      <div className="flex items-center gap-2">
        {(['image', 'document', 'certificate'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSelectedKind(k)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedKind === k
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            {k === 'image' ? 'Photos (max 5MB)' : k === 'certificate' ? 'Certificates (PDF, max 10MB)' : 'Documents (PDF, max 10MB)'}
          </button>
        ))}
      </div>

      {/* Drag & Drop Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="p-6 rounded-xl border-2 border-dashed border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer text-center"
      >
        <Upload className="w-6 h-6 text-muted-foreground" />
        <div>
          <span className="text-xs font-semibold text-foreground">Click or drag & drop files here</span>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {selectedKind === 'image' ? 'JPEG, PNG, WebP, GIF up to 5 MB' : 'PDF documents up to 10 MB'}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={selectedKind === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : 'application/pdf'}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Existing Attachments Grid */}
      {existingAttachments.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Current Files ({existingAttachments.length})
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {existingAttachments.map((att) => (
              <div
                key={att.id}
                className={`relative group rounded-lg border overflow-hidden bg-card p-2 text-xs flex flex-col justify-between gap-1.5 ${
                  att.is_cover ? 'border-primary ring-1 ring-primary' : 'border-border'
                }`}
              >
                {att.mime_type !== 'application/pdf' ? (
                  <img
                    src={attachmentsApi.getThumbnailUrl(att.id)}
                    alt={att.alt_text || att.original_name}
                    className="w-full h-24 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-24 bg-muted/60 rounded flex flex-col items-center justify-center text-muted-foreground gap-1">
                    {att.kind === 'certificate' ? <Award className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    <span className="text-[10px] font-mono uppercase">PDF</span>
                  </div>
                )}

                <div className="truncate text-[11px] font-medium text-foreground">
                  {att.caption || att.original_name}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/60">
                  {att.mime_type !== 'application/pdf' && onUpdateExisting && (
                    <button
                      type="button"
                      onClick={() => onUpdateExisting(att.id, true)}
                      className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${
                        att.is_cover ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title={att.is_cover ? 'Current Cover' : 'Set as Cover'}
                    >
                      <Star className={`w-3 h-3 ${att.is_cover ? 'fill-primary text-primary' : ''}`} />
                      <span>{att.is_cover ? 'Cover' : 'Make Cover'}</span>
                    </button>
                  )}

                  {onDeleteExisting && (
                    <button
                      type="button"
                      onClick={() => onDeleteExisting(att.id)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors ml-auto"
                      title="Delete file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Uploads List */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Files to Upload ({pendingFiles.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pendingFiles.map((p, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                  p.error ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {p.previewUrl ? (
                    <img src={p.previewUrl} alt="preview" className="w-10 h-10 object-cover rounded shrink-0" />
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center shrink-0 text-muted-foreground">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="truncate">
                    <p className="font-medium text-foreground truncate">{p.file.name}</p>
                    {p.error ? (
                      <p className="text-[11px] text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {p.error}
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        {(p.file.size / (1024 * 1024)).toFixed(2)} MB • {p.kind}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removePending(idx)}
                  className="text-muted-foreground hover:text-destructive p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isUploading && (
        <div className="flex items-center gap-2 text-xs text-primary font-medium p-2 bg-primary/5 rounded-lg border border-primary/20">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading attachments to server...</span>
        </div>
      )}
    </div>
  );
}

