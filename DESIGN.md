# Design System Strategy: The Digital Architect

## 1. Overview & Creative North Star
This design system is built to move beyond the "template" aesthetic of modern EdTech. While the industry often leans toward playful, rounded, and colorful "gamification," our direction for this project—**The Digital Architect**—embraces a sophisticated, editorial approach. 

The North Star of this system is **Structured Intentionality**. We treat the mobile screen not as a flat canvas, but as a three-dimensional workspace composed of layered materials. By leveraging high-contrast typography scales and asymmetrical negative space, we create a serious, premium environment that respects the user's focus. We replace noisy UI patterns (like heavy borders and rainbow palettes) with tonal shifts and refined indigo accents, positioning the app as a high-end tool for the dedicated professional.

## 2. Colors & Surface Philosophy
The palette is strictly monochromatic, punctuated by a singular, authoritative Indigo accent.

### The "No-Line" Rule
To achieve a signature look, designers are **strictly prohibited** from using 1px solid borders for sectioning or layout containment. Structural separation must be achieved through:
- **Tonal Shifts:** Placing a `surface-container-low` card against a `surface` background.
- **Negative Space:** Using generous, intentional gaps from our spacing scale to define boundaries.
- **Surface Nesting:** Treating the UI as layers of paper. A `surface-container-lowest` card (white in light mode) should sit atop a `surface-container-low` section to provide natural, borderless depth.

### Glass & Gradients
Standard flat colors can feel sterile. To add "soul" to the professional interface:
- **Glassmorphism:** Use for floating elements (modals, navigation bars). Apply `surface` or `surface-container` tokens at 80% opacity with a `20px` backdrop blur.
- **The Signature Indigo Glow:** For primary CTAs, use a subtle linear gradient from `primary` (#4d44e3) to `primary_dim` (#4034d7) at a 135-degree angle. This provides a tactile "pressable" depth without breaking the minimal aesthetic.

## 3. Typography: The Editorial Edge
We use **Inter** as our foundational typeface, but the "signature" look comes from the execution:

- **Display & Headlines:** Use `headline-lg` and `headline-md` with **bold weights** and a **-2% tracking (letter-spacing)**. This "tight" look mimics premium architectural magazines and high-end SaaS brands like Linear.
- **Body Copy:** Use `body-md` for legibility, utilizing `on_surface_variant` for secondary information to maintain a clear hierarchy against the `on_surface` headlines.
- **Labeling:** Small labels (`label-sm`) should be uppercase with **+5% tracking** to differentiate them from functional body text.

## 4. Elevation & Depth
Depth in this system is achieved through "Tonal Layering" rather than traditional drop shadows.

- **The Layering Principle:** 
    1. Base Level: `surface`
    2. Section Level: `surface-container-low`
    3. Interactive Level: `surface-container-lowest` (the "lifted" card).
- **Ambient Shadows:** When a card must float (e.g., a floating action button), use an extra-diffused shadow.
    - *Light Mode:* Shadow color `primary` at 6% opacity, Blur: 32px, Y-Offset: 8px.
    - *Dark Mode:* Shadow color `inverse_surface` at 40% opacity, Blur: 24px, Y-Offset: 12px.
- **The Ghost Border:** If a container requires a boundary for accessibility (e.g., in Dark Mode), use the `outline_variant` token at **15% opacity**. It should be felt, not seen.

## 5. Components

### Cards & Progress Lists
- **Rule:** Forbid the use of horizontal divider lines.
- **Implementation:** Separate list items using `12px` of vertical white space. For practice sessions, cards should use the `xl` (1.5rem/24px) corner radius to feel approachable yet modern.
- **States:** A selected card should not just change color; it should receive a `2px` inset "Ghost Border" using the `primary` token.

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_dim`), white text, `md` (0.75rem) corner radius.
- **Secondary:** `surface-container-high` background with `on_surface` text. No border.
- **Tertiary/Ghost:** No background. `on_surface_variant` text that shifts to `primary` on interaction.

### Input Fields
- **Styling:** Use `surface-container` as the background fill.
- **Focus State:** The background remains, but a `primary` "Ghost Border" (20% opacity) appears, paired with a subtle `2px` indigo glow.

### Language Selection Chips
- Use the `full` (9999px) roundedness scale. 
- **Inactive:** `surface-container-high` background, `on_surface_variant` text.
- **Active:** `primary` background, `on_primary` text.

### Practice Progress Bar
- A custom component for this app. The track should be `surface-container-highest`. The progress fill should be a solid `primary` with a high-gloss "glass" overlay to make the achievement feel premium.

## 6. Do’s and Don’ts

### Do
- **Do** use asymmetrical layouts (e.g., a headline aligned left with a CTA button shifted slightly off-center).
- **Do** prioritize `body-lg` for educational content to reduce eye strain.
- **Do** use the `primary_fixed_dim` token for subtle highlights in dark mode to prevent "neon eye-bleed."

### Don't
- **Don't** use standard 1px `#e5e7eb` dividers. They clutter the editorial flow.
- **Don't** use any colors outside of the Indigo and Neutral Gray scales. No success-greens or warning-oranges unless absolutely critical for error states (use `error` token).
- **Don't** use "Default" shadows. If the shadow looks like a standard CSS drop-shadow, it is too heavy.