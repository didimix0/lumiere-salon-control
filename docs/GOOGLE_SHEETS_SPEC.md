==================================================

# Lumiere Control — Google Sheets Physical Specification

**Версия:** 1.6  
**Статус:** физическая спецификация до реализации  
**Продукт:** Lumiere Control  
**Платформа MVP:** Google Sheets и Google Apps Script  
**Назначение:** определить точную физическую структуру книги, листов, колонок, диапазонов, защит, связей и границ расчётов  
**Основание:** `MVP_SCOPE.md`, `UX_SPECIFICATION.md`, `DATA_MODEL.md`, ADR 0002–0009  
**Приоритет финансовых формул:** `FINANCIAL_LOGIC.md`  
**Ограничение:** структура импорта остаётся предварительной до исследования обезличенной реальной выгрузки

---

# 1. Назначение документа

Документ переводит логическую модель Lumiere Control в физическую структуру Google Sheets MVP.

Он определяет:

- точный список листов;
- назначение каждого листа;
- порядок вкладок;
- видимость и защиту;
- расположение пользовательских блоков;
- структуру табличных листов;
- названия и порядок колонок;
- типы данных;
- обязательность полей;
- редактируемые и системные поля;
- правила идентификаторов;
- физическое размещение планов;
- условный денежный блок;
- системные таблицы;
- именованные диапазоны;
- связи между листами;
- порядок пересчёта;
- границу между формулами и Apps Script;
- требования к закрытию периода;
- правила резервного копирования;
- ограничения до начала программной реализации.

Документ не содержит:

- фактических формул Google Sheets;
- программного кода;
- Apps Script;
- реальных данных;
- дизайна готового дашборда;
- окончательной схемы конкретной внешней выгрузки.

---

# 2. Источники истины

При физическом проектировании применяются следующие правила.

## 2.1. Финансовые формулы

Источник:

`FINANCIAL_LOGIC.md`

Физическая структура не может изменять финансовую формулу ради удобства листа.

## 2.2. Экономический смысл

Источник:

`SALON_ECONOMICS.md`

## 2.3. Границы MVP

Источник:

`MVP_SCOPE.md`

Наличие сущности в `DATA_MODEL.md` не означает обязательного включения пользовательского модуля в MVP.

## 2.4. Логические сущности

Источник:

`DATA_MODEL.md`

Физическая реализация может объединить логические сущности, если сохраняются:

- устойчивые ID;
- разделение факта и расчёта;
- история;
- прослеживаемость;
- отсутствие двойного учёта.

## 2.5. Интерфейс

Источник:

`UX_SPECIFICATION.md`

UX не может изменить формулу или границу MVP.

## 2.6. Принятые архитектурные решения

Источники:

- ADR 0002;
- ADR 0003;
- ADR 0004;
- ADR 0005;
- ADR 0006;
- ADR 0007;
- ADR 0008;
- ADR 0009.

---

# 3. Общая архитектура книги

Книга разделяется на четыре уровня:

1. Управленческий интерфейс.
2. Ввод данных.
3. Настройки и справочники.
4. Системные листы.

Порядок вкладок должен соответствовать номерным префиксам.

---

# 4. Полный список листов

## 4.1. Управленческие листы

1. `00_Старт`
2. `01_Рабочий стол`
3. `02_Качество данных`
4. `03_Услуги`
5. `04_Команда`
6. `05_Сценарии`
7. `06_Решения`

## 4.2. Листы ввода

8. `10_Операции`
9. `11_Расходы`
10. `12_Смены`
11. `13_Материалы`
12. `14_Возвраты`
13. `15_Обязательства`

`15_Обязательства` является условным листом денежного блока.

## 4.3. Настройки и справочники

14. `20_Настройки`
15. `21_Услуги_справочник`
16. `22_Мастера_справочник`
17. `23_Схемы_оплаты`
18. `24_Планы`

## 4.4. Системные листы

19. `_SYS_PERIODS`
20. `_SYS_CALC`
21. `_SYS_SERVICE_METRICS`
22. `_SYS_MASTER_METRICS`
23. `_SYS_RECOMMENDATIONS`
24. `_SYS_DATA_QUALITY`
25. `_SYS_SCENARIOS`
26. `_SYS_ADJUSTMENTS`
27. `_SYS_IMPORTS`
28. `_SYS_STAGING`
29. `_SYS_IMPORT_MAPPINGS`
30. `_SYS_LOG`
31. `_SYS_LOOKUPS`

Всего в физической спецификации:

- 7 управленческих листов;
- 6 листов ввода;
- 5 листов настроек и справочников;
- 13 системных листов;
- 31 лист при включённом денежном блоке;
- 30 активных листов при отключённом денежном блоке.

Лист `15_Обязательства` может оставаться скрытым, если денежный блок отключён.

---

# 5. Правила именования

## 5.1. Пользовательские листы

Используются русские названия с числовым префиксом.

Префикс определяет группу:

- `00`–`06` — управление;
- `10`–`15` — ввод;
- `20`–`24` — настройки.

## 5.2. Системные листы

Используется префикс:

`_SYS_`

Системные листы не переименовываются пользователем.

## 5.3. Поля

Физические заголовки колонок должны использовать технические имена в `snake_case`.

Пользовательское пояснение хранится:

- в примечании заголовка;
- в строке инструкции;
- либо в отдельной легенде.

## 5.4. Идентификаторы

Все ID имеют суффикс:

`_id`

## 5.5. Логические значения

Используются значения:

- `TRUE`;
- `FALSE`.

Не использовать:

- «да»;
- «нет»;
- `1`;
- `0`

как физическое значение логического поля.

---

# 6. Общие правила табличных листов

Для листов:

- `10_Операции`;
- `11_Расходы`;
- `12_Смены`;
- `13_Материалы`;
- `14_Возвраты`;
- `21_Услуги_справочник`;
- `22_Мастера_справочник`;
- `23_Схемы_оплаты`;
- `24_Планы`

используется стандартная структура.

## 6.1. Строки

- строка 1 — название листа;
- строка 2 — краткая инструкция;
- строка 3 — действия и статус;
- строка 4 — заголовки колонок;
- строка 5 и ниже — записи.

## 6.2. Закрепление

Закрепляются:

- строки 1–4;
- технические идентификаторы слева при необходимости.

## 6.3. Фильтр

Фильтр включается с строки 4.

## 6.4. Объединение ячеек

На табличных листах объединённые ячейки запрещены.

## 6.5. Пустые строки

Пустые строки внутри активного диапазона не должны использоваться как разделители.

## 6.6. Редактируемые колонки

Должны иметь:

- явную метку;
- визуальное отличие;
- разрешение на редактирование.

## 6.7. Системные колонки

Должны быть:

- защищены;
- при необходимости скрыты;
- заполнены формулами или Apps Script;
- недоступны для обычного ручного изменения.

---

# 7. Общие типы физических полей

## 7.1. ID

Формат:

`plain_text`

Даже числовой внешний ID хранится как текст, чтобы не терять:

- ведущие нули;
- длинные значения;
- составные ключи.

## 7.2. Деньги

Формат:

`number`

Минимальная внутренняя точность:

- без принудительного округления исходного значения;
- пользовательское отображение обычно до двух знаков;
- карточки могут показывать целые денежные единицы.

## 7.3. Процент

Физическое значение:

`decimal`

Пример:

`0.30` означает 30%.

## 7.4. Дата

Физический тип:

`date`

## 7.5. Дата и время

Физический тип:

`datetime`

## 7.6. Продолжительность

Хранится в целых минутах.

## 7.7. Перечисление

Используется проверка данных на основе `_SYS_LOOKUPS`.

## 7.8. Комментарий

Формат:

`plain_text`

## 7.9. Статус качества

Используется утверждённый список:

- `actual`;
- `calculated`;
- `estimated`;
- `incomplete`;
- `requires_review`;
- `invalid`;
- `not_applicable`.

---

# 8. Глобальная верхняя область управленческих листов

На листах `00`–`06` используется единый верхний блок.

## 8.1. Диапазон

Предварительный диапазон:

`A1:L3`

## 8.2. Содержание

- название продукта;
- название салона;
- выбранный период;
- статус периода;
- дата последнего пересчёта;
- статус качества данных;
- навигация;
- основные действия.

## 8.3. Защита

Расчётные значения защищены.

Пользователь может изменять только разрешённый выбор периода, если он реализован непосредственно на листе.

## 8.4. Навигация

Переходы:

- Старт;
- Рабочий стол;
- Качество данных;
- Услуги;
- Команда;
- Сценарии;
- Решения;
- Ввод и настройки.

