==================================================

# Lumiere Control — Data Model

**Версия:** 1.0  
**Статус:** рабочая спецификация данных  
**Продукт:** Lumiere Control  
**Назначение:** определить логические сущности, поля, связи, статусы качества, правила валидации и минимальный набор данных  
**Приоритет финансовых определений:** `FINANCIAL_LOGIC.md`  
**Связанные документы:** `PRODUCT_BIBLE.md`, `DECISION_MAP.md`, `SALON_ECONOMICS.md`, `FINANCIAL_LOGIC.md`

---

# 1. Назначение документа

Data Model определяет:

- какие данные должен хранить Lumiere Control;
- какие сущности необходимы;
- какие поля являются обязательными;
- какие значения вводятся пользователем;
- какие значения импортируются;
- какие показатели рассчитываются;
- как сущности связаны между собой;
- как отслеживается источник данных;
- как контролируется качество данных;
- как сохраняются ручные корректировки;
- как обеспечивается прослеживаемость расчётов;
- какие данные необходимы для MVP;
- какие данные можно добавить позднее.

Документ описывает логическую модель.

Он не определяет окончательное количество листов Google Sheets и не требует, чтобы каждая сущность имела отдельный видимый лист.

Физическая структура Google Sheets должна быть определена в `UX_SPECIFICATION.md` и технической спецификации реализации.

---

# 2. Главные принципы модели данных

## 2.1. Исходные данные отделяются от расчётных

Исходные данные:

- вводятся пользователем;
- импортируются;
- поступают из внешней системы;
- фиксируют фактическое событие или настройку.

Расчётные показатели:

- получаются по правилам `FINANCIAL_LOGIC.md`;
- не должны вручную редактироваться как обычные исходные данные;
- при необходимости могут кэшироваться, но должны быть воспроизводимыми.

## 2.2. Экономический факт отделяется от денежного движения

Выполненная услуга и получение денег являются разными событиями.

Расход периода и фактическая выплата денег также могут происходить в разные даты.

## 2.3. Факт отделяется от норматива

Фактический расход материалов и нормативный расход должны храниться раздельно.

## 2.4. Начисление отделяется от оплаты

Примеры:

- начисленная выплата мастеру;
- фактически выплаченная сумма;
- начисленная аренда;
- фактически полученная аренда;
- признанный расход;
- денежная выплата.

## 2.5. Ручная корректировка не удаляет исходные данные

Корректировка должна:

- храниться отдельной записью;
- иметь причину;
- иметь автора;
- иметь дату;
- иметь ссылку на исходный объект.

## 2.6. Данные имеют источник

Для каждой значимой записи должен быть известен источник:

- ручной ввод;
- импорт файла;
- внешняя система;
- API;
- расчёт;
- ручная корректировка.

## 2.7. Удаление должно быть контролируемым

Финансовые операции не должны бесследно удаляться.

Для них используются:

- статус;
- архивирование;
- сторнирование;
- корректирующая запись.

## 2.8. Минимизация персональных данных

Для финансового MVP не требуется хранить:

- полные имена клиентов;
- телефоны;
- адреса;
- электронную почту;
- платёжные реквизиты;
- медицинские данные.

При необходимости анализа повторных визитов допускается обезличенный внешний идентификатор клиента.

---

# 3. Типы полей

## 3.1. Идентификатор

Тип:

`string`

Требования:

- уникален внутри сущности;
- не должен зависеть от номера строки;
- не должен изменяться при сортировке;
- предпочтительно использовать UUID или устойчивый составной идентификатор.

## 3.2. Денежное значение

Тип:

`decimal`

Требования:

- внутренний расчёт без преждевременного округления;
- значение хранится в валюте салона;
- отрицательные суммы разрешены только для утверждённых типов корректировок.

## 3.3. Процентная ставка

Тип:

`decimal`

Хранение:

- `0.30` означает 30%;
- диапазон обычно от `0` до `1`;
- значения вне диапазона должны требовать проверки.

## 3.4. Количество

Тип:

`decimal` или `integer`

Выбор зависит от единицы измерения.

## 3.5. Продолжительность

Тип:

`integer`

Единица:

`минуты`

## 3.6. Дата

Тип:

`date`

Рекомендуемый формат:

`YYYY-MM-DD`

## 3.7. Дата и время

Тип:

`datetime`

Должен учитывать часовой пояс проекта.

## 3.8. Логическое значение

Тип:

`boolean`

Допустимые значения:

- `true`;
- `false`.

## 3.9. Перечисление

Тип:

`enum`

Список допустимых значений должен быть определён в документе или справочнике.

## 3.10. Текст

Тип:

`string` или `text`

Для комментариев, причин и описаний.

---

# 4. Общие служебные поля

Значимые сущности должны при необходимости содержать:

- `id` — внутренний уникальный идентификатор;
- `external_id` — идентификатор во внешней системе;
- `source_type` — источник записи;
- `source_system` — название внешней системы;
- `import_batch_id` — идентификатор загрузки;
- `created_at` — дата и время создания;
- `updated_at` — дата и время последнего изменения;
- `created_by` — автор;
- `updated_by` — автор изменения;
- `is_active` — активность записи;
- `archived_at` — дата архивации;
- `data_quality_status` — статус качества;
- `comment` — комментарий.

Не все поля обязаны физически дублироваться во всех таблицах Google Sheets.

Техническая реализация должна сохранить их экономический смысл и возможность аудита.

---

# 5. Статусы источника данных

Поле `source_type` может иметь значения:

- `manual`;
- `file_import`;
- `external_system`;
- `api`;
- `calculated`;
- `manual_adjustment`;
- `system_generated`.

Расчётная запись должна иметь ссылку на исходные данные или период расчёта.

---

# 6. Статусы качества данных

Поле `data_quality_status` может иметь значения:

- `actual`;
- `calculated`;
- `estimated`;
- `incomplete`;
- `requires_review`;
- `invalid`;
- `not_applicable`.

## 6.1. Actual

Запись основана на фактическом событии.

## 6.2. Calculated

Значение рассчитано по утверждённой формуле.

## 6.3. Estimated

Использован норматив, распределение, прогноз или допущение.

## 6.4. Incomplete

Отсутствует часть необходимых данных.

## 6.5. Requires review

Обнаружено необычное или противоречивое значение.

## 6.6. Invalid

Запись не должна участвовать в расчётах до исправления.

## 6.7. Not applicable

Поле или показатель неприменим к выбранной модели.

---

# 7. Логические группы данных

Модель разделяется на группы:

1. Настройки салона.
2. Справочники.
3. Операции услуг.
4. Денежные поступления и оплаты.
5. Материалы.
6. Команда и схемы оплаты.
7. Расходы.
8. Аренда рабочих мест.
9. Налоги и комиссии.
10. Рабочее время и мощность.
11. Авансы, депозиты и сертификаты.
12. Денежные средства и обязательства.
13. Плановые показатели.
14. Ручные корректировки.
15. Сценарии.
16. Рекомендации и решения.
17. Импорт и качество данных.

---

# 8. Сущность Salon

## 8.1. Назначение

Хранит основные настройки анализируемой точки.

## 8.2. Поля

- `salon_id` — обязательный уникальный идентификатор;
- `salon_name` — обязательное название;
- `currency_code` — обязательная валюта;
- `timezone` — обязательный часовой пояс;
- `country_code` — страна;
- `reporting_start_date` — начало управленческого учёта;
- `default_language` — язык;
- `is_active` — активность.

## 8.3. Ограничение MVP

Первая версия анализирует одну точку.

