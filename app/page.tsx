import AboutSection from "@/components/AboutSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectsSection from "@/components/ProjectsSection";
import ContactSection from "@/components/ContactSection";
import { Skill } from "@/components/SkillsSection";

import HeroSection from "./HeroSection";
import FloatingModel3D from "@/components/FloatingModel3D";
import { Github, Linkedin, Twitter } from "lucide-react";
import { formatPhone } from "./utils";
import { Project } from "@/types/project";

export default function Home() {
  // Skills data
  const skills: Skill[] = [
    {
      word: "React",
      desc: "Building interactive UIs with React and its ecosystem, including React hooks, context API, and state management solutions. Building interactive UIs with React and its ecosystem, including React hooks, context API, and state management solutions. Building interactive UIs with React and its ecosystem, including React hooks, context API, and state management solutions.Building interactive UIs with React and its ecosystem, including React hooks, context API, and state management solutions.",
    },
    {
      word: "TypeScript",
      desc: "Developing type-safe applications with TypeScript to catch errors early and improve code quality.",
    },
    {
      word: "Next.js",
      desc: "Creating server-side rendered and statically generated web applications with Next.js for optimal performance and SEO.",
    },
    {
      word: "Node.js",
      desc: "Building scalable backend services and APIs using Node.js and Express.",
    },
    {
      word: "TailwindCSS",
      desc: "Crafting responsive and beautiful user interfaces with utility-first CSS framework.",
    },
    {
      word: "GraphQL",
      desc: "Implementing efficient data fetching with GraphQL to reduce over-fetching and under-fetching.",
    },
    {
      word: "Redux",
      desc: "Managing complex application states effectively with Redux and Redux Toolkit.",
    },
    {
      word: "React Native",
      desc: "Building cross-platform mobile applications with React Native and Expo.",
    },
    {
      word: "Vue.js",
      desc: "Creating progressive web applications using Vue.js and its ecosystem.",
    },
    {
      word: "Svelte",
      desc: "Developing high-performance web applications with Svelte and SvelteKit.",
    },
    {
      word: "Firebase",
      desc: "Utilizing Firebase for real-time databases, authentication, and cloud functions.",
    },
    {
      word: "MongoDB",
      desc: "Managing NoSQL databases with MongoDB and Mongoose for scalable data storage.",
    },
    {
      word: "PostgreSQL",
      desc: "Designing relational databases with PostgreSQL and optimizing queries for performance.",
    },
    {
      word: "MySQL",
      desc: "Working with MySQL for structured data storage and efficient querying.",
    },
    {
      word: "Prisma",
      desc: "Using Prisma ORM to interact with databases in a type-safe manner.",
    },
    {
      word: "Docker",
      desc: "Containerizing applications with Docker for easy deployment and scalability.",
    },
    {
      word: "Kubernetes",
      desc: "Orchestrating containerized applications using Kubernetes.",
    },
    {
      word: "Jest",
      desc: "Writing unit and integration tests with Jest for reliable applications.",
    },
    {
      word: "Cypress",
      desc: "Automating end-to-end testing using Cypress for web applications.",
    },
    {
      word: "Git",
      desc: "Version control and collaboration using Git and GitHub/GitLab.",
    },
    {
      word: "WebSockets",
      desc: "Implementing real-time communication with WebSockets and Socket.io.",
    },
    {
      word: "REST API",
      desc: "Designing and consuming RESTful APIs for web and mobile applications.",
    },
    {
      word: "CI/CD",
      desc: "Automating build, test, and deployment processes with CI/CD pipelines.",
    },
    {
      word: "Vercel",
      desc: "Deploying serverless applications effortlessly with Vercel.",
    },
    {
      word: "Netlify",
      desc: "Hosting JAMstack applications on Netlify with seamless CI/CD integration.",
    },
    {
      word: "AWS",
      desc: "Utilizing AWS services like S3, Lambda, and DynamoDB for cloud computing.",
    },
    {
      word: "Azure",
      desc: "Developing and deploying applications on Microsoft Azure.",
    },
    {
      word: "Google Cloud",
      desc: "Leveraging Google Cloud services for scalable infrastructure solutions.",
    },
    {
      word: "WebRTC",
      desc: "Building real-time video and voice communication applications with WebRTC.",
    },
    {
      word: "Three.js",
      desc: "Creating 3D visualizations and interactive web experiences with Three.js.",
    },
    {
      word: "D3.js",
      desc: "Developing interactive data visualizations using D3.js.",
    },
    {
      word: "Framer Motion",
      desc: "Animating UI components seamlessly with Framer Motion.",
    },
    {
      word: "Zustand",
      desc: "Managing lightweight and scalable state in React applications with Zustand.",
    },
    {
      word: "Recoil",
      desc: "Simplifying state management in React applications with Recoil.",
    },
    {
      word: "tRPC",
      desc: "Building end-to-end type-safe APIs using tRPC and TypeScript.",
    },
    {
      word: "Apollo Client",
      desc: "Managing GraphQL queries efficiently with Apollo Client.",
    },
    {
      word: "Ethers.js",
      desc: "Interacting with blockchain networks using Ethers.js for Web3 development.",
    },
    {
      word: "Hardhat",
      desc: "Developing and testing Ethereum smart contracts using Hardhat.",
    },
    {
      word: "Solidity",
      desc: "Writing smart contracts for Ethereum blockchain using Solidity.",
    },
    {
      word: "Express.js",
      desc: "Creating lightweight and efficient backend APIs with Express.js.",
    },
    {
      word: "NestJS",
      desc: "Building scalable server-side applications with NestJS.",
    },
    {
      word: "Strapi",
      desc: "Developing headless CMS solutions with Strapi for flexible content management.",
    },
    {
      word: "Sanity.io",
      desc: "Implementing real-time headless CMS solutions with Sanity.io.",
    },
    {
      word: "WebAssembly",
      desc: "Enhancing web performance with WebAssembly and Rust.",
    },
    {
      word: "Puppeteer",
      desc: "Automating browser interactions and web scraping with Puppeteer.",
    },
    {
      word: "Playwright",
      desc: "Performing end-to-end testing with Playwright across different browsers.",
    },
    {
      word: "Storybook",
      desc: "Developing and documenting UI components using Storybook.",
    },
    {
      word: "Turborepo",
      desc: "Optimizing monorepos with Turborepo for efficient development workflows.",
    },
  ];

  // About content
  const aboutContent = [
    "Hi there! I'm a passionate developer with experience in building modern web applications and services. I specialize in React, Next.js, and TypeScript.",
    "I love creating clean, efficient, and user-friendly interfaces that solve real-world problems. When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or enjoying the outdoors.",
  ];

  // Projects data
  const projects: Project[] = [
    {
      title: "E-commerce Mobile App",
      description:
        "A native mobile shopping platform with personalized recommendations and AR try-on features.",
      color: "blue",
      technologies: ["React Native", "Redux", "Firebase"],
      category: "mobile",
    },
    {
      title: "Fitness Tracker",
      description:
        "Health monitoring app with workout plans, progress tracking, and social features.",
      color: "green",
      technologies: ["Flutter", "GraphQL", "TypeScript"],
      category: "mobile",
    },
    {
      title: "AR Navigation",
      description:
        "Augmented reality navigation system for indoor and outdoor directions.",
      color: "purple",
      technologies: ["Swift", "ARKit", "CoreLocation"],
      category: "mobile",
    },
    {
      title: "Portfolio Dashboard",
      description:
        "Interactive web dashboard for displaying and managing creative portfolios.",
      color: "yellow",
      technologies: ["React", "Next.js", "TailwindCSS"],
      category: "web",
    },
    {
      title: "E-learning Platform",
      description:
        "Comprehensive web platform for online courses with interactive learning tools.",
      color: "red",
      technologies: ["Vue.js", "Firebase", "Node.js"],
      category: "web",
    },
    {
      title: "Project Management Tool",
      description:
        "Collaborative workspace for teams with task management and analytics features.",
      color: "teal",
      technologies: ["React", "GraphQL", "MongoDB"],
      category: "web",
    },
    {
      title: "Blockchain Explorer",
      description:
        "Tool for visualizing and analyzing blockchain transactions and smart contracts.",
      color: "orange",
      technologies: ["TypeScript", "Ethers.js", "D3.js"],
      category: "misc",
    },
    {
      title: "AI Content Generator",
      description:
        "Machine learning tool that creates personalized content for marketing campaigns.",
      color: "pink",
      technologies: ["Python", "TensorFlow", "React"],
      category: "misc",
    },
    {
      title: "IoT Home Controller",
      description:
        "System that connects and manages smart home devices through a single interface.",
      color: "indigo",
      technologies: ["Node.js", "MQTT", "React Native"],
      category: "misc",
    },
  ];

  // Format phone number helper

  const phone = "+905055942948";
  const email = "berkaybaygut@gmail.com";

  return (
    <main className="min-h-screen">
      <div id="hero-section">
        <HeroSection
          title="Berkay Baygut"
          subtitle="Web Developer & Designer"
        />
      </div>

      <AboutSection content={aboutContent} />

      <SkillsSection skills={skills} />

      <ProjectsSection projects={projects} />

      <ContactSection
        title="Say Hello."
        contactItems={[
          {
            value: email,
            href: `mailto:${email}`,
          },
          {
            value: formatPhone(phone),
            href: `tel:${phone}`,
          },
        ]}
        socialLinks={[
          {
            icon: <Github className="w-8 h-8" />,
            url: "https://github.com/baygut/",
            label: "GitHub",
          },
          {
            icon: <Linkedin className="w-8 h-8" />,
            url: "https://linkedin.com/in/berkay-baygut-14482613a/",
            label: "LinkedIn",
          },
        ]}
      />

      {/* Floating image button that appears when scrolled past hero section */}
      <FloatingModel3D imagePath="/sculpt.png" />
    </main>
  );
}