---

# 9. Лист `00_Старт`

## 9.1. Назначение

Первоначальная настройка и контроль готовности.

## 9.2. Физические зоны

### `A1:L3`

Глобальная верхняя область.

### `A5:F18`

Чек-лист подготовки.

Колонки:

- `step_order`;
- `step_code`;
- `step_name`;
- `status`;
- `blocking_issue_count`;
- `target_sheet`.

### `H5:L12`

Краткое описание продукта и ограничения.

### `H14:L18`

Основные действия:

- открыть настройки;
- загрузить операции;
- проверить данные;
- открыть рабочий стол.

## 9.3. Редактирование

Пользователь напрямую не редактирует статусы шагов.

Они рассчитываются по готовности данных.

---

# 10. Лист `01_Рабочий стол`

## 10.1. Назначение

Главный экран владельца.

## 10.2. Физические зоны

### `A1:L3`

Глобальная верхняя область.

### `A5:L9`

Карточки ключевых показателей.

Максимум:

- 8 обязательных карточек;
- до 2 условных денежных карточек.

Карточки:

1. Чистая выручка.
2. Операционная прибыль.
3. Операционная рентабельность.
4. Выполнение плана выручки.
5. Выполнение плана прибыли.
6. Прогноз операционной прибыли.
7. Запас финансовой прочности.
8. Качество данных.
9. Денежный остаток — условно.
10. Расчётно доступно владельцу — условно.

### `A11:F20`

Причины результата.

Колонки логического представления:

- `driver_type`;
- `driver_name`;
- `impact_amount`;
- `comparison_basis`;
- `quality_status`;
- `detail_target`.

Максимум:

- 3 положительных фактора;
- 3 отрицательных фактора.

### `G11:L20`

Приоритетные рекомендации.

Максимум:

3 карточки.

### `A22:F30`

Краткий обзор услуг.

### `G22:L30`

Краткий обзор команды.

### `A32:L37`

Качество данных и ограничения.

## 10.3. Правила

- пользователь не вводит данные на рабочем столе;
- карточки получают значения только из системных расчётов;
- факт, оценка и прогноз имеют текстовую метку;
- отсутствие данных не заменяется нулём;
- условные денежные карточки скрываются при отключённом модуле.

---

# 11. Лист `02_Качество данных`

## 11.1. Назначение

Отображение ошибок и ограничений.

## 11.2. Физические зоны

### `A1:L3`

Глобальная верхняя область.

### `A5:L8`

Сводка:

- критические ошибки;
- ошибки;
- предупреждения;
- информационные сообщения;
- статус прибыли;
- статус прогноза;
- статус денежного блока.

### `A10:J`

Таблица проблем.

Колонки:

1. `severity`
2. `issue_code`
3. `issue_description`
4. `entity_type`
5. `entity_id`
6. `period_id`
7. `blocked_metric`
8. `required_action`
9. `issue_status`
10. `source_link`

## 11.3. Источник

`_SYS_DATA_QUALITY`

## 11.4. Редактирование

Пользователь может менять только:

- `issue_status` через управляемое действие;
- комментарий разрешения, если интерфейс будет добавлен.

Исходная системная запись не редактируется напрямую.

---

# 12. Лист `03_Услуги`

## 12.1. Назначение

Анализ финансового результата услуг.

## 12.2. Физические зоны

### `A1:L3`

Глобальная верхняя область.

### `A5:L8`

Сводные показатели:

- выручка услуг;
- маржинальная прибыль;
- взвешенная маржинальность;
- количество услуг;
- занятые часы;
- маржинальная прибыль за час;
- доля оценочных данных.

### `A10:N`

Основная таблица.

Колонки:

1. `service_id`
2. `service_name`
3. `service_category`
4. `procedure_quantity`
5. `net_service_revenue`
6. `material_cost`
7. `master_variable_pay`
8. `other_variable_cost`
9. `contribution_profit`
10. `contribution_margin`
11. `occupied_hours`
12. `contribution_per_hour`
13. `profit_share`
14. `data_quality_status`

## 12.3. Источник

`_SYS_SERVICE_METRICS`

## 12.4. Сортировка по умолчанию

`contribution_profit` по убыванию.

## 12.5. Детализация

При выборе услуги должны быть доступны:

- операции;
- скидки;
- возвраты;
- материалы;
- выплаты;
- продолжительность;
- рекомендации;
- сценарии.

---

# 13. Лист `04_Команда`

## 13.1. Назначение

Анализ прямого результата мастеров.

## 13.2. Физические зоны

### `A1:L3`

Глобальная верхняя область.

### `A5:L8`

Сводка:

- выручка команды;
- общая выплата;
- прямой результат;
- взвешенная доля выплат;
- занятые часы;
- доступные часы;
- загрузка;
- концентрация результата.

### `A10:Q`

Основная таблица.

Колонки:

1. `master_id`
2. `master_name`
3. `cooperation_type`
4. `compensation_scheme_type`
5. `procedure_quantity`
6. `net_service_revenue`
7. `material_cost`
8. `variable_pay`
9. `fixed_per_service_pay`
10. `shift_pay`
11. `salary_pay`
12. `total_master_pay`
13. `direct_result`
14. `occupied_hours`
15. `available_hours`
16. `utilization_rate`
17. `direct_result_per_hour`
18. `team_result_share`
19. `data_quality_status`

Если физическая ширина окажется чрезмерной, часть колонок может быть сгруппирована, но не удалена из модели.

## 13.3. Источник

`_SYS_MASTER_METRICS`

## 13.4. Арендатор

Для `chair_renter` отображаются:

- арендный доход;
- прямые расходы аренды;
- чистый вклад.

Клиентская выручка арендатора не отображается как выручка салона.

---

# 14. Лист `05_Сценарии`

## 14.1. Назначение

Расчёт последствий управленческого действия без изменения факта.

## 14.2. Физические зоны

### `A1:L3`

Глобальная верхняя область.

### `A5:D18`

Ввод параметров.

### `F5:I18`

Сравнение:

- базовое значение;
- сценарное значение;
- разница;
- единица.

### `K5:N18`

Ограничения:

- допущения;
- качество данных;
- риск;
- неприменимые показатели.

### `A21:N`

Сохранённые сценарии.

## 14.3. Типы сценариев

- `price_change`;
- `material_change`;
- `compensation_change`.

## 14.4. Защита

Пользователь редактирует только сценарные параметры.

Базовые фактические показатели и результаты защищены.

## 14.5. Правило

Сценарий не изменяет:

- `10_Операции`;
- `11_Расходы`;
- справочники;
- фактические показатели;
- закрытый период.

---

# 15. Лист `06_Решения`

## 15.1. Назначение

Фиксация решений владельца.

## 15.2. Физическая таблица

Начало:

`A5`

Колонки:

1. `decision_id`
2. `decision_date`
3. `decision_title`
4. `recommendation_id`
5. `scenario_id`
6. `action_description`
7. `responsible_person`
8. `decision_status`
9. `expected_effect_metric`
10. `expected_effect_amount`
11. `planned_implementation_date`
12. `actual_implementation_date`
13. `evaluation_date`
14. `comment`
15. `created_at`
16. `updated_at`

## 15.3. Редактируемые поля

- название;
- действие;
- ответственный;
- статус;
- даты;
- ожидаемый эффект;
- комментарий.

## 15.4. Системные поля

- ID;
- связи;
- дата создания;
- дата обновления.

---

# 16. Лист `10_Операции`

## 16.1. Назначение

Каноническая таблица операций услуг.

## 16.2. Статус контракта

Структура является предварительным каноническим контрактом.

Окончательный состав и сопоставление должны быть подтверждены реальной обезличенной выгрузкой.

## 16.3. Колонки

