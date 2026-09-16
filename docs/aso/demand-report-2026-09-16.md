# Спрос по кластерам — US / CA / AU / GB (Astro, 2026-09-16)

**Источник:** Astro (App Store popularity 5–100, difficulty 0–100), 111 ключей × 4 стора, iPhone. Ключи лежат во временном приложении «Image Tools (research)» в Astro. Сырые данные: `data/astro_raw.json`, таблица: `keywords-2026-09-16.csv`.
**Пороги (из методики):** popularity 5 = ниже порога измерения («неизвестно», не «ноль»); difficulty < 50 — выигрываемо для нового приложения.
**Оговорка:** индекс popularity считается по каждому стору отдельно и на краях шумит (например, «photo enhancer» — US 6, CA 41, GB 48). Смотрим на кластер целиком, а не на одну цифру.

---

## 1. Итог по кластерам

Формат ячейки: **лучший выигрываемый ключ** (popularity > 5, difficulty < 50) — pop/diff; «—» = ни одного.

| Кластер | Макс. спрос | US | CA | AU | GB | Вердикт |
|---|---|---|---|---|---|---|
| C3 Convert | 50–51 | **image converter 50/42**, photo converter 36/23, heic converter 22/17 | heic to jpg 19/5 | heic to jpeg 12/5 | **image converter 51/13** | **Главный ключ.** Единственный кластер с высоким спросом и низкой сложностью в US и GB |
| C5 Resize (→ «image size») | 34–48 | **image size 45/49** | **image size 46/35** | **image size 34/21** | **image size 48/15** | **Второй главный ключ.** Сам «resize» никто не ищет (5–9), ищут «image size» — во всех четырёх рынках |
| C7 Object Remover | 49–56 | photo cleanup 32/46 (magic eraser 56/53 — на грани) | **magic eraser 49/23** | **magic eraser 50/19** | **magic eraser 53/41** | **Самый сильный AI-ключ.** В MVP вместо vectorize |
| C4 Compress | 24–25 | photo compressor 24/19 | photo compressor 25/11 | photo compressor 24/11 | photo compressor 24/15 | Одинаково выигрываемо везде. Сабтайтл / keyword field |
| C1 Remove Background | 52–59 | — (всё 70+) | background changer 46/41, background eraser 36/23, remove bg 32/19 | background eraser 34/23 | background changer 47/49, background eraser 39/44 | Спрос огромен, US закрыт гигантами. Ядро монетизации; ASO-вход через «background eraser» в CA/AU/GB |
| C2 Enhance / Upscale | 47–52 | image upscaler 8/41 (остальное 70+) | photo enhancer 41/47, unblur photo 28/23, upscale image 21/13 | ai photo enhancer 47/46 | photo quality enhancer 10/43 | US закрыт (Remini). Выигрываемо в CA. В продукт — да, в название — нет |
| C9 Passport Photo | 51–61 | id photo maker 25/41 | passport photo 51/44, id photo 31/23 | passport photo app 55/43 | (passport photo app 61/50 — на грани) | Большой спрос, средняя сложность. v1.x или отдельное приложение на том же бэкенде |
| C8 Restore | 14–21 | old photo restoration 14/17 | photo restore 21/45 | old photo restoration 17/11 | restore old photos 14/19 | Небольшой спрос, почти бесплатно выиграть. v1.x, та же модель, что enhance |
| C6 Vectorize | 6–22 | svg maker 16/46 | svg converter 22/15 | svg converter 6/15 | svg converter 15/15 | **Спроса в App Store нет** — 9 из 11 ключей на полу во всех сторах. Из MVP убрать |
| C10 Generic | 70–73 | — | — | — | — | photo editor 73/89 — не наша лига. «image tools» 5/5 — как бренд ок, как ключ — ноль |

---

## 2. Решение по составу MVP (по спросу) — первый проход

> Устарело после решения отказаться от AI-инструментов в MVP и второго прохода по утилитам — актуальный состав в разделе 5.

