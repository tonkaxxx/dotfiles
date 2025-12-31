import requests
import sys

def translate_text(text, target_lang='en', source_lang='auto'):
    try:
        url = "https://translate.googleapis.com/translate_a/single"
        params = {
            'client': 'gtx',
            'sl': source_lang,
            'tl': target_lang,
            'dt': 't',
            'q': text
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        full_translation = ""
        
        for item in data[0]:
            if item[0]:
                full_translation += item[0]
        
        return full_translation
        
    except Exception as e:
        return f"ошибка: {e}"

def main():
    while True:
        text = input("введите текст: ")
        sys.exit(0)

if __name__ == "__main__":
    main()
