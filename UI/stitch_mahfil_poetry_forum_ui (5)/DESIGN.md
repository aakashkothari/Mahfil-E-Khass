---
name: Mahfil Aesthetic
colors:
  surface: '#faf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1a'
  on-surface-variant: '#474553'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#787584'
  outline-variant: '#c8c4d5'
  surface-tint: '#584fbc'
  primary: '#3b309e'
  on-primary: '#ffffff'
  primary-container: '#534ab7'
  on-primary-container: '#d1ccff'
  inverse-primary: '#c5c0ff'
  secondary: '#855400'
  on-secondary: '#ffffff'
  secondary-container: '#fcaa33'
  on-secondary-container: '#6b4200'
  tertiary: '#41424f'
  on-tertiary: '#ffffff'
  tertiary-container: '#585967'
  on-tertiary-container: '#d1d0e1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c5c0ff'
  on-primary-fixed: '#140067'
  on-primary-fixed-variant: '#3f35a3'
  secondary-fixed: '#ffddb7'
  secondary-fixed-dim: '#ffb95d'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#e2e1f2'
  tertiary-fixed-dim: '#c5c5d5'
  on-tertiary-fixed: '#191b26'
  on-tertiary-fixed-variant: '#454653'
  background: '#faf9f6'
  on-background: '#1a1c1a'
  surface-variant: '#e3e2e0'
typography:
  display-poetry:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '2.2'
  body-poetry:
    fontFamily: Newsreader
    fontSize: 17px
    fontWeight: '400'
    lineHeight: '1.9'
  ui-header-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  ui-body:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  ui-label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1120px
  gutter: 24px
  margin-page: 40px
  stack-poetry: 32px
---

## Brand & Style

This design system evokes the atmosphere of a midnight mushaira—an intimate, intellectual gathering where tradition meets contemporary expression. The personality is "Modern Literary," balancing the weight of classical poetry with the frictionless utility of a digital forum. 

The visual style is **Minimalist with Tactile accents**. It prioritizes vast, airy whitespace to allow stanzas to breathe, while using delicate linework and gold highlights to ground the experience in a premium, editorial heritage. The emotional goal is to provide a "quiet" interface that recedes, leaving the user alone with the words, punctuated only by the warmth of candle-lit gold accents and nocturnal indigo tones.

## Colors

The palette is anchored by a warm ivory background, moving away from sterile whites to simulate the texture of aged parchment. 

- **Primary Indigo (#534AB7):** Used for primary actions, branding, and active states. It represents the "nocturnal" aspect of the brand.
- **Accent Gold (#EF9F27):** Reserved for high-value elements like tier badges, achievements, and delicate highlights.
- **Surface Tint (#EEEDFE):** Used for subtle hover states and secondary containers to maintain a soft, indigo-influenced light.
- **Mood Palette:** Four distinct colors (Purple, Green, Gray, Pink) are used exclusively for sentiment tagging (pills), allowing users to categorize poetry by emotional resonance.

## Typography

This design system utilizes a dual-font strategy to distinguish between "The Platform" and "The Art."

- **The Art (Newsreader):** All shayari and poetry content must be rendered in Newsreader. It features an increased line height (1.9 to 2.2) and generous tracking to create an airy, literary feel. For Urdu script support, Noto Nastaliq should be used as the primary fallback.
- **The Platform (Inter):** All navigation, labels, buttons, and metadata use Inter. This ensures high legibility at small sizes and a modern, functional contrast to the serif body text.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop, centered to create a focused reading column. 

- **The Reading Column:** Poetry should ideally be contained within a 680px central column to optimize line length and focus.
- **Rhythm:** An 8px base unit governs all padding and margins. Vertical rhythm is critical in poetry; use the `stack-poetry` variable to separate stanzas or separate poems in a feed, ensuring the interface never feels "crowded."
- **Margins:** Page margins are generous (40px+) to reinforce the minimalist, premium feel of an art gallery or a physical book.

## Elevation & Depth

Depth is conveyed through **Low-contrast outlines** and atmospheric shadows rather than heavy layering.

- **The Base Surface:** The warm ivory (#FAF9F6) is the foundation.
- **The Content Layer:** Cards and containers are pure white (#FFFFFF). 
- **The Edge:** Every card must feature a 0.5px solid border in Indigo (#534AB7) at 15% opacity. 
- **Shadows:** Use a single "Ambient Indigo" shadow for cards: `0px 4px 20px rgba(83, 74, 183, 0.06)`. This creates a soft lift that feels nocturnal and diffused, like a shadow cast by soft lamp-light.

## Shapes

The design system uses **Soft (0.25rem)** corners to maintain a sophisticated, precise look that avoids the playfulness of hyper-rounded UI. 

- **Cards:** Use `rounded-lg` (0.5rem) for a gentle, approachable frame.
- **Mood Pills:** Utilize a full pill shape (999px radius) to contrast against the structured, rectangular nature of the cards and the poetry blocks.
- **Buttons:** Subtle 4px (0.25rem) rounding to keep the aesthetic clean and sharp.

## Components

### Cards
Cards are the primary container for shayari. They must be white with the 0.5px border and the ambient indigo shadow. Internal padding should be generous (min 32px) to frame the text like a page in a book.

### Mood Pills
Small, high-contrast labels used for tagging. 
- Background: 10% opacity of the mood color.
- Text: 100% opacity of the mood color.
- Border: None.
- Shape: Full pill.

### Gold Tier Badges
Reserved for top contributors and "Ustaad" status. These should use a subtle linear gradient of the Accent Gold (#EF9F27) and feature a thin 1px white inner-border to give them a "metallic" jewelry-like finish.

### Buttons
- **Primary:** Solid Brand Indigo (#534AB7) with white Inter text.
- **Secondary:** Transparent background with the 0.5px border and Indigo text.
- **Text Buttons:** Gold (#EF9F27) for "Edit" or "Share" actions to highlight utility without drawing away from the content.

### Input Fields
Minimalist style. Only a bottom border (1px) in light indigo tint, which transitions to a 2px Brand Indigo border on focus. Use Inter for input text.

### The Verse Block
A specific component for poetry display. It should have no background but may include a decorative gold vertical line (2px wide, 24px tall) to the left of the opening stanza to signify the "start of the performance."