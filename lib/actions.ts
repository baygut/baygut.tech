'use server';

import { Category, Project } from '@/types/project';
import { getNeonClient } from './db';
import { revalidatePath, unstable_cache } from 'next/cache';
import { put, del } from '@vercel/blob';
import { CACHE_TAG_PORTFOLIO, PORTFOLIO_CACHE_REVALIDATE_SECONDS } from './cache-tags';
import { bumpPortfolioCache } from './bump-portfolio-cache';

// Hero content actions
/**
 * Fetches hero section content from the database.
 * Creates the hero_content table if it doesn't exist.
 * @returns Object with name and title, or default values if no data exists
 */
async function loadHeroContent() {
  try {
    const sql = getNeonClient();

    // Create table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS hero_content (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL
      )
    `;

    const heroContent = await sql`SELECT * FROM hero_content LIMIT 1`;

    // If no hero content in database, return default values
    if (heroContent.length === 0) {
      return {
        name: 'Berkay Baygut',
        title: 'Software Developer',
      };
    }

    return {
      name: heroContent[0].name,
      title: heroContent[0].title,
    };
  } catch (error) {
    console.error('Error fetching hero content:', error);
    throw new Error('Failed to fetch hero content');
  }
}

export const getHeroContent = unstable_cache(loadHeroContent, ['hero-content'], {
  revalidate: PORTFOLIO_CACHE_REVALIDATE_SECONDS,
  tags: [CACHE_TAG_PORTFOLIO],
});

/**
 * Updates hero section content in the database.
 * Performs an upsert operation (update if exists, insert if not).
 * Revalidates the homepage after successful update.
 * @param data Object containing name and title strings
 * @returns Object with success boolean and optional error message
 */
export async function updateHeroContent(data: { name: string; title: string }) {
  try {
    const sql = getNeonClient();

    // Check if hero content already exists
    const existing = await sql`SELECT id FROM hero_content LIMIT 1`;

    if (existing.length > 0) {
      // Update existing record
      await sql`
        UPDATE hero_content 
        SET name = ${data.name}, title = ${data.title}
        WHERE id = ${existing[0].id}
      `;
    } else {
      // Insert new record
      await sql`
        INSERT INTO hero_content (name, title)
        VALUES (${data.name}, ${data.title})
      `;
    }

    // Revalidate the homepage to show the updated content
    revalidatePath('/');
    bumpPortfolioCache();

    return { success: true };
  } catch (error) {
    console.error('Error updating hero content:', error);
    return { success: false, error: 'Failed to update hero content' };
  }
}

// Skills actions
async function loadSkills() {
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

export const getSkills = unstable_cache(loadSkills, ['skills'], {
  revalidate: PORTFOLIO_CACHE_REVALIDATE_SECONDS,
  tags: [CACHE_TAG_PORTFOLIO],
});

// About content actions
async function loadAboutContent() {
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

export const getAboutContent = unstable_cache(loadAboutContent, ['about-content'], {
  revalidate: PORTFOLIO_CACHE_REVALIDATE_SECONDS,
  tags: [CACHE_TAG_PORTFOLIO],
});

// Projects actions
async function loadProjects() {
  try {
    const sql = getNeonClient();

    // Create Category table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        display_order INT NOT NULL DEFAULT 0
      )
    `;

    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        color VARCHAR(50) NOT NULL,
        category_id INT NOT NULL,
        github_url TEXT,
        demo_url TEXT,
        FOREIGN KEY (category_id) REFERENCES categories(id)
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

    // Add category_id column and migrate data if needed
    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_name = 'projects' AND column_name = 'category'
        ) AND NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'projects' AND column_name = 'category_id'
        ) THEN
          -- Temporarily add category_id column
          ALTER TABLE projects ADD COLUMN category_id INT;
          
          -- For each distinct category in projects, add a category record if it doesn't exist
          INSERT INTO categories (name, display_order)
          SELECT DISTINCT category, 0 FROM projects
          ON CONFLICT (name) DO NOTHING;
          
          -- Update category_id based on category name
          UPDATE projects p
          SET category_id = c.id
          FROM categories c
          WHERE p.category = c.name;
          
          -- Make category_id NOT NULL and add foreign key
          ALTER TABLE projects ALTER COLUMN category_id SET NOT NULL;
          ALTER TABLE projects ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id);
          
          -- Drop the old category column
          ALTER TABLE projects DROP COLUMN category;
        ELSIF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'projects' AND column_name = 'category_id'
        ) THEN
          -- If no category column exists either, add category_id directly
          ALTER TABLE projects ADD COLUMN category_id INT NOT NULL DEFAULT 1;
          ALTER TABLE projects ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id);
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
        image_url TEXT,
        image_type VARCHAR(50) NOT NULL,
        position INT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `;

    const projects =
      await sql`SELECT p.id, p.title, p.description, p.color, c.id as category_id, c.name as category_name, p.github_url, p.demo_url,
                       p.cover_image_url, (p.cover_image IS NOT NULL) as has_cover
               FROM projects p
               JOIN categories c ON p.category_id = c.id
               ORDER BY c.display_order, p.title`;

    const projectIds = projects.map((p) => p.id);
    const tagsByProject = new Map<number, string[]>();
    const imagesByProject = new Map<number, string[]>();

    if (projectIds.length > 0) {
      const [tagRows, imageRows] = await Promise.all([
        sql`
          SELECT project_id, tag FROM project_tags
          WHERE project_id = ANY(${projectIds})
        `,
        sql`
          SELECT id, project_id, image_url FROM project_images
          WHERE project_id = ANY(${projectIds})
          ORDER BY project_id, position
        `,
      ]);

      for (const row of tagRows) {
        const pid = row.project_id as number;
        const list = tagsByProject.get(pid) ?? [];
        list.push(row.tag as string);
        tagsByProject.set(pid, list);
      }

      for (const row of imageRows) {
        const pid = row.project_id as number;
        const list = imagesByProject.get(pid) ?? [];
        const url = (row.image_url as string | null) ?? `/api/images/${row.id}`;
        list.push(url);
        imagesByProject.set(pid, list);
      }
    }

    const projectsWithDetails = projects.map((project) => {
      const coverImageUrl =
        project.cover_image_url ??
        (project.has_cover ? `/api/cover-image/${project.id}` : undefined);

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        color: project.color,
        category: {
          id: project.category_id,
          name: project.category_name,
        },
        githubUrl: project.github_url,
        demoUrl: project.demo_url,
        tags: tagsByProject.get(project.id) ?? [],
        images: imagesByProject.get(project.id) ?? [],
        coverImage: coverImageUrl,
        createdAt: new Date().toISOString(),
      };
    });

    return projectsWithDetails as Project[];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects');
  }
}

export const getProjects = unstable_cache(loadProjects, ['projects'], {
  revalidate: PORTFOLIO_CACHE_REVALIDATE_SECONDS,
  tags: [CACHE_TAG_PORTFOLIO],
});

// Add project action
export async function addProject(formData: {
  title: string;
  description: string;
  color: string;
  categoryId: number;
  tags: string[];
  images: { data: ArrayBuffer; type: string }[];
  githubUrl?: string;
  demoUrl?: string;
  coverImage?: { data: ArrayBuffer; type: string };
}) {
  try {
    const sql = getNeonClient();
    const { title, description, color, categoryId, tags, images, githubUrl, demoUrl, coverImage } =
      formData;

    // Upload cover image to Vercel Blob
    let coverBlobUrl: string | null = null;
    if (coverImage) {
      const ext = coverImage.type.split('/')[1] ?? 'jpg';
      const { url } = await put(
        `projects/cover-${Date.now()}.${ext}`,
        Buffer.from(coverImage.data),
        { access: 'public', contentType: coverImage.type }
      );
      coverBlobUrl = url;
    }

    // Insert the project
    const insertedProject = await sql`
      INSERT INTO projects (
        title, description, color, category_id, github_url, demo_url,
        cover_image_url
      ) 
      VALUES (
        ${title}, ${description}, ${color}, ${categoryId}, 
        ${githubUrl || null}, ${demoUrl || null},
        ${coverBlobUrl}
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

    // Upload and insert each image to Vercel Blob
    for (let i = 0; i < images.length; i++) {
      const { data, type } = images[i];
      const ext = type.split('/')[1] ?? 'jpg';
      const { url } = await put(
        `projects/${projectId}/img-${i}-${Date.now()}.${ext}`,
        Buffer.from(data),
        { access: 'public', contentType: type }
      );
      await sql`
        INSERT INTO project_images (project_id, image_url, image_type, position)
        VALUES (${projectId}, ${url}, ${type}, ${i})
      `;
    }

    // Revalidate the projects page to show the new project
    revalidatePath('/projects');
    revalidatePath('/');
    bumpPortfolioCache();

    return { success: true };
  } catch (error) {
    console.error('Error adding project:', error);
    return { success: false, error: 'Failed to add project' };
  }
}