| № | Поле | Тип | Обязательность | Ввод | Защита |
|---:|---|---|---|---|---|
| 1 | `internal_operation_id` | text | обязательно после создания | system | protected |
| 2 | `source_system` | enum/text | обязательно | user/import | editable |
| 3 | `import_batch_id` | text | условно | system | protected |
| 4 | `external_transaction_id` | text | условно | import | editable |
| 5 | `external_line_id` | text | условно | import | editable |
| 6 | `operation_date` | date | обязательно | user/import | editable |
| 7 | `operation_datetime` | datetime | условно | user/import | editable |
| 8 | `operation_status` | enum | обязательно | user/import | editable |
| 9 | `service_id` | text | обязательно после сопоставления | system/user | editable with validation |
| 10 | `service_name_raw` | text | условно | import | editable |
| 11 | `master_id` | text | обязательно после сопоставления | system/user | editable with validation |
| 12 | `master_name_raw` | text | условно | import | editable |
| 13 | `quantity` | number | обязательно | user/import | editable |
| 14 | `list_price` | money | обязательно | user/import | editable |
| 15 | `charged_amount` | money | обязательно | user/import | editable |
| 16 | `payment_method` | enum | условно | user/import | editable |
| 17 | `cash_amount` | money | условно | user/import | editable |
| 18 | `cashless_amount` | money | условно | user/import | editable |
| 19 | `actual_fee` | money | условно | user/import | editable |
| 20 | `actual_duration_minutes` | integer | условно | user/import | editable |
| 21 | `actual_material_cost` | money | условно | user/import | editable |
| 22 | `discount_reason` | text/enum | условно | user/import | editable |
| 23 | `comment` | text | необязательно | user | editable |
| 24 | `source_type` | enum | обязательно | system/user | protected after creation |
| 25 | `row_fingerprint` | text | system | system | protected |
| 26 | `duplicate_status` | enum | system | system | protected |
| 27 | `validation_status` | enum | system | system | protected |
| 28 | `included_in_calculation` | boolean | system | system | protected |
| 29 | `created_at` | datetime | system | system | protected |
| 30 | `updated_at` | datetime | system | system | protected |

## 16.4. Статусы операции

- `planned`;
- `confirmed`;
- `completed`;
- `cancelled`;
- `no_show`;
- `free_rework`;
- `technical_adjustment`.

Фактическую выручку формируют только применимые выполненные строки.

## 16.5. Дубли

`row_fingerprint` используется только для поиска возможного дубля.

`duplicate_status`:

- `not_checked`;
- `unique`;
- `possible_duplicate`;
- `confirmed_duplicate`;
- `confirmed_not_duplicate`.

Автоматическое удаление или объединение запрещено.

## 16.6. Расчётные показатели

Финансовые расчётные колонки не должны добавляться в пользовательскую часть `10_Операции`.

Они размещаются в `_SYS_CALC` и связанных системных представлениях.

---

# 17. Лист `11_Расходы`

## 17.1. Колонки

| № | Поле | Тип | Обязательность | Ввод |
|---:|---|---|---|---|
| 1 | `expense_id` | text | system | system |
| 2 | `recognition_date` | date | обязательно | user |
| 3 | `payment_date` | date | условно | user |
| 4 | `expense_category` | enum | обязательно | user |
| 5 | `expense_nature` | enum | обязательно | user |
| 6 | `amount` | money | обязательно | user |
| 7 | `is_recurring` | boolean | обязательно | user |
| 8 | `is_one_off` | boolean | обязательно | user |
| 9 | `master_id` | text | условно | user |
| 10 | `service_id` | text | условно | user |
| 11 | `is_paid` | boolean | обязательно | user |
| 12 | `source_type` | enum | обязательно | user/system |
| 13 | `comment` | text | необязательно | user |
| 14 | `validation_status` | enum | system | system |
| 15 | `included_in_calculation` | boolean | system | system |
| 16 | `created_at` | datetime | system | system |
| 17 | `updated_at` | datetime | system | system |

## 17.2. Значения `expense_nature`

- `fixed_operating`;
- `variable_operating`;
- `one_off_operating`;
- `investment`;
- `financial_interest`;
- `loan_principal`;
- `owner_distribution`;
- `tax`;
- `other`.

## 17.3. Правило

Инвестиции, основная сумма кредита и распределение владельцу не включаются автоматически в операционные расходы.

---

# 18. Лист `12_Смены`

## 18.1. Колонки

1. `shift_id`
2. `shift_date`
3. `master_id`
4. `scheduled_start`
5. `scheduled_end`
6. `excluded_minutes`
7. `available_minutes`
8. `is_payable`
9. `shift_rate_override`
10. `shift_status`
11. `comment`
12. `validation_status`
13. `created_at`
14. `updated_at`

## 18.2. Ввод

Пользователь вводит:

- дату;
- мастера;
- начало;
- окончание;
- исключённые минуты;
- оплачиваемость;
- переопределённую ставку;
- статус;
- комментарий.

## 18.3. Расчёт

`available_minutes` является защищённым расчётным полем.

## 18.4. Статусы

- `planned`;
- `worked`;
- `cancelled`;
- `sick_leave`;
- `vacation`;
- `training`;
- `other_closed`.

## 18.5. Правило

Фиксированная ставка начисляется один раз на применимую оплачиваемую смену.

---

# 19. Лист `13_Материалы`

## 19.1. Назначение

Физически объединяет:

- нормативы;
- фактический общий расход;
- фактический детальный расход.

## 19.2. Колонки

1. `material_record_id`
2. `record_type`
3. `service_id`
4. `internal_operation_id`
5. `material_code`
6. `material_name`
7. `unit_of_measure`
8. `quantity`
9. `unit_cost`
10. `total_cost`
11. `effective_from`
12. `effective_to`
13. `approved_by`
14. `approval_date`
15. `source_type`
16. `is_adjustment`
17. `adjustment_reason`
18. `comment`
19. `validation_status`
20. `created_at`
21. `updated_at`

## 19.3. `record_type`

- `service_norm`;
- `operation_actual_total`;
- `operation_actual_detail`.

## 19.4. Условная обязательность

### Для норматива

Обязательны:

- `service_id`;
- `total_cost` либо количество и стоимость;
- период действия;
- утверждение.

### Для фактического расхода

Обязательны:

- `internal_operation_id`;
- `total_cost` либо количество и стоимость.

## 19.5. Правило приоритета

1. Детальный фактический расход.
2. Общий фактический расход операции.
3. Действующий утверждённый норматив.
4. Отсутствие данных.

Одновременный двойной учёт детального и общего факта запрещён.

---

# 20. Лист `14_Возвраты`

## 20.1. Колонки

1. `refund_id`
2. `original_operation_id`
3. `refund_date`
4. `refund_amount`
5. `refund_method`
6. `refund_reason`
7. `master_pay_adjustment_mode`
8. `master_pay_adjustment_amount`
9. `tax_adjustment_mode`
10. `fee_adjustment_mode`
11. `source_type`
12. `comment`
13. `validation_status`
14. `included_in_calculation`
15. `created_at`
16. `updated_at`

## 20.2. Правила

- сумма возврата хранится как положительное абсолютное значение;
- возврат не удаляет исходную операцию;
- корректировка выплаты мастера требует отдельного правила;
- превышение исходной чистой выручки блокирует строку;
- частичный возврат поддерживается.

---

# 21. Лист `15_Обязательства`

## 21.1. Статус

Условный пользовательский лист.

Используется только при включённом денежном блоке.

## 21.2. Верхняя область

### `A1:H10`

Агрегированные входные данные:

- `cash_balance_current`;
- `restricted_cash_amount`;
- `client_advances_balance`;
- `reserve_method`;
- `reserve_amount`;
- `profit_distribution_rate`;
- `owner_distributions_already_made`;
- `cash_data_as_of_date`;
- `cash_block_completeness_confirmed`.

Эти значения должны иметь именованные диапазоны.

## 21.3. Таблица обязательств

Заголовки в строке 12.

Данные с строки 13.

Колонки:

1. `obligation_id`
2. `obligation_type`
3. `due_date`
4. `amount`
5. `paid_amount`
6. `obligation_status`
7. `priority`
8. `included_in_distribution_limit`
9. `comment`
10. `validation_status`
11. `created_at`
12. `updated_at`

## 21.4. Статусы

- `planned`;
- `due`;
- `partially_paid`;
- `paid`;
- `overdue`;
- `cancelled`.

## 21.5. Блокировка расчёта

Доступная владельцу сумма не рассчитывается, если:

- денежный блок отключён;
- не подтверждена полнота данных;
- отсутствует денежный остаток;
- отсутствует резерв;
- отсутствует информация об обязательствах;
- отсутствуют данные по клиентским авансам.

---

# 22. Лист `20_Настройки`

## 22.1. Физическая модель

Используется таблица настроек.

Колонки:

1. `setting_key`
2. `setting_section`
3. `setting_label`
4. `setting_value`
5. `value_type`
6. `is_required`
7. `effective_from`
8. `effective_to`
9. `validation_status`
10. `comment`

## 22.2. Обязательные ключи

### Основные

- `salon_name`
- `currency_code`
- `timezone`
- `active_period_id`
- `default_language`

### Налог

- `tax_mode`
- `tax_rate`
- `tax_base_configuration`

