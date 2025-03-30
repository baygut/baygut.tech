'use client';

import { addSkill, getSkills, deleteSkill, updateSkill } from '@/lib/actions';
import { useState, useEffect } from 'react';

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
            desc: skill.description,
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

  return (
    <div className="w-full max-w-2xl p-6 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{mode === 'add' ? 'Add New Skill' : 'Edit Skill'}</h2>

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
            skillResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {skillResult.success
            ? mode === 'add'
              ? 'Skill added successfully!'
              : 'Skill updated successfully!'
            : `Error: ${skillResult.error}`}
        </div>
      )}

      <div>
        <h3 className="text-xl font-medium mb-4">Current Skills</h3>
        <div className="max-h-96 overflow-y-auto p-2 space-y-2">
          {skillsList.length === 0 ? (
            <p className="text-gray-400">No skills found. Add some skills above.</p>
          ) : (
            skillsList.map((skill) => (
              <div
                key={skill.id}
                className="p-4 bg-white/5 border border-gray-300/20 rounded-lg flex justify-between items-start"
              >
                <div>
                  <h4 className="font-medium">{skill.word}</h4>
                  <p className="text-sm text-gray-300 mt-1">{skill.desc}</p>
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
