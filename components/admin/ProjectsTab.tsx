'use client';

import { addProject, getCategories, addCategory } from '@/lib/actions';
import { useState, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';

export default function ProjectsTab() {
  // States for project form
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    color: 'blue',
    category: 'web',
    tags: '',
    githubUrl: '',
    demoUrl: '',
  });
  const [projectResult, setProjectResult] = useState<{ success?: boolean; error?: string } | null>(
    null
  );
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectImages, setProjectImages] = useState<{ data: ArrayBuffer; type: string }[]>([]);

  // States for category management
  const [categories, setCategories] = useState<string[]>(['web', 'mobile', 'misc']);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Fetch existing categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        if (fetchedCategories && fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Handle category change in the form
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomInput(true);
      // Don't change the form value yet, wait for custom input
    } else {
      setShowCustomInput(false);
      setProjectForm((prev) => ({ ...prev, category: value }));
    }
  };

  // Handle custom category input change
  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCategory(e.target.value);
    setProjectForm((prev) => ({ ...prev, category: e.target.value }));
  };

  // Handle input changes for other form fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle project form submission
  async function handleProjectSubmit(e: React.FormEvent) {
    e.preventDefault();

    // If using custom category, check if it's not empty
    if (showCustomInput && !customCategory.trim()) {
      alert('Please enter a category name or select an existing one.');
      return;
    }

    setProjectLoading(true);

    try {
      // If using custom category, add it to categories first
      if (showCustomInput && !categories.includes(customCategory)) {
        await addCategory(customCategory);
      }

      // Convert tags string to array
      const tagsArray = projectForm.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      // Use the server action with updated fields
      const result = await addProject({
        title: projectForm.title,
        description: projectForm.description,
        color: projectForm.color,
        category: showCustomInput ? customCategory : projectForm.category,
        tags: tagsArray,
        images: projectImages,
        githubUrl: projectForm.githubUrl || undefined,
        demoUrl: projectForm.demoUrl || undefined,
      });

      setProjectResult(result);

      if (result.success) {
        // Reset form
        setProjectForm({
          title: '',
          description: '',
          color: 'blue',
          category: 'web',
          tags: '',
          githubUrl: '',
          demoUrl: '',
        });
        setProjectImages([]);
        setCustomCategory('');
        setShowCustomInput(false);

        // If a new category was added, refresh the categories list
        if (showCustomInput && !categories.includes(customCategory)) {
          const updatedCategories = await getCategories();
          setCategories(updatedCategories);
        }
      }
    } catch (error) {
      setProjectResult({ success: false, error: 'An unexpected error occurred' });
    } finally {
      setProjectLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl p-6 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Add New Project</h2>

      <form onSubmit={handleProjectSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={projectForm.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={projectForm.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="color">
              Color
            </label>
            <select
              id="color"
              name="color"
              value={projectForm.color}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="red">Red</option>
              <option value="yellow">Yellow</option>
              <option value="purple">Purple</option>
              <option value="pink">Pink</option>
              <option value="indigo">Indigo</option>
              <option value="orange">Orange</option>
              <option value="teal">Teal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="category">
              Category
            </label>
            <div className="relative">
              <select
                id="category"
                name="category"
                value={showCustomInput ? 'custom' : projectForm.category}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
                <option value="custom">Add Custom Category...</option>
              </select>
            </div>

            {showCustomInput && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customCategory}
                  onChange={handleCustomCategoryChange}
                  placeholder="Enter new category name"
                  className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="tags">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={projectForm.tags}
            onChange={handleInputChange}
            placeholder="React, TypeScript, TailwindCSS"
            className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="githubUrl">
              GitHub URL
            </label>
            <input
              type="url"
              id="githubUrl"
              name="githubUrl"
              value={projectForm.githubUrl}
              onChange={handleInputChange}
              placeholder="https://github.com/username/repo"
              className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="demoUrl">
              Demo URL
            </label>
            <input
              type="url"
              id="demoUrl"
              name="demoUrl"
              value={projectForm.demoUrl}
              onChange={handleInputChange}
              placeholder="https://example-project.com"
              className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Images</label>
          <ImageUpload
            onImagesChange={setProjectImages}
            required
            maxWidth={800}
            maxHeight={800}
            quality={0.7}
          />
          <p className="text-xs text-gray-400 mt-1">
            Recommended: Upload images smaller than 1MB each for best performance
          </p>
        </div>

        <button
          type="submit"
          disabled={projectLoading || projectImages.length === 0}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {projectLoading ? 'Adding Project...' : 'Add Project'}
        </button>
      </form>

      {projectResult && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            projectResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {projectResult.success ? 'Project added successfully!' : `Error: ${projectResult.error}`}
        </div>
      )}
    </div>
  );
}
