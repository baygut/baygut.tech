import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/types/api';

interface BlogSectionProps {
  posts: BlogPost[];
}

const BlogSection: React.FC<BlogSectionProps> = ({ posts }) => {
  return (
    <section className="py-16 bg-[var(--color-red)]" id="blog">
      <div className="px-8">
        <div>
          <div className="flex flex-row justify-between items-center">
            <h2 className="text-7xl font-bold mb-8 text-white">Blog.</h2>
            <div className="text-center transition-all hover:scale-125 justify-center items-center">
              <Link
                href="/blog"
                className="px-6 py-3 bg-[var(--color-blue)] text-white text-3xl font-bold"
              >
                All
              </Link>
            </div>
          </div>

          {posts.length === 0 ? (
            <p className="text-white font-extralight">NOT YET.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export const BlogPostCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-[var(--color-blue)] overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <Link href={`/blog/${post.slug}`}>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2 text-white">{post.title}</h3>
          <div className="mb-4">
            <span className="text-sm text-white">{formattedDate}</span>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-white px-2 py-1 rounded-full text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="text-white">{post.excerpt}</p>
          <div className="mt-4">
            <span className="text-white hover:underline">Read more →</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BlogSection;
