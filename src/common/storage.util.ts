// src/common/storage.util.ts
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

type SaveOptions = {
  subfolder?: string;   // ex.: 'depoimentos'
  maxBytes?: number;    // limite (default 5MB)
};

export async function saveBase64Image(
  dataUrlOrBase64: string,
  opts: SaveOptions = {},
) {
  const subfolder = opts.subfolder ?? 'depoimentos';
  const maxBytes = opts.maxBytes ?? 5 * 1024 * 1024; // 5MB

  let mime = 'image/png';
  let base64 = dataUrlOrBase64;

  // Suporta data URL: data:image/png;base64,AAAA...
  const match = dataUrlOrBase64.match(/^data:(image\/[\w+.-]+);base64,(.+)$/i);
  if (match) {
    mime = match[1].toLowerCase();
    base64 = match[2];
  }

  if (!/^image\/(png|jpe?g|webp|gif)$/i.test(mime)) {
    throw new Error('Tipo de imagem não suportado. Use png, jpg, jpeg, webp ou gif.');
  }

  // Tamanho aproximado de base64 em bytes
  const estimatedBytes = Math.floor(base64.length * 3 / 4);
  if (estimatedBytes > maxBytes) {
    throw new Error(`Imagem excede ${Math.floor(maxBytes / 1024 / 1024)}MB.`);
  }

  const ext =
    mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' :
      mime.includes('png') ? 'png' :
        mime.includes('webp') ? 'webp' :
          mime.includes('gif') ? 'gif' : 'bin';

  const fileName = `${Date.now()}-${randomUUID()}.${ext}`;
  let destDir = join(process.cwd(), process.env.UPLOADS_DIR ?? 'uploads', subfolder);
  await fs.mkdir(destDir, { recursive: true });

  const buffer = Buffer.from(base64, 'base64');
  const absolutePath = join(destDir, fileName);
  await fs.writeFile(absolutePath, buffer);
  let publicPath = `/${process.env.UPLOADS_DIR ?? 'uploads'}/${subfolder}/${fileName}`;
  if (process.env.PREFIX) {
    publicPath = `/${process.env.PREFIX}${publicPath}`;
  }

  return { absolutePath, publicPath, fileName };
}