| # | Инструмент | Оплата | Почему в этом порядке |
|---|---|---|---|
| 1 | **Convert** (HEIC→JPG, PNG/JPG/WebP) | бесплатно | «image converter» 50/42 US и 51/13 GB — лучшее соотношение спроса и сложности во всём наборе. Это вход |
| 2 | **Resize & Compress** («Image Size») | бесплатно | «image size» 34–48 во всех рынках, «photo compressor» 24 везде. Один экран, две операции |
| 3 | **Magic Eraser** (object remover) | токены | 49–56 во всех рынках, difficulty 19–41 в CA/AU/GB. Сильнее любого другого AI-ключа |
| 4 | **Remove Background** | токены | Самый большой спрос (52–59), но в US не выиграть. Нужен как продукт, не как ASO-вход |
| 5 | **Enhance / Unblur / Upscale** | токены | Категория закрыта в US, но CA даёт «unblur photo» 28/23, «upscale image» 21/13 |
| — | ~~Image → SVG~~ | — | Переносится из MVP: popularity 5 почти везде. Возвращаем, если появится спрос с веба |

**v1.x:** Restore old photos (дёшево: та же модель, что enhance; ключи с difficulty 11–19) → Passport / ID photo (спрос 51–61; собирается из remove bg + белый фон + resize; в перспективе — отдельное приложение на том же бэкенде).

Изменение относительно PRD: **vectorize уходит, magic eraser приходит.** Оба — один вызов fal.ai, стоимость реализации одинаковая, разница в спросе — в разы.

---

## 3. Название и сабтайтл — черновик первого прохода

> Пересмотрено в разделе 5.3 после второго прохода.

По методике: главный ключ ведёт название, второй — сабтайтл, фразы не повторяются между полями. Слова из разных полей Apple комбинирует, поэтому «photo» из сабтайтла + «converter» из названия покрывают «photo converter».

**en-US (по умолчанию для всех англоязычных сторов):**

| Поле | Значение | Символов | Покрывает |
|---|---|---|---|
| Name | `Image Converter & Image Size` | 28 | image converter (US 50, GB 51), image size (45–48), heic-комбинации |
| Subtitle | `Photo Compressor, Magic Eraser` | 30 | photo compressor (24 везде), magic eraser (49–56), photo converter, photo size, image compressor |
| Keywords | `background remover,heic to jpg,unblur,upscale,enhancer,restore old photos,remove objects,cutout` | 96 | остальные кластеры без повторов |

**Вариант для CA / AU** (там «image converter» слабый — 9 и 6, а «background eraser» выигрываемый — 36/23 и 34/23):

| Поле | Значение | Символов |
|---|---|---|
| Name | `Image Size & Background Eraser` | 30 |
| Subtitle | `Photo Compressor, Magic Eraser` | 30 |

Бренд в названии не помещается — по правилу 1 это осознанная цена: люди ищут «image converter», а не название приложения. Бренд живёт в иконке, скриншотах и первой строке описания.

**Риск:** «Magic Eraser» — название функции Google Photos. Прецедент есть (приложение «Magic Eraser Background Editor», 104k оценок, живёт в сторе), но при отказе ревью запасной вариант — «Object Remover» (US 6/57, слабее).

**Нужно утвердить до фазы 2:** главный ключ **image converter**, второй **image size**, сабтайтл-ключ **magic eraser**.

---

## 4. Что не проверено

- **Другие языки** (правило 7): DE/FR/ES/JP и т.д. — отдельное исследование на локальных формулировках, не перевод.
- **Apps-using** (сколько приложений держат ключ в названии) — Astro в этой сборке метрику не отдаёт; косвенно закрыто пробой iTunes от 16.09 (см. `clusters.md`).
- **Web-спрос** (Google) для vectorize / heic — другой канал, App Store его не отражает; проверить в GSC/Ahrefs перед решением по веб-страницам.

---

## 5. Второй проход — утилиты без AI (2026-09-16, те же 4 стора)

После решения оставить в MVP только локальные инструменты (Convert, Image Size, Compress) проверены 16 утилитных кластеров, 113 ключей — всё, что можно сделать с картинкой без AI. Таблица: `keywords-utilities-2026-09-16.csv`, сырые данные: `data/astro_raw2.json`.

### 5.1 Что нашлось

