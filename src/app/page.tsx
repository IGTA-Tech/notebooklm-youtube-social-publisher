'use client';

import { useState } from 'react';
import Link from 'next/link';
import UploadForm from '@/components/UploadForm';
import BrandCrawler from '@/components/BrandCrawler';
import ThumbnailGenerator from '@/components/ThumbnailGenerator';
import PublishForm from '@/components/PublishForm';

interface UploadedFile {
  id: string;
  filename: string;
  originalName?: string;
  path: string;
  type: 'video' | 'audio' | 'transcript';
  size?: number;
}

interface BrandProfile {
  name?: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  tone?: string;
}

type Step = 'upload' | 'brand' | 'thumbnail' | 'publish';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');

  const steps: { id: Step; label: string; icon: string }[] = [
    { id: 'upload', label: 'Upload Content', icon: '1' },
    { id: 'brand', label: 'Brand Context', icon: '2' },
    { id: 'thumbnail', label: 'Generate Thumbnail', icon: '3' },
    { id: 'publish', label: 'Publish', icon: '4' },
  ];

  const handleUploadComplete = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    const transcriptFile = files.find((f) => f.type === 'transcript');
    if (transcriptFile) {
      // The transcript content is stored when saved
      // For now we'll store a placeholder
    }
  };

  const handleBrandCrawled = (crawledBrand: BrandProfile) => {
    setBrand(crawledBrand);
  };

  const handleThumbnailGenerated = (url: string) => {
    setThumbnailUrl(url);
  };

  const canProceed = (step: Step) => {
    switch (step) {
      case 'upload':
        return true;
      case 'brand':
        return uploadedFiles.length > 0;
      case 'thumbnail':
        return true; // Can skip brand step
      case 'publish':
        return uploadedFiles.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">NotebookLM Publisher</h1>
                <p className="text-sm text-gray-500">YouTube & Social Media Distribution</p>
              </div>
            </div>
            <nav className="flex gap-4">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/brands"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Brands
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Step Progress */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => canProceed(step.id) && setCurrentStep(step.id)}
                className={`flex items-center gap-2 ${
                  currentStep === step.id
                    ? 'text-blue-600'
                    : canProceed(step.id)
                    ? 'text-gray-600 hover:text-gray-900'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : canProceed(step.id)
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step.icon}
                </span>
                <span className="hidden md:inline font-medium">{step.label}</span>
                {index < steps.length - 1 && (
                  <span className="hidden lg:block w-16 h-0.5 bg-gray-200 ml-4"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          {currentStep === 'upload' && (
            <>
              <UploadForm onUploadComplete={handleUploadComplete} />
              {uploadedFiles.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentStep('brand')}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Continue to Brand Context
                  </button>
                </div>
              )}
            </>
          )}

          {currentStep === 'brand' && (
            <>
              <BrandCrawler onBrandCrawled={handleBrandCrawled} />
              <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('thumbnail')}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {brand ? 'Continue with Brand' : 'Skip to Thumbnail'}
                </button>
              </div>
            </>
          )}

          {currentStep === 'thumbnail' && (
            <>
              <ThumbnailGenerator
                transcript={transcript || 'Sample transcript content for thumbnail generation'}
                brandColors={
                  brand
                    ? { primary: brand.primaryColor, secondary: brand.secondaryColor }
                    : undefined
                }
                onThumbnailGenerated={handleThumbnailGenerated}
              />
              <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setCurrentStep('brand')}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('publish')}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {thumbnailUrl ? 'Continue with Thumbnail' : 'Skip to Publish'}
                </button>
              </div>
            </>
          )}

          {currentStep === 'publish' && (
            <>
              <PublishForm
                thumbnailUrl={thumbnailUrl || undefined}
                mediaUrls={uploadedFiles
                  .filter((f) => f.type === 'video')
                  .map((f) => f.path)}
              />
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep('thumbnail')}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Back to Thumbnail
                </button>
              </div>
            </>
          )}
        </div>

        {/* Status Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Files Uploaded</p>
            <p className="text-2xl font-bold text-gray-900">{uploadedFiles.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Brand</p>
            <p className="text-2xl font-bold text-gray-900">
              {brand ? brand.name?.slice(0, 10) || 'Set' : 'None'}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Thumbnail</p>
            <p className="text-2xl font-bold text-gray-900">
              {thumbnailUrl ? 'Ready' : 'None'}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-2xl font-bold text-gray-900">Draft</p>
          </div>
        </div>
      </main>
    </div>
  );
}
