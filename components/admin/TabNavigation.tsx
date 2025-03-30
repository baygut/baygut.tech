'use client';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="flex mb-8 border-b w-full max-w-2xl">
      <button
        onClick={() => setActiveTab('general')}
        className={`px-6 py-3 ${
          activeTab === 'general'
            ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        General Settings
      </button>
      <button
        onClick={() => setActiveTab('projects')}
        className={`px-6 py-3 ${
          activeTab === 'projects'
            ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Projects
      </button>
      <button
        onClick={() => setActiveTab('skills')}
        className={`px-6 py-3 ${
          activeTab === 'skills'
            ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Skills
      </button>
    </div>
  );
}