Поле `salon_id` сохраняется для будущего переноса в многоточечную архитектуру.

---

# 9. Сущность SalonSetting

## 9.1. Назначение

Хранит настраиваемые параметры.

## 9.2. Поля

- `setting_id`;
- `salon_id`;
- `setting_key`;
- `setting_value`;
- `value_type`;
- `effective_from`;
- `effective_to`;
- `source_type`;
- `comment`;
- `is_active`.

## 9.3. Возможные настройки

- валюта;
- формат дат;
- доля распределения прибыли;
- метод резерва;
- размер резерва;
- пороги загрузки;
- пороги качества данных;
- минимальное количество наблюдений;
- правила округления;
- основной период анализа.

## 9.4. Правило

Изменение настройки не должно незаметно изменять закрытые периоды без отдельного пересчёта и журналирования.

---

# 10. Сущность ReportingPeriod

## 10.1. Назначение

Определяет управленческий период.

## 10.2. Поля

- `period_id`;
- `salon_id`;
- `period_type`;
- `date_from`;
- `date_to`;
- `status`;
- `closed_at`;
- `closed_by`;
- `comment`.

## 10.3. Значения status

- `open`;
- `review`;
- `closed`;
- `reopened`.

## 10.4. Правило закрытого периода

Изменение данных закрытого периода должно:

- требовать явного подтверждения;
- фиксироваться в журнале;
- переводить период в статус `reopened` либо создавать корректировку.

---

# 11. Сущность ServiceCategory

## 11.1. Назначение

Группирует услуги по направлениям.

## 11.2. Поля

- `service_category_id`;
- `salon_id`;
- `category_name`;
- `category_code`;
- `sort_order`;
- `is_active`;
- `effective_from`;
- `effective_to`.

## 11.3. Примеры

- парикмахерские услуги;
- ногтевой сервис;
- косметология;
- массаж;
- барберинг.

---

# 12. Сущность Service

## 12.1. Назначение

Справочник услуг и вариантов услуг.

## 12.2. Поля

- `service_id`;
- `salon_id`;
- `service_category_id`;
- `service_name`;
- `service_code`;
- `service_variant`;
- `default_list_price`;
- `default_duration_minutes`;
- `default_material_cost`;
- `material_cost_mode`;
- `is_package`;
- `is_active`;
- `effective_from`;
- `effective_to`;
- `comment`.

## 12.3. Значения material_cost_mode

- `actual_detailed`;
- `actual_total`;
- `standard`;
- `not_tracked`.

## 12.4. Правила

- изменение прайса не должно изменять исторические операции;
- историческая цена хранится в строке операции;
- изменение нормативной продолжительности не должно менять закрытые периоды;
- услуга не удаляется, а архивируется.

---

# 13. Сущность Master

## 13.1. Назначение

Справочник мастеров, арендаторов и владельцев, работающих специалистами.

## 13.2. Поля

- `master_id`;
- `salon_id`;
- `display_name`;
- `master_code`;
- `cooperation_type`;
- `start_date`;
- `end_date`;
- `adaptation_end_date`;
- `is_owner`;
- `is_active`;
- `comment`.

## 13.3. Значения cooperation_type

- `employee`;
- `contractor`;
- `chair_renter`;
- `owner_master`;
- `other`.

## 13.4. Персональные данные

Для финансовой модели достаточно отображаемого имени или внутреннего кода.

Документ не требует хранения паспортных, налоговых и платёжных данных.

---

# 14. Сущность CompensationScheme

## 14.1. Назначение

Определяет правило начисления выплаты мастеру.

## 14.2. Поля

- `compensation_scheme_id`;
- `salon_id`;
- `scheme_name`;
- `scheme_type`;
- `commission_rate`;
- `commission_base_type`;
- `fixed_rate_per_service`;
- `shift_rate`;
- `monthly_salary`;
- `proration_rule`;
- `default_bonus_rule`;
- `effective_from`;
- `effective_to`;
- `is_active`;
- `comment`.

## 14.3. Значения scheme_type

- `percentage`;
- `fixed_per_service`;
- `fixed_per_shift`;
- `monthly_salary`;
- `mixed`;
- `manual`;
- `chair_rent`.

## 14.4. Значения commission_base_type

- `charged_amount`;
- `list_value`;
- `charged_amount_minus_materials`;
- `manual_base`;
- `other_configured_base`;
- `not_applicable`.

## 14.5. Правило

Ставка за смену и ставка за услугу являются разными полями и не должны взаимозаменяться.

---

# 15. Сущность MasterCompensationAssignment

## 15.1. Назначение

Связывает мастера и схему оплаты с учётом периода действия.

## 15.2. Поля

- `assignment_id`;
- `master_id`;
- `compensation_scheme_id`;
- `effective_from`;
- `effective_to`;
- `priority`;
- `service_category_id`;
- `service_id`;
- `override_commission_rate`;
- `override_shift_rate`;
- `override_monthly_salary`;
- `is_active`;
- `comment`.

## 15.3. Правило приоритета

Более конкретная настройка имеет приоритет:

1. схема мастера для конкретной услуги;
2. схема мастера для категории;
3. общая схема мастера;
4. настройка по умолчанию.

## 15.4. Пересечение периодов

Для одного уровня приоритета не должно существовать двух активных пересекающихся назначений.

---

# 16. Сущность Workstation

## 16.1. Назначение

Хранит рабочие места, кабинеты и оборудование, ограничивающие мощность.

## 16.2. Поля

- `workstation_id`;
- `salon_id`;
- `workstation_name`;
- `workstation_type`;
- `capacity_units`;
- `is_active`;
- `effective_from`;
- `effective_to`;
- `comment`.

## 16.3. Примеры workstation_type

- `chair`;
- `cabinet`;
- `wash_station`;
- `manicure_table`;
- `equipment`;
- `other`.

---

# 17. Сущность Shift

## 17.1. Назначение

Хранит рабочую смену мастера.

## 17.2. Поля

- `shift_id`;
- `salon_id`;
- `master_id`;
- `shift_date`;
- `scheduled_start`;
- `scheduled_end`;
- `scheduled_minutes`;
- `excluded_minutes`;
- `available_minutes`;
- `is_payable`;
- `shift_rate_override`;
- `workstation_id`;
- `status`;
- `source_type`;
- `comment`.

## 17.3. Значения status

- `planned`;
- `worked`;
- `cancelled`;
- `sick_leave`;
- `vacation`;
- `training`;
- `other_closed`.

## 17.4. Правило

В расчёт фиксированной оплаты за смену входят только смены с:

- применимым статусом;
- `is_payable = true`.

## 17.5. Доступное время

`available_minutes` не должно включать утверждённые перерывы и закрытые интервалы.

---

# 18. Сущность ServiceTransaction

## 18.1. Назначение

Хранит заголовок визита, чека или другой группы связанных строк услуг.

## 18.2. Поля

- `transaction_id`;
- `salon_id`;
- `external_id`;
- `transaction_date`;
- `service_start_datetime`;
- `service_end_datetime`;
- `transaction_status`;
- `anonymous_client_id`;
- `currency_code`;
- `source_type`;
- `source_system`;
- `import_batch_id`;
- `comment`;
- `created_at`;
- `updated_at`.

## 18.3. Значения transaction_status

- `planned`;
- `confirmed`;
- `completed`;
- `cancelled`;
- `no_show`;
- `partially_refunded`;
- `fully_refunded`;
- `technical_adjustment`.

## 18.4. Правило

Фактическую выручку создают строки выполненных услуг, а не сам заголовок транзакции.

---

# 19. Сущность ServiceLine

