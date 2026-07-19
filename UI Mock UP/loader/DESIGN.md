---
name: Organic Vitality System
colors:
  surface: '#f3fcf1'
  surface-dim: '#d4dcd2'
  surface-bright: '#f3fcf1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef6eb'
  surface-container: '#e8f0e5'
  surface-container-high: '#e2ebe0'
  surface-container-highest: '#dce5da'
  on-surface: '#161d17'
  on-surface-variant: '#3d4a3e'
  inverse-surface: '#2b322b'
  inverse-on-surface: '#ebf3e8'
  outline: '#6c7b6d'
  outline-variant: '#bbcbbb'
  surface-tint: '#006d37'
  primary: '#006d37'
  on-primary: '#ffffff'
  primary-container: '#2ecc71'
  on-primary-container: '#005027'
  inverse-primary: '#4ae183'
  secondary: '#944a00'
  on-secondary: '#ffffff'
  secondary-container: '#fc8f34'
  on-secondary-container: '#663100'
  tertiary: '#98472a'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff9875'
  on-tertiary-container: '#772e14'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bfe9c'
  primary-fixed-dim: '#4ae183'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005228'
  secondary-fixed: '#ffdcc5'
  secondary-fixed-dim: '#ffb783'
  on-secondary-fixed: '#301400'
  on-secondary-fixed-variant: '#713700'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59d'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#793015'
  background: '#f3fcf1'
  on-background: '#161d17'
  surface-variant: '#dce5da'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
  price-display:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-margin-mobile: 16px
  container-margin-desktop: 64px
  gutter: 16px
---

## Brand & Style
The design system is built for a premium, localized grocery experience that balances high-end aesthetics with extreme utility. The brand personality is fresh, reliable, and efficient—evoking the feeling of a sun-drenched, organized high-end market. 

The design style is **Minimalist with Tactile accents**. It utilizes a "crisp white canvas" approach to ensure product photography remains the hero. By removing unnecessary visual noise and focusing on a strict grid and generous white space, the system builds trust through clarity. This is not just a digital store; it is a curated service where quality is signaled through precision and cleanliness.

## Colors
The palette is rooted in the "Fresh & Vibrant" philosophy. 
- **Emerald Green (#2ECC71)**: Used for primary actions, success states, and brand signatures. It symbolizes freshness and quality.
- **Vibrant Orange (#E67E22)**: Reserved for high-urgency signals—price tags, discount badges, and primary "Add to Cart" interactions. 
- **Deep Charcoal (#2C3E50)**: Provides high-contrast legibility for all text, ensuring accessibility for a diverse user base.
- **Pure White (#FFFFFF)**: The primary surface color, creating a sterile yet inviting backdrop that makes product colors pop.

## Typography
The design system utilizes **Inter** for its systematic, utilitarian, and highly legible characteristics. The hierarchy is extremely tight to manage high-density product information.
- **Weight Strategy**: Bold weights (700) are used for pricing and headers to create immediate visual anchors. Medium weights (600) are used for product titles in cards.
- **Scalability**: On mobile, headlines scale down to prevent awkward line breaks in localized names, while body text remains at a comfortable 16px to ensure readability while shopping on the go.

## Layout & Spacing
This design system uses a **Fluid Grid** model with a hard 4px baseline rhythm. 
- **Mobile**: A 2-column or 1-column layout with 16px side margins. Product cards should occupy 50% of the viewport width minus margins.
- **Desktop**: A 12-column grid with a max-width of 1440px. 
- **Spacing Logic**: Use 16px (md) for standard padding within cards and 24px (lg) for vertical section breathing room. The tight 8px (sm) spacing is reserved for grouping related elements like "Price" and "Unit" (e.g., $4.99 / kg).

## Elevation & Depth
Depth is created through **Tonal Layers** and **Soft Ambient Shadows** rather than heavy borders.
- **Surface Level 0**: Pure White background.
- **Surface Level 1 (Cards)**: White background with a very soft, diffused shadow (0px 4px 20px rgba(44, 62, 80, 0.05)).
- **Surface Level 2 (Modals/Popovers)**: White background with a more pronounced shadow to indicate focus (0px 10px 30px rgba(44, 62, 80, 0.12)).
- **Outlines**: Use a 1px subtle border (#E2E8F0) for card boundaries only if the shadow is insufficient on specific displays.

## Shapes
The shape language is **Rounded**, conveying friendliness and accessibility.
- **Product Cards**: 1rem (16px) corner radius to soften the grid.
- **Buttons**: 0.5rem (8px) for a sturdy, clickable feel.
- **Badges/Chips**: Fully pill-shaped (32px+) to contrast against the rectangular nature of product photography.
- **Inputs**: 0.5rem (8px) to match button styling for a cohesive form-filling experience.

## Components
- **Product Cards**: The centerpiece of the app. Must include a high-quality image, a "Favorite" heart icon top-right, the price in Vibrant Orange, and a prominent green "+" button for quick addition.
- **Buttons**: 
    - *Primary*: Solid Emerald Green with White text.
    - *Secondary*: Ghost style with Emerald Green border and text.
    - *Action*: Vibrant Orange for "Checkout" or "Limited Time Offer" to drive conversion.
- **Badges**: Use pill shapes. "Organic" badges in light green tint, "Discount" badges in solid Orange.
- **Quantity Selector**: A horizontal pill-shaped component with minus/plus icons and the current count in the center, appearing once an item is added to the cart.
- **Navigation**: Bottom bar on mobile with clear icons and 12px labels; sticky top search bar on all devices for instant access to the catalog.
- **Status Indicators**: Use small circular dots (Emerald for "In Stock", Grey for "Out of Stock") placed near the product availability text.