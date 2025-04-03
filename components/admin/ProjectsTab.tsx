'use client';

import {
  addProject,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getProjects,
  updateProject,
  deleteProject,
} from '@/lib/actions';
import { useState, useEffect, useRef } from 'react';
import ImageUpload, { ImageUploadRefType } from '@/components/ImageUpload';
import { Pen, Trash, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Category } from '@/types/project';

type Project = {
  id: string;
  title: string;
  description: string;
  color: string;
  category: {
    id: number;
    name: string;
  };
  tags: string[];
  githubUrl?: string;
  demoUrl?: string;
  coverImage?: string;
  images: { url: string; id?: string }[];
  createdAt: string;
};

export default function ProjectsTab() {
  // Projects management states
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectImages, setCurrentProjectImages] = useState<{ url: string; id?: string }[]>(
    []
  );
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [coverImage, setCoverImage] = useState<{ data: ArrayBuffer; type: string } | null>(null);
  const [hasCoverImage, setHasCoverImage] = useState(false);

  // States for project form
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    color: 'blue',
    categoryId: 0,
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryMode, setCategoryMode] = useState<'view' | 'add' | 'edit'>('view');
  const [categoryForm, setCategoryForm] = useState({ name: '', displayOrder: 0 });
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null);
  const [categoryResult, setCategoryResult] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // New states for search and multi-selection
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  categories.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  // Add refs for the image uploads
  const coverImageUploadRef = useRef<ImageUploadRefType>(null);
  const galleryImagesUploadRef = useRef<ImageUploadRefType>(null);

  // Fetch projects and categories on component mount
  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  // Fetch existing projects
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const fetchedProjects = await getProjects();
      if (fetchedProjects && Array.isArray(fetchedProjects)) {
        setProjects(
          fetchedProjects.map((project) => ({
            id: String(project.id) || '',
            title: project.title || '',
            description: project.description || '',
            color: project.color || '',
            category: project.category || { id: 0, name: 'misc' },
            tags: project.tags || [],
            githubUrl: project.githubUrl || undefined,
            demoUrl: project.demoUrl || undefined,
            coverImage: project.coverImage || undefined,
            images: Array.isArray(project.images)
              ? project.images.map((url: string) => ({ url }))
              : [],
            createdAt: `${project.id}` || '',
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch existing categories
  const fetchCategories = async () => {
    try {
      const fetchedCategories = await getCategories();
      if (fetchedCategories && fetchedCategories.length > 0) {
        setCategories(
          fetchedCategories.map((category: Record<string, any>) => ({
            id: category.id,
            name: category.name,
            display_order: category.display_order || 0,
          }))
        );

        // Set default category for new projects if none is selected
        if (projectForm.categoryId === 0 && fetchedCategories.length > 0) {
          setProjectForm((prev) => ({ ...prev, categoryId: fetchedCategories[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // Category management functions
  const handleAddCategory = () => {
    setCategoryMode('add');
    // Set a default display order that's after the last category
    const maxOrder =
      categories.length > 0 ? Math.max(...categories.map((c) => c.display_order || 0)) + 10 : 10;
    setCategoryForm({ name: '', displayOrder: maxOrder });
    setCurrentCategoryId(null);
    setCategoryResult(null);
  };

  const handleEditCategory = (category: Category) => {
    setCategoryMode('edit');
    setCategoryForm({
      name: category.name,
      displayOrder: category.display_order || 0,
    });
    setCurrentCategoryId(category.id);
    setCategoryResult(null);
  };

  const handleCancelCategoryEdit = () => {
    setCategoryMode('view');
    setCategoryForm({ name: '', displayOrder: 0 });
    setCurrentCategoryId(null);
    setCategoryResult(null);
  };

  const handleCategoryInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'displayOrder') {
      setCategoryForm((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setCategoryForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryLoading(true);

    try {
      if (categoryMode === 'add') {
        const result = await addCategory({
          name: categoryForm.name,
          displayOrder: categoryForm.displayOrder,
        });

        setCategoryResult(result);

        if (result.success) {
          // Reset form
          setCategoryForm({ name: '', displayOrder: categories.length });
          setCategoryMode('view');

          // Refresh categories
          await fetchCategories();
        }
      } else if (categoryMode === 'edit' && currentCategoryId) {
        const result = await updateCategory(currentCategoryId, {
          name: categoryForm.name,
          displayOrder: categoryForm.displayOrder,
        });

        setCategoryResult(result);

        if (result.success) {
          // Reset form
          setCategoryForm({ name: '', displayOrder: 0 });
          setCurrentCategoryId(null);
          setCategoryMode('view');

          // Refresh categories
          await fetchCategories();
        }
      }
    } catch (error) {
      setCategoryResult({ success: false, error: 'An unexpected error occurred' });
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? This cannot be undone.')) return;

    try {
      const result = await deleteCategory(id);

      if (result.success) {
        // Refresh categories
        await fetchCategories();
      } else {
        alert(result.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  const handleMoveCategoryUp = async (category: Category, index: number) => {
    if (index === 0) return;

    try {
      // Get current sorted categories
      const sortedCategories = [...categories].sort((a, b) => {
        if (a.display_order !== undefined && b.display_order !== undefined) {
          return a.display_order - b.display_order;
        }
        return a.name.localeCompare(b.name);
      });

      // Find current and previous categories
      const currentCategory = sortedCategories[index];
      const previousCategory = sortedCategories[index - 1];

      // Calculate new order between the previous category and the one before it (if exists)
      let newOrder;
      if (index > 1) {
        const beforePrevious = sortedCategories[index - 2];
        newOrder =
          Math.floor((beforePrevious.display_order || 0) + (previousCategory.display_order || 0)) /
          2;
      } else {
        // If it's moving to first position
        newOrder = (previousCategory.display_order || 0) - 10;
      }

      await updateCategory(category.id, { displayOrder: newOrder });
      await fetchCategories();
    } catch (error) {
      console.error('Failed to reorder category:', error);
    }
  };

  const handleMoveCategoryDown = async (category: Category, index: number) => {
    if (index === categories.length - 1) return;

    try {
      // Get current sorted categories
      const sortedCategories = [...categories].sort((a, b) => {
        if (a.display_order !== undefined && b.display_order !== undefined) {
          return a.display_order - b.display_order;
        }
        return a.name.localeCompare(b.name);
      });

      // Find current and next categories
      const currentCategory = sortedCategories[index];
      const nextCategory = sortedCategories[index + 1];

      // Calculate new order between the next category and the one after it (if exists)
      let newOrder;
      if (index < sortedCategories.length - 2) {
        const afterNext = sortedCategories[index + 2];
        newOrder =
          Math.floor((nextCategory.display_order || 0) + (afterNext.display_order || 0)) / 2;
      } else {
        // If it's moving to last position
        newOrder = (nextCategory.display_order || 0) + 10;
      }

      await updateCategory(category.id, { displayOrder: newOrder });
      await fetchCategories();
    } catch (error) {
      console.error('Failed to reorder category:', error);
    }
  };

  // Populate form with project data for editing
  const handleEditProject = (project: Project) => {
    setCurrentProjectId(project.id);
    setCurrentProjectImages(
      project.images.map((img) => {
        // Extract the ID from the URL if it exists
        const id = img.url.split('/').pop();
        return {
          url: img.url,
          id,
        };
      })
    );
    setRemovedImageIds([]); // Reset removed image IDs when starting a new edit
    setProjectForm({
      title: project.title,
      description: project.description,
      color: project.color,
      categoryId: project.category.id,
      tags: project.tags.join(', '),
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || '',
    });
    setMode('edit');

    // Check if project has a cover image
    setHasCoverImage(!!project.coverImage);
    setCoverImage(null);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset form and switch to add mode
  const handleCancelEdit = () => {
    setCurrentProjectId(null);
    setCurrentProjectImages([]);
    setRemovedImageIds([]);
    setProjectForm({
      title: '',
      description: '',
      color: 'blue',
      categoryId: categories.length > 0 ? categories[0].id : 0,
      tags: '',
      githubUrl: '',
      demoUrl: '',
    });
    setProjectImages([]);
    setCoverImage(null);
    setHasCoverImage(false);
    setMode('add');

    // Reset the image upload components
    if (coverImageUploadRef.current) coverImageUploadRef.current.reset();
    if (galleryImagesUploadRef.current) galleryImagesUploadRef.current.reset();
  };

  // Handle project deletion
  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    setIsLoading(true);
    try {
      await deleteProject(Number(id));
      // Refresh projects list
      fetchProjects();
      // If deleting the project that's currently being edited, reset the form
      if (id === currentProjectId) {
        handleCancelEdit();
      }
      if (selectedProjects.includes(id)) {
        setSelectedProjects((prev) => prev.filter((projectId) => projectId !== id));
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes for project form fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'categoryId') {
      setProjectForm((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setProjectForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle removing an image from the current project
  const handleRemoveImage = (index: number, imageId?: string) => {
    // If the image has an ID, add it to the removedImageIds array
    if (imageId) {
      setRemovedImageIds((prev) => [...prev, parseInt(imageId, 10)]);
    }

    // Remove the image from the currentProjectImages array
    setCurrentProjectImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle updating cover image in edit mode
  const handleRemoveCoverImage = () => {
    setHasCoverImage(false);
    setCoverImage(null);
  };

  // Handle cover image change - simplified
  const handleCoverImageChange = (images: { data: ArrayBuffer; type: string }[]) => {
    if (images.length > 0) {
      setCoverImage(images[0]);
      setHasCoverImage(true);
    } else {
      setCoverImage(null);
    }
  };

  // Add separate handlers for the different image uploads
  const handleGalleryImagesChange = (images: { data: ArrayBuffer; type: string }[]) => {
    setProjectImages(images);
  };

  // Handle project form submission
  async function handleProjectSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate category is selected
    if (!projectForm.categoryId) {
      alert('Please select a category.');
      return;
    }

    setProjectLoading(true);

    try {
      // Convert tags string to array
      const tagsArray = projectForm.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      if (mode === 'edit' && currentProjectId) {
        // Simplified update logic
        const updateData = {
          title: projectForm.title,
          description: projectForm.description,
          color: projectForm.color,
          categoryId: projectForm.categoryId,
          tags: tagsArray,
          githubUrl: projectForm.githubUrl || undefined,
          demoUrl: projectForm.demoUrl || undefined,
          newImages: projectImages.length > 0 ? projectImages : undefined,
          removedImageIds: removedImageIds.length > 0 ? removedImageIds : undefined,
          // Only include coverImage if it has changed (new image added or explicitly removed)
          coverImage: hasCoverImage === false ? null : coverImage || undefined,
        };

        const result = await updateProject(parseInt(currentProjectId!, 10), updateData);

        setProjectResult(result);

        if (result.success) {
          // Reset form and switch back to add mode
          handleCancelEdit();

          // Reset the image upload components
          if (coverImageUploadRef.current) coverImageUploadRef.current.reset();
          if (galleryImagesUploadRef.current) galleryImagesUploadRef.current.reset();

          // Refresh projects list
          await fetchProjects();
        }
      } else {
        // Add new project
        const result = await addProject({
          title: projectForm.title,
          description: projectForm.description,
          color: projectForm.color,
          categoryId: projectForm.categoryId,
          tags: tagsArray,
          images: projectImages,
          githubUrl: projectForm.githubUrl || undefined,
          demoUrl: projectForm.demoUrl || undefined,
          coverImage: coverImage || undefined, // Add cover image for new project
        });

        setProjectResult(result);

        if (result.success) {
          // Reset form
          setProjectForm({
            title: '',
            description: '',
            color: 'blue',
            categoryId: categories.length > 0 ? categories[0].id : 0,
            tags: '',
            githubUrl: '',
            demoUrl: '',
          });
          setProjectImages([]);
          setCoverImage(null);
          setHasCoverImage(false);

          // Reset the image upload components
          if (coverImageUploadRef.current) coverImageUploadRef.current.reset();
          if (galleryImagesUploadRef.current) galleryImagesUploadRef.current.reset();

          // Refresh projects list
          fetchProjects();
        }
      }
    } catch (error) {
      setProjectResult({ success: false, error: 'An unexpected error occurred' });
    } finally {
      setProjectLoading(false);
    }
  }

  // Filter projects based on search term
  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle project selection with checkbox
  const handleProjectSelection = (id: string) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((projectId) => projectId !== id) : [...prev, id]
    );
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedProjects.length === filteredProjects.length) {
      // If all visible projects are selected, deselect all
      setSelectedProjects([]);
    } else {
      // Otherwise select all visible projects
      setSelectedProjects(filteredProjects.map((project) => project.id));
    }
  };

  // Handle multiple deletion
  const handleDeleteSelected = async () => {
    if (selectedProjects.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedProjects.length} selected projects?`))
      return;

    setDeleteLoading(true);
    try {
      // Process deletions one by one
      const results = await Promise.all(selectedProjects.map((id) => deleteProject(Number(id))));

      // Check if all deletions were successful
      const allSuccess = results.every((result) => result.success);

      if (allSuccess) {
        // Refresh projects list
        await fetchProjects();
        // If deleting project that's being edited, reset the form
        if (selectedProjects.includes(currentProjectId || '')) {
          handleCancelEdit();
        }
        setProjectResult({ success: true });
        // Clear selection
        setSelectedProjects([]);
      } else {
        setProjectResult({
          success: false,
          error: 'Failed to delete one or more projects',
        });
      }
    } catch (error) {
      console.error('Failed to delete projects:', error);
      setProjectResult({ success: false, error: 'An unexpected error occurred' });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">
        {mode === 'add' ? 'Add New Project' : 'Edit Project'}
      </h2>

      {/* Category Manager Toggle */}
      <button
        onClick={() => setShowCategoryManager(!showCategoryManager)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {showCategoryManager ? 'Hide Category Manager' : 'Manage Categories'}
      </button>

      {/* Category Manager */}
      {showCategoryManager && (
        <div className="mb-8 p-4 border border-gray-300/30 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Category Manager</h3>

          {categoryMode !== 'view' && (
            <form onSubmit={handleCategorySubmit} className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="categoryName">
                  Category Name
                </label>
                <input
                  type="text"
                  id="categoryName"
                  name="name"
                  placeholder="e.g., web, mobile, data science"
                  value={categoryForm.name}
                  onChange={handleCategoryInputChange}
                  className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="displayOrder">
                  Display Order
                </label>
                <input
                  type="number"
                  id="displayOrder"
                  name="displayOrder"
                  min="0"
                  value={categoryForm.displayOrder}
                  onChange={handleCategoryInputChange}
                  className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Lower numbers are displayed first</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={categoryLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {categoryLoading
                    ? categoryMode === 'add'
                      ? 'Adding...'
                      : 'Updating...'
                    : categoryMode === 'add'
                    ? 'Add Category'
                    : 'Update Category'}
                </button>

                <button
                  type="button"
                  onClick={handleCancelCategoryEdit}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {categoryMode === 'view' && (
            <button
              onClick={handleAddCategory}
              className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add New Category
            </button>
          )}

          {categoryResult && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                categoryResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {categoryResult.success
                ? 'Category operation completed successfully!'
                : `Error: ${categoryResult.error}`}
            </div>
          )}

          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">Existing Categories</h4>
            {categories.length === 0 ? (
              <p>No categories found.</p>
            ) : (
              <ul className="space-y-2">
                {[...categories]
                  .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                  .map((category, index) => (
                    <li
                      key={category.id}
                      className="flex items-center justify-between p-3 bg-white/5 border border-gray-300/30 rounded-md"
                    >
                      <div className="flex items-center">
                        <span className="mr-2 text-gray-400">#{index + 1}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-1 text-blue-500 hover:text-blue-700"
                          title="Edit category"
                        >
                          <Pen size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Delete category"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleProjectSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Project Title"
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
            placeholder="Project Description"
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
            <label className="block text-sm font-medium mb-1" htmlFor="categoryId">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={projectForm.categoryId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                </option>
              ))}
            </select>
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
          <label className="block text-sm font-medium mb-1">Cover Image</label>

          {/* Show existing cover image */}
          {mode === 'edit' && hasCoverImage && !coverImage && (
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <img
                  src={`/api/cover-image/${currentProjectId}?t=${Date.now()}`}
                  alt="Current cover image"
                  className="h-20 w-auto rounded object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveCoverImage}
                  className="p-1 bg-red-500 text-white rounded-full"
                  title="Remove cover image"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Show cover image upload component */}
          <ImageUpload
            ref={coverImageUploadRef}
            onImagesChange={handleCoverImageChange}
            required={false}
            maxWidth={800}
            maxHeight={800}
            quality={0.9}
            preserveQuality={true}
            label="Upload Cover Image"
            singleImage={true}
            inputId="cover-image-upload"
          />
          <p className="text-xs text-gray-400 mt-1">
            Cover image will be shown in project listings and when no gallery images are present
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Project Images</label>
          {mode === 'edit' && currentProjectImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm mb-2">Current Images:</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {currentProjectImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Current image ${index + 1}`}
                      className="h-20 w-auto rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, image.id)}
                      className="absolute inset-0 bg-red-500 bg-opacity-50 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      title="Remove image"
                    >
                      <X size={16} className="opacity-100" strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {mode === 'edit'
                  ? 'Upload new images to add more, or click the X to remove existing ones'
                  : ''}
              </p>
            </div>
          )}
          <ImageUpload
            ref={galleryImagesUploadRef}
            onImagesChange={handleGalleryImagesChange}
            required={mode === 'add' && !coverImage}
            maxWidth={1200}
            maxHeight={1200}
            quality={0.9}
            preserveQuality={true}
            label="Upload Gallery Images"
            inputId="gallery-images-upload" // Add a unique ID
          />
          <p className="text-xs text-gray-400 mt-1">
            These images will appear in the project gallery
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={projectLoading || (mode === 'add' && projectImages.length === 0)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {projectLoading
              ? mode === 'add'
                ? 'Adding Project...'
                : 'Updating Project...'
              : mode === 'add'
              ? 'Add Project'
              : 'Update Project'}
          </button>

          {mode === 'edit' && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {projectResult && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            projectResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {projectResult.success
            ? 'Project operation completed successfully!'
            : `Error: ${projectResult.error}`}
        </div>
      )}

      <div className="flex justify-between items-center mb-4 mt-12">
        <h2 className="text-2xl font-bold">Existing Projects</h2>

        {projects.length > 0 && selectedProjects.length > 0 && (
          <button
            onClick={handleDeleteSelected}
            disabled={deleteLoading}
            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
          >
            {deleteLoading ? 'Deleting...' : `Delete Selected (${selectedProjects.length})`}
          </button>
        )}
      </div>

      {/* Search input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="w-full px-3 py-2 pl-10 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {filteredProjects.length > 0 && (
        <div className="mb-2 flex items-center">
          <input
            type="checkbox"
            id="selectAll"
            checked={
              filteredProjects.length > 0 && selectedProjects.length === filteredProjects.length
            }
            onChange={handleSelectAll}
            className="mr-2"
          />
          <label htmlFor="selectAll" className="text-sm">
            Select All
          </label>
        </div>
      )}

      {/* Projects listing section */}
      <div>
        {isLoading ? (
          <p className="text-center py-4">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-center py-4">No projects found.</p>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 border border-gray-300/30 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => handleProjectSelection(project.id)}
                        className="me-1.5"
                      />
                      {project.title}
                    </h3>
                    <p className="text-sm text-black font-extralight mt-1">
                      {project.description.substring(0, 100)}...
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-yellow-400 text-xs rounded-full">
                        {project.category.name}
                      </span>
                      {project.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-yellow-400 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-1 bg-yellow-400 text-xs rounded-full">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Pen />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      <Trash />
                    </button>
                  </div>
                </div>
                {project.images.length > 0 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                    {project.images.slice(0, 3).map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={`${project.title} image ${index + 1}`}
                        className="h-16 w-auto rounded object-cover"
                      />
                    ))}
                    {project.images.length > 3 && (
                      <div className="h-16 w-16 bg-gray-700 rounded flex items-center justify-center">
                        +{project.images.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
