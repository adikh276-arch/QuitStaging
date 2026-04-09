
import json
import os
import time
from deep_translator import GoogleTranslator

def main():
    LOCALES_DIR = 'src/i18n/locales'
    en_path = os.path.join(LOCALES_DIR, 'en.json')
    
    with open(en_path, 'r', encoding='utf-8') as f:
        en_content = json.load(f)
    
    target_langs = {
        'es': 'es', 'fr': 'fr', 'pt': 'pt', 'de': 'de', 'ar': 'ar', 'hi': 'hi', 
        'bn': 'bn', 'zh': 'zh-CN', 'ja': 'ja', 'id': 'id', 'tr': 'tr', 
        'vi': 'vi', 'ko': 'ko', 'ru': 'ru', 'it': 'it', 'pl': 'pl', 
        'th': 'th', 'tl': 'auto', 'nl': 'nl'
    }
    
    for our_code, google_code in target_langs.items():
        lang_path = os.path.join(LOCALES_DIR, f'{our_code}.json')
        print(f"Syncing {our_code}...")
        
        if os.path.exists(lang_path):
            try:
                with open(lang_path, 'r', encoding='utf-8') as f:
                    lang_content = json.load(f)
            except:
                lang_content = {}
        else:
            lang_content = {}
            
        # 1. Update/Add keys from en.json
        # Identify missing or untranslated keys (those that are equal to English version but shouldn't be?)
        # Actually, if it's in English, it's a fallback.
        
        missing_keys = [k for k in en_content.keys() if k not in lang_content]
        
        print(f" - Found {len(missing_keys)} missing keys for {our_code}.")
        
        # Populate missing keys with English immediately to ensure consistency
        for k in missing_keys:
            lang_content[k] = en_content[k]

        # 2. Try to translate some of the untranslated items
        # We prioritize UI and metadata (already done mostly)
        # Any article content that is still in English?
        
        untranslated = [k for k in en_content.keys() if lang_content[k] == en_content[k] and en_content[k].strip() != ""]
        
        if untranslated and our_code != 'en':
            print(f" - Attempting to translate {min(100, len(untranslated))} untranslated items for {our_code}...")
            translator = GoogleTranslator(source='en', target=google_code)
            count = 0
            for k in untranslated:
                try:
                    val = en_content[k]
                    translated = translator.translate(val)
                    if translated:
                        lang_content[k] = translated
                        count += 1
                    if count >= 100: break # Small batch to keep it moving
                    if count % 20 == 0: time.sleep(0.5)
                except:
                    break
            print(f" - Translated {count} items.")

        # 3. Save sorted content
        sorted_content = {k: lang_content[k] for k in en_content.keys()}
        with open(lang_path, 'w', encoding='utf-8') as f:
            json.dump(sorted_content, f, ensure_ascii=False, indent=2)
            
        print(f" - Saved {our_code}.json (Total keys: {len(sorted_content)})")

if __name__ == "__main__":
    main()
