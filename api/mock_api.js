/**
 * Auto-Generated Offline API Mock Interceptor
 * Intercepts client-side window.fetch & XMLHttpRequest to serve offline JSON responses.
 */
(function() {
  const MOCK_ROUTES = {
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json": "responses/api_1_npm_world-atlas_2_countries-110m_json.json",
  "/npm/world-atlas@2/countries-110m.json": "responses/api_1_npm_world-atlas_2_countries-110m_json.json",
  "https://creiden.com/en/cookies?_rsc=eqsiq": "responses/api_2_en_cookies.json",
  "/en/cookies": "responses/api_2_en_cookies.json",
  "https://creiden.com/en/services?_rsc=eqsiq": "responses/api_3_en_services.json",
  "/en/services": "responses/api_3_en_services.json",
  "https://creiden.com/en/contact?_rsc=eqsiq": "responses/api_4_en_contact.json",
  "/en/contact": "responses/api_4_en_contact.json",
  "https://creiden.com/en/work?_rsc=eqsiq": "responses/api_5_en_work.json",
  "/en/work": "responses/api_5_en_work.json",
  "https://creiden.com/en/ai-build-rescue/build-check?_rsc=sk0yg": "responses/api_6_en_ai-build-rescue_build-check.json",
  "/en/ai-build-rescue/build-check": "responses/api_6_en_ai-build-rescue_build-check.json"
};
  const API_BASE = (function() {
    const scripts = document.getElementsByTagName('script');
    for (let s of scripts) {
      if (s.src && s.src.includes('mock_api.js')) {
        return s.src.substring(0, s.src.lastIndexOf('/mock_api.js') + 1);
      }
    }
    return './api/';
  })();

  const origFetch = window.fetch;
  window.fetch = async function(resource, init) {
    const urlStr = typeof resource === 'string' ? resource : (resource && resource.url ? resource.url : '');
    try {
      const parsed = new URL(urlStr, window.location.href);
      const matched = MOCK_ROUTES[urlStr] || MOCK_ROUTES[parsed.pathname];
      if (matched) {
        console.log('[Offline API Mock] Intercepted fetch to:', urlStr, '->', matched);
        const localPath = API_BASE + matched;
        const resp = await origFetch(localPath);
        return resp;
      }
    } catch(e) {}
    return origFetch.apply(this, arguments);
  };

  console.log('[Offline API Mock] Active with mocked endpoints.');
})();
