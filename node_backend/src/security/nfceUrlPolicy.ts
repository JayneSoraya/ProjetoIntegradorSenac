import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { env } from '../config/env';

function ipv4ToInt(address: string): number {
  return address
    .split('.')
    .map(Number)
    .reduce((acc, octet) => ((acc << 8) | octet) >>> 0, 0);
}

function inIpv4Cidr(address: string, base: string, prefix: number): boolean {
  const value = ipv4ToInt(address);
  const network = ipv4ToInt(base);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (value & mask) === (network & mask);
}

export function isBlockedNetworkAddress(address: string): boolean {
  const family = isIP(address);

  if (family === 4) {
    const blockedCidrs: Array<[string, number]> = [
      ['0.0.0.0', 8],
      ['10.0.0.0', 8],
      ['100.64.0.0', 10],
      ['127.0.0.0', 8],
      ['169.254.0.0', 16],
      ['172.16.0.0', 12],
      ['192.0.0.0', 24],
      ['192.0.2.0', 24],
      ['192.168.0.0', 16],
      ['198.18.0.0', 15],
      ['198.51.100.0', 24],
      ['203.0.113.0', 24],
      ['224.0.0.0', 4],
      ['240.0.0.0', 4],
    ];

    return blockedCidrs.some(([base, prefix]) => inIpv4Cidr(address, base, prefix));
  }

  if (family === 6) {
    const normalized = address.toLowerCase();
    return (
      normalized === '::' ||
      normalized === '::1' ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd') ||
      /^fe[89ab]/.test(normalized) ||
      normalized.startsWith('ff') ||
      normalized.startsWith('2001:db8:') ||
      normalized.startsWith('::ffff:127.') ||
      normalized.startsWith('::ffff:10.') ||
      normalized.startsWith('::ffff:192.168.')
    );
  }

  return true;
}

export function validateNfceUrlShape(rawUrl: string): URL {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('NFCE_URL_INVALID');
  }

  if (url.protocol !== 'https:') {
    throw new Error('NFCE_URL_PROTOCOL');
  }

  if (url.username || url.password) {
    throw new Error('NFCE_URL_CREDENTIALS');
  }

  if (url.port && url.port !== '443') {
    throw new Error('NFCE_URL_PORT');
  }

  const hostname = url.hostname.toLowerCase();
  if (!env.nfceAllowedHosts.includes(hostname)) {
    throw new Error('NFCE_URL_HOST');
  }

  return url;
}

export async function validateNfceUrl(rawUrl: string): Promise<URL> {
  const url = validateNfceUrlShape(rawUrl);
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });

  if (!addresses.length || addresses.some(({ address }) => isBlockedNetworkAddress(address))) {
    throw new Error('NFCE_URL_ADDRESS');
  }

  return url;
}
