import json
import re
import os

with open('src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en = json.load(f)

# Extract which keys have which markers
keys_with_markers = {}
for k, v in en.items():
    markers = re.findall(r'\{\{(.*?)\}\}', v)
    if markers:
        keys_with_markers[k] = markers

locale_dir = 'src/i18n/locales'
for filename in os.listdir(locale_dir):
    if not filename.endswith('.json') or filename == 'en.json':
        continue
    
    path = os.path.join(locale_dir, filename)
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    for k, markers in keys_with_markers.items():
        if k in data:
            val = data[k]
            # Find whatever is inside {{ }} in the translated text
            translated_markers = re.findall(r'\{\{(.*?)\}\}', val)
            if len(translated_markers) == len(markers):
                for i in range(len(markers)):
                    if translated_markers[i] != markers[i]:
                        # Replace the wrong marker with the correct one
                        # Using regex to handle the specific position
                        pattern = r'\{\{' + re.escape(translated_markers[i]) + r'\}\}'
                        val = re.sub(pattern, '{{' + markers[i] + '}}', val)
                        modified = True
                data[k] = val
    
    if modified:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Fixed markers in {filename}")
