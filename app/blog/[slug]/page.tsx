import React from 'react';
import { getBlogPostBySlug } from '@/lib/actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import BlogContentRenderer from '@/components/BlogContentRenderer';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | Berkay Baygut',
      description: 'The requested blog post could not be found.',
    };
  }

  return {
    title: `${post.title} | Berkay Baygut's Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params; // Await the params to extract slug
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-screen bg-white">
      <article className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link
              href="/blog"
              className="text-[var(--color-red)] font-bold text-2xl hover:text-[var(--color-blue)] transition-colors"
            >
              ← Back to Blog
            </Link>
          </div>

          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center text-gray-600 mb-6">
              <time dateTime={new Date(post.published_at).toISOString()}>{formattedDate}</time>
              {post.updated_at && post.updated_at !== post.published_at && (
                <span className="ml-4 text-sm italic">
                  (Updated:{' '}
                  {new Date(post.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  )
                </span>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-sm bg-gray-200 px-3 py-1 rounded-full text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xl text-gray-700 font-light italic border-l-4 border-gray-300 pl-4">
              {post.excerpt}
            </p>
          </header>

          <div className="prose prose-lg max-w-none">
            <BlogContentRenderer content={post.content} />
          </div>
        </div>
      </article>

      <div className="container mx-auto px-4 py-8 mt-8 border-t">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link
            href="/blog"
            className="text-[var(--color-red)] font-bold text-2xl hover:text-[var(--color-blue)] transition-colors"
          >
            ← Back to Blog
          </Link>
          <Link
            href="/"
            className="text-[var(--color-red)] font-bold text-2xl hover:text-[var(--color-blue)] transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