## 19.1. Назначение

Хранит конкретную выполненную или запланированную услугу.

## 19.2. Исходные поля

- `service_line_id`;
- `transaction_id`;
- `external_line_id`;
- `service_id`;
- `master_id`;
- `workstation_id`;
- `service_date`;
- `line_status`;
- `quantity`;
- `list_price`;
- `charged_amount`;
- `positive_price_adjustment`;
- `discount_type`;
- `discount_reason`;
- `discount_initiator_type`;
- `discount_initiator_id`;
- `actual_duration_minutes`;
- `manual_commission_base`;
- `material_cost_override`;
- `source_type`;
- `comment`.

## 19.3. Расчётные поля

Расчётные поля не должны редактироваться как обычный ввод:

- `list_value`;
- `discount_amount`;
- `refund_amount`;
- `net_service_revenue`;
- `material_cost_used`;
- `variable_master_pay`;
- `fixed_per_service_pay`;
- `service_tax_expense`;
- `service_acquiring_expense`;
- `other_variable_expense`;
- `contribution_profit`;
- `contribution_margin`;
- `occupied_minutes_used`;
- `contribution_per_hour`;
- `data_quality_status`.

## 19.4. Значения line_status

- `planned`;
- `completed`;
- `cancelled`;
- `no_show`;
- `free_rework`;
- `technical_adjustment`.

## 19.5. Правила

- обычная выполненная строка имеет положительное количество;
- историческая цена хранится в строке;
- скидка не вводится одновременно двумя несовместимыми способами;
- возвраты не должны физически изменять исходную строку;
- бесплатная переделка имеет нулевую выручку и возможные расходы;
- при отсутствии фактической продолжительности может использоваться нормативная с оценочным статусом.

---

# 20. Сущность ServiceLineWorkerAllocation

## 20.1. Назначение

Поддерживает услуги, в которых участвовало несколько специалистов.

## 20.2. Поля

- `allocation_id`;
- `service_line_id`;
- `master_id`;
- `role`;
- `revenue_share_rate`;
- `commission_base_share_rate`;
- `minutes`;
- `material_cost_share_rate`;
- `comment`.

## 20.3. Ограничение MVP

Если услуги нескольких мастеров не входят в MVP, используется один основной мастер в `ServiceLine`.

Сущность сохраняется в логической модели для будущего расширения.

## 20.4. Проверка

Суммы долей по одной строке не должны превышать 100%, если иное не определено специальным правилом.

---

# 21. Сущность Payment

## 21.1. Назначение

Хранит фактический платёж или часть смешанной оплаты.

## 21.2. Поля

- `payment_id`;
- `salon_id`;
- `transaction_id`;
- `payment_date`;
- `payment_method`;
- `amount`;
- `currency_code`;
- `actual_fee`;
- `calculated_fee`;
- `fee_rate`;
- `fixed_fee`;
- `uses_advance`;
- `client_liability_id`;
- `cash_account_id`;
- `source_type`;
- `comment`.

## 21.3. Значения payment_method

- `cash`;
- `bank_card`;
- `bank_transfer`;
- `qr_payment`;
- `advance_offset`;
- `certificate`;
- `bonus`;
- `mixed_component`;
- `other`.

## 21.4. Правило

Одна транзакция может иметь несколько платежей.

Эквайринг рассчитывается только для применимой части оплаты.

## 21.5. Проверка суммы

Сумма платежей не обязана всегда равняться выручке периода из-за:

- авансов;
- задолженности;
- сертификатов;
- частичной оплаты;
- возвратов.

Расхождение должно быть объяснимо.

---

# 22. Сущность Refund

## 22.1. Назначение

Хранит возврат клиенту или уменьшение ранее признанной выручки.

## 22.2. Поля

- `refund_id`;
- `salon_id`;
- `original_transaction_id`;
- `original_service_line_id`;
- `original_payment_id`;
- `refund_date`;
- `refund_amount`;
- `refund_method`;
- `refund_reason`;
- `master_pay_adjustment_rule`;
- `tax_adjustment_rule`;
- `fee_adjustment_rule`;
- `cash_account_id`;
- `source_type`;
- `comment`.

## 22.3. Правила

- сумма хранится как положительное абсолютное значение;
- возврат не удаляет исходную услугу;
- корректировка выплаты мастера не выполняется без правила;
- связь с исходной услугой обязательна, если она технически доступна;
- возврат прошлого периода сохраняет дату текущего денежного события.

---

# 23. Сущность CancellationOrNoShow

## 23.1. Назначение

Хранит отмену или неявку как отдельное операционное событие.

## 23.2. Поля

- `event_id`;
- `transaction_id`;
- `service_line_id`;
- `event_type`;
- `event_date`;
- `booked_amount`;
- `booked_duration_minutes`;
- `retained_deposit_amount`;
- `was_time_refilled`;
- `refilled_minutes`;
- `cancellation_reason`;
- `initiator_type`;
- `comment`.

## 23.3. Значения event_type

- `client_cancellation`;
- `salon_cancellation`;
- `no_show`;
- `master_unavailable`;
- `technical_cancellation`.

## 23.4. Правило

Денежная оценка недополученного результата является расчётной возможностью и не хранится как фактический расход.

---

# 24. Сущность Material

## 24.1. Назначение

Справочник материалов и расходников.

## 24.2. Поля

- `material_id`;
- `salon_id`;
- `material_name`;
- `material_code`;
- `unit_of_measure`;
- `current_standard_unit_cost`;
- `is_direct_material`;
- `is_active`;
- `effective_from`;
- `effective_to`;
- `comment`.

## 24.3. Примеры единиц

- грамм;
- миллилитр;
- штука;
- пара;
- упаковка;
- условная единица.

---

# 25. Сущность MaterialNorm

## 25.1. Назначение

Определяет норматив расхода материала на услугу.

## 25.2. Поля

- `material_norm_id`;
- `service_id`;
- `material_id`;
- `standard_quantity`;
- `standard_unit_cost`;
- `standard_total_cost`;
- `effective_from`;
- `effective_to`;
- `approved_by`;
- `approval_date`;
- `is_active`;
- `comment`.

## 25.3. Правила

- норматив имеет период действия;
- изменение норматива не изменяет закрытые периоды;
- норматив должен быть утверждён;
- норматив не считается фактическим расходом.

---

# 26. Сущность MaterialUsage

## 26.1. Назначение

Хранит фактический расход материалов.

## 26.2. Поля

- `material_usage_id`;
- `service_line_id`;
- `material_id`;
- `usage_date`;
- `actual_quantity`;
- `actual_unit_cost`;
- `actual_total_cost`;
- `source_type`;
- `is_adjustment`;
- `adjustment_reason`;
- `comment`.

## 26.3. Правила

- обычный расход не может быть отрицательным;
- отрицательное значение допускается только как корректировка;
- одна и та же операция не должна быть списана дважды;
- при отсутствии детализации допускается общий фактический расход в строке услуги.

---

# 27. Сущность MaterialPurchase

## 27.1. Назначение

Хранит закупки материалов и движение денежных средств поставщику.

## 27.2. Поля

- `purchase_id`;
- `salon_id`;
- `material_id`;
- `purchase_date`;
- `quantity`;
- `unit_cost`;
- `total_amount`;
- `supplier_reference`;
- `payment_date`;
- `cash_account_id`;
- `source_type`;
- `comment`.

## 27.3. Ограничение

Закупка не равна расходу материалов периода.

Полный складской учёт может не входить в MVP.

---

# 28. Сущность ExpenseCategory

## 28.1. Назначение

