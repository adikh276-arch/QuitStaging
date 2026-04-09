
import json
import os

def main():
    LOCALES_DIR = 'src/i18n/locales'
    en_path = os.path.join(LOCALES_DIR, 'en.json')
    with open(en_path, 'r', encoding='utf-8') as f:
        en_content = json.load(f)
    
    langs = ['es', 'fr', 'pt', 'de', 'ar', 'hi', 'bn', 'zh', 'ja', 'id', 'tr', 'vi', 'ko', 'ru', 'it', 'pl', 'th', 'tl', 'nl']
    
    for lang in langs:
        path = os.path.join(LOCALES_DIR, f'{lang}.json')
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                content = json.load(f)
        else:
            content = {}
            
        # Forces all keys from EN to exist
        final = {}
        for k in en_content.keys():
            final[k] = content.get(k, en_content[k])
            
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(final, f, ensure_ascii=False, indent=2)
        print(f"Synced {lang}")

if __name__ == "__main__":
    main()
