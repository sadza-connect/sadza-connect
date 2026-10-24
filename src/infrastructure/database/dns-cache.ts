import dns from 'node:dns';

// Ensure Node defaults to IPv4 first to avoid AAAA timeouts on IPv4-only networks
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

// Resilient fallback IPs for Supabase eu-west-1 AWS ELB poolers
const DEFAULT_SUPABASE_POOLER_IPS = [
  '52.209.89.87',
  '108.128.216.176',
  '34.241.16.247',
];

const ipCache = new Map<string, string[]>();
ipCache.set('aws-0-eu-west-1.pooler.supabase.com', [...DEFAULT_SUPABASE_POOLER_IPS]);

let poolerIpIndex = 0;

// Background resolver using reliable public DNS (Cloudflare & Google)
async function refreshHostIps(hostname: string): Promise<void> {
  try {
    const resolver = new dns.promises.Resolver();
    resolver.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1', '8.8.4.4']);
    const ips = await resolver.resolve4(hostname);
    if (ips && ips.length > 0) {
      ipCache.set(hostname, ips);
    }
  } catch {
    // Retain existing cached / fallback IPs if public DNS is temporarily unreachable
  }
}

// Trigger initial background refresh and periodic refresh every 30 minutes
refreshHostIps('aws-0-eu-west-1.pooler.supabase.com').catch(() => {});
setInterval(() => {
  refreshHostIps('aws-0-eu-west-1.pooler.supabase.com').catch(() => {});
}, 30 * 60 * 1000).unref();

// Intercept dns.lookup to immediately resolve Supabase pooler hostnames from cache
const originalLookup = dns.lookup;

// Overwrite dns.lookup
const patchedLookup: typeof dns.lookup = function (
  hostname: string,
  optionsOrCb: any,
  maybeCb?: any,
) {
  const callback = typeof optionsOrCb === 'function' ? optionsOrCb : maybeCb;
  const options = typeof optionsOrCb === 'object' ? optionsOrCb : {};

  if (
    typeof hostname === 'string' &&
    (hostname === 'aws-0-eu-west-1.pooler.supabase.com' ||
      hostname.endsWith('.pooler.supabase.com'))
  ) {
    const ips = ipCache.get(hostname) || DEFAULT_SUPABASE_POOLER_IPS;
    const selectedIp = ips[poolerIpIndex++ % ips.length];

    if (options && options.all) {
      return process.nextTick(() =>
        callback(null, [{ address: selectedIp, family: 4 }]),
      );
    }
    return process.nextTick(() => callback(null, selectedIp, 4));
  }

  return (originalLookup as any).call(dns, hostname, optionsOrCb, maybeCb);
} as typeof dns.lookup;

dns.lookup = patchedLookup;

export function getCachedPoolerIp(hostname = 'aws-0-eu-west-1.pooler.supabase.com'): string {
  const ips = ipCache.get(hostname) || DEFAULT_SUPABASE_POOLER_IPS;
  return ips[poolerIpIndex % ips.length];
}