### Комиссии

- `default_cashless_fee_rate`
- `default_cashless_fixed_fee`

### План и прогноз

- `forecast_method`
- `working_days_source`

### Рекомендации

- `materiality_absolute`
- `materiality_relative`
- `minimum_operation_count`
- `minimum_completed_days`
- `low_utilization_threshold`
- `low_profit_per_hour_threshold`
- `high_result_concentration_threshold`
- `material_overrun_threshold`

### Денежный блок

- `cash_module_enabled`
- `reserve_method`
- `default_reserve_amount`
- `profit_distribution_rate`

### Технические

- `specification_version`
- `financial_logic_version`
- `last_recalculation_at`

## 22.3. Порог без значения

Если пользовательский порог не задан:

- соответствующее правило не создаёт категоричную рекомендацию;
- формируется информационное сообщение или запрос настройки.

---

# 23. Лист `21_Услуги_справочник`

## 23.1. Колонки

1. `service_id`
2. `service_category`
3. `service_code`
4. `service_name`
5. `service_variant`
6. `default_list_price`
7. `default_duration_minutes`
8. `material_cost_mode`
9. `default_material_cost`
10. `is_active`
11. `effective_from`
12. `effective_to`
13. `comment`
14. `validation_status`
15. `created_at`
16. `updated_at`

## 23.2. `material_cost_mode`

- `actual_detailed`;
- `actual_total`;
- `standard`;
- `not_tracked`.

## 23.3. Правила

- ID защищён;
- историческая услуга архивируется;
- изменение базовой цены не изменяет операции прошлого периода;
- отрицательная цена запрещена;
- нулевая продолжительность требует проверки.

---

# 24. Лист `22_Мастера_справочник`

## 24.1. Колонки

1. `master_id`
2. `master_code`
3. `display_name`
4. `cooperation_type`
5. `start_date`
6. `end_date`
7. `adaptation_end_date`
8. `is_owner`
9. `is_active`
10. `comment`
11. `validation_status`
12. `created_at`
13. `updated_at`

## 24.2. `cooperation_type`

- `employee`;
- `contractor`;
- `chair_renter`;
- `owner_master`;
- `other`.

## 24.3. Ограничение

Не хранить чувствительные персональные данные.

---

# 25. Лист `23_Схемы_оплаты`

## 25.1. Физическая модель

Схема и её назначение мастеру объединяются в одну таблицу MVP.

## 25.2. Колонки

1. `assignment_id`
2. `master_id`
3. `scheme_name`
4. `scheme_type`
5. `commission_base_type`
6. `commission_rate`
7. `fixed_rate_per_service`
8. `shift_rate`
9. `monthly_salary`
10. `fixed_part`
11. `service_category`
12. `service_id`
13. `effective_from`
14. `effective_to`
15. `priority`
16. `manual_final_pay_allowed`
17. `is_active`
18. `comment`
19. `validation_status`
20. `created_at`
21. `updated_at`

## 25.3. `scheme_type`

- `percentage`;
- `fixed_per_service`;
- `fixed_per_shift`;
- `monthly_salary`;
- `mixed`;
- `manual`;
- `chair_rent`.

## 25.4. `commission_base_type`

- `charged_amount`;
- `list_value`;
- `charged_amount_minus_materials`;
- `manual_base`;
- `not_applicable`.

## 25.5. Приоритет

1. Конкретная услуга.
2. Категория.
3. Общая схема мастера.

## 25.6. Валидация

Блокировать:

- пересекающиеся назначения одного уровня;
- процент без базы;
- ставку смены в поле ставки услуги;
- оклад без периода действия;
- несовместимые одновременно заполненные поля.

---

# 26. Лист `24_Планы`

## 26.1. Статус

Планы выручки и операционной прибыли входят в обязательный MVP.

## 26.2. Колонки

1. `plan_id`
2. `period_id`
3. `metric_code`
4. `dimension_type`
5. `dimension_id`
6. `plan_value`
7. `value_unit`
8. `direction_type`
9. `approved_at`
10. `approved_by`
11. `comment`
12. `validation_status`
13. `created_at`
14. `updated_at`

## 26.3. Обязательные `metric_code`

- `net_service_revenue`;
- `operating_profit`.

## 26.4. Дополнительные

- `material_cost`;
- `master_pay`;
- `fixed_expense`;
- `procedure_quantity`;
- `utilization`;
- `contribution_margin`.

## 26.5. Нулевой план

Нулевой план не должен приводить к делению на ноль.

Процент выполнения получает статус:

`not_applicable`

или отдельное понятное сообщение.

---

# 27. Лист `_SYS_PERIODS`

## 27.1. Колонки

1. `period_id`
2. `period_type`
3. `date_from`
4. `date_to`
5. `period_status`
6. `closed_at`
7. `closed_by`
8. `reopened_at`
9. `reopened_by`
10. `reopen_reason`
11. `snapshot_reference`
12. `created_at`
13. `updated_at`
14. `comment`

## 27.2. Статусы

- `open`;
- `review`;
- `closed`;
- `reopened`.

## 27.3. Правило

Изменение закрытого периода без явного переоткрытия запрещено.

---

# 28. Лист `_SYS_CALC`

## 28.1. Назначение

Нормализованное хранилище рассчитанных метрик.

## 28.2. Колонки

1. `calc_record_id`
2. `period_id`
3. `metric_code`
4. `dimension_type`
5. `dimension_id`
6. `metric_value`
7. `value_unit`
8. `data_quality_status`
9. `calculation_rule_version`
10. `source_trace_reference`
11. `calculated_at`
12. `comment`

## 28.3. `dimension_type`

- `salon`;
- `service`;
- `service_category`;
- `master`;
- `expense_category`;
- `scenario`;
- `other`.

## 28.4. Ограничение

`_SYS_CALC` не является ручным вводом.

---

# 29. Лист `_SYS_SERVICE_METRICS`

## 29.1. Колонки

1. `period_id`
2. `service_id`
3. `service_name`
4. `service_category`
5. `procedure_quantity`
6. `list_value`
7. `discount_amount`
8. `refund_amount`
9. `net_service_revenue`
10. `material_cost`
11. `variable_master_pay`
12. `fixed_per_service_pay`
13. `tax_expense`
14. `acquiring_expense`
15. `other_variable_expense`
16. `contribution_profit`
17. `contribution_margin`
18. `occupied_minutes`
19. `contribution_per_hour`
20. `profit_share`
21. `data_quality_status`
22. `calculated_at`

---

# 30. Лист `_SYS_MASTER_METRICS`

## 30.1. Колонки

1. `period_id`
2. `master_id`
3. `master_name`
4. `cooperation_type`
5. `scheme_type`
6. `procedure_quantity`
7. `net_service_revenue`
8. `material_cost`
9. `variable_pay`
10. `fixed_per_service_pay`
11. `shift_pay`
12. `salary_pay`
13. `manual_adjustment`
14. `total_master_pay`
15. `direct_result`
16. `occupied_minutes`
17. `available_minutes`
18. `utilization_rate`
19. `direct_result_per_hour`
20. `team_result_share`
21. `data_quality_status`
22. `calculated_at`

---

# 31. Лист `_SYS_RECOMMENDATIONS`

## 31.1. Колонки

1. `recommendation_id`
2. `period_id`
3. `rule_code`
4. `rule_version`
5. `recommendation_type`
6. `priority`
7. `title`
8. `owner_question`
9. `signal_description`
10. `reason_summary`
11. `financial_impact_type`
12. `financial_impact_amount`
13. `confidence_level`
14. `implementation_complexity`
15. `risk_level`
16. `recommended_action`
17. `limitations`
18. `data_quality_status`
19. `related_entity_type`
20. `related_entity_id`
21. `scenario_id`
22. `recommendation_status`
23. `generated_at`
24. `expires_at`
25. `deduplication_key`
26. `comment`

## 31.2. Очереди правил

Поле `rule_version` и код правила должны позволять различать:

- первую очередь;
- вторую очередь.

## 31.3. Дедупликация

`deduplication_key` строится на основе:

- правила;
- объекта;
- периода;
- корневой причины.

---

# 32. Лист `_SYS_DATA_QUALITY`

## 32.1. Колонки

1. `data_quality_issue_id`
2. `period_id`
3. `entity_type`
4. `entity_id`
5. `issue_code`
6. `severity`
7. `issue_description`
8. `blocked_metric`
9. `required_action`
10. `detected_at`
11. `issue_status`
12. `resolved_at`
13. `resolved_by`
14. `resolution_comment`
15. `source_link`

