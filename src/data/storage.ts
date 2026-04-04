import { TrackerEntry, AssessmentResult, SubstanceSlug } from './types';

const PREFIX = 'quitmantra';

export function getEntryKey(substance: string, tracker: string, date: string) {
  return `${PREFIX}_entries_${substance}_${tracker}_${date}`;
}

export function saveEntry(substance: string, tracker: string, date: string, entry: TrackerEntry) {
  localStorage.setItem(getEntryKey(substance, tracker, date), JSON.stringify(entry));
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
  const key = `${PREFIX}_streak_${substance}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);
  return { days: 0, startDate: '' };
}

export function setStreak(substance: string, days: number, startDate: string) {
  localStorage.setItem(`${PREFIX}_streak_${substance}`, JSON.stringify({ days, startDate }));
}

export function getAssessment(substance: string): AssessmentResult | null {
  const raw = localStorage.getItem(`${PREFIX}_assessment_${substance}`);
  return raw ? JSON.parse(raw) : null;
}

export function saveAssessment(substance: string, result: AssessmentResult) {
  localStorage.setItem(`${PREFIX}_assessment_${substance}`, JSON.stringify(result));
}

export function getCommunityUpvotes(substance: string): Record<string, boolean> {
  const raw = localStorage.getItem(`${PREFIX}_community_upvotes_${substance}`);
  return raw ? JSON.parse(raw) : {};
}

export function toggleCommunityUpvote(substance: string, postId: string): boolean {
  const upvotes = getCommunityUpvotes(substance);
  upvotes[postId] = !upvotes[postId];
  localStorage.setItem(`${PREFIX}_community_upvotes_${substance}`, JSON.stringify(upvotes));
  return upvotes[postId];
}

export function getUserPosts(substance: string): any[] {
  const raw = localStorage.getItem(`${PREFIX}_community_posts_${substance}`);
  return raw ? JSON.parse(raw) : [];
}

export function addUserPost(substance: string, post: any) {
  const posts = getUserPosts(substance);
  posts.unshift(post);
  localStorage.setItem(`${PREFIX}_community_posts_${substance}`, JSON.stringify(posts));
}

export function getAchievements(substance: string): Record<string, { unlocked: boolean; date?: string }> {
  const raw = localStorage.getItem(`${PREFIX}_achievements_${substance}`);
  return raw ? JSON.parse(raw) : {};
}

export function unlockAchievement(substance: string, achievementId: string) {
  const achievements = getAchievements(substance);
  if (!achievements[achievementId]?.unlocked) {
    achievements[achievementId] = { unlocked: true, date: new Date().toISOString().split('T')[0] };
    localStorage.setItem(`${PREFIX}_achievements_${substance}`, JSON.stringify(achievements));
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
