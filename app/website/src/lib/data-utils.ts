// import { getCollection, type CollectionEntry } from 'astro:content'
import { getCollection, getEntries, getEntry, type CollectionEntry } from 'astro:content';



export async function getAllPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog')
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getRecentPosts(
  count: number,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts()
  return posts.slice(0, count)
}

export async function getAdjacentPosts(currentId: string): Promise<{
  prev: CollectionEntry<'blog'> | null
  next: CollectionEntry<'blog'> | null
}> {
  const posts = await getAllPosts()
  const currentIndex = posts.findIndex((post) => post.id === currentId)

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  return {
    next: currentIndex > 0 ? posts[currentIndex - 1] : null,
    prev: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
  }
}

export async function getAllTags(): Promise<Map<string, number>> {
  const posts = await getAllPosts()

  return posts.reduce((acc, post) => {
    post.data.tags?.forEach((tag: string) => {
      acc.set(tag, (acc.get(tag) || 0) + 1)
    })
    return acc
  }, new Map<string, number>())
}

export async function getSortedTags(): Promise<
  { tag: string; count: number }[]
> {
  const tagCounts = await getAllTags()

  return [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      const countDiff = b.count - a.count
      return countDiff !== 0 ? countDiff : a.tag.localeCompare(b.tag)
    })
}

export function groupPostsByYear(
  posts: CollectionEntry<'blog'>[],
): Record<string, CollectionEntry<'blog'>[]> {
  return posts.reduce(
    (acc: Record<string, CollectionEntry<'blog'>[]>, post) => {
      const year = post.data.date.getFullYear().toString()
      ;(acc[year] ??= []).push(post)
      return acc
    },
    {},
  )
}

export async function getPostsByAuthor(
  authorId: string,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts()
  return posts.filter((post) => post.data.authors?.includes(authorId))
}

export async function getPostsByTag(
  tag: string,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts()
  return posts.filter((post) => post.data.tags?.includes(tag))
}

export async function getAllProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects')
  return projects
    .sort((a, b) => (b.data.startDate?.valueOf() ?? 0) - (a.data.startDate?.valueOf() ?? 0))
}

export async function getProjectsFeaturedTags(maxCount: number): Promise<string[]> {
  const projects = await getAllProjects()
  const tags = new Set<string>()

  for (const project of projects) {
    if (project.data.tags) {
      for (const tag of project.data.tags) {
        tags.add(tag)
      }
    }
    if (tags.size >= maxCount) {
      break
    }
  }

  return Array.from(tags).slice(0, maxCount)
}



////////////////////////////////// Certifications


// Function to clean up ID by removing /index.md suffix
function cleanId(id: string): string {
  return id.replace(/\/index\.md$/, '');
}

export async function getAllCertifications(): Promise<CollectionEntry<'certifications'>[]> {
  const allCertifications = await getCollection('certifications');
  
  console.log("All certification IDs:", allCertifications.map(cert => cert.id));
  
  // Filter to include only main certification entries 
  const mainCertifications = allCertifications.filter(certification => {
    // Only include 'main' type certifications
    return certification.data.type === 'main';
  });
  
  console.log("Final certification IDs:", mainCertifications.map(cert => cert.id));
  
  return mainCertifications
    .sort((a, b) => (b.data.startDate?.valueOf() ?? 0) - (a.data.startDate?.valueOf() ?? 0));
}

export async function getCertificationsFeaturedTags(maxCount: number): Promise<string[]> {
  const certifications = await getAllCertifications()
  const tags = new Set<string>()

  for (const certification of certifications) {
    if (certification.data.tags) {
      for (const tag of certification.data.tags) {
        tags.add(tag)
      }
    }
    if (tags.size >= maxCount) {
      break
    }
  }

  return Array.from(tags).slice(0, maxCount)
}

// Function to find certification by its cleaned ID (without /index.md)
export async function getCertificationByCleanId(cleanId: string): Promise<CollectionEntry<'certifications'> | null> {
  const certifications = await getCollection('certifications');
  
  // Find certification that matches the clean ID
  const certification = certifications.find(cert => {
    const certCleanId = cert.id.replace(/\/index\.md$/, '');
    return certCleanId === cleanId;
  });
  
  return certification || null;
}

// Updated function to load certification with its sections by clean ID
export async function getCertificationWithSections(cleanIdParam: string): Promise<{
  certification: CollectionEntry<'certifications'>,
  sections: CollectionEntry<'certifications'>[]
} | null> {
  try {
    // Get the main certification using the clean ID
    const certification = await getCertificationByCleanId(cleanIdParam);
    
    if (!certification) {
      console.error(`Certification not found with clean ID: ${cleanIdParam}`);
      return null;
    }
    
    // Get all sections by looking for entries that are referenced by the main certification
    const sections: CollectionEntry<'certifications'>[] = [];
    
    if (certification.data.references && certification.data.references.length > 0) {
      const certificationFolder = cleanIdParam; // The clean ID is actually the folder name
      
      // Process each reference (these should be relative paths within the certification folder)
      for (const reference of certification.data.references) {
        // Build the full path to the referenced section
        const fullRefPath = `${certificationFolder}/${reference}`;
        
        try {
          const allCertifications = await getCollection('certifications');
          // Find the referenced certification
          const refCert = allCertifications.find(c => {
            const normalizedRefPath = reference.endsWith('/index.md') ? reference : `${reference}/index.md`;
            const normalizedFullPath = `${certificationFolder}/${normalizedRefPath}`;
            return c.id === normalizedFullPath;
          });
          
          if (refCert) {
            sections.push(refCert);
          } else {
            console.warn(`Referenced section not found: ${fullRefPath}`);
          }
        } catch (error) {
          console.error(`Error including section ${reference}:`, error);
        }
      }
    }
    
    return {
      certification,
      sections
    };
  } catch (error) {
    console.error(`Error loading certification ${cleanIdParam}:`, error);
    return null;
  }
}