## 32.2. `severity`

- `critical`;
- `error`;
- `warning`;
- `information`.

## 32.3. Правило

Критическая проблема блокирует только связанные показатели, если влияние можно локализовать.

---

# 33. Лист `_SYS_SCENARIOS`

## 33.1. Физическая модель

В одном системном листе хранятся:

- заголовки сценариев;
- параметры;
- результаты.

Используется поле `record_type`.

## 33.2. Колонки

1. `scenario_record_id`
2. `record_type`
3. `scenario_id`
4. `scenario_name`
5. `scenario_type`
6. `base_period_id`
7. `parameter_code`
8. `dimension_type`
9. `dimension_id`
10. `base_value`
11. `scenario_value`
12. `difference`
13. `value_unit`
14. `is_user_assumption`
15. `data_quality_status`
16. `scenario_status`
17. `created_at`
18. `created_by`
19. `calculated_at`
20. `comment`

## 33.3. `record_type`

- `header`;
- `parameter`;
- `result`.

---

# 34. Лист `_SYS_ADJUSTMENTS`

## 34.1. Колонки

1. `manual_adjustment_id`
2. `adjustment_date`
3. `period_id`
4. `target_entity_type`
5. `target_entity_id`
6. `adjustment_type`
7. `amount`
8. `previous_value`
9. `new_value`
10. `reason`
11. `created_by`
12. `approved_by`
13. `source_reference`
14. `is_reversal`
15. `reversed_adjustment_id`
16. `created_at`
17. `comment`

## 34.2. Правила

- корректировка не перезаписывает источник;
- корректировка учитывается один раз;
- сторно имеет ссылку;
- причина и автор обязательны.

---

# 35. Лист `_SYS_IMPORTS`

## 35.1. Назначение

Журнал импортов.

## 35.2. Колонки

1. `import_batch_id`
2. `source_system`
3. `file_name`
4. `source_period`
5. `import_started_at`
6. `import_completed_at`
7. `import_status`
8. `total_rows`
9. `accepted_rows`
10. `rejected_rows`
11. `possible_duplicate_rows`
12. `confirmed_duplicate_rows`
13. `imported_by`
14. `mapping_version`
15. `backup_reference`
16. `comment`

## 35.3. Статусы

- `pending`;
- `processing`;
- `completed`;
- `completed_with_errors`;
- `failed`;
- `rolled_back`.

## 35.4. Ограничение

Конкретный `mapping_version` не утверждается до исследования реальной выгрузки.

---

# 36. Лист `_SYS_LOG`

## 36.1. Колонки

1. `log_id`
2. `event_datetime`
3. `event_type`
4. `user_id`
5. `period_id`
6. `entity_type`
7. `entity_id`
8. `action`
9. `previous_value`
10. `new_value`
11. `reason`
12. `result_status`
13. `technical_reference`
14. `comment`

## 36.2. События

- импорт;
- пересчёт;
- изменение настройки;
- закрытие;
- переоткрытие;
- корректировка;
- резервная копия;
- изменение рекомендации;
- сохранение сценария;
- сохранение решения;
- техническая ошибка.

---

# 37. Лист `_SYS_LOOKUPS`

## 37.1. Назначение

Единый источник списков проверки данных.

## 37.2. Физическая модель

Каждый список размещается в отдельной колонке.

Минимальные списки:

- статусы операции;
- типы сотрудничества;
- типы схем оплаты;
- базы процента;
- статусы смен;
- типы расходов;
- способы оплаты;
- статусы качества;
- уровни критичности;
- статусы рекомендаций;
- типы финансового влияния;
- уровни уверенности;
- уровни сложности;
- уровни риска;
- статусы периода;
- статусы решений;
- типы обязательств;
- статусы обязательств;
- типы сценариев.

## 37.3. Защита

Лист скрыт и защищён.

Изменение списков выполняется только через контролируемое обновление версии.

---

# 38. Именованные диапазоны

## 38.1. Общие правила

Имена:

- на английском;
- в `snake_case`;
- без ссылок на визуальное положение;
- отражают экономический смысл.

## 38.2. Настройки

Минимальный список:

- `cfg_salon_name`
- `cfg_currency_code`
- `cfg_timezone`
- `cfg_active_period_id`
- `cfg_tax_mode`
- `cfg_tax_rate`
- `cfg_tax_base_configuration`
- `cfg_default_cashless_fee_rate`
- `cfg_forecast_method`
- `cfg_materiality_absolute`
- `cfg_materiality_relative`
- `cfg_minimum_operation_count`
- `cfg_minimum_completed_days`
- `cfg_low_utilization_threshold`
- `cfg_low_profit_per_hour_threshold`
- `cfg_high_result_concentration_threshold`
- `cfg_material_overrun_threshold`
- `cfg_cash_module_enabled`
- `cfg_reserve_method`
- `cfg_default_reserve_amount`
- `cfg_profit_distribution_rate`

## 38.3. Денежный блок

- `cash_balance_current`
- `restricted_cash_amount`
- `client_advances_balance`
- `reserve_amount_current`
- `owner_distributions_already_made`
- `cash_data_as_of_date`
- `cash_block_completeness_confirmed`

## 38.4. Таблицы

Должны быть определены логические именованные диапазоны:

- `tbl_operations`
- `tbl_expenses`
- `tbl_shifts`
- `tbl_materials`
- `tbl_refunds`
- `tbl_obligations`
- `tbl_services`
- `tbl_masters`
- `tbl_compensation`
- `tbl_plans`
- `tbl_periods`
- `tbl_adjustments`

Точная техническая реализация динамического размера определяется позднее.

---

# 39. Связи между листами

## 39.1. Операции и услуги

`10_Операции.service_id` → `21_Услуги_справочник.service_id`

## 39.2. Операции и мастера

`10_Операции.master_id` → `22_Мастера_справочник.master_id`

## 39.3. Выплаты

`23_Схемы_оплаты.master_id` → `22_Мастера_справочник.master_id`

## 39.4. Материалы

- норматив → услуга;
- факт → операция.

## 39.5. Возвраты

`14_Возвраты.original_operation_id` → `10_Операции.internal_operation_id`

## 39.6. Смены

`12_Смены.master_id` → `22_Мастера_справочник.master_id`

## 39.7. Планы

`24_Планы.period_id` → `_SYS_PERIODS.period_id`

## 39.8. Рекомендации

Рекомендация ссылается на:

- период;
- услугу;
- мастера;
- сценарий;
- правило.

## 39.9. Решения

`06_Решения` связывается с:

- рекомендацией;
- сценарием;
- показателем проверки.

---

# 40. Идентификаторы

## 40.1. Внутренние ID

Создаются как UUID.

Не зависят от:

- строки;
- сортировки;
- текущего периода;
- отображаемого имени.

## 40.2. Внешний ключ

Основной ключ внешней строки:

`source_system + external_transaction_id + external_line_id`

## 40.3. Отсутствующий внешний ID

Используется внутренний UUID.

Отпечаток строки применяется только для предупреждения о дубле.

## 40.4. Изменение записи

Редактирование не меняет внутренний ID.

## 40.5. Архивирование

Исторический ID не используется повторно.

---

# 41. Граница между формулами и Apps Script

## 41.1. Формулы отвечают за

- финансовые расчёты;
- агрегаты;
- план-факт;
- маржинальную прибыль;
- операционную прибыль;
- точку безубыточности;
- показатели услуг;
- показатели мастеров;
- основные сценарные результаты.

## 41.2. Apps Script отвечает за

- импорт;
- нормализацию;
- создание ID;
- маркировку дублей;
- запуск проверок;
- управление периодами;
- резервные копии;
- защиту;
- журнал;
- сохранение сценариев;
- сохранение решений;
- пользовательское меню;
- технические ошибки;
- формирование текста рекомендаций на основании рассчитанных сигналов.

## 41.3. Запрет

Одна финансовая формула не должна независимо поддерживаться в двух местах.

## 41.4. Прослеживаемость

Каждый рассчитанный показатель должен иметь:

- код правила;
- версию;
- период;
- исходные строки;
- статус качества.

---

# 42. Порядок пересчёта

Логический порядок:

