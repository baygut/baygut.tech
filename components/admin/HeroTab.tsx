'use client';

import { getHeroContent, updateHeroContent } from '@/lib/actions';
import { useState, useEffect } from 'react';

export default function HeroTab() {
  const [heroContent, setHeroContent] = useState({
    name: '',
    title: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  // Fetch existing hero content on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const content = await getHeroContent();
        setHeroContent(content);
      } catch (error) {
        console.error('Failed to load hero content:', error);
      }
    };

    fetchData();
  }, []);

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const updateResult = await updateHeroContent(heroContent);
      setResult(updateResult);
    } catch (error) {
      console.error('Failed to update hero content:', error);
      setResult({
        success: false,
        error: 'Failed to update hero content. Please try again or check the console for details.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Hero Section Content</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={heroContent.name}
              onChange={(e) => setHeroContent({ ...heroContent, name: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title / Subtitle
            </label>
            <input
              id="title"
              type="text"
              value={heroContent.title}
              onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your title (e.g., Software Developer)"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Hero Content'}
          </button>

          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {result.success ? 'Hero content updated successfully!' : `Error: ${result.error}`}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
