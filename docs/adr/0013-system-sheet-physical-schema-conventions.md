# ADR 0013 — Конвенции физических схем системных листов

**Статус:** Accepted  
**Дата:** 2026-07-13

## Решение
Имена и порядок полей берутся из специализированных спецификаций. Колонки системных листов по умолчанию имеют system: true и editable: false; неизвестное или необязательное значение хранится как 
ull. Схемы описывают только физическую структуру без формул и данных. При неоднозначности применяется консервативный nullable-контракт. SYS_LOOKUPS использует модель «одна lookup-группа — одна колонка».

## Типизация и обязательность
*_at и timestamp — datetime; календарные даты — date; is_* — boolean; count/minutes/days/priority/version — integer; amount/revenue/profit/cost/cash/pay/expense/income — money; rate/margin/ratio/share/percent — ratio; прочие измеримые показатели — number; ID, коды, названия, описания, причины, ограничения, сообщения и JSON — text. Статус является enum только при утверждённом lookup key. Первичный ID, требуемый ключ периода или метрики, основной статус и timestamps required; прочие диагностические поля nullable. Ширины: boolean/integer 100, date 110, number/ratio/money 120, enum 150, ID/datetime 160, text 180, name/category 200, long text 240, JSON 300.

## Последствия
Все 11 системных контрактов завершаются без изменения полей. Будущий SchemaDefinitions использует этот нормативный источник; runtime, формулы и данные не утверждаются.
