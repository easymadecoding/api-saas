// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navMenu?.classList.toggle('active');
    navToggle.classList.toggle('active');
  });
}

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu?.classList.remove('active');
    navToggle?.classList.remove('active');
  });
});

function scrollToPricing() {
  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
}

function scrollToFeatures() {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
}

async function selectPlan(plan) {
  try {
    const button = event?.target;
    if (button) {
      button.classList.add('loading');
      button.disabled = true;
    }
    const res = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || 'Failed to create checkout session');
    }
    if (data?.url) {
      window.location.href = data.url;
    } else {
      throw new Error('Stripe URL missing in response');
    }
  } catch (err) {
    console.error(err);
    alert('There was a problem starting the checkout. Please try again.');
  } finally {
    const button = event?.target;
    if (button) {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  if (window.scrollY > 50) {
    navbar.setAttribute('style', 'background: rgba(255, 255, 255, 0.98); box-shadow: 0 2px 20px rgba(0,0,0,0.1)');
  } else {
    navbar.setAttribute('style', 'background: rgba(255, 255, 255, 0.95); box-shadow: none');
  }
});

// Intersection Observer for animations
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.feature-card, .pricing-card, .hero-content, .hero-visual');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});

// Demo interaction
function simulateAPIRequest() {
  const demoResponse = document.querySelector('.demo-response pre');
  if (!demoResponse) return;
  const originalContent = demoResponse.textContent;
  demoResponse.textContent = 'Loading...';
  demoResponse.style.color = '#fbbf24';
  setTimeout(() => {
    demoResponse.textContent = originalContent || '';
    demoResponse.style.color = '#e5e7eb';
  }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  const demoRequest = document.querySelector('.demo-request');
  if (demoRequest) {
    demoRequest.setAttribute('style', 'cursor: pointer');
    demoRequest.addEventListener('click', simulateAPIRequest);
  }
});

// Buttons ripple
function createRipple(event) {
  const button = event.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
  circle.classList.add('ripple');
  const ripple = button.getElementsByClassName('ripple')[0];
  if (ripple) ripple.remove();
  button.appendChild(circle);
}

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => button.addEventListener('click', createRipple));
});

// Ripple CSS injection
const style = document.createElement('style');
style.textContent = `
  .btn { position: relative; overflow: hidden; }
  .ripple { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.6); transform: scale(0); animation: ripple 600ms linear; pointer-events: none; }
  @keyframes ripple { to { transform: scale(4); opacity: 0; } }
`;
document.head.appendChild(style);

console.log('NutriAPI site loaded');


