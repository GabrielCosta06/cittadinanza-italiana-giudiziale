export function addLiquidEffects() {
  const inputs = document.querySelectorAll('.liquid-input');
  inputs.forEach(input => {
    input.addEventListener('focus', function () {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 8px 32px rgba(0, 122, 255, 0.3)';
    });

    input.addEventListener('blur', function () {
      this.style.transform = '';
      this.style.boxShadow = '';
    });
  });

  const buttons = document.querySelectorAll('.liquid-button');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function () {
      const glow = this.querySelector('.button-glow');
      if (glow) {
        glow.style.left = '100%';
      }
    });

    button.addEventListener('mouseleave', function () {
      const glow = this.querySelector('.button-glow');
      if (glow) {
        glow.style.left = '-100%';
      }
    });
  });

  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.addEventListener('click', function (e) {
      e.preventDefault();

      navTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      const targetId = this.getAttribute('data-tab');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const navbar = document.querySelector('.liquid-nav');
  if (navbar) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.1)';
        navbar.style.backdropFilter = 'blur(32px)';
      } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.05)';
        navbar.style.backdropFilter = 'blur(24px)';
      }
    });
  }
}
