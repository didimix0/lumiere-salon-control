# Тестирование Lumiere Salon Control

Проект использует focused tests для изменяемых runtime-блоков и единый regression runner.

```powershell
node tests/apps-script/run-regression.mjs
```

Текущий подтверждённый baseline: `16/16` suites, errors `0`, warnings `0`.

Проверяются:

- физические схемы книги;
- справочники и data validation;
- UX входных листов;
- периоды и полнота данных;
- финансовые формулы;
- идемпотентность записей;
- защита от дублей и конфликтов;
- Owner Desk;
- аналитика услуг и команды;
- финальная read-only приёмка demo-сценария.

`tests/fixtures/control/` содержит 45 синтетических контрольных сценариев. Реальные персональные и клиентские данные использовать запрещено.
