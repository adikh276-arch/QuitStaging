import { neon } from "@neondatabase/serverless";

// Use VITE_ environment variables for browser access
const databaseUrl = import.meta.env.VITE_DATABASE_URL || import.meta.env.DATABASE_URL;

// Initialize the Neon SQL client (works over HTTP in the browser)
const sql = databaseUrl ? neon(databaseUrl, { disableWarningInBrowsers: true } as any) : null;

/**
 * Smart Query Rewriter
 * Automatically prefixes tables with the 'quit' schema to ensure database isolation.
 */
export const executeQuery = async (query: string, params: any[] = []) => {
  if (!sql) {
    console.warn("[DB] Database URL not configured. Skipping query.");
    return { rows: [] };
  }

  // For production stability, we use explicit schema names (quit. or core.) in queries 
  // rather than a smart rewriter that might cause syntax errors.
  const rewrittenQuery = query;

  // Transform $1, $2 params to Neon expected format if necessary
  // Neon's 'neon' client handles standard postgres interpolation: sql(query, params)
  
  try {
    // For conventional function calls with placeholders, use sql.query()
    const result = await (sql as any).query(rewrittenQuery, params);
    // Neon returns the rows directly as an array. We wrap it for backward compatibility with pg's { rows }
    return { rows: result };
  } catch (err) {
    console.error(`[DB] Query Error:`, err);
    throw err;
  }
};

export default executeQuery;