// Contact info actions
async function loadContactInfo() {
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

export const getContactInfo = unstable_cache(loadContactInfo, ['contact-info'], {
  revalidate: PORTFOLIO_CACHE_REVALIDATE_SECONDS,
  tags: [CACHE_TAG_PORTFOLIO],
});

// Seed database with initial data
export async function seedDatabase(reset = false) {
  try {
    const sql = getNeonClient();

    if (reset) {
      // Clear existing tables
      await sql`DROP TABLE IF EXISTS project_images CASCADE`;
      await sql`DROP TABLE IF EXISTS project_tags CASCADE`;
      await sql`DROP TABLE IF EXISTS projects CASCADE`;
      await sql`DROP TABLE IF EXISTS categories CASCADE`;
      await sql`DROP TABLE IF EXISTS skills CASCADE`;
      await sql`DROP TABLE IF EXISTS about_content CASCADE`;
      await sql`DROP TABLE IF EXISTS contact_info CASCADE`;
      await sql`DROP TABLE IF EXISTS social_links CASCADE`;
      await sql`DROP TABLE IF EXISTS resume CASCADE`;
    }

    // Create categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        display_order INT NOT NULL DEFAULT 0
      )
    `;

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
        category_id INT NOT NULL,
        github_url TEXT,
        demo_url TEXT,
        cover_image BYTEA,
        cover_image_type VARCHAR(50),
        FOREIGN KEY (category_id) REFERENCES categories(id)
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
        image_url TEXT,
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

    // Insert default categories
    await sql`
      INSERT INTO categories (name, display_order)
      VALUES 
        ('web', 0),
        ('mobile', 1),
      ON CONFLICT (name) DO NOTHING
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

    // Insert projects if they don't exist
    if (parseInt(projectCount[0].count) === 0) {
      // Get category IDs
      const categoryMobile = await sql`SELECT id FROM categories WHERE name = 'mobile'`;
      const mobileId = categoryMobile[0]?.id || 1;

      // Projects data
      const projects = [
        {
          title: 'E-commerce Mobile App',
          description:
            'A native mobile shopping platform with personalized recommendations and AR try-on features.',
          color: 'blue',
          categoryId: mobileId,
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
          INSERT INTO projects (title, description, color, category_id, github_url, demo_url) 
          VALUES (${project.title}, ${project.description}, ${project.color}, ${
          project.categoryId
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

        // Fetch and upload each image to Vercel Blob
        for (let i = 0; i < project.images.length; i++) {
          const imageBuffer = await getImageBufferFromUrl(project.images[i]);
          if (imageBuffer) {
            const ext = imageBuffer.type.split('/')[1] ?? 'jpg';
            const { url: imageUrl } = await put(
              `projects/${projectId}/image-${i}.${ext}`,
              Buffer.from(imageBuffer.data),
              { access: 'public', contentType: imageBuffer.type }
            );
            await sql`
              INSERT INTO project_images (project_id, image_url, image_type, position)
              VALUES (${projectId}, ${imageUrl}, ${imageBuffer.type}, ${i})
            `;
          }
        }
      }
    }

    // Revalidate all paths to reflect the new data
    revalidatePath('/');
    bumpPortfolioCache();

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
      SELECT image_url, image_type 
      FROM project_images 
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return null;
    }

    return {
      url: result[0].image_url as string,
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
      SELECT cover_image_url, cover_image_type 
      FROM projects 
      WHERE id = ${projectId}
        AND cover_image_url IS NOT NULL
    `;

    if (result.length === 0) {
      return null;
    }

    return {
      url: result[0].cover_image_url as string,
      type: result[0].cover_image_type,
    };
  } catch (error) {
    console.error('Error fetching cover image:', error);
    return null;
  }
}

// Get all categories with ordering
async function loadCategories() {
  try {
    const sql = getNeonClient();

    // Create the categories table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        display_order INT NOT NULL DEFAULT 0
      )
    `;

    // Ensure we have at least one default category
    await sql`
      INSERT INTO categories (name, display_order)
      VALUES ('web', 0), ('mobile', 1)
      ON CONFLICT (name) DO NOTHING
    `;

    // Get all categories ordered by display_order
    const result = await sql`
      SELECT id, name, display_order FROM categories ORDER BY display_order, name
    `;

    return result as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return default categories as fallback
    return [
      { id: 0, name: 'web', display_order: 0 },
      { id: 0, name: 'mobile', display_order: 1 },
      { id: 0, name: 'mobile', display_order: 1 },
    ];
  }
}

export const getCategories = unstable_cache(loadCategories, ['categories'], {
  revalidate: PORTFOLIO_CACHE_REVALIDATE_SECONDS,
  tags: [CACHE_TAG_PORTFOLIO],
});

// Add a new category
export async function addCategory(categoryData: {
  name: string;
  displayOrder?: number;
}): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const sql = getNeonClient();
    const { name, displayOrder = 0 } = categoryData;

    // Validate input
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'Category name cannot be empty' };
    }

    if (name.length > 50) {
      return { success: false, error: 'Category name cannot exceed 50 characters' };
    }

    // Add the new category
    const result = await sql`
      INSERT INTO categories (name, display_order)
      VALUES (${name.toLowerCase()}, ${displayOrder})
      RETURNING id
    `;

    // Revalidate paths that display categories
    revalidatePath('/projects');
    revalidatePath('/admin');
    bumpPortfolioCache();

    return { success: true, id: result[0].id };
  } catch (error) {
    console.error('Error adding category:', error);
    return { success: false, error: 'Failed to add category' };
  }
}

