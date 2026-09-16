# ASO-кластеры — Image Tools (en-US, App Store)

**Цель:** проверить спрос на каждую фичу до разработки и реализовать в первую очередь то, что ищут.
**Статус:** семена прогнаны через Astro 2026-09-16 по US/CA/AU/GB — результаты и решения в `demand-report-2026-09-16.md`. Предварительная приоритизация в разделе 3 ниже устарела: vectorize выпал из MVP, magic eraser вошёл, «image size» оказался главным ключом resize-кластера.
**Что уже есть:** проба через iTunes Search API (US) — кто ранжируется по головному запросу кластера и насколько эти приложения большие (по числу оценок). Это прокси «сколько приложений ставят на этот запрос и какого они размера» (правило 6 из методики), а не спрос. Сырые данные: `itunes-probe-us-2026-09-16.json`, скрипт: `itunes-probe.py`.

---

## 1. Как читать и что снять в Astro

Для каждого ключа из кластера снять в Astro три числа:

| Поле | Что значит | Порог для нового приложения |
|---|---|---|
| **Popularity** (5–100) | прокси объёма поиска; 5 = ниже порога измерения, не «ноль» | главный и сабтайтл-ключ — заметно выше 5 |
| **Difficulty** (0–100) | насколько тяжело пробиться | < 50 — выигрываемо; 50–70 — только после набора установок |
| **Apps using** | сколько приложений держат ключ в name/subtitle | много = люди это реально ищут; 0 при высокой popularity = метрика врёт |

**Решение по кластеру:**

- **Спрос кластера** = максимальная popularity среди его ключей.
- **Выигрываемость** = доля ключей кластера с difficulty < 50.
- **Приоритет фичи** = спрос × выигрываемость. Кластеры с высоким спросом, но нулевой выигрываемостью (гиганты) всё равно идут в продукт — это ядро монетизации — но не в название на старте.

Процедура в Astro (когда MCP подключится):
1. Создать временную папку/тег для нерелизнутого приложения.
2. `get_keyword_suggestions` по каждому головному ключу ниже.
3. `extract_competitors_keywords` по 5 конкурентам: Pixelcut, Photoroom, Remini, Image Size, «Image Converter: JPEG PDF HEIC».
4. Все кандидаты → таблица popularity / difficulty / apps-using → сохранить в `docs/aso/keywords-us.csv`.
5. Отсечь по интенту (правило 3), отсортировать по popularity × выигрываемость.

---

## 2. Кластеры

Легенда: **MVP** — в PRD v1; **Roadmap** — PRD v1.x/v2; **Гипотеза** — не в PRD, добавлено из данных.
«Проба iTunes» — сумма оценок топ-10 приложений по запросу и самый крупный игрок (US, 2026-09-16).

### C1. Remove Background — MVP, платный (токены)

| Головной ключ | Семена (long-tail) |
|---|---|
| remove background | background remover · background eraser · remove bg · photo background remover · transparent background · cut out photo · cutout · png maker · white background · change background |

- **Проба iTunes:** топ-10 = 2,5 млн оценок. Picsart (1,2 млн), Bazaart (260k), Photoroom (229k), Pixelcut (219k), Background Eraser (134k).
- **Читается как:** огромный спрос, гиганты. Difficulty ожидаемо 60+. Для нового приложения — не выигрываемо на старте.
- **Решение:** в продукт — обязательно (ядро монетизации). В название — только как ставка на будущее, не как основной ключ. Ищем в Astro long-tail с difficulty < 50: «transparent background», «png maker», «white background» (e-commerce).

### C2. Enhance / Upscale — MVP, платный

| Головной ключ | Семена |
|---|---|
| photo enhancer | ai photo enhancer · image upscaler · upscale image · enhance photo quality · hd photo · photo quality enhancer · increase resolution · unblur photo · sharpen photo · fix blurry photo · clear photo |

- **Проба iTunes:** «photo enhancer» топ-10 = 2,75 млн (Picsart, Facetune, Remini 353k, Lightroom). «image upscaler» топ-10 = 786k — Remini, Pixelcut, PhotoApp (86k), Pixelup (39k). «unblur photo» = 1,3 млн (Lensa, Remini).
- **Читается как:** «photo enhancer» — гиганты; «image upscaler» / «unblur photo» — хвост заметно тоньше (PhotoApp, Pixelup, Blur Photo с 30–90k). Здесь возможна выигрываемая формулировка.
- **Решение:** в продукт — обязательно. Кандидат на сабтайтл, если Astro покажет «image upscaler» или «unblur photo» с difficulty < 50.

