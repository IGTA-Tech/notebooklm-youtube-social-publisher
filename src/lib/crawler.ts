import * as cheerio from 'cheerio';

export interface BrandProfile {
  name?: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  favicon?: string;
  keywords?: string[];
  tone?: string;
}

export interface CrawlResult {
  success: boolean;
  brand?: BrandProfile;
  error?: string;
}

// Common color extraction patterns
const colorPatterns = [
  /--primary[-_]?color:\s*([^;]+)/i,
  /--brand[-_]?color:\s*([^;]+)/i,
  /--main[-_]?color:\s*([^;]+)/i,
  /--theme[-_]?color:\s*([^;]+)/i,
];

const secondaryColorPatterns = [
  /--secondary[-_]?color:\s*([^;]+)/i,
  /--accent[-_]?color:\s*([^;]+)/i,
];

function extractColors(html: string): { primary?: string; secondary?: string } {
  const result: { primary?: string; secondary?: string } = {};

  // Try to find primary color from CSS variables
  for (const pattern of colorPatterns) {
    const match = html.match(pattern);
    if (match) {
      result.primary = match[1].trim();
      break;
    }
  }

  // Try to find secondary color
  for (const pattern of secondaryColorPatterns) {
    const match = html.match(pattern);
    if (match) {
      result.secondary = match[1].trim();
      break;
    }
  }

  // Fallback: extract from meta theme-color
  if (!result.primary) {
    const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
    if (themeColorMatch) {
      result.primary = themeColorMatch[1];
    }
  }

  return result;
}

export async function crawlWebsite(url: string): Promise<CrawlResult> {
  try {
    // Normalize URL
    let normalizedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = `https://${url}`;
    }

    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch website: ${response.status} ${response.statusText}`,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const brand: BrandProfile = {};

    // Extract site name
    brand.name = $('meta[property="og:site_name"]').attr('content')
      || $('meta[name="application-name"]').attr('content')
      || $('title').text().split('|')[0].trim()
      || $('title').text().split('-')[0].trim();

    // Extract description
    brand.description = $('meta[property="og:description"]').attr('content')
      || $('meta[name="description"]').attr('content')
      || '';

    // Extract logo
    brand.logoUrl = $('meta[property="og:image"]').attr('content')
      || $('link[rel="apple-touch-icon"]').attr('href')
      || $('link[rel="icon"][sizes="192x192"]').attr('href')
      || '';

    // Make logo URL absolute
    if (brand.logoUrl && !brand.logoUrl.startsWith('http')) {
      const baseUrl = new URL(normalizedUrl);
      brand.logoUrl = new URL(brand.logoUrl, baseUrl.origin).toString();
    }

    // Extract favicon
    brand.favicon = $('link[rel="icon"]').attr('href')
      || $('link[rel="shortcut icon"]').attr('href')
      || '/favicon.ico';

    if (brand.favicon && !brand.favicon.startsWith('http')) {
      const baseUrl = new URL(normalizedUrl);
      brand.favicon = new URL(brand.favicon, baseUrl.origin).toString();
    }

    // Extract keywords
    const keywordsContent = $('meta[name="keywords"]').attr('content');
    if (keywordsContent) {
      brand.keywords = keywordsContent.split(',').map(k => k.trim()).filter(k => k);
    }

    // Extract colors from CSS
    const colors = extractColors(html);
    brand.primaryColor = colors.primary;
    brand.secondaryColor = colors.secondary;

    // Infer tone from content
    const bodyText = $('body').text().toLowerCase();
    if (bodyText.includes('professional') || bodyText.includes('enterprise') || bodyText.includes('business')) {
      brand.tone = 'professional';
    } else if (bodyText.includes('fun') || bodyText.includes('exciting') || bodyText.includes('amazing')) {
      brand.tone = 'casual';
    } else if (bodyText.includes('innovative') || bodyText.includes('cutting-edge') || bodyText.includes('revolutionary')) {
      brand.tone = 'bold';
    } else {
      brand.tone = 'neutral';
    }

    return {
      success: true,
      brand,
    };
  } catch (error) {
    return {
      success: false,
      error: `Crawl failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