// Update category
export async function updateCategory(
  id: number,
  categoryData: {
    name?: string;
    displayOrder?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const sql = getNeonClient();
    const { name, displayOrder } = categoryData;

    if (name) {
      // Update name if provided
      await sql`
        UPDATE categories
        SET name = ${name.toLowerCase()}
        WHERE id = ${id}
      `;
    }

    if (displayOrder !== undefined) {
      // Update display order if provided
      await sql`
        UPDATE categories
        SET display_order = ${displayOrder}
        WHERE id = ${id}
      `;
    }

    // Revalidate paths that display categories
    revalidatePath('/projects');
    revalidatePath('/admin');
    bumpPortfolioCache();

    return { success: true };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, error: 'Failed to update category' };
  }
}

// Delete category
export async function deleteCategory(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const sql = getNeonClient();

    // Check if category is in use
    const projectsUsingCategory = await sql`
      SELECT COUNT(*) FROM projects WHERE category_id = ${id}
    `;

    if (parseInt(projectsUsingCategory[0].count) > 0) {
      return {
        success: false,
        error: 'Cannot delete category that is being used by projects. Reassign projects first.',
      };
    }

    // Delete the category
    await sql`DELETE FROM categories WHERE id = ${id}`;

    // Revalidate paths that display categories
    revalidatePath('/projects');
    revalidatePath('/admin');
    bumpPortfolioCache();

    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: 'Failed to delete category' };
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
    bumpPortfolioCache();

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
    bumpPortfolioCache();

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
    bumpPortfolioCache();

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
    bumpPortfolioCache();

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
      // Invalidate experience cache — new URL will trigger a re-parse on next visit
      await sql`DELETE FROM resume_experience_cache WHERE resume_url != ${resumeUrl}`;
    }

    // Revalidate paths that display contact info
    revalidatePath('/');
    bumpPortfolioCache();

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

    const projects = await sql`
      SELECT p.*, c.name as category_name 
      FROM projects p
      JOIN categories c ON p.category_id = c.id
    `;

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
          category: {
            id: project.category_id,
            name: project.category_name,
          },
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
    bumpPortfolioCache();

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

