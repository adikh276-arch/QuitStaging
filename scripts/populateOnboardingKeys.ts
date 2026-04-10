import fs from 'fs';
import path from 'path';

const LOCALES_DIR = path.resolve(process.cwd(), 'src/i18n/locales');
const TARGET_LANGS = [
  'es', 'fr', 'pt', 'de', 'ar', 'hi', 'bn', 'zh', 'ja', 'id', 'tr', 'vi', 'ko', 'ru', 'it', 'pl', 'th', 'tl'
];

const ONBOARDING_KEYS = {
  "quit.app.onboarding.quit_date": "Set your quit date",
  "quit.app.onboarding.quit_subtitle": "When did you last use {{substance}}?",
  "quit.app.onboarding.today": "Today",
  "quit.app.onboarding.today_desc": "Fresh start today",
  "quit.app.onboarding.yesterday": "Yesterday",
  "quit.app.onboarding.yesterday_desc": "Starting from yesterday",
  "quit.app.onboarding.3days": "3 days ago",
  "quit.app.onboarding.3days_desc": "Building some momentum",
  "quit.app.onboarding.week": "A week ago",
  "quit.app.onboarding.week_desc": "The first milestone reached",
  "quit.app.onboarding.custom": "Custom date",
  "quit.app.onboarding.custom_desc": "Set a specific start date",
  "quit.app.onboarding.your_why": "Find your 'Why'",
  "quit.app.onboarding.motivation_subtitle": "What's your primary motivation?",
  "quit.app.onboarding.triggers_title": "Identify triggers",
  "quit.app.onboarding.triggers_subtitle": "What often leads to use?",
  "quit.app.onboarding.continue": "Continue",
  "quit.app.onboarding.start_tracking": "Start Tracking"
};

async function main() {
  for (const lang of TARGET_LANGS) {
    const langPath = path.join(LOCALES_DIR, `${lang}.json`);
    if (!fs.existsSync(langPath)) continue;

    console.log(`Adding onboarding keys to ${lang}.json...`);
    const content = JSON.parse(fs.readFileSync(langPath, 'utf-8'));
    
    // Check if keys already exist (don't overwrite if they do)
    let added = 0;
    for (const [key, value] of Object.entries(ONBOARDING_KEYS)) {
      if (!content[key]) {
        content[key] = value;
        added++;
      }
    }

    if (added > 0) {
      // Sort keys for consistency
      const sorted = Object.keys(content).sort().reduce((obj, key) => {
        obj[key] = content[key];
        return obj;
      }, {});
      
      fs.writeFileSync(langPath, JSON.stringify(sorted, null, 2));
      console.log(` - Added ${added} keys to ${lang}.json`);
    } else {
      console.log(` - No keys to add for ${lang}.json`);
    }
  }
}

main().catch(console.error);
