import type { IconMap, SocialLink, Site } from '@/types';
import configData from './website.yaml'; // Direct import of the YAML file (adjust path as needed)

// Use the site data from config but maintain the SITE variable name
export const SITE: Site = configData.site;

// Use the navLinks data from config but maintain the NAV_LINKS variable name
export const NAV_LINKS: SocialLink[] = configData.navLinks;

// Use the socialLinks data from config but maintain the SOCIAL_LINKS variable name
export const SOCIAL_LINKS: SocialLink[] = configData.socialLinks;

// Use the iconMap data from config but maintain the ICON_MAP variable name
export const ICON_MAP: IconMap = configData.iconMap;

// Define the Category interface for technologies
export interface Category {
  text: string;
  logo: string;
}

// Define the Technologies type
export type Technologies = {
  [key: string]: Category[];
};

// Use the technologies data from config but maintain the technologies variable name
export const technologies: Technologies = configData.technologies;
