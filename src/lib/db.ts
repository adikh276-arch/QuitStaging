import { neon } from "@neondatabase/serverless";

// Use VITE_ environment variables for browser access
const databaseUrl = import.meta.env.VITE_DATABASE_URL;

// Initialize the Neon SQL client (works over HTTP in the browser)
const sql = databaseUrl ? neon(databaseUrl) : null;

/**
 * Smart Query Rewriter
 * Automatically prefixes tables with the 'quit' schema to ensure database isolation.
 */
export const executeQuery = async (query: string, params: any[] = []) => {
  if (!sql) {
    console.warn("[DB] Database URL not configured. Skipping query.");
    return { rows: [] };
  }

  const schema = "quit";
  
  // Basic regex for common SQL patterns to inject schema
  // Skip if table already has a schema prefix (e.g. core.users or quit.activities)
  const rewrittenQuery = query
    .replace(/(FROM|JOIN|UPDATE|INSERT INTO|INTO)\s+((?!core\.|quit\.)\w+)/gi, `$1 ${schema}.$2`);

  // Transform $1, $2 params to Neon expected format if necessary
  // Neon's 'neon' client handles standard postgres interpolation: sql(query, params)
  
  try {
    const result = await sql(rewrittenQuery, params);
    // Neon returns the rows directly as an array. We wrap it for backward compatibility with pg's { rows }
    return { rows: result };
  } catch (err) {
    console.error(`[DB] Query Error:`, err);
    throw err;
  }
};

export default executeQuery;
