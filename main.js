const navLinks = [...document.querySelectorAll('.section-nav a')];
const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href')));

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (!visible.length) return;

      navLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${visible[0].target.id}`) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    },
    { rootMargin: '-64px 0px -55% 0px', threshold: 0 }
  );
  sections.forEach((section) => observer.observe(section));
}
