# Paper Brand Guidelines v1.0

> Status: Initial design-system specification  
> Date: 2026-10-23  
> Scope: Paper Discord Bot, Dashboard, website, embeds, and product-facing system messages

## 1. Brand foundation

**Positioning:** Minimalist × Developer-minded  
**Product pillars:** Music × Utility × Community  
**Primary language:** Traditional Chinese (Taiwan), with English retained for technical terms and concise brand copy.

Paper makes complex capabilities feel clear, dependable, and effortless. The interface should feel engineered, not decorated.

### Principles

1. **Clarity over decoration.** Every visual element must communicate hierarchy, state, or affordance.
2. **Consistency over novelty.** Products share the same tokens, interaction patterns, and terminology.
3. **Honest by default.** Never fabricate system status, server counts, playback state, or analytics.
4. **Quiet confidence.** Use restrained surfaces, typography, and a single controlled accent.
5. **Useful to people.** Developer-minded does not mean cold or obscure; errors and settings should remain understandable.

## 2. Color tokens

The initial palette is a design proposal and should be validated in real UI states before being treated as immutable.

### Dark theme

| Token | Value | Usage |
|---|---|---|
| `color.bg.canvas` | `#101116` | App background |
| `color.bg.sidebar` | `#15161C` | Sidebar and navigation rail |
| `color.bg.surface` | `#1B1C24` | Cards and panels |
| `color.bg.surface-hover` | `#22232D` | Hovered interactive surfaces |
| `color.bg.elevated` | `#272833` | Popovers, menus, dialogs |
| `color.border.default` | `#30313D` | Default borders and dividers |
| `color.border.strong` | `#454655` | Emphasized boundaries |
| `color.text.primary` | `#F2F2F6` | Primary text |
| `color.text.secondary` | `#B1B2C0` | Supporting text |
| `color.text.muted` | `#858797` | Metadata and placeholders |
| `color.brand.primary` | `#8588FF` | Brand accent and primary actions |
| `color.brand.hover` | `#9B9DFF` | Hovered brand actions |
| `color.brand.pressed` | `#6F72E8` | Pressed brand actions |
| `color.brand.subtle` | `#282940` | Selected surfaces and subtle emphasis |
| `color.status.success` | `#55C99A` | Confirmed healthy/success states |
| `color.status.warning` | `#E9B968` | Warnings and degraded states |
| `color.status.danger` | `#F07883` | Errors and destructive actions |
| `color.status.info` | `#78B8F5` | Informational states |

### Color rules

- The indigo-violet accent is for focus, active navigation, links, and primary actions, not for every icon.
- Status colors are semantic and must not be used as decoration.
- Do not communicate status through color alone; pair it with text or an icon.
- Keep text contrast accessible. Verify actual contrast for small text and disabled states during implementation.
- Avoid gradients as a default. If used in campaign or marketing surfaces, they must not replace the product palette.
- Discord's brand purple is not Paper's brand identity.

## 3. Typography

### Typeface stack

- **UI:** Inter, with system sans-serif fallbacks.
- **Traditional Chinese:** `"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif`.
- **Code and technical identifiers:** `"SFMono-Regular", Consolas, "Liberation Mono", monospace`.

Use bundled or reliably available fonts where deployment and licensing permit. The design must remain readable if a preferred font fails to load.

### Type scale

| Token | Size / line height | Usage |
|---|---|---|
| `type.display` | 32 / 40 px | Rare page-level feature headline |
| `type.h1` | 28 / 36 px | Main page title |
| `type.h2` | 22 / 30 px | Major section heading |
| `type.h3` | 18 / 26 px | Card and subsection headings |
| `type.body` | 14 / 22 px | Default interface text |
| `type.body-sm` | 13 / 20 px | Secondary descriptions |
| `type.label` | 12 / 16 px | Form labels and compact metadata |
| `type.code` | 13 / 20 px | Code, IDs, and technical values |

Typography should use medium or semibold weights for hierarchy, not oversized headings everywhere. Avoid all-caps labels except short, low-emphasis navigation group labels.

## 4. Symbol logo

### Direction

Create a standalone, recognizable symbol that works at 16, 24, 32, and 48 px. The initial design direction is a geometric paper/page form with a deliberate fold or cut, optionally incorporating a subtle P-shaped negative space. It should be recognizable in monochrome before the accent color is applied.

This is a design direction, not a claim that a final logo asset already exists.

### Clear space and sizing

- Minimum clear space: 25% of the symbol's width on every side.
- Preferred app-icon canvas: 1:1, with the symbol occupying approximately 64–72% of the canvas.
- Use a monochrome version for contexts with limited color.
- Do not stretch, rotate, add shadows, outline arbitrarily, or place the symbol on low-contrast backgrounds.
- Do not use the Discord logo as part of the Paper symbol.
- Do not create different symbols for Dashboard, bot embeds, and website. Use the same master mark.

### Wordmark and naming

The product name is **Paper**. Use the name in title case in prose and UI. The standalone symbol is the primary compact brand asset; pair it with the Paper wordmark when the audience may not yet recognize the mark.

## 5. Layout, spacing, and shape

Use a 4 px base spacing unit.

