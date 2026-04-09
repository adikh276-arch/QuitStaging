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
        id: 'savings', name: 'Financial Savings', chartType: 'area', yAxisLabel: 'Saved',
        insight: "On track to save a lot this year. That's a flight to Japan.",
        fields: [
          { key: 'bought', label: 'Did you buy alcohol today?', type: 'single-select', options: ['Yes', 'No'] },
          { key: 'spent', label: 'Amount spent ', type: 'number', min: 0, max: 10000 },
          { key: 'baseline', label: 'Baseline daily spend ', type: 'number', min: 0, max: 5000 },
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
        { key: 'costPerDrink', label: 'Cost per drink ', type: 'slider', min: 50, max: 1000, step: 50, defaultValue: 200 },
      ],
      compute: (inputs) => {
        const weekly = inputs.drinksPerDay * inputs.drinkingDays;
        const monthly = inputs.costPerDrink * inputs.drinksPerDay * inputs.drinkingDays * 4.3;
        const yearly = monthly * 12;
        return [
          { label: 'Weekly units', value: `${weekly} units`, color: weekly > 14 ? 'destructive' : 'primary' },
          { label: 'Safe limit', value: '14 units/week' },
          { label: 'Monthly spend', value: `${Math.round(monthly).toLocaleString}` },
          { label: 'Yearly spend', value: `${Math.round(yearly).toLocaleString}` },
          { label: 'Liver risk', value: weekly > 35 ? 'High' : weekly > 14 ? 'Moderate' : 'Low', color: weekly > 35 ? 'destructive' : weekly > 14 ? 'accent' : 'primary' },
          { label: '1-year savings if quit', value: `${Math.round(yearly).toLocaleString}` },
        ];
      },
      note: "Your liver begins regenerating within 72 hours of stopping.",
    },
    activities: [
      {
        id: 'sober-bartender', name: 'Mocktail Mixer', duration: '5 min', type: 'checklist',
        description: 'Create a delicious alcohol-free drink to retrain your reward system.',
        items: [
          { title: 'Choose your base', content: 'Sparkling water, tonic, or kombucha. The fizz and ritual satisfy more than you expect.' },
          { title: 'Add citrus or fruit', content: 'Squeeze lime, muddle berries, or add a splash of cranberry. Visual appeal matters.' },
          { title: 'Garnish like you mean it', content: 'Rosemary sprig, cucumber slice, or a fancy glass. Your brain responds to ceremony.' },
          { title: 'Sip slowly and rate it', content: 'Give your creation a name and a score out of 10. You just replaced a habit with a ritual.' },
        ],
      },
      {
        id: 'liver-love', name: 'Liver Recovery Meditation', duration: '4 min', type: 'timer',
        description: 'A guided body-focused meditation on your liver healing in real time.',
        phases: [
          { time: 0, text: 'Place your right hand over your lower right ribs. Your liver is right there — the size of a football.' },
          { time: 45, text: 'Every second you\'re sober, your liver cells are regenerating. Fatty deposits are mobilizing. This is happening right now.' },
          { time: 90, text: 'Breathe slowly. Imagine healthy blood flowing through clean liver tissue. Your ALT and AST levels are dropping.' },
          { time: 150, text: 'Your liver forgives faster than any organ. Within 2 weeks of stopping, fatty liver begins reversing.' },
          { time: 210, text: 'You are giving your body the one thing it\'s been asking for: time without alcohol. Keep going.' },
        ],
      },
      {
        id: 'social-script', name: 'Social Situation Rehearsal', duration: '3 min', type: 'checklist',
        description: 'Practice what to say when someone offers you a drink.',
        items: [
          { title: '"I\'m driving tonight"', content: 'Simple, universally accepted, ends the conversation. No one argues with the designated driver.' },
          { title: '"I\'m on a health kick"', content: 'Positive framing. People respect self-improvement more than they question it.' },
          { title: '"Not tonight, thanks"', content: 'No explanation needed. Confidence in delivery matters more than the words.' },
          { title: 'Practice your exit strategy', content: 'Know where you parked, have your phone charged, and give yourself permission to leave early. Freedom is the plan.' },
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
    communityPosts: [],
    achievements: [],
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
        id: 'financial-health', name: 'Financial & Health', chartType: 'area', yAxisLabel: 'Saved',
        insight: "Taste and smell returned on Day 7. Lung cancer risk drops 72% at 10 years.",
        fields: [
          { key: 'bought', label: 'Bought cigarettes?', type: 'single-select', options: ['Yes', 'No'] },
          { key: 'spent', label: 'Amount spent ', type: 'number', min: 0, max: 5000 },
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
        { key: 'costPerPack', label: 'Cost per pack ', type: 'slider', min: 50, max: 1000, step: 10, defaultValue: 280 },
        { key: 'yearsSmoked', label: 'Years smoked', type: 'slider', min: 1, max: 50, step: 1, defaultValue: 8 },
      ],
      compute: (inputs) => {
        const daily = (inputs.cigarettesPerDay / 20) * inputs.costPerPack;
        const yearly = daily * 365;
        const total = yearly * inputs.yearsSmoked;
        return [
          { label: 'Daily spend', value: `${Math.round(daily)}` },
          { label: 'Yearly spend', value: `${Math.round(yearly).toLocaleString}` },
          { label: 'Total spent', value: `${Math.round(total).toLocaleString}` },
          { label: 'Carcinogens per cigarette', value: '69 known' },
          { label: '10-year benefit', value: '72% lower lung cancer risk' },
        ];
      },
    },
    activities: [
      {
        id: 'craving-countdown', name: '5-Min Craving Countdown', duration: '5 min', type: 'timer',
        description: 'Nicotine cravings last 3-5 minutes. Outlast this one.',
        phases: [
          { time: 0, text: 'The craving hit. It feels like it\'ll last forever. It won\'t. Start the clock.' },
          { time: 60, text: '1 minute down. Your brain is screaming for nicotine. That scream has a timer.' },
          { time: 150, text: 'Halfway. Chew ice, squeeze your fists, splash cold water on your face. Anything physical.' },
          { time: 240, text: '4 minutes. The nicotine receptor storm is already calming.' },
          { time: 280, text: 'Done. You just weakened a neural pathway. Every craving you beat makes the next one weaker.' },
        ],
      },
      {
        id: 'lung-test', name: 'Lung Capacity Challenge', duration: '3 min', type: 'breathing',
        description: 'Test and train your recovering lungs with progressive breath holds.',
        phases: [
          { time: 0, text: 'Exhale completely. Now inhale as deeply as you possibly can. Fill every corner.' },
          { time: 8, text: 'Hold it. Count silently. How far can you go? Your cilia are regrowing right now.' },
          { time: 20, text: 'Exhale slowly through pursed lips — 10 full seconds. Control the release.' },
          { time: 35, text: 'Again. Deep inhale. Your lung capacity is measurably increasing every smoke-free day.' },
          { time: 50, text: 'Hold. Push past where you stopped last time. Your lungs are adapting.' },
          { time: 65, text: 'Slow exhale. Carbon monoxide left your blood within 48 hours of quitting. Oxygen is winning.' },
        ],
      },
      {
        id: 'hand-replacement', name: 'Hand & Mouth Ritual Swap', duration: '2 min', type: 'checklist',
        description: 'Replace the physical habit of smoking with healthier hand-to-mouth rituals.',
        items: [
          { title: 'Grab a cinnamon stick or toothpick', content: 'The oral fixation is real. Give your mouth something to do. Cinnamon sticks are surprisingly satisfying.' },
          { title: 'Squeeze a stress ball 20 times', content: 'Your hands are used to holding a cigarette. Give them a new job. Squeeze hard on each craving.' },
          { title: 'Drink ice water through a straw', content: 'The inhale-exhale pattern of sipping mimics smoking mechanics. Cold water also triggers a mild endorphin response.' },
          { title: 'Do 10 deep breaths with hand on chest', content: 'Replace the "smoke break" with a "breath break." Same duration, zero carcinogens. Your body won\'t know the difference.' },
        ],
      },
    ],
    articles: [
      { id: 'a1', title: 'What actually happens to your lungs when you quit', tag: 'Health', content: 'Hours 20–48: Carbon monoxide leaves your bloodstream. Blood oxygen normalizes.\n\nDay 14–30: Lung function measurably increases. Cilia start regrowing.\n\n1–9 months: Cilia fully regenerate. Breathlessness decreases.\n\nYour lungs have been trying to heal. You were interrupting the process.' },
      { id: 'a2', title: 'Nicotine cravings last 3–5 minutes', tag: 'Science', content: 'The acute craving is time-limited. It rises, peaks, and falls in 3–5 minutes.\n\nEvery craving you survive weakens the neural pathway. Set a timer. The craving will pass before it ends.' },
      { id: 'a3', title: 'Smoker\'s identity: who are you without cigarettes?', tag: 'Psychology', content: 'People who say "I\'m not a smoker" rather than "I\'m trying to quit" have significantly better outcomes. The language shift moves the decision from willpower to identity.' },
      { id: 'a4', title: 'Vaping as a quit tool: what the evidence says', tag: 'Research', content: 'Vaping delivers nicotine without combustion products. The evidence cautiously supports it as a harm reduction tool. Less harmful does not mean harmless.' },
      { id: 'a5', title: 'The 6 withdrawal symptoms and when they end', tag: 'Recovery', content: 'Irritability: peaks Days 2–3, resolves Week 2.\nHunger: begins within 24 hours.\nInsomnia: Days 2–5.\nBrain fog: Week 1.\nDepression: Days 3–5.\nConstipation: Days 3–5.' },
    ],
    communityPosts: [],
    achievements: [],
  },
  // ===== OPIOIDS =====
  {
    slug: 'opioids', name: 'Opioids', descriptor: 'Prescription & heroin', icon: '💊', accentVar: '--substance-opioids',
    banner: { text: 'On Buprenorphine — Day 21 · Well managed', type: 'info', dismissable: true },
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
      {
        id: 'naloxone-drill', name: 'Naloxone Ready Check', duration: '2 min', type: 'checklist',
        description: 'Ensure your safety net is in place. This could save your life.',
        items: [
          { title: 'Locate your naloxone kit', content: 'Where is it right now? Can someone else find it if you can\'t administer it yourself?' },
          { title: 'Check expiration date', content: 'Expired naloxone is better than none, but fresh is better. Replace if needed — it\'s free at most pharmacies.' },
          { title: 'Tell someone where it is', content: 'Text one person right now: "My naloxone is in [location]." This takes 10 seconds and could save your life.' },
          { title: 'Review the steps', content: 'Call 112. Lay person on side. Administer nasal spray or injection. Rescue breathing if needed. Stay until help arrives.' },
        ],
      },
      {
        id: 'pain-inventory', name: 'Pain Without Opioids', duration: '5 min', type: 'journal',
        description: 'Map your pain and discover what actually needs opioids vs what doesn\'t.',
        fields: [
          { key: 'painLocation', label: 'Where is your pain right now?', type: 'textarea', placeholder: 'Lower back, joints, headache, emotional...' },
          { key: 'painLevel', label: 'Pain level (1-10)', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'nonOpioidTried', label: 'What non-opioid approach could you try?', type: 'textarea', placeholder: 'Heat pad, ibuprofen, stretching, walking, ice...' },
          { key: 'reflection', label: 'Is this pain or craving wearing a pain mask?', type: 'textarea', placeholder: 'Be honest with yourself...' },
        ],
      },
      {
        id: 'safe-person-call', name: 'Safe Person Speed Dial', duration: '3 min', type: 'checklist',
        description: 'When the craving peaks, connection is the strongest medicine.',
        items: [
          { title: 'Open your phone contacts', content: 'Who is your safe person? Sponsor, counselor, friend, family member. Pick one.' },
          { title: 'Send a text right now', content: '"Hey, having a tough moment. Can you talk?" That\'s it. You don\'t need a speech. Just send it.' },
          { title: 'If no one answers, call a hotline', content: 'SAMHSA: 1-800-662-4357. Available 24/7. Free. Confidential. They\'ve heard it all before.' },
          { title: 'Stay on the line or in the chat', content: 'Cravings peak in 15–20 minutes. Stay connected through the peak. The other side is always calmer.' },
        ],
      },
    ],
    articles: [
      { id: 'a1', title: 'MAT is not substitution: what buprenorphine actually does', tag: 'Science', content: 'Buprenorphine is a partial opioid agonist. It stabilizes, doesn\'t get you high. People on MAT are 50% less likely to die from opioid overdose. MAT is recovery.' },
      { id: 'a2', title: 'Physical vs psychological withdrawal', tag: 'Recovery', content: 'Physical: Days 1–7. Psychological: Weeks 2+. Both are real. Both resolve. MAT and behavioral therapy together address both phases.' },
      { id: 'a3', title: 'Overdose risk after abstinence', tag: 'Safety', content: 'Tolerance drops rapidly. The dose that was normal before can be fatal after a week without use. Naloxone reverses overdose. Have it and tell someone where it is.' },
      { id: 'a4', title: 'How pain gets managed without opioids', tag: 'Practical', content: 'Physical therapy, NSAIDs, nerve blocks, mindfulness-based pain management. Multiple approaches that build capacity rather than creating tolerance.' },
      { id: 'a5', title: 'NA vs SMART Recovery', tag: 'Resources', content: 'NA: peer-led, spiritually-oriented. SMART: science-based, CBT-derived. Attendance consistency matters more than which program.' },
    ],
    communityPosts: [],
    achievements: [],
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
        { key: 'costPerGram', label: 'Cost per gram ', type: 'slider', min: 100, max: 2000, step: 50, defaultValue: 500 },
      ],
      compute: (inputs) => {
        const weekly = inputs.gramsPerWeek * inputs.costPerGram;
        return [
          { label: 'Weekly spend', value: `${weekly.toLocaleString}` },
          { label: 'Monthly spend', value: `${Math.round(weekly * 4.3).toLocaleString}` },
          { label: 'Yearly spend', value: `${Math.round(weekly * 52).toLocaleString}` },
          { label: 'THC clearance', value: 'Heavy users: 30-90 days' },
          { label: 'Cognitive recovery', value: '2-4 weeks for most functions' },
        ];
      },
    },
    activities: [
      {
        id: 'vivid-dream-journal', name: 'REM Rebound Dream Log', duration: '3 min', type: 'journal',
        description: 'Cannabis suppressed your dreams. Now they\'re back — intense and wild. Capture them.',
        fields: [
          { key: 'dream', label: 'What did you dream about?', type: 'textarea', placeholder: 'Describe every detail you remember — colors, people, emotions...' },
          { key: 'intensity', label: 'Dream intensity', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'emotion', label: 'Dominant emotion in the dream', type: 'chips', options: ['Fear', 'Joy', 'Confusion', 'Anger', 'Peace', 'Nostalgia'] },
        ],
      },
      {
        id: 'endocannabinoid-boost', name: 'Natural Endocannabinoid Boost', duration: '4 min', type: 'timer',
        description: 'Your body makes its own cannabinoids. This routine activates them without weed.',
        phases: [
          { time: 0, text: 'Start jogging in place or doing jumping jacks. Moderate intensity. Your endocannabinoid system activates with aerobic movement.' },
          { time: 60, text: 'Keep going. At 10+ minutes of moderate exercise, anandamide (your natural THC) begins releasing.' },
          { time: 120, text: 'Feel that warmth spreading? That\'s your runner\'s high — the same receptors cannabis hijacked, now working naturally.' },
          { time: 180, text: 'Slow down gradually. Deep breaths. Your body just produced what it needed without any substance.' },
          { time: 220, text: 'This feeling is real. It\'s yours. And it gets easier to access every day you stay clean.' },
        ],
      },
      {
        id: 'munchie-makeover', name: 'Appetite Recovery Kitchen', duration: '3 min', type: 'checklist',
        description: 'Relearn how to eat and enjoy food without cannabis.',
        items: [
          { title: 'Eat something small — even if you\'re not hungry', content: 'Appetite loss after quitting is temporary. Your ghrelin signaling is recalibrating. A banana, toast, or yogurt is enough.' },
          { title: 'Smell your food before eating', content: 'Cannabis enhanced olfactory processing. Your natural smell-taste connection is rebuilding. Pay attention to it.' },
          { title: 'Set a meal timer for every 4 hours', content: 'Structure replaces the "I\'ll eat when I\'m high" pattern. Your body needs fuel even when it doesn\'t signal hunger.' },
          { title: 'Drink ginger tea for nausea', content: 'Post-cannabis nausea is common in the first week. Ginger directly addresses it without medication.' },
        ],
      },
    ],
    articles: [
      { id: 'a1', title: 'Cannabis withdrawal is real — here\'s the timeline', tag: 'Recovery', content: 'Days 1–3: Irritability, sleep disruption, appetite loss. Days 4–7: Peak anxiety, night sweats, vivid dreams. Week 2–3: Gradual normalization. Month 1+: Most symptoms resolved.' },
      { id: 'a2', title: 'Why you can\'t sleep without weed', tag: 'Science', content: 'THC suppresses REM sleep. When you quit, REM rebounds — creating vivid, intense dreams. The rebound resolves in 2–4 weeks.' },
      { id: 'a3', title: 'The motivation question', tag: 'Psychology', content: 'Heavy cannabis use is associated with reduced dopamine in the striatum. The amotivational effect is real during use and resolves with abstinence.' },
      { id: 'a4', title: 'CHS: the vomiting syndrome nobody talks about', tag: 'Health', content: 'Cannabinoid Hyperemesis Syndrome causes severe cyclic vomiting in heavy users. It resolves completely with cessation.' },
      { id: 'a5', title: 'Cannabis and anxiety: the paradox', tag: 'Science', content: 'Cannabis reduces anxiety short-term while increasing baseline anxiety long-term. Most people find anxiety significantly lower at 60–90 days abstinent.' },
    ],
    communityPosts: [],
    achievements: [],
  },
  // ===== STIMULANTS =====
  {
    slug: 'stimulants', name: 'Stimulants', descriptor: 'Cocaine, meth & amphetamines', icon: '⚡', accentVar: '--substance-stimulants',
    banner: { text: '⚠️ Cardiovascular Alert: Stimulant use significantly elevates heart attack risk. Monitor your resting heart rate.', type: 'warning', dismissable: true },
    trackers: [
      { id: 'use-frequency', name: 'Use Frequency', chartType: 'bar', yAxisLabel: 'Grams', insight: '14 consecutive days clean. The physical crash phase is behind you.',
        fields: [{ key: 'used', label: 'Used today', type: 'single-select', options: ['Yes', 'No'] }, { key: 'type', label: 'Type', type: 'chips', options: ['Cocaine', 'Crack', 'Meth', 'Adderall', 'Other'] }, { key: 'amount', label: 'Amount (g)', type: 'number', min: 0, max: 10 }, { key: 'cost', label: 'Cost ', type: 'number', min: 0, max: 50000 }, { key: 'notes', label: 'Notes', type: 'textarea' }],
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
        { key: 'costPerGram', label: 'Cost per gram ', type: 'slider', min: 1000, max: 20000, step: 500, defaultValue: 5000 },
      ],
      compute: (inputs) => {
        const weekly = inputs.gramsPerUse * inputs.timesPerWeek * inputs.costPerGram;
        return [
          { label: 'Weekly spend', value: `${Math.round(weekly).toLocaleString}` },
          { label: 'Yearly spend', value: `${Math.round(weekly * 52).toLocaleString}` },
          { label: 'Cardiovascular risk', value: 'Cocaine triples heart attack risk for 60 min after each use', color: 'destructive' },
          { label: 'Heart rate recovery', value: '↓ ~40 BPM within 21 days' },
        ];
      },
    },
    activities: [
      {
        id: 'ice-dive', name: 'Ice Water Reset', duration: '2 min', type: 'timer',
        description: 'A cold shock technique that triggers natural dopamine release — the neurotransmitter stimulants depleted.',
        phases: [
          { time: 0, text: 'Fill a bowl with ice water. Submerge your hands up to the wrists. Breathe.' },
          { time: 20, text: 'The cold is uncomfortable. That discomfort is releasing norepinephrine — naturally stimulating your brain.' },
          { time: 45, text: 'Hold for 10 more seconds. Your vagus nerve is activating. Heart rate is slowing.' },
          { time: 60, text: 'Remove your hands. Notice the rush of warmth and alertness. That\'s a 200-300% dopamine increase — no substance required.' },
          { time: 90, text: 'Dry your hands. You just proved your brain can generate intensity without drugs.' },
        ],
      },
      {
        id: 'crash-survival', name: 'Crash Phase Survival Kit', duration: '3 min', type: 'checklist',
        description: 'The stimulant crash is brutal but temporary. This gets you through it.',
        items: [
          { title: 'Eat something high-protein now', content: 'Tyrosine in eggs, chicken, and nuts is the direct precursor to dopamine. Your brain is running on empty — feed it building blocks.' },
          { title: 'Set a 90-minute sleep timer', content: 'Hypersomnia in the crash phase is your brain repairing. Sleep is medicine right now, not laziness.' },
          { title: 'Put your phone across the room', content: 'The urge to scroll or contact dealers peaks during the crash. Physical distance creates decision friction.' },
          { title: 'Drink a full glass of water with electrolytes', content: 'Stimulants cause severe dehydration. Your headache and fatigue are partly fluid loss. Replenish now.' },
        ],
      },
      {
        id: 'pleasure-relearn', name: 'Pleasure Relearning Log', duration: '3 min', type: 'journal',
        description: 'Anhedonia makes everything feel grey. Track the moments when color returns.',
        fields: [
          { key: 'pleasureMoment', label: 'Did anything feel even slightly good today?', type: 'textarea', placeholder: 'A warm shower, a funny text, sunshine on your face...' },
          { key: 'intensity', label: 'How much pleasure? (even 1 counts)', type: 'slider', min: 0, max: 10, step: 1 },
          { key: 'compare', label: 'Compared to last week, is pleasure...', type: 'chips', options: ['Same', 'Slightly more', 'Noticeably more', 'Way more'] },
        ],
      },
    ],
    articles: [
      { id: 'a1', title: 'The dopamine crash', tag: 'Science', content: 'Stimulants flood the brain with 3–5x normal dopamine. The crash is the brain recalibrating. Anhedonia peaks then resolves over 2–4 weeks.' },
      { id: 'a2', title: 'Cocaine and your heart', tag: 'Health', content: 'Cocaine constricts coronary arteries while increasing demand. Most common illicit drug cause of cardiac arrest, even in young people.' },
      { id: 'a3', title: 'Managing depression during withdrawal', tag: 'Recovery', content: 'The depression is neurological — dopamine system recovering. Exercise, sleep, sunlight, and social connection directly support dopamine recovery.' },
      { id: 'a4', title: 'Crystal meth and the brain', tag: 'Science', content: 'Meth damages dopamine neuron terminals. Recovery takes 12–18 months. Brain imaging shows measurable recovery in dopamine transporter density.' },
      { id: 'a5', title: 'Nutrition in stimulant recovery', tag: 'Practical', content: 'Tyrosine-rich foods provide dopamine precursors. Magnesium supports sleep. Omega-3s support neural repair.' },
    ],
    communityPosts: [],
    achievements: [],
  },
  // ===== BENZODIAZEPINES =====
  {
    slug: 'benzodiazepines', name: 'Benzodiazepines', descriptor: 'Xanax, Valium & Klonopin', icon: '💊', accentVar: '--substance-benzodiazepines',
    banner: { text: 'Medically supervised taper — Dr. Sharma checked in 3 days ago', type: 'info', dismissable: false },
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
      {
        id: 'gaba-breathing', name: 'GABA Activation Breathing', duration: '5 min', type: 'breathing',
        description: 'This specific breathing ratio activates your GABA system — the same pathway benzos target.',
        phases: [
          { time: 0, text: 'Inhale through your nose for 4 counts. Fill your belly, not your chest.' },
          { time: 4, text: 'Hold gently for 2 counts. No strain.' },
          { time: 6, text: 'Exhale through pursed lips for 8 counts. The long exhale is the key — it stimulates your vagus nerve.' },
          { time: 14, text: 'Pause for 2 counts. Let your body settle before the next breath.' },
        ],
      },
      {
        id: 'window-wave-log', name: 'Window & Wave Journal', duration: '3 min', type: 'journal',
        description: 'Benzo withdrawal alternates between "windows" (feeling normal) and "waves" (symptoms return). Track the pattern.',
        fields: [
          { key: 'state', label: 'Are you in a window or a wave right now?', type: 'chips', options: ['Window', 'Wave', 'In between'] },
          { key: 'duration', label: 'How long has this phase lasted?', type: 'chips', options: ['Hours', '1 day', '2-3 days', 'A week+'] },
          { key: 'symptoms', label: 'What symptoms are present?', type: 'textarea', placeholder: 'Anxiety, depersonalization, muscle tension, tinnitus...' },
          { key: 'insight', label: 'What helped during your last window?', type: 'textarea', placeholder: 'Walking, magnesium, distraction, sleep...' },
        ],
      },
      {
        id: 'sensory-anchor', name: 'Sensory Grounding Anchor', duration: '3 min', type: 'timer',
        description: 'When depersonalization or panic hits during taper, this pulls you back to reality.',
        phases: [
          { time: 0, text: 'Hold something cold — an ice cube, a cold can, a frozen spoon. Focus entirely on the sensation.' },
          { time: 30, text: 'The cold is real. You are real. Name 5 things you can see. Say them out loud.' },
          { time: 60, text: 'Stamp your feet on the ground. Hard. Feel the floor. You are here.' },
          { time: 90, text: 'Smell something strong — coffee beans, peppermint, citrus peel. Inhale deeply.' },
          { time: 120, text: 'Splash cold water on your wrists. The depersonalization will pass. It always does.' },
          { time: 160, text: 'You are safe. This is withdrawal, not danger. Your brain is recalibrating. This is temporary.' },
        ],
      },
    ],
    articles: [
      { id: 'a1', title: 'Why benzo withdrawal can be dangerous', tag: 'Safety', content: 'Benzos enhance GABA. Abrupt cessation can trigger seizures. Always taper under medical supervision.' },
      { id: 'a2', title: 'The Ashton Manual: gold standard taper guide', tag: 'Science', content: 'Dr. Heather Ashton\'s protocol recommends switching to diazepam and reducing by 10% every 1–2 weeks.' },
      { id: 'a3', title: 'Windows and waves: the benzo withdrawal pattern', tag: 'Recovery', content: 'Recovery isn\'t linear — it alternates between "windows" (feeling normal) and "waves" (symptoms return). Both are expected.' },
      { id: 'a4', title: 'Cognitive recovery after benzos', tag: 'Science', content: 'Memory and processing speed improve significantly after taper completion. Most people report being "sharper than they\'ve been in years."' },
      { id: 'a5', title: 'Natural GABA support', tag: 'Practical', content: 'Magnesium, L-theanine, and regular exercise all support natural GABA activity.' },
    ],
    communityPosts: [],
    achievements: [],
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
      { id: 'financial', name: 'Financial Tracking', chartType: 'area', yAxisLabel: 'Saved', insight: 'Savings accumulating. Redirect to something meaningful.',
        fields: [{ key: 'bought', label: 'Bought kratom?', type: 'single-select', options: ['Yes', 'No'] }, { key: 'spent', label: 'Amount ', type: 'number', min: 0, max: 10000 }, { key: 'notes', label: 'Notes', type: 'textarea' }],
        mockGenerator: (day) => ({ bought: day < 5 ? 'Yes' : 'No', spent: day < 5 ? ri(200, 800) : 0, cumulative: Math.round(400 * Math.max(0, 21 - day)), notes: noteFor(day) }),
      },
    ],
    calculator: {
      title: 'Usage Cost & Dependence',
      inputs: [
        { key: 'gramsPerDay', label: 'Grams per day', type: 'slider', min: 1, max: 50, step: 1, defaultValue: 15 },
        { key: 'costPerKg', label: 'Cost per kg ', type: 'slider', min: 1000, max: 10000, step: 500, defaultValue: 3000 },
      ],
      compute: (inputs) => {
        const daily = (inputs.gramsPerDay / 1000) * inputs.costPerKg;
        return [
          { label: 'Daily cost', value: `${Math.round(daily)}` },
          { label: 'Monthly cost', value: `${Math.round(daily * 30).toLocaleString}` },
          { label: 'Yearly cost', value: `${Math.round(daily * 365).toLocaleString}` },
          { label: 'Opioid receptor binding', value: 'Mitragynine binds mu-opioid receptors' },
        ];
      },
    },
    activities: [
      {
        id: 'cold-shower', name: 'Cold Shower Endorphin Rush', duration: '3 min', type: 'timer',
        description: 'Kratom hijacked your endorphin system. Cold water restarts it naturally.',
        phases: [
          { time: 0, text: 'Turn on cold water. Start with just your hands and feet. The initial shock is normal.' },
          { time: 30, text: 'Let the cold reach your arms and legs. Breathe through the discomfort — in through nose, out through mouth.' },
          { time: 60, text: 'If you can, let it hit your chest and back. Your body is releasing norepinephrine and endorphins right now.' },
          { time: 120, text: 'The gasp reflex is your body activating its stress response — the same system kratom suppressed.' },
          { time: 150, text: 'Step out. Notice the rush of warmth and alertness. That\'s your natural opioid system waking up.' },
        ],
      },
      {
        id: 'digital-detox', name: 'Digital Trigger Purge', duration: '3 min', type: 'checklist',
        description: 'Kratom addiction lives online. Clean your digital environment.',
        items: [
          { title: 'Unsubscribe from kratom subreddits', content: 'r/kratom normalizes heavy use. r/quittingkratom is okay to keep — but only if it motivates, not triggers.' },
          { title: 'Delete vendor bookmarks and apps', content: 'Remove every saved website, auto-fill address, and payment method. Make ordering require effort.' },
          { title: 'Block vendor email addresses', content: 'Those "sale" emails are designed to trigger relapse. Block them or create a filter to auto-delete.' },
          { title: 'Tell your browser to forget', content: 'Clear auto-complete for vendor names. Every friction point you add is a moment to choose differently.' },
        ],
      },
      {
        id: 'root-cause', name: 'Root Cause Explorer', duration: '5 min', type: 'journal',
        description: 'Most people started kratom for a reason. Address that reason directly.',
        fields: [
          { key: 'originalReason', label: 'What were you originally treating with kratom?', type: 'textarea', placeholder: 'Chronic pain? Social anxiety? Low energy? Depression?' },
          { key: 'currentState', label: 'Is that original issue better, worse, or the same without kratom?', type: 'textarea', placeholder: 'Be specific about what\'s changed...' },
          { key: 'alternative', label: 'One thing you can do TODAY to address that root cause', type: 'textarea', placeholder: 'Schedule a doctor visit, try a stretch routine, call a therapist...' },
        ],
      },
    ],
    articles: [
      { id: 'a1', title: 'Kratom withdrawal: harder than expected', tag: 'Recovery', content: 'Mitragynine binds to opioid receptors. Withdrawal mirrors opioid symptoms. Physical symptoms resolve in 7–10 days.' },
      { id: 'a2', title: 'Is kratom addiction real?', tag: 'Science', content: 'Mitragynine and 7-hydroxymitragynine bind to mu-opioid receptors. Physical tolerance and dependence develop on the same timescale as other opioids.' },
      { id: 'a3', title: 'Kratom and anxiety: the self-medication spiral', tag: 'Psychology', content: 'Most people started for a reason. Chronic use downregulates the systems that manage anxiety. Baseline anxiety rises. More kratom is needed just to feel normal.' },
      { id: 'a4', title: 'Reddit, vendors, and the kratom community', tag: 'Psychology', content: 'Online communities normalize heavy use. For people trying to quit, these spaces are reliable craving triggers.' },
      { id: 'a5', title: 'Natural energy after kratom', tag: 'Practical', content: 'Morning sunlight, B-complex vitamins, consistent sleep, and regular exercise. Recovery is faster with exercise.' },
    ],
    communityPosts: [],
    achievements: [],
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
      {
        id: 'emotion-archaeology', name: 'Emotion Archaeology', duration: '3 min', type: 'journal',
        description: 'MDMA made emotions feel superhuman. Rediscover what authentic emotion feels like.',
        fields: [
          { key: 'mood', label: 'Mood right now (1-10)', type: 'slider', min: 1, max: 10, step: 1 },
          { key: 'emotionalTone', label: 'What\'s the dominant feeling?', type: 'chips', options: ['Flat', 'Sad', 'Anxious', 'Content', 'Warm', 'Excited'] },
          { key: 'genuineEmotion', label: 'One thing you felt genuine emotion about today', type: 'textarea', placeholder: 'A kind word, a sunset, a pet, a memory...' },
          { key: 'comparison', label: 'Is your emotional range expanding compared to last week?', type: 'chips', options: ['Yes', 'Same', 'No', 'Not sure'] },
        ],
      },
      {
        id: 'sober-rave', name: 'Sober Music Experience', duration: '5 min', type: 'timer',
        description: 'MDMA hijacked your relationship with music. This rebuilds it — sober, real, and yours.',
        phases: [
          { time: 0, text: 'Put on a track that used to move you — before MDMA, or even during. Close your eyes.' },
          { time: 45, text: 'Don\'t chase the high. Just listen. What do you actually hear? Layers, lyrics, rhythm.' },
          { time: 90, text: 'If it feels flat, that\'s okay. Emotional blunting is serotonin recovering. Notice the flatness without judging it.' },
          { time: 150, text: 'Try moving your body — even slightly. Tap your foot. Nod your head. Let your body respond before your mind.' },
          { time: 210, text: 'If something stirs — even faintly — stay with it. That tiny spark is your serotonin system rebuilding. It gets louder.' },
          { time: 270, text: 'This feeling is real. It\'s not as intense as MDMA. But it\'s yours. And it doesn\'t cost anything.' },
        ],
      },
      {
        id: 'social-rewire', name: 'Connection Without Chemicals', duration: '3 min', type: 'checklist',
        description: 'MDMA created artificial intimacy. Learn to build real connection sober.',
        items: [
          { title: 'Text someone something vulnerable', content: 'Not a meme. Something real. "I\'ve been having a rough time." MDMA made vulnerability easy. Practice it sober.' },
          { title: 'Make eye contact in your next conversation', content: 'MDMA amplified eye contact and connection. Your oxytocin system works without it — just more subtly.' },
          { title: 'Hug someone for 20 seconds', content: 'Extended physical contact releases oxytocin. 20 seconds is the threshold. It feels long. Do it anyway.' },
          { title: 'Write down one relationship that matters', content: 'MDMA made everyone feel like your soulmate. Who actually matters when you\'re sober? That\'s the real list.' },
        ],
      },
    ],
    articles: [
      { id: 'a1', title: 'What MDMA does to serotonin', tag: 'Science', content: 'MDMA causes 3–5x normal serotonin release. With heavy use, cumulative depletion damages serotonin neuron terminals. Recovery documented over 18 months of abstinence.' },
      { id: 'a2', title: 'The "blue Tuesday" phenomenon', tag: 'Health', content: 'The comedown is serotonin rebound. Severity correlates with dose and frequency. Alcohol significantly worsens comedowns.' },
      { id: 'a3', title: 'MDMA and memory', tag: 'Science', content: 'Verbal memory most consistently affected in heavy users. Most cognitive studies show significant improvement with abstinence within 6–12 months.' },
      { id: 'a4', title: 'Harm reduction approach', tag: 'Practical', content: 'Lower doses (75–100mg), infrequent use (max monthly), test substances, stay hydrated but not over-hydrated.' },
      { id: 'a5', title: 'Rebuilding serotonin naturally', tag: 'Practical', content: 'Aerobic exercise, sunlight, tryptophan-rich nutrition, and quality sleep. Exercise is the most consistently effective intervention.' },
    ],
    communityPosts: [],
    achievements: [],
  },
];

export function getSubstance(slug: string): SubstanceConfig | undefined {
  return substances.find(s => s.slug === slug);
}
