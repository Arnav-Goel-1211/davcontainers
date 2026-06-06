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
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    // Check if link href matches the end of currentPath
    const linkPath = new URL(link.href).pathname;
    if (currentPath === linkPath || (currentPath === '/' && linkPath === '/index.html')) {
      link.classList.add('active');
    }
  });

  // Contact Form Handling
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const statusEl = document.getElementById('formStatus');
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;

      statusEl.style.display = 'block';
      statusEl.style.color = '#555';
      statusEl.textContent = 'Sending message...';
      submitBtn.disabled = true;

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, message }),
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
});
