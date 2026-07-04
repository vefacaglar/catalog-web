
const IMAGEKIT_URL = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? '';

const PRESETS = {
  thumb: 'tr:w-480,q-80',
  gallery: 'tr:w-1200,q-85',
  full: 'tr:q-90',
} as const;

export type ImagePreset = keyof typeof PRESETS;

export function imageUrl(filePath: string, preset: ImagePreset = 'gallery'): string {
  if (!IMAGEKIT_URL) return filePath;
  const normalized = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${IMAGEKIT_URL}/${PRESETS[preset]}${normalized}`;
}
