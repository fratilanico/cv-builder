export interface PersonalDetails {
  fullName: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  items: string;
}

export interface ProjectBullet {
  label: string;
  text: string;
}

export interface Project {
  id: string;
  name: string;
  tag: string;
  bullets: ProjectBullet[];
}

export interface SubRole {
  title: string;
  bullets: ProjectBullet[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  type: string;
  startDate: string;
  endDate: string;
  subRoles: SubRole[];
  bullets: ProjectBullet[];
}

export interface FooterColumn {
  heading: string;
  lines: string[];
}

export interface CVData {
  personalDetails: PersonalDetails;
  summary: string[];
  strategicPhilosophy: string;
  skillCategories: SkillCategory[];
  techTags: string[];
  projects: Project[];
  experience: Experience[];
  footer: FooterColumn[];
}

export const defaultCVData: CVData = {
  personalDetails: {
    fullName: "",
    title: "",
    location: "",
    phone: "",
    email: "",
    linkedin: "",
    github: "",
  },
  summary: [],
  strategicPhilosophy: "",
  skillCategories: [],
  techTags: [],
  projects: [],
  experience: [],
  footer: [],
};
