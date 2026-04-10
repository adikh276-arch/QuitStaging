import json
import os
import concurrent.futures
from deep_translator import GoogleTranslator

def is_untranslated(val, en_val):
    if not isinstance(val, str) or not val:
        return False
    if val == en_val and any(c.isalpha() for c in val):
        if val in ["MDMA", "ADHD", "Xanax", "Valium"]:
            return False
        return True
    return False

def translate_single(translator, k, txt):
    # Retry once
    try:
        res = translator.translate(txt)
        return k, res
    except Exception as e:
        try:
            res = translator.translate(txt)
            return k, res
        except:
            return k, None

def parallel_translate(translator, keys, texts, workers=50):
    results = {}
    total = len(keys)
    count = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        future_to_k = {executor.submit(translate_single, translator, k, txt): k for k, txt in zip(keys, texts)}
        for future in concurrent.futures.as_completed(future_to_k):
            k = future_to_k[future]
            k_res, res = future.result()
            if res:
                results[k_res] = res
            count += 1
            if count % 100 == 0:
                print(f"    Translated {count}/{total}")
    return results

def get_keys_to_translate(lang_content, en_content):
    keys_to_translate = []
    texts_to_translate = []
    for k, v in en_content.items():
        if not isinstance(v, str) or not v:
            continue
        current_val = lang_content.get(k)
        if current_val is None or is_untranslated(current_val, v):
            keys_to_translate.append(k)
            texts_to_translate.append(v)
    return keys_to_translate, texts_to_translate

def main():
    en_file = 'src/i18n/locales/en.json'
    with open(en_file, 'r', encoding='utf-8') as f:
        en_content = json.load(f)

    target_langs = [
        'es', 'fr', 'pt', 'de', 'ar', 'hi', 'bn', 'zh', 'ja', 'id', 'tr', 'vi', 'ko', 'ru', 'it', 'pl', 'th', 'tl', 'nl'
    ]
    
    our_codes = {
        'zh': 'zh-CN',
        'tl': 'tl'
    }

    def process_lang(lang):
        lang_file = f'src/i18n/locales/{lang}.json'
        
        if os.path.exists(lang_file):
            try:
                with open(lang_file, 'r', encoding='utf-8') as f:
                    lang_content = json.load(f)
            except:
                lang_content = {}
        else:
            lang_content = {}

        keys, texts = get_keys_to_translate(lang_content, en_content)
        
        print(f"[{lang}] Found {len(keys)} keys to translate out of {len(en_content)} total.")
        if not keys:
            print(f"[{lang}] Already fully translated.\n")
            return

        api_lang = our_codes.get(lang, lang)
        try:
            translator = GoogleTranslator(source='en', target=api_lang)
        except Exception as e:
            print(f"[{lang}] Error init translator: {e}\n")
            return
            
        results = parallel_translate(translator, keys, texts, workers=50)
        
        count = 0
        for k, translated_text in results.items():
            lang_content[k] = translated_text
            count += 1
            
        for k, v in en_content.items():
            if k not in lang_content:
                lang_content[k] = v 
                
        ordered_lang_content = {}
        for k in en_content.keys():
            ordered_lang_content[k] = lang_content.get(k, en_content[k])
            
        with open(lang_file, 'w', encoding='utf-8') as f:
            json.dump(ordered_lang_content, f, ensure_ascii=False, indent=2)
        print(f"[{lang}] Saved file with {count} newly translated items.\n")

    for lang in target_langs:
        process_lang(lang)

if __name__ == '__main__':
    main()