### C3. Convert (HEIC → JPG и форматы) — MVP, бесплатный

| Головной ключ | Семена |
|---|---|
| heic to jpg | heic converter · heic to jpeg · image converter · photo converter · convert photo to jpg · png to jpg · jpg to png · webp converter · webp to jpg · photo format converter · convert image format |

- **Проба iTunes:** «heic to jpg» топ-10 = всего 71k; лидеры — JPEG-PNG Image file converter (17k), The Image Converter (17k), Image Converter: JPEG PDF HEIC (9k), HEIC to JPEG (1,5k). «image converter» = 146k, но верх занят PDF-конвертером (не наш интент).
- **Читается как:** ниша маленьких игроков. Самый крупный «чистый» конкурент — 17k оценок. Это выигрываемо с первого дня.
- **Решение:** **кандидат №1 на главный ключ в названии** (если popularity в Astro выше порога). Бесплатный инструмент как входная дверь — ровно то, что PRD называет стратегией.

### C4. Compress / Reduce size — MVP, бесплатный

| Головной ключ | Семена |
|---|---|
| photo compressor | compress photo · image compressor · reduce photo size · reduce image size · shrink photo · photo size reducer · compress image kb · compress jpeg · make photo smaller |

- **Проба iTunes:** «photo compressor» топ-10 = 58k — Image Size (30k), Compress Photos & Pictures (22k), Photo Compress (3,5k). «reduce photo size» = 492k, но верх — InstaSize/Square Fit (интент «подогнать под Instagram», не наш).
- **Читается как:** прямой интент «сжать» — маленькая ниша, выигрываемо. Осторожно с «reduce photo size» — там смешанный интент.
- **Решение:** кандидат в сабтайтл или keyword field. Пара «convert + compress» в name+subtitle выглядит как реалистичная стартовая связка.

### C5. Resize — MVP, бесплатный

| Головной ключ | Семена |
|---|---|
| resize photo | image resizer · photo resizer · resize image · resize picture · change photo size · photo dimensions · crop and resize · resize for instagram |

- **Проба iTunes:** «resize photo» топ-10 = 632k; «image resizer» = 500k. Верх — InstaSize (326k), INSTFIT (126k), Square Fit (76k), Image Size (30k).
- **Читается как:** спрос есть, но верх занят приложениями «под соцсети». Image Size (30k оценок, утилита) — прямой аналог нашего интента и он ранжируется.
- **Решение:** в keyword field. В название — нет (difficulty, скорее всего, средняя, а интент размыт).

### C6. Image → SVG / Vectorize — MVP, платный

| Головной ключ | Семена |
|---|---|
| image to svg | png to svg · jpg to svg · vectorize image · vector converter · svg converter · image to vector · convert to svg · svg maker · logo to vector |

- **Проба iTunes:** «vectorize» топ-10 = 63k — Adobe Capture (24k), Linearity Curve (14k), Vector & SVG Maker (11k), The Vector Converter (4,8k). «image to svg» = 122k, но верх замусорен PDF-конвертерами.
- **Читается как:** узкая ниша, конкуренты небольшие. Спрос неизвестен — критично снять popularity: возможно, это floor-value (5) ключи, и тогда фича есть, а трафика нет.
- **Решение:** реализовать по PRD, но приоритет внутри MVP определяется цифрой popularity. Если popularity ≥ 15 при difficulty < 40 — это уникальный дифференциатор в keyword field («png to svg», «vectorize image»).

### C7. Object Remover / Magic Eraser — Roadmap, платный

| Головной ключ | Семена |
|---|---|
| object remover | remove objects from photo · magic eraser · remove people from photo · remove unwanted objects · photo cleanup · erase objects · remove text from photo |

