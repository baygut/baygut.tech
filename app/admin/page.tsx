'use client';

import { useState } from 'react';
import LogoutButton from '@/components/LogoutButton';
import TabNavigation from '@/components/admin/TabNavigation';

import ProjectsTab from '@/components/admin/ProjectsTab';
import SkillsTab from '@/components/admin/SkillsTab';
import GeneralSettingsTab from '@/components/admin/GeneralSettingsTab';

export default function AdminPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="min-h-screen h-full flex flex-col items-center justify-start p-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'general' && <GeneralSettingsTab />}
      {activeTab === 'projects' && <ProjectsTab />}
      {activeTab === 'skills' && <SkillsTab />}

      <div className="mt-8">
        <LogoutButton />
      </div>
    </div>
  );
}