| Кластер | US | CA | AU | GB | Вердикт |
|---|---|---|---|---|---|
| **U1 Photo → PDF** | photo to pdf 62/69, **photos to pdf 58/45**, **jpg to pdf 57/40**, image to pdf 54/52, **convert photo to pdf 36/21** | **photo to pdf 58/39**, photos to pdf 37/21 | **photos to pdf 51/17**, photo to pdf 32/43 | photo to pdf 36/42 | **Самый большой пропуск.** Спрос уровня «image converter», выигрываемо в US/CA/AU. Это конвертация → в MVP, в инструмент Convert |
| **U8 Square Fit / No-crop** | square fit 40/43 | square fit 37/39 | **square fit 36/15** | **square fit 41/19** | Режим внутри Image Size: подогнать под соотношение сторон без обрезки (белый/размытый фон). Выигрываемо везде |
| U7 DPI | **dpi 24/13** | **dpi 24/9** | 5 | 5 | Опция «DPI для печати» в Image Size — одна строка метаданных, ключ бесплатный в US/CA |
| U5 EXIF / Metadata | exif 24/35 | metadata remover 20/7 | 8/9 | 8/7 | Маленький, но почти бесплатный. Кандидат в v1.x: «Photo info / удалить метаданные» |
| U4 Watermark | watermark photo 17/42 | watermark photo 17/17 | watermark maker 26/19 | watermark maker 26/43 | Средний спрос, локально делается. v1.x |
| U10 Batch | batch resize 14/17 | 8/15 | 14/11 | 14/9 | Небольшой, но это интент «платить»: пакетная обработка = Pro-функция |
| U6 Blur / Pixelate | blur photo 55/65 | **blur photo 32/21** | pixelate 8/15 | blur photo 58/50 | Интент смешанный (портретное размытие фона vs цензура). Локально: pixelate/blur области. v1.x, не приоритет |
| U15 Форматы | jpg converter 9/21 | **jpg converter 25/19** | 9/11 | 9/9 | Покрывается Convert. webp/avif/tiff/raw — на полу везде |
| U2 Crop, U3 Rotate/Flip | 5–13, crop photo 9/81 | 5–8 | 5–13 | 5–13 | Ожидаемые функции, но не поисковые. Делаем как часть Image Size, в метаданные не тратим |
| U12 Size in KB | 5 везде | 5 | 5 | 5 | В этих рынках не ищут (это индийский/гос-формы сценарий) |
| U9 Stitch, U13 OCR, U16 Cleaner | 16–21, difficulty высокая или интент чужой | — | — | — | Мимо |

### 5.2 Отдельные проекты (сильный спрос, но другой продукт)

| Кластер | Цифры | Почему не сюда |
|---|---|---|
| **U14 Timestamp camera** | 61/52 US, **57/19 CA**, **61/23 AU**, 56/39 GB | Это камера, а не обработка. Отдельное приложение — спрос выше, чем у image converter, и выигрываемо в CA/AU |
| **U11 GIF maker** | 57/65 US, 48/46 CA, 36/46 AU, 50/48 GB | Видео-продукт (ближе к VideoGif). «live photo to video» 20/23 US — единственное, что можно взять в Convert как формат |
| C9 Passport photo, C8 Restore | из первого прохода | Уже решено — отдельные проекты |

### 5.3 Итоговый состав MVP — статус реализации (2026-09-17)

Правило проекта: в приложение попадает только то, что подтверждено цифрами выше. Всё локально, без сервера и без AI.

| Инструмент | Что внутри | Ключи | Статус |
|---|---|---|---|
| **Convert** | HEIC/JPG/PNG ↔, фото → PDF (несколько фото в один PDF) | image converter, photo converter, heic to jpg, photo to pdf, jpg to pdf, photos to pdf | ✅ реализовано |
| **Image Size** | resize (% / пресеты / свой размер), **batch** — та же настройка на несколько фото, **square fit / no-crop**, **DPI** (JFIF + EXIF + Photoshop-блок) | image size, batch resize, square fit, dpi, resize | ✅ реализовано |
| **Compress** | слайдер качества с live-оценкой размера | photo compressor, reduce photo size, photo size reducer | ✅ реализовано |

