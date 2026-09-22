# Чек-лист публикации

## Не публиковать

- `.clasp.json`;
- `.clasprc.json`;
- `.dev-secrets/`;
- `.dev-reports/`;
- `scripts/client_secret.json`;
- `scripts/dev-pipeline-config.json`;
- OAuth tokens, Script ID, Deployment ID, Spreadsheet ID;
- реальные клиентские или финансовые данные.

## Перед GitHub

- [ ] использовать только скриншоты с demo-данными;
- [ ] проверить, что ignored-файлы не попали в архив;
- [ ] выполнить поиск по словам `client_secret`, `refresh_token`, `access_token`, `scriptId`, `deploymentId`;
- [ ] проверить итоговый архив отдельно от рабочей папки;
- [ ] добавить ссылку на портфолио, но не на рабочую DEV-книгу;
- [ ] не публиковать доступ на редактирование Google Sheets.

## Что показать

- корневой `README.md`;
- `portfolio/CASE_STUDY.md` или PDF-кейс;
- три изображения из `portfolio/assets/`;
- `src/apps-script/`;
- `tests/apps-script/`;
- выбранные контракты и ADR.

## Что подчеркнуть на собеседовании

- бизнес-логику и экономический смысл KPI;
- явную работу с неполными данными;
- idempotency и защиту от конфликтов;
- сквозную проверку от источника до пользовательского экрана;
- честные ограничения MVP.