Справочник категорий расходов.

## 28.2. Поля

- `expense_category_id`;
- `salon_id`;
- `category_name`;
- `expense_nature`;
- `default_direction`;
- `is_operating`;
- `is_fixed`;
- `is_allocatable`;
- `is_active`;
- `comment`.

## 28.3. Значения expense_nature

- `fixed_operating`;
- `variable_operating`;
- `one_off_operating`;
- `investment`;
- `financial_interest`;
- `loan_principal`;
- `owner_distribution`;
- `tax`;
- `other`.

---

# 29. Сущность Expense

## 29.1. Назначение

Хранит признанный расход.

## 29.2. Поля

- `expense_id`;
- `salon_id`;
- `expense_category_id`;
- `recognition_date`;
- `recognition_period_id`;
- `amount`;
- `payment_date`;
- `cash_account_id`;
- `master_id`;
- `service_id`;
- `workstation_id`;
- `is_recurring`;
- `is_one_off`;
- `is_paid`;
- `source_type`;
- `external_id`;
- `comment`.

## 29.3. Правила

- дата признания и дата оплаты могут различаться;
- инвестиция не должна автоматически классифицироваться как обычный операционный расход;
- погашение основной суммы кредита не является операционным расходом;
- процент по кредиту хранится отдельно;
- расход может быть связан с мастером или услугой только при наличии прямого основания.

---

# 30. Сущность MasterPayAccrual

## 30.1. Назначение

Хранит начисленную выплату мастеру за период.

## 30.2. Поля

- `master_pay_accrual_id`;
- `salon_id`;
- `period_id`;
- `master_id`;
- `compensation_scheme_id`;
- `commission_base`;
- `variable_pay`;
- `fixed_per_service_pay`;
- `shift_pay`;
- `salary_pay`;
- `bonus_pay`;
- `manual_adjustment`;
- `calculated_total_pay`;
- `manual_final_pay`;
- `final_accrued_pay`;
- `data_quality_status`;
- `calculated_at`;
- `approved_at`;
- `approved_by`;
- `comment`.

## 30.3. Правила

- рассчитанная и ручная итоговая сумма не должны одновременно участвовать в результате;
- при ручной итоговой выплате рассчитанная сумма сохраняется для сравнения;
- ручная корректировка имеет причину;
- фиксированная смена не зависит от количества услуг.

---

# 31. Сущность MasterPayPayment

## 31.1. Назначение

Хранит фактическую денежную выплату мастеру.

## 31.2. Поля

- `master_pay_payment_id`;
- `master_pay_accrual_id`;
- `master_id`;
- `payment_date`;
- `amount`;
- `cash_account_id`;
- `payment_method`;
- `comment`.

## 31.3. Правило

Начисление и фактическая выплата хранятся отдельно.

Одна начисленная сумма может быть выплачена несколькими платежами.

---

# 32. Сущность ChairRentalAgreement

## 32.1. Назначение

Хранит условия аренды рабочего места.

## 32.2. Поля

- `chair_rental_agreement_id`;
- `salon_id`;
- `master_id`;
- `workstation_id`;
- `agreement_type`;
- `fixed_monthly_rent`;
- `daily_rent`;
- `revenue_share_rate`;
- `salon_provides_materials`;
- `salon_collects_client_payments`;
- `salon_provides_booking`;
- `effective_from`;
- `effective_to`;
- `is_active`;
- `comment`.

## 32.3. Значения agreement_type

- `simple_fixed_rent`;
- `daily_rent`;
- `revenue_share`;
- `mixed`;
- `manual`.

## 32.4. Правило

Простая аренда и смешанная модель не должны рассчитываться одинаково.

---

# 33. Сущность ChairRentalCharge

## 33.1. Назначение

Хранит начисление арендной платы.

## 33.2. Поля

- `chair_rental_charge_id`;
- `chair_rental_agreement_id`;
- `period_id`;
- `charge_date`;
- `charged_amount`;
- `direct_expense_amount`;
- `tax_and_fee_amount`;
- `payment_status`;
- `paid_amount`;
- `payment_date`;
- `cash_account_id`;
- `comment`.

## 33.3. Значения payment_status

- `not_due`;
- `due`;
- `partially_paid`;
- `paid`;
- `overdue`;
- `cancelled`.

---

# 34. Сущность TaxConfiguration

## 34.1. Назначение

Определяет управленческий способ учёта налога.

## 34.2. Поля

- `tax_configuration_id`;
- `salon_id`;
- `tax_mode`;
- `tax_rate`;
- `include_service_revenue`;
- `include_product_revenue`;
- `include_chair_rental_income`;
- `include_deposit_income`;
- `include_other_operating_income`;
- `effective_from`;
- `effective_to`;
- `is_active`;
- `comment`.

## 34.3. Значения tax_mode

- `manual_actual`;
- `percentage_of_configured_base`;
- `excluded`.

## 34.4. Ограничение

Конфигурация является управленческой настройкой и не подтверждает юридическую правильность налогового режима.

---

# 35. Сущность TaxExpenseRecord

## 35.1. Назначение

Хранит фактический или ручной налоговый расход периода.

## 35.2. Поля

- `tax_expense_record_id`;
- `salon_id`;
- `period_id`;
- `tax_configuration_id`;
- `tax_base`;
- `calculated_tax`;
- `manual_actual_tax`;
- `final_tax_expense`;
- `payment_date`;
- `cash_account_id`;
- `data_quality_status`;
- `comment`.

---

# 36. Сущность PaymentFeeConfiguration

## 36.1. Назначение

Определяет комиссии для способов оплаты.

## 36.2. Поля

- `fee_configuration_id`;
- `salon_id`;
- `payment_method`;
- `rate`;
- `fixed_fee`;
- `effective_from`;
- `effective_to`;
- `is_active`;
- `comment`.

## 36.3. Правило

Изменение ставки не должно менять исторические платежи, если фактическая комиссия уже зафиксирована.

---

# 37. Сущность ClientLiability

## 37.1. Назначение

Хранит обязательства салона перед клиентами.

## 37.2. Поля

- `client_liability_id`;
- `salon_id`;
- `anonymous_client_id`;
- `liability_type`;
- `issue_date`;
- `initial_amount`;
- `remaining_amount`;
- `expiry_date`;
- `status`;
- `source_transaction_id`;
- `comment`.

## 37.3. Значения liability_type

- `advance`;
- `booking_deposit`;
- `gift_certificate`;
- `service_package`;
- `other`.

## 37.4. Значения status

- `active`;
- `partially_redeemed`;
- `redeemed`;
- `refunded`;
- `expired_pending_policy`;
- `cancelled`.

## 37.5. Правило

Наличие денежного поступления не превращает обязательство в выручку до наступления утверждённого события признания.

---

# 38. Сущность ClientLiabilityMovement

## 38.1. Назначение

Хранит изменения обязательства.

## 38.2. Поля

- `liability_movement_id`;
- `client_liability_id`;
- `movement_date`;
- `movement_type`;
- `amount`;
- `service_line_id`;
- `payment_id`;
- `comment`.

## 38.3. Значения movement_type

- `created`;
- `increased`;
- `redeemed`;
- `refunded`;
- `retained`;
- `expired`;
- `manual_adjustment`.

---

# 39. Сущность CashAccount

## 39.1. Назначение

Хранит денежные счета и кассы.

## 39.2. Поля

- `cash_account_id`;
- `salon_id`;
- `account_name`;
- `account_type`;
- `currency_code`;
- `is_restricted`;
- `is_active`;
- `comment`.

## 39.3. Значения account_type

