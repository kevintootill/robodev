(() => {
  'use strict';
  const measurementId = 'G-9TM5P8R1MW';
  const storageKey = 'robodev-analytics-consent-v1';
  let consent = null;
  let started = false;
  try { consent = localStorage.getItem(storageKey); } catch { /* Storage may be unavailable. */ }
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied'
  });
  function startAnalytics() {
    window['ga-disable-' + measurementId] = false;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    if (started) return;
    started = true;
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      allow_google_signals: false, allow_ad_personalization_signals: false,
      page_location: location.origin + location.pathname
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);
  }
  function clearAnalyticsCookies() {
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const domain of ['', location.hostname, '.' + location.hostname, '.robodev.online']) {
        document.cookie = name + '=; Max-Age=0; Path=/' + (domain ? '; Domain=' + domain : '') + '; SameSite=Lax';
      }
    }
  }
  const style = document.createElement('style');
  style.textContent = '#cookie-banner{position:fixed;bottom:16px;left:16px;right:16px;z-index:50;max-width:650px;padding:20px;background:#101d30;color:#e7edf5;border:1px solid #b6e1f8;box-shadow:0 8px 32px #0008}#cookie-banner[hidden]{display:none}#cookie-banner p{margin:0 0 12px}#cookie-banner a{text-decoration:underline}#cookie-banner button,#cookie-settings{padding:8px 12px;margin:4px;border:1px solid #b6e1f8;background:#17263b;color:#e7edf5;border-radius:3px}';
  document.head.appendChild(style);
  const banner = document.createElement('section');
  banner.id = 'cookie-banner';
  banner.setAttribute('aria-label', 'Analytics cookie preferences');
  banner.innerHTML = '<p>May we use Google Analytics to understand website visits? Analytics stays off until you accept. <a href="/privacy.html">Privacy details</a></p><button type="button" data-consent="accepted">Accept analytics</button><button type="button" data-consent="rejected">Reject analytics</button>';
  banner.hidden = consent === 'accepted' || consent === 'rejected';
  document.body.appendChild(banner);
  banner.addEventListener('click', event => {
    const button = event.target.closest('[data-consent]');
    if (!button) return;
    consent = button.dataset.consent;
    try { localStorage.setItem(storageKey, consent); } catch { /* Respect this choice for this page. */ }
    banner.hidden = true;
    if (consent === 'accepted') startAnalytics();
    else {
      window['ga-disable-' + measurementId] = true;
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
      clearAnalyticsCookies();
      // Unload the tag after withdrawal, preventing further collection.
      if (started) location.reload();
    }
    document.getElementById('cookie-settings')?.focus();
  });
  document.getElementById('cookie-settings')?.addEventListener('click', () => {
    banner.hidden = false;
    banner.querySelector('button').focus();
  });
  if (consent === 'accepted') startAnalytics();
})();
