# Paper Brand Foundation

> Status: Draft v0.1  
> Scope: Brand direction and UI design principles for the Paper redesign  
> Branch: `redesign/components-v2`

## 1. Brand premise

Paper is a modular Discord application, not merely a command collection. Its identity should communicate clarity, capability, and calm control without looking like a generic gaming bot or a Discord clone.

**Working brand idea:** *Quietly capable.*

Paper should feel considered and useful: the interface stays out of the user's way, while structure and feedback make every action understandable.

## 2. Brand attributes

- **Minimal, not empty:** remove decoration that does not help comprehension.
- **Precise, not cold:** clear labels, predictable states, restrained visual emphasis.
- **Modular, not fragmented:** different features share the same visual grammar.
- **Approachable, not childish:** friendly microcopy without excessive emoji or noisy gradients.
- **Theme-aware:** light and dark modes should feel intentionally designed, not inverted after the fact.

## 3. Visual direction

### Logo concept

Explore an abstract geometric mark built from a small number of simple shapes. The mark may subtly reference a sheet, fold, page, or layered modules, but should avoid a literal paper-sheet icon and avoid copying Discord's visual identity.

Requirements:
- recognizable at small avatar sizes;
- works in monochrome before accent color is applied;
- balanced silhouette with no fine details that disappear at 32 px;
- usable independently from the Paper wordmark.

This is a direction to explore, not a finalized logo.

### Color system proposal

Use neutral surfaces as the foundation, with one restrained cool accent. Keep semantic colors separate from brand colors.

| Token | Light theme | Dark theme | Purpose |
|---|---|---|---|
| `surface.canvas` | `#F7F8FA` | `#111318` | Main visual field |
| `surface.panel` | `#FFFFFF` | `#191C23` | Primary content surface |
| `surface.subtle` | `#EEF0F4` | `#222630` | Secondary surface |
| `text.primary` | `#171923` | `#F3F4F7` | Main copy |
| `text.secondary` | `#626979` | `#A5ABBA` | Supporting copy |
| `border.subtle` | `#DDE1E8` | `#303541` | Dividers and boundaries |
| `brand.accent` | `#5967D8` | `#8994FF` | Primary emphasis |
| `status.success` | `#21845A` | `#53C994` | Success state |
| `status.warning` | `#A96812` | `#F0B85A` | Warning state |
| `status.danger` | `#C23D4B` | `#FF7A86` | Error or destructive state |

These values are initial design tokens, not final accessibility certification. Check contrast in actual Discord rendering before adopting them broadly. Discord's client theme and available component styling impose limits on how much the bot can control.

## 4. Type and layout principles

- Use short, descriptive headings that establish hierarchy.
- Keep one primary action per view where possible.
- Put explanatory detail below the heading, not into long button labels.
- Group related controls; separate unrelated groups with whitespace or a divider.
- Prefer stable spacing steps: 4, 8, 12, 16, 24, and 32.
- Use consistent wording for equivalent actions across commands.
- Avoid using emoji as the only indicator of meaning.

Discord Components V2 is the delivery format, not the design system itself. Components should be composed around the task and information hierarchy, within Discord's actual rendering constraints.

## 5. Components V2 translation

| Design intent | Discord implementation direction |
|---|---|
| Content grouping | `ContainerBuilder` |
| Heading and explanatory copy | `TextDisplayBuilder` with Markdown hierarchy |
| Separation between sections | `SeparatorBuilder` |
| Primary and secondary actions | Buttons with consistent labels and styles |
| Context-specific feedback | Ephemeral interaction response where appropriate |

Do not force every command into the same card template. Reuse layout patterns when they help users predict the interface, while allowing each command to present the information its task needs.

## 6. Voice and microcopy

Paper's UI copy should be:
- concise and specific;
- calm when reporting success;
- actionable when reporting errors;
- explicit about what will happen before a consequential action.

Prefer: “Queue cleared. 4 tracks removed.”  
Avoid: “Amazing! Your queue has been magically cleared!!! 🎉🎉”

## 7. First implementation sequence

1. Validate these tokens and the logo direction as a proposal.
2. Build reusable UI helpers for repeated Components V2 patterns.
3. Select one representative user-facing command as the pilot.
4. Verify rendering in both Discord client themes and test interaction states.
5. Expand only after the pilot demonstrates that the pattern improves clarity.

## 8. Non-goals

- Rewriting all commands before a pilot is validated.
- Replacing clarity with decoration.
- Promising identical visual control in Discord to a standalone web application.
- Treating a color palette or logo concept as finalized before real-use review.