- `cash_register`;
- `bank_account`;
- `card_account`;
- `owner_account_used_for_business`;
- `other`.

---

# 40. Сущность CashMovement

## 40.1. Назначение

Хранит фактическое движение денег.

## 40.2. Поля

- `cash_movement_id`;
- `salon_id`;
- `cash_account_id`;
- `movement_date`;
- `direction`;
- `movement_type`;
- `amount`;
- `related_entity_type`;
- `related_entity_id`;
- `source_type`;
- `comment`.

## 40.3. Значения direction

- `inflow`;
- `outflow`.

## 40.4. Возможные movement_type

- `client_payment`;
- `advance_received`;
- `certificate_sale`;
- `refund_to_client`;
- `expense_payment`;
- `master_payment`;
- `tax_payment`;
- `loan_received`;
- `loan_principal_payment`;
- `interest_payment`;
- `owner_contribution`;
- `owner_distribution`;
- `investment_payment`;
- `chair_rent_received`;
- `other`.

## 40.5. Правило

Денежное движение не должно автоматически создавать выручку или расход без связанного экономического события.

---

# 41. Сущность Obligation

## 41.1. Назначение

Хранит предстоящие обязательные платежи.

## 41.2. Поля

- `obligation_id`;
- `salon_id`;
- `obligation_type`;
- `due_date`;
- `amount`;
- `paid_amount`;
- `status`;
- `priority`;
- `cash_account_id`;
- `related_entity_type`;
- `related_entity_id`;
- `is_included_in_distribution_limit`;
- `comment`.

## 41.3. Значения obligation_type

- `rent`;
- `master_pay`;
- `tax`;
- `supplier`;
- `loan_principal`;
- `interest`;
- `leasing`;
- `utilities`;
- `planned_purchase`;
- `other`.

## 41.4. Значения status

- `planned`;
- `due`;
- `partially_paid`;
- `paid`;
- `overdue`;
- `cancelled`.

## 41.5. Правило

Одна сумма не должна одновременно учитываться как отдельное обязательство и как уже оплаченный расход в денежном лимите.

---

# 42. Сущность Plan

## 42.1. Назначение

Хранит плановые показатели.

## 42.2. Поля

- `plan_id`;
- `salon_id`;
- `period_id`;
- `metric_code`;
- `dimension_type`;
- `dimension_id`;
- `plan_value`;
- `value_unit`;
- `direction_type`;
- `approved_at`;
- `approved_by`;
- `comment`.

## 42.3. Значения dimension_type

- `salon`;
- `service_category`;
- `service`;
- `master`;
- `expense_category`;
- `workstation`.

## 42.4. Значения direction_type

- `higher_is_better`;
- `lower_is_better`;
- `target_range`;
- `context_required`.

## 42.5. Примеры metric_code

- `net_service_revenue`;
- `operating_profit`;
- `material_cost`;
- `master_pay`;
- `fixed_expense`;
- `procedure_quantity`;
- `utilization`;
- `contribution_margin`.

---

# 43. Сущность ManualAdjustment

## 43.1. Назначение

Хранит контролируемую корректировку исходных или расчётных данных.

## 43.2. Поля

- `manual_adjustment_id`;
- `salon_id`;
- `adjustment_date`;
- `period_id`;
- `target_entity_type`;
- `target_entity_id`;
- `adjustment_type`;
- `amount`;
- `previous_value`;
- `new_value`;
- `reason`;
- `created_by`;
- `approved_by`;
- `comment`.

## 43.3. Значения adjustment_type

- `revenue`;
- `expense`;
- `master_pay`;
- `material`;
- `tax`;
- `cash`;
- `obligation`;
- `classification`;
- `other`.

## 43.4. Правило

Корректировка не удаляет и не перезаписывает исходную запись без истории изменений.

---

# 44. Сущность Scenario

## 44.1. Назначение

Хранит сценарий до принятия решения.

## 44.2. Поля

- `scenario_id`;
- `salon_id`;
- `scenario_name`;
- `scenario_type`;
- `base_period_id`;
- `status`;
- `created_at`;
- `created_by`;
- `confidence_level`;
- `comment`.

## 44.3. Значения scenario_type

- `price_change`;
- `volume_change`;
- `utilization_change`;
- `compensation_change`;
- `material_reduction`;
- `additional_shift`;
- `new_master`;
- `chair_rent`;
- `equipment`;
- `custom`.

## 44.4. Значения status

- `draft`;
- `calculated`;
- `approved`;
- `rejected`;
- `implemented`;
- `archived`.

---

# 45. Сущность ScenarioParameter

## 45.1. Назначение

Хранит изменяемые и неизменные параметры сценария.

## 45.2. Поля

- `scenario_parameter_id`;
- `scenario_id`;
- `parameter_code`;
- `dimension_type`;
- `dimension_id`;
- `base_value`;
- `scenario_value`;
- `value_unit`;
- `is_user_assumption`;
- `comment`.

## 45.3. Примеры parameter_code

- `price`;
- `quantity`;
- `volume_change_rate`;
- `commission_rate`;
- `shift_rate`;
- `material_cost_per_procedure`;
- `achievable_fill_rate_increase`;
- `tax_rate`;
- `cashless_share`;
- `fixed_expense_change`.

## 45.4. Правило

Система не должна самостоятельно создавать изменение спроса без пользовательского или утверждённого допущения.

---

# 46. Сущность ScenarioResult

## 46.1. Назначение

Хранит рассчитанный результат сценария.

## 46.2. Поля

- `scenario_result_id`;
- `scenario_id`;
- `metric_code`;
- `base_value`;
- `scenario_value`;
- `difference`;
- `value_unit`;
- `data_quality_status`;
- `calculated_at`;
- `comment`.

## 46.3. Примеры metric_code

- `revenue`;
- `variable_master_pay`;
- `material_cost`;
- `tax`;
- `acquiring`;
- `contribution_profit`;
- `operating_profit`;
- `cash_effect`;
- `break_even_point`;
- `payback_period`.

---

# 47. Сущность Recommendation

## 47.1. Назначение

Хранит рекомендацию, сформированную Recommendation Engine.

## 47.2. Поля

- `recommendation_id`;
- `salon_id`;
- `period_id`;
- `recommendation_type`;
- `priority`;
- `title`;
- `owner_question`;
- `signal_description`;
- `reason_summary`;
- `financial_impact_type`;
- `financial_impact_amount`;
- `confidence_level`;
- `implementation_complexity`;
- `risk_level`;
- `recommended_action`;
- `limitations`;
- `data_quality_status`;
- `related_entity_type`;
- `related_entity_id`;
- `scenario_id`;
- `status`;
- `generated_at`;
- `expires_at`;
- `comment`.

## 47.3. Значения priority

- `critical`;
- `important`;
- `strategic`;
- `informational`.

## 47.4. Значения financial_impact_type

- `confirmed_event`;
- `variance`;
- `risk`;
- `estimated_opportunity`;
- `not_calculated`.

## 47.5. Значения status

- `new`;
- `viewed`;
- `accepted`;
- `rejected`;
- `postponed`;
- `implemented`;
- `expired`.

---

# 48. Сущность OwnerDecision

## 48.1. Назначение

Хранит решение владельца по рекомендации или самостоятельной инициативе.

## 48.2. Поля

- `decision_id`;
- `salon_id`;
- `recommendation_id`;
- `scenario_id`;
- `decision_title`;
- `decision_date`;
- `decision_status`;
- `responsible_person`;
- `planned_implementation_date`;
- `actual_implementation_date`;
- `expected_effect_amount`;
- `expected_effect_metric`;
- `evaluation_date`;
- `comment`.

