import { SubstanceConfig } from './types';

const notes = [
  "Felt strong today", "Work was stressful", "Social dinner, navigated well",
  "Tough morning but pushed through", "Better than yesterday", "Slept well",
  "Had a moment of weakness but stayed strong", "Feeling grateful",
  "Called a friend when it got hard", "Quiet day, stayed focused",
  "Weekend was challenging", "Exercise helped a lot", "One day at a time",
  "", "", "", "", "", "", "", ""
];

const rn = (min: number, max: number) => Math.round((min + Math.random() * (max - min)) * 10) / 10;
const ri = (min: number, max: number) => Math.floor(min + Math.random() * (max - min + 1));
const pick = <T>(arr: T[]): T => arr[ri(0, arr.length - 1)];
const noteFor = (day: number) => notes[day % notes.length];

export const substances: SubstanceConfig[] = [
  // ===== ALCOHOL =====
  {
    slug: 'alcohol',
    name: 'Alcohol',
    descriptor: 'Beer, wine & spirits',
    icon: '🍷',
    accentVar: '--substance-alcohol',
    trackers: [
      {
        id: 'consumption', name: 'Consumption Log', chartType: 'bar', yAxisLabel: 'Units',
        insight: "You haven't exceeded 1 unit in 11 days. Your liver is already regenerating.",
        fields: [
          { key: 'units', label: 'Units consumed today', type: 'slider', min: 0, max: 20, step: 1 },
          { key: 'drinkType', label: 'Drink type', type: 'chips', options: ['Beer', 'Wine', 'Spirits', 'Mixed', 'None'] },
          { key: 'trigger', label: 'Primary trigger', type: 'chips', options: ['Stress', 'Social', 'Habit', 'Boredom', 'Emotion', 'None'] },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => ({
          units: day < 7 ? ri(Math.max(0, 8 - day), Math.max(1, 10 - day)) : day < 14 ? ri(0, Math.max(0, 3 - (day - 7))) : 0,
          drinkType: day < 14 ? pick(['Beer', 'Wine', 'Spirits']) : 'None',
          trigger: day < 14 ? pick(['Stress', 'Social', 'Habit']) : 'None',
          notes: noteFor(day),
        }),
      },
      {
        id: 'cravings', name: 'Craving Intensity', chartType: 'line', yAxisLabel: 'Cravings',
        insight: "Friday evenings remain your hardest time. Plan something active after 6pm.",
        fields: [
          { key: 'count', label: 'Number of cravings today', type: 'slider', min: 0, max: 15, step: 1 },
          { key: 'peakIntensity', label: 'Peak intensity', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'trigger', label: 'Primary trigger', type: 'chips', options: ['Stress', 'Social', 'Evening habit', 'Weekend', 'Boredom', 'Other'] },
          { key: 'coping', label: 'Coping used', type: 'chips', options: ['Exercise', 'Cold water', 'Breathing', 'Called someone', 'Waited it out', 'Gave in'], multiSelect: true },
          { key: 'resisted', label: 'Did you resist?', type: 'single-select', options: ['Yes', 'Partially', 'No'] },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => ({
          count: Math.max(0, ri(11 - Math.floor(day * 0.45), 13 - Math.floor(day * 0.5))),
          peakIntensity: Math.max(1, ri(8 - Math.floor(day * 0.3), 10 - Math.floor(day * 0.35))),
          trigger: pick(['Stress', 'Social', 'Evening habit']),
          coping: [pick(['Exercise', 'Breathing', 'Waited it out'])],
          resisted: day > 10 ? 'Yes' : pick(['Yes', 'Partially']),
          notes: noteFor(day),
        }),
      },
      {
        id: 'mood-sleep', name: 'Mood & Sleep', chartType: 'area', yAxisLabel: 'Score',
        insight: "On nights you sleep 7+ hours, your next-day mood is 2.4 points higher.",
        fields: [
          { key: 'mood', label: 'Mood today', type: 'icon-picker', options: ['Happy', 'Calm', 'Neutral', 'Anxious', 'Sad', 'Angry'] },
          { key: 'energy', label: 'Energy level', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'sleepHours', label: 'Hours slept last night', type: 'slider', min: 0, max: 12, step: 0.5 },
          { key: 'wakeUps', label: 'Wake-ups', type: 'chips', options: ['0', '1-2', '3-5', '5+'] },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => ({
          mood: pick(day > 14 ? ['Happy', 'Calm'] : day > 7 ? ['Calm', 'Neutral'] : ['Neutral', 'Anxious', 'Sad']),
          energy: Math.min(10, rn(3 + day * 0.25, 4 + day * 0.3)),
          sleepHours: Math.min(10, rn(3.5 + day * 0.2, 4.5 + day * 0.22)),
          wakeUps: day > 14 ? '0' : day > 7 ? pick(['0', '1-2']) : pick(['1-2', '3-5']),
          notes: noteFor(day),
        }),
      },
      {
        id: 'withdrawal', name: 'Withdrawal Symptoms', chartType: 'stacked-bar', yAxisLabel: 'Burden',
        insight: "Your symptoms are tracking ahead of the expected resolution timeline.",
        fields: [
          { key: 'tremors', label: 'Tremors', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] },
          { key: 'headaches', label: 'Headaches', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] },
          { key: 'nausea', label: 'Nausea', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] },
          { key: 'sweating', label: 'Sweating', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] },
          { key: 'anxiety', label: 'Anxiety level', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'fatigue', label: 'Fatigue', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => {
          const sevAt = (d: number) => d < 3 ? pick(['Moderate', 'Severe']) : d < 7 ? pick(['Mild', 'Moderate']) : d < 14 ? pick(['None', 'Mild']) : 'None';
          return {
            tremors: sevAt(day), headaches: sevAt(day), nausea: sevAt(day),
            sweating: sevAt(day), anxiety: Math.max(1, ri(8 - Math.floor(day * 0.4), 10 - Math.floor(day * 0.45))),
            fatigue: sevAt(day), notes: noteFor(day),
          };
        },
      },
      {
        id: 'savings', name: 'Financial Savings', chartType: 'area', yAxisLabel: '₹ Saved',
        insight: "On track to save ₹3.2L this year. That's a flight to Japan.",
        fields: [
          { key: 'bought', label: 'Did you buy alcohol today?', type: 'single-select', options: ['Yes', 'No'] },
          { key: 'spent', label: 'Amount spent (₹)', type: 'number', min: 0, max: 10000 },
          { key: 'baseline', label: 'Baseline daily spend (₹)', type: 'number', min: 0, max: 5000 },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => ({
          bought: day < 10 ? (day < 5 ? 'Yes' : pick(['Yes', 'No'])) : 'No',
          spent: day < 10 ? ri(0, 500) : 0,
          baseline: 876,
          cumulative: Math.round(876 * (21 - day) - ri(0, day < 10 ? 500 : 0)),
          notes: noteFor(day),
        }),
      },
      {
        id: 'risk-situations', name: 'High-Risk Situations', chartType: 'bar', yAxisLabel: 'Situations',
        insight: "Social dinners are your strongest area. Work stress situations are hardest.",
        fields: [
          { key: 'situations', label: 'Situations encountered', type: 'chips', options: ['Party', 'Work stress', 'Social dinner', 'Habit time', 'Argument', 'Boredom', 'None'], multiSelect: true },
          { key: 'difficulty', label: 'Difficulty', type: 'single-select', options: ['Easy', 'Moderate', 'Hard'] },
          { key: 'outcome', label: 'Outcome', type: 'single-select', options: ['Resisted all', 'Partial', 'Gave in'] },
          { key: 'strategy', label: 'Strategy used', type: 'chips', options: ['Left situation', 'AF drink', 'Called someone', 'Delayed', 'Other'] },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => ({
          situations: day < 7 ? [pick(['Party', 'Work stress', 'Social dinner'])] : day < 14 ? (Math.random() > 0.5 ? [pick(['Work stress', 'Boredom'])] : ['None']) : ['None'],
          difficulty: day < 7 ? pick(['Moderate', 'Hard']) : 'Easy',
          outcome: day > 7 ? 'Resisted all' : pick(['Resisted all', 'Partial']),
          strategy: pick(['Left situation', 'AF drink', 'Delayed']),
          notes: noteFor(day),
        }),
      },
    ],
    calculator: {
      title: 'Units & Health Impact',
      inputs: [
        { key: 'drinksPerDay', label: 'Drinks per day', type: 'slider', min: 0, max: 20, step: 1, defaultValue: 4 },
        { key: 'drinkingDays', label: 'Drinking days per week', type: 'slider', min: 0, max: 7, step: 1, defaultValue: 5 },
        { key: 'costPerDrink', label: 'Cost per drink (₹)', type: 'slider', min: 50, max: 1000, step: 50, defaultValue: 200 },
      ],
      compute: (inputs) => {
        const weekly = inputs.drinksPerDay * inputs.drinkingDays;
        const monthly = inputs.costPerDrink * inputs.drinksPerDay * inputs.drinkingDays * 4.3;
        const yearly = monthly * 12;
        return [
          { label: 'Weekly units', value: `${weekly} units`, color: weekly > 14 ? 'destructive' : 'primary' },
          { label: 'Safe limit', value: '14 units/week' },
          { label: 'Monthly spend', value: `₹${Math.round(monthly).toLocaleString()}` },
          { label: 'Yearly spend', value: `₹${Math.round(yearly).toLocaleString()}` },
          { label: 'Liver risk', value: weekly > 35 ? 'High' : weekly > 14 ? 'Moderate' : 'Low', color: weekly > 35 ? 'destructive' : weekly > 14 ? 'accent' : 'primary' },
          { label: '1-year savings if quit', value: `₹${Math.round(yearly).toLocaleString()}` },
        ];
      },
      note: "Your liver begins regenerating within 72 hours of stopping.",
    },
    activities: [
      {
        id: 'box-breathing', name: 'Box Breathing', duration: '4 min', type: 'breathing',
        description: 'An animated breathing exercise: Inhale 4 → Hold 4 → Exhale 4 → Hold 4. Repeat 5 cycles.',
        phases: [
          { time: 0, text: 'Inhale slowly for 4 counts...' },
          { time: 4, text: 'Hold your breath for 4 counts...' },
          { time: 8, text: 'Exhale slowly for 4 counts...' },
          { time: 12, text: 'Hold for 4 counts...' },
        ],
      },
      {
        id: 'halt-check', name: 'HALT Check', duration: '2 min', type: 'checklist',
        description: 'Check if you\'re Hungry, Angry, Lonely, or Tired.',
        items: [
          { title: 'H — Hungry?', content: 'Eat something first. Low blood sugar mimics craving signals and depletes willpower. Don\'t decide anything until you\'ve eaten.' },
          { title: 'A — Angry?', content: 'Name the frustration out loud or in writing. Alcohol was your pressure valve. This craving is a symptom of the feeling, not the cause.' },
          { title: 'L — Lonely?', content: 'Text one person about anything. Social isolation is the strongest single predictor of relapse. Connection is the medicine.' },
          { title: 'T — Tired?', content: 'Your prefrontal cortex runs on sleep. Late night plus fatigue is peak relapse risk. Rest before making any decisions.' },
        ],
      },
      {
        id: 'urge-surfing', name: 'Urge Surfing Timer', duration: '5 min', type: 'timer',
        description: 'Ride the wave of a craving with guided prompts.',
        phases: [
          { time: 0, text: 'Find the urge in your body. Chest? Gut? Throat? Just locate it without judging it.' },
          { time: 60, text: "Don't fight it. Watch it like weather. You are the observer — not the craving." },
          { time: 120, text: 'Is it getting stronger? Let it. You can handle the peak. Every craving has a ceiling.' },
          { time: 180, text: 'The wave is at its highest. Stay with it. Just breathe.' },
          { time: 240, text: "Notice — is it starting to flatten? Cravings always do this." },
          { time: 280, text: "It's receding. You didn't act. This is what it always feels like — and it always passes." },
        ],
      },
    ],
    articles: [
      { id: 'a1', title: 'Why alcohol destroys sleep — and when it comes back', tag: 'Health', content: 'Alcohol suppresses REM sleep — the deep stage where your brain repairs itself. You might sleep 8 hours and wake exhausted because the quality throughout was poor.\n\nIn the second half of the night, as your liver metabolizes alcohol, your brain rebounds into hyperactivity — 4am wake-ups, disturbing dreams, fragmented sleep.\n\nThe recovery is faster than people expect. Within 3–5 days of stopping, sleep depth measurably improves. By week 2, REM sleep begins to normalize. Most people report deeper, more restorative sleep after just 7 alcohol-free days.\n\nYour brain knows how to sleep. Alcohol was the interference, not the solution.' },
      { id: 'a2', title: 'What 3 weeks without alcohol does to your liver', tag: 'Science', content: 'Days 1–3: Liver enzymes remain elevated. Fat that accumulated in liver cells begins to mobilize.\n\nDays 4–7: Enzyme levels begin dropping measurably. Early fatty liver reversal is already happening.\n\nWeek 2–3: Enzymes approach normal range. Fatty liver can fully reverse within 2–6 weeks of abstinence.\n\nA blood test at 30 days often surprises people. The liver begins regenerating within 72 hours of stopping.' },
      { id: 'a3', title: 'The HALT method: what\'s actually driving your craving', tag: 'Psychology', content: 'HALT stands for Hungry, Angry, Lonely, Tired. Most cravings aren\'t really about alcohol — they\'re about an unmet need that alcohol trained your brain to address.\n\nHungry: Low blood sugar mimics craving signals biochemically.\n\nAngry: Alcohol was your pressure valve. The craving is a symptom of the frustration.\n\nLonely: Social connection is the most consistently identified protective factor in recovery.\n\nTired: Your prefrontal cortex runs on sleep. Late night plus fatigue is when most relapses occur.' },
      { id: 'a4', title: 'Navigating social situations alcohol-free', tag: 'Practical', content: 'The first sober party feels impossible in advance. It rarely is in practice.\n\nPractical tools: Arrive with your own drink already in hand — sparkling water, AF cocktail, anything.\n\nScripts that work: "I\'m driving tonight." "I\'m on a health kick." "Not drinking at the moment."\n\nThe first sober social event is the hardest. The second is easier. The anxiety shrinks in proportion to the evidence.' },
      { id: 'a5', title: 'Alcohol and anxiety: which came first?', tag: 'Science', content: 'Many people discover too late that alcohol was treating anxiety they didn\'t know they had.\n\nWhen you quit, the GABA system becomes hyperactive — rebound anxiety spikes for 2–4 weeks. This is neurological, not psychological weakness.\n\nAnxiety after quitting is almost always worse short-term and dramatically better by 90 days. People who drink to manage anxiety almost universally have lower baseline anxiety at 3 months sober.' },
    ],
    communityPosts: [
      { id: 'c1', type: 'Milestone', title: 'Day 21 — I slept 8 hours last night for the first time in years', body: 'For 10 years I drank to get to sleep. Last night I fell asleep naturally at 10:30 and woke at 7 AM. I genuinely cried when I woke up.', upvotes: 234, comments: 41, timeAgo: '2h ago', username: 'anonymous_sunrise', replies: [{ username: 'night_owl_23', text: 'This gives me so much hope. I\'m on day 4 and sleep is terrible right now.', timeAgo: '1h ago' }, { username: 'steady_hands', text: 'The sleep coming back is the best part. Congrats.', timeAgo: '45m ago' }] },
      { id: 'c2', type: 'Question', title: 'The shaking is scaring me on Day 2 — is this normal?', body: 'My hands won\'t stop trembling. I haven\'t told anyone I\'m quitting. Is this dangerous? When does it stop?', upvotes: 67, comments: 28, timeAgo: '5h ago', username: 'worried_day2', replies: [{ username: 'been_there', text: 'Mild tremors are common Days 1-3. If they\'re severe or you feel confused, please see a doctor immediately. Stay hydrated.', timeAgo: '4h ago' }] },
      { id: 'c3', type: 'Tip', title: 'Sparkling water + lime at 6pm is doing something', body: 'I know it sounds too simple. But replacing the fizzy drink ritual at exactly 6pm has broken my daily trigger more than anything else.', upvotes: 189, comments: 33, timeAgo: '1d ago', username: 'fizz_not_booze' },
      { id: 'c4', type: 'Story', title: 'Lost my job, quit drinking — now I have a better one', body: 'The alcohol cost me everything first. Then it turned out the everything was the only thing keeping me drinking.', upvotes: 512, comments: 76, timeAgo: '3d ago', username: 'second_chance' },
      { id: 'c5', type: 'Support', title: 'Day 3 and considering giving up', body: 'Everything hurts, I can\'t sleep, and I don\'t understand why I\'m doing this to myself. Someone please tell me it gets better.', upvotes: 341, comments: 94, timeAgo: '6h ago', username: 'holding_on' },
    ],
    achievements: [
      { id: 'first-step', name: 'First Step', description: 'Logged Day 1', icon: '🌱', condition: () => ({ unlocked: true }) },
      { id: 'one-week', name: 'One Week', description: '7 days clean', icon: '🌿', condition: () => ({ unlocked: true }) },
      { id: 'two-weeks', name: 'Two Weeks', description: '14 days clean', icon: '🌳', condition: () => ({ unlocked: true }) },
      { id: 'craving-fighter', name: 'Craving Fighter', description: 'Resisted a logged craving', icon: '💪', condition: () => ({ unlocked: true }) },
      { id: '30-days', name: '30 Days', description: '30 days clean', icon: '⭐', condition: () => ({ unlocked: false, progress: '9 days to go' }) },
      { id: 'sleep-champion', name: 'Sleep Champion', description: '7 nights of 7+ hours', icon: '😴', condition: () => ({ unlocked: false, progress: '3 nights to go' }) },
      { id: 'community-voice', name: 'Community Voice', description: 'First community post', icon: '💬', condition: () => ({ unlocked: false }) },
      { id: '3-months', name: '3 Months', description: '90 days clean', icon: '🏆', condition: () => ({ unlocked: false, progress: '69 days to go' }) },
    ],
  },
  // ===== TOBACCO =====
  {
    slug: 'tobacco',
    name: 'Tobacco / Nicotine',
    descriptor: 'Cigarettes, vaping & pouches',
    icon: '🚬',
    accentVar: '--substance-tobacco',
    trackers: [
      {
        id: 'cigarettes', name: 'Daily Cigarettes', chartType: 'bar', yAxisLabel: 'Cigarettes',
        insight: "Morning cigarettes are the last habit standing. Try a 15-minute walk immediately after waking.",
        fields: [
          { key: 'count', label: 'Cigarettes smoked today', type: 'number', min: 0, max: 60 },
          { key: 'type', label: 'Type', type: 'chips', options: ['Cigarette', 'Vape', 'Pouch', 'Pipe', 'None'] },
          { key: 'occasion', label: 'Occasion', type: 'chips', options: ['Morning', 'After meals', 'Stress', 'Social', 'Boredom', 'Other'], multiSelect: true },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => ({ count: Math.max(0, ri(22 - Math.floor(day * 1.2), 24 - Math.floor(day * 1.1))), type: day > 14 ? 'None' : 'Cigarette', occasion: day < 14 ? [pick(['Morning', 'After meals', 'Stress'])] : ['None'], notes: noteFor(day) }),
      },
      {
        id: 'cravings', name: 'Craving Patterns', chartType: 'line', yAxisLabel: 'Cravings',
        insight: "After-meal cravings are nearly gone. Morning accounts for 73% of your remaining pattern.",
        fields: [
          { key: 'count', label: 'Number of cravings', type: 'slider', min: 0, max: 20, step: 1 },
          { key: 'peakIntensity', label: 'Peak intensity', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'peakTime', label: 'Peak time', type: 'chips', options: ['Morning', 'After meals', 'Afternoon', 'Evening', 'Night'] },
          { key: 'trigger', label: 'Trigger', type: 'chips', options: ['Morning routine', 'After food', 'Stress', 'Boredom', 'Social'] },
          { key: 'outcome', label: 'Outcome', type: 'single-select', options: ['Resisted all', 'Resisted some', 'Gave in'] },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => ({ count: Math.max(0, ri(12 - Math.floor(day * 0.6), 14 - Math.floor(day * 0.55))), peakIntensity: Math.max(1, ri(7 - Math.floor(day * 0.3), 9 - Math.floor(day * 0.35))), peakTime: pick(['Morning', 'After meals']), trigger: pick(['Morning routine', 'Stress']), outcome: day > 10 ? 'Resisted all' : pick(['Resisted all', 'Resisted some']), notes: noteFor(day) }),
      },
      {
        id: 'respiratory', name: 'Respiratory Health', chartType: 'area', yAxisLabel: 'Breathing Ease',
        insight: "From winded at 2 minutes to 12 minutes of exercise. Real lung recovery happening.",
        fields: [
          { key: 'breathingEase', label: 'Breathing ease', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'coughSeverity', label: 'Cough severity', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] },
          { key: 'chestTightness', label: 'Chest tightness', type: 'chips', options: ['None', 'Mild', 'Moderate'] },
          { key: 'exerciseTime', label: 'Exercise before breathlessness', type: 'chips', options: ['1 min', '5 min', '10 min', '20 min', '30+ min'] },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => ({ breathingEase: Math.min(10, rn(2 + day * 0.25, 3 + day * 0.22)), coughSeverity: day > 14 ? 'None' : day > 7 ? pick(['None', 'Mild']) : pick(['Mild', 'Moderate']), chestTightness: day > 10 ? 'None' : pick(['None', 'Mild']), exerciseTime: day > 14 ? '20 min' : day > 7 ? '10 min' : '5 min', notes: noteFor(day) }),
      },
      {
        id: 'mood-irritability', name: 'Mood & Irritability', chartType: 'line', yAxisLabel: 'Score',
        insight: "Irritability down 62% since Day 3. Mood consistently above 7 now.",
        fields: [
          { key: 'irritability', label: 'Irritability', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'mood', label: 'Mood', type: 'icon-picker', options: ['Happy', 'Calm', 'Neutral', 'Anxious', 'Irritable', 'Sad'] },
          { key: 'energy', label: 'Energy', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'stress', label: 'Stress', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => ({ irritability: Math.max(1, rn(9 - day * 0.35, 10 - day * 0.3)), mood: pick(day > 14 ? ['Happy', 'Calm'] : ['Neutral', 'Anxious', 'Irritable']), energy: Math.min(10, rn(2 + day * 0.3, 3 + day * 0.25)), stress: Math.max(1, rn(7 - day * 0.25, 8 - day * 0.2)), notes: noteFor(day) }),
      },
      {
        id: 'nrt', name: 'NRT Tracking', chartType: 'bar', yAxisLabel: 'mg Nicotine',
        insight: "Getting 14mg from NRT vs 40mg when fully smoking. 65% nicotine reduction.",
        fields: [
          { key: 'nrtType', label: 'NRT used', type: 'chips', options: ['Patch', 'Gum', 'Lozenge', 'Inhaler', 'None'] },
          { key: 'patchLevel', label: 'Patch level', type: 'chips', options: ['7mg', '14mg', '21mg'] },
          { key: 'extraCigarettes', label: 'Cigarettes on top', type: 'number', min: 0, max: 20 },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => ({ nrtType: 'Patch', patchLevel: day < 7 ? '21mg' : '14mg', extraCigarettes: Math.max(0, ri(10 - day, 12 - day)), totalNicotine: day < 7 ? ri(30, 40) : ri(14, 20), notes: noteFor(day) }),
      },
      {
        id: 'financial-health', name: 'Financial & Health', chartType: 'area', yAxisLabel: '₹ Saved',
        insight: "Taste and smell returned on Day 7. Lung cancer risk drops 72% at 10 years.",
        fields: [
          { key: 'bought', label: 'Bought cigarettes?', type: 'single-select', options: ['Yes', 'No'] },
          { key: 'spent', label: 'Amount spent (₹)', type: 'number', min: 0, max: 5000 },
          { key: 'healthMilestone', label: 'Health milestone', type: 'chips', options: ['Improved taste', 'Easier breathing', 'Less cough', 'Better circulation'], multiSelect: true },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => ({ bought: day < 7 ? 'Yes' : 'No', spent: day < 7 ? ri(200, 500) : 0, cumulative: Math.round(533 * Math.max(0, 21 - day)), healthMilestone: day > 7 ? ['Improved taste'] : [], notes: noteFor(day) }),
      },
    ],
    calculator: {
      title: 'Cigarette Cost & Health Impact',
      inputs: [
        { key: 'cigarettesPerDay', label: 'Cigarettes per day', type: 'slider', min: 1, max: 60, step: 1, defaultValue: 15 },
        { key: 'costPerPack', label: 'Cost per pack (₹)', type: 'slider', min: 50, max: 1000, step: 10, defaultValue: 280 },
        { key: 'yearsSmoked', label: 'Years smoked', type: 'slider', min: 1, max: 50, step: 1, defaultValue: 8 },
      ],
      compute: (inputs) => {
        const daily = (inputs.cigarettesPerDay / 20) * inputs.costPerPack;
        const yearly = daily * 365;
        const total = yearly * inputs.yearsSmoked;
        return [
          { label: 'Daily spend', value: `₹${Math.round(daily)}` },
          { label: 'Yearly spend', value: `₹${Math.round(yearly).toLocaleString()}` },
          { label: 'Total spent', value: `₹${Math.round(total).toLocaleString()}` },
          { label: 'Carcinogens per cigarette', value: '69 known' },
          { label: '10-year benefit', value: '72% lower lung cancer risk' },
        ];
      },
    },
    activities: [
      { id: 'craving-countdown', name: '5-Min Craving Countdown', duration: '5 min', type: 'timer', phases: [{ time: 0, text: 'The craving is starting. It feels urgent. It isn\'t. Start the clock.' }, { time: 60, text: '1 minute in. Normal. Keep going.' }, { time: 150, text: 'Halfway. Is the edge slightly coming off?' }, { time: 240, text: '4 minutes. Most cravings peak and begin falling now.' }, { time: 280, text: 'You made it. The craving has passed. Every. Single. Time.' }] },
      { id: 'lung-breathing', name: 'Lung Recovery Breathing', duration: '4 min', type: 'breathing', phases: [{ time: 0, text: 'Inhale slowly for 5 counts...' }, { time: 5, text: 'Hold for 2 counts...' }, { time: 7, text: 'Exhale fully for 7 counts...' }, { time: 14, text: 'Rest for 2 counts...' }] },
      { id: 'cost-snap', name: 'Cost Reality Snap', duration: '2 min', type: 'calculator' },
    ],
    articles: [
      { id: 'a1', title: 'What actually happens to your lungs when you quit', tag: 'Health', content: 'Hours 20–48: Carbon monoxide leaves your bloodstream. Blood oxygen normalizes.\n\nDay 14–30: Lung function measurably increases. Cilia start regrowing.\n\n1–9 months: Cilia fully regenerate. Breathlessness decreases.\n\nYour lungs have been trying to heal. You were interrupting the process.' },
      { id: 'a2', title: 'Nicotine cravings last 3–5 minutes', tag: 'Science', content: 'The acute craving is time-limited. It rises, peaks, and falls in 3–5 minutes.\n\nEvery craving you survive weakens the neural pathway. Set a timer. The craving will pass before it ends.' },
      { id: 'a3', title: 'Smoker\'s identity: who are you without cigarettes?', tag: 'Psychology', content: 'People who say "I\'m not a smoker" rather than "I\'m trying to quit" have significantly better outcomes. The language shift moves the decision from willpower to identity.' },
      { id: 'a4', title: 'Vaping as a quit tool: what the evidence says', tag: 'Research', content: 'Vaping delivers nicotine without combustion products. The evidence cautiously supports it as a harm reduction tool. Less harmful does not mean harmless.' },
      { id: 'a5', title: 'The 6 withdrawal symptoms and when they end', tag: 'Recovery', content: 'Irritability: peaks Days 2–3, resolves Week 2.\nHunger: begins within 24 hours.\nInsomnia: Days 2–5.\nBrain fog: Week 1.\nDepression: Days 3–5.\nConstipation: Days 3–5.' },
    ],
    communityPosts: [
      { id: 'c1', type: 'Milestone', title: 'The barista told me I smelled nice today', body: 'I\'ve been a smoker for 14 years. Someone told me I smelled nice this morning.', upvotes: 891, comments: 45, timeAgo: '3h ago', username: 'fresh_start_22' },
      { id: 'c2', type: 'Tip', title: 'Put the money you\'d spend in a visible jar', body: 'Every day I put ₹280 in a glass jar. I can see ₹8,400 now. That\'s real.', upvotes: 445, comments: 22, timeAgo: '1d ago', username: 'jar_saver' },
      { id: 'c3', type: 'Question', title: 'Day 3 — crying at adverts. Is this normal?', body: 'Is it possible quitting cigarettes is causing a breakdown?', upvotes: 156, comments: 18, timeAgo: '8h ago', username: 'emotional_mess' },
      { id: 'c4', type: 'Story', title: '10 years, 200 attempts, finally Day 47', body: 'I think this time I was finally tired enough to want the discomfort more than the cigarette.', upvotes: 723, comments: 54, timeAgo: '2d ago', username: 'finally_free' },
      { id: 'c5', type: 'Support', title: 'Lit up after 12 days clean', body: 'I want to start counting again but I feel like a fraud.', upvotes: 203, comments: 31, timeAgo: '12h ago', username: 'trying_again' },
    ],
    achievements: [
      { id: 'first-step', name: 'First Step', description: 'Logged Day 1', icon: '🌱', condition: () => ({ unlocked: true }) },
      { id: 'one-week', name: 'One Week', description: '7 days clean', icon: '🌿', condition: () => ({ unlocked: true }) },
      { id: 'two-weeks', name: 'Two Weeks', description: '14 days clean', icon: '🌳', condition: () => ({ unlocked: true }) },
      { id: 'craving-fighter', name: 'Craving Fighter', description: 'Resisted a craving', icon: '💪', condition: () => ({ unlocked: true }) },
      { id: '30-days', name: '30 Days', description: '30 days clean', icon: '⭐', condition: () => ({ unlocked: false, progress: '9 days to go' }) },
      { id: 'sleep-champion', name: 'Sleep Champion', description: '7+ hrs for 7 nights', icon: '😴', condition: () => ({ unlocked: false, progress: '3 nights to go' }) },
      { id: 'community-voice', name: 'Community Voice', description: 'First post', icon: '💬', condition: () => ({ unlocked: false }) },
      { id: '3-months', name: '3 Months', description: '90 days clean', icon: '🏆', condition: () => ({ unlocked: false, progress: '69 days to go' }) },
    ],
  },
  // ===== OPIOIDS =====
  {
    slug: 'opioids', name: 'Opioids', descriptor: 'Prescription & heroin', icon: '💊', accentVar: '--substance-opioids',
    banner: { text: '💊 On Buprenorphine — Day 21 · Well managed', type: 'info', dismissable: true },
    trackers: [
      { id: 'use-mat', name: 'Use & MAT', chartType: 'bar', yAxisLabel: 'Use instances', insight: '19 consecutive days without illicit use. Buprenorphine has stabilized your baseline.',
        fields: [
          { key: 'usedToday', label: 'Used illicitly today', type: 'single-select', options: ['Yes', 'No'] },
          { key: 'type', label: 'Type', type: 'chips', options: ['Pills', 'Heroin', 'Fentanyl', 'Other'] },
          { key: 'matTaken', label: 'MAT dose taken as prescribed', type: 'single-select', options: ['Yes', 'No', 'Not on MAT'] },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => ({ usedToday: day < 6 ? (day < 3 ? 'Yes' : pick(['Yes', 'No'])) : 'No', type: day < 6 ? 'Pills' : '', matTaken: 'Yes', useCount: day < 6 ? ri(0, 3 - Math.floor(day * 0.5)) : 0, notes: noteFor(day) }),
      },
      { id: 'craving-pain', name: 'Craving & Pain', chartType: 'line', yAxisLabel: 'Intensity', insight: 'Craving down from 9.4 on Day 1. Pain resolves more slowly but is also declining.',
        fields: [
          { key: 'cravingIntensity', label: 'Craving intensity', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'physicalPain', label: 'Physical pain', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'emotionalPain', label: 'Emotional pain', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'trigger', label: 'Primary trigger', type: 'chips', options: ['Physical pain', 'Stress', 'Boredom', 'Location', 'Person', 'Memory'] },
          { key: 'coping', label: 'Coping used', type: 'chips', options: ['MAT dose', 'Support call', 'Exercise', 'Breathing', 'Distraction'] },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => ({ cravingIntensity: Math.max(1, rn(9 - day * 0.4, 10 - day * 0.35)), physicalPain: Math.max(1, rn(8 - day * 0.3, 9 - day * 0.25)), emotionalPain: Math.max(1, rn(7 - day * 0.25, 8 - day * 0.2)), trigger: pick(['Physical pain', 'Stress']), coping: pick(['MAT dose', 'Exercise']), notes: noteFor(day) }),
      },
      { id: 'withdrawal', name: 'Withdrawal Symptoms', chartType: 'stacked-bar', yAxisLabel: 'Burden', insight: 'With MAT, your symptom burden was 4× lower than expected.',
        fields: [
          { key: 'bodyAches', label: 'Body aches', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] },
          { key: 'sweating', label: 'Sweating', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] },
          { key: 'insomnia', label: 'Insomnia', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] },
          { key: 'anxiety', label: 'Anxiety', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'restlessness', label: 'Restlessness', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] },
          { key: 'nausea', label: 'Nausea', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => { const s = (d: number) => d < 3 ? pick(['Moderate', 'Severe']) : d < 7 ? pick(['Mild', 'Moderate']) : d < 14 ? pick(['None', 'Mild']) : 'None'; return { bodyAches: s(day), sweating: s(day), insomnia: s(day), anxiety: Math.max(1, ri(8 - Math.floor(day * 0.4), 10 - Math.floor(day * 0.45))), restlessness: s(day), nausea: s(day), notes: noteFor(day) }; },
      },
      { id: 'sleep-energy', name: 'Sleep & Energy', chartType: 'area', yAxisLabel: 'Hours', insight: 'Sleep improved from 2.4 hrs to 6.8 hrs. Energy recovering steadily.',
        fields: [
          { key: 'sleepHours', label: 'Sleep hours', type: 'slider', min: 0, max: 12, step: 0.5 },
          { key: 'sleepQuality', label: 'Sleep quality', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'energy', label: 'Energy', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'meals', label: 'Meals today', type: 'single-select', options: ['All', 'Some', 'None'] },
          { key: 'showered', label: 'Showered', type: 'single-select', options: ['Yes', 'No'] },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => ({ sleepHours: Math.min(9, rn(2.4 + day * 0.22, 3 + day * 0.2)), sleepQuality: Math.min(10, rn(2 + day * 0.3, 3 + day * 0.25)), energy: Math.min(10, rn(2 + day * 0.3, 3 + day * 0.25)), meals: day > 7 ? 'All' : pick(['Some', 'All']), showered: day > 5 ? 'Yes' : pick(['Yes', 'No']), notes: noteFor(day) }),
      },
      { id: 'treatment', name: 'Treatment Engagement', chartType: 'calendar', yAxisLabel: 'Attended', insight: '14 of 21 days with formal support contact.',
        fields: [
          { key: 'naMeeting', label: 'NA meeting', type: 'single-select', options: ['Yes', 'No'] },
          { key: 'therapy', label: 'Therapy session', type: 'single-select', options: ['Yes', 'No'] },
          { key: 'sponsor', label: 'Sponsor contact', type: 'single-select', options: ['Yes', 'No'] },
          { key: 'medication', label: 'Medication as prescribed', type: 'single-select', options: ['Yes', 'No', 'Not prescribed'] },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => ({ naMeeting: day > 11 ? 'Yes' : pick(['Yes', 'No']), therapy: day % 3 === 0 ? 'Yes' : 'No', sponsor: day > 7 ? 'Yes' : pick(['Yes', 'No']), medication: 'Yes', attended: day > 11 || Math.random() > 0.3, notes: noteFor(day) }),
      },
      { id: 'functional', name: 'Functional Recovery', chartType: 'area', yAxisLabel: 'Score', insight: 'All 5 functional areas showing measurable improvement.',
        fields: [
          { key: 'work', label: 'Work/school', type: 'single-select', options: ["Can't", 'Minimal', 'Difficult', 'Normal'] },
          { key: 'social', label: 'Social contact', type: 'single-select', options: ['Isolated', 'Brief', 'Normal'] },
          { key: 'hygiene', label: 'Hygiene', type: 'single-select', options: ['Skipped', 'Minimal', 'Full'] },
          { key: 'nutrition', label: 'Nutrition', type: 'single-select', options: ['None', 'Minimal', 'Full meals'] },
          { key: 'satisfaction', label: 'Life satisfaction', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ],
        mockGenerator: (day) => ({ work: day > 14 ? 'Normal' : day > 7 ? 'Difficult' : 'Minimal', social: day > 10 ? 'Normal' : day > 5 ? 'Brief' : 'Isolated', hygiene: day > 7 ? 'Full' : 'Minimal', nutrition: day > 7 ? 'Full meals' : 'Minimal', satisfaction: Math.min(10, rn(2 + day * 0.3, 3 + day * 0.28)), notes: noteFor(day) }),
      },
    ],
    calculator: {
      title: 'MME & Overdose Risk',
      inputs: [
        { key: 'mgPerDay', label: 'mg per day', type: 'slider', min: 0, max: 500, step: 10, defaultValue: 60 },
        { key: 'bupDose', label: 'Buprenorphine dose (mg/day)', type: 'slider', min: 0, max: 32, step: 2, defaultValue: 8 },
      ],
      compute: (inputs) => [
        { label: 'Daily MME', value: `${inputs.mgPerDay} MME` },
        { label: 'Overdose risk', value: inputs.mgPerDay > 90 ? 'High' : inputs.mgPerDay > 50 ? 'Elevated' : 'Moderate', color: inputs.mgPerDay > 90 ? 'destructive' : 'accent' },
        { label: 'Naloxone note', value: 'Available free at government health centres' },
      ],
    },
    activities: [
      { id: '54321-grounding', name: '5-4-3-2-1 Grounding', duration: '5 min', type: 'checklist', items: [{ title: '5 — See', content: 'Name 5 things you can see right now.' }, { title: '4 — Touch', content: 'Touch 4 things and notice each texture.' }, { title: '3 — Hear', content: 'Close your eyes. Name 3 sounds.' }, { title: '2 — Smell', content: 'Name 2 smells.' }, { title: '1 — Taste', content: 'Name 1 thing you can taste right now.' }] },
      { id: 'pmr', name: 'Progressive Muscle Relaxation', duration: '5 min', type: 'timer', phases: [{ time: 0, text: 'Feet and calves — tense them hard for 10 seconds. Now release.' }, { time: 60, text: 'Thighs and glutes. Squeeze tight, hold, let go.' }, { time: 120, text: 'Core and back — deep breath, tense, exhale and release.' }, { time: 180, text: 'Hands, arms, shoulders — clench, raise shoulders, release.' }, { time: 240, text: 'Face — scrunch every muscle. Hold. Release.' }, { time: 280, text: 'Complete. You activated your parasympathetic nervous system.' }] },
      { id: 'safety-check', name: 'Safety Symptom Check', duration: '2 min', type: 'checklist', items: [{ title: 'Severe chest pain or racing heart', content: 'This needs medical attention. Call your doctor or go to emergency now.' }, { title: 'Unable to keep fluids down 12+ hours', content: 'You need IV fluids. Go to hospital immediately.' }, { title: 'Hallucinations or severe confusion', content: 'Medical emergency. Call 112 immediately.' }, { title: 'Manageable aches, sweating, or anxiety', content: 'Expected withdrawal. Stay hydrated, take prescribed MAT doses.' }] },
    ],
    articles: [
      { id: 'a1', title: 'MAT is not substitution: what buprenorphine actually does', tag: 'Science', content: 'Buprenorphine is a partial opioid agonist. It stabilizes, doesn\'t get you high. People on MAT are 50% less likely to die from opioid overdose. MAT is recovery.' },
      { id: 'a2', title: 'Physical vs psychological withdrawal', tag: 'Recovery', content: 'Physical: Days 1–7. Psychological: Weeks 2+. Both are real. Both resolve. MAT and behavioral therapy together address both phases.' },
      { id: 'a3', title: 'Overdose risk after abstinence', tag: 'Safety', content: 'Tolerance drops rapidly. The dose that was normal before can be fatal after a week without use. Naloxone reverses overdose. Have it and tell someone where it is.' },
      { id: 'a4', title: 'How pain gets managed without opioids', tag: 'Practical', content: 'Physical therapy, NSAIDs, nerve blocks, mindfulness-based pain management. Multiple approaches that build capacity rather than creating tolerance.' },
      { id: 'a5', title: 'NA vs SMART Recovery', tag: 'Resources', content: 'NA: peer-led, spiritually-oriented. SMART: science-based, CBT-derived. Attendance consistency matters more than which program.' },
    ],
    communityPosts: [
      { id: 'c1', type: 'Milestone', title: 'Day 100 on MAT. My kids were returned last week.', body: 'I want someone on Day 3 to know: it becomes possible to get everything back.', upvotes: 1204, comments: 87, timeAgo: '4h ago', username: 'dad_again' },
      { id: 'c2', type: 'Tip', title: 'Tell your doctor everything', body: 'I hid my use for 2 years. When I finally told him, he got me on buprenorphine the same week.', upvotes: 445, comments: 34, timeAgo: '1d ago', username: 'honest_now' },
      { id: 'c3', type: 'Question', title: 'Does the psychological craving ever stop?', body: 'Day 45 — physically fine. But the want is still there.', upvotes: 289, comments: 45, timeAgo: '6h ago', username: 'day45_wondering' },
      { id: 'c4', type: 'Story', title: 'Fentanyl took 3 friends. I\'m still here.', body: 'I don\'t know why I survived. But I\'m going to use the time.', upvotes: 876, comments: 112, timeAgo: '2d ago', username: 'survivor_99' },
      { id: 'c5', type: 'Support', title: 'Relapsed after 60 days. Devastated.', body: 'I thought I was done. I\'m so tired of starting over.', upvotes: 567, comments: 78, timeAgo: '10h ago', username: 'starting_again' },
    ],
    achievements: [
      { id: 'first-step', name: 'First Step', description: 'Logged Day 1', icon: '🌱', condition: () => ({ unlocked: true }) },
      { id: 'one-week', name: 'One Week', description: '7 days clean', icon: '🌿', condition: () => ({ unlocked: true }) },
      { id: 'two-weeks', name: 'Two Weeks', description: '14 days clean', icon: '🌳', condition: () => ({ unlocked: true }) },
      { id: 'craving-fighter', name: 'Craving Fighter', description: 'Resisted a craving', icon: '💪', condition: () => ({ unlocked: true }) },
      { id: '30-days', name: '30 Days', description: '30 days clean', icon: '⭐', condition: () => ({ unlocked: false, progress: '9 days to go' }) },
      { id: 'sleep-champion', name: 'Sleep Champion', description: '7+ hrs for 7 nights', icon: '😴', condition: () => ({ unlocked: false, progress: '3 nights to go' }) },
      { id: 'community-voice', name: 'Community Voice', description: 'First post', icon: '💬', condition: () => ({ unlocked: false }) },
      { id: '3-months', name: '3 Months', description: '90 days clean', icon: '🏆', condition: () => ({ unlocked: false, progress: '69 days to go' }) },
    ],
  },
  // ===== CANNABIS =====
  {
    slug: 'cannabis', name: 'Cannabis', descriptor: 'Flower, edibles & concentrates', icon: '🌿', accentVar: '--substance-cannabis',
    trackers: [
      { id: 'use-log', name: 'Use Log', chartType: 'bar', yAxisLabel: 'Sessions', insight: '16 consecutive days without use. Appetite and sleep are normalizing independently.',
        fields: [{ key: 'sessions', label: 'Sessions today', type: 'number', min: 0, max: 10 }, { key: 'method', label: 'Method', type: 'chips', options: ['Smoked', 'Vaped', 'Edible', 'Dab', 'None'] }, { key: 'amount', label: 'Amount', type: 'chips', options: ['Small', 'Medium', 'Large', 'None'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ sessions: day < 5 ? ri(1, 4 - Math.floor(day * 0.5)) : 0, method: day < 5 ? 'Smoked' : 'None', amount: day < 5 ? pick(['Small', 'Medium']) : 'None', notes: noteFor(day) }),
      },
      { id: 'cravings', name: 'Craving & Triggers', chartType: 'line', yAxisLabel: 'Intensity', insight: 'Evening cravings are your last remaining pattern. Daytime cravings have resolved.',
        fields: [{ key: 'intensity', label: 'Craving intensity', type: 'slider', min: 0, max: 10, step: 1 }, { key: 'trigger', label: 'Trigger', type: 'chips', options: ['Boredom', 'Evening', 'Stress', 'Social', 'Sleep', 'Habit'] }, { key: 'resisted', label: 'Resisted?', type: 'single-select', options: ['Yes', 'No'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ intensity: Math.max(0, rn(7 - day * 0.3, 8 - day * 0.28)), trigger: pick(['Boredom', 'Evening', 'Stress']), resisted: day > 5 ? 'Yes' : pick(['Yes', 'No']), notes: noteFor(day) }),
      },
      { id: 'sleep', name: 'Sleep Recovery', chartType: 'area', yAxisLabel: 'Hours', insight: 'Night sweats resolved by Day 10. Sleep duration back to 7+ hours.',
        fields: [{ key: 'hours', label: 'Sleep hours', type: 'slider', min: 0, max: 12, step: 0.5 }, { key: 'quality', label: 'Quality', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'nightSweats', label: 'Night sweats', type: 'single-select', options: ['Yes', 'No'] }, { key: 'vividDreams', label: 'Vivid dreams', type: 'single-select', options: ['Yes', 'No'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ hours: day < 5 ? rn(3, 5) : day < 10 ? rn(5, 6.5) : rn(6.5, 8), quality: Math.min(10, rn(2 + day * 0.3, 3 + day * 0.25)), nightSweats: day < 10 ? 'Yes' : 'No', vividDreams: day > 3 && day < 14 ? 'Yes' : 'No', notes: noteFor(day) }),
      },
      { id: 'appetite', name: 'Appetite & Weight', chartType: 'line', yAxisLabel: 'Score', insight: 'Appetite returned naturally by Day 12. You\'re eating without cannabis.',
        fields: [{ key: 'appetite', label: 'Appetite', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'mealsEaten', label: 'Meals eaten', type: 'chips', options: ['0', '1', '2', '3+'] }, { key: 'nausea', label: 'Nausea', type: 'single-select', options: ['None', 'Mild', 'Moderate', 'Severe'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ appetite: Math.min(10, rn(2 + day * 0.35, 3 + day * 0.3)), mealsEaten: day > 10 ? '3+' : day > 5 ? '2' : '1', nausea: day < 5 ? pick(['Mild', 'Moderate']) : 'None', notes: noteFor(day) }),
      },
      { id: 'cognitive', name: 'Mental Clarity', chartType: 'area', yAxisLabel: 'Score', insight: 'Focus improved 3.2 points. Motivation returning steadily.',
        fields: [{ key: 'focus', label: 'Focus', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'motivation', label: 'Motivation', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'memory', label: 'Memory', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'brainFog', label: 'Brain fog', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ focus: Math.min(10, rn(3 + day * 0.28, 4 + day * 0.25)), motivation: Math.min(10, rn(2 + day * 0.3, 3 + day * 0.28)), memory: Math.min(10, rn(4 + day * 0.22, 5 + day * 0.2)), brainFog: Math.max(1, rn(8 - day * 0.3, 9 - day * 0.28)), notes: noteFor(day) }),
      },
      { id: 'mood', name: 'Mood & Anxiety', chartType: 'line', yAxisLabel: 'Score', insight: 'Anxiety peaked at Day 5 and has been declining since. Mood stabilizing.',
        fields: [{ key: 'mood', label: 'Mood', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'anxiety', label: 'Anxiety', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'irritability', label: 'Irritability', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ mood: Math.min(10, rn(3 + day * 0.25, 4 + day * 0.22)), anxiety: Math.max(1, day < 5 ? rn(6, 8) : rn(7 - day * 0.3, 8 - day * 0.28)), irritability: Math.max(1, rn(7 - day * 0.28, 8 - day * 0.25)), notes: noteFor(day) }),
      },
    ],
    calculator: {
      title: 'Usage Cost & Recovery',
      inputs: [
        { key: 'gramsPerWeek', label: 'Grams per week', type: 'slider', min: 1, max: 30, step: 1, defaultValue: 7 },
        { key: 'costPerGram', label: 'Cost per gram (₹)', type: 'slider', min: 100, max: 2000, step: 50, defaultValue: 500 },
      ],
      compute: (inputs) => {
        const weekly = inputs.gramsPerWeek * inputs.costPerGram;
        return [
          { label: 'Weekly spend', value: `₹${weekly.toLocaleString()}` },
          { label: 'Monthly spend', value: `₹${Math.round(weekly * 4.3).toLocaleString()}` },
          { label: 'Yearly spend', value: `₹${Math.round(weekly * 52).toLocaleString()}` },
          { label: 'THC clearance', value: 'Heavy users: 30-90 days' },
          { label: 'Cognitive recovery', value: '2-4 weeks for most functions' },
        ];
      },
    },
    activities: [
      { id: 'vivid-dream-journal', name: 'Vivid Dream Journal', duration: '3 min', type: 'journal', fields: [{ key: 'dream', label: 'What did you dream about?', type: 'textarea', placeholder: 'Describe the dream...' }, { key: 'intensity', label: 'Intensity', type: 'slider', min: 1, max: 10, step: 1 }] },
      { id: 'boredom-buster', name: 'Boredom Buster', duration: '2 min', type: 'checklist', items: [{ title: 'Move your body for 5 minutes', content: 'Boredom after quitting is dopamine withdrawal. Movement immediately generates what cannabis used to provide.' }, { title: 'Start something you\'ve been postponing', content: 'The motivation is not coming first. Begin the task — motivation follows action, not the other way around.' }, { title: 'Call or text someone', content: 'Social contact activates reward pathways that cannabis was monopolizing.' }, { title: 'Go outside and walk without your phone', content: 'Environmental change disrupts the craving loop. Walking generates endocannabinoids naturally.' }] },
      { id: 'body-scan', name: 'Body Scan', duration: '5 min', type: 'timer', phases: [{ time: 0, text: 'Start at your head. Notice any tension, warmth, or tingling.' }, { time: 60, text: 'Move to your neck and shoulders. Just observe.' }, { time: 120, text: 'Chest and belly. Feel your breath.' }, { time: 180, text: 'Hands and arms. What sensations are present?' }, { time: 240, text: 'Legs and feet. Stay present.' }, { time: 280, text: 'You are here. Your body is working. That is enough.' }] },
    ],
    articles: [
      { id: 'a1', title: 'Cannabis withdrawal is real — here\'s the timeline', tag: 'Recovery', content: 'Days 1–3: Irritability, sleep disruption, appetite loss. Days 4–7: Peak anxiety, night sweats, vivid dreams. Week 2–3: Gradual normalization. Month 1+: Most symptoms resolved.' },
      { id: 'a2', title: 'Why you can\'t sleep without weed', tag: 'Science', content: 'THC suppresses REM sleep. When you quit, REM rebounds — creating vivid, intense dreams. The rebound resolves in 2–4 weeks.' },
      { id: 'a3', title: 'The motivation question', tag: 'Psychology', content: 'Heavy cannabis use is associated with reduced dopamine in the striatum. The amotivational effect is real during use and resolves with abstinence.' },
      { id: 'a4', title: 'CHS: the vomiting syndrome nobody talks about', tag: 'Health', content: 'Cannabinoid Hyperemesis Syndrome causes severe cyclic vomiting in heavy users. It resolves completely with cessation.' },
      { id: 'a5', title: 'Cannabis and anxiety: the paradox', tag: 'Science', content: 'Cannabis reduces anxiety short-term while increasing baseline anxiety long-term. Most people find anxiety significantly lower at 60–90 days abstinent.' },
    ],
    communityPosts: [
      { id: 'c1', type: 'Milestone', title: 'I read a whole book this week', body: 'I forgot I even liked reading. The fog is lifting.', upvotes: 743, comments: 56, timeAgo: '5h ago', username: 'book_reader' },
      { id: 'c2', type: 'Tip', title: 'Replace the evening smoke with a walk', body: 'I smoked every night at 9pm. Now I walk at 9pm. 6 weeks in, the walk is better.', upvotes: 412, comments: 28, timeAgo: '1d ago', username: 'evening_walker' },
      { id: 'c3', type: 'Question', title: 'Is it normal to feel more anxious after quitting?', body: 'Cannabis was helping my anxiety. Now it\'s worse. Is this permanent?', upvotes: 189, comments: 34, timeAgo: '8h ago', username: 'anxious_quitter' },
      { id: 'c4', type: 'Story', title: 'My friends said I changed', body: 'Heavy use kept me the same person I was at 19. Quitting made me grow.', upvotes: 634, comments: 47, timeAgo: '2d ago', username: 'growing_up' },
      { id: 'c5', type: 'Support', title: 'Smoked after 11 days. Can\'t stop crying.', body: 'I was doing so well. I don\'t know how to start counting again.', upvotes: 278, comments: 52, timeAgo: '3h ago', username: 'starting_over' },
    ],
    achievements: [
      { id: 'first-step', name: 'First Step', description: 'Logged Day 1', icon: '🌱', condition: () => ({ unlocked: true }) },
      { id: 'one-week', name: 'One Week', description: '7 days clean', icon: '🌿', condition: () => ({ unlocked: true }) },
      { id: 'two-weeks', name: 'Two Weeks', description: '14 days clean', icon: '🌳', condition: () => ({ unlocked: true }) },
      { id: 'craving-fighter', name: 'Craving Fighter', description: 'Resisted a craving', icon: '💪', condition: () => ({ unlocked: true }) },
      { id: '30-days', name: '30 Days', description: '30 days clean', icon: '⭐', condition: () => ({ unlocked: false, progress: '9 days to go' }) },
      { id: 'sleep-champion', name: 'Sleep Champion', description: '7+ hrs for 7 nights', icon: '😴', condition: () => ({ unlocked: false }) },
      { id: 'community-voice', name: 'Community Voice', description: 'First post', icon: '💬', condition: () => ({ unlocked: false }) },
      { id: '3-months', name: '3 Months', description: '90 days clean', icon: '🏆', condition: () => ({ unlocked: false, progress: '69 days to go' }) },
    ],
  },
  // ===== STIMULANTS =====
  {
    slug: 'stimulants', name: 'Stimulants', descriptor: 'Cocaine, meth & amphetamines', icon: '⚡', accentVar: '--substance-stimulants',
    banner: { text: '⚠️ Cardiovascular Alert: Stimulant use significantly elevates heart attack risk. Monitor your resting heart rate.', type: 'warning', dismissable: true },
    trackers: [
      { id: 'use-frequency', name: 'Use Frequency', chartType: 'bar', yAxisLabel: 'Grams', insight: '14 consecutive days clean. The physical crash phase is behind you.',
        fields: [{ key: 'used', label: 'Used today', type: 'single-select', options: ['Yes', 'No'] }, { key: 'type', label: 'Type', type: 'chips', options: ['Cocaine', 'Crack', 'Meth', 'Adderall', 'Other'] }, { key: 'amount', label: 'Amount (g)', type: 'number', min: 0, max: 10 }, { key: 'cost', label: 'Cost (₹)', type: 'number', min: 0, max: 50000 }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ used: day < 8 ? (day < 4 ? 'Yes' : pick(['Yes', 'No'])) : 'No', amount: day < 8 ? rn(0, Math.max(0, 2.5 - day * 0.35)) : 0, type: day < 8 ? 'Cocaine' : '', cost: day < 8 ? ri(0, 5000) : 0, notes: noteFor(day) }),
      },
      { id: 'mood-anhedonia', name: 'Mood & Anhedonia', chartType: 'line', yAxisLabel: 'Score', insight: 'Anhedonia resolves over weeks. Dopamine pathways are actively rebuilding.',
        fields: [{ key: 'depression', label: 'Depression', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'anhedonia', label: 'Can you feel pleasure?', type: 'single-select', options: ['None', 'Faint', 'Some', 'Yes'] }, { key: 'anxiety', label: 'Anxiety', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ depression: Math.max(1, rn(9 - day * 0.2, 10 - day * 0.18)), anhedonia: day > 14 ? 'Some' : day > 7 ? 'Faint' : 'None', anxiety: Math.max(1, rn(8 - day * 0.18, 9 - day * 0.16)), notes: noteFor(day) }),
      },
      { id: 'sleep', name: 'Sleep Recovery', chartType: 'area', yAxisLabel: 'Hours', insight: 'Sleep pattern normalizing after crash hypersomnia phase.',
        fields: [{ key: 'hours', label: 'Sleep hours', type: 'slider', min: 0, max: 18, step: 0.5 }, { key: 'quality', label: 'Quality', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'nightmares', label: 'Night terrors', type: 'single-select', options: ['Yes', 'No'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ hours: day < 3 ? rn(14, 16) : day < 8 ? rn(3, 5) : rn(6, 8), quality: day < 3 ? rn(2, 4) : day < 8 ? rn(2, 4) : rn(5, 7), nightmares: day < 8 ? 'Yes' : 'No', notes: noteFor(day) }),
      },
      { id: 'physical', name: 'Physical Health', chartType: 'line', yAxisLabel: 'BPM', insight: 'Heart rate normalized from 118 BPM to 72 BPM.',
        fields: [{ key: 'heartRate', label: 'Resting heart rate (BPM)', type: 'number', min: 40, max: 200 }, { key: 'appetite', label: 'Appetite', type: 'single-select', options: ['None', 'Minimal', 'Normal', 'Increased'] }, { key: 'energy', label: 'Energy', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ heartRate: Math.round(118 - day * 2.2), appetite: day > 10 ? 'Normal' : day > 5 ? 'Minimal' : 'None', energy: Math.min(10, rn(2 + day * 0.3, 3 + day * 0.25)), notes: noteFor(day) }),
      },
      { id: 'cravings', name: 'Cravings & Triggers', chartType: 'line', yAxisLabel: 'Cravings', insight: 'Week 3 cravings are largely psychological.',
        fields: [{ key: 'count', label: 'Craving count', type: 'slider', min: 0, max: 15, step: 1 }, { key: 'peakIntensity', label: 'Peak intensity', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'trigger', label: 'Primary trigger', type: 'chips', options: ['Stress', 'Depression', 'Boredom', 'Social', 'Location', 'Person'] }, { key: 'resisted', label: 'Resisted', type: 'single-select', options: ['Yes', 'No'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ count: Math.max(0, ri(10 - Math.floor(day * 0.4), 12 - Math.floor(day * 0.38))), peakIntensity: Math.max(1, ri(8 - Math.floor(day * 0.3), 9 - Math.floor(day * 0.28))), trigger: pick(['Stress', 'Depression', 'Boredom']), resisted: day > 7 ? 'Yes' : pick(['Yes', 'No']), notes: noteFor(day) }),
      },
      { id: 'risk-behaviors', name: 'Risk Behaviors', chartType: 'bar', yAxisLabel: 'Incidents', insight: 'Zero risk behaviors in 13 days.',
        fields: [{ key: 'behaviors', label: 'Today', type: 'chips', options: ['Drove impaired', 'Financial crisis', 'Relationship incident', 'Legal incident', 'Unsafe sex', 'None'], multiSelect: true }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ behaviors: day < 8 ? [pick(['Financial crisis', 'Relationship incident'])] : ['None'], count: day < 8 ? ri(0, 2) : 0, notes: noteFor(day) }),
      },
    ],
    calculator: {
      title: 'Cardiovascular Risk & Cost',
      inputs: [
        { key: 'gramsPerUse', label: 'Grams per use', type: 'slider', min: 0.1, max: 5, step: 0.1, defaultValue: 0.5 },
        { key: 'timesPerWeek', label: 'Times per week', type: 'slider', min: 1, max: 14, step: 1, defaultValue: 3 },
        { key: 'costPerGram', label: 'Cost per gram (₹)', type: 'slider', min: 1000, max: 20000, step: 500, defaultValue: 5000 },
      ],
      compute: (inputs) => {
        const weekly = inputs.gramsPerUse * inputs.timesPerWeek * inputs.costPerGram;
        return [
          { label: 'Weekly spend', value: `₹${Math.round(weekly).toLocaleString()}` },
          { label: 'Yearly spend', value: `₹${Math.round(weekly * 52).toLocaleString()}` },
          { label: 'Cardiovascular risk', value: 'Cocaine triples heart attack risk for 60 min after each use', color: 'destructive' },
          { label: 'Heart rate recovery', value: '↓ ~40 BPM within 21 days' },
        ];
      },
    },
    activities: [
      { id: 'body-scan', name: 'Body Scan Meditation', duration: '5 min', type: 'timer', phases: [{ time: 0, text: 'Begin at the top of your head. Notice any sensation.' }, { time: 60, text: 'Face, jaw, neck. Is there tension? Just observe.' }, { time: 120, text: 'Chest and shoulders. Let your breath be whatever it is.' }, { time: 180, text: 'Hands and arms. Can you feel your heartbeat?' }, { time: 240, text: 'Belly, lower back, legs, feet.' }, { time: 280, text: 'You exist. You\'re here. Your body is recovering.' }] },
      { id: 'dopamine-rebuild', name: 'Dopamine Rebuild Menu', duration: '3 min', type: 'checklist', items: [{ title: 'Eat something', content: 'Blood sugar stabilization is critical during the crash.' }, { title: 'Walk outside in daylight', content: 'Natural light triggers dopamine and resets circadian rhythm.' }, { title: 'Watch something funny', content: 'Laughter triggers dopamine release — gently.' }, { title: 'Text someone', content: 'Social reconnection releases oxytocin and dopamine.' }] },
      { id: 'heart-rate-log', name: 'Heart Rate Log', duration: '2 min', type: 'journal', fields: [{ key: 'bpm', label: 'Resting heart rate (BPM)', type: 'number', min: 40, max: 200 }, { key: 'chest', label: 'How does your chest feel today?', type: 'textarea', placeholder: 'Tight? Normal? Palpitations?' }] },
    ],
    articles: [
      { id: 'a1', title: 'The dopamine crash', tag: 'Science', content: 'Stimulants flood the brain with 3–5x normal dopamine. The crash is the brain recalibrating. Anhedonia peaks then resolves over 2–4 weeks.' },
      { id: 'a2', title: 'Cocaine and your heart', tag: 'Health', content: 'Cocaine constricts coronary arteries while increasing demand. Most common illicit drug cause of cardiac arrest, even in young people.' },
      { id: 'a3', title: 'Managing depression during withdrawal', tag: 'Recovery', content: 'The depression is neurological — dopamine system recovering. Exercise, sleep, sunlight, and social connection directly support dopamine recovery.' },
      { id: 'a4', title: 'Crystal meth and the brain', tag: 'Science', content: 'Meth damages dopamine neuron terminals. Recovery takes 12–18 months. Brain imaging shows measurable recovery in dopamine transporter density.' },
      { id: 'a5', title: 'Nutrition in stimulant recovery', tag: 'Practical', content: 'Tyrosine-rich foods provide dopamine precursors. Magnesium supports sleep. Omega-3s support neural repair.' },
    ],
    communityPosts: [
      { id: 'c1', type: 'Milestone', title: 'Day 21 — I felt something today. I laughed and it was real.', body: 'I didn\'t know how numb I was until I felt something again.', upvotes: 623, comments: 45, timeAgo: '4h ago', username: 'feeling_again' },
      { id: 'c2', type: 'Tip', title: 'The crash is your brain healing. Reframe it.', body: 'My therapist said: this is your brain recalibrating. That changed everything.', upvotes: 334, comments: 23, timeAgo: '1d ago', username: 'reframed' },
      { id: 'c3', type: 'Question', title: 'Is zero joy for weeks normal?', body: 'Day 18. Nothing registers. Food, music, people — nothing.', upvotes: 289, comments: 38, timeAgo: '6h ago', username: 'empty_inside' },
      { id: 'c4', type: 'Story', title: 'Recovery gave me back my daughter', body: 'She calls me dad again.', upvotes: 712, comments: 67, timeAgo: '2d ago', username: 'dad_restored' },
      { id: 'c5', type: 'Support', title: 'Nobody around me understands', body: 'I\'m so tired of explaining that this isn\'t a choice.', upvotes: 178, comments: 25, timeAgo: '9h ago', username: 'misunderstood' },
    ],
    achievements: [
      { id: 'first-step', name: 'First Step', description: 'Logged Day 1', icon: '🌱', condition: () => ({ unlocked: true }) },
      { id: 'one-week', name: 'One Week', description: '7 days clean', icon: '🌿', condition: () => ({ unlocked: true }) },
      { id: 'two-weeks', name: 'Two Weeks', description: '14 days clean', icon: '🌳', condition: () => ({ unlocked: true }) },
      { id: 'craving-fighter', name: 'Craving Fighter', description: 'Resisted a craving', icon: '💪', condition: () => ({ unlocked: true }) },
      { id: '30-days', name: '30 Days', description: '30 days clean', icon: '⭐', condition: () => ({ unlocked: false, progress: '9 days to go' }) },
      { id: 'sleep-champion', name: 'Sleep Champion', description: '7+ hrs for 7 nights', icon: '😴', condition: () => ({ unlocked: false }) },
      { id: 'community-voice', name: 'Community Voice', description: 'First post', icon: '💬', condition: () => ({ unlocked: false }) },
      { id: '3-months', name: '3 Months', description: '90 days clean', icon: '🏆', condition: () => ({ unlocked: false, progress: '69 days to go' }) },
    ],
  },
  // ===== BENZODIAZEPINES =====
  {
    slug: 'benzodiazepines', name: 'Benzodiazepines', descriptor: 'Xanax, Valium & Klonopin', icon: '💊', accentVar: '--substance-benzodiazepines',
    banner: { text: '✓ Medically supervised taper — Dr. Sharma checked in 3 days ago', type: 'info', dismissable: false },
    trackers: [
      { id: 'taper', name: 'Taper Progress', chartType: 'line', yAxisLabel: 'mg/day', insight: 'Perfectly tracking prescribed schedule.',
        fields: [{ key: 'doseTaken', label: 'Dose taken (mg)', type: 'number', min: 0, max: 20 }, { key: 'asPerscribed', label: 'As prescribed', type: 'single-select', options: ['Yes', 'No'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ doseTaken: day < 7 ? 4 : day < 14 ? 3 : 2, asPrescribed: 'Yes', notes: noteFor(day) }),
      },
      { id: 'anxiety-panic', name: 'Anxiety & Panic', chartType: 'bar', yAxisLabel: 'Level', insight: '2 weeks without a panic attack.',
        fields: [{ key: 'anxiety', label: 'Anxiety', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'panicAttacks', label: 'Panic attacks', type: 'number', min: 0, max: 5 }, { key: 'trigger', label: 'Trigger', type: 'chips', options: ['Morning', 'Dose time', 'Crowded place', 'Alone', 'Other'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ anxiety: Math.max(1, rn(7 - day * 0.25, 8 - day * 0.22)), panicAttacks: day < 7 ? ri(0, 2) : 0, trigger: pick(['Morning', 'Dose time']), notes: noteFor(day) }),
      },
      { id: 'cognitive', name: 'Cognitive Function', chartType: 'area', yAxisLabel: 'Score', insight: 'Brain fog decreased 45% since starting the taper.',
        fields: [{ key: 'memory', label: 'Memory', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'focus', label: 'Focus', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'clarity', label: 'Mental clarity', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'brainFog', label: 'Brain fog', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ memory: Math.min(10, rn(3 + day * 0.25, 4 + day * 0.22)), focus: Math.min(10, rn(3 + day * 0.28, 4 + day * 0.25)), clarity: Math.min(10, rn(3 + day * 0.3, 4 + day * 0.27)), brainFog: Math.max(1, rn(8 - day * 0.3, 9 - day * 0.28)), notes: noteFor(day) }),
      },
      { id: 'withdrawal', name: 'Withdrawal Symptoms', chartType: 'bar', yAxisLabel: 'Severity', insight: 'Symptom burden decreasing with each taper step.',
        fields: [{ key: 'tremors', label: 'Tremors', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] }, { key: 'muscleAches', label: 'Muscle aches', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] }, { key: 'headaches', label: 'Headaches', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] }, { key: 'insomnia', label: 'Insomnia', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => { const s = (d: number) => d < 5 ? pick(['Mild', 'Moderate']) : d < 14 ? pick(['None', 'Mild']) : 'None'; return { tremors: s(day), muscleAches: s(day), headaches: s(day), insomnia: s(day), notes: noteFor(day) }; },
      },
      { id: 'sleep', name: 'Sleep Quality', chartType: 'area', yAxisLabel: 'Hours', insight: 'Sleep improving with taper compliance.',
        fields: [{ key: 'hours', label: 'Hours slept', type: 'slider', min: 0, max: 12, step: 0.5 }, { key: 'quality', label: 'Quality', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'nightAnxiety', label: 'Night anxiety', type: 'single-select', options: ['Yes', 'No'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ hours: Math.min(9, rn(4 + day * 0.18, 5 + day * 0.15)), quality: Math.min(10, rn(3 + day * 0.25, 4 + day * 0.22)), nightAnxiety: day < 10 ? 'Yes' : 'No', notes: noteFor(day) }),
      },
      { id: 'medical', name: 'Medical Supervision', chartType: 'calendar', yAxisLabel: 'Attended', insight: '87.5% of appointments attended.',
        fields: [{ key: 'doctorCheckIn', label: 'Doctor check-in', type: 'single-select', options: ['Yes', 'No'] }, { key: 'therapy', label: 'Therapy session', type: 'single-select', options: ['Yes', 'No'] }, { key: 'adherence', label: 'Medication adherence', type: 'single-select', options: ['Perfect', 'One miss', 'Multiple misses'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ doctorCheckIn: day % 5 === 0 ? 'Yes' : 'No', therapy: day % 3 === 0 ? 'Yes' : 'No', adherence: 'Perfect', attended: day % 3 === 0 || day % 5 === 0, notes: noteFor(day) }),
      },
    ],
    calculator: {
      title: 'Taper Schedule & Equivalents',
      inputs: [
        { key: 'currentDose', label: 'Current daily dose (mg)', type: 'slider', min: 0.5, max: 20, step: 0.5, defaultValue: 4 },
        { key: 'taperWeeks', label: 'Target weeks to complete', type: 'slider', min: 4, max: 26, step: 1, defaultValue: 12 },
      ],
      compute: (inputs) => {
        const weeklyReduction = inputs.currentDose / inputs.taperWeeks;
        const rate = (weeklyReduction / inputs.currentDose) * 100;
        return [
          { label: 'Weekly reduction', value: `${weeklyReduction.toFixed(2)} mg` },
          { label: 'Taper rate', value: `${rate.toFixed(1)}%/week`, color: rate > 15 ? 'destructive' : rate > 10 ? 'accent' : 'primary' },
          { label: 'Safety', value: rate > 15 ? 'Medical review needed' : rate > 10 ? 'Slightly fast' : 'Safe range' },
          { label: 'Disclaimer', value: 'Your doctor must approve all taper changes' },
        ];
      },
    },
    activities: [
      { id: 'diaphragmatic', name: 'Diaphragmatic Breathing', duration: '4 min', type: 'breathing', description: 'Activates GABA — the same system benzos work on.', phases: [{ time: 0, text: 'Inhale into your belly for 4 counts...' }, { time: 4, text: 'Hold for 2 counts...' }, { time: 6, text: 'Exhale slowly for 8 counts...' }, { time: 14, text: 'Rest for 2 counts...' }] },
      { id: 'distraction', name: 'Structured Distraction', duration: '3 min', type: 'checklist', items: [{ title: 'Count objects of one colour', content: 'Colour sorting engages visual cortex — neurologically incompatible with anxiety loop.' }, { title: 'Describe your environment in detail', content: 'Verbal description activates prefrontal cortex, overriding amygdala\'s panic signal.' }, { title: 'Name 5 capitals, 5 animals, 5 foods', content: 'Categorical retrieval occupies the exact region driving the anxiety spiral.' }, { title: 'Write 3 things that went well today', content: 'Interrupts catastrophic thinking by forcing retrieval of positive memory.' }] },
      { id: 'pmr', name: 'Progressive Muscle Relaxation', duration: '5 min', type: 'timer', phases: [{ time: 0, text: 'Feet and calves — tense hard, then release.' }, { time: 60, text: 'Thighs and glutes. Squeeze, hold, let go.' }, { time: 120, text: 'Core and back — tense, exhale and release.' }, { time: 180, text: 'Hands, arms, shoulders — clench, release.' }, { time: 240, text: 'Face — scrunch everything. Hold. Release.' }, { time: 280, text: 'Complete. Parasympathetic nervous system activated.' }] },
    ],
    articles: [
      { id: 'a1', title: 'Why benzo withdrawal can be dangerous', tag: 'Safety', content: 'Benzos enhance GABA. Abrupt cessation can trigger seizures. Always taper under medical supervision.' },
      { id: 'a2', title: 'The Ashton Manual: gold standard taper guide', tag: 'Science', content: 'Dr. Heather Ashton\'s protocol recommends switching to diazepam and reducing by 10% every 1–2 weeks.' },
      { id: 'a3', title: 'Windows and waves: the benzo withdrawal pattern', tag: 'Recovery', content: 'Recovery isn\'t linear — it alternates between "windows" (feeling normal) and "waves" (symptoms return). Both are expected.' },
      { id: 'a4', title: 'Cognitive recovery after benzos', tag: 'Science', content: 'Memory and processing speed improve significantly after taper completion. Most people report being "sharper than they\'ve been in years."' },
      { id: 'a5', title: 'Natural GABA support', tag: 'Practical', content: 'Magnesium, L-theanine, and regular exercise all support natural GABA activity.' },
    ],
    communityPosts: [
      { id: 'c1', type: 'Milestone', title: 'Tapered from 4mg to 1mg over 3 months', body: 'Slow and steady. My doctor said my progress is textbook.', upvotes: 456, comments: 34, timeAgo: '5h ago', username: 'slow_and_steady' },
      { id: 'c2', type: 'Tip', title: 'Get a pill cutter and liquid diazepam for micro-tapers', body: 'The smaller the steps, the easier each one is.', upvotes: 334, comments: 22, timeAgo: '1d ago', username: 'micro_taper' },
      { id: 'c3', type: 'Question', title: 'Is brain fog from benzos permanent?', body: 'I\'ve been on them for 8 years. I\'m scared the fog won\'t lift.', upvotes: 267, comments: 42, timeAgo: '3h ago', username: 'foggy_brain' },
      { id: 'c4', type: 'Story', title: 'Doctor told me I\'d be on them for life. I\'m benzo-free.', body: 'It took 18 months of tapering. Worth every difficult day.', upvotes: 891, comments: 89, timeAgo: '2d ago', username: 'benzo_free' },
      { id: 'c5', type: 'Support', title: 'The waves are so hard. When does it stabilize?', body: 'Had 3 good days then today hit like a truck.', upvotes: 198, comments: 35, timeAgo: '7h ago', username: 'riding_waves' },
    ],
    achievements: [
      { id: 'first-step', name: 'First Step', description: 'Logged Day 1', icon: '🌱', condition: () => ({ unlocked: true }) },
      { id: 'one-week', name: 'One Week', description: '7 days tracked', icon: '🌿', condition: () => ({ unlocked: true }) },
      { id: 'two-weeks', name: 'Two Weeks', description: '14 days tracked', icon: '🌳', condition: () => ({ unlocked: true }) },
      { id: 'craving-fighter', name: 'Craving Fighter', description: 'Resisted a craving', icon: '💪', condition: () => ({ unlocked: true }) },
      { id: '30-days', name: '30 Days', description: '30 days tracked', icon: '⭐', condition: () => ({ unlocked: false, progress: '9 days to go' }) },
      { id: 'sleep-champion', name: 'Sleep Champion', description: '7+ hrs for 7 nights', icon: '😴', condition: () => ({ unlocked: false }) },
      { id: 'community-voice', name: 'Community Voice', description: 'First post', icon: '💬', condition: () => ({ unlocked: false }) },
      { id: '3-months', name: '3 Months', description: '90 days tracked', icon: '🏆', condition: () => ({ unlocked: false, progress: '69 days to go' }) },
    ],
  },
  // ===== KRATOM =====
  {
    slug: 'kratom', name: 'Kratom', descriptor: 'Mitragyna speciosa', icon: '🍃', accentVar: '--substance-kratom',
    trackers: [
      { id: 'dose-log', name: 'Dose Log', chartType: 'bar', yAxisLabel: 'Grams', insight: '14 days without kratom. Opioid receptors recalibrating.',
        fields: [{ key: 'grams', label: 'Grams consumed', type: 'number', min: 0, max: 50 }, { key: 'doses', label: 'Number of doses', type: 'number', min: 0, max: 10 }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ grams: day < 7 ? rn(Math.max(0, 15 - day * 2.5), Math.max(0, 18 - day * 2)) : 0, doses: day < 7 ? ri(1, Math.max(1, 4 - Math.floor(day * 0.5))) : 0, notes: noteFor(day) }),
      },
      { id: 'withdrawal', name: 'Withdrawal Symptoms', chartType: 'stacked-bar', yAxisLabel: 'Burden', insight: 'Physical symptoms tracking typical opioid withdrawal timeline.',
        fields: [{ key: 'muscleAches', label: 'Muscle aches', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] }, { key: 'insomnia', label: 'Insomnia', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] }, { key: 'anxiety', label: 'Anxiety', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'restlessness', label: 'Restlessness', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => { const s = (d: number) => d < 3 ? pick(['Moderate', 'Severe']) : d < 7 ? pick(['Mild', 'Moderate']) : d < 14 ? pick(['None', 'Mild']) : 'None'; return { muscleAches: s(day), insomnia: s(day), anxiety: Math.max(1, ri(8 - Math.floor(day * 0.35), 10 - Math.floor(day * 0.3))), restlessness: s(day), notes: noteFor(day) }; },
      },
      { id: 'mood-energy', name: 'Mood & Energy', chartType: 'line', yAxisLabel: 'Score', insight: 'Energy returning to baseline. Natural energy systems recalibrating.',
        fields: [{ key: 'mood', label: 'Mood', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'energy', label: 'Energy', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'motivation', label: 'Motivation', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ mood: Math.min(10, rn(3 + day * 0.28, 4 + day * 0.25)), energy: Math.min(10, rn(2 + day * 0.3, 3 + day * 0.28)), motivation: Math.min(10, rn(2 + day * 0.32, 3 + day * 0.3)), notes: noteFor(day) }),
      },
      { id: 'cravings', name: 'Cravings', chartType: 'line', yAxisLabel: 'Intensity', insight: 'Cravings declining. Environmental triggers remain strongest.',
        fields: [{ key: 'intensity', label: 'Intensity', type: 'slider', min: 0, max: 10, step: 1 }, { key: 'trigger', label: 'Trigger', type: 'chips', options: ['Habit time', 'Stress', 'Pain', 'Boredom', 'Online forums'] }, { key: 'resisted', label: 'Resisted', type: 'single-select', options: ['Yes', 'No'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ intensity: Math.max(0, rn(8 - day * 0.35, 9 - day * 0.3)), trigger: pick(['Habit time', 'Stress', 'Online forums']), resisted: day > 5 ? 'Yes' : pick(['Yes', 'No']), notes: noteFor(day) }),
      },
      { id: 'sleep', name: 'Sleep Quality', chartType: 'area', yAxisLabel: 'Hours', insight: 'Sleep normalizing after acute withdrawal.',
        fields: [{ key: 'hours', label: 'Sleep hours', type: 'slider', min: 0, max: 12, step: 0.5 }, { key: 'quality', label: 'Quality', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'restlessLegs', label: 'Restless legs', type: 'single-select', options: ['Yes', 'No'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ hours: Math.min(9, rn(3 + day * 0.25, 4 + day * 0.22)), quality: Math.min(10, rn(2 + day * 0.3, 3 + day * 0.28)), restlessLegs: day < 10 ? 'Yes' : 'No', notes: noteFor(day) }),
      },
      { id: 'financial', name: 'Financial Tracking', chartType: 'area', yAxisLabel: '₹ Saved', insight: 'Savings accumulating. Redirect to something meaningful.',
        fields: [{ key: 'bought', label: 'Bought kratom?', type: 'single-select', options: ['Yes', 'No'] }, { key: 'spent', label: 'Amount (₹)', type: 'number', min: 0, max: 10000 }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ bought: day < 5 ? 'Yes' : 'No', spent: day < 5 ? ri(200, 800) : 0, cumulative: Math.round(400 * Math.max(0, 21 - day)), notes: noteFor(day) }),
      },
    ],
    calculator: {
      title: 'Usage Cost & Dependence',
      inputs: [
        { key: 'gramsPerDay', label: 'Grams per day', type: 'slider', min: 1, max: 50, step: 1, defaultValue: 15 },
        { key: 'costPerKg', label: 'Cost per kg (₹)', type: 'slider', min: 1000, max: 10000, step: 500, defaultValue: 3000 },
      ],
      compute: (inputs) => {
        const daily = (inputs.gramsPerDay / 1000) * inputs.costPerKg;
        return [
          { label: 'Daily cost', value: `₹${Math.round(daily)}` },
          { label: 'Monthly cost', value: `₹${Math.round(daily * 30).toLocaleString()}` },
          { label: 'Yearly cost', value: `₹${Math.round(daily * 365).toLocaleString()}` },
          { label: 'Opioid receptor binding', value: 'Mitragynine binds mu-opioid receptors' },
        ];
      },
    },
    activities: [
      { id: 'cold-exposure', name: 'Cold Exposure Therapy', duration: '3 min', type: 'timer', phases: [{ time: 0, text: 'Turn on cold water. Start with your hands and feet.' }, { time: 30, text: 'Let the cold reach your arms and legs.' }, { time: 60, text: 'If you can, let it hit your chest and back.' }, { time: 120, text: 'The gasp reflex is normal. Breathe through it.' }, { time: 150, text: 'You just activated your endorphin system naturally.' }] },
      { id: 'trigger-audit', name: 'Trigger Environment Audit', duration: '3 min', type: 'checklist', items: [{ title: 'Leave kratom subreddits and forums', content: 'These communities normalize use and maintain craving triggers.' }, { title: 'Delete saved vendor websites', content: 'Remove the friction. Make ordering harder.' }, { title: 'Eat a banana and drink water', content: 'Potassium helps with muscle cramps. Hydration reduces symptoms.' }, { title: 'Move to a different room', content: 'Location-based triggers are strongest in kratom addiction.' }] },
      { id: 'use-journal', name: 'Original Use Journal', duration: '5 min', type: 'journal', fields: [{ key: 'originalReason', label: 'What were you originally treating with kratom?', type: 'textarea', placeholder: 'Pain? Anxiety? Low energy?' }, { key: 'stillPresent', label: 'Is that issue still present?', type: 'textarea', placeholder: 'Better, worse, or the same?' }, { key: 'alternative', label: 'One non-kratom thing to address that need today?', type: 'textarea', placeholder: 'Exercise, therapy, doctor visit...' }] },
    ],
    articles: [
      { id: 'a1', title: 'Kratom withdrawal: harder than expected', tag: 'Recovery', content: 'Mitragynine binds to opioid receptors. Withdrawal mirrors opioid symptoms. Physical symptoms resolve in 7–10 days.' },
      { id: 'a2', title: 'Is kratom addiction real?', tag: 'Science', content: 'Mitragynine and 7-hydroxymitragynine bind to mu-opioid receptors. Physical tolerance and dependence develop on the same timescale as other opioids.' },
      { id: 'a3', title: 'Kratom and anxiety: the self-medication spiral', tag: 'Psychology', content: 'Most people started for a reason. Chronic use downregulates the systems that manage anxiety. Baseline anxiety rises. More kratom is needed just to feel normal.' },
      { id: 'a4', title: 'Reddit, vendors, and the kratom community', tag: 'Psychology', content: 'Online communities normalize heavy use. For people trying to quit, these spaces are reliable craving triggers.' },
      { id: 'a5', title: 'Natural energy after kratom', tag: 'Practical', content: 'Morning sunlight, B-complex vitamins, consistent sleep, and regular exercise. Recovery is faster with exercise.' },
    ],
    communityPosts: [
      { id: 'c1', type: 'Milestone', title: 'Day 12 — past my previous record', body: 'I\'ve tried 6 times. I feel like a different person.', upvotes: 312, comments: 28, timeAgo: '4h ago', username: 'new_record' },
      { id: 'c2', type: 'Tip', title: 'Leaving kratom subreddits dropped cravings 50%', body: 'I didn\'t realize how much those communities kept my brain focused.', upvotes: 278, comments: 19, timeAgo: '1d ago', username: 'logged_off' },
      { id: 'c3', type: 'Question', title: 'Does the anxiety ever separate from the kratom?', body: 'I can\'t tell if my anxiety exists without it anymore.', upvotes: 156, comments: 23, timeAgo: '6h ago', username: 'confused_quitter' },
      { id: 'c4', type: 'Story', title: 'I spent ₹96,000 last year on kratom', body: 'I did the math. Then I booked a trip to Thailand.', upvotes: 445, comments: 37, timeAgo: '2d ago', username: 'travel_fund' },
      { id: 'c5', type: 'Support', title: 'The muscle aches are unbearable on Day 3', body: 'I can\'t sleep. Everything aches. Nobody warned me.', upvotes: 178, comments: 31, timeAgo: '8h ago', username: 'day3_pain' },
    ],
    achievements: [
      { id: 'first-step', name: 'First Step', description: 'Logged Day 1', icon: '🌱', condition: () => ({ unlocked: true }) },
      { id: 'one-week', name: 'One Week', description: '7 days clean', icon: '🌿', condition: () => ({ unlocked: true }) },
      { id: 'two-weeks', name: 'Two Weeks', description: '14 days clean', icon: '🌳', condition: () => ({ unlocked: true }) },
      { id: 'craving-fighter', name: 'Craving Fighter', description: 'Resisted a craving', icon: '💪', condition: () => ({ unlocked: true }) },
      { id: '30-days', name: '30 Days', description: '30 days clean', icon: '⭐', condition: () => ({ unlocked: false, progress: '9 days to go' }) },
      { id: 'sleep-champion', name: 'Sleep Champion', description: '7+ hrs for 7 nights', icon: '😴', condition: () => ({ unlocked: false }) },
      { id: 'community-voice', name: 'Community Voice', description: 'First post', icon: '💬', condition: () => ({ unlocked: false }) },
      { id: '3-months', name: '3 Months', description: '90 days clean', icon: '🏆', condition: () => ({ unlocked: false, progress: '69 days to go' }) },
    ],
  },
  // ===== MDMA =====
  {
    slug: 'mdma', name: 'MDMA', descriptor: 'Ecstasy, molly, party drug', icon: '💜', accentVar: '--substance-mdma',
    trackers: [
      { id: 'use-frequency', name: 'Use Frequency', chartType: 'bar', yAxisLabel: 'Uses/month', insight: '32 days since last use. Neurological recovery within reach.',
        fields: [{ key: 'used', label: 'Used today', type: 'single-select', options: ['Yes', 'No'] }, { key: 'amount', label: 'Amount (mg)', type: 'number', min: 0, max: 500 }, { key: 'setting', label: 'Setting', type: 'chips', options: ['Club/festival', 'House party', 'Alone', 'With partner'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ used: day === 0 || day === 14 ? 'Yes' : 'No', amount: day === 0 ? 150 : day === 14 ? 120 : 0, setting: day === 0 ? 'Club/festival' : '', notes: noteFor(day) }),
      },
      { id: 'mood', name: 'Mood & Emotional Recovery', chartType: 'line', yAxisLabel: 'Score', insight: 'Emotional blunting decreased 40%. Authentic emotion returning.',
        fields: [{ key: 'mood', label: 'Overall mood', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'blunting', label: 'Emotional blunting', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'empathy', label: 'Social warmth', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'depression', label: 'Depression', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ mood: Math.min(10, rn(3 + day * 0.28, 4 + day * 0.25)), blunting: Math.max(1, rn(8 - day * 0.3, 9 - day * 0.28)), empathy: Math.min(10, rn(3 + day * 0.3, 4 + day * 0.28)), depression: Math.max(1, rn(7 - day * 0.25, 8 - day * 0.22)), notes: noteFor(day) }),
      },
      { id: 'cognitive', name: 'Cognitive Function', chartType: 'area', yAxisLabel: 'Score', insight: 'Cognitive function improves consistently with abstinence.',
        fields: [{ key: 'memory', label: 'Memory', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'processing', label: 'Processing speed', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'focus', label: 'Focus', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'brainFog', label: 'Brain fog', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ memory: Math.min(10, rn(4 + day * 0.22, 5 + day * 0.2)), processing: Math.min(10, rn(4 + day * 0.25, 5 + day * 0.22)), focus: Math.min(10, rn(4 + day * 0.25, 5 + day * 0.22)), brainFog: Math.max(1, rn(7 - day * 0.28, 8 - day * 0.25)), notes: noteFor(day) }),
      },
      { id: 'sleep', name: 'Sleep Quality', chartType: 'area', yAxisLabel: 'Hours', insight: 'Sleep quality improves significantly by Week 4.',
        fields: [{ key: 'hours', label: 'Hours', type: 'slider', min: 0, max: 12, step: 0.5 }, { key: 'quality', label: 'Quality', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'vividDreams', label: 'Vivid dreams', type: 'single-select', options: ['Yes', 'No'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ hours: Math.min(9, rn(5 + day * 0.15, 6 + day * 0.12)), quality: Math.min(10, rn(3 + day * 0.28, 4 + day * 0.25)), vividDreams: day < 10 ? 'Yes' : 'No', notes: noteFor(day) }),
      },
      { id: 'social', name: 'Social Patterns', chartType: 'bar', yAxisLabel: 'Risk situations', insight: 'Music festivals and club settings remain highest-risk.',
        fields: [{ key: 'situations', label: 'MDMA exposure situations', type: 'chips', options: ['Festival', 'Club', 'House party', 'Friend group', 'None'], multiSelect: true }, { key: 'cravings', label: 'Cravings', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'trigger', label: 'Primary trigger', type: 'chips', options: ['Social setting', 'Music', 'Memory', 'Depression', 'FOMO'] }, { key: 'outcome', label: 'Outcome', type: 'single-select', options: ['Resisted', 'Gave in'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ situations: day % 7 === 0 ? ['Club'] : ['None'], cravings: Math.max(1, rn(6 - day * 0.22, 7 - day * 0.2)), trigger: pick(['Social setting', 'Music', 'FOMO']), outcome: 'Resisted', count: day % 7 === 0 ? 1 : 0, notes: noteFor(day) }),
      },
      { id: 'physical', name: 'Physical Health', chartType: 'line', yAxisLabel: 'Score', insight: 'Physical health improving. Heat regulation normalizing.',
        fields: [{ key: 'energy', label: 'Energy', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'appetite', label: 'Appetite', type: 'single-select', options: ['None', 'Low', 'Normal', 'High'] }, { key: 'jawTension', label: 'Jaw tension', type: 'chips', options: ['None', 'Mild', 'Moderate', 'Severe'] }, { key: 'temperature', label: 'Temperature regulation', type: 'single-select', options: ['Normal', 'Slightly off', 'Hot flashes', 'Chills'] }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ energy: Math.min(10, rn(3 + day * 0.28, 4 + day * 0.25)), appetite: day > 7 ? 'Normal' : day > 3 ? 'Low' : 'None', jawTension: day < 5 ? pick(['Mild', 'Moderate']) : 'None', temperature: day < 7 ? 'Slightly off' : 'Normal', notes: noteFor(day) }),
      },
    ],
    calculator: {
      title: 'Neurotoxicity Risk & Recovery',
      inputs: [
        { key: 'dosePerSession', label: 'Average dose (mg)', type: 'slider', min: 50, max: 500, step: 25, defaultValue: 150 },
        { key: 'sessionsPerMonth', label: 'Sessions per month', type: 'slider', min: 1, max: 8, step: 1, defaultValue: 2 },
        { key: 'yearsOfUse', label: 'Years of use', type: 'slider', min: 1, max: 20, step: 1, defaultValue: 3 },
      ],
      compute: (inputs) => {
        const risk = inputs.dosePerSession > 150 && inputs.sessionsPerMonth > 1 ? 'High' : inputs.sessionsPerMonth > 2 ? 'Moderate' : 'Low';
        return [
          { label: 'Neurotoxicity risk', value: risk, color: risk === 'High' ? 'destructive' : risk === 'Moderate' ? 'accent' : 'primary' },
          { label: 'Recovery timeline', value: `${Math.round(inputs.yearsOfUse * 3)} months estimated` },
          { label: 'Key note', value: 'Heavy use (>150mg, >monthly) causes lasting serotonin changes. Recovery is possible.' },
        ];
      },
    },
    activities: [
      { id: 'mood-checkin', name: 'Mood Tracking Check-in', duration: '2 min', type: 'journal', fields: [{ key: 'mood', label: 'Mood right now (1-10)', type: 'slider', min: 1, max: 10, step: 1 }, { key: 'emotionalTone', label: 'Today\'s emotional tone', type: 'chips', options: ['Flat', 'Sad', 'Anxious', 'Normal', 'Good', 'Great'] }, { key: 'genuineEmotion', label: 'One thing you felt genuine emotion about today', type: 'textarea', placeholder: 'A song, a conversation, something funny...' }] },
      { id: 'serotonin-menu', name: 'Serotonin Restoration Menu', duration: '3 min', type: 'checklist', items: [{ title: 'Exercise for 30 minutes', content: 'Aerobic exercise increases serotonin synthesis. Most evidence-based intervention for MDMA recovery.' }, { title: 'Eat a protein-rich meal', content: 'Tryptophan in eggs, turkey, cheese, legumes is the precursor to serotonin.' }, { title: 'Get 15 minutes of sunlight', content: 'Sunlight directly stimulates serotonin production.' }, { title: 'Have a genuine conversation', content: 'Serotonin mediates social belonging. Don\'t isolate.' }] },
      { id: 'music-listening', name: 'Music Without MDMA', duration: '5 min', type: 'timer', phases: [{ time: 0, text: 'Put on music that has genuinely moved you. Sit with it.' }, { time: 60, text: 'Notice whatever you feel — even if it\'s flat. Notice that too.' }, { time: 150, text: 'The goal isn\'t to feel what you felt on MDMA. Notice what\'s here now.' }, { time: 240, text: 'Music-induced emotion is mediated by serotonin and dopamine. Both recovering.' }, { time: 285, text: 'Stay with whatever is here. This is authentic. This is yours.' }] },
    ],
    articles: [
      { id: 'a1', title: 'What MDMA does to serotonin', tag: 'Science', content: 'MDMA causes 3–5x normal serotonin release. With heavy use, cumulative depletion damages serotonin neuron terminals. Recovery documented over 18 months of abstinence.' },
      { id: 'a2', title: 'The "blue Tuesday" phenomenon', tag: 'Health', content: 'The comedown is serotonin rebound. Severity correlates with dose and frequency. Alcohol significantly worsens comedowns.' },
      { id: 'a3', title: 'MDMA and memory', tag: 'Science', content: 'Verbal memory most consistently affected in heavy users. Most cognitive studies show significant improvement with abstinence within 6–12 months.' },
      { id: 'a4', title: 'Harm reduction approach', tag: 'Practical', content: 'Lower doses (75–100mg), infrequent use (max monthly), test substances, stay hydrated but not over-hydrated.' },
      { id: 'a5', title: 'Rebuilding serotonin naturally', tag: 'Practical', content: 'Aerobic exercise, sunlight, tryptophan-rich nutrition, and quality sleep. Exercise is the most consistently effective intervention.' },
    ],
    communityPosts: [
      { id: 'c1', type: 'Milestone', title: 'Day 30 — I cried at a film tonight. Actually cried.', body: 'I\'d been emotionally flat for months. I forgot I could feel things.', upvotes: 567, comments: 42, timeAgo: '3h ago', username: 'feeling_films' },
      { id: 'c2', type: 'Tip', title: 'The 3-month rule is real', body: 'I was using every 2–3 weeks. When I took 3 months off, I felt more like myself.', upvotes: 445, comments: 31, timeAgo: '1d ago', username: 'three_month_rule' },
      { id: 'c3', type: 'Question', title: 'Is emotional blunting permanent?', body: 'Heavy for 3 years. I just feel flat. Not depressed. Just volume turned down.', upvotes: 289, comments: 38, timeAgo: '5h ago', username: 'flat_feelings' },
      { id: 'c4', type: 'Story', title: 'MDMA helped me process trauma — then became its own problem', body: 'I\'m not sorry I used it. I am sorry I didn\'t stop when I should have.', upvotes: 312, comments: 29, timeAgo: '2d ago', username: 'trauma_processed' },
      { id: 'c5', type: 'Support', title: 'My whole social life is MDMA', body: 'Every festival, every club night — it\'s all built around using.', upvotes: 234, comments: 36, timeAgo: '7h ago', username: 'social_dilemma' },
    ],
    achievements: [
      { id: 'first-step', name: 'First Step', description: 'Logged Day 1', icon: '🌱', condition: () => ({ unlocked: true }) },
      { id: 'one-week', name: 'One Week', description: '7 days clean', icon: '🌿', condition: () => ({ unlocked: true }) },
      { id: 'two-weeks', name: 'Two Weeks', description: '14 days clean', icon: '🌳', condition: () => ({ unlocked: true }) },
      { id: 'craving-fighter', name: 'Craving Fighter', description: 'Resisted a craving', icon: '💪', condition: () => ({ unlocked: true }) },
      { id: '30-days', name: '30 Days', description: '30 days clean', icon: '⭐', condition: () => ({ unlocked: false, progress: '9 days to go' }) },
      { id: 'sleep-champion', name: 'Sleep Champion', description: '7+ hrs for 7 nights', icon: '😴', condition: () => ({ unlocked: false }) },
      { id: 'community-voice', name: 'Community Voice', description: 'First post', icon: '💬', condition: () => ({ unlocked: false }) },
      { id: '3-months', name: '3 Months', description: '90 days clean', icon: '🏆', condition: () => ({ unlocked: false, progress: '69 days to go' }) },
    ],
  },
];

export function getSubstance(slug: string): SubstanceConfig | undefined {
  return substances.find(s => s.slug === slug);
}
