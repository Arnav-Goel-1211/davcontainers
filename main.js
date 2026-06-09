import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for scroll animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach(el => observer.observe(el));

  // Set active class on navigation links based on current path
  const currentPath = window.location.pathname;
  const navLinksList = document.querySelectorAll('.nav-links a');
  
  navLinksList.forEach(link => {
    const linkPath = new URL(link.href).pathname;
    if (currentPath === linkPath || (currentPath === '/' && linkPath === '/index.html')) {
      link.classList.add('active');
    }
  });

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
  }

  // Contact Form Handling
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const productSelect = document.getElementById('product');
    
    const urlParams = new URLSearchParams(window.location.search);
    const productParam = urlParams.get('product');
    if (productParam && productSelect) {
      const optionExists = Array.from(productSelect.options).some(opt => opt.value === productParam);
      if (optionExists) {
        productSelect.value = productParam;
      }
    }

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const statusEl = document.getElementById('formStatus');
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      
      const name = document.getElementById('name').value;
      const phone = document.getElementById('phone').value;
      const product = productSelect ? productSelect.value : 'general';
      const message = document.getElementById('message').value;

      statusEl.style.display = 'block';
      statusEl.style.color = '#555';
      statusEl.textContent = 'Sending message...';
      submitBtn.disabled = true;

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, product, message }),
        });

        const result = await response.json();

        if (response.ok) {
          statusEl.style.color = 'var(--accent-green)';
          statusEl.textContent = 'Message sent successfully!';
          contactForm.reset();
        } else {
          throw new Error(result.message || 'Failed to send message');
        }
      } catch (error) {
        statusEl.style.color = 'var(--primary-red)';
        statusEl.textContent = 'Error: ' + error.message;
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // ── Auto-Slideshow Logic ─────────────────────────────────────────────────────
  // Finds every .slideshow container and runs an auto-advancing slideshow.
  // Slides advance every 2.5 s; dot indicators and arrows update in sync.
  const SLIDE_INTERVAL = 2500; // ms

  document.querySelectorAll('.slideshow').forEach(slideshow => {
    const slides = Array.from(slideshow.querySelectorAll('.slide'));
    const dotsWrap = slideshow.querySelector('.slideshow-dots');
    if (!slides.length) return;

    let currentIdx = 0;
    let timer = null;

    // Build dot indicators
    if (dotsWrap && slides.length > 1) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slideshow-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', (e) => { e.preventDefault(); resetTimer(); goTo(i); });
        dotsWrap.appendChild(dot);
      });
    }

    // Inject prev / next arrows (only if more than 1 slide)
    if (slides.length > 1) {
      const mkArrow = (dir) => {
        const btn = document.createElement('button');
        btn.className = `slideshow-arrow ${dir}`;
        btn.setAttribute('aria-label', dir === 'prev' ? 'Previous image' : 'Next image');
        // SVG chevron
        btn.innerHTML = dir === 'prev'
          ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`
          : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          resetTimer();
          dir === 'prev' ? goTo(currentIdx - 1) : goTo(currentIdx + 1);
        });
        return btn;
      };
      slideshow.appendChild(mkArrow('prev'));
      slideshow.appendChild(mkArrow('next'));
    }

    const goTo = (idx) => {
      slides[currentIdx].classList.remove('active');
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.slideshow-dot')[currentIdx]?.classList.remove('active');
      }
      currentIdx = (idx + slides.length) % slides.length;
      slides[currentIdx].classList.add('active');
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.slideshow-dot')[currentIdx]?.classList.add('active');
      }
    };

    const next = () => goTo(currentIdx + 1);

    const startTimer = () => { timer = setInterval(next, SLIDE_INTERVAL); };
    const stopTimer  = () => { clearInterval(timer); };
    const resetTimer = () => { stopTimer(); startTimer(); };

    // Pause on hover, resume on leave
    slideshow.addEventListener('mouseenter', stopTimer);
    slideshow.addEventListener('mouseleave', startTimer);

    // Initialise first slide as active
    slides[0].classList.add('active');
    startTimer();
  });
});
