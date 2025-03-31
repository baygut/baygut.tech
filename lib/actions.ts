'use server';

import { getNeonClient } from './db';
import { revalidatePath } from 'next/cache';

// Skills actions
export async function getSkills() {
  try {
    const sql = getNeonClient();

    // Create table if it doesn't exist
    // Using "description" instead of "desc" to avoid reserved keyword issues
    await sql`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        word VARCHAR(255) NOT NULL,
        description TEXT NOT NULL
      )
    `;

    const skills = await sql`SELECT id, word, description as desc FROM skills`;

    // If no skills in database, return empty array
    if (skills.length === 0) {
      return [];
    }

    return skills;
  } catch (error) {
    console.error('Error fetching skills:', error);
    throw new Error('Failed to fetch skills');
  }
}

// About content actions
export async function getAboutContent() {
  try {
    const sql = getNeonClient();

    // Create table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS about_content (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        position INT NOT NULL
      )
    `;

    const aboutContent = await sql`SELECT * FROM about_content ORDER BY position`;

    // Return just the content strings
    return aboutContent.map((item) => item.content);
  } catch (error) {
    console.error('Error fetching about content:', error);
    throw new Error('Failed to fetch about content');
  }
}

// Projects actions
export async function getProjects() {
  try {
    const sql = getNeonClient();

    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        color VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        github_url TEXT,
        demo_url TEXT
      )
    `;

    // Add cover_image column if it doesn't exist
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_name = 'projects' AND column_name = 'cover_image'
        ) THEN
          ALTER TABLE projects ADD COLUMN cover_image BYTEA;
          ALTER TABLE projects ADD COLUMN cover_image_type VARCHAR(50);
        END IF;
      END $$;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS project_tags (
        id SERIAL PRIMARY KEY,
        project_id INT NOT NULL,
        tag VARCHAR(255) NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `;

    // Update project_images table to store image data
    await sql`
      CREATE TABLE IF NOT EXISTS project_images (
        id SERIAL PRIMARY KEY,
        project_id INT NOT NULL,
        image_data BYTEA NOT NULL,
        image_type VARCHAR(50) NOT NULL,
        position INT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `;

    const projects =
      await sql`SELECT id, title, description, color, category, github_url, demo_url FROM projects`;

    // For each project, get its tags and images
    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const tags = await sql`
          SELECT tag FROM project_tags WHERE project_id = ${project.id}
        `;

        const images = await sql`
          SELECT id, image_type FROM project_images 
          WHERE project_id = ${project.id}
          ORDER BY position
        `;

        // Convert to URLs that point to our API
        const imageUrls = images.map((img) => `/api/images/${img.id}`);

        // Check if the project has a cover image without fetching the actual binary data
        const hasCoverImage = await sql`
          SELECT EXISTS(
            SELECT 1 FROM projects 
            WHERE id = ${project.id} 
            AND cover_image IS NOT NULL
          ) as has_cover
        `;

        // Add cover image URL if exists
        const coverImageUrl = hasCoverImage[0].has_cover
          ? `/api/cover-image/${project.id}`
          : undefined;

        return {
          id: project.id,
          title: project.title,
          description: project.description,
          color: project.color,
          category: project.category,
          githubUrl: project.github_url,
          demoUrl: project.demo_url,
          tags: tags.map((tagItem) => tagItem.tag),
          images: imageUrls,
          coverImage: coverImageUrl,
          createdAt: new Date().toISOString(),
        };
      })
    );
    return projectsWithDetails;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects');
  }
}

// Add project action
export async function addProject(formData: {
  title: string;
  description: string;
  color: string;
  category: string;
  tags: string[];
  images: { data: ArrayBuffer; type: string }[];
  githubUrl?: string;
  demoUrl?: string;
  coverImage?: { data: ArrayBuffer; type: string };
}) {
  try {
    const sql = getNeonClient();
    const { title, description, color, category, tags, images, githubUrl, demoUrl, coverImage } =
      formData;

    // Insert the project with the new fields, including cover image if provided
    const insertedProject = await sql`
      INSERT INTO projects (
        title, description, color, category, github_url, demo_url,
        cover_image, cover_image_type
      ) 
      VALUES (
        ${title}, ${description}, ${color}, ${category}, 
        ${githubUrl || null}, ${demoUrl || null},
        ${coverImage ? Buffer.from(coverImage.data) : null},
        ${coverImage ? coverImage.type : null}
      )
      RETURNING id
    `;

    const projectId = insertedProject[0].id;

    // Insert each tag associated with the project
    for (const tag of tags) {
      await sql`
        INSERT INTO project_tags (project_id, tag)
        VALUES (${projectId}, ${tag})
      `;
    }

    // Insert each image associated with the project
    for (let i = 0; i < images.length; i++) {
      const { data, type } = images[i];
      await sql`
        INSERT INTO project_images (project_id, image_data, image_type, position)
        VALUES (${projectId}, ${Buffer.from(data)}, ${type}, ${i})
      `;
    }

    // Revalidate the projects page to show the new project
    revalidatePath('/projects');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error adding project:', error);
    return { success: false, error: 'Failed to add project' };
  }
}

// Contact info actions
export async function getContactInfo() {
  try {
    const sql = getNeonClient();

    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS contact_info (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        value VARCHAR(255) NOT NULL,
        href VARCHAR(255) NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS social_links (
        id SERIAL PRIMARY KEY,
        icon VARCHAR(50) NOT NULL,
        url VARCHAR(255) NOT NULL,
        label VARCHAR(50) NOT NULL
      )
    `;

    // Create resume table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS resume (
        id SERIAL PRIMARY KEY,
        url VARCHAR(255) NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const contactItems = await sql`SELECT * FROM contact_info`;
    const socialLinks = await sql`SELECT * FROM social_links`;
    const resume = await sql`SELECT * FROM resume ORDER BY updated_at DESC LIMIT 1`;

    return {
      contactItems,
      socialLinks,
      resumeUrl: resume.length > 0 ? resume[0].url : null,
    };
  } catch (error) {
    console.error('Error fetching contact info:', error);
    throw new Error('Failed to fetch contact info');
  }
}

