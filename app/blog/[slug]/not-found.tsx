import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h2 className="text-3xl md:text-5xl font-bold mb-6 text-center">Blog Post Not Found</h2>
      <p className="text-xl text-gray-600 mb-8 text-center max-w-md">
        Sorry, the blog post you&#39;re looking for doesn&#39;t exist or may have been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/blog"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center"
        >
          Back to Blog
        </Link>
        <Link
          href="/"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-center"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
