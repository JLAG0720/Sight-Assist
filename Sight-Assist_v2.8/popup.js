/**
 * popup.js — Sight-Assist
 * Gestiona los clics del popup y los envía al content script
 * mediante mensajes. Compatible con Chrome y Firefox.
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("button[data-accion]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const accion = btn.dataset.accion;

      try {
        const [tab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (!tab?.id) return;

        // Intenta enviar el mensaje. Si el content script no está inyectado
        // (p. ej. página recién cargada), lo inyectamos primero.
        try {
          await browser.tabs.sendMessage(tab.id, { accion });
        } catch {
          await browser.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["browser-polyfill.js", "content.js"],
          });
          // Pequeña espera para que el script se registre
          await new Promise((r) => setTimeout(r, 80));
          await browser.tabs.sendMessage(tab.id, { accion });
        }

        // Feedback visual en el botón
        btn.classList.add("activo");
        if (accion === "reiniciar") {
          // Quita el estado activo de todos los botones
          document
            .querySelectorAll("button[data-accion]")
            .forEach((b) => b.classList.remove("activo"));
        }
      } catch (err) {
        console.error("[Sight-Assist] Error al enviar mensaje:", err);
      }
    });
  });
});
