import { TrackerEntry, AssessmentResult, SubstanceSlug } from './types';
import { executeQuery } from '@/lib/db';

export const getUserId = () => localStorage.getItem('therapy_user_id') || 'anon';
export const getPrefix = () => `quitmantra_${getUserId()}`;

/**
 * Migration: Move all data from 'anon' to the current user ID
 * MUST be called after AuthGuard resolves a real user_id but BEFORE components start reading data.
 */
export const migrateAnonData = async (newUserId: string) => {
  if (!newUserId || newUserId === 'anon') return;
  const anonPrefix = 'quitmantra_anon';
  const newPrefix = `quitmantra_${newUserId}`;
  
  const keysToMigrate: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(anonPrefix)) {
      keysToMigrate.push(key);
    }
  }
  
  if (keysToMigrate.length === 0) {
    console.log(`[Migration] No 'anon' data found to migrate.`);
    return;
  }
  
  console.log(`[Migration] Moving ${keysToMigrate.length} records from anon to ${newUserId}...`);
  
  for (const oldKey of keysToMigrate) {
    const dataStr = localStorage.getItem(oldKey);
    if (!dataStr) continue;
    
    const newKey = oldKey.replace(anonPrefix, newPrefix);
    localStorage.setItem(newKey, dataStr);
    localStorage.removeItem(oldKey);
    
    // Also sync to cloud for the new user profile
    try {
      const data = JSON.parse(dataStr);
      await syncToNeonInternal(newKey, data, newUserId);
    } catch (e) {
      console.error(`[Migration] Failed to sync ${oldKey} during migration:`, e);
    }
  }
  console.log(`[Migration] Successfully migrated all local data.`);
};

/**
 * Internal sync that takes an explicit userId (used for migration)
 */
const syncToNeonInternal = async (id: string, data: any, userId: string) => {
  if (userId === 'anon') return;
  try {
    await executeQuery(`
      INSERT INTO quit.activities (id, user_id, data)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE SET data = $3
    `, [id, userId, JSON.stringify(data)]);
  } catch (err) {
    console.error(`[Sync] Failed to sync ${id}:`, err);
  }
};


export function getEntryKey(substance: string, tracker: string, date: string) {
  return `${getPrefix()}_entries_${substance}_${tracker}_${date}`;
}

/**
 * Background sync to Neon DB
 */
