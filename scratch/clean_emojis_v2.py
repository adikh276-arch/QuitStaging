import re
import os

with open('src/data/substances.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def find_emojis(text):
    # This range covers most common emojis
    emoji_pattern = re.compile(
        "["
        "\U0001f600-\U0001f64f"  # emoticons
        "\U0001f300-\U0001f5ff"  # symbols & pictographs
        "\U0001f680-\U0001f6ff"  # transport & map symbols
        "\U0001f1e0-\U0001f1ff"  # flags (iOS)
        "\U00002702-\U000027b0"
        "\U000024c2-\U0001f251"
        "\U0001f900-\U0001f9ff"  # food, animals, etc.
        "\u200d"                 # Zero Width Joiner
        "]+", flags=re.UNICODE
    )
    return set(emoji_pattern.findall(text))

found = find_emojis(content)
print(f"Found emojis: {[repr(e) for e in found]}")

# Mapping for specific identified emojis
mapping = {
    '\U0001f343': 'leaf',      # 🍃
    '\U0001f331': 'sprout',    # 🌱
    '\U0001f33f': 'leaf',      # 🌿
    '\U0001f48a': 'pill',      # 💊
    '\U0001f37a': 'beer',      # 🍺
    '\U0001f377': 'wine',      # 🍷
    '\U0001f6ac': 'cigarette', # 🚬
    '\U0001f9e0': 'brain',     # 🧠
    '\U0001f4ab': 'natural',   # 💫
    '\U0001f308': 'mood',      # 🌈
    '\U0001f315': 'natural',   # 🌕 (Moon)
    '\U0001f311': 'grey',      # 🌑
    '\u2728': 'sparkles',      # ✨
    '\U0001f389': 'party',     # 🎉
    '\U0001f378': 'wine',      # 🍸
    '\U0001f4a8': 'wind',      # 💨
    '\ua9': '', # Copyright? 
    '\ufe0f': '', # Variation selector
    '\u200d': '', # ZWJ
}

for e, key in mapping.items():
    if key:
        content = content.replace(f"'{e}'", f"'{key}'")
        content = content.replace(f'"{e}"', f'"{key}"')
    else:
        content = content.replace(e, '')

# Final sweep of remaining raw emojis in strings
def final_clean(match):
    e = match.group(0)
    # If we have a key for this emoji, use it, else default to 'natural'
    return mapping.get(e, 'natural')

# This is tricky because some are in values like text: '... 🌈 ...'
# We should probably replace them with empty space in long text, 
# and with a key in property values like emoji: '...'

# 1. Replace emojis in properties: emoji: '??' -> emoji: 'key'
import re
content = re.sub(r"(emoji|icon):\s*['\"]([^'\"]*)['\"]", 
                lambda m: f"{m.group(1)}: '{find_emojis(m.group(2)).pop() if find_emojis(m.group(2)) else m.group(2)}'", 
                content)

with open('src/data/substances.ts', 'w', encoding='utf-8') as f:
    f.write(content)
