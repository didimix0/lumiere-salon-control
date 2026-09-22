# Apps Script Runtime

Каталог содержит локальный исходный код Google Apps Script для демонстрационного MVP Lumiere Salon Control.

## Реализовано

- реестр и физические схемы 31 листа;
- создание структуры книги и системных справочников;
- data validation и базовый UX входных листов;
- периодный runtime и статус полноты данных;
- безопасная установка финансовых формул;
- идемпотентная загрузка demo-операций и расходов;
- Owner Desk, аналитика услуг и команды;
- read-only end-to-end acceptance.

## Основные публичные функции demo-сценария

- `LC_recoverDemoAndBuildOwnerDesk()`;
- `LC_updateOwnerDeskLive()`;
- `LC_installDemoCosts()`;
- `LC_polishOwnerDeskDemo()`;
- `LC_planDemoAnalytics()`;
- `LC_buildDemoAnalytics()`;
- `LC_validateDemoMvp()`.

## Принципы безопасности

- preflight до записи;
- approval token для изменяющих книгу операций;
- запрет автоматической перезаписи конфликтующих данных;
- идемпотентность повторного запуска;
- отсутствие секретов и идентификаторов Google-проектов в исходниках;
- отсутствие ложных нулей при неполных данных.

Файл `.clasp.json` и локальные OAuth credentials не входят в публичный репозиторий.