## 48.3. Значения decision_status

- `planned`;
- `in_progress`;
- `implemented`;
- `cancelled`;
- `postponed`;
- `completed_review`.

---

# 49. Сущность DecisionOutcome

## 49.1. Назначение

Хранит проверку результата внедрённого решения.

## 49.2. Поля

- `decision_outcome_id`;
- `decision_id`;
- `evaluation_date`;
- `baseline_period_id`;
- `evaluation_period_id`;
- `metric_code`;
- `baseline_value`;
- `expected_value`;
- `actual_value`;
- `observed_change`;
- `attribution_confidence`;
- `outcome_status`;
- `comment`.

## 49.3. Значения outcome_status

- `positive`;
- `neutral`;
- `negative`;
- `insufficient_data`;
- `cannot_attribute`.

## 49.4. Правило

Всё изменение показателя не должно автоматически приписываться одному решению.

---

# 50. Сущность ImportBatch

## 50.1. Назначение

Хранит сведения о загрузке данных.

## 50.2. Поля

- `import_batch_id`;
- `salon_id`;
- `source_system`;
- `file_name`;
- `import_started_at`;
- `import_completed_at`;
- `status`;
- `total_rows`;
- `accepted_rows`;
- `rejected_rows`;
- `duplicate_rows`;
- `imported_by`;
- `comment`.

## 50.3. Значения status

- `pending`;
- `processing`;
- `completed`;
- `completed_with_errors`;
- `failed`;
- `rolled_back`.

## 50.4. Правило

Каноническая внутренняя модель операций достаточна для финансового ядра. Она поддерживает ручной ввод, вставку подготовленного диапазона, CSV и предварительно преобразованную выгрузку; source-specific автоматический импорт не входит в первый MVP. Внешние поля условны: `external_transaction_id` и `external_line_id` могут быть `null` для ручного ввода, который получает внутренний UUID. Отсутствие внешнего ID не блокирует финансовый расчёт, но блокирует автоматическое source-specific обновление и дедупликацию по внешнему ключу.

Предварительные поля контракта: `source_system`, `external_transaction_id` при наличии, дата и время операции, статус, услуга, мастер, количество, прайсовая и фактическая суммы, а также доступные способ оплаты, безналичная сумма, фактическая продолжительность, материалы, причина скидки и комментарий. Окончательный состав колонок подтверждается на обезличенном реальном файле.

Повторный импорт одного файла не должен бесконтрольно создавать дубли.

---

# 51. Сущность DataQualityIssue

## 51.1. Назначение

Хранит ошибку, предупреждение или ограничение данных.

## 51.2. Поля

- `data_quality_issue_id`;
- `salon_id`;
- `period_id`;
- `entity_type`;
- `entity_id`;
- `issue_code`;
- `severity`;
- `issue_description`;
- `detected_at`;
- `status`;
- `resolved_at`;
- `resolved_by`;
- `resolution_comment`.

## 51.3. Значения severity

- `critical`;
- `error`;
- `warning`;
- `information`.

## 51.4. Значения status

- `open`;
- `acknowledged`;
- `resolved`;
- `ignored_with_reason`.

## 51.5. Примеры issue_code

- `missing_compensation_scheme`;
- `duplicate_service_line`;
- `missing_material_data`;
- `invalid_discount`;
- `unknown_master`;
- `unknown_service`;
- `zero_duration`;
- `payment_mismatch`;
- `overlapping_scheme_assignments`;
- `missing_obligations`;
- `closed_period_modified`.

---

# 52. Связи между основными сущностями

## 52.1. Salon

Один салон имеет много:

- услуг;
- мастеров;
- операций;
- расходов;
- счетов;
- обязательств;
- планов;
- рекомендаций.

## 52.2. ServiceCategory и Service

Одна категория содержит много услуг.

Одна услуга относится к одной основной категории.

## 52.3. Master и CompensationScheme

Один мастер может последовательно использовать несколько схем оплаты во времени.

Одна схема может использоваться несколькими мастерами.

Связь реализуется через `MasterCompensationAssignment`.

## 52.4. ServiceTransaction и ServiceLine

Одна транзакция содержит одну или несколько строк услуг.

## 52.5. ServiceLine и Master

Одна строка MVP имеет одного основного мастера.

Расширенная модель поддерживает нескольких мастеров через `ServiceLineWorkerAllocation`.

## 52.6. ServiceLine и MaterialUsage

Одна строка услуги может иметь несколько строк фактического расхода материалов.

## 52.7. Service и MaterialNorm

Одна услуга может иметь несколько нормативов материалов.

## 52.8. Transaction и Payment

Одна транзакция может иметь несколько частей оплаты.

## 52.9. ServiceLine и Refund

Одна строка может иметь несколько частичных возвратов.

Сумма возвратов не должна превышать признанную сумму без отдельного типа корректировки.

## 52.10. Master и Shift

Один мастер имеет много смен.

## 52.11. Period и MasterPayAccrual

На одного мастера может существовать одно итоговое начисление за период и отдельные версии пересчёта только при журналировании.

## 52.12. CashAccount и CashMovement

Один денежный счёт содержит много движений.

## 52.13. Recommendation и OwnerDecision

Одна рекомендация может:

- не привести к решению;
- привести к одному решению;
- быть отклонена;
- быть отложена.

## 52.14. OwnerDecision и DecisionOutcome

Одно решение может проверяться несколько раз в разных периодах.

---

# 53. Расчётные представления

Расчётные представления не являются первичными источниками данных.

## 53.1. ServicePerformanceView

Должно содержать:

- услугу;
- период;
- количество;
- выручку;
- материалы;
- выплаты;
- налоги и комиссии;
- маржинальную прибыль;
- маржинальность;
- время;
- прибыль за час;
- качество данных.

## 53.2. MasterPerformanceView

Должно содержать:

- мастера;
- период;
- выручку;
- материалы;
- переменную выплату;
- фиксированную выплату;
- прямой результат;
- занятые часы;
- доступные часы;
- загрузку;
- результат за час;
- качество данных.

## 53.3. SalonProfitView

Должно содержать:

- операционные доходы;
- переменные расходы;
- маржинальную прибыль;
- фиксированные выплаты;
- постоянные расходы;
- операционную прибыль;
- рентабельность;
- точку безубыточности;
- качество данных.

## 53.4. OwnerCashView

Должно содержать:

- денежный остаток;
- ограниченные средства;
- клиентские обязательства;
- ближайшие обязательные платежи;
- резерв;
- лимит по деньгам;
- лимит по прибыли;
- расчётно доступную сумму;
- ограничения.

## 53.5. DataQualitySummaryView

Должно содержать:

- количество критических ошибок;
- количество предупреждений;
- долю заполненных обязательных данных;
- долю фактических материалов;
- долю настроенных схем оплаты;
- статус ключевых показателей.

---

# 54. Минимальный набор данных MVP

Для базового расчёта финансового результата обязательны:

## 54.1. Настройки

- салон;
- валюта;
- анализируемый период;
- налоговый режим управленческого расчёта;
- правила комиссий;
- резерв и доля распределения, если рассчитывается доступная владельцу сумма.

## 54.2. Услуги

- идентификатор;
- название;
- категория;
- прайсовая цена;
- нормативная продолжительность;
- норматив материалов либо отметка об отсутствии учёта.

## 54.3. Мастера

- идентификатор;
- отображаемое имя;
- тип сотрудничества;
- схема оплаты;
- период действия схемы.

## 54.4. Операции

