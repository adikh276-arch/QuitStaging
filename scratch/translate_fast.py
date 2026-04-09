
import json
import os
import time
from deep_translator import GoogleTranslator

def main():
    en_file = 'src/i18n/locales/en.json'
    with open(en_file, 'r', encoding='utf-8') as f:
        en_content = json.load(f)

    target_langs = [
        'es', 'fr', 'pt', 'de', 'ar', 'hi', 'bn', 'zh-CN', 'ja', 'id', 'tr', 'vi', 'ko', 'ru', 'it', 'pl', 'th', 'auto'
    ]
    # Map back to our codes
    our_codes = {
        'zh-CN': 'zh',
        'auto': 'tl' # Tagalog is tl
    }

    translator_map = {}
    for lang in target_langs:
        our_code = our_codes.get(lang, lang)
        translator_map[our_code] = GoogleTranslator(source='en', target=lang)

    for lang_code, translator in translator_map.items():
        lang_file = f'src/i18n/locales/{lang_code}.json'
        
        if os.path.exists(lang_file):
            try:
                with open(lang_file, 'r', encoding='utf-8') as f:
                    lang_content = json.load(f)
            except:
                lang_content = {}
        else:
            lang_content = {}

        print(f"Processing {lang_code}...")
        
        # Priority items first
        keys_to_translate = [k for k in en_content.keys() if k not in lang_content and 'articles' not in k]
        
        if not keys_to_translate:
            print(f" - No new keys for {lang_code}")
            continue

        # Batch translate if possible or just loop
        count = 0
        for key in keys_to_translate:
            try:
                translated = translator.translate(en_content[key])
                if translated:
                    lang_content[key] = translated
                    count += 1
                if count % 20 == 0:
                    print(f" - Translated {count} keys for {lang_code}...")
                if count > 500: break # Safety
            except Exception as e:
                print(f"Error for {key} in {lang_code}: {e}")
                break

        with open(lang_file, 'w', encoding='utf-8') as f:
            json.dump(lang_content, f, ensure_ascii=False, indent=2)
        print(f"Saved {lang_code}.json with {count} new translations.")

if __name__ == "__main__":
    main()
