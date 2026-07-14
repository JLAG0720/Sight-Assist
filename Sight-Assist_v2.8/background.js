/**
 * background.js — Sight-Assist
 * Service worker (MV3) / background script (MV2).
 * Solo se encarga de inyectar los scripts si el content script
 * no estaba cargado todavía (páginas abiertas antes de instalar).
 */

"use strict";

// Polyfill: Firefox ya tiene `browser`, Chrome solo tiene `chrome`
const ext = typeof browser !== "undefined" ? browser : chrome;

ext.action.onClicked.addListener(async (tab) => {
  // El popup se encarga de los comandos.
  // Este listener queda como fallback por si se configura sin popup.
});