Убрано из первого прототипа как не подтверждённое данными: rotate / flip (U3 — пол везде), WebP на выходе (webp converter 5/15, webp to jpg 5/7), режим «до N KB» в Compress (U12 — пол во всех четырёх рынках).
Не реализовано, хотя сигнал есть: Live Photo → video (20/23 только в US, 5 в остальных) — ждём подтверждения на других рынках.

v1.x кандидаты (все локальные, дешёвые, подтверждены): EXIF viewer / metadata remover → Watermark → Blur / Pixelate.

Вне проекта: всё AI (remove bg, enhance, eraser, restore, vectorize), passport photo, timestamp camera, gif maker.

### 5.4 Название — пересмотренный черновик

| Поле | Значение | Символов | Покрывает |
|---|---|---|---|
| Name | `Image Converter & Image Size` | 28 | image converter, image size |
| Subtitle | `Photo to PDF & Compressor` | 25 | photo to pdf, photo compressor / image compressor (комбинации), photo converter |
| Keywords | `heic to jpg,jpg to pdf,photos to pdf,square fit,batch resize,dpi,exif,resize,png,webp,jpeg` | 90 | остальное без повторов фраз |

CA/AU вариант больше не нужен — в утилитной версии те же ключи работают во всех четырёх сторах.

### 5.5 Открытый вопрос — что продаём

В PRD монетизация строилась на токенах за AI-вызовы. В утилитном MVP AI нет, значит токены не нужны. Рабочая модель в этой нише (Image Size, Compress Photos & Pictures): **Free с ограничениями + Pro**. Кандидаты в Pro: пакетная обработка (batch resize — единственный «платёжный» интент в данных), многостраничный PDF, без лимита на количество в день, без рекламы. Формат: подписка месяц/год + lifetime через Adapty. Нужно решение.

---

## Приложение — все ключи по странам

Формат: popularity/difficulty. Жирным — выигрываемо (pop > 5 и diff < 50).


### C1 Remove Background

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| remove background | 55/82 | 30/50 | 34/50 | 47/57 |
| background remover | 59/79 | 52/57 | 52/55 | 56/65 |
| background eraser | 53/73 | **36/23** | **34/23** | **39/44** |
| remove bg | 7/57 | **32/19** | **7/19** | **7/19** |
| photo background remover | 9/74 | 7/51 | 6/51 | 9/50 |
| transparent background | 25/53 | 5/44 | 5/39 | 5/39 |
| cut out photo | 5/58 | 5/40 | 5/41 | 5/46 |
| cutout | 9/55 | **9/40** | **14/19** | **14/39** |
| png maker | 6/52 | 5/36 | **6/43** | **6/21** |
| white background | **7/47** | **8/44** | **6/37** | **6/42** |
| change background | 6/65 | 6/53 | **13/45** | **10/48** |
| remove background from photo | 5/58 | 5/37 | 5/23 | 5/39 |
| background changer | 24/51 | **46/41** | **24/39** | **47/49** |
| blur background | 6/58 | **8/21** | **9/17** | **6/23** |

### C2 Enhance / Upscale

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| photo enhancer | 6/71 | **41/47** | **6/47** | 48/57 |
| ai photo enhancer | 52/74 | 47/51 | **47/46** | 8/58 |
| image upscaler | **8/41** | **8/46** | **8/19** | **8/38** |
| upscale image | 6/50 | **21/13** | **6/39** | **6/17** |
| enhance photo quality | 6/65 | **27/43** | **6/45** | **6/47** |
| hd photo | 9/59 | 5/52 | **9/44** | 9/52 |
| photo quality enhancer | 7/55 | 5/23 | **10/40** | **10/43** |
| increase resolution | 5/46 | 5/38 | 5/17 | 5/13 |
| unblur photo | 9/56 | **28/23** | **9/42** | **9/23** |
| sharpen photo | 5/46 | 5/17 | 5/17 | 5/17 |
| fix blurry photo | **6/45** | **17/37** | **6/36** | **6/41** |
| clear photo | **6/47** | **7/43** | **6/23** | **6/23** |
| photo enhancer ai | 5/48 | 5/23 | 5/42 | 5/47 |

