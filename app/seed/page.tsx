'use client';

import { seedDatabase } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const router = useRouter();

  async function handleSeed(reset: boolean) {
    setLoading(true);
    try {
      const result = await seedDatabase(reset);
      setResult(result);
      if (result.success) {
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Database Seed Tool</h1>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => handleSeed(false)}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Seeding...' : 'Seed Database (Keep Existing)'}
        </button>

        <button
          onClick={() => handleSeed(true)}
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset & Seed Database'}
        </button>
      </div>

      {result && (
        <div
          className={`p-4 rounded-lg ${
            result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {result.success
            ? 'Database seeded successfully. Redirecting to homepage...'
            : `Error: ${result.error}`}
        </div>
      )}
    </div>
  );
}
