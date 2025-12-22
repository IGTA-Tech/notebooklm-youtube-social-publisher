'use client';

import { useState } from 'react';

interface ThumbnailGeneratorProps {
  transcript?: string;
  title?: string;
  brandColors?: {
    primary?: string;
    secondary?: string;
  };
  onThumbnailGenerated?: (imageUrl: string) => void;
}

type ThumbnailStyle = 'professional' | 'casual' | 'bold' | 'minimal';

export default function ThumbnailGenerator({
  transcript,
  title,
  brandColors,
  onThumbnailGenerated,
}: ThumbnailGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [revisedPrompt, setRevisedPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState<ThumbnailStyle>('professional');
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);

  const handleGenerate = async () => {
    if (!useCustomPrompt && !transcript) {
      setError('No transcript available. Please upload content first or use a custom prompt.');
      return;
    }

    setGenerating(true);
    setError(null);
    setImageUrl(null);
    setRevisedPrompt(null);

    try {
      const body = useCustomPrompt
        ? { customPrompt }
        : {
            transcript,
            title,
            brandColors,
            style,
          };

      const response = await fetch('/api/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to generate thumbnail');
        return;
      }

      setImageUrl(result.imageUrl);
      setRevisedPrompt(result.revisedPrompt);
      onThumbnailGenerated?.(result.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const styles: { value: ThumbnailStyle; label: string; description: string }[] = [
    { value: 'professional', label: 'Professional', description: 'Clean, corporate style' },
    { value: 'casual', label: 'Casual', description: 'Friendly and approachable' },
    { value: 'bold', label: 'Bold', description: 'Eye-catching and dynamic' },
    { value: 'minimal', label: 'Minimal', description: 'Simple and elegant' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Generate Thumbnail</h2>
      <p className="text-gray-600">
        Create an AI-generated thumbnail using DALL-E based on your content.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex gap-4">
        <button
          onClick={() => setUseCustomPrompt(false)}
          className={`px-4 py-2 rounded-lg ${
            !useCustomPrompt
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Auto-generate from Transcript
        </button>
        <button
          onClick={() => setUseCustomPrompt(true)}
          className={`px-4 py-2 rounded-lg ${
            useCustomPrompt
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Custom Prompt
        </button>
      </div>

      {useCustomPrompt ? (
        /* Custom Prompt Input */
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Custom DALL-E Prompt
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the thumbnail you want to generate..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={generating}
          />
        </div>
      ) : (
        /* Style Selection */
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Thumbnail Style
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {styles.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  style === s.value
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">{s.label}</p>
                <p className="text-xs text-gray-500">{s.description}</p>
              </button>
            ))}
          </div>

          {/* Brand Colors Preview */}
          {brandColors && (brandColors.primary || brandColors.secondary) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Using brand colors:</span>
              {brandColors.primary && (
                <div
                  className="w-5 h-5 rounded border border-gray-300"
                  style={{ backgroundColor: brandColors.primary }}
                  title={brandColors.primary}
                />
              )}
              {brandColors.secondary && (
                <div
                  className="w-5 h-5 rounded border border-gray-300"
                  style={{ backgroundColor: brandColors.secondary }}
                  title={brandColors.secondary}
                />
              )}
            </div>
          )}

          {/* Transcript Preview */}
          {transcript && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 line-clamp-3">{transcript.slice(0, 300)}...</p>
            </div>
          )}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating || (useCustomPrompt ? !customPrompt.trim() : !transcript)}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Generating with DALL-E...
          </>
        ) : (
          <>
            <span>🎨</span>
            Generate Thumbnail
          </>
        )}
      </button>

      {/* Generated Image */}
      {imageUrl && (
        <div className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-lg">
            <img
              src={imageUrl}
              alt="Generated thumbnail"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex gap-3">
            <a
              href={imageUrl}
              download="thumbnail.png"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center"
            >
              Download Thumbnail
            </a>
            <button
              onClick={handleGenerate}
              className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Regenerate
            </button>
          </div>

          {revisedPrompt && (
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                View DALL-E revised prompt
              </summary>
              <p className="mt-2 text-gray-500 bg-gray-50 p-3 rounded">{revisedPrompt}</p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
