# maxim-semikov.github.io — портфолио + правовые страницы

Чистый статический HTML + `.nojekyll` — не зависит от движка, поэтому структуру и
URL можно сохранить при любом будущем переходе на Hugo / Astro / прочее.

## Структура и канонические URL

```
/                                      → index.html               (главная портфолио)
/projects/psychomatrix/                → projects/psychomatrix/index.html        (страница проекта)
/projects/psychomatrix/privacy/        → projects/psychomatrix/privacy/index.html (политика)
.nojekyll                              → отключает Jekyll, отдаёт файлы как есть
```

Полные адреса после публикации:

- Главная: `https://maxim-semikov.github.io/`
- Проект: `https://maxim-semikov.github.io/projects/psychomatrix/`
- **Политика (в App Store и в приложении):** `https://maxim-semikov.github.io/projects/psychomatrix/privacy/`

## Главное правило, чтобы URL не сломался при смене движка

- Канонический адрес страницы — это **папка со слэшем** (`/.../privacy/`), внутри лежит `index.html`.
  Такой путь умеет воспроизвести любой генератор. Адреса вида `privacy.html` — НЕ использовать.
- Когда выберешь движок (Hugo/Astro/…): либо оставь эти legal-папки как статический passthrough,
  либо настрой генератор так, чтобы он выдавал ровно те же пути `/projects/<name>/privacy/`.
- Ссылка `…/projects/psychomatrix/privacy/` зашита в приложение — менять её = выпуск обновления.
  Поэтому путь зафиксирован сейчас и меняться не должен.