| Token | Value | Typical use |
|---|---:|---|
| `space.1` | 4 px | Icon/text micro-gap |
| `space.2` | 8 px | Compact control gap |
| `space.3` | 12 px | Dense component padding |
| `space.4` | 16 px | Default spacing and card padding |
| `space.5` | 20 px | Form and section spacing |
| `space.6` | 24 px | Standard section separation |
| `space.8` | 32 px | Major layout separation |
| `space.12` | 48 px | Page-level breathing room |
| `radius.sm` | 6 px | Inputs, compact controls |
| `radius.md` | 10 px | Buttons and standard cards |
| `radius.lg` | 14 px | Larger panels |
| `radius.xl` | 20 px | Dialogs and hero surfaces |
| `radius.pill` | 999 px | Pills and compact status labels |

- Use a consistent 1 px border for most panels.
- Use shadows sparingly; surface contrast and borders should establish hierarchy.
- Dashboard content should use a responsive grid, not fixed-width columns.
- Standard page content should have a comfortable maximum width while allowing data tables to use available space.
- Do not nest cards inside cards without a clear information-hierarchy reason.

## 6. Component style

### Buttons

- Primary: brand accent background, high-contrast text, reserved for the most important action.
- Secondary: neutral surface or transparent background with a visible border.
- Tertiary: text or subtle surface treatment for low-priority actions.
- Destructive: semantic danger treatment and explicit confirmation when impact is significant.
- All interactive controls need hover, focus-visible, pressed, disabled, and loading states.

### Inputs and forms

- Labels remain visible; placeholders are examples, not substitutes for labels.
- Validation messages should state what happened and how to fix it.
- Group related settings and explain consequential options.
- Avoid saving silently when the user expects an explicit save. When autosave is used, show its actual state.

### Cards and tables

- Cards summarize related information, not merely fill empty space.
- Tables prioritize scanning, alignment, and readable empty/loading/error states.
- Numbers use consistent units and formatting.
- Empty states should explain why no data appears and what the user can do next.

### Icons and motion

- Use one consistent line-icon family with consistent stroke weight.
- Icons should support labels rather than obscure meaning.
- Motion is short and functional: roughly 120–200 ms for common transitions.
- Respect reduced-motion preferences. Avoid perpetual animation and decorative motion on operational screens.

## 7. Dashboard visual specification

### Information architecture

1. **Overview:** connected-server summary, important service status, recent relevant activity, and clear next actions.
2. **Servers:** servers the authenticated user can access and configure.
3. **Music:** playback and music-related configuration only where supported by real backend capabilities.
4. **Utilities:** available community and utility features.
5. **Settings:** account, preferences, and server-level configuration, with permission-aware visibility.
6. **System status:** operational health only when backed by a real and appropriately secured status source.

The final navigation must reflect actual implemented capabilities. Do not display nonfunctional destinations as if they were ready.

### Desktop layout

- Persistent left sidebar with a compact symbol and clearly grouped navigation.
- Top bar for current context, account controls, and relevant notifications.
- Main content area with one clear page title, concise supporting copy, and a predictable content grid.
- Keep primary actions visually distinct and near the content they affect.

### Responsive behavior

- Desktop: persistent sidebar.
- Tablet: collapsible or compact navigation.
- Mobile: drawer or bottom navigation where appropriate; avoid shrinking desktop tables until unreadable.
- Forms, dialogs, and controls must remain usable with touch input and keyboard navigation.

### Data states

Every data-backed view must define:
- Loading
- Success / populated
- Empty
- Error
- Permission denied, where applicable
- Stale or degraded state, where the data source supports detecting it

Never hardcode example metrics into production UI. Mock data must be clearly labeled and isolated from production data paths.

## 8. Product language

- Primary UI language: Traditional Chinese (Taiwan).
- Use concise, direct, calm wording.
- Prefer action-oriented labels such as「儲存設定」、「重新連線」、「查看伺服器」.
- Technical terms may remain in English when translation would reduce clarity.
- Error messages should explain the issue, its impact, and a safe next step.
- Avoid exaggerated claims such as「百分之百穩定」or unsupported real-time promises.

## 9. Accessibility and quality gates

- Keyboard access and visible focus indicators are mandatory.
- Use semantic controls and accessible names.
- Do not rely on color alone to convey state.
- Verify text contrast, zoom behavior, responsive layouts, and reduced motion.
- Avoid destructive actions without clear labeling and appropriate confirmation.
- Do not expose secrets, internal identifiers, or privileged operational information to ordinary users.

## 10. Implementation order

1. Establish design tokens and a reusable component foundation.
2. Create the Symbol as a proper vector asset and verify it at small sizes.
3. Build the responsive Dashboard shell and navigation.
4. Add real authentication, server selection, and permission-aware routes.
5. Connect only verified API endpoints and real service states.
6. Test loading, empty, error, accessibility, and mobile behavior.
7. Align bot embeds and product-facing messages with the same visual and language principles.

## 11. Scope and repository note

The current `Paper1988/Paper` repository is primarily the TypeScript Discord bot and backend. The inspected repository tree does not currently contain a dedicated Dashboard/frontend application. Keep the bot runtime stable while deciding whether the Dashboard should live in a separate repository or a clearly isolated web application directory. Do not add frontend build steps to the bot's production start path without an explicit architecture decision.

## 12. Change control

This is the initial v1.0 foundation. Tokens may be refined after contrast checks and implementation review, but changes should be made centrally and applied consistently. Any new color, spacing value, radius, or component variant should have a defined semantic purpose rather than being added ad hoc.
