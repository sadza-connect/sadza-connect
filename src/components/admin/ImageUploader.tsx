'use client';

import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Plus, Link2, Check } from 'lucide-react';
import { AdminButton } from '@/components/admin/AdminUI';

export interface GalleryItem {
  src: string;
  caption?: string;
}

export type UploadedMediaItem = GalleryItem;

interface ImageUploaderProps {
  label: string;
  images: GalleryItem[];
  onChange: (images: GalleryItem[]) => void;
  multiple?: boolean;
  hint?: string;
}

const COMMON_PRESETS = [
  {
    label: 'Hybrid Solar Inverter Bank',
    path: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Industrial Hardware & Steel',
    path: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Agro-Inputs & Irrigation',
    path: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Enterprise IT & Networking',
    path: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Wholesale Groceries & Milling',
    path: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Heavy Haulage Fleet',
    path: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  },
];

/** Client-side image compressor: downscales large camera photos to max 1280px WebP (<100KB) */
async function compressFileToDataUrl(file: File, maxWidth = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    if (file.type === 'image/svg+xml' || file.size < 50 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        try {
          const compressed = canvas.toDataURL('image/webp', quality);
          resolve(compressed);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({
  label,
  images = [],
  onChange,
  multiple = true,
  hint,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');
  const [showUrlForm, setShowUrlForm] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const newItems: GalleryItem[] = [];
      for (const file of files) {
        let finalSrc = '';
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('partition', 'public-media');
          formData.append('is_public', 'true');

          const res = await fetch('/api/v1/storage/upload', {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.data?.url) {
              finalSrc = data.data.url;
            }
          }
        } catch {
          // Network error or offline, fallback to client-compressed data URL
        }

        if (!finalSrc) {
          finalSrc = await compressFileToDataUrl(file);
        }

        newItems.push({
          src: finalSrc,
          caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        });
      }

      if (multiple) {
        onChange([...images, ...newItems]);
      } else {
        onChange([newItems[0]]);
      }
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleAddUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    const newItem: GalleryItem = {
      src: trimmed,
      caption: captionInput.trim() || 'Image',
    };

    if (multiple) {
      onChange([...images, newItem]);
    } else {
      onChange([newItem]);
    }

    setUrlInput('');
    setCaptionInput('');
    setShowUrlForm(false);
  }

  function handleApplyPreset(path: string, labelText: string) {
    const newItem: GalleryItem = {
      src: path,
      caption: labelText,
    };
    if (multiple) {
      onChange([...images, newItem]);
    } else {
      onChange([newItem]);
    }
  }

  function handleRemove(index: number) {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  }

  function handleCaptionChange(index: number, caption: string) {
    const updated = images.map((item, i) => (i === index ? { ...item, caption } : item));
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#2c3a52]">{label}</label>
          {hint && <p className="text-[11px] text-[#6b81a5] mt-0.5">{hint}</p>}
        </div>

        <div className="flex items-center gap-2">
          <AdminButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUrlForm((v) => !v)}
          >
            <Link2 className="h-3.5 w-3.5" />
            {showUrlForm ? 'Hide URL Input' : 'Paste Image URL / Path'}
          </AdminButton>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
          />
          <AdminButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            loading={loading}
            className="bg-[#eef5ff] text-[#1743d4] border-[#bcd7ff] hover:bg-[#d9e8ff]"
          >
            <Upload className="h-3.5 w-3.5" /> Upload from Device
          </AdminButton>
        </div>
      </div>

      {showUrlForm && (
        <div className="p-3.5 rounded-xl border border-[#bcd7ff] bg-[#eef5ff]/50 space-y-2.5">
          <p className="text-xs font-bold text-[#142152]">Enter File Path or Web Image URL:</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="flex-1 rounded-lg border border-[#c8d2e0] bg-white px-3 py-1.5 text-xs text-[#0a1018] placeholder:text-[#6b81a5] focus:border-[#1e57eb] focus:outline-none"
            />
            <input
              type="text"
              value={captionInput}
              onChange={(e) => setCaptionInput(e.target.value)}
              placeholder="Caption (optional)"
              className="w-full sm:w-48 rounded-lg border border-[#c8d2e0] bg-white px-3 py-1.5 text-xs text-[#0a1018] placeholder:text-[#6b81a5] focus:border-[#1e57eb] focus:outline-none"
            />
            <AdminButton type="button" size="sm" onClick={handleAddUrl} disabled={!urlInput.trim()}>
              <Check className="h-3.5 w-3.5" /> Set Image
            </AdminButton>
          </div>

          <div className="pt-1.5">
            <p className="text-[11px] font-semibold text-[#465a7e] mb-1.5">
              Quick Presets from Media Library:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PRESETS.map((p) => (
                <button
                  key={p.path}
                  type="button"
                  onClick={() => handleApplyPreset(p.path, p.label)}
                  className="rounded-md bg-white border border-[#c8d2e0] px-2.5 py-1 text-[11px] font-medium text-[#2c3a52] hover:border-[#1e57eb] hover:text-[#1e57eb] transition cursor-pointer"
                >
                  + {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {images.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((item, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#c8d2e0] bg-white p-3 shadow-xs transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#e6eaf1]">
                <img
                  src={item.src}
                  alt={item.caption || `Image ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute right-2 top-2 rounded-lg bg-[#0a1018]/75 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-red-600 cursor-pointer"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3">
                <input
                  type="text"
                  value={item.caption || ''}
                  onChange={(e) => handleCaptionChange(idx, e.target.value)}
                  placeholder="Enter photo caption..."
                  className="w-full rounded-lg border border-[#c8d2e0] bg-[#f4f6f9] px-3 py-1.5 text-xs text-[#0a1018] placeholder:text-[#6b81a5] focus:border-[#1e57eb] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          ))}

          {multiple && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-[16/10] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#c8d2e0] bg-[#f4f6f9]/60 text-[#465a7e] transition-colors hover:border-[#1e57eb] hover:bg-[#eef5ff]/40 hover:text-[#1e57eb] cursor-pointer"
            >
              <Plus className="h-6 w-6" />
              <span className="text-xs font-semibold">Add another photo</span>
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#c8d2e0] bg-[#f4f6f9]/40 py-8 text-center cursor-pointer transition-colors hover:border-[#1e57eb] hover:bg-[#eef5ff]/30"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#465a7e] shadow-xs">
            <ImageIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#1f2a3d]">
              No image selected. Click to upload from device, or click &ldquo;Paste Image URL&rdquo; above.
            </p>
            <p className="text-xs text-[#6b81a5] mt-0.5">PNG, JPG, WEBP formats supported.</p>
          </div>
        </div>
      )}
    </div>
  );
}
