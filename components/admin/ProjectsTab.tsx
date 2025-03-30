'use client';

import {
  addProject,
  getCategories,
  addCategory,
  getProjects,
  updateProject,
  deleteProject,
} from '@/lib/actions';
import { useState, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';
import { Pen, Trash } from 'lucide-react';

type Project = {
  id: string;
  title: string;
  description: string;
  color: string;
  category: string;
  tags: string[];
  githubUrl?: string;
  demoUrl?: string;
  images: { url: string }[];
  createdAt: string;
};

export default function ProjectsTab() {
  // Projects management states
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectImages, setCurrentProjectImages] = useState<{ url: string }[]>([]);

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

  // New states for search and multi-selection
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch existing projects
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const fetchedProjects = await getProjects();
      if (fetchedProjects) {
        setProjects(
          fetchedProjects.map((project: any) => ({
            id: project.id || '',
            title: project.title || '',
            description: project.description || '',
            color: project.color || '',
            category: project.category || '',
            tags: project.tags || [],
            githubUrl: project.githubUrl || undefined,
            demoUrl: project.demoUrl || undefined,
            images: project.images.map((url: string) => ({ url })) || [],
            createdAt: project.createdAt || '',
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Populate form with project data for editing
  const handleEditProject = (project: Project) => {
    setCurrentProjectId(project.id);
    setCurrentProjectImages(project.images);
    setProjectForm({
      title: project.title,
      description: project.description,
      color: project.color,
      category: project.category,
      tags: project.tags.join(', '),
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || '',
    });
    setMode('edit');
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset form and switch to add mode
  const handleCancelEdit = () => {
    setCurrentProjectId(null);
    setCurrentProjectImages([]);
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
    setMode('add');
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

      if (mode === 'edit' && currentProjectId) {
        // Update existing project
        const result = await updateProject(
          parseInt(currentProjectId!, 10), // Ensure currentProjectId is a number
          {
            title: projectForm.title,
            description: projectForm.description,
            color: projectForm.color,
            category: showCustomInput ? customCategory : projectForm.category,
            tags: tagsArray,
            newImages: projectImages.length > 0 ? projectImages : undefined, // Only update images if new ones are provided
            githubUrl: projectForm.githubUrl || undefined,
            demoUrl: projectForm.demoUrl || undefined,
          }
        );

        setProjectResult(result);

        if (result.success) {
          // Reset form and switch back to add mode
          handleCancelEdit();
          // Refresh projects list
          fetchProjects();
        }
      } else {
        // Add new project
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

          // Refresh projects list
          fetchProjects();

          // If a new category was added, refresh the categories list
          if (showCustomInput && !categories.includes(customCategory)) {
            const updatedCategories = await getCategories();
            setCategories(updatedCategories);
          }
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
      project.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      const allSuccess = results.every((result) => result);

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
          {mode === 'edit' && currentProjectImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm mb-2">Current Images:</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {currentProjectImages.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`Current image ${index + 1}`}
                    className="h-20 w-auto rounded object-cover"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {mode === 'edit' ? 'Upload new images to replace the current ones (optional)' : ''}
              </p>
            </div>
          )}
          <ImageUpload
            onImagesChange={setProjectImages}
            required={mode === 'add'}
            maxWidth={800}
            maxHeight={800}
            quality={0.7}
          />
          <p className="text-xs text-gray-400 mt-1">
            Recommended: Upload images smaller than 1MB each for best performance
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

      <div className="flex justify-between items-center mb-4">
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
      <div className="mt-12">
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
                        {project.category}
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
