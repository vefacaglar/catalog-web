'use client';

import type { AdminProductImage } from '@catalog/contracts';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRef, useState } from 'react';

import {
  deleteProductImage,
  getProduct,
  reorderProductImages,
  updateImageAlt,
  uploadProductImage,
} from '@/lib/admin-api';
import { imageUrl } from '@/lib/image';

interface ImageManagerProps {
  productId: number;
  initialImages: AdminProductImage[];
}

export function ImageManager({ productId, initialImages }: ImageManagerProps) {
  const t = useTranslations('admin.images');
  const [images, setImages] = useState(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    const product = await getProduct(productId);
    setImages(product.images);
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        await uploadProductImage(productId, file);
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('uploadFailed'));
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function move(imageId: number, direction: -1 | 1) {
    const index = images.findIndex((img) => img.id === imageId);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= images.length) return;

    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved as AdminProductImage);

    setError(null);
    setBusy(true);
    try {
      await reorderProductImages(
        productId,
        reordered.map((img) => img.id),
      );
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('reorderFailed'));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(imageId: number) {
    if (!confirm(t('deleteConfirm'))) return;
    setError(null);
    setBusy(true);
    try {
      await deleteProductImage(productId, imageId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('uploadFailed'));
    } finally {
      setBusy(false);
    }
  }

  async function handleAltSave(image: AdminProductImage, altTr: string, altEn: string) {
    setError(null);
    try {
      await updateImageAlt(productId, image.id, {
        altTr: altTr.trim() || null,
        altEn: altEn.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('altSaveFailed'));
    }
  }

  return (
    <div className="mt-6 max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          {t('title', { count: images.length })}
        </h2>
        <label className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700">
          {busy ? t('uploading') : t('upload')}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            disabled={busy}
            onChange={(e) => void handleUpload(e.target.files)}
            className="hidden"
          />
        </label>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {images.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          {t('empty')}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {images.map((image, index) => (
            <ImageRow
              key={image.id}
              image={image}
              isCover={index === 0}
              canMoveUp={index > 0}
              canMoveDown={index < images.length - 1}
              busy={busy}
              onMoveUp={() => void move(image.id, -1)}
              onMoveDown={() => void move(image.id, 1)}
              onDelete={() => void handleDelete(image.id)}
              onAltSave={(altTr, altEn) => void handleAltSave(image, altTr, altEn)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ImageRow({
  image,
  isCover,
  canMoveUp,
  canMoveDown,
  busy,
  onMoveUp,
  onMoveDown,
  onDelete,
  onAltSave,
}: {
  image: AdminProductImage;
  isCover: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  busy: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onAltSave: (altTr: string, altEn: string) => void;
}) {
  const t = useTranslations('admin.images');
  const tc = useTranslations('admin.common');
  const [altTr, setAltTr] = useState(image.altTr ?? '');
  const [altEn, setAltEn] = useState(image.altEn ?? '');

  return (
    <li className="flex gap-4 rounded-xl border border-zinc-200 p-3">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
        <Image
          src={imageUrl(image.filePath, 'thumb')}
          alt={image.altTr ?? ''}
          fill
          sizes="96px"
          className="object-cover"
          unoptimized
        />
        {isCover && (
          <span className="absolute left-1 top-1 rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
            {t('cover')}
          </span>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <input
          value={altTr}
          onChange={(e) => setAltTr(e.target.value)}
          onBlur={() => onAltSave(altTr, altEn)}
          placeholder={t('altTr')}
          className="w-full rounded border border-zinc-300 px-2 py-1 text-xs"
        />
        <input
          value={altEn}
          onChange={(e) => setAltEn(e.target.value)}
          onBlur={() => onAltSave(altTr, altEn)}
          placeholder={t('altEn')}
          className="w-full rounded border border-zinc-300 px-2 py-1 text-xs"
        />
      </div>

      <div className="flex flex-col items-end justify-between">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp || busy}
            className="rounded border px-2 py-0.5 text-xs disabled:opacity-30"
            title={t('moveUp')}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown || busy}
            className="rounded border px-2 py-0.5 text-xs disabled:opacity-30"
            title={t('moveDown')}
          >
            ↓
          </button>
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-30"
        >
          {tc('delete')}
        </button>
      </div>
    </li>
  );
}
