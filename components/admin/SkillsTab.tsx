'use client';

import { addSkill, deleteSkill, getSkills, updateSkill } from '@/lib/actions';
import { useEffect, useState } from 'react';

type Skill = {
  id: string;
  word: string;
  desc: string;
};

export default function SkillsTab() {
  // States for skills management
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [skillForm, setSkillForm] = useState({ word: '', description: '' });
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillResult, setSkillResult] = useState<{ success?: boolean; error?: string } | null>(
    null
  );
  // New states for edit mode
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [currentSkillId, setCurrentSkillId] = useState<string | null>(null);
  // New state for multiple selection
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // New states for multi-add feature
  const [showMultiAdd, setShowMultiAdd] = useState(false);
  const [multiAddInput, setMultiAddInput] = useState('');
  const [multiAddError, setMultiAddError] = useState('');
  const [multiAddLoading, setMultiAddLoading] = useState(false);

  // New state for search functionality
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch existing skills on component mount
  useEffect(() => {
    fetchSkills();
  }, []);

  // Function to fetch skills
  const fetchSkills = async () => {
    try {
      const fetchedSkills = await getSkills();
      if (fetchedSkills && fetchedSkills.length > 0) {
        setSkillsList(
          fetchedSkills.map((skill: Record<string, any>) => ({
            id: skill.id,
            word: skill.word,
            desc: skill.desc,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  };

  // Handle skill form input changes
  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSkillForm((prev) => ({ ...prev, [name]: value }));
  };

  // New function to handle edit button click
  const handleEditSkill = (skill: Skill) => {
    setCurrentSkillId(skill.id);
    setSkillForm({
      word: skill.word,
      description: skill.desc,
    });
    setMode('edit');
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle checkbox selection
  const handleSkillSelection = (id: string) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((skillId) => skillId !== id) : [...prev, id]
    );
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    // Filter visible skills based on search term
    const filteredSkills = skillsList.filter(
      (skill) =>
        skill.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedSkills.length === filteredSkills.length) {
      // If all visible skills are selected, deselect all
      setSelectedSkills([]);
    } else {
      // Otherwise select all visible skills
      setSelectedSkills(filteredSkills.map((skill) => skill.id));
    }
  };

  // New function to handle multiple delete
  const handleDeleteSelected = async () => {
    if (selectedSkills.length === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedSkills.length} selected skills?`))
      return;

    setDeleteLoading(true);
    try {
      // Process deletions one by one
      const results = await Promise.all(selectedSkills.map((id) => deleteSkill(Number(id))));

      // Check if all deletions were successful
      const allSuccess = results.every((result) => result.success);

      if (allSuccess) {
        // Refresh skills list
        await fetchSkills();
        // If deleting skill that's being edited, reset the form
        if (selectedSkills.includes(currentSkillId || '')) {
          handleCancelEdit();
        }
        setSkillResult({ success: true });
        // Clear selection
        setSelectedSkills([]);
      } else {
        setSkillResult({
          success: false,
          error: 'Failed to delete one or more skills',
        });
      }
    } catch (error) {
      console.error('Failed to delete skills:', error);
      setSkillResult({ success: false, error: 'An unexpected error occurred' });
    } finally {
      setDeleteLoading(false);
    }
  };

  // New function to handle delete button click
  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    setSkillsLoading(true);
    try {
      const result = await deleteSkill(Number(id));

      if (result.success) {
        // Refresh skills list
        await fetchSkills();
        // If deleting skill that's being edited, reset the form
        if (id === currentSkillId) {
          handleCancelEdit();
        }
        setSkillResult({ success: true });
        // Remove from selected if it was selected
        if (selectedSkills.includes(id)) {
          setSelectedSkills((prev) => prev.filter((skillId) => skillId !== id));
        }
      } else {
        setSkillResult({ success: false, error: result.error || 'Failed to delete skill' });
      }
    } catch (error) {
      console.error('Failed to delete skill:', error);
      setSkillResult({ success: false, error: 'An unexpected error occurred' });
    } finally {
      setSkillsLoading(false);
    }
  };

  // New function to cancel editing
  const handleCancelEdit = () => {
    setCurrentSkillId(null);
    setSkillForm({ word: '', description: '' });
    setMode('add');
  };

  // New function to handle multi-add submission
  const handleMultiAddSubmit = async () => {
    setMultiAddError('');
    setMultiAddLoading(true);

    try {
      // Parse the input text as JSON
      let skillsData;

      // Handle both array syntax and const declaration syntax
      let inputText = multiAddInput.trim();

      // Remove variable declaration if present
      if (
        inputText.startsWith('const') ||
        inputText.startsWith('let') ||
        inputText.startsWith('var')
      ) {
        inputText = inputText.replace(/^(?:const|let|var)\s+\w+\s*=\s*/, '');
      }

      // Remove semicolon at the end if present
      if (inputText.endsWith(';')) {
        inputText = inputText.slice(0, -1);
      }

      try {
        skillsData = JSON.parse(inputText);
      } catch (e) {
        // If direct JSON parsing fails, try to extract the array part
        const arrayMatch = inputText.match(/\[([\s\S]*)\]/);
        if (arrayMatch) {
          try {
            skillsData = JSON.parse(`[${arrayMatch[1]}]`);
          } catch (e2) {
            throw new Error(`Failed to parse JSON: ${e2}`);
          }
        } else {
          throw new Error('Could not parse the input');
        }
      }

      if (!Array.isArray(skillsData)) {
        throw new Error('Input must be an array of skill objects');
      }

      // Validate the array items have the correct structure
      for (const item of skillsData) {
        if (!item.word || !item.desc) {
          throw new Error('Each skill must have "word" and "desc" properties');
        }
      }

      // Add all skills one by one
      const addPromises = skillsData.map((skill) =>
        addSkill({
          word: skill.word,
          description: skill.desc,
        })
      );

      const results = await Promise.all(addPromises);

      // Check if all additions were successful
      const allSuccess = results.every((result) => result.success);

      if (allSuccess) {
        // Refresh skills list
        await fetchSkills();
        setMultiAddInput('');
        setShowMultiAdd(false);
        setSkillResult({ success: true, error: `Successfully added ${skillsData.length} skills` });
      } else {
        // Some additions failed
        const failedCount = results.filter((result) => !result.success).length;
        setSkillResult({
          success: false,
          error: `Failed to add ${failedCount} out of ${skillsData.length} skills`,
        });
      }
    } catch (error: any) {
      console.error('Failed to add skills:', error);
      setMultiAddError(error.message || 'Failed to parse input or add skills');
    } finally {
      setMultiAddLoading(false);
    }
  };

  // Handle skill form submission
  async function handleSkillSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!skillForm.word.trim() || !skillForm.description.trim()) {
      setSkillResult({ success: false, error: 'Skill name and description are required' });
      return;
    }

    setSkillsLoading(true);

    try {
      let result;

      if (mode === 'edit' && currentSkillId) {
        // Update existing skill
        result = await updateSkill(Number(currentSkillId), {
          word: skillForm.word,
          description: skillForm.description,
        });
      } else {
        // Add new skill
        result = await addSkill({
          word: skillForm.word,
          description: skillForm.description,
        });
      }

      setSkillResult(result);

      if (result.success) {
        // Reset form
        if (mode === 'edit') {
          handleCancelEdit();
        } else {
          setSkillForm({ word: '', description: '' });
        }

        // Refresh skills list
        await fetchSkills();
      }
    } catch (error) {
      setSkillResult({ success: false, error: 'An unexpected error occurred' });
    } finally {
      setSkillsLoading(false);
    }
  }

  // Filter skills based on search term
  const filteredSkills = skillsList.filter(
    (skill) =>
      skill.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill?.desc?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl p-6 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{mode === 'add' ? 'Add New Skill' : 'Edit Skill'}</h2>

        <button
          onClick={() => setShowMultiAdd(!showMultiAdd)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          {showMultiAdd ? 'Hide Bulk Add' : 'Bulk Add Skills'}
        </button>
      </div>

      {showMultiAdd && (
        <div className="mb-8 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-gray-700">
          <h3 className="text-xl font-medium mb-4">Bulk Add Skills</h3>

          {multiAddError && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-200">
              {multiAddError}
            </div>
          )}

          <p className="mb-2 text-sm">
            Paste a JavaScript array of skill objects with word and desc properties:
          </p>

          <textarea
            value={multiAddInput}
            onChange={(e) => setMultiAddInput(e.target.value)}
            className="w-full h-64 mb-4 p-3 bg-white/5 border border-gray-700 rounded-md font-mono text-sm"
            placeholder={`[
  {
    "word": "React Native",
    "desc": "Core developer of BJK Super App (300K+ downloads)..."
  },
  {
    "word": "Flutter",
    "desc": "Developed Kelebike campus rental system..."
  }
]`}
          />

          <div className="flex justify-end">
            <button
              onClick={handleMultiAddSubmit}
              disabled={multiAddLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {multiAddLoading ? 'Adding Skills...' : 'Add All Skills'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSkillSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="skillWord">
            Skill Name
          </label>
          <input
            type="text"
            id="skillWord"
            name="word"
            value={skillForm.word}
            onChange={handleSkillInputChange}
            className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="skillDescription">
            Description
          </label>
          <textarea
            id="skillDescription"
            name="description"
            value={skillForm.description}
            onChange={handleSkillInputChange}
            rows={3}
            className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={skillsLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {skillsLoading
              ? mode === 'add'
                ? 'Adding Skill...'
                : 'Updating Skill...'
              : mode === 'add'
              ? 'Add Skill'
              : 'Update Skill'}
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

      {skillResult && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            skillResult.success
              ? 'bg-green-900/30 border border-green-500 text-green-200'
              : 'bg-red-900/30 border border-red-500 text-red-200'
          }`}
        >
          {skillResult.success
            ? skillResult.error ||
              (mode === 'add' ? 'Skill added successfully!' : 'Skill updated successfully!')
            : `Error: ${skillResult.error}`}
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium">Current Skills</h3>

          {skillsList.length > 0 && (
            <div className="flex items-center gap-2">
              {selectedSkills.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={deleteLoading}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : `Delete Selected (${selectedSkills.length})`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search input */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search skills..."
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

        {filteredSkills.length > 0 && (
          <div className="mb-2 flex items-center">
            <input
              type="checkbox"
              id="selectAll"
              checked={filteredSkills.length > 0 && selectedSkills.length === filteredSkills.length}
              onChange={handleSelectAll}
              className="mr-2"
            />
            <label htmlFor="selectAll" className="text-sm">
              Select All
            </label>
          </div>
        )}

        <div className="max-h-96 overflow-y-auto p-2 space-y-2">
          {skillsList.length === 0 ? (
            <p className="text-gray-400">No skills found. Add some skills above.</p>
          ) : filteredSkills.length === 0 ? (
            <p className="text-gray-400">No skills match your search.</p>
          ) : (
            filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className={`p-4 border rounded-lg flex justify-between items-start ${
                  selectedSkills.includes(skill.id)
                    ? 'bg-blue-900/20 border-blue-500/40'
                    : 'bg-white/5 border-gray-300/20'
                }`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill.id)}
                    onChange={() => handleSkillSelection(skill.id)}
                    className="mt-1"
                  />
                  <div>
                    <h4 className="font-medium">{skill.word}</h4>
                    <p className="text-sm text-black font-extralight mt-1">{skill.desc}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSkill(skill)}
                    className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