### C3 Convert

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| heic to jpg | **8/13** | **19/5** | **8/9** | **8/9** |
| heic converter | **22/17** | 5/11 | 5/5 | 5/9 |
| heic to jpeg | **9/23** | **12/15** | **12/5** | **9/5** |
| image converter | **50/42** | **9/15** | **6/13** | **51/13** |
| photo converter | **36/23** | **17/19** | 5/23 | 5/17 |
| convert photo to jpg | 5/45 | 5/40 | 5/39 | 5/40 |
| png to jpg | 5/23 | 5/13 | 5/11 | 5/9 |
| jpg to png | 5/19 | 5/11 | 5/11 | 5/7 |
| webp converter | 5/15 | 5/15 | 5/9 | 5/9 |
| webp to jpg | 5/7 | 5/5 | 5/5 | 5/5 |
| photo format converter | 5/21 | 5/21 | 5/19 | 5/19 |
| convert image format | 5/21 | 5/11 | 5/13 | 5/9 |
| jpeg converter | **7/23** | **9/13** | **6/13** | **6/15** |
| heic | **16/17** | 5/11 | 5/5 | 5/13 |
| picture converter | **21/39** | 5/21 | 5/19 | 5/19 |

### C4 Compress

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| photo compressor | **24/19** | **25/11** | **24/11** | **24/15** |
| compress photo | 5/19 | 5/11 | 5/11 | 5/17 |
| image compressor | **7/19** | 5/15 | **7/9** | **7/19** |
| reduce photo size | **19/21** | 5/13 | 5/15 | 5/19 |
| reduce image size | **6/21** | 5/21 | **6/15** | **6/17** |
| shrink photo | 5/48 | 5/17 | 5/15 | 5/19 |
| photo size reducer | **13/23** | 5/15 | **12/17** | **12/19** |
| compress image | 5/19 | 5/17 | 5/13 | 5/15 |
| compress jpeg | 5/37 | 5/13 | 5/11 | 5/17 |
| make photo smaller | 5/46 | 5/23 | 5/44 | 5/21 |
| compress pictures | 5/21 | 5/13 | 5/11 | 5/15 |

### C5 Resize

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| resize photo | **6/48** | **9/21** | **8/17** | **7/37** |
| image resizer | **7/48** | **8/17** | **6/21** | **7/21** |
| photo resizer | 9/59 | **9/40** | **9/17** | **9/19** |
| resize image | 9/50 | **7/21** | **9/21** | **9/40** |
| resize picture | 5/48 | 5/9 | 5/11 | 5/15 |
| change photo size | 5/43 | 5/23 | 5/38 | 5/37 |
| photo dimensions | 5/15 | 5/15 | 5/23 | 5/15 |
| crop and resize | 5/9 | 5/7 | 5/9 | 5/11 |
| resize for instagram | 5/55 | 5/42 | 5/21 | 5/48 |
| photo size | 5/45 | 5/44 | 5/42 | 5/41 |
| image size | **45/49** | **46/35** | **34/21** | **48/15** |

### C6 Vectorize

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| image to svg | 5/36 | 5/13 | 5/9 | 5/9 |
| png to svg | 5/39 | 5/9 | 5/9 | 5/7 |
| jpg to svg | 5/19 | 5/13 | 5/11 | 5/15 |
| vectorize image | 5/19 | 5/13 | 5/13 | 5/13 |
| vector converter | 5/46 | 5/21 | 5/21 | 5/17 |
| svg converter | **8/37** | **22/15** | **6/15** | **15/15** |
| image to vector | 5/23 | 5/17 | 5/11 | 5/17 |
| convert to svg | 5/23 | 5/13 | 5/11 | 5/11 |
| svg maker | **16/46** | 5/23 | 5/21 | 5/15 |
| logo to vector | 5/7 | 5/15 | 5/17 | 5/13 |
| vectorizer | 5/39 | 5/17 | 5/17 | 5/17 |

