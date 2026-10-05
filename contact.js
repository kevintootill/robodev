(() => {
  'use strict';
  const form = document.getElementById('contact-form');
  if (!form) return;
  const button = document.getElementById('contact-submit');
  const status = document.getElementById('contact-status');
  const token = document.getElementById('contact-csrf');
  async function initialise() {
    try {
      const response = await fetch('/contact.php', { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) throw new Error();
      const result = await response.json();
      token.value = result.csrf;
      button.disabled = false;
      status.textContent = '';
    } catch {
      status.textContent = 'The contact form is unavailable. Please email kevintootill@hotmail.com.';
    }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    button.disabled = true;
    status.textContent = 'Sending your message…';
    try {
      const response = await fetch('/contact.php', { method: 'POST', credentials: 'same-origin', body: new FormData(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to send. Please try again.');
      form.reset();
      status.textContent = result.message;
    } catch (error) {
      status.textContent = error.message || 'Unable to send. Please email kevintootill@hotmail.com.';
    } finally {
      button.disabled = false;
    }
  });
  initialise();
})();
