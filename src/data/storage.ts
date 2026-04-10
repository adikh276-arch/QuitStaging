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
  if (userId === 'anon') return;
  
  try {
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
  const key = `${getPrefix()}_onboarded_${substance}`;
  localStorage.setItem(key, 'true');
  await syncToNeon(key, { onboarded: true, ...meta, substance });
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
    const result = await executeQuery(
      `SELECT data FROM quit.activities WHERE user_id = $1 AND id LIKE $2 LIMIT 1`,
      [userId, `%_onboarded_${substance}`]
    );
    if (result.rows.length > 0) {
      const data = result.rows[0].data;
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (parsed?.onboarded === true) {
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
  localStorage.setItem(`${getPrefix()}_streak_${substance}`, JSON.stringify({ days, startDate }));
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
  localStorage.setItem(`${getPrefix()}_community_upvotes_${substance}`, JSON.stringify(upvotes));
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
    localStorage.setItem(`${getPrefix()}_achievements_${substance}`, JSON.stringify(achievements));
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
