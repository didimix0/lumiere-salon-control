# ADR 0014 — Физические конвенции управленческих layouts

**Статус:** Accepted  
**Дата:** 2026-07-13

## Решение
Управленческие листы используют сетку A:L. Каждый блок — непересекающийся прямоугольник с key, entryType, title, purpose, startRow, startColumn, rowSpan, columnSpan, isStaticPlaceholder, formulaPolicy, dataSource, visibilityCondition и notes. Ключи UPPER_SNAKE_CASE; координаты положительны и не выходят за 12 колонок. На этом этапе placeholders статичны, formulaPolicy — none, данных и формул нет.

## Типы блоков
page_header, instruction, 
avigation, selector, status_panel, kpi_group, 	able_placeholder, ecommendation_panel, warning_panel, ction_panel, comparison_panel, input_panel, esult_panel, limitations_panel, metadata_panel.

## Последствия
Шесть layout-схем могут быть реализованы в SchemaDefinitions; bootstrap получает однозначные координаты. Табличные схемы не изменяются.
