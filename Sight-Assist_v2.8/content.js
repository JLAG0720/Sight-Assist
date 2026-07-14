/**
 * content.js — Sight-Assist
 * Todas las funciones que se inyectan en la página.
 * Compatible con Chrome (MV3) y Firefox (MV2/MV3).
 */

"use strict";

// ── Estado global persistente por pestaña ─────────────────────────────────────
const STATE = {
  cursorGrande: false,
  lineaActiva: false,
  lectorActivo: false,
};

// ── Línea de lectura ──────────────────────────────────────────────────────────
let lineaEl = null;
document.addEventListener("mousemove", (e) => {
      if (STATE.lineaActiva && lineaEl) {
        lineaEl.style.top = e.clientY + "px";
      }
    });

function obtenerOCrearLinea() {
  if (!lineaEl || !document.documentElement.contains(lineaEl)) {
    lineaEl = document.createElement("div");
    lineaEl.id = "sa-linea-lectura";
    document.documentElement.appendChild(lineaEl);
  }
  return lineaEl;
}

function toggleLineaLectura() {
  const linea = obtenerOCrearLinea();
  STATE.lineaActiva = !STATE.lineaActiva;
  linea.style.display = STATE.lineaActiva ? "block" : "none";
}

// ── Invertir colores ──────────────────────────────────────────────────────────
function InvertirColores() {
  document.documentElement.classList.toggle("sa-contraste");
}

// ── Tamaño de texto ───────────────────────────────────────────────────────────
function CambiarTamanoTexto() {
  const body = document.body;
  const estilo = window.getComputedStyle(body).getPropertyValue("font-size");
  const tamanoActual = parseFloat(estilo);

  if (tamanoActual < 30) {
    body.style.fontSize = tamanoActual + 6 + "px";
  } else {
    body.style.fontSize = "";
  }
}

// ── Tamaño del cursor ─────────────────────────────────────────────────────────
function CambiarTamanoCursor() {
  const body = document.body;
  STATE.cursorGrande = !STATE.cursorGrande;
  body.classList.toggle("sa-cursor-grande", STATE.cursorGrande);
}

// ── Subrayar texto seleccionado ───────────────────────────────────────────────
function SubrayarTexto() {
  const seleccion = window.getSelection();
  if (!seleccion || !seleccion.rangeCount || seleccion.isCollapsed) return;

  const rango = seleccion.getRangeAt(0);
  
    const nodos = obtenerNodosDeTexto(rango);

  nodos.forEach((nodo) => {
    const inicio = nodo === rango.startContainer ? rango.startOffset : 0;
    const fin    = nodo === rango.endContainer   ? rango.endOffset   : nodo.length;

    if (inicio === fin) return;

    const rangoNodo = document.createRange();
    rangoNodo.setStart(nodo, inicio);
    rangoNodo.setEnd(nodo, fin);

    const span = document.createElement("span");
    span.className = "sa-subrayado";
    // surroundContents es seguro aquí porque rangoNodo siempre contiene
    // exactamente un nodo de texto — nunca cruza límites de elementos.
    rangoNodo.surroundContents(span);
  });

  seleccion.removeAllRanges();
}

// Devuelve todos los nodos de texto contenidos dentro del rango dado.
function obtenerNodosDeTexto(rango) {
  if (rango.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
    return [rango.commonAncestorContainer];
  }

  const nodos = [];
  const walker = document.createTreeWalker(
    rango.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    { acceptNode: (n) => rango.intersectsNode(n) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT }
  );
  let nodo;
  while ((nodo = walker.nextNode())) nodos.push(nodo);
  return nodos;
}


// ── Lector de voz ─────────────────────────────────────────────────────────────
function LectorVoz() {
  const seleccion = window.getSelection()?.toString().trim();

  if (!seleccion) {
    // Usa la API de mensajes para comunicarse con el popup
    window.speechSynthesis.cancel();
    STATE.lectorActivo = false;
    return;
  }

  window.speechSynthesis.cancel();
  const mensaje = new SpeechSynthesisUtterance(seleccion);
  mensaje.lang = document.documentElement.lang || "es";
  window.speechSynthesis.speak(mensaje);
}

// ── Reiniciar cambios ─────────────────────────────────────────────────────────
function ReiniciarCambios() {
  // Remueve clases CSS
  document.documentElement.classList.remove("sa-contraste");
  document.body.classList.remove("sa-cursor-grande");
  document.body.style.fontSize = "";

  // Apaga línea de lectura
  STATE.lineaActiva = false;
  if (lineaEl) lineaEl.style.display = "none";

  // Detiene lector de voz
  window.speechSynthesis.cancel();

  // Remueve subrayados
  document.querySelectorAll(".sa-subrayado").forEach((el) => {
    const parent = el.parentNode;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  });

  // Resetea estado
  STATE.cursorGrande = false;
  STATE.lectorActivo = false;
}

// ── Escucha mensajes desde el popup ──────────────────────────────────────────
browser.runtime.onMessage.addListener((msg) => {
  switch (msg.accion) {
    case "invertirColores":     InvertirColores();       break;
    case "cambiarTexto":        CambiarTamanoTexto();    break;
    case "cambiarCursor":       CambiarTamanoCursor();   break;
    case "lineaLectura":        toggleLineaLectura();    break;
    case "subrayar":            SubrayarTexto();         break;
    case "lectorVoz":           LectorVoz();             break;
    case "reiniciar":           ReiniciarCambios();      break;
  }
});
