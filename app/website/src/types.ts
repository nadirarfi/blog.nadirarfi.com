export type Site = {
  title: string
  description: string
  href: string
  author: string
  locale: string
  location: string
}

export type SocialLink = {
  href: string
  label: string
}

export type IconMap = {
  [key: string]: string
}

// In your types.ts file
export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
  outcomes: string;
}

export interface ResumeExperience {
  company: string;
  position: string;
  period: string;
  description: string;
  achievements: string[];
  projects: ResumeProject[];
}

export interface EducationInstitution {
  name: string;
  degree: string;
  field: string;
  period: string;
  location: string;
  description: string;
  achievements: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  description: string;
  link: string;
}

export interface Education {
  title: string;
  description: string;
  institutions: EducationInstitution[];
  certifications: Certification[];
}

export interface Resume {
  title: string;
  description: string;
  pdfLink: string;
  experiences: ResumeExperience[];
}
