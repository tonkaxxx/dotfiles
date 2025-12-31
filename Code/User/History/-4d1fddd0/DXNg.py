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
    print("sys", sys.argv)

    if len(sys.argv) == 0:
        while True:
            text = input("введите текст: ")
            sys.exit(0)


    # if len(sys.argv) < 2 or len(sys.argv) != 0:
    #     print("использование:")
    #     print("  python translator.py 'текст'")
    #     print("  python translator.py 'текст' в_какой_перевести")
    #     print("  python translator.py 'текст' в_какой_перевести из_какого_перевести")
    #     print("\nпримеры:")
    #     print("  python translator.py 'Hello world'")
    #     print("  python translator.py 'Привет' en")
    #     print("  python translator.py 'Hola' ru es")
    #     sys.exit(1)
    
    text = sys.argv[1]
    target_lang = sys.argv[2] if len(sys.argv) > 2 else 'en'
    source_lang = sys.argv[3] if len(sys.argv) > 3 else 'auto'
    
    # Переводим текст
    result = translate_text(text, target_lang, source_lang)
    
    print(f"Исходный: {text}")
    print(f"Перевод:  {result}")


if __name__ == "__main__":
    main()
