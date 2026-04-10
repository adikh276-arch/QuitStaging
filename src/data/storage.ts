import { TrackerEntry, AssessmentResult, SubstanceSlug } from './types';
import { executeQuery } from '@/lib/db';

const getUserId = () => localStorage.getItem('therapy_user_id') || 'anon';
export const getPrefix = () => `quitmantra_${getUserId()}`;

export function getEntryKey(substance: string, tracker: string, date: string) {
  return `${getPrefix()}_entries_${substance}_${tracker}_${date}`;
}

/**
 * Background sync to Neon DB
 */
const syncToNeon = async (id: string, data: any) => {
  const userId = getUserId();
  if (userId === 'anon') {
    console.warn(`[Sync] Skipping sync for ${id} - user is anon`);
    return;
  }
  
  try {
    console.log(`[Sync] Syncing ${id} for user ${userId}...`);
    await executeQuery(`
      INSERT INTO quit.activities (id, user_id, data)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE SET data = $3
    `, [id, userId, JSON.stringify(data)]);
  } catch (err) {
    console.error(`[Sync] Failed to sync ${id} to Neon:`, err);
  }
};

/**
 * Save onboarded state locally AND to Neon (cross-device persistence)
 */
export async function saveOnboarded(substance: string, meta: { motivation?: string; triggers?: string[] }) {
  const localKey = `${getPrefix()}_onboarded_${substance}`;
  localStorage.setItem(localKey, 'true');
  
  // Save with prefix to DB to ensure uniqueness if DB PK is just 'id'
  const dbId = `${getPrefix()}_onboarded_${substance}`;
  console.log(`[Onboarding] Saving to cloud with ID: ${dbId}`);
  await syncToNeon(dbId, { onboarded: true, ...meta, substance });
}

/**
 * Check onboarded state — local first, then Neon as fallback (avoids re-onboarding on new device)
 */
export async function fetchOnboarded(substance: string): Promise<boolean> {
  const userId = getUserId();
  
  // 1. Check local cache first (fast path)
  const localKey = `${getPrefix()}_onboarded_${substance}`;
  if (localStorage.getItem(localKey) === 'true') return true;
  
  // 2. Check Neon DB (cross-device)
  if (userId === 'anon') return false;
  try {
    console.log(`[Onboarding] Checking cloud for user ${userId}, substance ${substance}...`);
    // Check for explicit ID match OR any ID belonging to the user that mentions onboarding for this substance
    const result = await executeQuery(
      `SELECT data FROM quit.activities WHERE user_id = $1 AND (id = $2 OR id LIKE $3) LIMIT 1`,
      [userId, `${getPrefix()}_onboarded_${substance}`, `%_onboarded_${substance}`]
    );
    if (result.rows.length > 0) {
      const data = result.rows[0].data;
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (parsed?.onboarded === true) {
        console.log(`[Onboarding] Cloud record found for ${substance}. Restoring...`);
        // Cache locally so future checks are fast
        localStorage.setItem(localKey, 'true');
        return true;
      }
    }
  } catch (err) {
    console.error('[Onboarding] Failed to fetch from Neon:', err);
  }
  return false;
}

/**
 * Sync ALL user data for a substance from Neon to LocalStorage
 */
export async function syncUserDataFromCloud(substance: string) {
  const userId = getUserId();
  if (userId === 'anon') return;
  
  try {
    console.log(`[Sync] Pulling cloud records for substance ${substance}...`);
    // Fetch all records for this user that relate to the substance
    const result = await executeQuery(
      `SELECT id, data FROM quit.activities WHERE user_id = $1 AND id LIKE $2`,
      [userId, `%${substance}%`]
    );
    
    result.rows.forEach(row => {
      const { id, data } = row;
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
      localStorage.setItem(id, dataStr);
    });
    console.log(`[Sync] Pulled ${result.rows.length} records for ${substance}.`);
  } catch (err) {
    console.error('[Sync] Failed to pull from Neon:', err);
  }
}

/**
 * Sync ALL user data globally from Neon (landing page bootstrap)
 */
