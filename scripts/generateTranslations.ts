import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// DISABLE SCRIPT GUARD (Requirement: "Disable script after running")
// Uncomment the line below to run the script. It is intentionally disabled by default.
const DISABLED = true;

if (DISABLED) {
  console.log("Translation script is currently disabled as per requirements. Update scripts/generateTranslations.ts to run.");
  process.exit(0);
}

const API_KEY = process.env.TRANSLATE_API_KEY;

if (!API_KEY) {
  console.error("TRANSLATE_API_KEY not found in environment variables.");
  process.exit(1);
}

const LOCALES_DIR = path.resolve(process.cwd(), 'src/i18n/locales');
const TARGET_LANGS = [
  'es', 'fr', 'pt', 'de', 'ar', 'hi', 'bn', 'zh', 'ja', 'id', 'tr', 'vi', 'ko', 'ru', 'it', 'pl', 'th', 'tl'
];

async function translateText(text: string, targetLanguage: string): Promise<string> {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      target: targetLanguage,
      format: 'text',
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Translate API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
}

async function main() {
  const enPath = path.join(LOCALES_DIR, 'en.json');
  if (!fs.existsSync(enPath)) {
    console.error("en.json does not exist. Please populate English JSON first.");
    process.exit(1);
  }

  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  const allKeys = Object.keys(enContent);
  if (allKeys.length === 0) {
    console.log("No strings to translate in en.json");
    return;
  }

  for (const lang of TARGET_LANGS) {
    const langPath = path.join(LOCALES_DIR, `${lang}.json`);
    let existingContent: Record<string, string> = {};
    if (fs.existsSync(langPath)) {
      try {
        existingContent = JSON.parse(fs.readFileSync(langPath, 'utf-8'));
      } catch (e) {
        existingContent = {};
      }
    }

    const outputContent = { ...existingContent };
    let madeChanges = false;

    console.log(`Translating to ${lang}...`);
    for (const key of allKeys) {
      if (!outputContent[key]) {
        try {
          const translated = await translateText(enContent[key], lang);
          outputContent[key] = translated;
          madeChanges = true;
          console.log(` - Translated [${key}]`);
        } catch (err) {
          console.error(`Error translating key ${key} to ${lang}:`, err);
        }
      }
    }

    if (madeChanges) {
       fs.writeFileSync(langPath, JSON.stringify(outputContent, null, 2));
       console.log(`Saved ${lang}.json`);
    } else {
       console.log(`No new translations for ${lang}`);
    }
  }
}

main().catch(console.error);
