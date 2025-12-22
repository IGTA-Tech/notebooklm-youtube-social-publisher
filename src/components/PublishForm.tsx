'use client';

import { useState } from 'react';
import { Platform, PLATFORM_CONFIG } from '@/lib/blotato';

interface PublishFormProps {
  mediaUrls?: string[];
  thumbnailUrl?: string;
  defaultContent?: string;
}

export default function PublishForm({
  mediaUrls = [],
  thumbnailUrl,
  defaultContent = '',
}: PublishFormProps) {
  const [content, setContent] = useState(defaultContent);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');

  const platforms: Platform[] = [
    'twitter',
    'linkedin',
    'instagram',
    'tiktok',
    'facebook',
    'bluesky',
    'pinterest',
    'youtube',
    'threads',
  ];

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const getContentWarnings = () => {
    const warnings: string[] = [];
    for (const platform of selectedPlatforms) {
      const config = PLATFORM_CONFIG[platform];
      if (content.length > config.maxChars) {
        warnings.push(
          `${config.name}: ${content.length}/${config.maxChars} characters (exceeds limit)`
        );
      }
    }
    return warnings;
  };

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    if (!content.trim()) {
      setError('Please enter post content');
      return;
    }

    const warnings = getContentWarnings();
    if (warnings.length > 0) {
      setError(`Content too long for: ${warnings.join(', ')}`);
      return;
    }

    setPublishing(true);
    setError(null);
    setResult(null);

    try {
      const allMediaUrls = [...mediaUrls];
      if (thumbnailUrl) {
        allMediaUrls.push(thumbnailUrl);
      }

      const body: Record<string, unknown> = {
        platforms: selectedPlatforms,
        content,
        mediaUrls: allMediaUrls,
      };

      if (scheduledAt) {
        body.scheduledAt = new Date(scheduledAt).toISOString();
      }

      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Publishing failed');
        return;
      }

      setResult({
        success: true,
        message: data.message || `Published to ${selectedPlatforms.length} platform(s)`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publishing failed');
    } finally {
      setPublishing(false);
    }
  };

  const minCharLimit = selectedPlatforms.length > 0
    ? Math.min(...selectedPlatforms.map((p) => PLATFORM_CONFIG[p].maxChars))
    : 280;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Publish to Social Media</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {result && (
        <div
          className={`px-4 py-3 rounded ${
            result.success
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {result.message}
        </div>
      )}

      {/* Platform Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Select Platforms
        </label>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {platforms.map((platform) => {
            const config = PLATFORM_CONFIG[platform];
            const isSelected = selectedPlatforms.includes(platform);
            return (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-sm">{config.name}</p>
                <p className="text-xs text-gray-500">{config.maxChars} chars</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Post Content
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 min-h-[150px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Write your post content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={publishing}
        />
        <div className="flex justify-between text-sm">
          <span
            className={
              content.length > minCharLimit ? 'text-red-600' : 'text-gray-500'
            }
          >
            {content.length} / {minCharLimit} characters
            {selectedPlatforms.length > 0 &&
              ` (${selectedPlatforms
                .map((p) => PLATFORM_CONFIG[p].name)
                .join(', ')})`}
          </span>
        </div>

        {/* Content Warnings */}
        {getContentWarnings().length > 0 && (
          <div className="text-sm text-orange-600">
            {getContentWarnings().map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </div>
        )}
      </div>

      {/* Media Preview */}
      {(mediaUrls.length > 0 || thumbnailUrl) && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Attached Media
          </label>
          <div className="flex gap-3 flex-wrap">
            {thumbnailUrl && (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1">
                  Thumbnail
                </span>
              </div>
            )}
            {mediaUrls.map((url, i) => (
              <div
                key={i}
                className="w-24 h-24 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50"
              >
                <span className="text-2xl">📎</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Option */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Schedule (optional)
        </label>
        <input
          type="datetime-local"
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          disabled={publishing}
        />
      </div>

      {/* Publish Button */}
      <button
        onClick={handlePublish}
        disabled={
          publishing ||
          selectedPlatforms.length === 0 ||
          !content.trim() ||
          getContentWarnings().length > 0
        }
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {publishing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Publishing...
          </>
        ) : (
          <>
            <span>🚀</span>
            {scheduledAt ? 'Schedule Post' : 'Publish Now'}
          </>
        )}
      </button>
    </div>
  );
}
