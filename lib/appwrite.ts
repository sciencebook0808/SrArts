import { Client, Databases, Storage, Account } from 'appwrite';

const apiEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';

function createClient() {
  if (!apiEndpoint || !projectId) {
    return null;
  }
  return new Client().setEndpoint(apiEndpoint).setProject(projectId);
}

const client = createClient();

export { client };
export const databases = client ? new Databases(client) : null;
export const storage = client ? new Storage(client) : null;
export const account = client ? new Account(client) : null;

export const appwriteConfig = {
  databaseId: 'sr_arts_db',
  collectionsId: {
    categories: 'categories',
    artworks: 'artworks',
    blogPosts: 'blog_posts',
    orders: 'orders',
    support: 'support',
    profile: 'profile',
  },
  bucketId: {
    artworks: 'artworks',
    blog: 'blog',
    profile: 'profile',
  },
};

// Helper for server-side Appwrite calls with API key
export function getServerClient() {
  const apiKey = process.env.APPWRITE_API_KEY;
  if (!apiKey || !apiEndpoint || !projectId) {
    return null;
  }

  const serverClient = new Client()
    .setEndpoint(apiEndpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return {
    databases: new Databases(serverClient),
    storage: new Storage(serverClient),
    account: new Account(serverClient),
  };
}
