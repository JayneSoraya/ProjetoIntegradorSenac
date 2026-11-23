import axios from 'axios';
import { validateNfceUrl } from '../security/nfceUrlPolicy';

const MAX_REDIRECTS = 3;
const MAX_HTML_BYTES = 2 * 1024 * 1024;

export interface FetchedNfce {
  html: string;
  finalUrl: URL;
}

export async function fetchNfceHtml(rawUrl: string): Promise<FetchedNfce> {
  let currentUrl = await validateNfceUrl(rawUrl);

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const response = await axios.get<string>(currentUrl.toString(), {
      maxRedirects: 0,
      responseType: 'text',
      timeout: 15_000,
      maxContentLength: MAX_HTML_BYTES,
      maxBodyLength: MAX_HTML_BYTES,
      validateStatus: (status) => status >= 200 && status < 400,
      headers: {
        'User-Agent': 'EconoWay/1.0 NFC-e consumer',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.location;
      if (!location || redirect === MAX_REDIRECTS) throw new Error('NFCE_REDIRECT_INVALID');
      currentUrl = await validateNfceUrl(new URL(location, currentUrl).toString());
      continue;
    }

    const contentType = String(response.headers['content-type'] ?? '').toLowerCase();
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      throw new Error('NFCE_CONTENT_TYPE');
    }

    const html = response.data;
    if (Buffer.byteLength(html, 'utf8') > MAX_HTML_BYTES) throw new Error('NFCE_CONTENT_TOO_LARGE');
    return { html, finalUrl: currentUrl };
  }

  throw new Error('NFCE_REDIRECT_LIMIT');
}