// Seed database with initial data
export async function seedDatabase(reset = false) {
  try {
    const sql = getNeonClient();

    if (reset) {
      // Clear existing tables
      await sql`DROP TABLE IF EXISTS project_images CASCADE`;
      await sql`DROP TABLE IF EXISTS project_tags CASCADE`;
      await sql`DROP TABLE IF EXISTS projects CASCADE`;
      await sql`DROP TABLE IF EXISTS skills CASCADE`;
      await sql`DROP TABLE IF EXISTS about_content CASCADE`;
      await sql`DROP TABLE IF EXISTS contact_info CASCADE`;
      await sql`DROP TABLE IF EXISTS social_links CASCADE`;
      await sql`DROP TABLE IF EXISTS resume CASCADE`;
    }

    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        word VARCHAR(255) NOT NULL,
        description TEXT NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS about_content (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        position INT NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        color VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        github_url TEXT,
        demo_url TEXT
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS project_tags (
        id SERIAL PRIMARY KEY,
        project_id INT NOT NULL,
        tag VARCHAR(255) NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS project_images (
        id SERIAL PRIMARY KEY,
        project_id INT NOT NULL,
        image_data BYTEA NOT NULL,
        image_type VARCHAR(50) NOT NULL,
        position INT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS contact_info (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        value VARCHAR(255) NOT NULL,
        href VARCHAR(255) NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS social_links (
        id SERIAL PRIMARY KEY,
        icon VARCHAR(50) NOT NULL,
        url VARCHAR(255) NOT NULL,
        label VARCHAR(50) NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS resume (
        id SERIAL PRIMARY KEY,
        url VARCHAR(255) NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Check if we already have data
    const skillCount = await sql`SELECT COUNT(*) FROM skills`;
    const contactCount = await sql`SELECT COUNT(*) FROM contact_info`;
    const resumeCount = await sql`SELECT COUNT(*) FROM resume`;
    const projectCount = await sql`SELECT COUNT(*) FROM projects`;

    if (parseInt(skillCount[0].count) === 0) {
      // Insert skills
      // Only showing a few for brevity - you can add all your skills here
      const skills = [
        {
          word: 'React',
          description:
            'Building interactive UIs with React and its ecosystem, including React hooks, context API, and state management solutions.',
        },
      ];

      for (const skill of skills) {
        await sql`INSERT INTO skills (word, description) VALUES (${skill.word}, ${skill.description})`;
      }

      // Insert about content
      const aboutContent = [
        "Hi there! I'm a passionate developer with experience in building modern web applications and services. I specialize in React, Next.js, and TypeScript.",
        "I love creating clean, efficient, and user-friendly interfaces that solve real-world problems. When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or enjoying the outdoors.",
      ];

      for (let i = 0; i < aboutContent.length; i++) {
        await sql`INSERT INTO about_content (content, position) VALUES (${aboutContent[i]}, ${i})`;
      }
    }

    // Insert contact information if it doesn't exist
    if (parseInt(contactCount[0].count) === 0) {
      const phone = '+905055942948';
      const email = 'berkaybaygut@gmail.com';

      // Insert contact items
      await sql`INSERT INTO contact_info (type, value, href) VALUES ('email', ${email}, ${
        'mailto:' + email
      })`;
      await sql`INSERT INTO contact_info (type, value, href) VALUES ('phone', ${phone}, ${
        'tel:' + phone
      })`;

      // Insert social links
      await sql`INSERT INTO social_links (icon, url, label) VALUES ('github', ${'https://github.com/baygut/'}, ${'GitHub'})`;
      await sql`INSERT INTO social_links (icon, url, label) VALUES ('linkedin', ${'https://linkedin.com/in/berkay-baygut-14482613a/'}, ${'LinkedIn'})`;
    }

    // Insert resume URL if it doesn't exist
    if (parseInt(resumeCount[0].count) === 0) {
      const resumeUrl = '/resume-berkay-baygut.pdf'; // Adjust this to your actual resume file path
      await sql`INSERT INTO resume (url) VALUES (${resumeUrl})`;
    }

    // Insert projects and their tags if they don't exist
    if (parseInt(projectCount[0].count) === 0) {
      // Projects data
      const projects = [
        {
          title: 'E-commerce Mobile App',
          description:
            'A native mobile shopping platform with personalized recommendations and AR try-on features.',
          color: 'blue',
          category: 'mobile',
          tags: ['React Native', 'Redux', 'Firebase'],
          images: [
            'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=800&auto=format',
            'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format',
            'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=800&auto=format',
          ],
          githubUrl: 'https://github.com/example/ecommerce-app',
          demoUrl: 'https://example-app.com',
        },
      ];

      // Insert each project
      for (const project of projects) {
        // Insert the project with GitHub and demo URLs
        const insertedProject = await sql`
          INSERT INTO projects (title, description, color, category, github_url, demo_url) 
          VALUES (${project.title}, ${project.description}, ${project.color}, ${
          project.category
        }, ${project.githubUrl || null}, ${project.demoUrl || null})
          RETURNING id
        `;

        const projectId = insertedProject[0].id;

        // Insert each tag associated with the project
        for (const tag of project.tags) {
          await sql`
            INSERT INTO project_tags (project_id, tag)
            VALUES (${projectId}, ${tag})
          `;
        }

        // Fetch and insert each image
        for (let i = 0; i < project.images.length; i++) {
          const imageBuffer = await getImageBufferFromUrl(project.images[i]);
          if (imageBuffer) {
            await sql`
              INSERT INTO project_images (project_id, image_data, image_type, position)
              VALUES (${projectId}, ${Buffer.from(imageBuffer.data)}, ${imageBuffer.type}, ${i})
            `;
          }
        }
      }
    }

    // Revalidate all paths to reflect the new data
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error: 'Failed to seed database' };
  }
}

// Get a single image by ID
export async function getImage(id: string) {
  try {
    const sql = getNeonClient();

    const result = await sql`
      SELECT image_data, image_type 
      FROM project_images 
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return null;
    }

    return {
      data: result[0].image_data,
      type: result[0].image_type,
    };
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

// Get a cover image by project ID
export async function getCoverImage(projectId: string) {
  try {
    const sql = getNeonClient();

    const result = await sql`
      SELECT cover_image, cover_image_type 
      FROM projects 
      WHERE id = ${projectId} AND cover_image IS NOT NULL
    `;

    if (result.length === 0) {
      return null;
    }

    return {
      data: result[0].cover_image,
      type: result[0].cover_image_type,
    };
  } catch (error) {
    console.error('Error fetching cover image:', error);
    return null;
  }
}

// Get all unique categories
export async function getCategories(): Promise<string[]> {
  try {
    const sql = getNeonClient();

    // Create the projects table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        color VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        github_url TEXT,
        demo_url TEXT
      )
    `;

    // Get all unique categories from projects table
    const result = await sql`
      SELECT DISTINCT category FROM projects ORDER BY category
    `;

    // If no categories exist yet, return default ones
    if (result.length === 0) {
      return ['web', 'mobile', 'misc'];
    }

    return result.map((row) => row.category);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return ['web', 'mobile', 'misc']; // Return defaults on error
  }
}

// Add a new category (this is just for tracking, as categories are stored with projects)
export async function addCategory(category: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Since categories are stored with projects, we just need to validate
    if (!category || category.trim().length === 0) {
      return { success: false, error: 'Category name cannot be empty' };
    }

    if (category.length > 50) {
      return { success: false, error: 'Category name cannot exceed 50 characters' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding category:', error);
    return { success: false, error: 'Failed to add category' };
  }
}

// Add a new skill
export async function addSkill(skill: {
  word: string;
  description: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const sql = getNeonClient();

    // Validate input
    if (!skill.word || !skill.description) {
      return { success: false, error: 'Skill name and description are required' };
    }

    // Insert the skill
    await sql`
      INSERT INTO skills (word, description)
      VALUES (${skill.word}, ${skill.description})
    `;

    // Revalidate paths that display skills
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error adding skill:', error);
    return { success: false, error: 'Failed to add skill' };
  }
}

// Delete a skill
export async function deleteSkill(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const sql = getNeonClient();

    // Delete the skill
    await sql`DELETE FROM skills WHERE id = ${id}`;

    // Revalidate paths that display skills
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error deleting skill:', error);
    return { success: false, error: 'Failed to delete skill' };
  }
}

export async function updateSkill(
  id: number,
  skill: { word: string; description: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const sql = getNeonClient();

    // Validate input
    if (!skill.word || !skill.description) {
      return { success: false, error: 'Skill name and description are required' };
    }

    // Update the skill
    await sql`
      UPDATE skills
      SET word = ${skill.word}, description = ${skill.description}
      WHERE id = ${id}
    `;

    // Revalidate paths that display skills
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error updating skill:', error);
    return { success: false, error: 'Failed to update skill' };
  }
}

// Update about content
export async function updateAboutContent(
  content: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const sql = getNeonClient();

    // Clear existing content
    await sql`DELETE FROM about_content`;

    // Insert each paragraph with position
    for (let i = 0; i < content.length; i++) {
      await sql`
        INSERT INTO about_content (content, position)
        VALUES (${content[i]}, ${i})
      `;
    }

    // Revalidate paths that display about content
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error updating about content:', error);
    return { success: false, error: 'Failed to update about content' };
  }
}

// Update contact info
export async function updateContactInfo({
  contactItems,
  socialLinks,
  resumeUrl,
}: {
  contactItems: { type: string; value: string; href: string }[];
  socialLinks: { icon: string; url: string; label: string }[];
  resumeUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const sql = getNeonClient();

    // Update contact items
    await sql`DELETE FROM contact_info`;
    for (const item of contactItems) {
      await sql`
        INSERT INTO contact_info (type, value, href)
        VALUES (${item.type}, ${item.value}, ${item.href})
      `;
    }

    // Update social links
    await sql`DELETE FROM social_links`;
    for (const link of socialLinks) {
      await sql`
        INSERT INTO social_links (icon, url, label)
        VALUES (${link.icon}, ${link.url}, ${link.label})
      `;
    }

    // Update resume URL
    if (resumeUrl) {
      await sql`INSERT INTO resume (url) VALUES (${resumeUrl})`;
    }

    // Revalidate paths that display contact info
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error updating contact info:', error);
    return { success: false, error: 'Failed to update contact info' };
  }
}

// Get projects for admin (simplified version without image data)
export async function getAdminProjects() {
  try {
    const sql = getNeonClient();

    const projects = await sql`SELECT * FROM projects`;

    // For each project, get its tags
    const projectsWithTags = await Promise.all(
      projects.map(async (project) => {
        const tags = await sql`
          SELECT tag FROM project_tags WHERE project_id = ${project.id}
        `;

        const imageCount = await sql`
          SELECT COUNT(*) FROM project_images WHERE project_id = ${project.id}
        `;

        return {
          ...project,
          tags: tags.map((tagItem) => tagItem.tag),
          imageCount: parseInt(imageCount[0].count),
        };
      })
    );
    return projectsWithTags;
  } catch (error) {
    console.error('Error fetching admin projects:', error);
    throw new Error('Failed to fetch admin projects');
  }
}

// Delete a project
export async function deleteProject(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const sql = getNeonClient();

    // Delete related records first
    await sql`DELETE FROM project_images WHERE project_id = ${id}`;
    await sql`DELETE FROM project_tags WHERE project_id = ${id}`;

    // Then delete the project
    await sql`DELETE FROM projects WHERE id = ${id}`;

    // Revalidate paths that display projects
    revalidatePath('/projects');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, error: 'Failed to delete project' };
  }
}

// Get a single project with all details for editing
export async function getProjectForEdit(id: number) {
  try {
    const sql = getNeonClient();

    const project = await sql`SELECT * FROM projects WHERE id = ${id}`;

    if (project.length === 0) {
      return null;
    }

    const tags = await sql`
      SELECT tag FROM project_tags WHERE project_id = ${id}
    `;

    // Don't fetch image data as it would be too large
    // Just get the image IDs so we can display them
    const images = await sql`
      SELECT id, image_type FROM project_images 
      WHERE project_id = ${id}
      ORDER BY position
    `;

    return {
      ...project[0],
      tags: tags.map((tagItem) => tagItem.tag),
      imageIds: images.map((img) => img.id),
    };
  } catch (error) {
    console.error('Error fetching project for edit:', error);
    return null;
  }
}

// Update a project - simplified version
export async function updateProject(
  id: number,
  formData: {
    title: string;
    description: string;
    color: string;
    category: string;
    tags: string[];
    githubUrl?: string;
    demoUrl?: string;
    removedImageIds?: number[];
    newImages?: { data: ArrayBuffer; type: string }[];
    coverImage?: { data: ArrayBuffer; type: string } | null;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const sql = getNeonClient();
    const {
      title,
      description,
      color,
      category,
      tags,
      githubUrl,
      demoUrl,
      removedImageIds,
      newImages,
      coverImage,
    } = formData;

    // Handle cover image updates with a simple if/else
    if (coverImage === null) {
      // Case 1: Explicitly set cover image to null (remove it)
      await sql`
        UPDATE projects 
        SET 
          title = ${title}, 
          description = ${description}, 
          color = ${color}, 
          category = ${category},
          github_url = ${githubUrl || null},
          demo_url = ${demoUrl || null},
          cover_image = NULL,
          cover_image_type = NULL
        WHERE id = ${id}
      `;
    } else if (coverImage) {
      // Case 2: Update with new cover image
      await sql`
        UPDATE projects 
        SET 
          title = ${title}, 
          description = ${description}, 
          color = ${color}, 
          category = ${category},
          github_url = ${githubUrl || null},
          demo_url = ${demoUrl || null},
          cover_image = ${Buffer.from(coverImage.data)},
          cover_image_type = ${coverImage.type}
        WHERE id = ${id}
      `;
    } else {
      // Case 3: No change to cover image
      await sql`
        UPDATE projects 
        SET 
          title = ${title}, 
          description = ${description}, 
          color = ${color}, 
          category = ${category},
          github_url = ${githubUrl || null},
          demo_url = ${demoUrl || null}
        WHERE id = ${id}
      `;
    }

    // Update tags - delete existing and insert new ones
    await sql`DELETE FROM project_tags WHERE project_id = ${id}`;
    for (const tag of tags) {
      await sql`
        INSERT INTO project_tags (project_id, tag)
        VALUES (${id}, ${tag})
      `;
    }

    // Delete removed images if any
    if (removedImageIds && removedImageIds.length > 0) {
      for (const imageId of removedImageIds) {
        await sql`DELETE FROM project_images WHERE id = ${imageId}`;
      }
    }

    // Add new images if any
    if (newImages && newImages.length > 0) {
      // Get current highest position
      const positionResult = await sql`
        SELECT COALESCE(MAX(position), -1) as max_position 
        FROM project_images 
        WHERE project_id = ${id}
      `;
      let position = parseInt(positionResult[0].max_position) + 1;

      // Insert each new image
      for (const { data, type } of newImages) {
        await sql`
          INSERT INTO project_images (project_id, image_data, image_type, position)
          VALUES (${id}, ${Buffer.from(data)}, ${type}, ${position})
        `;
        position++;
      }
    }

    // Revalidate paths that display projects
    revalidatePath('/projects');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error updating project:', error);
    return { success: false, error: 'Failed to update project' };
  }
}

// Sample images will now need to be fetched and converted to Buffers
async function getImageBufferFromUrl(url: string) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    return { data: arrayBuffer, type: contentType };
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

// Blog posts actions
export async function getBlogPosts() {
  try {
    const sql = getNeonClient();

    // Create blogs table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        published BOOLEAN NOT NULL DEFAULT true
      )
    `;

    // Create blog tags table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS blog_tags (
        id SERIAL PRIMARY KEY,
        post_id INT NOT NULL,
        tag VARCHAR(255) NOT NULL,
        FOREIGN KEY (post_id) REFERENCES blog_posts(id)
      )
    `;

    // Get all published blog posts
    const posts = await sql`
      SELECT * FROM blog_posts 
      WHERE published = true 
      ORDER BY published_at DESC
    `;

    // For each post, get its tags
    const postsWithTags = await Promise.all(
      posts.map(async (post) => {
        const tags = await sql`
          SELECT tag FROM blog_tags WHERE post_id = ${post.id}
        `;

        return {
          ...post,
          tags: tags.map((tagItem) => tagItem.tag),
        };
      })
    );

    return postsWithTags as {
      id: number;
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      published_at: string;
      updated_at: string;
      published: boolean;
      tags?: string[];
    }[];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw new Error('Failed to fetch blog posts');
  }
}

// Get a single blog post by slug
export async function getBlogPostBySlug(slug: string) {
  try {
    const sql = getNeonClient();

    const post = await sql`
      SELECT * FROM blog_posts 
      WHERE slug = ${slug} AND published = true
    `;

    if (post.length === 0) {
      return null;
    }

    const tags = await sql`
      SELECT tag FROM blog_tags WHERE post_id = ${post[0].id}
    `;

    return {
      ...post[0],
      tags: tags.map((tagItem) => tagItem.tag),
    } as {
      id: number;
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      published_at: string;
      updated_at: string;
      published: boolean;
      tags?: string[];
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Add a new blog post
export async function addBlogPost(formData: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  published?: boolean;
}) {
  try {
    const sql = getNeonClient();
    const { title, slug, excerpt, content, tags, published = true } = formData;

    // Check if slug already exists
    const existingPost = await sql`
      SELECT id FROM blog_posts WHERE slug = ${slug}
    `;

    if (existingPost.length > 0) {
      return { success: false, error: 'A post with this URL slug already exists' };
    }

    // Insert the blog post
    const insertedPost = await sql`
      INSERT INTO blog_posts (title, slug, excerpt, content, published)
      VALUES (${title}, ${slug}, ${excerpt}, ${content}, ${published})
      RETURNING id
    `;

    const postId = insertedPost[0].id;

    // Insert each tag associated with the post
    for (const tag of tags) {
      await sql`
        INSERT INTO blog_tags (post_id, tag)
        VALUES (${postId}, ${tag})
      `;
    }

    // Revalidate paths that display blog posts
    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);

    return { success: true };
  } catch (error) {
    console.error('Error adding blog post:', error);
    return { success: false, error: 'Failed to add blog post' };
  }
}

// Update a blog post
export async function updateBlogPost(
  id: number,
  formData: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    tags: string[];
    published?: boolean;
  }
) {
  try {
    const sql = getNeonClient();
    const { title, slug, excerpt, content, tags, published = true } = formData;

    // Check if slug already exists for another post
    const existingPost = await sql`
      SELECT id FROM blog_posts WHERE slug = ${slug} AND id != ${id}
    `;

    if (existingPost.length > 0) {
      return { success: false, error: 'A post with this URL slug already exists' };
    }

    // Get current slug for revalidation
    const currentSlugResult = await sql`
      SELECT slug FROM blog_posts WHERE id = ${id}
    `;

    const currentSlug = currentSlugResult[0]?.slug;

    // Update the blog post
    await sql`
      UPDATE blog_posts
      SET title = ${title},
          slug = ${slug},
          excerpt = ${excerpt},
          content = ${content},
          published = ${published},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    // Update tags - delete existing and insert new ones
    await sql`DELETE FROM blog_tags WHERE post_id = ${id}`;
    for (const tag of tags) {
      await sql`
        INSERT INTO blog_tags (post_id, tag)
        VALUES (${id}, ${tag})
      `;
    }

    // Revalidate paths that display blog posts
    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath(`/blog/${currentSlug}`);
    if (currentSlug !== slug) {
      revalidatePath(`/blog/${slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating blog post:', error);
    return { success: false, error: 'Failed to update blog post' };
  }
}

// Delete a blog post
export async function deleteBlogPost(id: number) {
  try {
    const sql = getNeonClient();

    // Get slug for revalidation
    const slugResult = await sql`
      SELECT slug FROM blog_posts WHERE id = ${id}
    `;

    const slug = slugResult[0]?.slug;

    // Delete related tags first
    await sql`DELETE FROM blog_tags WHERE post_id = ${id}`;

    // Then delete the post
    await sql`DELETE FROM blog_posts WHERE id = ${id}`;

    // Revalidate paths that display blog posts
    revalidatePath('/');
    revalidatePath('/blog');
    if (slug) {
      revalidatePath(`/blog/${slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return { success: false, error: 'Failed to delete blog post' };
  }
}

// Blog posts actions for admin (includes unpublished posts)
export async function getAdminBlogPosts() {
  try {
    const sql = getNeonClient();

    // Get all blog posts, including unpublished ones
    const posts = await sql`
      SELECT * FROM blog_posts 
      ORDER BY published_at DESC
    `;

    // For each post, get its tags
    const postsWithTags = await Promise.all(
      posts.map(async (post) => {
        const tags = await sql`
          SELECT tag FROM blog_tags WHERE post_id = ${post.id}
        `;

        return {
          ...post,
          tags: tags.map((tagItem) => tagItem.tag),
        };
      })
    );

    return postsWithTags;
  } catch (error) {
    console.error('Error fetching admin blog posts:', error);
    throw new Error('Failed to fetch admin blog posts');
  }
}
