/**
 * browser-polyfill.js
 * Shim ligero que expone `browser` en Chrome (que solo tiene `chrome`),
 * y deja intacta la API nativa de Firefox.
 * Así el resto del código puede usar `browser.*` en ambos navegadores.
 */
(function () {
  if (typeof globalThis.browser === "undefined") {
    globalThis.browser = chrome;
  }
})();
