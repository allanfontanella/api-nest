export function toAbsoluteUrl(req: any, pathOrUrl?: string | null, base?: string) {
    if (!pathOrUrl) return null;
    // Já é absoluta?
    try { return new URL(pathOrUrl).toString(); } catch {}
  
    // Base fixa (recomendado): APP_PUBLIC_URL=https://api.seu-dominio.com
    if (base) return new URL(pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`, base).toString();
  
    // Fallback via headers (proxy-friendly)
    const xfProto = (req?.headers?.['x-forwarded-proto'] as string)?.split(',')[0];
    const xfHost  = (req?.headers?.['x-forwarded-host']  as string)?.split(',')[0];
    const host    = xfHost || req?.headers?.host;
    // Fastify costuma ter req.protocol; Express também. Se não tiver, assume http.
    const proto   = xfProto || req?.protocol || 'http';
  
    const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    return `${proto}://${host}${path}`;
  }