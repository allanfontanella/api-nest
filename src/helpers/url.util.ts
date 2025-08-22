const PUBLIC_BASE = process.env.APP_PUBLIC_URL;

export function toAbsoluteUrl(req: any, pathOrUrl?: string | null, base?: string) {
  if (!pathOrUrl) return null;
  // Já é absoluta?
  try { return new URL(pathOrUrl).toString(); } catch { }

  // Base fixa (recomendado): APP_PUBLIC_URL=https://api.seu-dominio.com
  if (base) return new URL(pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`, base).toString();

  // Fallback via headers (proxy-friendly)
  const xfProto = (req?.headers?.['x-forwarded-proto'] as string)?.split(',')[0];
  const xfHost = (req?.headers?.['x-forwarded-host'] as string)?.split(',')[0];
  const host = xfHost || req?.headers?.host;
  // Fastify costuma ter req.protocol; Express também. Se não tiver, assume http.
  const proto = xfProto || req?.protocol || 'http';

  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${proto}://${host}${path}`;
}

export function decorateCarrossel(v: any, req: any) {
  // Normaliza imagens e j� calcula absoluteUrl
  const imagens = (v.imagens ?? []).map((img: any) => ({
    ...img,
    absoluteUrl: toAbsoluteUrl(req, img.imagem, PUBLIC_BASE),
  }));

  // procura preview marcado
  const found = imagens.find((i: any) => i.preview);

  // fallback: usa o campo `imagem` do registro se n�o houver preview em imagens[]
  const previewUrl = found
    ? found.absoluteUrl
    : v.imagem
      ? toAbsoluteUrl(req, v.imagem, PUBLIC_BASE)
      : null;

  // retorna o objeto original + campos calculados
  return { ...v, imagens, previewUrl };
}

