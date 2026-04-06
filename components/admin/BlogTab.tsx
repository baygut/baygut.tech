'use client';

import { useState, useEffect } from 'react';
import { addBlogPost, deleteBlogPost, getAdminBlogPosts, updateBlogPost } from '@/lib/actions';
import { BlogPost } from '@/types/api';

function isBlogPostRow(item: unknown): item is BlogPost {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'title' in item &&
    'slug' in item &&
    'excerpt' in item &&
    'content' in item &&
    'published' in item
  );
}

export default function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    tags: '',
    published: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch blog posts when the component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getAdminBlogPosts();
        const validPosts = (Array.isArray(data) ? data.filter(isBlogPostRow) : []) as BlogPost[];
        setPosts(validPosts);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Reset the form when editingPost changes
  useEffect(() => {
    if (editingPost) {
      setFormData({
        title: editingPost.title,
        slug: editingPost.slug,
        excerpt: editingPost.excerpt,
        content: editingPost.content,
        tags: editingPost.tags?.join(', ') || '',
        published: editingPost.published,
      });
      setShowForm(true);
    } else {
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        tags: '',
        published: true,
      });
    }
  }, [editingPost]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const postData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        tags: tagsArray,
        published: formData.published,
      };

      let result;
      if (editingPost) {
        // Update existing post
        result = await updateBlogPost(editingPost.id, postData);
      } else {
        // Add new post
        result = await addBlogPost(postData);
      }

      if (result.success) {
        setSuccess(editingPost ? 'Post updated successfully!' : 'Post added successfully!');
        // Refresh the posts list
        const updatedPosts = await getAdminBlogPosts();
        const validPosts = (
          Array.isArray(updatedPosts) ? updatedPosts.filter(isBlogPostRow) : []
        ) as BlogPost[];
        setPosts(validPosts);

        // Clear form if adding new post
        if (!editingPost) {
          setFormData({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            tags: '',
            published: true,
          });
        }
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err) {
      console.error('Error saving blog post:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      try {
        const result = await deleteBlogPost(post.id);
        if (result.success) {
          // Remove the post from the list
          setPosts(posts.filter((p) => p.id !== post.id));
          setSuccess('Post deleted successfully!');
          // If we were editing this post, reset the form
          if (editingPost?.id === post.id) {
            setEditingPost(null);
            setShowForm(false);
          }
        } else {
          setError(result.error || 'Failed to delete post');
        }
      } catch (err) {
        console.error('Error deleting post:', err);
        setError('An unexpected error occurred');
      }
    }
  };

  const handleGenerateSlug = () => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove non-word chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim();

      setFormData({
        ...formData,
        slug,
      });
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Manage Blog Posts</h2>
        <button
          onClick={() => {
            setEditingPost(null);
            setShowForm(!showForm);
            setError('');
            setSuccess('');
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showForm && !editingPost ? 'Cancel' : 'Add New Post'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium">{editingPost ? 'Edit Post' : 'Add New Post'}</h3>

          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-grow">
              <label htmlFor="slug" className="block text-sm font-medium">
                URL Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleGenerateSlug}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Generate from Title
            </button>
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              required
              rows={2}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium">
              Content (Markdown)
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={12}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm font-mono"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="React, Next.js, TypeScript"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  published: e.target.checked,
                })
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm">
              Published
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingPost(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingPost ? 'Update Post' : 'Add Post'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6">
        <h3 className="text-xl font-medium mb-4">Blog Posts</h3>

        {loading ? (
          <p>Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500">No blog posts found. Create your first post!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Published
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      <div className="text-sm text-gray-500">{post.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.published_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingPost(post)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
