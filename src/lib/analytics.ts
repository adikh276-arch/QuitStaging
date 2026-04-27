/**
 * analytics.ts — Staging No-op Analytics
 * Mixpanel integration removed for staging environment.
 */

// ─── User Identity ─────────────────────────────────────────────────────────────

export function identifyUser(userId: string, props?: any) {
  console.log('[Analytics] identifyUser (no-op)', userId, props);
}

// ─── Session ──────────────────────────────────────────────────────────────────

export function trackSessionStarted(props: any) {
  console.log('[Analytics] trackSessionStarted (no-op)', props);
}

// ─── Onboarding Funnel ────────────────────────────────────────────────────────

export function trackOnboardingStarted(substance: string) {
  console.log('[Analytics] trackOnboardingStarted (no-op)', substance);
}

export function trackOnboardingStepCompleted(substance: string, step: number, stepName: string) {
  console.log('[Analytics] trackOnboardingStepCompleted (no-op)', substance, step, stepName);
}

export function trackUserOnboarded(substance: string, props: any) {
  console.log('[Analytics] trackUserOnboarded (no-op)', substance, props);
}

// ─── Substance Page ───────────────────────────────────────────────────────────

export function trackSubstancePageOpened(substance: string, props: any) {
  console.log('[Analytics] trackSubstancePageOpened (no-op)', substance, props);
}

export function trackAppExited(substance: string, source: string) {
  console.log('[Analytics] trackAppExited (no-op)', substance, source);
}

export function trackProgressReset(substance: string, streak_before_reset: number) {
  console.log('[Analytics] trackProgressReset (no-op)', substance, streak_before_reset);
}

// ─── Trackers (Daily Logs) ────────────────────────────────────────────────────

export function trackTrackerOpened(substance: string, tracker_id: string, tracker_name: string) {
  console.log('[Analytics] trackTrackerOpened (no-op)', substance, tracker_id, tracker_name);
}

export function trackLogSaved(substance: string, props: any) {
  console.log('[Analytics] trackLogSaved (no-op)', substance, props);
}

export function trackHighRiskSignal(props: any) {
  console.log('[Analytics] trackHighRiskSignal (no-op)', props);
}

export function trackStreakReset(substance: string, streak_before: number) {
  console.log('[Analytics] trackStreakReset (no-op)', substance, streak_before);
}

// ─── Assessment ───────────────────────────────────────────────────────────────

export function trackAssessmentCompleted(substance: string, props: any) {
  console.log('[Analytics] trackAssessmentCompleted (no-op)', substance, props);
}

// ─── Tools & Features ─────────────────────────────────────────────────────────

export function trackToolOpened(substance: string, tool_id: string) {
  console.log('[Analytics] trackToolOpened (no-op)', substance, tool_id);
}

export function trackActivityStarted(substance: string, props: any) {
  console.log('[Analytics] trackActivityStarted (no-op)', substance, props);
}

export function trackActivityCompleted(substance: string, props: any) {
  console.log('[Analytics] trackActivityCompleted (no-op)', substance, props);
}

export function trackArticleRead(substance: string, props: any) {
  console.log('[Analytics] trackArticleRead (no-op)', substance, props);
}

export function trackCalculatorUsed(substance: string, props?: any) {
  console.log('[Analytics] trackCalculatorUsed (no-op)', substance, props);
}

// ─── Community ────────────────────────────────────────────────────────────────

export function trackCommunityPostCreated(substance: string) {
  console.log('[Analytics] trackCommunityPostCreated (no-op)', substance);
}

export function trackCommunityUpvote(substance: string) {
  console.log('[Analytics] trackCommunityUpvote (no-op)', substance);
}

// ─── Named export for convenience ─────────────────────────────────────────────

export const analytics = {
  identifyUser,
  trackSessionStarted,
  trackOnboardingStarted,
  trackOnboardingStepCompleted,
  trackUserOnboarded,
  trackSubstancePageOpened,
  trackAppExited,
  trackProgressReset,
  trackTrackerOpened,
  trackLogSaved,
  trackHighRiskSignal,
  trackStreakReset,
  trackAssessmentCompleted,
  trackToolOpened,
  trackActivityStarted,
  trackActivityCompleted,
  trackArticleRead,
  trackCalculatorUsed,
  trackCommunityPostCreated,
  trackCommunityUpvote,
};

export default analytics;