1. Проверка настроек.
2. Проверка периода.
3. Проверка справочников.
4. Проверка операций.
5. Проверка схем оплаты.
6. Проверка материалов.
7. Проверка возвратов.
8. Расчёт выручки.
9. Расчёт материалов.
10. Расчёт выплат.
11. Расчёт налогов и комиссий.
12. Расчёт маржинальной прибыли.
13. Расчёт постоянных расходов.
14. Расчёт операционной прибыли.
15. Расчёт точки безубыточности.
16. Расчёт услуг.
17. Расчёт мастеров.
18. Расчёт загрузки.
19. Расчёт план-факта.
20. Расчёт прогноза.
21. Расчёт денежного блока при включении.
22. Формирование проблем качества.
23. Формирование сигналов рекомендаций.
24. Дедупликация рекомендаций.
25. Обновление управленческих листов.
26. Запись результата в журнал.

---

# 43. Защита диапазонов

## 43.1. Полностью защищаются

- `_SYS_*`;
- системные ID;
- расчётные столбцы;
- формулы;
- статусы качества;
- отпечатки;
- даты создания и изменения;
- закрытые периоды.

## 43.2. Редактируются пользователем

- настройки;
- справочники;
- входные значения;
- сценарные допущения;
- решения;
- комментарии;
- разрешённые статусы.

## 43.3. Специалист по внедрению

Может иметь расширенный доступ к:

- справочникам;
- импорту;
- настройкам;
- диапазонам сопоставления.

## 43.4. Системные листы

Скрытие не заменяет защиту.

---

# 44. Закрытие периода

Перед закрытием:

1. Проверить критические ошибки.
2. Проверить операции.
3. Проверить выплаты.
4. Проверить материалы.
5. Проверить расходы.
6. Проверить возвраты.
7. Проверить планы.
8. Создать резервную копию или снимок.
9. Выполнить итоговый пересчёт.

После закрытия:

- входные диапазоны периода защищаются;
- статус меняется на `closed`;
- дата и автор фиксируются;
- рекомендации сохраняют связь с версией расчёта.

---

# 45. Переоткрытие периода

Для переоткрытия обязательны:

- причина;
- автор;
- дата;
- ссылка на период.

После изменения:

- выполняется пересчёт;
- прежние рекомендации могут стать устаревшими;
- событие сохраняется в `_SYS_LOG`.

---

# 46. Резервное копирование

Ручная команда обязательна перед:

- массовым импортом;
- закрытием периода;
- обновлением версии;
- изменением структуры.

Результат резервного копирования должен содержать:

- дату;
- время;
- имя копии;
- ссылку или идентификатор;
- инициатора;
- событие в журнале.

Автоматическая сложная система версий не является обязательной частью MVP.

---

# 47. Импорт

Универсальный импорт CSV/XLSX использует `_SYS_STAGING` и `_SYS_IMPORT_MAPPINGS`. `_SYS_STAGING` передаёт строки в `10_Операции` только после подтверждения; `_SYS_IMPORT_MAPPINGS` управляет mapping-процессом; `_SYS_IMPORTS` хранит batch и профиль. Apps Script отвечает за чтение файлов, staging, mapping, preview, подтверждение, профили и batch import. Финансовые формулы в импортере не размещаются.

## 47.1. Поддерживаемые способы

- ручная вставка;
- CSV;
- предварительно преобразованная выгрузка.

## 47.2. Этапы

1. Создание резервной копии.
2. Чтение файла или диапазона.
3. Проверка заголовков.
4. Нормализация типов.
5. Сопоставление услуг.
6. Сопоставление мастеров.
7. Формирование ID.
8. Поиск возможных дублей.
9. Проверка обязательных полей.
10. Предварительный отчёт.
11. Подтверждение.
12. Запись валидных строк.
13. Журналирование.

## 47.3. Ограничение

Разрешена реализация канонических листов, внутренних UUID, финансовых расчётов, проверок канонических колонок, ручного подтверждения возможных дублей и системных аналитических листов. До исследования реальной обезличенной выгрузки запрещены только произвольный mapping неизвестной выгрузки, source-specific adapter, автоматический upsert внешних операций и CRM-интеграция.

## 47.4. Неподтверждённые поля

До реальной выгрузки предварительными остаются:

- внешний line ID;
- способ представления смешанной оплаты;
- формат продолжительности;
- формат скидки;
- формат возвратов;
- формат статуса;
- источник фактической комиссии.

---

# 48. Качество данных

Минимальные проверки:

## 48.1. Операции

- отсутствующий ID;
- отсутствующая дата;
- неизвестная услуга;
- неизвестный мастер;
- отсутствующая цена;
- отрицательное количество;
- некорректный статус;
- скидка больше допустимой суммы;
- возможный дубль.

## 48.2. Выплаты

- отсутствующая схема;
- пересечение периодов;
- процент без базы;
- несовместимые поля;
- ставка за смену в неправильном поле.

## 48.3. Материалы

- отсутствует и факт, и норматив;
- двойной фактический учёт;
- неутверждённый норматив;
- некорректная стоимость.

## 48.4. Возвраты

- неизвестная операция;
- превышение исходной суммы;
- двойной возврат;
- отсутствующее правило выплаты.

## 48.5. Денежный блок

- отсутствует денежный остаток;
- отсутствует резерв;
- неполные обязательства;
- не подтверждена полнота данных.

---

# 49. Состояния отсутствующих данных

Не использовать фиктивный ноль.

Допустимые пользовательские состояния:

- `Не рассчитано`;
- `Недостаточно данных`;
- `Не применяется`;
- `Требуется проверка`;
- `Оценка`;
- `Период не завершён`.

Ноль используется только как подтверждённое значение.

---

# 50. Производительность

До исследования реальной выгрузки не устанавливается неподтверждённый жёсткий лимит строк.

До реализации необходимо определить:

- среднее количество операций в месяц;
- максимальное количество операций в месяц;
- необходимую глубину истории;
- объём материалов;
- объём смен;
- количество формул;
- время пересчёта;
- время импорта.

Нагрузочный тест должен использовать:

- реальный месячный объём;
- увеличенный контрольный объём;
- несколько периодов.

---

# 51. Локаль и форматы

## 51.1. Валюта

Определяется `currency_code`.

## 51.2. Даты

Пользовательское отображение:

`ДД.ММ.ГГГГ`

Системное значение:

дата Google Sheets без преобразования в произвольный текст.

## 51.3. Десятичный разделитель

Зависит от локали книги.

Импорт должен нормализовать входные значения.

## 51.4. Часовой пояс

Определяется настройкой салона и настройкой файла.

---

# 52. Правила визуального оформления

Документ не определяет финальный дизайн, но фиксирует обязательные принципы.

## 52.1. Редактируемые поля

Должны иметь:

- единый визуальный стиль;
- примечание;
- отсутствие защиты.

## 52.2. Расчётные поля

Должны:

- иметь другой визуальный стиль;
- быть защищены;
- содержать метку расчётного статуса при необходимости.

## 52.3. Ошибки

Цвет сопровождается текстом.

## 52.4. Управленческие листы

Не должны требовать горизонтальной прокрутки для основных блоков на стандартном экране ноутбука.

---

# 53. Карта логических сущностей

| Логическая сущность | Физическое размещение |
|---|---|
| Salon | `20_Настройки` |
| SalonSetting | `20_Настройки` |
| ReportingPeriod | `_SYS_PERIODS` |
| ServiceCategory | `21_Услуги_справочник` |
| Service | `21_Услуги_справочник` |
| Master | `22_Мастера_справочник` |
| CompensationScheme | `23_Схемы_оплаты` |
| MasterCompensationAssignment | `23_Схемы_оплаты` |
| Shift | `12_Смены` |
| ServiceTransaction | `10_Операции` |
| ServiceLine | `10_Операции` |
| Payment | частично `10_Операции`, расширение после реальной выгрузки |
| Refund | `14_Возвраты` |
| Material | `13_Материалы` |
| MaterialNorm | `13_Материалы` |
| MaterialUsage | `13_Материалы` |
| Expense | `11_Расходы` |
| MasterPayAccrual | `_SYS_MASTER_METRICS` и `_SYS_CALC` |
| MasterPayPayment | вне обязательного детального MVP |
| ChairRentalAgreement | `23_Схемы_оплаты` в простой модели |
| ChairRentalCharge | `11_Расходы` либо `_SYS_CALC` по физическому решению реализации |
| TaxConfiguration | `20_Настройки` |
| TaxExpenseRecord | `11_Расходы` или `_SYS_CALC` |
| ClientLiability | агрегировано в `15_Обязательства` |
| CashAccount | не является обязательным детальным пользовательским блоком |
| CashMovement | вне обязательного детального MVP |
| Obligation | `15_Обязательства` |
| Plan | `24_Планы` |
| ManualAdjustment | `_SYS_ADJUSTMENTS` |
| Scenario | `05_Сценарии`, `_SYS_SCENARIOS` |
| Recommendation | `_SYS_RECOMMENDATIONS`, `01_Рабочий стол` |
| OwnerDecision | `06_Решения` |
| ImportBatch | `_SYS_IMPORTS` |
| DataQualityIssue | `_SYS_DATA_QUALITY`, `02_Качество данных` |

