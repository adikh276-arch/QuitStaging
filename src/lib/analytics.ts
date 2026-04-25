/**
 * analytics.ts — Quit Mini · Mixpanel Analytics
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive, growth-oriented analytics for the Quit addiction recovery app.
 *
 * Design goals:
 *  ① Every event name is self-documenting — readable without context.
 *  ② Substance is ALWAYS a property so we can slice any chart by substance.
 *  ③ High-risk signals (severe assessment, frequent slips) fire a
 *     "High Risk Signal" event that includes user_id for outreach.
 *  ④ Growth funnel:
 *     Session Started → Onboarding Completed (activation) →
 *     Daily Log Saved (engagement) → High Risk Signal (therapy conversion).
 *
 * Event naming convention:
 *   "[Actor] [Verb Past-Tense]" — e.g. "User Onboarded", "Log Saved"
 *   Or "[Noun] [Action]" for system events — e.g. "Streak Reset"
 */

import mixpanel from 'mixpanel-browser';

const TOKEN = '992c4ce0792104e75c82029a4c58474d';

mixpanel.init(TOKEN, {
  debug: false,
  track_pageview: false,   // we track page views manually for richer context
  persistence: 'localStorage',
  autocapture: false,      // disabled — we fire precise semantic events only
  record_sessions_percent: 0,
  api_host: "https://api-js.mixpanel.com",
  api_transport: 'XHR',
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safe(fn: () => void) {
  try { fn(); } catch (e) { console.warn('[Analytics]', e); }
}

// ─── User Identity ─────────────────────────────────────────────────────────────

/**
 * Call once after auth resolves. Sets user-level properties that persist
 * across all future events for this user. The user_id matches MantraCare's
 * internal ID so support can look them up instantly.
 */
export function identifyUser(userId: string, props?: {
  substance?: string;
  motivation?: string;
  triggers?: string[];
  language?: string;
}) {
  if (!userId) return;
  safe(() => {
    mixpanel.identify(userId);
    mixpanel.people.set({
      $user_id: userId,
      primary_substance: props?.substance,
      motivation: props?.motivation,
      triggers: props?.triggers,
      preferred_language: props?.language || navigator.language,
      app_name: 'Quit Mini',
      platform: window.parent !== window ? 'iframe' : 'standalone',
      last_active_at: new Date().toISOString(),
    });
  });
}

// ─── Session ──────────────────────────────────────────────────────────────────

/**
 * Fires every time the app loads. "Is Returning User" tells us DAU vs new
 * users. Track how often users come back within a day.
 */
export function trackSessionStarted(props: {
  substance?: string;
  is_returning_user: boolean;
  language: string;
}) {
  safe(() => mixpanel.track('Session Started', {
    substance: props.substance,
    is_returning_user: props.is_returning_user,
    language: props.language,
    platform: window.parent !== window ? 'iframe' : 'standalone',
    app: 'Quit Mini',
  }));
}

// ─── Onboarding Funnel ────────────────────────────────────────────────────────

/** Fired when user lands on onboarding for the first time for a substance. */
export function trackOnboardingStarted(substance: string) {
  safe(() => mixpanel.track('Onboarding Started', {
    substance,
    app: 'Quit Mini',
  }));
}

/** Fired after each step — lets us see drop-off in the 3-step funnel. */
export function trackOnboardingStepCompleted(substance: string, step: number, stepName: 'Quit Date' | 'Motivation Selected' | 'Triggers Selected') {
  safe(() => mixpanel.track('Onboarding Step Completed', {
    substance,
    step_number: step,
    step_name: stepName,
    app: 'Quit Mini',
  }));
}

/**
 * PRIMARY ACTIVATION EVENT — user has fully onboarded.
 * "Quit Days Ago" tells us whether they quit recently (high motivation) or
 * longer ago (already established, different messaging needed).
 */
export function trackUserOnboarded(substance: string, props: {
  quit_date_option: string;   // 'today' | 'yesterday' | '3days' | 'week' | 'custom'
  quit_days_ago: number;
  motivation: string;
  trigger_count: number;
  triggers: string[];
}) {
  safe(() => {
    mixpanel.track('User Onboarded', {
      substance,
      quit_date_option: props.quit_date_option,
      quit_days_ago: props.quit_days_ago,
      motivation: props.motivation,
      trigger_count: props.trigger_count,
      triggers: props.triggers,
      app: 'Quit Mini',
    });
    // Mark activation for funnel analysis
    mixpanel.people.set_once({ activated_at: new Date().toISOString() });
    mixpanel.people.set({
      primary_substance: substance,
      motivation: props.motivation,
      triggers: props.triggers,
    });
    mixpanel.people.increment('substances_onboarded');
  });
}

// ─── Substance Page ───────────────────────────────────────────────────────────

/**
 * Tracks which substance pages are opened most. Key for feature prioritization —
 * if 80% of users are Alcohol, that's where to invest polish first.
 */
export function trackSubstancePageOpened(substance: string, props: {
  streak_days: number;
  recovery_pct: number;
  sessions_today?: number;
}) {
  safe(() => {
    mixpanel.track('Substance Page Opened', {
      substance,
      streak_days: props.streak_days,
      recovery_pct: props.recovery_pct,
      sessions_today: props.sessions_today || 1,
      app: 'Quit Mini',
    });
    mixpanel.people.set({ last_substance_viewed: substance });
    mixpanel.people.increment(`${substance}_page_views`);
  });
}

/** Fires when user taps Back / Exit. Is it iframe-close or full redirect? */
export function trackAppExited(substance: string, source: 'Substance Page' | 'Onboarding') {
  safe(() => mixpanel.track('App Exited', {
    substance,
    exit_from: source,
    via_iframe_close: window.parent !== window,
    app: 'Quit Mini',
  }));
}

/** User voluntarily resets their progress. High-friction action = important signal. */
export function trackProgressReset(substance: string, streak_before_reset: number) {
  safe(() => {
    mixpanel.track('Progress Reset', {
      substance,
      streak_days_lost: streak_before_reset,
      app: 'Quit Mini',
    });
    mixpanel.people.increment('total_resets');
  });
}

// ─── Trackers (Daily Logs) ────────────────────────────────────────────────────

/** User opens a tracker modal — tells us which trackers are popular. */
export function trackTrackerOpened(substance: string, tracker_id: string, tracker_name: string) {
  safe(() => {
    mixpanel.track('Tracker Opened', {
      substance,
      tracker_id,
      tracker_name,
      tracker_type: getTrackerType(tracker_id),
      app: 'Quit Mini',
    });
    mixpanel.people.increment(`tracker_${tracker_id}_opens`);
  });
}

/**
 * PRIMARY ENGAGEMENT EVENT — user submits a daily log.
 * "Reported Use" being true is a slip — critical for streak reset + support outreach.
 */
export function trackLogSaved(substance: string, props: {
  tracker_id: string;
  tracker_name: string;
  reported_use: boolean;
  is_first_log_today: boolean;
  severity_level?: 'Low' | 'Moderate' | 'High' | null;
}) {
  safe(() => {
    mixpanel.track('Log Saved', {
      substance,
      tracker_id: props.tracker_id,
      tracker_name: props.tracker_name,
      tracker_type: getTrackerType(props.tracker_id),
      reported_use: props.reported_use,
      is_first_log_today: props.is_first_log_today,
      severity_level: props.severity_level || null,
      app: 'Quit Mini',
    });

    mixpanel.people.increment('total_logs_saved');
    mixpanel.people.set({ last_logged_at: new Date().toISOString() });

    if (props.reported_use) {
      mixpanel.track('Slip Reported', {
        substance,
        tracker_id: props.tracker_id,
        app: 'Quit Mini',
      });
      mixpanel.people.increment('total_slips');
    } else {
      mixpanel.people.increment('total_clean_days_logged');
    }
  });
}

/**
 * HIGH-RISK SIGNAL — fired when a log or assessment indicates dangerous severity.
 * Includes user_id so you can look them up and offer paid therapy outreach.
 *
 * Example triggers:
 *  - Withdrawal severity = 'Severe'
 *  - Assessment score in danger zone
 *  - 3+ slips in last 7 days
 */
export function trackHighRiskSignal(props: {
  user_id: string;
  substance: string;
  signal_type: 'Severe Withdrawal' | 'Dangerous Assessment Score' | 'Repeated Slips' | 'Crisis Indicator';
  detail: string;
  severity_raw?: number;
}) {
  safe(() => {
    mixpanel.track('High Risk Signal', {
      user_id: props.user_id,
      substance: props.substance,
      signal_type: props.signal_type,
      signal_detail: props.detail,
      severity_raw: props.severity_raw,
      recommended_action: 'Offer Therapy',
      app: 'Quit Mini',
    });
    // Tag the user profile for easy CRM filtering
    mixpanel.people.set({
      high_risk: true,
      high_risk_substance: props.substance,
      high_risk_signal: props.signal_type,
      high_risk_at: new Date().toISOString(),
    });
  });
}

/**
 * Fires when the streak resets due to a reported slip.
 * High previous streak + reset = very emotionally charged moment → prime point
 * for a supportive therapy offer.
 */
export function trackStreakReset(substance: string, streak_before: number) {
  safe(() => {
    mixpanel.track('Streak Reset', {
      substance,
      streak_days_before_reset: streak_before,
      app: 'Quit Mini',
    });
    mixpanel.people.increment('total_streak_resets');
    mixpanel.people.set({ longest_streak_lost: streak_before });
  });
}

// ─── Assessment ───────────────────────────────────────────────────────────────

/**
 * Every time a user completes an assessment. Score + severity tells us their
 * addiction level. High severity → therapy conversion opportunity.
 */
export function trackAssessmentCompleted(substance: string, props: {
  user_id: string;
  score: number;
  max_score: number;
  severity_label: 'Mild' | 'Moderate' | 'Severe';
}) {
  safe(() => {
    mixpanel.track('Assessment Completed', {
      substance,
      score: props.score,
      max_score: props.max_score,
      score_pct: Math.round((props.score / props.max_score) * 100),
      severity_label: props.severity_label,
      app: 'Quit Mini',
    });
    mixpanel.people.set({
      assessment_severity: props.severity_label,
      assessment_score: props.score,
    });
    // Fire high-risk if severe
    if (props.severity_label === 'Severe') {
      trackHighRiskSignal({
        user_id: props.user_id,
        substance,
        signal_type: 'Dangerous Assessment Score',
        detail: `Score ${props.score}/${props.max_score} (${props.severity_label})`,
        severity_raw: props.score,
      });
    }
  });
}

// ─── Tools & Features ─────────────────────────────────────────────────────────

/** Which tools get opened the most? Feature usage heatmap. */
export function trackToolOpened(substance: string, tool_id: string) {
  const toolNames: Record<string, string> = {
    assessment: 'Self Assessment',
    calculator: 'Cost Calculator',
    activities: 'Recovery Activities',
    learn: 'Learn Hub',
  };
  safe(() => {
    mixpanel.track('Tool Opened', {
      substance,
      tool_id,
      tool_name: toolNames[tool_id] || tool_id,
      app: 'Quit Mini',
    });
    mixpanel.people.increment(`tool_${tool_id}_opens`);
  });
}

/** An activity (breathing exercise, meditation, etc.) was started. */
export function trackActivityStarted(substance: string, props: {
  activity_id: string;
  activity_name: string;
  activity_type: string;
}) {
  safe(() => mixpanel.track('Activity Started', {
    substance,
    activity_id: props.activity_id,
    activity_name: props.activity_name,
    activity_type: props.activity_type,
    app: 'Quit Mini',
  }));
}

/** Activity finished — duration tells us if they stayed engaged. */
export function trackActivityCompleted(substance: string, props: {
  activity_id: string;
  activity_name: string;
  activity_type: string;
  duration_seconds: number;
}) {
  safe(() => {
    mixpanel.track('Activity Completed', {
      substance,
      activity_id: props.activity_id,
      activity_name: props.activity_name,
      activity_type: props.activity_type,
      duration_seconds: props.duration_seconds,
      app: 'Quit Mini',
    });
    mixpanel.people.increment('activities_completed');
    mixpanel.people.increment('total_activity_minutes', Math.round(props.duration_seconds / 60));
  });
}

/** User reads an educational article. Topic affinity helps us personalize. */
export function trackArticleRead(substance: string, props: {
  article_id: string;
  article_title: string;
  tag: string;
}) {
  safe(() => {
    mixpanel.track('Article Read', {
      substance,
      article_id: props.article_id,
      article_title: props.article_title,
      article_tag: props.tag,
      app: 'Quit Mini',
    });
    mixpanel.people.increment('articles_read');
  });
}

/** User runs the cost/savings calculator. High engagement signal. */
export function trackCalculatorUsed(substance: string, props?: {
  estimated_savings?: number;
}) {
  safe(() => mixpanel.track('Calculator Used', {
    substance,
    estimated_annual_savings: props?.estimated_savings,
    app: 'Quit Mini',
  }));
}

// ─── Community ────────────────────────────────────────────────────────────────

export function trackCommunityPostCreated(substance: string) {
  safe(() => {
    mixpanel.track('Community Post Created', { substance, app: 'Quit Mini' });
    mixpanel.people.increment('community_posts');
  });
}

export function trackCommunityUpvote(substance: string) {
  safe(() => mixpanel.track('Community Upvote', { substance, app: 'Quit Mini' }));
}

// ─── Internal utilities ───────────────────────────────────────────────────────

function getTrackerType(tracker_id: string): string {
  if (tracker_id.includes('consumption') || tracker_id.includes('cigarettes') || tracker_id.includes('use')) return 'Consumption Log';
  if (tracker_id.includes('craving')) return 'Craving Tracker';
  if (tracker_id.includes('mood') || tracker_id.includes('sleep') || tracker_id.includes('wellness')) return 'Wellness Check';
  if (tracker_id.includes('withdrawal')) return 'Withdrawal Monitor';
  if (tracker_id.includes('financial') || tracker_id.includes('savings')) return 'Financial Health';
  if (tracker_id.includes('social') || tracker_id.includes('support')) return 'Social Support';
  return 'Other';
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
