# NutriAPI Landing Page

A beautiful, responsive landing page for your nutrition API service.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with smooth animations
- **Hero Section**: Compelling headline with API demo visualization
- **Features Section**: Showcases key API capabilities
- **Pricing Section**: Three-tier pricing with clear benefits
- **Call-to-Action**: Prominent buttons linking to Stripe checkout
- **Interactive Elements**: Smooth scrolling, hover effects, and animations

## Files

- `index.html` - Main HTML structure
- `styles.css` - All styling and responsive design
- `script.js` - Interactive functionality and animations

## Getting Started (with Stripe Checkout)

1. Copy `.env.example` to `.env` and fill your keys:
   - `STRIPE_SECRET_KEY` (server only)
   - `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PROFESSIONAL`, `STRIPE_PRICE_ENTERPRISE`
   - Optionally `STRIPE_PUBLISHABLE_KEY`
2. Install dependencies and start the dev server:
   - `npm install`
   - `npm run dev`
3. Visit `http://localhost:3000`

## Customization

### Colors
The main brand colors are defined in CSS custom properties:
- Primary: `#2563eb` (blue)
- Accent: `#fbbf24` (yellow/gold)
- Gradient: `#667eea` to `#764ba2`

### Content
- Update the hero title and description in `index.html`
- Modify pricing plans in the pricing section
- Add your actual Stripe checkout URLs to the CTA buttons

### Styling
- All styles are in `styles.css`
- Responsive breakpoints: 768px (tablet), 480px (mobile)
- Easy to customize colors, fonts, and spacing

## Next Steps

1. **Supabase provisioning**: On webhook `checkout.session.completed`, create user + API key
2. **Backend Integration**: Connect to your Supabase database for user management
3. **API Documentation**: Add a link to your API documentation
4. **Analytics**: Add Google Analytics or similar tracking
5. **SEO**: Add meta tags, Open Graph, and structured data

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized CSS with minimal unused styles
- Efficient JavaScript with event delegation
- Smooth animations using CSS transforms
- Lazy loading ready for future images