---

# 54. Матрица редактирования

| Группа | Владелец | Специалист по внедрению | Система |
|---|---:|---:|---:|
| Управленческие показатели | просмотр | просмотр | запись |
| Рекомендации | изменение статуса | изменение статуса | генерация |
| Операции | ограниченно | да | импорт и системные поля |
| Расходы | да | да | проверка |
| Смены | да | да | расчётные поля |
| Материалы | ограниченно | да | проверка |
| Возвраты | да | да | проверка |
| Обязательства | да | да | расчётные статусы |
| Настройки | ограниченно | да | системные поля |
| Справочники | ограниченно | да | ID и валидация |
| Системные листы | нет | диагностика при необходимости | полный доступ |

---

# 55. Прослеживаемость ключевых показателей

Для каждого показателя должно быть возможно определить:

- период;
- исходные операции;
- расходы;
- материалы;
- схему оплаты;
- налоговую настройку;
- комиссию;
- корректировки;
- статус качества;
- версию правила;
- дату пересчёта.

Минимально это требуется для:

- чистой выручки;
- выплаты мастерам;
- материалов;
- маржинальной прибыли;
- операционной прибыли;
- результата услуги;
- результата мастера;
- точки безубыточности;
- доступной владельцу суммы.

---

# 56. Запрещённые физические решения

Запрещается:

- использовать номер строки как ID;
- хранить формулы внутри пользовательских значений;
- смешивать ввод и итоговые расчёты в одной колонке;
- удалять исходную операцию для отражения возврата;
- перезаписывать исходную строку ручной корректировкой;
- хранить ставку за смену в поле ставки за услугу;
- смешивать нормативные и фактические материалы без статуса;
- считать денежное поступление выручкой автоматически;
- включать полный денежный календарь в обязательный MVP;
- создавать пользовательский складской интерфейс;
- создавать CRM-листы;
- создавать бухгалтерские проводки;
- скрыто подставлять отраслевые пороги;
- использовать технический отпечаток для автоматического удаления;
- размещать финансовую формулу только в Apps Script;
- допускать редактирование системных ID;
- показывать технические ошибки пользователю;
- заменять отсутствие данных нулём.

---

# 57. Ограничения до программной реализации

## 57.1. Условия перед финансовым ядром

Выполнены: физическая спецификация, `CONTROL_DATA_SPEC`, физические контрольные JSON и ожидаемые результаты.

## 57.2. Условия перед source-specific импортом

Необходимы реальная выгрузка, внешний ID, line ID, mapping, правила повторного импорта и проверка на реальном объёме данных.

До source-specific программирования необходимо:

1. Получить обезличенную реальную выгрузку.
2. Проверить заголовки и типы.
3. Подтвердить наличие внешнего ID.
4. Подтвердить структуру строк услуг.
5. Подтвердить способ представления смешанной оплаты.
6. Подтвердить статусы операций.
7. Подтвердить формат скидок.
8. Подтвердить формат возвратов.
9. Подтвердить наличие продолжительности.
10. Подтвердить наличие комиссий.
11. Утвердить окончательный контракт колонок.
12. Утвердить правила повторного импорта конкретного источника.
13. Создать `CONTROL_DATA_SPEC`.
14. Зафиксировать ожидаемые результаты тестов.
15. Проверить формулы контрольного примера.
16. Определить пилотные значения пользовательских порогов.
17. Определить реалистичный объём данных.

---

# 58. Открытые технические вопросы

Перед реализацией требуется закрыть:

1. Какой реальный источник используется первым?
2. Содержит ли источник line ID?
3. Как представлена одна транзакция с несколькими услугами?
4. Как представлены частичные платежи?
5. Как представлены возвраты?
6. Как представлены бесплатные переделки?
7. Можно ли надёжно определить дубли?
8. Какие колонки обязательно импортируются?
9. Какие колонки вводятся вручную?
10. Нужен ли отдельный физический staging-лист?
11. Как реализуется динамический размер именованных диапазонов?
12. Какие расчёты допустимо выполнять массивными формулами?
13. Какие агрегаты следует кэшировать?
14. Какой объём выдерживает выбранная структура?
15. Как физически хранить простой арендный доход?
16. Как физически хранить фактический налог периода?
17. Как выполняется миграция версии шаблона?
18. Как восстанавливается повреждённый расчётный диапазон?
19. Как создаётся контрольный снимок закрытого периода?
20. Как владелец подтверждает полноту денежного блока?

Эти вопросы не разрешаются молчаливыми решениями в коде.

---

# 59. Критерии готовности физической спецификации

Документ считается готовым, если:

- определён полный список листов;
- определён порядок вкладок;
- определена видимость;
- определены пользовательские зоны;
- определены колонки ввода;
- определены системные таблицы;
- определены ID;
- определены связи;
- определены именованные диапазоны;
- определены границы формул;
- определены границы Apps Script;
- определена защита;
- определено закрытие периода;
- определено резервное копирование;
- план-факт включён в обязательный MVP;
- денежный блок обозначен как условный;
- импорт обозначен как предварительный;
- не добавлены функции вне MVP;
- открытые вопросы вынесены отдельно.

Версия 1.0 является основой для:

- создания спецификации контрольных данных;
- проверки реальной выгрузки;
- создания технического плана реализации;
- проектирования wireframe;
- последующего создания Google Sheets.

---

# 60. Следующий обязательный шаг

После утверждения этого документа необходимо создать:

`docs/CONTROL_DATA_SPEC.md`

Документ должен определить:

- все контрольные наборы;
- точные входные значения;
- ожидаемые финансовые результаты;
- ожидаемые статусы качества;
- ожидаемые рекомендации;
- крайние случаи;
- критерии прохождения теста.

Программная реализация до создания этой спецификации и исследования реальной выгрузки запрещена.

==================================================

## Физический контракт универсального импортера

### _SYS_STAGING

**Schema key:** SYS_STAGING  
**Header row:** 1  
**Видимость и защита:** скрытый системный лист; фильтр при bootstrap не создаётся; редактируемо только include_in_commit; формулы отсутствуют.

| № | name | Русское название | Тип | required | editable | system | nullable | enumKey | Назначение | width |
|---:|---|---|---|---|---|---|---|---|---|---:|
| 1 | `staging_row_id` | ID staging-строки | `text` | true | false | true | false | `null` | Идентификатор staging-строки | 170 |
| 2 | `import_batch_id` | ID пакета импорта | `text` | true | false | true | false | `null` | Связь с пакетом импорта | 160 |
| 3 | `source_file_name` | Имя исходного файла | `text` | true | false | true | false | `null` | Имя загруженного файла | 200 |
| 4 | `source_sheet_name` | Имя исходного листа | `text` | false | false | true | true | `null` | Лист исходного файла при наличии | 160 |
| 5 | `source_row_number` | Номер исходной строки | `integer` | true | false | true | false | `null` | Номер строки в источнике | 120 |
| 6 | `target_entity_type` | Целевая сущность | `text` | true | false | true | false | `null` | Каноническая целевая сущность | 170 |
| 7 | `mapping_profile_id` | ID профиля сопоставления | `text` | false | false | true | true | `null` | Применённый профиль mapping | 170 |
| 8 | `raw_row_json` | Исходная строка JSON | `text` | true | false | true | false | `null` | Исходные значения без интерпретации | 320 |
| 9 | `normalized_row_json` | Нормализованная строка JSON | `text` | false | false | true | true | `null` | Результат подтверждённого mapping | 320 |
| 10 | `validation_status` | Статус проверки | `enum` | true | false | true | false | `data_quality_status` | Статус качества строки | 160 |
| 11 | `validation_errors_json` | Ошибки проверки JSON | `text` | false | false | true | true | `null` | Ошибки проверки строки | 260 |
| 12 | `row_fingerprint` | Технический отпечаток строки | `text` | false | false | true | true | `null` | Ключ идемпотентности и проверки дубля | 190 |
| 13 | `duplicate_status` | Статус дубля | `enum` | true | false | true | false | `duplicate_status` | Статус возможного дубля | 160 |
| 14 | `duplicate_candidates_json` | Кандидаты в дубли JSON | `text` | false | false | true | true | `null` | Кандидаты для ручного решения | 260 |
| 15 | `include_in_commit` | Включить в commit | `boolean` | true | true | false | false | `null` | Единственное пользовательски редактируемое поле | 130 |
| 16 | `commit_status` | Статус commit | `enum` | true | false | true | false | `staging_commit_status` | Статус подтверждённой записи | 150 |
| 17 | `committed_table_key` | Ключ канонической таблицы | `text` | false | false | true | true | `null` | Целевая таблица после commit | 180 |
| 18 | `committed_record_id` | ID созданной канонической записи | `text` | false | false | true | true | `null` | Созданная или подтверждённая запись | 190 |
| 19 | `commit_error_message` | Ошибка commit | `text` | false | false | true | true | `null` | Сообщение об ошибке commit | 240 |
| 20 | `created_at` | Создано | `datetime` | true | false | true | false | `null` | Системная дата создания | 160 |
| 21 | `updated_at` | Обновлено | `datetime` | true | false | true | false | `null` | Системная дата обновления | 160 |


