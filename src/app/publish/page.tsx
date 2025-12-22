'use client';

import Link from 'next/link';
import PublishForm from '@/components/PublishForm';

export default function PublishPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Publish Content</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <PublishForm />
        </div>
      </main>
    </div>
  );
}
