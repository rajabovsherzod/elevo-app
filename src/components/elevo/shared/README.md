# Elevo Shared Components

Reusable komponentlar barcha sahifalarda ishlatish uchun.

## PageHeader

Professional sahifa sarlavhasi komponenti. Icon (ixtiyoriy) o'ng tomonda 12° qiyshaytirilgan holda.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | **required** | Sahifa sarlavhasi |
| `subtitle` | `ReactNode` | `undefined` | Ixtiyoriy tavsif matni |
| `icon` | `LucideIcon` | `undefined` | Ixtiyoriy dekorativ icon |
| `iconColor` | `string` | `"currentColor"` | Icon rangi |
| `iconSize` | `number` | `64` | Icon o'lchami (px) |
| `iconRotation` | `number` | `12` | Icon burilish burchagi (deg) |
| `iconOpacity` | `number` | `0.4` | Icon shaffoflik darajasi |

### Misollar

#### Oddiy sarlavha (icon siz)

```tsx
import { PageHeader } from "@/components/elevo/shared"

<PageHeader title="Profil" />
```

#### Icon bilan

```tsx
import { PageHeader } from "@/components/elevo/shared"
import { BookOpen } from "lucide-react"

<PageHeader
  title="Skills Practice"
  subtitle="IELTS ko'nikmalarini rivojlantiring"
  icon={BookOpen}
/>
```

#### Custom icon parametrlari

```tsx
import { PageHeader } from "@/components/elevo/shared"
import { TrendingUp } from "lucide-react"

<PageHeader
  title="Statistika"
  subtitle="O'sish dinamikangizni kuzating"
  icon={TrendingUp}
  iconColor="#10b981"
  iconSize={72}
  iconRotation={15}
  iconOpacity={0.5}
/>
```

#### Subtitle ReactNode sifatida

```tsx
<PageHeader
  title="Grammar"
  subtitle={
    <>
      <span className="text-primary font-bold">15</span> ta yangi mashq
    </>
  }
  icon={FileText}
/>
```

## Design System

Komponent Elevo design system qoidalariga amal qiladi:

- ✅ `elevo-card` — solid background, shadow
- ✅ `text-on-surface` — primary text color
- ✅ `text-on-surface-variant` — secondary text color
- ✅ `text-primary` — brand color
- ✅ Responsive spacing
- ✅ Dark mode support

## Accessibility

- ✅ Semantic HTML (`<header>`, `<h1>`)
- ✅ Icon `aria-hidden` (decorative only)
- ✅ Proper heading hierarchy
