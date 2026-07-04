import type { ProductListItem } from '@catalog/contracts';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { Link } from '@/i18n/navigation';
import { imageUrl } from '@/lib/image';

export function ProductCard({ product }: { product: ProductListItem }) {
  const t = useTranslations();

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-square bg-zinc-100">
        {product.coverImage ? (
          <Image
            src={imageUrl(product.coverImage.filePath, 'thumb')}
            alt={product.coverImage.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            {t('product.noImage')}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs uppercase tracking-wide text-zinc-500">{product.category.name}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-zinc-900">{product.name}</h3>
      </div>
    </Link>
  );
}
