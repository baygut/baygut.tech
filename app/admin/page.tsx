'use client';

import { useState } from 'react';
import LogoutButton from '@/components/LogoutButton';
import TabNavigation from '@/components/admin/TabNavigation';

import ProjectsTab from '@/components/admin/ProjectsTab';
import SkillsTab from '@/components/admin/SkillsTab';
import GeneralSettingsTab from '@/components/admin/GeneralSettingsTab';
import BlogTab from '@/components/admin/BlogTab';
import HeroTab from '@/components/admin/HeroTab';

export default function AdminPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="min-h-screen h-full flex flex-col items-center justify-start p-4">
      <div className="flex flex-row justify-between items-center w-full mb-8">
        <a />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <LogoutButton />
      </div>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'general' && <GeneralSettingsTab />}
      {activeTab === 'hero' && <HeroTab />}
      {activeTab === 'projects' && <ProjectsTab />}
      {activeTab === 'skills' && <SkillsTab />}
      {activeTab === 'blog' && <BlogTab />}
    </div>
  );
}