// Update a project - modified for category_id
export async function updateProject(
  id: number,
  formData: {
    title: string;
    description: string;
    color: string;
    categoryId: number;
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
      categoryId,
      tags,
      githubUrl,
      demoUrl,
      removedImageIds,
      newImages,
      coverImage,
    } = formData;

    // Handle cover image updates with a simple if/else
    if (coverImage === null) {
      // Case 1: Remove cover image — delete blob asset if present
      const oldCover = await sql`SELECT cover_image_url FROM projects WHERE id = ${id}`;
      if (oldCover[0]?.cover_image_url)
        await del(oldCover[0].cover_image_url).catch(() => undefined);
      await sql`
        UPDATE projects 
        SET 
          title = ${title}, 
          description = ${description}, 
          color = ${color}, 
          category_id = ${categoryId},
          github_url = ${githubUrl || null},
          demo_url = ${demoUrl || null},
          cover_image_url = NULL
        WHERE id = ${id}
      `;
    } else if (coverImage) {
      // Case 2: New cover image — upload to Blob, delete old blob asset
      const oldCover = await sql`SELECT cover_image_url FROM projects WHERE id = ${id}`;
      if (oldCover[0]?.cover_image_url)
        await del(oldCover[0].cover_image_url).catch(() => undefined);
      const ext = coverImage.type.split('/')[1] ?? 'jpg';
      const { url: newCoverUrl } = await put(
        `projects/cover-${id}-${Date.now()}.${ext}`,
        Buffer.from(coverImage.data),
        { access: 'public', contentType: coverImage.type }
      );
      await sql`
        UPDATE projects 
        SET 
          title = ${title}, 
          description = ${description}, 
          color = ${color}, 
          category_id = ${categoryId},
          github_url = ${githubUrl || null},
          demo_url = ${demoUrl || null},
          cover_image_url = ${newCoverUrl}
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
          category_id = ${categoryId},
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
        const blobRow = await sql`SELECT image_url FROM project_images WHERE id = ${imageId}`;
        if (blobRow[0]?.image_url) await del(blobRow[0].image_url).catch(() => undefined);
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

      // Upload each new image to Vercel Blob
      for (const { data, type } of newImages) {
        const ext = type.split('/')[1] ?? 'jpg';
        const { url: imgUrl } = await put(
          `projects/${id}/img-${position}-${Date.now()}.${ext}`,
          Buffer.from(data),
          { access: 'public', contentType: type }
        );
        await sql`
          INSERT INTO project_images (project_id, image_url, image_type, position)
          VALUES (${id}, ${imgUrl}, ${type}, ${position})
        `;
        position++;
      }
    }

    // Revalidate paths that display projects
    revalidatePath('/projects');
    revalidatePath('/');
    bumpPortfolioCache();

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

// ─────────────────────────────────────────────────────────────
// Experience actions – parse resume PDF and extract experience
// ─────────────────────────────────────────────────────────────

export interface ExperienceEntry {
  company: string;
  title: string;
  period: string;
  description: string[];
}

/**
 * Parses the raw text of a PDF resume and extracts the work experience section.
 *
 * Expected job-entry line format (matching the actual resume):
 *   Title, Company  MM/YYYY – MM/YYYY | Location
 *
 * The first comma splits title from company; the date range anchors the line.
 * Bullet-point descriptions follow on subsequent lines until the next entry.
 *
 * Also handles word-month formats ("Jan 2020 – Present") for other resumes.
 */
function extractExperienceFromText(rawText: string): ExperienceEntry[] {
  const lines = rawText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Locate the experience section header.
  // Matches: "WORK EXPERIENCE", "Work Experience", "Experience", "Work History", etc.
  const expHeaderRe = /^(professional\s+|work\s+|employment\s+)?(experience(s)?|history)$/i;
  const endSectionRe =
    /^(education|skills?|certifications?|projects?|awards?|publications?|volunteer|references|interests?|languages?|summary|profile|objective|activities|accomplishments|organizations?)/i;

  const headerIdx = lines.findIndex((l) => expHeaderRe.test(l));
  if (headerIdx === -1) return [];

  let endIdx = lines.length;
  for (let i = headerIdx + 1; i < lines.length; i++) {
    if (endSectionRe.test(lines[i]) && lines[i].length < 50) {
      endIdx = i;
      break;
    }
  }

  const expLines = lines.slice(headerIdx + 1, endIdx);

  // Date-range patterns:
  //   Primary  – "MM/YYYY – MM/YYYY" or "MM/YYYY – Present"  (this resume)
  //   Fallback – "Jan 2020 – Present", "2019 – 2022"          (other resumes)
  const MONTH =
    'Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?';
  const dateRangeRe = new RegExp(
    // MM/YYYY – MM/YYYY  or  MM/YYYY – Present
    `\\d{1,2}\\/\\d{4}\\s*[-–—]\\s*(?:\\d{1,2}\\/\\d{4}|Present|Current)` +
      // word-month year – word-month year / present
      `|(?:(?:${MONTH})\\s+)?\\d{4}\\s*[-–—]\\s*(?:(?:${MONTH})\\s+)?\\d{4}` +
      `|(?:${MONTH})\\s+\\d{4}\\s*[-–—]\\s*(?:Present|Current)`,
    'i'
  );

  const entries: ExperienceEntry[] = [];

  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i];
    const dateMatch = line.match(dateRangeRe);
    if (!dateMatch) continue;

    const period = dateMatch[0];

    // Text before the date on this line: "Title, Company  " or "Title, Company"
    const beforeDate = line
      .substring(0, dateMatch.index)
      .trim()
      // Remove any trailing location separator "| City" that snuck in
      .replace(/\s*\|.*$/, '')
      .trim();

    // Split at the FIRST comma: title = part[0], company = rest
    const commaIdx = beforeDate.indexOf(',');
    let title = '';
    let company = '';
    if (commaIdx !== -1) {
      title = beforeDate.substring(0, commaIdx).trim();
      company = beforeDate.substring(commaIdx + 1).trim();
    } else {
      // No comma found – treat whole string as company
      company = beforeDate;
    }

    // Collect description lines that follow this entry line (until next date line)
    const descLines: string[] = [];
    let j = i + 1;
    while (j < expLines.length) {
      if (dateRangeRe.test(expLines[j])) break;
      const cleaned = expLines[j].replace(/^[•·*>-]\s*/, '');
      if (cleaned) descLines.push(cleaned);
      j++;
    }

    if (company || title) {
      entries.push({
        company: company || title,
        title: company ? title : '',
        period,
        description: descLines.slice(0, 5),
      });
    }
  }

  return entries;
}

/**
 * Fetches the resume URL from the database, downloads the PDF,
 * parses it with pdf-parse, and returns structured experience entries.
 *
 * Results are cached in `resume_experience_cache` keyed by resume URL.
 * Re-parsing only happens when the resume URL changes.
 */
async function loadExperienceFromResume(): Promise<ExperienceEntry[]> {
  try {
    const sql = getNeonClient();

    // Ensure cache table exists
    await sql`
      CREATE TABLE IF NOT EXISTS resume_experience_cache (
        id         SERIAL PRIMARY KEY,
        resume_url TEXT NOT NULL UNIQUE,
        entries    JSONB NOT NULL,
        cached_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    const resumeRows = await sql`SELECT url FROM resume ORDER BY updated_at DESC LIMIT 1`;
    if (resumeRows.length === 0) return [];

    const resumeUrl: string = resumeRows[0].url;

    // Return cached entries if the URL hasn't changed
    const cached = await sql`
      SELECT entries FROM resume_experience_cache
      WHERE resume_url = ${resumeUrl}
      LIMIT 1
    `;
    if (cached.length > 0) {
      return cached[0].entries as ExperienceEntry[];
    }

    const normalizeResumeUrl = (url: string): string => {
      try {
        const parsed = new URL(url);
        const isGoogleDriveHost =
          parsed.hostname === 'drive.google.com' || parsed.hostname === 'docs.google.com';
        if (!isGoogleDriveHost) return url;

        const pathFileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
        const queryFileId = parsed.searchParams.get('id');
        const fileId = pathFileMatch?.[1] ?? queryFileId;

        if (!fileId) return url;
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
      } catch {
        return url;
      }
    };

    let pdfBuffer: Buffer;
    let resumeContentType: string | null = null;

    if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) {
      // External URL
      const normalizedResumeUrl = normalizeResumeUrl(resumeUrl);
      const res = await fetch(normalizedResumeUrl);
      if (!res.ok) return [];
      resumeContentType = res.headers.get('content-type');
      const arrayBuf = await res.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuf);
    } else {
      // Local file in the public directory
      const { readFile } = await import('fs/promises');
      const { join } = await import('path');
      const filePath = join(process.cwd(), 'public', resumeUrl.replace(/^\//, ''));
      pdfBuffer = await readFile(filePath);
    }

    const headerChunk = pdfBuffer.subarray(0, 1024).toString('latin1');
    const hasPdfHeader = headerChunk.includes('%PDF-');
    const hasPdfContentType = resumeContentType?.toLowerCase().includes('pdf') ?? false;
    if (!hasPdfHeader && !hasPdfContentType) {
      console.warn('Resume URL does not point to a valid PDF file:', resumeUrl);
      return [];
    }

    const pdfParseModule = (await import('pdf-parse')) as unknown as {
      PDFParse?: new (options: { data: Buffer }) => {
        getText: () => Promise<{ text: string }>;
        destroy?: () => Promise<void>;
      };
      default?: unknown;
    };

    if (pdfParseModule.PDFParse) {
      const parser = new pdfParseModule.PDFParse({ data: pdfBuffer });
      const pdfData = await parser.getText();
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
      const entries = extractExperienceFromText(pdfData.text);
      await sql`
        INSERT INTO resume_experience_cache (resume_url, entries)
        VALUES (${resumeUrl}, ${JSON.stringify(entries)}::jsonb)
        ON CONFLICT (resume_url) DO UPDATE SET entries = EXCLUDED.entries, cached_at = NOW()
      `;
      return entries;
    }

    const legacyPdfParse =
      typeof pdfParseModule.default === 'function'
        ? (pdfParseModule.default as (buf: Buffer) => Promise<{ text: string }>)
        : undefined;
    if (typeof legacyPdfParse === 'function') {
      const pdfData = await legacyPdfParse(pdfBuffer);
      const entries = extractExperienceFromText(pdfData.text);
      await sql`
        INSERT INTO resume_experience_cache (resume_url, entries)
        VALUES (${resumeUrl}, ${JSON.stringify(entries)}::jsonb)
        ON CONFLICT (resume_url) DO UPDATE SET entries = EXCLUDED.entries, cached_at = NOW()
      `;
      return entries;
    }

    throw new Error('Unsupported pdf-parse module export format');
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === 'InvalidPDFException' || /invalid pdf structure/i.test(error.message))
    ) {
      console.warn('Resume file is not a valid PDF structure, skipping extraction.');
      return [];
    }

    console.error('Error extracting experience from resume:', error);
    return [];
  }
}