- дата;
- услуга;
- мастер;
- количество;
- прайсовая цена;
- фактическая начисленная сумма;
- статус выполнения;
- продолжительность либо норматив.

## 54.5. Материалы

Минимум один вариант:

- фактическая стоимость;
- нормативная стоимость;
- явная отметка, что данные отсутствуют.

## 54.6. Расходы

- постоянные операционные расходы;
- разовые операционные расходы;
- категория;
- дата признания;
- сумма.

## 54.7. Выплаты мастерам

- схема;
- процентная база;
- ставка;
- оплачиваемые смены;
- оклад;
- ручные корректировки.

## 54.8. Возвраты

- сумма;
- дата;
- связь с услугой, если доступна.

## 54.9. Оплаты

Для эквайринга:

- способ оплаты;
- сумма;
- фактическая или расчётная комиссия.

## 54.10. План-факт

План выручки и план операционной прибыли входят в обязательный набор данных MVP.

Для каждого обязательного плана необходимы:

- `Plan` для выручки или операционной прибыли;
- период;
- плановое значение;
- направление оценки;
- дата утверждения.

## 54.11. Условный агрегированный денежный блок MVP

Денежный блок используется только при включении соответствующего модуля.

Минимальные агрегированные данные:

- текущий денежный остаток;
- ограниченные средства;
- клиентские авансы;
- ближайшие обязательные платежи;
- резерв;
- доля распределения прибыли;
- уже выполненные распределения.

Допускается физически хранить эти данные в настройках, на листе обязательств или в агрегированных сущностях.

Для первой версии не требуется обязательное ведение всех отдельных денежных движений, нескольких денежных счетов, полного денежного календаря или банковской сверки.

При отсутствии обязательных агрегированных данных доступная владельцу сумма не рассчитывается.

---

# 55. Дополнительный набор данных расширенного MVP

Для расширенного анализа:

- фактическое расписание;
- рабочие места;
- фактическая продолжительность;
- детальный расход материалов;
- причины скидок;
- инициаторы скидок;
- отмены и неявки;
- депозиты;
- будущие записи;
- обезличенный клиентский идентификатор;
- данные о неудовлетворённом спросе.

К расширенному MVP относятся:

- детальный журнал денежных движений;
- несколько денежных счетов;
- автоматический импорт банковских данных;
- полноценный денежный календарь;
- сложные клиентские обязательства;
- детальная история погашения обязательств.

План выручки, план операционной прибыли и условный агрегированный денежный блок целиком не относятся к расширенному MVP.

---

# 56. Правила обязательности полей

## 56.1. Условная обязательность

Поле может быть обязательным только при выбранной модели.

Примеры:

- `commission_rate` обязателен для процентной схемы;
- `shift_rate` обязателен для оплаты за смену;
- `monthly_salary` обязателен для оклада;
- `workstation_id` обязателен только для анализа рабочих мест;
- `actual_fee` необязателен при наличии расчётной ставки.

## 56.2. Неприменимое поле

Не должно заполняться случайным нулём.

Используется статус:

`not_applicable`.

## 56.3. Отсутствующее обязательное поле

Запись получает:

- `incomplete`;
- либо `invalid`, если участие в расчёте недопустимо.

---

# 57. Основные проверки валидации

## 57.1. Операции

Проверять:

- уникальность ID;
- корректную дату;
- существующую услугу;
- существующего мастера;
- положительное количество;
- допустимый статус;
- неотрицательную прайсовую цену;
- неотрицательную начисленную сумму;
- корректность скидки;
- продолжительность;
- отсутствие дубля.

## 57.2. Выплаты

Проверять:

- наличие схемы;
- период действия;
- базу процента;
- ставку;
- отсутствие двойного начисления;
- оплачиваемые смены;
- причину ручной корректировки.

## 57.3. Материалы

Проверять:

- существующий материал;
- единицу измерения;
- стоимость;
- корректность количества;
- отсутствие двойного списания;
- период действия норматива.

## 57.4. Платежи

Проверять:

- существующую транзакцию;
- положительную сумму;
- способ оплаты;
- валюту;
- применимость комиссии.

## 57.5. Возвраты

Проверять:

- положительную абсолютную сумму;
- дату;
- исходную операцию;
- превышение исходной выручки;
- правило выплаты мастеру.

## 57.6. Расходы

Проверять:

- категорию;
- сумму;
- дату признания;
- экономическую природу;
- отсутствие смешения инвестиции и операционного расхода.

## 57.7. Денежные данные

Проверять:

- направление движения;
- сумму;
- счёт;
- связь с экономическим событием;
- отсутствие двойного отражения.

---

# 58. Правила импорта

## 58.0. Универсальные сущности импорта

`ImportMappingProfile` хранит параметры чтения и версию профиля; `ImportFieldMapping` — внешнюю колонку, целевое поле, преобразование, обязательность и значение по умолчанию; `ImportValueMapping` — соответствия статусов, услуг, мастеров и иных перечислений; `ImportStagingRow` — batch, исходную строку, нормализованную запись, ошибки, предупреждения и решение пользователя. Staging не является финансовым фактом.

## 58.1. Импорт не должен сразу изменять закрытый период

Данные сначала проходят проверку.

## 58.2. Дубликаты

Для внешней операции устойчивый ключ: `source_system + external_transaction_id`. Для нескольких строк услуг добавляется `external_line_id` или иной подтверждённый ключ строки конкретной выгрузки.

Операция ручного ввода получает внутренний UUID, независимый от номера строки и сортировки.

Если внешний ID отсутствует, технический отпечаток из нормализованных источника, даты и времени, услуги, мастера, количества, фактической суммы и дополнительного признака используется только для поиска возможных дублей и ручного подтверждения. Он не объединяет, не удаляет и не обновляет финансовые операции автоматически.

## 58.3. Неизвестные значения

Если услуга или мастер отсутствуют в справочнике:

- строка не должна автоматически создавать новый активный объект без подтверждения;
- создаётся ошибка качества данных.

## 58.4. Формат дат и чисел

Импорт должен учитывать:

- локаль;
- разделитель;
- валюту;
- формат процентов;
- формат дат.

## 58.5. Повторный импорт

Должен:

- обновлять существующие записи по устойчивому ключу;
- либо отклонять дубликаты;
- запрещать автоматическое обновление ранее импортированной операции без устойчивого внешнего ID и подтверждённого правила конкретного источника;
- не создавать бесконтрольные копии.

## 58.6. Откат импорта

Желательно сохранять возможность отключить или сторнировать записи одного `ImportBatch`.

---

# 59. История изменений

Для значимых объектов необходимо сохранять:

- исходное значение;
- новое значение;
- дату изменения;
- автора;
- причину;
- период;
- связанный объект.

Особенно важно для:

- схем оплаты;
- ставок;
- прайса;
- нормативов;
- налогов;
- ручных выплат;
- закрытых периодов;
- обязательств;
- рекомендаций.

---

# 60. Архивирование

Справочники архивируются через:

- `is_active = false`;
- `effective_to`;
- `archived_at`.

Исторические операции продолжают ссылаться на архивные объекты.

Физическое удаление финансовых записей без журнала не допускается.

---

# 61. Защита от двойного учёта

Необходимо контролировать:

- услугу и её повторный импорт;
- возврат и отрицательную услугу;
- начисление выплаты и ручную итоговую выплату;
- расход и денежную выплату;
- аванс и выручку;
- сертификат и оплату услуги;
- фактический материал и общий ручной расход;
- налог в строках услуг и общий налог периода;
- обязательство и уже оплаченный платёж;
- аренду и выручку арендатора.

---

