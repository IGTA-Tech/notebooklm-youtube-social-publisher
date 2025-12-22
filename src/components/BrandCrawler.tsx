'use client';

import { useState } from 'react';

interface BrandProfile {
  name?: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  favicon?: string;
  keywords?: string[];
  tone?: string;
}

interface BrandCrawlerProps {
  onBrandCrawled?: (brand: BrandProfile) => void;
}

export default function BrandCrawler({ onBrandCrawled }: BrandCrawlerProps) {
  const [url, setUrl] = useState('');
  const [crawling, setCrawling] = useState(false);
  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCrawl = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setCrawling(true);
    setError(null);
    setBrand(null);

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to crawl website');
        return;
      }

      setBrand(result.brand);
      onBrandCrawled?.(result.brand);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Crawl failed');
    } finally {
      setCrawling(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Brand Context</h2>
      <p className="text-gray-600">
        Enter your brand website to extract colors, logo, and styling for consistent content.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <input
          type="url"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://yourbrand.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={crawling}
        />
        <button
          onClick={handleCrawl}
          disabled={crawling || !url.trim()}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {crawling ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Crawling...
            </>
          ) : (
            <>
              <span>🔍</span>
              Analyze Brand
            </>
          )}
        </button>
      </div>

      {/* Brand Profile Display */}
      {brand && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-4">
            {brand.logoUrl && (
              <img
                src={brand.logoUrl}
                alt="Brand logo"
                className="w-16 h-16 object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900">{brand.name || 'Unknown'}</h3>
              {brand.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {brand.description}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Primary Color */}
            {brand.primaryColor && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Primary Color</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: brand.primaryColor }}
                  />
                  <span className="text-sm font-mono">{brand.primaryColor}</span>
                </div>
              </div>
            )}

            {/* Secondary Color */}
            {brand.secondaryColor && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Secondary Color</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: brand.secondaryColor }}
                  />
                  <span className="text-sm font-mono">{brand.secondaryColor}</span>
                </div>
              </div>
            )}

            {/* Tone */}
            {brand.tone && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Brand Tone</p>
                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm capitalize">
                  {brand.tone}
                </span>
              </div>
            )}

            {/* Favicon */}
            {brand.favicon && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Favicon</p>
                <img
                  src={brand.favicon}
                  alt="Favicon"
                  className="w-8 h-8"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Keywords */}
          {brand.keywords && brand.keywords.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {brand.keywords.slice(0, 10).map((keyword, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
