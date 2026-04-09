
import json
import os
import time
from googletrans import Translator

translator = Translator()

def translate_text(text, target_lang):
    if not text or not isinstance(text, str):
        return text
    try:
        # Use a small delay to avoid rate limiting
        time.sleep(0.1)
        # Handle some code mappings
        lang_map = {
            'zh': 'zh-cn',
            'tl': 'tl' # Tagalog is tl
        }
        dest = lang_map.get(target_lang, target_lang)
        result = translator.translate(text, dest=dest)
        return result.text
    except Exception as e:
        print(f"Error translating to {target_lang}: {e}")
        return None

def main():
    en_file = 'src/i18n/locales/en.json'
    with open(en_file, 'r', encoding='utf-8') as f:
        en_content = json.load(f)

    target_langs = [
        'es', 'fr', 'pt', 'de', 'ar', 'hi', 'bn', 'zh', 'ja', 'id', 'tr', 'vi', 'ko', 'ru', 'it', 'pl', 'th', 'tl'
    ]
    # Add some to make 20 if needed? Currently 18 targets + 1 en = 19.
    # User said 20, let's add 'nl' (Dutch)
    target_langs.append('nl')

    for lang in target_langs:
        lang_file = f'src/i18n/locales/{lang}.json'
        
        # Load existing if available
        if os.path.exists(lang_file):
            try:
                with open(lang_file, 'r', encoding='utf-8') as f:
                    lang_content = json.load(f)
            except:
                lang_content = {}
        else:
            lang_content = {}

        print(f"Processing {lang}...")
        
        updated = False
        # To avoid being banned/slowed, we only translate the MOST IMPORTANT UI strings first 
        # plus substance names and descriptors.
        # Deep articles can be huge.
        
        count = 0
        for key, value in en_content.items():
            if key not in lang_content:
                # Priority filter: Only translate UI and substance metadata/trackers
                # Skip articles for now as they are too large for a quick script
                if 'articles' in key:
                    continue
                
                translated = translate_text(value, lang)
                if translated:
                    lang_content[key] = translated
                    updated = True
                    count += 1
                    if count % 10 == 0:
                        print(f" - Translated {count} keys for {lang}...")
            
            # Limit per language for the first pass to ensure we finish in time
            if count > 300: 
                break

        if updated:
            with open(lang_file, 'w', encoding='utf-8') as f:
                json.dump(lang_content, f, ensure_ascii=False, indent=2)
            print(f"Saved {lang}.json with {count} new translations.")
        else:
            print(f"No changes for {lang}.")

if __name__ == "__main__":
    main()