export async function syncGlobalDataFromCloud() {
  const userId = getUserId();
  if (userId === 'anon') return;
  
  try {
    console.log(`[Sync] Pulling GLOBAL cloud data for user ${userId}...`);
    // Fetch ALL records for this user_id — most reliable way to bootstrap
    const result = await executeQuery(
      `SELECT id, data FROM quit.activities WHERE user_id = $1`,
      [userId]
    );
    
    result.rows.forEach(row => {
      const { id, data } = row;
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
      localStorage.setItem(id, dataStr);
    });
    console.log(`[Sync] Global pull complete: ${result.rows.length} records found in cloud.`);
  } catch (err) {
    console.error('[Sync] Global pull failed:', err);
  }
}

/**
 * Clear onboarding state to allow restart
 */
export async function resetOnboarded(substance: string) {
  const userId = getUserId();
  const localKey = `${getPrefix()}_onboarded_${substance}`;
  localStorage.removeItem(localKey);
  localStorage.removeItem(`${getPrefix()}_motivation_${substance}`);
  localStorage.removeItem(`${getPrefix()}_triggers_${substance}`);
  
  if (userId !== 'anon') {
    try {
      await executeQuery(
        `DELETE FROM quit.activities WHERE user_id = $1 AND id LIKE $2`,
        [userId, `%_onboarded_${substance}`]
      );
    } catch (err) {
      console.error('[Onboarding] Failed to delete from Neon:', err);
    }
  }
}

export function saveEntry(substance: string, tracker: string, date: string, entry: TrackerEntry) {
  const key = getEntryKey(substance, tracker, date);
  localStorage.setItem(key, JSON.stringify(entry));
  syncToNeon(key, entry);
}

export function getEntry(substance: string, tracker: string, date: string): TrackerEntry | null {
  const raw = localStorage.getItem(getEntryKey(substance, tracker, date));
  return raw ? JSON.parse(raw) : null;
}

export function getEntries(substance: string, tracker: string, days: number = 30): TrackerEntry[] {
  const entries: TrackerEntry[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = getEntry(substance, tracker, dateStr);
    if (entry) entries.push(entry);
  }
  return entries;
}

export function getStreak(substance: string): { days: number; startDate: string } {
  const key = `${getPrefix()}_streak_${substance}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);
  return { days: 0, startDate: '' };
}

export function setStreak(substance: string, days: number, startDate: string) {
  const key = `${getPrefix()}_streak_${substance}`;
  const data = { days, startDate };
  localStorage.setItem(key, JSON.stringify(data));
  syncToNeon(key, data);
}

export function getAssessment(substance: string): AssessmentResult | null {
  const raw = localStorage.getItem(`${getPrefix()}_assessment_${substance}`);
  return raw ? JSON.parse(raw) : null;
}

export function saveAssessment(substance: string, result: AssessmentResult) {
  const key = `${getPrefix()}_assessment_${substance}`;
  localStorage.setItem(key, JSON.stringify(result));
  syncToNeon(key, result);
}

export function getCommunityUpvotes(substance: string): Record<string, boolean> {
  const raw = localStorage.getItem(`${getPrefix()}_community_upvotes_${substance}`);
  return raw ? JSON.parse(raw) : {};
}

export function toggleCommunityUpvote(substance: string, postId: string): boolean {
  const upvotes = getCommunityUpvotes(substance);
  upvotes[postId] = !upvotes[postId];
  const key = `${getPrefix()}_community_upvotes_${substance}`;
  localStorage.setItem(key, JSON.stringify(upvotes));
  syncToNeon(key, upvotes);
  return upvotes[postId];
}

export function getUserPosts(substance: string): any[] {
  const raw = localStorage.getItem(`${getPrefix()}_community_posts_${substance}`);
  return raw ? JSON.parse(raw) : [];
}

export function addUserPost(substance: string, post: any) {
  const posts = getUserPosts(substance);
  posts.unshift(post);
  const key = `${getPrefix()}_community_posts_${substance}`;
  localStorage.setItem(key, JSON.stringify(posts));
  syncToNeon(key, posts);
}

export function getAchievements(substance: string): Record<string, { unlocked: boolean; date?: string }> {
  const raw = localStorage.getItem(`${getPrefix()}_achievements_${substance}`);
  return raw ? JSON.parse(raw) : {};
}

export function unlockAchievement(substance: string, achievementId: string) {
  const achievements = getAchievements(substance);
  if (!achievements[achievementId]?.unlocked) {
    achievements[achievementId] = { unlocked: true, date: new Date().toISOString().split('T')[0] };
    const key = `${getPrefix()}_achievements_${substance}`;
    localStorage.setItem(key, JSON.stringify(achievements));
    syncToNeon(key, achievements);
  }
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}
