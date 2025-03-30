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

    const projects = await sql`SELECT * FROM projects`;

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

        return {
          ...project,
          tags: tags.map((tagItem) => tagItem.tag),
          images: imageUrls,
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
}) {
  try {
    const sql = getNeonClient();
    const { title, description, color, category, tags, images, githubUrl, demoUrl } = formData;

    // Insert the project with the new fields
    const insertedProject = await sql`
      INSERT INTO projects (title, description, color, category, github_url, demo_url) 
      VALUES (${title}, ${description}, ${color}, ${category}, ${githubUrl || null}, ${
      demoUrl || null
    })
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
        {
          word: 'TypeScript',
          description:
            'Developing type-safe applications with TypeScript to catch errors early and improve code quality.',
        },
        {
          word: 'Next.js',
          description:
            'Creating server-side rendered and statically generated web applications with Next.js for optimal performance and SEO.',
        },
        {
          word: 'TailwindCSS',
          description:
            'Utilizing TailwindCSS for rapid UI development with utility-first CSS, ensuring responsive and modern designs.',
        },
        {
          word: 'React Native',
          description:
            'Building mobile applications with React Native, leveraging cross-platform development tools to create smooth user experiences.',
        },
        {
          word: 'JavaScript',
          description:
            'Proficient in JavaScript for both frontend and backend development, creating dynamic and interactive web applications.',
        },
        {
          word: 'Node.js',
          description:
            'Building scalable and efficient server-side applications with Node.js and its ecosystem.',
        },
        {
          word: 'Express.js',
          description:
            'Using Express.js to build fast and minimalistic web applications with Node.js.',
        },
        {
          word: 'GraphQL',
          description:
            'Developing efficient APIs with GraphQL, providing flexible and precise data retrieval.',
        },
        {
          word: 'RESTful APIs',
          description:
            'Designing and consuming RESTful APIs for reliable and scalable web communication.',
        },
        {
          word: 'Version Control (Git)',
          description:
            'Proficient in using Git for version control, enabling smooth collaboration and tracking of changes in development projects.',
        },
        {
          word: 'CI/CD',
          description:
            'Setting up continuous integration and deployment pipelines to automate testing, building, and deploying applications.',
        },
        {
          word: 'Docker',
          description:
            'Containerizing applications with Docker to ensure consistency across different environments and simplify deployments.',
        },
        {
          word: 'AWS',
          description:
            'Utilizing AWS services (like S3, Lambda, EC2) for scalable cloud infrastructure and application hosting.',
        },
        {
          word: 'Firebase',
          description:
            'Leveraging Firebase for real-time databases, user authentication, and app deployment.',
        },
        {
          word: 'Jest',
          description:
            'Writing unit and integration tests with Jest to ensure the reliability and correctness of code.',
        },
        {
          word: 'Testing Libraries',
          description:
            'Using testing libraries like React Testing Library and Cypress to write tests and ensure a bug-free user experience.',
        },
        {
          word: 'UI/UX Design',
          description:
            'Creating intuitive user interfaces and user experiences through wireframing, prototyping, and user testing.',
        },
        {
          word: 'Figma',
          description:
            'Designing high-fidelity user interfaces and prototypes with Figma, ensuring collaboration and smooth handoff to developers.',
        },
        {
          word: 'Adobe XD',
          description:
            'Creating and prototyping interactive designs using Adobe XD for a seamless design-to-development process.',
        },
        {
          word: 'Sociology & Design',
          description:
            'Understanding the intersection of social behavior and design principles to craft digital solutions that resonate with users.',
        },
        {
          word: 'Communication',
          description:
            'Clear and engaging communication, both written and verbal, to articulate complex ideas and connect with diverse audiences.',
        },
        {
          word: 'Problem-Solving',
          description:
            'Analytical thinking and a solution-oriented approach to tackle technical and creative challenges efficiently.',
        },
        {
          word: 'Project Management',
          description:
            'Managing and coordinating projects, ensuring timely delivery and alignment with goals and priorities.',
        },
        {
          word: 'Leadership & Collaboration',
          description:
            'Leading teams, managing projects, and collaborating effectively with diverse groups to achieve common goals.',
        },
        {
          word: 'Networking',
          description:
            'Building and maintaining professional relationships with industry peers to foster collaboration and growth.',
        },
        {
          word: 'Adaptability',
          description:
            'Quickly adapting to new tools, technologies, and environments, ensuring continuous growth and learning.',
        },
        {
          word: 'Creativity',
          description:
            'Bringing fresh, innovative ideas to the table to solve problems and enhance user experiences.',
        },
        {
          word: 'Customer Focus',
          description:
            'Prioritizing the needs and satisfaction of customers to build products that users love.',
        },
        {
          word: 'Public Speaking',
          description:
            'Confidently presenting ideas and projects to diverse audiences, ensuring clear communication and engagement.',
        },
        {
          word: 'Networking & Relationship Building',
          description:
            'Proactively building and maintaining professional relationships for career growth and collaboration opportunities.',
        },
        {
          word: 'Teamwork',
          description:
            'Collaborating effectively with cross-functional teams to achieve shared goals and deliver successful outcomes.',
        },
        {
          word: 'Time Management',
          description:
            'Efficiently managing time and resources to meet deadlines and ensure productivity in fast-paced environments.',
        },
        {
          word: 'Emotional Intelligence',
          description:
            'Demonstrating empathy, self-awareness, and interpersonal skills to build strong relationships and foster a positive environment.',
        },
        {
          word: 'Sales & Negotiation',
          description:
            'Skilled in understanding customer needs, presenting solutions, and negotiating effectively to achieve win-win outcomes.',
        },
        {
          word: 'Marketing',
          description:
            'Understanding the basics of digital marketing to promote products and services and drive engagement.',
        },
        {
          word: 'Customer Support',
          description:
            'Providing excellent customer service by addressing issues, solving problems, and ensuring user satisfaction.',
        },
        {
          word: 'Emotional Resilience',
          description:
            'Maintaining composure and focus under pressure, demonstrating a positive attitude in challenging situations.',
        },
        {
          word: 'Mentorship',
          description:
            'Guiding and supporting others in their professional and personal development, sharing knowledge and expertise.',
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
        {
          title: 'Fitness Tracker',
          description:
            'Health monitoring app with workout plans, progress tracking, and social features.',
          color: 'green',
          category: 'mobile',
          tags: ['Flutter', 'GraphQL', 'TypeScript'],
          images: [
            'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800&auto=format',
            'https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=800&auto=format',
          ],
          githubUrl: 'https://github.com/example/fitness-tracker',
          demoUrl: 'https://example-fitness.com',
        },
        {
          title: 'AR Navigation',
          description: 'Augmented reality navigation system for indoor and outdoor directions.',
          color: 'purple',
          category: 'mobile',
          tags: ['Swift', 'ARKit', 'CoreLocation'],
          images: [
            'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format',
            'https://images.unsplash.com/photo-1581372041527-9c7f1e3285cb?q=80&w=800&auto=format',
            'https://images.unsplash.com/photo-1565396435901-8f5d247028b3?q=80&w=800&auto=format',
          ],
          githubUrl: 'https://github.com/example/ar-navigation',
          demoUrl: 'https://example-ar.com',
        },
        {
          title: 'Portfolio Dashboard',
          description: 'Interactive web dashboard for displaying and managing creative portfolios.',
          color: 'yellow',
          category: 'web',
          tags: ['React', 'Next.js', 'TailwindCSS'],
          images: [
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format',
            'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=800&auto=format',
          ],
          githubUrl: 'https://github.com/example/portfolio-dashboard',
          demoUrl: 'https://example-portfolio.com',
        },
        {
          title: 'E-learning Platform',
          description:
            'Comprehensive web platform for online courses with interactive learning tools.',
          color: 'red',
          category: 'web',
          tags: ['Vue.js', 'Firebase', 'Node.js'],
          images: [
            'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800&auto=format',
            'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800&auto=format',
          ],
          githubUrl: 'https://github.com/example/e-learning-platform',
          demoUrl: 'https://example-elearning.com',
        },
        {
          title: 'Project Management Tool',
          description:
            'Collaborative workspace for teams with task management and analytics features.',
          color: 'teal',
          category: 'web',
          tags: ['React', 'GraphQL', 'MongoDB'],
          images: [
            'https://images.unsplash.com/photo-1572025442646-866d16c84a54?q=80&w=800&auto=format',
            'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format',
          ],
          githubUrl: 'https://github.com/example/project-management-tool',
          demoUrl: 'https://example-pm.com',
        },
        {
          title: 'Blockchain Explorer',
          description:
            'Tool for visualizing and analyzing blockchain transactions and smart contracts.',
          color: 'orange',
          category: 'misc',
          tags: ['TypeScript', 'Ethers.js', 'D3.js'],
          images: [
            'https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=800&auto=format',
            'https://images.unsplash.com/photo-1639322537231-2f206e06af84?q=80&w=800&auto=format',
          ],
          githubUrl: 'https://github.com/example/blockchain-explorer',
          demoUrl: 'https://example-blockchain.com',
        },
        {
          title: 'AI Content Generator',
          description:
            'Machine learning tool that creates personalized content for marketing campaigns.',
          color: 'pink',
          category: 'misc',
          tags: ['Python', 'TensorFlow', 'React'],
          images: [
            'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format',
            'https://images.unsplash.com/photo-1655720033654-a4239dd42d10?q=80&w=800&auto=format',
          ],
          githubUrl: 'https://github.com/example/ai-content-generator',
          demoUrl: 'https://example-ai.com',
        },
        {
          title: 'IoT Home Controller',
          description:
            'System that connects and manages smart home devices through a single interface.',
          color: 'indigo',
          category: 'misc',
          tags: ['Node.js', 'MQTT', 'React Native'],
          images: [
            'https://images.unsplash.com/photo-1558703224-d106f5929c72?q=80&w=800&auto=format',
            'https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=800&auto=format',
            'https://images.unsplash.com/photo-1563796442737-3501301632ee?q=80&w=800&auto=format',
          ],
          githubUrl: 'https://github.com/example/iot-home-controller',
          demoUrl: 'https://example-iot.com',
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

// Update a project
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
    // We handle images separately to avoid loading huge amounts of data
    removedImageIds?: number[];
    newImages?: { data: ArrayBuffer; type: string }[];
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
    } = formData;

    // Update the project details
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
