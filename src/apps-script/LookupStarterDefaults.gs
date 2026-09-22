var LCLD_MVP_LOOKUP_STARTER_DEFAULTS = {
  "contractVersion": "1.0",
  "status": "mvp_editable_lookup_starter_defaults",
  "generatedAt": "2026-07-18T14:22:50.704Z",
  "eligibleTargetCount": 26,
  "eligibleEnumKeyCount": 22,
  "alreadyDefinedEnumKeyCount": 2,
  "starterDefaultEnumKeyCount": 20,
  "starterDefaultTargetCount": 24,
  "alreadyDefinedTargetCount": 2,
  "sources": [
    {
      "document": "contracts/lookup-catalog.v1.json",
      "version": "1.1"
    },
    {
      "document": "src/apps-script/SchemaDefinitions.gs",
      "version": "current"
    },
    {
      "document": "docs/FINANCIAL_LOGIC.md",
      "version": "1.0"
    },
    {
      "document": "docs/SALON_ECONOMICS.md",
      "version": "current"
    },
    {
      "document": "docs/DATA_MODEL.md",
      "version": "current"
    },
    {
      "document": "docs/UNIVERSAL_IMPORT_SPEC.md",
      "version": "1.1"
    }
  ],
  "alreadyDefinedLookups": [
    {
      "position": 36,
      "key": "import_mapping_record_type",
      "valuesStatus": "defined",
      "valuesSource": "contracts/lookup-catalog.v1.json",
      "values": [
        "profile",
        "column_mapping",
        "value_mapping"
      ],
      "usedBy": [
        {
          "schemaKey": "SYS_IMPORT_MAPPINGS",
          "sheetName": "_SYS_IMPORT_MAPPINGS",
          "columnName": "record_type",
          "columnLabel": "Тип записи mapping"
        }
      ],
      "notes": "Нормативные значения взяты без переопределения из действующего lookup-каталога."
    },
    {
      "position": 37,
      "key": "import_transformation_type",
      "valuesStatus": "defined",
      "valuesSource": "contracts/lookup-catalog.v1.json",
      "values": [
        "none",
        "trim",
        "date_parse",
        "number_parse",
        "boolean_map",
        "constant",
        "value_map"
      ],
      "usedBy": [
        {
          "schemaKey": "SYS_IMPORT_MAPPINGS",
          "sheetName": "_SYS_IMPORT_MAPPINGS",
          "columnName": "transformation_type",
          "columnLabel": "Тип преобразования"
        }
      ],
      "notes": "Нормативные значения взяты без переопределения из действующего lookup-каталога."
    }
  ],
  "lookups": [
    {
      "position": 1,
      "key": "operation_status",
      "description": "Статус операции",
      "defaultType": "fixed_mvp_default",
      "values": [
        "Запланирована",
        "Подтверждена",
        "Выполнена",
        "Отменена",
        "Неявка",
        "Возвращена полностью",
        "Возвращена частично",
        "Бесплатная переделка",
        "Техническая корректировка"
      ],
      "usedBy": [
        {
          "schemaKey": "OPERATIONS",
          "sheetName": "10_Операции",
          "columnName": "operation_status",
          "columnLabel": "Статус операции"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "locked_for_mvp",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 2,
      "key": "cooperation_type",
      "description": "Тип сотрудничества с мастером",
      "defaultType": "fixed_mvp_default",
      "values": [
        "Штатный сотрудник",
        "Подрядчик",
        "Арендатор кресла"
      ],
      "usedBy": [
        {
          "schemaKey": "MASTERS_REFERENCE",
          "sheetName": "22_Мастера_справочник",
          "columnName": "cooperation_type",
          "columnLabel": "Тип сотрудничества"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "locked_for_mvp",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 3,
      "key": "scheme_type",
      "description": "Тип схемы оплаты труда",
      "defaultType": "fixed_mvp_default",
      "values": [
        "Процентная",
        "Фиксированная за услугу",
        "Фиксированная за смену",
        "Месячный оклад",
        "Смешанная",
        "Ручная схема"
      ],
      "usedBy": [
        {
          "schemaKey": "COMPENSATION_SCHEMES",
          "sheetName": "23_Схемы_оплаты",
          "columnName": "scheme_type",
          "columnLabel": "Тип схемы"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "locked_for_mvp",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 4,
      "key": "commission_base_type",
      "description": "База процентной выплаты",
      "defaultType": "fixed_mvp_default",
      "values": [
        "Фактическая выручка после скидок",
        "Стоимость услуг до скидок",
        "Выручка после вычета материалов",
        "Вручную установленная база"
      ],
      "usedBy": [
        {
          "schemaKey": "COMPENSATION_SCHEMES",
          "sheetName": "23_Схемы_оплаты",
          "columnName": "commission_base_type",
          "columnLabel": "База процента"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "locked_for_mvp",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 5,
      "key": "shift_status",
      "description": "Статус рабочей смены",
      "defaultType": "fixed_mvp_default",
      "values": [
        "Запланирована",
        "Отработана",
        "Не отработана",
        "Отменена"
      ],
      "usedBy": [
        {
          "schemaKey": "SHIFTS",
          "sheetName": "12_Смены",
          "columnName": "shift_status",
          "columnLabel": "Статус смены"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "locked_for_mvp",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 6,
      "key": "expense_nature",
      "description": "Экономическая природа расхода",
      "defaultType": "fixed_mvp_default",
      "values": [
        "Постоянный операционный",
        "Переменный операционный",
        "Смешанный операционный",
        "Разовый операционный"
      ],
      "usedBy": [
        {
          "schemaKey": "EXPENSES",
          "sheetName": "11_Расходы",
          "columnName": "expense_nature",
          "columnLabel": "Экономическая природа"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "locked_for_mvp",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 7,
      "key": "payment_method",
      "description": "Способ оплаты",
      "defaultType": "customizable_starter_default",
      "values": [
        "Наличные",
        "Банковская карта",
        "Банковский перевод",
        "Онлайн-оплата",
        "Другое"
      ],
      "usedBy": [
        {
          "schemaKey": "OPERATIONS",
          "sheetName": "10_Операции",
          "columnName": "payment_method",
          "columnLabel": "Способ оплаты"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "editable_by_owner_after_setup",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 16,
      "key": "decision_status",
      "description": "Статус управленческого решения",
      "defaultType": "fixed_mvp_default",
      "values": [
        "Запланировано",
        "В работе",
        "Реализовано",
        "Отложено",
        "Отменено"
      ],
      "usedBy": [
        {
          "schemaKey": "DECISIONS",
          "sheetName": "06_Решения",
          "columnName": "decision_status",
          "columnLabel": "Статус решения"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "locked_for_mvp",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 20,
      "key": "source_type",
      "description": "Тип происхождения данных",
      "defaultType": "fixed_mvp_default",
      "values": [
        "Ручной ввод",
        "Импорт файла",
        "Внешняя система"
      ],
      "usedBy": [
        {
          "schemaKey": "OPERATIONS",
          "sheetName": "10_Операции",
          "columnName": "source_type",
          "columnLabel": "Тип источника"
        },
        {
          "schemaKey": "EXPENSES",
          "sheetName": "11_Расходы",
          "columnName": "source_type",
          "columnLabel": "Тип источника"
        },
        {
          "schemaKey": "MATERIALS",
          "sheetName": "13_Материалы",
          "columnName": "source_type",
          "columnLabel": "Тип источника"
        },
        {
          "schemaKey": "REFUNDS",
          "sheetName": "14_Возвраты",
          "columnName": "source_type",
          "columnLabel": "Тип источника"
        },
        {
          "schemaKey": "SYS_IMPORT_MAPPINGS",
          "sheetName": "_SYS_IMPORT_MAPPINGS",
          "columnName": "source_type",
          "columnLabel": "Тип источника"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "locked_for_mvp",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 22,
      "key": "expense_category",
      "description": "Категория расхода",
      "defaultType": "customizable_starter_default",
      "values": [
        "Аренда",
        "Оплата труда",
        "Материалы",
        "Маркетинг",
        "Коммунальные услуги",
        "Сервисы и ПО",
        "Налоги",
        "Банковские комиссии",
        "Прочие расходы"
      ],
      "usedBy": [
        {
          "schemaKey": "EXPENSES",
          "sheetName": "11_Расходы",
          "columnName": "expense_category",
          "columnLabel": "Категория расхода"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "editable_by_owner_after_setup",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 23,
      "key": "material_record_type",
      "description": "Тип записи по материалам",
      "defaultType": "fixed_mvp_default",
      "values": [
        "Фактический расход",
        "Норматив расхода",
        "Закупка",
        "Корректировка"
      ],
      "usedBy": [
        {
          "schemaKey": "MATERIALS",
          "sheetName": "13_Материалы",
          "columnName": "record_type",
          "columnLabel": "Тип записи"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "locked_for_mvp",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 24,
      "key": "refund_method",
      "description": "Способ возврата",
      "defaultType": "customizable_starter_default",
      "values": [
        "Наличными",
        "На банковскую карту",
        "Банковским переводом",
        "Зачёт в будущую услугу",
        "Другое"
      ],
      "usedBy": [
        {
          "schemaKey": "REFUNDS",
          "sheetName": "14_Возвраты",
          "columnName": "refund_method",
          "columnLabel": "Способ возврата"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "editable_by_owner_after_setup",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 25,
      "key": "refund_reason",
      "description": "Причина возврата",
      "defaultType": "customizable_starter_default",
      "values": [
        "Ошибка оказания услуги",
        "Отмена услуги",
        "Ошибка оплаты",
        "Добровольный возврат",
        "Техническая корректировка",
        "Другое"
      ],
      "usedBy": [
        {
          "schemaKey": "REFUNDS",
          "sheetName": "14_Возвраты",
          "columnName": "refund_reason",
          "columnLabel": "Причина возврата"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "editable_by_owner_after_setup",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 26,
      "key": "master_pay_adjustment_mode",
      "description": "Режим корректировки выплаты мастера",
      "defaultType": "fixed_mvp_default",
      "values": [
        "Не корректировать",
        "Корректировать отдельной операцией"
      ],
      "usedBy": [
        {
          "schemaKey": "REFUNDS",
          "sheetName": "14_Возвраты",
          "columnName": "master_pay_adjustment_mode",
          "columnLabel": "Корректировка выплаты мастера"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "locked_for_mvp",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 27,
      "key": "tax_adjustment_mode",
      "description": "Режим корректировки налога",
      "defaultType": "fixed_mvp_default",
      "values": [
        "Не корректировать",
        "Корректировать по утверждённой настройке",
        "Корректировать отдельной операцией"
      ],
      "usedBy": [
        {
          "schemaKey": "REFUNDS",
          "sheetName": "14_Возвраты",
          "columnName": "tax_adjustment_mode",
          "columnLabel": "Корректировка налога"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "locked_for_mvp",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 28,
      "key": "fee_adjustment_mode",
      "description": "Режим корректировки комиссии",
      "defaultType": "fixed_mvp_default",
      "values": [
        "Не корректировать",
        "Корректировать по утверждённой настройке",
        "Корректировать отдельной операцией"
      ],
      "usedBy": [
        {
          "schemaKey": "REFUNDS",
          "sheetName": "14_Возвраты",
          "columnName": "fee_adjustment_mode",
          "columnLabel": "Корректировка комиссии"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "locked_for_mvp",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 31,
      "key": "setting_value_type",
      "description": "Тип значения настройки",
      "defaultType": "fixed_mvp_default",
      "values": [
        "Текст",
        "Число",
        "Процент",
        "Сумма",
        "Дата",
        "Логическое значение"
      ],
      "usedBy": [
        {
          "schemaKey": "SETTINGS",
          "sheetName": "20_Настройки",
          "columnName": "value_type",
          "columnLabel": "Тип значения"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "locked_for_mvp",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 32,
      "key": "material_cost_mode",
      "description": "Режим учёта материалов",
      "defaultType": "fixed_mvp_default",
      "values": [
        "Фактический детальный расход",
        "Фактический общий расход",
        "Нормативный расход"
      ],
      "usedBy": [
        {
          "schemaKey": "SERVICES_REFERENCE",
          "sheetName": "21_Услуги_справочник",
          "columnName": "material_cost_mode",
          "columnLabel": "Режим учёта материалов"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "locked_for_mvp",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 33,
      "key": "dimension_type",
      "description": "Тип измерения плана",
      "defaultType": "fixed_mvp_default",
      "values": [
        "Салон",
        "Категория услуг",
        "Услуга",
        "Мастер",
        "Категория расхода",
        "Рабочее место"
      ],
      "usedBy": [
        {
          "schemaKey": "PLANS",
          "sheetName": "24_Планы",
          "columnName": "dimension_type",
          "columnLabel": "Тип измерения"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "locked_for_mvp",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    },
    {
      "position": 34,
      "key": "direction_type",
      "description": "Направление оценки",
      "defaultType": "fixed_mvp_default",
      "values": [
        "Больше — лучше",
        "Меньше — лучше",
        "Целевой диапазон"
      ],
      "usedBy": [
        {
          "schemaKey": "PLANS",
          "sheetName": "24_Планы",
          "columnName": "direction_type",
          "columnLabel": "Направление оценки"
        }
      ],
      "rationale": "Стартовый набор поддерживает работу MVP и сохраняет предметное разделение.",
      "customizationPolicy": "locked_for_mvp",
      "limitations": "Не заменяет отдельные финансовые настройки или связанные справочники.",
      "sourceReferences": [
        "contracts/lookup-catalog.v1.json",
        "docs/FINANCIAL_LOGIC.md",
        "docs/DATA_MODEL.md"
      ]
    }
  ]
}
;
function LCLD_getMvpLookupStarterDefaults_(){return LCLD_clone_(LCLD_MVP_LOOKUP_STARTER_DEFAULTS);}
function LCLD_clone_(v){if(v===null||typeof v!=='object')return v;if(Array.isArray(v))return v.map(LCLD_clone_);var r={};Object.keys(v).forEach(function(k){r[k]=LCLD_clone_(v[k]);});return r;}