- **Проба iTunes:** топ-10 = 1,8–2,3 млн — Picsart, Remove Objects (129k), Photo Retouch (121k), Magic Eraser (104k), TouchRetouch (58k).
- **Читается как:** большой спрос, плотный средний слой (несколько приложений по 50–130k). Difficulty, скорее всего, 50–70.
- **Решение:** подтверждает roadmap. Если Astro покажет спрос выше, чем у C6 (vectorize), — рассмотреть замену vectorize на object remover уже в MVP: у fal.ai это такой же один вызов.

### C8. Restore old photos — Roadmap, платный

| Головной ключ | Семена |
|---|---|
| photo restoration | restore old photos · old photo restoration · repair old photos · colorize photo · colorize black and white · face restoration · fix old photos |

- **Проба iTunes:** «photo restoration» топ-10 = 636k — Remini, Photomyne (96k), PhotoApp, Pixelup, FixMyPics (9k). «restore old photos» = 2 млн, но это из-за Google Photos.
- **Читается как:** Remini доминирует, но есть нишевые игроки на 9–40k. Средняя выигрываемость.
- **Решение:** roadmap, позиция после C7. Технически близко к C2 (та же модель класса enhance) — дёшево добавить.

### C9. Passport / ID photo — Гипотеза (нет в PRD)

| Головной ключ | Семена |
|---|---|
| passport photo | id photo · passport photo maker · passport photo app · visa photo · id photo maker · passport size photo · photo for documents |

- **Проба iTunes:** топ-10 = 120k — шесть приложений по 9–25k оценок, ни одного гиганта.
- **Читается как:** проверенный спрос (шесть похожих приложений с десятками тысяч оценок = люди платят), никто не доминирует. Технически это композиция того, что у нас уже есть: remove background + белый фон + resize под размеры стран.
- **Решение:** снять popularity/difficulty. Если difficulty < 50 — сильный кандидат в v1.x как отдельный «инструмент» из уже готовых блоков, с собственной посадочной страницей на вебе.

### C10. Generic / All-in-one — только для оценки, не для названия

| Головной ключ | Семена |
|---|---|
| photo editor | photo tools · image tools · ai photo editor · picture editor · photo utilities · all in one photo |

- **Проба iTunes:** топ-10 = 2,4–4,8 млн — PicCollage, Picsart, Photoshop Express, Lightroom.
- **Читается как:** слишком общее (правило 3: интент не наш) и невыигрываемо.
- **Решение:** не тратить символы. Снять только чтобы видеть масштаб.

---

## 3. Предварительная приоритизация (до цифр Astro)

Гипотеза, которую Astro подтвердит или опровергнет:

| Приоритет | Кластер | Роль | Почему |
|---|---|---|---|
| 1 | C3 Convert (HEIC→JPG) | **главный ключ в названии**, бесплатно | самая тонкая конкуренция из всех, прямой интент |
| 2 | C4 Compress | сабтайтл, бесплатно | маленькая ниша, дополняет C3 |
| 3 | C1 Remove Background | ядро монетизации, long-tail в keyword field | спрос огромен, название не выиграть |
| 4 | C2 Upscale / Unblur | ядро монетизации, кандидат в сабтайтл | «unblur photo» / «image upscaler» тоньше, чем «photo enhancer» |
| 5 | C5 Resize | keyword field, бесплатно | интент размыт соцсетями |
| 6 | C6 Vectorize | keyword field, платно | ниша узкая — ждём popularity |
| 7 | C9 Passport photo | v1.x, композиция готовых блоков | проверенный спрос без гиганта |
| 8 | C7 Object remover | roadmap → возможно в MVP вместо C6 | зависит от сравнения popularity C6 vs C7 |
| 9 | C8 Restore | roadmap | Remini доминирует |

**Ключевой вывод пробы:** бесплатные утилиты (convert / compress / resize) — это не «щедрость», а единственные кластеры, где новое приложение реально может ранжироваться с первого дня. AI-инструменты — то, за что платят, но не то, по чему находят. Название и сабтайтл строятся на первых, монетизация — на вторых.

---

## 4. Что не сделано и почему

- **Popularity / difficulty** — нужен Astro. iTunes Search API этих метрик не даёт.
- **Другие рынки** (правило 7: исследование по рынкам, а не перевод) — только после en-US.
- **Главный ключ в названии** фиксируется только после цифр — ставить имя приложения на ключ без popularity нельзя.