const syncToNeon = async (id: string, data: any) => {
  const userId = getUserId();
  await syncToNeonInternal(id, data, userId);
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

  // Auto-reset streak if use is reported for today
  if (date === todayStr()) {
    const values = entry.values;
    const reportedUse = 
      values.drankToday === 'Yes' || 
      values.smokedToday === 'Yes' || 
      values.usedToday === 'Yes' || 
      values.used_illicitly === 'Yes' ||
      values.bought === 'Yes'; // Financial log proxy for use

    if (reportedUse) {
      // Set start date to tomorrow (the first potential new clean day)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setStreak(substance, 0, tomorrow.toISOString().split('T')[0]);
    }
  }
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
  if (!raw) return { days: 0, startDate: '' };
  
  const data = JSON.parse(raw);
  if (!data.startDate) return data;

  // Calculate dynamic days based on start date
  const start = new Date(data.startDate);
  const now = new Date();
  
  // Set to midnight to count full days
  start.setHours(0,0,0,0);
  now.setHours(0,0,0,0);
  
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  
  // If the calculated days differ from stored, it's fine to just return them
  // We add 1 if the user is on their first clean day (start date is today)
  // But wait, if start date is today, and today is clean, days = 0? Or 1?
  // Onboarding logic: daysAgo = 0 (today) -> startDate = today.
  // If startDate is today, they have 1 day clean? Or 0?
  // Let's say if they started today, they are in Day 1.
  const days = diffDays + (diffTime >= 0 ? 1 : 0);

  return { days, startDate: data.startDate };
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

/**
 * Returns a substance-specific dynamic KPI derived from the user's actual log entries.
 * Used to populate the third stat card on the hero card dynamically.
 */
export interface DynamicStat {
  value: string;
  label: string;
  icon: 'money' | 'count' | 'cravings' | 'mood' | 'date' | 'avoided';
}

export function getDynamicStat(substance: string, streakStartDate: string): DynamicStat {
  const DAYS = 90; // look back window

  switch (substance) {
    // ── Money-saved substances ─────────────────────────────────────────────
    case 'alcohol': {
      const entries = getEntries(substance, 'savings', DAYS);
      let saved = 0;
      for (const e of entries) {
        const baseline = Number(e.values.baseline) || 0;
        const spent = e.values.bought === 'Yes' ? (Number(e.values.spent) || 0) : 0;
        saved += Math.max(0, baseline - spent);
      }
      // If no savings log at all, estimate from streak × streak-average baseline (₹876 default)
      if (entries.length === 0 && streakStartDate) {
        const start = new Date(streakStartDate);
        const now = new Date();
        const days = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
        saved = days * 876;
      }
      return { value: saved > 0 ? `₹${Math.round(saved).toLocaleString()}` : '—', label: 'Saved', icon: 'money' };
    }

    case 'tobacco': {
      const savEntries = getEntries(substance, 'financial-health', DAYS);
      let saved = 0;
      for (const e of savEntries) {
        if (e.values.bought === 'No') saved += 280; // default pack cost
        else saved -= (Number(e.values.spent) || 0);
      }
      // Cigarettes avoided fallback
      const cigEntries = getEntries(substance, 'cigarettes', DAYS);
      let avoided = 0;
      for (const e of cigEntries) {
        if (e.values.smokedToday === 'No') avoided += 15; // avg cigarettes/day baseline
      }
      if (saved > 0) return { value: `₹${Math.round(Math.max(0, saved)).toLocaleString()}`, label: 'Saved', icon: 'money' };
      if (avoided > 0) return { value: `${avoided}`, label: 'Cigs Avoided', icon: 'avoided' };
      if (streakStartDate) {
        const days = Math.max(0, Math.floor((Date.now() - new Date(streakStartDate).getTime()) / 86400000));
        return { value: `${days * 15}`, label: 'Cigs Avoided', icon: 'avoided' };
      }
      return { value: '—', label: 'Cigs Avoided', icon: 'avoided' };
    }

    // ── Cravings-resisted substances ───────────────────────────────────────
    case 'opioids': {
      const entries = getEntries(substance, 'craving-pain', DAYS);
      const resisted = entries.filter(e => e.values.hadCraving === 'No' || e.values.usedToday === 'No').length;
      const matDays = getEntries(substance, 'use-mat', DAYS).filter(e => e.values.matTaken === 'Yes').length;
      if (matDays > 0) return { value: `${matDays}d`, label: 'MAT Adherent', icon: 'count' };
      return { value: `${resisted}`, label: 'Days Resisted', icon: 'cravings' };
    }

    case 'cannabis': {
      const entries = getEntries(substance, 'consumption', DAYS);
      const cleanDays = entries.filter(e => e.values.usedToday === 'No').length;
      const cravingEntries = getEntries(substance, 'cravings', DAYS);
      const resisted = cravingEntries.filter(e => e.values.resisted === 'Yes').length;
      if (cleanDays > 0) return { value: `${cleanDays}`, label: 'Clean Days', icon: 'count' };
      if (resisted > 0) return { value: `${resisted}`, label: 'Cravings Won', icon: 'cravings' };
      return { value: '—', label: 'Clean Days', icon: 'count' };
    }

    case 'stimulants': {
      const entries = getEntries(substance, 'use-pattern', DAYS);
      const cleanDays = entries.filter(e => e.values.usedToday === 'No').length;
      const cravingEntries = getEntries(substance, 'cravings', DAYS);
      const resisted = cravingEntries.filter(e => e.values.resisted === 'Yes').length;
      if (cleanDays > 0) return { value: `${cleanDays}`, label: 'Clean Days', icon: 'count' };
      if (resisted > 0) return { value: `${resisted}`, label: 'Cravings Won', icon: 'cravings' };
      return { value: '—', label: 'Clean Days', icon: 'count' };
    }

    case 'benzodiazepines': {
      const entries = getEntries(substance, 'use-taper', DAYS);
      const adherent = entries.filter(e => e.values.takenAsPrescribed === 'Yes').length;
      if (adherent > 0) return { value: `${adherent}d`, label: 'Taper Adherent', icon: 'count' };
      const cravings = getEntries(substance, 'cravings', DAYS);
      const resisted = cravings.filter(e => e.values.resisted === 'Yes').length;
      return { value: resisted > 0 ? `${resisted}` : '—', label: 'Cravings Won', icon: 'cravings' };
    }

    case 'kratom': {
      const cravings = getEntries(substance, 'cravings', DAYS);
      const resisted = cravings.filter(e => e.values.resisted === 'Yes').length;
      const entries = getEntries(substance, 'consumption', DAYS);
      const cleanDays = entries.filter(e => e.values.usedToday === 'No').length;
      if (cleanDays > 0) return { value: `${cleanDays}`, label: 'Clean Days', icon: 'count' };
      return { value: resisted > 0 ? `${resisted}` : '—', label: 'Cravings Won', icon: 'cravings' };
    }

    case 'mdma': {
      const cravings = getEntries(substance, 'cravings', DAYS);
      const resisted = cravings.filter(e => e.values.resisted === 'Yes').length;
      const entries = getEntries(substance, 'use-pattern', DAYS);
      const cleanDays = entries.filter(e => e.values.usedToday === 'No').length;
      if (cleanDays > 0) return { value: `${cleanDays}`, label: 'Clean Days', icon: 'count' };
      return { value: resisted > 0 ? `${resisted}` : '—', label: 'Cravings Won', icon: 'cravings' };
    }

    default:
      return { value: '—', label: 'Progress', icon: 'count' };
  }
}
