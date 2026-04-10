import fs from 'fs';
import path from 'path';

const LOCALES_DIR = path.resolve(process.cwd(), 'src/i18n/locales');
const TARGET_LANGS = [
  'es', 'fr', 'pt', 'de', 'ar', 'hi', 'bn', 'zh', 'ja', 'id', 'tr', 'vi', 'ko', 'ru', 'it', 'pl', 'th', 'tl'
];

async function main() {
  const enPath = path.join(LOCALES_DIR, 'en.json');
  if (!fs.existsSync(enPath)) {
    console.error("en.json not found.");
    return;
  }

  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  
  for (const lang of TARGET_LANGS) {
    const langPath = path.join(LOCALES_DIR, `${lang}.json`);
    if (!fs.existsSync(langPath)) continue;

    console.log(`Fixing placeholders in ${lang}.json...`);
    const content = JSON.parse(fs.readFileSync(langPath, 'utf-8'));
    let fixedCount = 0;

    for (const key in enContent) {
      if (!content[key]) continue;

      const enValue = enContent[key];
      const targetValue = content[key];

      // Find all placeholders in English: {{var}}
      const enPlaceholders = enValue.match(/\{\{([^}]+)\}\}/g) || [];
      // Find all placeholders in target (might be translated or have spaces)
      // This regex looks for anything between {{ and }} even if it contains non-english chars
      const targetPlaceholders = targetValue.match(/\{\{([^}]+)\}\}/g) || [];

      if (enPlaceholders.length > 0) {
        let newTargetValue = targetValue;
        
        // Strategy: Match by order. If English has 2 placeholders, we assume the target should have 2 in the same relative order.
        if (enPlaceholders.length === targetPlaceholders.length) {
          for (let i = 0; i < enPlaceholders.length; i++) {
            if (enPlaceholders[i] !== targetPlaceholders[i]) {
              newTargetValue = newTargetValue.replace(targetPlaceholders[i], enPlaceholders[i]);
              fixedCount++;
            }
          }
        } else if (targetPlaceholders.length > 0) {
          // If 1-to-1 match fails, try a more aggressive approach for common translations
          // or just assume the first English placeholder should replace everything between {{ }}
          for (const tp of targetPlaceholders) {
             // If the target placeholder is not in English, it's likely translated
             if (!enPlaceholders.includes(tp)) {
                // Determine which English placeholder it might correspond to (favoring order)
                // For now, if there is only 1 type of placeholder in English, use it.
                if (enPlaceholders.length === 1) {
                  newTargetValue = newTargetValue.replace(tp, enPlaceholders[0]);
                  fixedCount++;
                }
             }
          }
        }
        
        // Also fix spaced placeholders like { { var } }
        const spacedMatch = newTargetValue.match(/\{\s*\{\s*([^}]+)\s*\}\s*\}/g) || [];
        for (const sm of spacedMatch) {
            const inner = sm.match(/\{\s*\{\s*([^}]+)\s*\}\s*\}/)![1].trim();
            // find matching english placeholder ignoring case
            const matchingEn = enPlaceholders.find(p => p.toLowerCase().includes(inner.toLowerCase())) || enPlaceholders[0];
            if (matchingEn) {
                newTargetValue = newTargetValue.replace(sm, matchingEn);
                fixedCount++;
            }
        }

        content[key] = newTargetValue;
      }
    }

    if (fixedCount > 0) {
      fs.writeFileSync(langPath, JSON.stringify(content, null, 2));
      console.log(` - Fixed ${fixedCount} placeholders in ${lang}.json`);
    } else {
      console.log(` - No fixes needed for ${lang}.json`);
    }
  }
}

main().catch(console.error);
