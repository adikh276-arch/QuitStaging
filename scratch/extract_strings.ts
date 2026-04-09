
import { substances } from '../src/data/substances';
import fs from 'fs';
import path from 'path';

const translations: Record<string, string> = {};

// Common UI strings (some assumed)
translations['app.title'] = 'Quit App';
translations['app.back'] = 'Back';
translations['app.days_clean'] = 'Days Clean';
translations['app.recovery_progress'] = 'Recovery Progress';
translations['app.daily_trackers'] = 'Daily Trackers';
translations['app.tools_resources'] = 'Tools & Resources';
translations['app.done'] = 'Done';
translations['app.log'] = 'Log';
translations['app.no_data'] = 'No data yet';
translations['app.streak'] = 'Streak';
translations['app.recovery'] = 'Recovery';
translations['app.started'] = 'Started';

substances.forEach(sub => {
  const prefix = `substances.${sub.slug}`;
  translations[`${prefix}.name`] = sub.name;
  translations[`${prefix}.descriptor`] = sub.descriptor;
  
  if (sub.banner) {
    translations[`${prefix}.banner.text`] = sub.banner.text;
  }

  sub.trackers.forEach(tracker => {
    const tPrefix = `${prefix}.trackers.${tracker.id}`;
    translations[`${tPrefix}.name`] = tracker.name;
    translations[`${tPrefix}.insight`] = tracker.insight;
    translations[`${tPrefix}.yAxisLabel`] = tracker.yAxisLabel;

    tracker.fields.forEach(field => {
      const fPrefix = `${tPrefix}.fields.${field.key}`;
      translations[`${fPrefix}.label`] = field.label;
      if (field.options) {
        field.options.forEach((opt, idx) => {
          translations[`${fPrefix}.options.${idx}`] = opt;
        });
      }
    });
  });

  if (sub.calculator) {
    const cPrefix = `${prefix}.calculator`;
    translations[`${cPrefix}.title`] = sub.calculator.title;
    if (sub.calculator.note) {
      translations[`${cPrefix}.note`] = sub.calculator.note;
    }
    sub.calculator.inputs.forEach(input => {
      translations[`${cPrefix}.inputs.${input.key}.label`] = input.label;
    });
    // The compute function returns labels too, but they are hardcoded in the function.
    // This script won't catch those easily without executing the function.
  }

  sub.activities.forEach(act => {
    const aPrefix = `${prefix}.activities.${act.id}`;
    translations[`${aPrefix}.name`] = act.name;
    translations[`${aPrefix}.description`] = act.description;
    
    if (act.type === 'quiz' && act.questions) {
      act.questions.forEach((q, qidx) => {
        translations[`${aPrefix}.questions.${qidx}.question`] = q.question;
        translations[`${aPrefix}.questions.${qidx}.explanation`] = q.explanation;
        q.options.forEach((opt, oidx) => {
          translations[`${aPrefix}.questions.${qidx}.options.${oidx}`] = opt;
        });
      });
    }

    if (act.type === 'body-scan' && act.bodyZones) {
      act.bodyZones.forEach((z, zidx) => {
        translations[`${aPrefix}.bodyZones.${zidx}.name`] = z.name;
        translations[`${aPrefix}.bodyZones.${zidx}.prompt`] = z.prompt;
      });
    }

    if (act.type === 'affirmation' && act.affirmations) {
      act.affirmations.forEach((aff, affidx) => {
        translations[`${aPrefix}.affirmations.${affidx}`] = aff;
      });
    }

    if (act.type === 'visualization' && act.scenes) {
      act.scenes.forEach((s, sidx) => {
        translations[`${aPrefix}.scenes.${sidx}.text`] = s.text;
      });
    }
    
    if (act.type === 'sorting' && act.sortItems) {
      translations[`${aPrefix}.tapPrompt`] = act.tapPrompt || '';
      act.sortItems.forEach((item, iidx) => {
        translations[`${aPrefix}.sortItems.${iidx}.text`] = item.text;
      });
      act.sortCategories?.forEach((cat, cidx) => {
        translations[`${aPrefix}.sortCategories.${cidx}`] = cat;
      });
    }
    
    if (act.type === 'tap-game') {
      translations[`${aPrefix}.tapPrompt`] = act.tapPrompt || '';
    }
  });

  sub.articles.forEach(art => {
    const artPrefix = `${prefix}.articles.${art.id}`;
    translations[`${artPrefix}.title`] = art.title;
    translations[`${artPrefix}.tag`] = art.tag;
    translations[`${artPrefix}.content`] = art.content;
  });
});

fs.writeFileSync('src/i18n/locales/en.json', JSON.stringify(translations, null, 2));
console.log('Extracted all strings to en.json');