### C7 Object Remover

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| object remover | 6/57 | **6/43** | **9/41** | 9/51 |
| remove objects from photo | 54/74 | 5/43 | **47/40** | **47/46** |
| magic eraser | 56/53 | **49/23** | **50/19** | **53/41** |
| remove people from photo | **7/48** | **28/37** | **8/23** | **8/21** |
| remove unwanted objects | 5/23 | 5/19 | 5/17 | 5/19 |
| photo cleanup | **32/46** | 5/40 | 5/42 | 5/23 |
| erase objects | 7/73 | **37/42** | **7/23** | **7/49** |
| remove text from photo | **13/23** | 5/19 | 5/19 | 5/19 |
| object eraser | 6/55 | **23/43** | **6/43** | **6/46** |
| photo cleaner | 49/62 | **41/48** | **41/41** | **47/48** |
| clean up photo | 5/42 | 5/43 | 5/40 | 5/44 |
| ai eraser | 20/50 | 5/45 | **19/37** | 18/50 |
| photo eraser | 53/77 | 48/52 | **8/43** | 8/51 |

### C8 Restore

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| photo restoration | **9/48** | **9/39** | **9/38** | **9/47** |
| restore old photos | **12/17** | **6/23** | **14/41** | **14/19** |
| old photo restoration | **14/17** | 5/11 | **17/11** | **13/15** |
| repair old photos | 5/17 | 5/11 | 5/11 | 5/15 |
| colorize photo | 5/37 | 5/15 | 5/11 | 5/17 |
| colorize black and white | 5/13 | 5/7 | 5/7 | 5/9 |
| face restoration | 5/17 | 5/15 | 5/9 | 5/11 |
| fix old photos | **7/23** | **11/11** | **7/11** | **11/41** |
| photo restore | 7/50 | **21/45** | **9/48** | **9/40** |

### C9 Passport Photo

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| passport photo | 61/60 | **51/44** | **9/38** | **9/42** |
| id photo | 9/52 | **31/23** | **9/21** | **9/48** |
| passport photo maker | 6/55 | **7/19** | **6/19** | **6/40** |
| passport photo app | 47/51 | **48/40** | **55/43** | 61/50 |
| visa photo | **6/45** | **6/19** | **6/19** | **6/21** |
| id photo maker | **25/41** | 5/15 | 5/15 | 5/35 |
| passport size photo | 5/48 | **6/37** | **6/42** | **6/40** |
| photo for documents | 5/39 | 5/53 | 5/45 | 5/19 |

### C10 Generic

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| photo editor | 73/89 | 70/74 | 70/71 | 72/76 |
| photo tools | 5/57 | 5/39 | 5/39 | 5/21 |
| image tools | 5/5 | 5/9 | 5/11 | 5/9 |
| ai photo editor | 65/86 | 59/70 | 61/65 | 68/80 |
| picture editor | 59/90 | 42/73 | 46/71 | 53/74 |
| photo utilities | 5/71 | 5/17 | 5/13 | 5/15 |

## Приложение 2 — утилитные ключи по странам


### U1 Photo to PDF

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| photo to pdf | 62/69 | **58/39** | **32/43** | **36/42** |
| image to pdf | 54/52 | **8/19** | **8/17** | **8/23** |
| jpg to pdf | **57/40** | **31/38** | **7/23** | **7/15** |
| pdf to jpg | 5/17 | 5/21 | 5/39 | 5/17 |
| picture to pdf | **9/48** | **9/23** | **11/48** | **8/44** |
| convert photo to pdf | **36/21** | 5/17 | 5/21 | 5/19 |
| photos to pdf | **58/45** | **37/21** | **51/17** | **6/23** |
| pdf to image | 5/7 | 5/37 | 5/17 | 5/17 |

### U2 Crop

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| crop photo | 9/81 | **6/46** | **9/43** | **9/47** |
| photo crop | 6/67 | **8/40** | **6/41** | **6/46** |
| crop image | 5/42 | 5/23 | 5/39 | 5/23 |
| circle crop | 5/15 | 5/7 | 5/7 | 5/7 |
| crop picture | 5/57 | 5/46 | 5/49 | 5/19 |
| photo cropper | **13/46** | 5/53 | **13/41** | **13/21** |
| cut photo | 5/53 | 5/43 | 5/45 | 5/44 |

