import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Try multiple user-agents - some sites serve different content to bots vs crawlers
    const userAgents = [
      // Googlebot often gets full SSR content
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      // Facebook crawler gets OG tags
      'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      // Regular browser
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];

    let bestResult: ReturnType<typeof extractProductData> | null = null;

    for (const ua of userAgents) {
      try {
        const headers: Record<string, string> = {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,cs;q=0.8',
        };
        // Add browser-like headers for the regular Chrome UA
        if (ua.includes('Chrome')) {
          headers['sec-ch-ua'] = '"Chromium";v="120", "Google Chrome";v="120"';
          headers['sec-ch-ua-mobile'] = '?0';
          headers['sec-ch-ua-platform'] = '"macOS"';
          headers['sec-fetch-dest'] = 'document';
          headers['sec-fetch-mode'] = 'navigate';
          headers['sec-fetch-site'] = 'none';
          headers['sec-fetch-user'] = '?1';
          headers['upgrade-insecure-requests'] = '1';
        }
        const response = await fetch(url, {
          headers,
          redirect: 'follow',
        });

        if (!response.ok) continue;

        const html = await response.text();
        const result = extractProductData(html, url);

        // Count how many fields were extracted
        const fieldCount = [result.name, result.image_url, result.price].filter(v => v !== null).length;

        if (!bestResult) {
          bestResult = result;
        } else {
          const bestCount = [bestResult.name, bestResult.image_url, bestResult.price].filter(v => v !== null).length;
          if (fieldCount > bestCount) {
            bestResult = result;
          }
        }

        // If we got all key fields, stop trying
        if (result.name && result.image_url && result.price !== null) break;
      } catch {
        continue;
      }
    }

    if (!bestResult) {
      return NextResponse.json({ error: 'Could not fetch the page. The site may be blocking automated access.' }, { status: 400 });
    }

    // If nothing was extracted at all, return an error
    if (!bestResult.name && !bestResult.image_url && bestResult.price === null) {
      return NextResponse.json(
        { error: 'Could not extract product info. This site may require JavaScript to load. Try copying the product details manually.' },
        { status: 400 }
      );
    }

    return NextResponse.json(bestResult);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch URL' },
      { status: 400 }
    );
  }
}

