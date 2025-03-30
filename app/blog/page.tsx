import React from 'react';
import { getBlogPosts } from '@/lib/actions';
import { BlogPost } from '@/types/api';
import Link from 'next/link';
import { Metadata } from 'next';
import { BlogPostCard } from '@/components/BlogSection';

export const metadata: Metadata = {
  title: 'Blog | Berkay Baygut',
  description: 'Articles and thoughts on software development, technology, and more.',
};

export default async function BlogIndexPage() {
  const posts = await getBlogPosts()
    .then((data) =>
      Array.isArray(data) &&
      data.every((item) => 'title' in item && 'excerpt' in item && 'slug' in item)
        ? (data as BlogPost[])
        : []
    )
    .catch(() => []);

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[var(--color-blue)]">Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Thoughts, learnings, and insights about software development, technology, and more.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-500">No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8 mt-8 border-t">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="text-[var(--color-blue)] font-bold text-2xl hover:text-[var(--color-red)] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
