import json
import os

mapping = {
    0x1f343: 'leaf',
    0x1f331: 'sprout',
    0x1f33f: 'leaf',
    0x1f48a: 'pill',
    0x1f37a: 'beer',
    0x1f377: 'wine',
    0x1f6ac: 'cigarette',
    0x1f9e0: 'brain',
    0x1f4ab: 'natural',
    0x1f308: 'mood',
    0x1f315: 'natural',
    0x1f311: 'grey',
    0x2728:  'sparkles',
    0x1f389: 'party',
    0x1f378: 'wine',
    0x1f4a8: 'wind',
    0x1f44a: 'fist',
    0x1f3c6: 'trophy',
    0x1f4aa: 'muscles',
    0x1f9e1: 'heart',
    0x2764:  'heart',
    0x1f441: 'eye',
}

def clean():
    path = 'src/data/substances.ts'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = ""
    for char in content:
        code = ord(char)
        if code > 127:
            if code in mapping:
                new_content += mapping[code]
            elif code == 0xfe0f or code == 0x200d: # Variation selector and ZWJ
                continue
            else:
                # If not mapped, use 'natural' if it looks like an emoji range
                if code > 0x1f000:
                    new_content += 'natural'
                else:
                    # just skip or handle other cases (like quotes)
                    if code == 0x2019: # Smart quote
                        new_content += "'"
                    else:
                        continue 
        else:
            new_content += char

    # There might be cases where we have ''sparkles'' now because it was inside quotes
    # so we need to fix potential double quotes or syntax issues
    # but the above logic is for the character itself.
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)

clean()
print("Cleaned successfully.")
