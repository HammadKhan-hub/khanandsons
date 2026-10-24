import React, { useState, useRef } from 'react';
import { uploadImageToStorage } from '../services/storageService';
import { UploadCloud, CheckCircle2, AlertCircle, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface ImageUploadDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  onOpenMediaLibrary?: () => void;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  value,
  onChange,
  folder = 'products',
  label = 'Product Image',
  onOpenMediaLibrary,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setSuccess(false);
    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadImageToStorage(file, folder, (pct) => {
        setProgress(pct);
      });
      onChange(result.url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-semibold uppercase tracking-wider text-[#4A433A]">
          {label} *
        </label>
        <div className="flex items-center gap-3">
          {onOpenMediaLibrary && (
            <button
              type="button"
              onClick={onOpenMediaLibrary}
              className="text-[#8C6D3B] hover:text-[#1E1B18] font-semibold flex items-center gap-1 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Media Library</span>
            </button>
          )}
          <div className="flex rounded-xs border border-[#DDD6C9] overflow-hidden text-[10px]">
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`px-2 py-0.5 font-medium ${
                inputMode === 'upload' ? 'bg-[#1E1B18] text-white' : 'bg-white text-[#6B6357]'
              }`}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`px-2 py-0.5 font-medium ${
                inputMode === 'url' ? 'bg-[#1E1B18] text-white' : 'bg-white text-[#6B6357]'
              }`}
            >
              URL
            </button>
          </div>
        </div>
      </div>

      {inputMode === 'upload' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xs p-4 text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-[#8C6D3B] bg-[#F7F3EB]'
              : 'border-[#DDD6C9] bg-[#FAF7F2] hover:bg-white hover:border-[#8C6D3B]'
          }`}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          {uploading ? (
            <div className="py-3 space-y-2">
              <div className="w-8 h-8 mx-auto border-2 border-[#8C6D3B] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#1E1B18] font-medium">Uploading to Firebase Storage...</p>
              <div className="w-full bg-[#E8E2D8] rounded-full h-1.5 max-w-xs mx-auto overflow-hidden">
                <div
                  className="bg-[#8C6D3B] h-1.5 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-[#7A7266]">{progress}% completed</p>
            </div>
          ) : (
            <div className="py-2 space-y-1">
              <UploadCloud className="w-7 h-7 mx-auto text-[#8C6D3B]" />
              <p className="font-semibold text-[#1E1B18]">
                Drag and drop image here, or <span className="text-[#8C6D3B] underline">browse</span>
              </p>
              <p className="text-[10px] text-[#7A7266]">
                JPG, PNG, WEBP, SVG or GIF (Max 10MB)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/mockup.jpg"
            className="w-full py-2 px-3 bg-[#FAF7F2] border border-[#DDD6C9] rounded-xs text-xs"
          />
        </div>
      )}

      {/* Upload Feedback */}
      {error && (
        <div className="flex items-center gap-1.5 text-red-600 text-[11px] bg-red-50 p-2 rounded-xs border border-red-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] bg-emerald-50 p-2 rounded-xs border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>Image uploaded and linked successfully!</span>
        </div>
      )}

      {/* Image Preview & Removal */}
      {value && (
        <div className="relative group w-24 h-24 rounded-xs border border-[#DDD6C9] overflow-hidden bg-white mt-2">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/100x100?text=Preview+Error';
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white p-1 rounded-full opacity-90 group-hover:opacity-100 transition-opacity"
            title="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