export const getExperienceFromResume = unstable_cache(
  loadExperienceFromResume,
  ['experience-from-resume'],
  {
    revalidate: PORTFOLIO_CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_TAG_PORTFOLIO],
  }
);

/**
 * Clears the experience cache so the resume is fully re-parsed on the next visit.
 * Useful from the admin dashboard after replacing a resume at the same URL.
 */
export async function clearExperienceCache(): Promise<{ success: boolean; error?: string }> {
  try {
    const sql = getNeonClient();
    await sql`DELETE FROM resume_experience_cache`;
    revalidatePath('/');
    bumpPortfolioCache();
    return { success: true };
  } catch (error) {
    console.error('Error clearing experience cache:', error);
    return { success: false, error: 'Failed to clear experience cache' };
  }
}

// Blog posts actions
async function loadBlogPosts() {
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

    // Listing only — omit `content` so unstable_cache stays under Next.js 2MB limit
    const posts = await sql`
      SELECT id, title, slug, excerpt, published_at, updated_at, published
      FROM blog_posts 
      WHERE published = true 
      ORDER BY published_at DESC
    `;

    const postIds = posts.map((p) => p.id as number);
    const tagsByPost = new Map<number, string[]>();

    if (postIds.length > 0) {
      const tagRows = await sql`
        SELECT post_id, tag FROM blog_tags
        WHERE post_id = ANY(${postIds})
      `;
      for (const row of tagRows) {
        const pid = row.post_id as number;
        const list = tagsByPost.get(pid) ?? [];
        list.push(row.tag as string);
        tagsByPost.set(pid, list);
      }
    }

    const postsWithTags = posts.map((post) => ({
      ...post,
      content: '',
      tags: tagsByPost.get(post.id as number) ?? [],
    }));

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

export const getBlogPosts = unstable_cache(loadBlogPosts, ['blog-posts'], {
  revalidate: PORTFOLIO_CACHE_REVALIDATE_SECONDS,
  tags: [CACHE_TAG_PORTFOLIO],
});

// Get a single blog post by slug
export async function getBlogPostBySlug(slug: string) {
  return unstable_cache(
    async () => {
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
    },
    ['blog-post-by-slug', slug],
    {
      revalidate: PORTFOLIO_CACHE_REVALIDATE_SECONDS,
      tags: [CACHE_TAG_PORTFOLIO],
    }
  )();
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
    bumpPortfolioCache();

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
    bumpPortfolioCache();

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
    bumpPortfolioCache();

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
