export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  url: string;
  tags: string[];
  category: 'desenvolvimento' | 'impactoSocial' | 'automacao';
}

export interface Skill {
  name: string;
  level: number;
}

export interface HardSkill {
  name: string;
  level: number;
}

export interface AboutText {
  title: string;
  description: string;
  detailedDescription: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: 'github' | 'linkedin' | 'mail' | 'phone' | 'behance';
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}
