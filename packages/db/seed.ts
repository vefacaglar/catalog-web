import 'dotenv/config';
import argon2 from 'argon2';

import { createDb } from './src/index.js';
import {
  categories,
  categoryTranslations,
  productImages,
  products,
  productTranslations,
  roles,
  users,
} from './src/schema/index.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL tanimli degil');

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@catalog.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin1234';

const { db, client } = createDb(DATABASE_URL);

async function main() {
  // Dev seed — mevcut verileri temizleyip baştan kurar
  await db.delete(productImages);
  await db.delete(productTranslations);
  await db.delete(products);
  await db.delete(categoryTranslations);
  await db.delete(categories);
  await db.delete(users);
  await db.delete(roles);

  const [adminRole] = await db.insert(roles).values({ name: 'admin' }).returning();
  const [userRole] = await db.insert(roles).values({ name: 'user' }).returning();
  if (!adminRole || !userRole) throw new Error('Rol seed edilemedi');

  const passwordHash = await argon2.hash(ADMIN_PASSWORD);
  await db.insert(users).values({
    email: ADMIN_EMAIL,
    passwordHash,
    roleId: adminRole.id,
  });

  // Kategoriler: Mobilya (üst) → Sandalyeler (alt), Aydınlatma
  const [furniture] = await db.insert(categories).values({ sortOrder: 0 }).returning();
  if (!furniture) throw new Error('Kategori seed edilemedi');
  const [chairs] = await db
    .insert(categories)
    .values({ parentId: furniture.id, sortOrder: 0 })
    .returning();
  const [lighting] = await db.insert(categories).values({ sortOrder: 1 }).returning();
  if (!chairs || !lighting) throw new Error('Kategori seed edilemedi');

  await db.insert(categoryTranslations).values([
    { categoryId: furniture.id, locale: 'tr', name: 'Mobilya', slug: 'mobilya' },
    { categoryId: furniture.id, locale: 'en', name: 'Furniture', slug: 'furniture' },
    { categoryId: chairs.id, locale: 'tr', name: 'Sandalyeler', slug: 'sandalyeler' },
    { categoryId: chairs.id, locale: 'en', name: 'Chairs', slug: 'chairs' },
    { categoryId: lighting.id, locale: 'tr', name: 'Aydınlatma', slug: 'aydinlatma' },
    { categoryId: lighting.id, locale: 'en', name: 'Lighting', slug: 'lighting' },
  ]);

  const seedProducts: {
    categoryId: number;
    isFeatured: boolean;
    sku: string;
    tr: { name: string; slug: string; description: string };
    en: { name: string; slug: string; description: string };
  }[] = [
    {
      categoryId: chairs.id,
      isFeatured: true,
      sku: 'CH-001',
      tr: {
        name: 'Ahşap Sandalye',
        slug: 'ahsap-sandalye',
        description: 'Masif meşe ağacından el yapımı sandalye.',
      },
      en: {
        name: 'Wooden Chair',
        slug: 'wooden-chair',
        description: 'Handmade chair crafted from solid oak.',
      },
    },
    {
      categoryId: chairs.id,
      isFeatured: false,
      sku: 'CH-002',
      tr: {
        name: 'Metal Sandalye',
        slug: 'metal-sandalye',
        description: 'Endüstriyel tarz, toz boyalı metal sandalye.',
      },
      en: {
        name: 'Metal Chair',
        slug: 'metal-chair',
        description: 'Industrial style powder-coated metal chair.',
      },
    },
    {
      categoryId: chairs.id,
      isFeatured: false,
      sku: 'CH-003',
      tr: {
        name: 'Kadife Berjer',
        slug: 'kadife-berjer',
        description: 'Yumuşak kadife kumaşlı, rahat berjer koltuk.',
      },
      en: {
        name: 'Velvet Armchair',
        slug: 'velvet-armchair',
        description: 'Comfortable armchair with soft velvet upholstery.',
      },
    },
    {
      categoryId: furniture.id,
      isFeatured: true,
      sku: 'FR-001',
      tr: {
        name: 'Yemek Masası',
        slug: 'yemek-masasi',
        description: 'Altı kişilik ceviz kaplama yemek masası.',
      },
      en: {
        name: 'Dining Table',
        slug: 'dining-table',
        description: 'Walnut veneer dining table for six.',
      },
    },
    {
      categoryId: lighting.id,
      isFeatured: true,
      sku: 'LT-001',
      tr: {
        name: 'Sarkıt Lamba',
        slug: 'sarkit-lamba',
        description: 'Pirinç gövdeli, ayarlanabilir sarkıt lamba.',
      },
      en: {
        name: 'Pendant Lamp',
        slug: 'pendant-lamp',
        description: 'Adjustable pendant lamp with brass body.',
      },
    },
    {
      categoryId: lighting.id,
      isFeatured: false,
      sku: 'LT-002',
      tr: {
        name: 'Masa Lambası',
        slug: 'masa-lambasi',
        description: 'Keten şapkalı, seramik gövdeli masa lambası.',
      },
      en: {
        name: 'Table Lamp',
        slug: 'table-lamp',
        description: 'Ceramic table lamp with linen shade.',
      },
    },
  ];

  for (const [i, p] of seedProducts.entries()) {
    const [product] = await db
      .insert(products)
      .values({
        categoryId: p.categoryId,
        sku: p.sku,
        isFeatured: p.isFeatured,
        sortOrder: i,
      })
      .returning();
    if (!product) throw new Error('Ürün seed edilemedi');

    await db.insert(productTranslations).values([
      { productId: product.id, locale: 'tr', ...p.tr },
      { productId: product.id, locale: 'en', ...p.en },
    ]);
  }

  console.log(
    `Seed tamam: 2 rol, 1 admin (${ADMIN_EMAIL}), 3 kategori, ${seedProducts.length} ürün`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => client.end());
