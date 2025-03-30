'use client';

import { addSkill, getSkills } from '@/lib/actions';
import { useState, useEffect } from 'react';

export default function SkillsTab() {
  // States for skills management
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [skillForm, setSkillForm] = useState({ word: '', description: '' });
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillResult, setSkillResult] = useState<{ success?: boolean; error?: string } | null>(
    null
  );

  // Fetch existing skills on component mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const fetchedSkills = await getSkills();
        if (fetchedSkills && fetchedSkills.length > 0) {
          setSkillsList(fetchedSkills);
        }
      } catch (error) {
        console.error('Failed to load skills:', error);
      }
    };

    fetchSkills();
  }, []);

  // Handle skill form input changes
  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSkillForm((prev) => ({ ...prev, [name]: value }));
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
      const result = await addSkill({
        word: skillForm.word,
        description: skillForm.description,
      });

      setSkillResult(result);

      if (result.success) {
        // Reset form
        setSkillForm({ word: '', description: '' });

        // Refresh skills list
        const updatedSkills = await getSkills();
        setSkillsList(updatedSkills);
      }
    } catch (error) {
      setSkillResult({ success: false, error: 'An unexpected error occurred' });
    } finally {
      setSkillsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl p-6 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Manage Skills</h2>

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

        <button
          type="submit"
          disabled={skillsLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {skillsLoading ? 'Adding Skill...' : 'Add Skill'}
        </button>
      </form>

      {skillResult && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            skillResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {skillResult.success ? 'Skill added successfully!' : `Error: ${skillResult.error}`}
        </div>
      )}

      <div>
        <h3 className="text-xl font-medium mb-4">Current Skills</h3>
        <div className="max-h-96 overflow-y-auto p-2 space-y-2">
          {skillsList.length === 0 ? (
            <p className="text-gray-400">No skills found. Add some skills above.</p>
          ) : (
            skillsList.map((skill) => (
              <div key={skill.id} className="p-4 bg-white/5 border border-gray-300/20 rounded-lg">
                <h4 className="font-medium">{skill.word}</h4>
                <p className="text-sm text-gray-300 mt-1">{skill.desc}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
