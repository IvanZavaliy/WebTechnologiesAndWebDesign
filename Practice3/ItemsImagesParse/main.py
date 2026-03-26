import os
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin


def download_re_items():
    url = "https://game8.co/games/Resident-Evil-Requiem/archives/583587"

    # Додаємо User-Agent, щоб сайт не заблокував запит, сприйнявши його за бота
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }

    print(f"Завантаження сторінки: {url}")
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Перевірка на помилки HTTP (напр. 404)
    except requests.exceptions.RequestException as e:
        print(f"Помилка при завантаженні сторінки: {e}")
        return

    # Парсимо HTML
    soup = BeautifulSoup(response.content, 'html.parser')

    # Створюємо папку для збереження зображень
    save_dir = "RE_Items_Images"
    os.makedirs(save_dir, exist_ok=True)
    print(f"Папка для збереження створена/знайдена: {save_dir}/")

    # Шукаємо всі таблиці на сторінці
    tables = soup.find_all('table')
    print(f"Знайдено таблиць на сторінці: {len(tables)}")

    downloaded_count = 0

    for table in tables:
        # Перебираємо всі рядки в таблиці
        rows = table.find_all('tr')

        for row in rows:
            # Шукаємо тег зображення
            img_tag = row.find('img')

            # Шукаємо всі посилання, щоб дістати назву предмета
            a_tags = row.find_all('a')

            if img_tag and a_tags:
                # На game8.co зображення часто мають атрибут data-src замість src через ліниве завантаження
                img_url = img_tag.get('data-src') or img_tag.get('src')

                if not img_url:
                    continue

                # Виправляємо відносні посилання, якщо вони є
                img_url = urljoin(url, img_url)

                # Спробуємо знайти назву предмета в тексті посилань
                item_name = ""
                for a in a_tags:
                    text = a.get_text(strip=True)
                    if text:
                        item_name = text
                        break

                # Якщо тексту в посиланнях немає, беремо атрибут alt у зображення
                if not item_name:
                    item_name = img_tag.get('alt', 'Unknown_Item')

                # Очищаємо назву від недопустимих символів для імені файлу (наприклад: / \ : * ? " < > |)
                clean_item_name = re.sub(r'[\\/*?:"<>|]', "", item_name).strip()
                if not clean_item_name:
                    clean_item_name = f"Item_{downloaded_count}"

                # Визначаємо формат зображення з URL (наприклад: .png, .jpg)
                ext = img_url.split('.')[-1].split('?')[0]
                if len(ext) > 4 or not ext:
                    ext = "png"  # Стандартне розширення, якщо не вдалося визначити

                file_name = f"{clean_item_name}.{ext}"
                file_path = os.path.join(save_dir, file_name)

                # Завантаження самого зображення
                try:
                    img_response = requests.get(img_url, headers=headers)
                    img_response.raise_for_status()

                    with open(file_path, 'wb') as f:
                        f.write(img_response.content)

                    print(f"Завантажено: {file_name}")
                    downloaded_count += 1
                except Exception as e:
                    print(f"Не вдалося завантажити зображення для '{item_name}' ({img_url}): {e}")

    print(f"\nГотово! Загалом завантажено зображень: {downloaded_count}")


if __name__ == "__main__":
    download_re_items()