### U3 Rotate / Flip / Mirror

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| rotate photo | 5/17 | 5/9 | 5/13 | 5/13 |
| flip photo | 5/21 | 5/9 | 5/11 | 5/15 |
| mirror photo | 5/23 | 5/15 | 5/17 | 5/15 |
| mirror image | 5/41 | 5/15 | 5/19 | 5/17 |
| flip image | 5/19 | 5/17 | 5/42 | 5/11 |
| rotate image | 5/17 | 5/7 | 5/21 | 5/7 |
| mirror picture | 5/37 | 5/19 | 5/17 | 5/19 |

### U4 Watermark

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| add watermark | **9/39** | 5/15 | **6/15** | **8/19** |
| watermark photo | **17/42** | **17/17** | 5/13 | 5/41 |
| watermark maker | 26/62 | 5/23 | **26/19** | **26/43** |
| watermark app | 5/48 | 5/19 | 5/17 | 5/40 |
| photo watermark | **15/45** | 5/17 | 5/13 | 5/15 |
| add logo to photo | 5/15 | 5/38 | 5/44 | 5/39 |
| copyright photo | 5/13 | 5/13 | 5/11 | 5/9 |

### U5 Metadata / EXIF

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| exif | **24/35** | **6/9** | 5/11 | 5/17 |
| exif viewer | **6/19** | **6/9** | **6/9** | **8/11** |
| photo metadata | 5/21 | 5/11 | 5/11 | 5/11 |
| remove metadata | 5/15 | 5/9 | 5/9 | 5/9 |
| exif editor | 5/23 | 5/7 | 5/11 | 5/9 |
| photo location | 5/23 | 5/17 | 5/13 | 5/19 |
| metadata remover | **8/15** | **20/7** | **8/9** | **8/7** |
| photo info | 5/21 | 5/33 | 5/33 | 5/36 |

### U6 Blur / Censor

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| blur photo | 55/65 | **32/21** | **8/21** | 58/50 |
| blur face | **7/45** | **7/19** | **7/19** | **7/35** |
| pixelate | **8/21** | **9/15** | **8/15** | **8/21** |
| censor photo | 5/43 | 5/13 | 5/13 | 5/13 |
| blur part of photo | 5/50 | 5/23 | 5/23 | 5/40 |
| hide face | 5/21 | 5/7 | 5/7 | 5/23 |
| blur image | **6/42** | 5/19 | **6/13** | **10/38** |

### U7 Print / DPI

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| print size | 5/41 | 5/15 | 5/19 | 5/15 |
| photo print size | 5/56 | 5/21 | 5/38 | 5/44 |
| dpi | **24/13** | **24/9** | 5/7 | 5/7 |
| change dpi | 5/31 | 5/9 | 5/15 | 5/11 |
| 4x6 photo | 5/50 | 5/46 | 5/42 | 5/53 |
| resize for print | 5/42 | 5/21 | 5/17 | 5/9 |
| dpi changer | 5/44 | 5/9 | 5/11 | 5/11 |
| photo to print | 5/62 | 5/42 | 5/43 | 5/45 |

### U8 No-crop / Square / Border

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| no crop | 7/57 | **9/39** | **7/15** | **7/21** |
| square fit | **40/43** | **37/39** | **36/15** | **41/19** |
| square photo | **9/41** | **6/39** | **9/23** | **9/41** |
| white border | **8/33** | 5/15 | **8/9** | **8/15** |
| photo border | **7/40** | 5/17 | **7/40** | **7/19** |
| fit photo | 5/57 | 5/17 | 5/21 | 5/13 |
| instagram no crop | 5/50 | 5/21 | 5/19 | 5/23 |
| blur border | 5/19 | 5/43 | 5/19 | 5/39 |

### U9 Combine / Stitch

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| combine photos | 8/56 | 5/46 | **8/47** | **8/46** |
| merge photos | **8/48** | 5/40 | **9/37** | **9/23** |
| stitch photos | **17/49** | 5/46 | 5/36 | 5/15 |
| long screenshot | **6/36** | 5/9 | 5/9 | 5/11 |
| screenshot stitch | 5/23 | 5/11 | 5/11 | 5/13 |
| photo stitch | 21/52 | 5/23 | 5/47 | 5/19 |
| join photos | 5/52 | 5/38 | 5/38 | 5/44 |
| screenshot editor | **16/7** | 5/5 | 5/17 | 5/5 |

