import { initForms, openModal } from './forms.js';

initForms();

function bindModal(id, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.cursor = 'pointer';
  el.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openModal(type);
  });
}

function bindScroll(id, targetSelector) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.cursor = 'pointer';
  el.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const target = document.querySelector(targetSelector);
    if (target) {
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.pageYOffset - 80,
        behavior: 'smooth'
      });
    }
  });
}

/* "Collaborate With Us" → scroll to Be a Part of the Change section */
bindScroll('hero-collaborate', '#get-involved');
bindScroll('mob-collaborate',  '#get-involved');

/* Hero */
bindModal('hero-volunteer', 'Join as Volunteer');
bindModal('hero-member',    'Become a Member');

/* Get Involved cards */
bindModal('involve-ngos-cta',    'Partner With Us');
bindModal('involve-medical-cta', 'Collaborate With Us');
bindModal('involve-public-cta',  'Share Expertise');

/* Individual engagement */
bindModal('involve-ind-member',    'Become a Member');
bindModal('involve-ind-volunteer', 'Join as Volunteer');
bindModal('involve-ind-expert',    'Share Expertise');

/* Join Us CTA section */
bindModal('cta-partner',   'Partner With Us');
bindModal('cta-member',    'Become a Member');
bindModal('cta-volunteer', 'Join as Volunteer');