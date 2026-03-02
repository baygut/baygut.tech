'use client';

import {
  seedDatabase,
  getContactInfo,
  getAboutContent,
  updateAboutContent,
  updateContactInfo,
  clearExperienceCache,
} from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function GeneralSettingsTab() {
  const router = useRouter();

  // Database seeding states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // About content states
  const [aboutContent, setAboutContent] = useState<string[]>([]);
  const [aboutContentLoading, setAboutContentLoading] = useState(false);
  const [aboutContentResult, setAboutContentResult] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);

  // Contact info states
  const [contactInfo, setContactInfo] = useState<{
    contactItems: { type: string; value: string; href: string }[];
    socialLinks: { icon: string; url: string; label: string }[];
    resumeUrl: string | null;
  }>({
    contactItems: [],
    socialLinks: [],
    resumeUrl: null,
  });
  const [contactInfoLoading, setContactInfoLoading] = useState(false);
  const [contactInfoResult, setContactInfoResult] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);

  // Fetch existing data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch about content
        const fetchedAboutContent = await getAboutContent();
        setAboutContent(fetchedAboutContent);

        // Fetch contact info
        const fetchedContactInfo = await getContactInfo();
        setContactInfo({
          contactItems: fetchedContactInfo.contactItems.map((item: Record<string, any>) => ({
            type: item.type || '',
            value: item.value || '',
            href: item.href || '',
          })),
          socialLinks: fetchedContactInfo.socialLinks.map((link: Record<string, any>) => ({
            icon: link.icon || '',
            url: link.url || '',
            label: link.label || '',
          })),
          resumeUrl: fetchedContactInfo.resumeUrl || null,
        });
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    fetchData();
  }, []);

  // Function to handle password authentication
  const handleAuthentication = () => {
    // This is a simple example. In a real application, you might want to use
    // environment variables or a more secure server-side verification approach
    const correctPassword = '123456'; // Replace with your desired password

    if (password === correctPassword) {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Incorrect password');
      setIsAuthenticated(false);
    }
  };

  // Handle database seeding
  async function handleSeed(reset: boolean) {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const result = await seedDatabase(reset);
      setResult(result);
      if (result.success) {
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }

  // Handle about content update
  async function handleAboutContentUpdate(e: React.FormEvent) {
    e.preventDefault();
    setAboutContentLoading(true);

    try {
      // Filter out empty paragraphs
      const filteredContent = aboutContent.filter((paragraph) => paragraph.trim() !== '');

      if (filteredContent.length === 0) {
        setAboutContentResult({ success: false, error: 'At least one paragraph is required' });
        return;
      }

      const result = await updateAboutContent(filteredContent);
      setAboutContentResult(result);
    } catch (error) {
      setAboutContentResult({ success: false, error: 'An unexpected error occurred' });
    } finally {
      setAboutContentLoading(false);
    }
  }

  // Handle contact info update
  async function handleContactInfoUpdate(e: React.FormEvent) {
    e.preventDefault();
    setContactInfoLoading(true);

    try {
      const result = await updateContactInfo({
        ...contactInfo,
        resumeUrl: contactInfo.resumeUrl || '', // Ensure resumeUrl is a string
      });
      setContactInfoResult(result);
    } catch (error) {
      setContactInfoResult({ success: false, error: 'An unexpected error occurred' });
    } finally {
      setContactInfoLoading(false);
    }
  }

  // Handle paragraph change in about content
  const handleParagraphChange = (index: number, value: string) => {
    const updatedContent = [...aboutContent];
    updatedContent[index] = value;
    setAboutContent(updatedContent);
  };

  // Add new paragraph to about content
  const addParagraph = () => {
    setAboutContent([...aboutContent, '']);
  };

  // Remove paragraph from about content
  const removeParagraph = (index: number) => {
    const updatedContent = [...aboutContent];
    updatedContent.splice(index, 1);
    setAboutContent(updatedContent);
  };

  // Handle contact item change
  const handleContactItemChange = (index: number, field: string, value: string) => {
    const updatedItems = [...contactInfo.contactItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Auto-update href if type and value change
    if (field === 'type' || field === 'value') {
      const type = field === 'type' ? value : updatedItems[index].type;
      const val = field === 'value' ? value : updatedItems[index].value;

      if (type === 'email') {
        updatedItems[index].href = `mailto:${val}`;
      } else if (type === 'phone') {
        updatedItems[index].href = `tel:${val}`;
      }
    }

    setContactInfo({ ...contactInfo, contactItems: updatedItems });
  };

  // Add new contact item
  const addContactItem = () => {
    setContactInfo({
      ...contactInfo,
      contactItems: [...contactInfo.contactItems, { type: 'email', value: '', href: 'mailto:' }],
    });
  };

  // Remove contact item
  const removeContactItem = (index: number) => {
    const updatedItems = [...contactInfo.contactItems];
    updatedItems.splice(index, 1);
    setContactInfo({ ...contactInfo, contactItems: updatedItems });
  };

  // Handle social link change
  const handleSocialLinkChange = (index: number, field: string, value: string) => {
    const updatedLinks = [...contactInfo.socialLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setContactInfo({ ...contactInfo, socialLinks: updatedLinks });
  };

  // Add new social link
  const addSocialLink = () => {
    setContactInfo({
      ...contactInfo,
      socialLinks: [...contactInfo.socialLinks, { icon: 'github', url: '', label: '' }],
    });
  };

  // Remove social link
  const removeSocialLink = (index: number) => {
    const updatedLinks = [...contactInfo.socialLinks];
    updatedLinks.splice(index, 1);
    setContactInfo({ ...contactInfo, socialLinks: updatedLinks });
  };

  // Handle resume URL change
  const handleResumeUrlChange = (value: string) => {
    setContactInfo({ ...contactInfo, resumeUrl: value });
  };

  return (
    <div className="w-full max-w-2xl space-y-12">
      {/* About Content Section */}
      <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">About Content</h2>
        <form onSubmit={handleAboutContentUpdate} className="space-y-4">
          {aboutContent.map((paragraph, index) => (
            <div key={index} className="flex items-start gap-2">
              <textarea
                value={paragraph}
                onChange={(e) => handleParagraphChange(index, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter paragraph content"
              />
              <button
                type="button"
                onClick={() => removeParagraph(index)}
                className="mt-1 p-2 text-red-500 hover:text-red-700"
                title="Remove paragraph"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={addParagraph}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Add Paragraph
            </button>

            <button
              type="submit"
              disabled={aboutContentLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {aboutContentLoading ? 'Saving...' : 'Save About Content'}
            </button>
          </div>

          {aboutContentResult && (
            <div
              className={`p-4 rounded-lg ${
                aboutContentResult.success
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {aboutContentResult.success
                ? 'About content updated successfully!'
                : `Error: ${aboutContentResult.error}`}
            </div>
          )}
        </form>
      </div>

      {/* Contact Information Section */}
      <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
        <form onSubmit={handleContactInfoUpdate} className="space-y-8">
          {/* Contact Items */}
          <div>
            <h3 className="text-xl font-medium mb-3">Contact Items</h3>
            {contactInfo.contactItems.map((item, index) => (
              <div key={index} className="flex items-start gap-2 mb-3">
                <div className="grid grid-cols-3 gap-2 w-full">
                  <select
                    value={item.type}
                    onChange={(e) => handleContactItemChange(index, 'type', e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                  <input
                    value={item.value}
                    onChange={(e) => handleContactItemChange(index, 'value', e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={item.type === 'email' ? 'Email address' : 'Phone number'}
                  />
                  <input
                    value={item.href}
                    onChange={(e) => handleContactItemChange(index, 'href', e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      item.type === 'email' ? 'mailto:email@example.com' : 'tel:+1234567890'
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeContactItem(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                  title="Remove contact item"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addContactItem}
              className="px-3 py-1 bg-gray-600 text-sm text-white rounded-md hover:bg-gray-700"
            >
              Add Contact Item
            </button>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xl font-medium mb-3">Social Links</h3>
            {contactInfo.socialLinks.map((link, index) => (
              <div key={index} className="flex items-start gap-2 mb-3">
                <div className="grid grid-cols-3 gap-2 w-full">
                  <select
                    value={link.icon}
                    onChange={(e) => handleSocialLinkChange(index, 'icon', e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="github">GitHub</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="dribbble">Dribbble</option>
                    <option value="behance">Behance</option>
                  </select>
                  <input
                    value={link.url}
                    onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                  <input
                    value={link.label}
                    onChange={(e) => handleSocialLinkChange(index, 'label', e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Display label"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                  title="Remove social link"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSocialLink}
              className="px-3 py-1 bg-gray-600 text-sm text-white rounded-md hover:bg-gray-700"
            >
              Add Social Link
            </button>
          </div>

          {/* Resume URL */}
          <div>
            <h3 className="text-xl font-medium mb-3">Resume</h3>
            <input
              value={contactInfo.resumeUrl || ''}
              onChange={(e) => handleResumeUrlChange(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/resume.pdf or https://example.com/resume.pdf"
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter the path to your resume file (e.g., /resume.pdf for a file in the public folder)
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Experience data is cached after the first parse. If you replaced the PDF at the same
              URL, clear the cache below.
            </p>
            <button
              type="button"
              onClick={async () => {
                const res = await clearExperienceCache();
                alert(
                  res.success
                    ? 'Experience cache cleared. It will re-parse on next visit.'
                    : res.error
                );
              }}
              className="mt-2 px-3 py-1.5 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded-md"
            >
              Clear Experience Cache
            </button>
          </div>

          <button
            type="submit"
            disabled={contactInfoLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {contactInfoLoading ? 'Saving...' : 'Save Contact Information'}
          </button>

          {contactInfoResult && (
            <div
              className={`p-4 rounded-lg ${
                contactInfoResult.success
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {contactInfoResult.success
                ? 'Contact information updated successfully!'
                : `Error: ${contactInfoResult.error}`}
            </div>
          )}
        </form>
      </div>
      {/* Database Seeding Section */}
      <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Database Management</h2>

        {!isAuthenticated ? (
          <div className="mb-4">
            <p className="text-yellow-400 mb-2">⚠️ This section requires password authentication</p>
            <div className="flex gap-2 items-start">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="px-3 py-2 bg-white/5 border border-gray-300/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAuthentication}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Authenticate
              </button>
            </div>
            {authError && <p className="text-red-500 mt-2">{authError}</p>}
          </div>
        ) : (
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => handleSeed(false)}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Seeding...' : 'Seed Database (Keep Existing)'}
            </button>

            <button
              onClick={() => handleSeed(true)}
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset & Seed Database'}
            </button>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Lock
            </button>
          </div>
        )}

        {result && (
          <div
            className={`p-4 rounded-lg ${
              result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {result.success
              ? 'Database seeded successfully. Redirecting to homepage...'
              : `Error: ${result.error}`}
          </div>
        )}
      </div>
    </div>
  );
}
