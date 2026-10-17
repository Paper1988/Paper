# Paper Brand Foundation

> Status: Draft v0.2  
> Scope: Brand direction and UI design principles for the Paper redesign  
> Branch: `redesign/components-v2`

## 1. Brand premise

Paper is a modular Discord application, not merely a command collection. Its identity should communicate clarity, capability, and calm control without looking like a generic gaming bot or a Discord clone.

**Working brand idea:** *Quietly capable.*

The selected direction is **Editorial + Monochrome**: the restraint of a well-designed publication, translated into a useful interactive product. Typography, spacing, hierarchy, and carefully edited copy do most of the visual work. Color is functional rather than decorative.

## 2. Brand attributes

- **Editorial:** strong information hierarchy, generous breathing room, deliberate composition.
- **Minimal, not empty:** remove decoration that does not help comprehension.
- **Precise, not cold:** clear labels, predictable states, restrained visual emphasis.
- **Modular, not fragmented:** different features share the same visual grammar.
- **Approachable, not childish:** friendly microcopy without excessive emoji or noisy gradients.
- **Theme-aware:** light and dark modes should feel intentionally designed, not inverted after the fact.

## 3. Visual identity

### Logo direction

Explore an abstract geometric mark built from a small number of simple shapes. The mark can suggest a page, crop, fold, or editorial grid without becoming a literal document icon.

Requirements:
- recognizable at small avatar sizes;
- monochrome-first, with no meaning dependent on color;
- balanced silhouette with no fine details that disappear at 32 px;
- usable independently from the Paper wordmark;
- no resemblance to Discord's logo or a generic folded-page stock icon.

The first vector concept should be treated as a direction for review, not a finalized mark.

### Wordmark direction

Use the name `Paper` in a neutral, modern sans-serif with regular or medium weight. Avoid novelty typography. Prefer a slightly open, readable wordmark over tight tracking or heavy display styling. The logo mark and wordmark should work horizontally and as separate assets.

### Monochrome palette

The brand palette is neutral-first. Light and dark surfaces are designed as separate environments, with semantic colors reserved for status and feedback rather than brand decoration.

| Token | Light theme | Dark theme | Purpose |
|---|---|---|---|
| `surface.canvas` | `#F7F7F5` | `#111111` | Main visual field |
| `surface.panel` | `#FFFFFF` | `#1A1A1A` | Primary content surface |
| `surface.subtle` | `#EEEEEC` | `#242424` | Secondary surface |
| `text.primary` | `#171717` | `#F5F5F3` | Main copy |
| `text.secondary` | `#626262` | `#ADADAA` | Supporting copy |
| `border.subtle` | `#DADAD6` | `#353535` | Dividers and boundaries |
| `brand.ink` | `#171717` | `#F5F5F3` | Brand mark and high emphasis |
| `brand.inverse` | `#F5F5F3` | `#171717` | Reverse mark on contrasting surfaces |
| `status.success` | `#237A52` | `#61C995` | Success state |
| `status.warning` | `#94600D` | `#E8B85C` | Warning state |
| `status.danger` | `#B8323E` | `#FF8188` | Error or destructive state |

Semantic colors are not part of the core brand palette. Use them only when the state itself matters. These values are initial tokens, not final accessibility certification. Check contrast in actual Discord rendering before adopting them broadly.

### Color discipline

- Prefer black, white, and neutral gray for identity and layout.
- Do not introduce a permanent saturated accent just to make the interface look more colorful.
- Use Discord's available button styles according to action hierarchy; do not imply that all Discord UI colors can be customized.
- A small status color may communicate success, warning, or danger, but should never carry meaning alone.

## 4. Typography and composition

Discord does not let bots ship a custom font for Components V2 messages. The editorial character therefore comes from hierarchy and composition, not from pretending to control the client's typeface.

- Use Markdown headings sparingly and consistently.
- Keep titles short, specific, and visually distinct from body copy.
- Use bold for labels and key values, not entire paragraphs.
- Keep supporting text concise and break dense information into meaningful sections.
- Favor short content blocks and deliberate separators over decorative borders.
- Prefer stable spacing steps in reusable layouts: 4, 8, 12, 16, 24, and 32.
- Avoid stacking multiple headings when one clear title will do.
- Avoid emoji as the only indicator of meaning.

## 5. Components V2 translation

| Design intent | Discord implementation direction |
|---|---|
| Content grouping | `ContainerBuilder` |
| Heading and explanatory copy | `TextDisplayBuilder` with restrained Markdown hierarchy |
| Section separation | `SeparatorBuilder` used only when it improves scanning |
| Primary and secondary actions | Consistent button labels and styles |
| Context-specific feedback | Ephemeral interaction response where appropriate |

Do not force every command into the same card template. Reuse layout patterns when they help users predict the interface, while allowing each command to present the information its task needs.

Components V2 is the delivery format, not the design system itself. Its actual rendering constraints take precedence over visual ideas that cannot be implemented reliably.

## 6. Voice and microcopy

Paper's UI copy should be concise, specific, calm, and useful. Explain outcomes rather than celebrating the interface.

Prefer: “Queue cleared. 4 tracks removed.”  
Avoid: “Amazing! Your queue has been magically cleared!!! 🎉🎉”

For errors, state what failed and what the user can do next. For consequential actions, explain the effect before the user confirms.

## 7. First implementation sequence

1. Review the monochrome logo concept and palette.
2. Establish reusable tokens and Components V2 helpers.
3. Select one representative user-facing command as the pilot.
4. Verify rendering in both Discord client themes and test interaction states.
5. Expand only after the pilot demonstrates that the pattern improves clarity.

## 8. Non-goals

- Rewriting all commands before a pilot is validated.
- Using decoration to compensate for unclear information hierarchy.
- Promising identical visual control in Discord to a standalone web application.
- Treating a color palette or logo concept as finalized before real-use review.