# 62. Прослеживаемость показателей

Для каждого ключевого показателя должна существовать возможность определить:

- исходные строки;
- настройки;
- период;
- применённую схему оплаты;
- использованный норматив;
- ручные корректировки;
- статус качества;
- дату расчёта.

Расчётная карточка должна иметь путь к детализации.

---

# 63. Рекомендуемое логическое соответствие системным листам

Окончательная структура определяется позднее.

Предварительное соответствие:

- `_SYS_SETTINGS` — Salon и SalonSetting;
- `_SYS_PERIODS` — ReportingPeriod;
- `_SYS_SERVICES` — ServiceCategory и Service;
- `_SYS_MASTERS` — Master;
- `_SYS_COMPENSATION` — CompensationScheme и назначения;
- `_SYS_WORKSTATIONS` — Workstation;
- `_SYS_SHIFTS` — Shift;
- `_SYS_TRANSACTIONS` — ServiceTransaction;
- `_SYS_SERVICE_LINES` — ServiceLine;
- `_SYS_PAYMENTS` — Payment;
- `_SYS_REFUNDS` — Refund;
- `_SYS_CANCELLATIONS` — CancellationOrNoShow;
- `_SYS_MATERIALS` — Material;
- `_SYS_MATERIAL_NORMS` — MaterialNorm;
- `_SYS_MATERIAL_USAGE` — MaterialUsage;
- `_SYS_EXPENSES` — Expense;
- `_SYS_MASTER_PAY` — начисления и выплаты;
- `_SYS_CHAIR_RENT` — аренда рабочих мест;
- `_SYS_TAXES` — налоговые настройки и фактические суммы;
- `_SYS_CLIENT_LIABILITIES` — авансы и сертификаты;
- `_SYS_CASH` — счета и движения;
- `_SYS_OBLIGATIONS` — обязательства;
- `_SYS_PLANS` — планы;
- `_SYS_ADJUSTMENTS` — ручные корректировки;
- `_SYS_SCENARIOS` — сценарии;
- `_SYS_RECOMMENDATIONS` — рекомендации;
- `_SYS_DECISIONS` — решения и результаты;
- `_SYS_IMPORTS` — загрузки;
- `_SYS_DATA_QUALITY` — ошибки и предупреждения.

Это логическая схема.

MVP может объединить несколько сущностей в одном скрытом листе, если:

- не нарушаются связи;
- не смешиваются исходные и расчётные данные;
- сохраняется прослеживаемость;
- структура остаётся переносимой.

---

# 64. Пример движения данных

## 64.1. Выполненная услуга

1. Создаётся или импортируется `ServiceTransaction`.
2. Создаётся `ServiceLine`.
3. Проверяются услуга, мастер, цена и статус.
4. Подбирается действующая схема оплаты.
5. Подбирается фактический или нормативный материал.
6. Добавляются платежи.
7. Рассчитываются комиссия и налог.
8. Рассчитывается маржинальная прибыль.
9. Данные входят в результат услуги, мастера и салона.

## 64.2. Возврат

1. Создаётся `Refund`.
2. Сохраняется связь с исходной строкой.
3. Уменьшается чистая выручка периода возврата.
4. Создаётся денежный отток.
5. Выплата мастеру корректируется только по утверждённому правилу.
6. Пересчитываются показатели.

## 64.3. Аванс

1. Создаётся `Payment`.
2. Создаётся `ClientLiability`.
3. Денежный остаток увеличивается.
4. Выручка не увеличивается.
5. После выполнения услуги обязательство погашается.
6. Признаётся выручка без повторного денежного поступления.

## 64.4. Фиксированная смена

1. Создаётся `Shift`.
2. Смена получает статус и признак оплаты.
3. Выплата рассчитывается один раз на смену.
4. Количество услуг не изменяет ставку за смену.

---

# 65. Персональные данные и безопасность

## 65.1. Клиенты

Для MVP рекомендуется хранить только:

- обезличенный внешний ID;
- признак нового или повторного клиента, если доступен;
- необходимые агрегированные признаки.

## 65.2. Мастера

Не хранить без необходимости:

- паспортные данные;
- банковские реквизиты;
- налоговые идентификаторы;
- домашние адреса.

## 65.3. Платежи

Не хранить:

- номера банковских карт;
- CVV;
- полные платёжные реквизиты клиентов.

## 65.4. Демонстрационные данные

Должны быть полностью вымышленными.

## 65.5. Секреты интеграций

Не должны храниться в таблицах данных или репозитории.

---

# 66. Сущности, которые могут быть исключены из MVP

После формирования `MVP_SCOPE.md` из первой реализации могут быть исключены:

- товарный учёт;
- MaterialPurchase;
- несколько мастеров в одной услуге;
- подробные сертификаты;
- сложные пакеты;
- несколько денежных счетов;
- полная история сценариев;
- инвестиционные проекты;
- расширенный контроль решений;
- смешанная аренда;
- автоматическая интеграция;
- многоточечность.

Исключение из MVP не означает удаление экономического понятия из общей модели.

---

# 67. Открытые вопросы

До реализации необходимо определить:

1. Какие сущности физически объединяются в Google Sheets?
2. Нужен ли отдельный заголовок транзакции или достаточно строк услуг?
3. Входит ли товарный блок в MVP?
4. Входит ли детальное списание материалов?
5. Входит ли складская закупка?
6. Поддерживаются ли несколько мастеров в одной услуге?
7. Нужны ли пакеты и сертификаты в MVP?
8. Поддерживаются ли несколько денежных счетов?
9. Входит ли денежный календарь?
10. Хранится ли обезличенный клиентский ID?
11. Как импортируются данные из систем записи?
12. Как определяется устойчивый ключ операции?
13. Как обрабатываются исправления внешней системы?
14. Какой период может быть закрыт?
15. Кто имеет право изменять закрытый период?
16. Нужна ли история изменения прайса отдельной сущностью?
17. Как хранить общий фактический расход материалов без детализации?
18. Как учитывать бонусы?
19. Как учитывать услуги владельца-мастера?
20. Как учитывать смешанную аренду?
21. Какой минимальный набор данных не создаст чрезмерный ручной ввод?
22. Какие расчётные представления необходимо кэшировать?
23. Как часто выполняется пересчёт?
24. Какие листы видимы пользователю, а какие скрыты?
25. Какой объём данных допустим для Google Sheets MVP?

Открытые вопросы не должны закрываться молчаливыми техническими решениями.

---

# 68. Критерий готовности Data Model

Документ считается готовым для формирования `RECOMMENDATION_ENGINE.md` и `MVP_SCOPE.md`, когда:

- определены справочники;
- определены операции услуг;
- определены платежи;
- определены возвраты;
- определены материалы;
- определены схемы оплаты;
- определены смены;
- определены расходы;
- определена аренда;
- определены налоги и комиссии;
- определены авансы;
- определены денежные движения;
- определены обязательства;
- определены планы;
- определены корректировки;
- определены сценарии;
- определены рекомендации и решения;
- определены связи;
- определены обязательные поля;
- определены правила качества;
- определены правила импорта;
- определён минимальный набор MVP;
- исключено бесследное удаление;
- предусмотрена прослеживаемость;
- персональные данные минимизированы;
- отсутствуют прямые противоречия с `FINANCIAL_LOGIC.md`.

Версия 1.0 является рабочей основой.

Документ должен пересматриваться после:

- утверждения `MVP_SCOPE.md`;
- проектирования Google Sheets;
- проверки реального формата импорта;
- загрузки демонстрационных данных;
- пилотного внедрения.

==================================================
