# Pricing Entity

Сущность для работы с планами подписки и ценообразованием в соответствии с FSD архитектурой.

## Структура

```
pricing/
├── api/           # API слой для работы с планами
│   ├── pricingApi.ts
│   └── index.ts
├── model/         # Модели данных, типы, утилиты
│   ├── types.ts
│   ├── data.ts
│   └── index.ts
├── ui/            # UI компоненты
│   ├── PricingCard.tsx
│   ├── BillingToggle.tsx
│   ├── PricingHeader.tsx
│   └── index.ts
├── index.ts       # Основной экспорт
└── README.md
```

## API Layer

### `pricingApi`
```typescript
import { pricingApi } from "@/entities/pricing";

// Получить все планы
const plans = await pricingApi.getPlans();

// Получить конкретный план
const plan = await pricingApi.getPlan("pro");

// Подписаться на план
await pricingApi.subscribeToPlan("pro", "yearly");
```

## Model Layer

### Types
- `PricingPlan` - основной тип плана подписки
- `PricingPlanFeature` - функция плана
- `BillingPeriod` - период биллинга ('monthly' | 'yearly')
- `PricingData` - конфигурация ценообразования

### Data & Utils
```typescript
import { 
  PRICING_PLANS, 
  getPlanById, 
  calculatePrice 
} from "@/entities/pricing";

// Статические данные планов
const plans = PRICING_PLANS;

// Получить план по ID
const proPlan = getPlanById("pro");

// Рассчитать цену
const price = calculatePrice(proPlan, isYearly);
```

## UI Layer

### Components

#### `PricingCard`
Карточка плана подписки с features и CTA кнопкой.

```tsx
<PricingCard
  plan={plan}
  isYearly={true}
  onSelectPlan={(planId) => console.log(planId)}
/>
```

#### `BillingToggle`
Переключатель между месячной и годовой оплатой.

```tsx
<BillingToggle
  isYearly={isYearly}
  onToggle={() => setIsYearly(!isYearly)}
  discountPercentage={20}
/>
```

#### `PricingHeader`
Заголовок секции ценообразования.

```tsx
<PricingHeader
  title="Simple, transparent"
  highlightText="pricing"
  subtitle="Choose the perfect plan for your team"
/>
```

## Usage Example

```tsx
import React, { useState } from "react";
import {
  PRICING_PLANS,
  PricingCard,
  BillingToggle,
  PricingHeader,
} from "@/entities/pricing";

export const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div>
      <PricingHeader 
        title="Our Plans"
        subtitle="Choose what works for you"
      />
      
      <BillingToggle
        isYearly={isYearly}
        onToggle={() => setIsYearly(!isYearly)}
      />

      {PRICING_PLANS.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          isYearly={isYearly}
          onSelectPlan={(planId) => console.log(planId)}
        />
      ))}
    </div>
  );
};
```

## FSD Compliance

✅ **Правильные зависимости**: Entity может импортировать только из `shared`  
✅ **Структура API/Model/UI**: Каждый слой имеет свою ответственность  
✅ **Типизация**: Все типы экспортируются отдельно  
✅ **Переиспользуемость**: UI компоненты принимают данные через props  
✅ **Separation of Concerns**: Бизнес-логика в model, отображение в UI  

## Integration

Этот entity используется в:
- `pages/landing/ui/PricingSection.tsx` - основная секция ценообразования
- Может быть переиспользован в других частях приложения

## Future Enhancements

- [ ] Интеграция с реальным API для загрузки планов
- [ ] React Query hooks для кеширования
- [ ] Дополнительные UI компоненты (сравнение планов, калькулятор стоимости)
- [ ] Валидация данных с помощью Zod
- [ ] Тесты для всех слоев 