Одна строка соответствует одной строке источника. aw_row_json не обрезается молча: превышение размера ячейки блокирует импорт до отдельного решения о внешнем хранении. 
ormalized_row_json появляется после подтверждённого mapping. Staging не является каноническим фактом и не участвует в финансовых расчётах. Дубли не удаляются и не объединяются автоматически. Commit требует явного подтверждения и идемпотентен по staging_row_id, import_batch_id и fingerprint.

### _SYS_IMPORT_MAPPINGS

**Schema key:** SYS_IMPORT_MAPPINGS  
**Header row:** 1  
**Видимость и защита:** скрытый системный лист; специалист по внедрению может редактировать mapping-конфигурацию; системные ID, confirmed_at, confirmed_by и timestamps не редактируются; формулы отсутствуют.

| № | name | Русское название | Тип | required | editable | system | nullable | enumKey | Назначение | width |
|---:|---|---|---|---|---|---|---|---|---|---:|
| 1 | `mapping_record_id` | ID записи mapping | `text` | true | false | true | false | `null` | Системный идентификатор записи | 170 |
| 2 | `record_type` | Тип записи mapping | `enum` | true | true | false | false | `import_mapping_record_type` | Профиль, сопоставление колонки или значения | 180 |
| 3 | `mapping_profile_id` | ID профиля сопоставления | `text` | true | true | false | false | `null` | Идентификатор повторно используемого профиля | 170 |
| 4 | `mapping_profile_name` | Название профиля | `text` | true | true | false | false | `null` | Понятное название профиля | 210 |
| 5 | `source_type` | Тип источника | `enum` | true | true | false | false | `source_type` | Тип происхождения данных | 150 |
| 6 | `source_system_name` | Название исходной системы | `text` | false | true | false | true | `null` | Название источника при наличии | 190 |
| 7 | `source_file_pattern` | Шаблон имени файла | `text` | false | true | false | true | `null` | Шаблон применимости профиля | 200 |
| 8 | `source_sheet_pattern` | Шаблон имени листа | `text` | false | true | false | true | `null` | Шаблон листа источника | 190 |
| 9 | `target_entity_type` | Целевая сущность | `text` | true | true | false | false | `null` | Каноническая целевая сущность | 180 |
| 10 | `source_column_name` | Исходная колонка | `text` | false | true | false | true | `null` | Имя колонки источника | 190 |
| 11 | `source_column_index` | Индекс исходной колонки | `integer` | false | true | false | true | `null` | Позиция колонки источника | 130 |
| 12 | `target_field_name` | Целевое поле | `text` | false | true | false | true | `null` | Поле канонической сущности | 190 |
| 13 | `source_value` | Исходное значение | `text` | false | true | false | true | `null` | Значение для value mapping | 180 |
| 14 | `target_value` | Целевое значение | `text` | false | true | false | true | `null` | Нормализованное значение | 180 |
| 15 | `default_value` | Значение по умолчанию mapping | `text` | false | true | false | true | `null` | Явное значение mapping при необходимости | 190 |
| 16 | `transformation_type` | Тип преобразования | `enum` | true | true | false | false | `import_transformation_type` | Разрешённое преобразование без кода | 190 |
| 17 | `transformation_config_json` | Настройки преобразования JSON | `text` | false | true | false | true | `null` | Параметры разрешённого преобразования | 270 |
| 18 | `date_format` | Формат даты источника | `text` | false | true | false | true | `null` | Подсказка разбора даты | 150 |
| 19 | `decimal_separator` | Десятичный разделитель | `text` | false | true | false | true | `null` | Разделитель чисел источника | 150 |
| 20 | `is_required` | Обязательное сопоставление | `boolean` | true | true | false | false | `null` | Признак обязательности mapping | 140 |
| 21 | `priority` | Приоритет | `integer` | true | true | false | false | `null` | Порядок применения записи | 100 |
| 22 | `is_active` | Активно | `boolean` | true | true | false | false | `null` | Признак актуальности записи | 100 |
| 23 | `mapping_version` | Версия профиля | `integer` | true | true | false | false | `null` | Версия повторно используемого профиля | 130 |
| 24 | `confirmed_at` | Подтверждено | `datetime` | false | false | true | true | `null` | Системная дата подтверждения | 160 |
| 25 | `confirmed_by` | Кем подтверждено | `text` | false | false | true | true | `null` | Системный автор подтверждения | 180 |
| 26 | `created_at` | Создано | `datetime` | true | false | true | false | `null` | Системная дата создания | 160 |
| 27 | `updated_at` | Обновлено | `datetime` | true | false | true | false | `null` | Системная дата обновления | 160 |


ecord_type имеет значения: profile, column_mapping, alue_mapping. Для profile поля конкретной колонки и значения могут быть null. Для column_mapping обязательны профиль, целевая сущность, имя или индекс исходной колонки, целевое поле и преобразование. Для alue_mapping обязательны профиль, целевая сущность, целевое поле, исходное и целевое значения. Профиль версионируется; commit требует подтверждения. Допустимые import_transformation_type: 
one, 	rim, date_parse, 
umber_parse, oolean_map, constant, alue_map. Произвольный исполняемый код, eval и сетевые преобразования запрещены.

### Lookup keys импортера

- staging_commit_status: pending, eady, committed, skipped, ailed.
- import_mapping_record_type: profile, column_mapping, alue_mapping.
- import_transformation_type: 
one, 	rim, date_parse, 
umber_parse, oolean_map, constant, alue_map.

## Нормативный контракт системных листов

SYSTEM_SHEETS_PHYSICAL_CONTRACT.md является специализированным физическим контрактом для 11 системных листов. При реализации SchemaDefinitions свойства колонок берутся из него; имена и порядок листов сохраняются. SYS_STAGING и SYS_IMPORT_MAPPINGS определены в спецификациях версии 1.1.

## Нормативные layouts управленческих листов
MANAGEMENT_LAYOUTS_PHYSICAL_CONTRACT.md определяет layouts 00–05;  6_Решения остаётся таблицей. На bootstrap формулы отсутствуют; 31 лист, 30 активных без денежного блока и 13 системных листов сохранены.

## 37.4 Канонический каталог lookup-групп

contracts/lookup-catalog.v1.json версии 1.1 является нормативным источником: одна lookup-группа соответствует одной колонке SYS_LOOKUPS, порядок совпадает с каталогом, включая отдельный ключ import_status. Фактическое количество: 38.
- `operation_status`
- `cooperation_type`
- `scheme_type`
- `commission_base_type`
- `shift_status`
- `expense_nature`
- `payment_method`
- `data_quality_status`
- `severity`
- `recommendation_status`
- `financial_impact_type`
- `confidence_level`
- `implementation_complexity`
- `risk_level`
- `period_status`
- `decision_status`
- `obligation_type`
- `obligation_status`
- `scenario_type`
- `source_type`
- `duplicate_status`
- `expense_category`
- `material_record_type`
- `refund_method`
- `refund_reason`
- `master_pay_adjustment_mode`
- `tax_adjustment_mode`
- `fee_adjustment_mode`
- `priority`
- `reserve_method`
- `setting_value_type`
- `material_cost_mode`
- `dimension_type`
- `direction_type`
- `staging_commit_status`
- `import_mapping_record_type`
- `import_transformation_type`


## Синхронизация системных import-листов

_SYS_STAGING содержит 21 колонку и хранит строки до подтверждённого commit. _SYS_IMPORT_MAPPINGS содержит 27 колонок и хранит профили и правила mapping. Их полный физический контракт определён в SYSTEM_SHEETS_PHYSICAL_CONTRACT.md версии 1.3.
