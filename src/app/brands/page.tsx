'use client';

import { useState } from 'react';
import Link from 'next/link';
import BrandCrawler from '@/components/BrandCrawler';

interface SavedBrand {
  id: string;
  name: string;
  websiteUrl: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  tone?: string;
  createdAt: string;
}

export default function BrandsPage() {
  const [savedBrands, setSavedBrands] = useState<SavedBrand[]>([]);

  const handleBrandCrawled = (brand: {
    name?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    tone?: string;
  }) => {
    const newBrand: SavedBrand = {
      id: Date.now().toString(),
      name: brand.name || 'Unknown Brand',
      websiteUrl: '',
      primaryColor: brand.primaryColor,
      secondaryColor: brand.secondaryColor,
      logoUrl: brand.logoUrl,
      tone: brand.tone,
      createdAt: new Date().toISOString(),
    };
    setSavedBrands((prev) => [newBrand, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                &larr; Back to Dashboard
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Brand Management</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Brand Crawler */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <BrandCrawler onBrandCrawled={handleBrandCrawled} />
          </div>

          {/* Saved Brands */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Saved Brands</h2>
            {savedBrands.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No brands saved yet.</p>
                <p className="text-sm mt-2">Crawl a website to add a brand profile.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedBrands.map((brand) => (
                  <div
                    key={brand.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {brand.logoUrl && (
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="w-12 h-12 object-contain rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {brand.tone || 'neutral'} tone
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {brand.primaryColor && (
                          <div
                            className="w-6 h-6 rounded border border-gray-200"
                            style={{ backgroundColor: brand.primaryColor }}
                            title={brand.primaryColor}
                          />
                        )}
                        {brand.secondaryColor && (
                          <div
                            className="w-6 h-6 rounded border border-gray-200"
                            style={{ backgroundColor: brand.secondaryColor }}
                            title={brand.secondaryColor}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