### U10 Batch

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| batch resize | **14/17** | **8/15** | **14/11** | **14/9** |
| bulk resize | 5/13 | 5/21 | 5/5 | 5/17 |
| batch compress | 5/9 | 5/11 | 5/15 | 5/7 |
| bulk photo resizer | 5/15 | 5/9 | 5/11 | 5/13 |
| batch convert | 5/5 | 5/7 | 5/7 | 5/7 |
| resize multiple photos | 5/23 | 5/9 | 5/11 | 5/15 |

### U11 GIF / Live Photo

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| gif maker | 57/65 | **48/46** | **36/46** | **50/48** |
| video to gif | 6/52 | 5/37 | **6/40** | **6/39** |
| live photo to gif | 5/40 | 5/13 | 5/13 | 5/11 |
| live photo to video | **20/23** | 5/13 | 5/11 | 5/21 |
| photo to gif | 5/51 | 5/36 | 5/21 | 5/38 |
| gif converter | 17/50 | 5/23 | 5/39 | 5/41 |
| gif to video | **6/40** | 5/37 | **6/19** | **6/15** |

### U12 Size in KB

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| resize photo to 20kb | 5/19 | 5/9 | 5/11 | 5/13 |
| photo size kb | 5/11 | 5/40 | 5/23 | 5/17 |
| compress photo to 100kb | 5/15 | 5/13 | 5/11 | 5/13 |
| reduce photo size kb | 5/19 | 5/15 | 5/17 | 5/17 |
| photo kb reducer | 5/17 | 5/11 | 5/15 | 5/17 |
| photo size converter | 5/23 | 5/19 | 5/19 | 5/21 |

### U13 OCR / Text

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| image to text | **6/17** | **6/11** | **9/9** | **9/11** |
| photo to text | **7/36** | 5/21 | **7/19** | **7/37** |
| ocr scanner | **16/41** | **9/49** | **6/49** | **6/44** |
| extract text from image | 5/13 | 5/11 | 5/9 | 5/11 |
| text scanner | 7/53 | **9/15** | **7/39** | **7/21** |
| copy text from photo | 5/17 | 5/15 | 5/19 | 5/13 |

### U14 Date stamp

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| timestamp camera | 61/52 | **57/19** | **61/23** | **56/39** |
| date stamp photo | 5/19 | 5/11 | 5/17 | 5/13 |
| add date to photo | 5/7 | 5/67 | 5/67 | 5/21 |
| timestamp photo | 5/41 | 5/23 | 5/37 | 5/23 |
| photo date stamp | 5/15 | 5/15 | 5/17 | 5/19 |

### U15 Format specifics

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| webp to png | 5/5 | 5/15 | 5/15 | 5/5 |
| tiff to jpg | 5/13 | 5/9 | 5/11 | 5/11 |
| raw to jpg | 5/44 | 5/21 | 5/19 | 5/13 |
| dng to jpg | 5/44 | 5/13 | 5/15 | 5/11 |
| bmp to jpg | 5/17 | 5/13 | 5/13 | 5/13 |
| avif converter | 5/5 | 5/7 | 5/7 | 5/5 |
| jfif to jpg | 5/21 | 5/17 | 5/21 | 5/9 |
| png converter | **7/48** | **6/23** | **6/19** | **9/13** |
| jpg converter | **9/21** | **25/19** | **9/11** | **9/9** |

### U16 Photo cleaner / storage

| Ключ | US | CA | AU | GB |
|---|---|---|---|---|
| duplicate photos | 5/39 | 5/17 | 5/38 | 5/17 |
| free up space | **15/43** | 5/41 | 5/23 | 5/38 |
| clean photos | 9/55 | 5/23 | **6/41** | **6/42** |
| duplicate photo remover | 5/19 | 5/11 | 5/15 | 5/15 |
| photo storage cleaner | **8/40** | 5/37 | **8/17** | **8/37** |
| similar photos | 5/39 | 5/15 | 5/15 | 5/19 |
