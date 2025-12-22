'use client';

import { useState, useCallback } from 'react';

interface UploadedFile {
  id: string;
  filename: string;
  originalName?: string;
  path: string;
  type: 'video' | 'audio' | 'transcript';
  size?: number;
}

interface UploadFormProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
}

export default function UploadForm({ onUploadComplete }: UploadFormProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [transcript, setTranscript] = useState('');
  const [dragOver, setDragOver] = useState<'video' | 'audio' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileDrop = useCallback(
    async (e: React.DragEvent, type: 'video' | 'audio') => {
      e.preventDefault();
      setDragOver(null);
      setError(null);

      const file = e.dataTransfer.files[0];
      if (!file) return;

      // Validate file type
      if (type === 'video' && !file.type.startsWith('video/')) {
        setError('Please drop a video file');
        return;
      }
      if (type === 'audio' && !file.type.startsWith('audio/')) {
        setError('Please drop an audio file');
        return;
      }

      await uploadFile(file, type);
    },
    []
  );

  const handleFileInput = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'video' | 'audio'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    await uploadFile(file, type);
  };

  const uploadFile = async (file: File, type: 'video' | 'audio') => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Upload failed');
        return;
      }

      const newFile: UploadedFile = {
        id: result.id,
        filename: result.filename,
        originalName: result.originalName,
        path: result.path,
        type: result.type,
        size: result.size,
      };

      setUploadedFiles((prev) => {
        const filtered = prev.filter((f) => f.type !== type);
        const updated = [...filtered, newFile];
        onUploadComplete?.(updated);
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleTranscriptSubmit = async () => {
    if (!transcript.trim()) {
      setError('Please enter transcript text');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('type', 'transcript');
      formData.append('transcript', transcript);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to save transcript');
        return;
      }

      const newFile: UploadedFile = {
        id: result.id,
        filename: result.filename,
        path: result.path,
        type: 'transcript',
      };

      setUploadedFiles((prev) => {
        const filtered = prev.filter((f) => f.type !== 'transcript');
        const updated = [...filtered, newFile];
        onUploadComplete?.(updated);
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save transcript');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getFileByType = (type: 'video' | 'audio' | 'transcript') =>
    uploadedFiles.find((f) => f.type === type);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Upload NotebookLM Content</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver === 'video'
              ? 'border-blue-500 bg-blue-50'
              : getFileByType('video')
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver('video');
          }}
          onDragLeave={() => setDragOver(null)}
          onDrop={(e) => handleFileDrop(e, 'video')}
        >
          <div className="text-4xl mb-2">🎬</div>
          <h3 className="font-semibold text-gray-900">Video File</h3>
          {getFileByType('video') ? (
            <div className="mt-2 text-sm text-green-700">
              <p className="font-medium">{getFileByType('video')?.originalName}</p>
              <p>{formatFileSize(getFileByType('video')?.size)}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              Drag & drop MP4, WebM, or{' '}
              <label className="text-blue-600 cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleFileInput(e, 'video')}
                  disabled={uploading}
                />
              </label>
            </p>
          )}
        </div>

        {/* Audio Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver === 'audio'
              ? 'border-blue-500 bg-blue-50'
              : getFileByType('audio')
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver('audio');
          }}
          onDragLeave={() => setDragOver(null)}
          onDrop={(e) => handleFileDrop(e, 'audio')}
        >
          <div className="text-4xl mb-2">🎵</div>
          <h3 className="font-semibold text-gray-900">Audio File</h3>
          {getFileByType('audio') ? (
            <div className="mt-2 text-sm text-green-700">
              <p className="font-medium">{getFileByType('audio')?.originalName}</p>
              <p>{formatFileSize(getFileByType('audio')?.size)}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              Drag & drop MP3, WAV, or{' '}
              <label className="text-blue-600 cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => handleFileInput(e, 'audio')}
                  disabled={uploading}
                />
              </label>
            </p>
          )}
        </div>
      </div>

      {/* Transcript Input */}
      <div className="space-y-2">
        <label className="block font-semibold text-gray-900">
          Transcript from NotebookLM
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 min-h-[150px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Paste your transcript here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          disabled={uploading}
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {transcript.length} characters
          </span>
          <button
            onClick={handleTranscriptSubmit}
            disabled={uploading || !transcript.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Saving...' : 'Save Transcript'}
          </button>
        </div>
        {getFileByType('transcript') && (
          <p className="text-sm text-green-600">Transcript saved successfully</p>
        )}
      </div>

      {/* Upload Status */}
      {uploading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Uploading...</span>
        </div>
      )}

      {/* Summary */}
      {uploadedFiles.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Uploaded Files</h4>
          <ul className="space-y-1 text-sm">
            {uploadedFiles.map((file) => (
              <li key={file.id} className="flex items-center text-gray-700">
                <span className="mr-2">
                  {file.type === 'video' ? '🎬' : file.type === 'audio' ? '🎵' : '📝'}
                </span>
                {file.originalName || file.filename}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