function extractProductData(html: string, sourceUrl: string) {
  const data: {
    name: string | null;
    description: string | null;
    price: number | null;
    delivery_price: number | null;
    image_url: string | null;
    source_url: string;
  } = {
    name: null,
    description: null,
    price: null,
    delivery_price: null,
    image_url: null,
    source_url: sourceUrl,
  };

  // Try JSON-LD (most reliable for product data)
  const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of jsonLdMatches) {
    try {
      const jsonData = JSON.parse(match[1]);
      const products = findProducts(jsonData);
      if (products) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = products as any;
        if (p.name) data.name = String(p.name);
        if (p.description) data.description = truncate(stripHtml(String(p.description)), 200);
        if (p.image) {
          data.image_url = typeof p.image === 'string'
            ? p.image
            : Array.isArray(p.image)
              ? (typeof p.image[0] === 'string' ? p.image[0] : p.image[0]?.url || null)
              : p.image?.url || null;
        }
        if (p.offers) {
          const offer = Array.isArray(p.offers) ? p.offers[0] : p.offers;
          if (offer?.price) data.price = parseFloat(String(offer.price));
          if (offer?.shippingDetails) {
            const shipping = Array.isArray(offer.shippingDetails) ? offer.shippingDetails[0] : offer.shippingDetails;
            if (shipping?.shippingRate?.value) {
              data.delivery_price = parseFloat(String(shipping.shippingRate.value));
            }
          }
        }
        break;
      }
    } catch {
      // skip invalid JSON
    }
  }

  // Fallback: Open Graph meta tags
  if (!data.name) {
    data.name = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title') || extractTag(html, 'title');
  }
  if (!data.description) {
    const desc = extractMeta(html, 'og:description') || extractMeta(html, 'description') || extractMeta(html, 'twitter:description');
    if (desc) data.description = truncate(desc, 200);
  }
  if (!data.image_url) {
    data.image_url = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image') || extractMeta(html, 'twitter:image:src');
  }

  // Fallback: price from meta tags
  if (data.price === null) {
    const metaPrice = extractMeta(html, 'product:price:amount') || extractMeta(html, 'og:price:amount');
    if (metaPrice) data.price = parseFloat(metaPrice);
  }

  // Fallback: price from common patterns in HTML
  if (data.price === null) {
    const pricePatterns = [
      // Common price class patterns
      /class=["'][^"']*(?:price|Price|product-price|sale-price|current-price|final-price)[^"']*["'][^>]*>[\s]*(?:<[^>]+>)*[\s]*(?:(?:Kč|CZK|€|EUR|£|\$)\s*)?(\d[\d\s,.]*\d?)[\s]*(?:(?:Kč|CZK|€|EUR|£|\$))?/i,
      // data-price attribute
      /data-price=["'](\d[\d,.]*\d?)["']/i,
      // itemprop price
      /itemprop=["']price["'][^>]*content=["'](\d[\d,.]*\d?)["']/i,
      /itemprop=["']price["'][^>]*>[\s]*(?:<[^>]+>)*[\s]*(?:(?:Kč|CZK|€|EUR|£|\$)\s*)?(\d[\d\s,.]*\d?)/i,
    ];

    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        const cleaned = match[1].replace(/\s/g, '').replace(',', '.');
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed) && parsed > 0) {
          data.price = parsed;
          break;
        }
      }
    }
  }

  // Fallback: delivery/shipping price from common patterns
  if (data.delivery_price === null) {
    const shippingPatterns = [
      /(?:shipping|delivery|doprava|doručení|Versand)[\s\S]{0,100}?(\d[\d\s,.]*\d?)\s*(?:Kč|CZK|€|EUR|£|\$)/i,
      /(?:Kč|CZK|€|EUR|£|\$)\s*(\d[\d\s,.]*\d?)[\s\S]{0,30}?(?:shipping|delivery|doprava|doručení|Versand)/i,
      /data-shipping[^>]*=["'](\d[\d,.]*\d?)["']/i,
    ];

    for (const pattern of shippingPatterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        const cleaned = match[1].replace(/\s/g, '').replace(',', '.');
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed) && parsed >= 0 && parsed < 10000) {
          data.delivery_price = parsed;
          break;
        }
      }
    }
  }

  // Resolve relative image URLs
  if (data.image_url && !data.image_url.startsWith('http')) {
    try {
      const base = new URL(sourceUrl);
      data.image_url = new URL(data.image_url, base.origin).href;
    } catch { /* ignore */ }
  }

  return data;
}

function findProducts(data: Record<string, unknown>): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null;

  const type = (data['@type'] as string)?.toLowerCase();
  if (type === 'product' || type === 'offer') return data;

  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findProducts(item as Record<string, unknown>);
      if (found) return found;
    }
  }

  if (data['@graph'] && Array.isArray(data['@graph'])) {
    for (const item of data['@graph']) {
      const found = findProducts(item as Record<string, unknown>);
      if (found) return found;
    }
  }

  return null;
}

function extractMeta(html: string, name: string): string | null {
  // Try property attribute
  const propMatch = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${escapeRegex(name)}["'][^>]+content=["']([^"']+)["']`, 'i'));
  if (propMatch) return decodeHtmlEntities(propMatch[1]);

  // Try content before property
  const reverseMatch = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapeRegex(name)}["']`, 'i'));
  if (reverseMatch) return decodeHtmlEntities(reverseMatch[1]);

  return null;
}

function extractTag(html: string, tag: string): string | null {
  const match = html.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'i'));
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).replace(/\s\S*$/, '') + '...';
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
}
