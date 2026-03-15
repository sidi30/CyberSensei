/**
 * CyberSensei AI Security - Content Script
 *
 * Injecté sur les sites IA (ChatGPT, Gemini, Copilot, Claude, Mistral).
 * Intercepte l'envoi de prompts et les analyse via l'API backend.
 */

(() => {
  "use strict";

  // ── Détection du site IA ──────────────────────────────────────────
  const AI_SITES = {
    "chatgpt.com": { tool: "CHATGPT", inputSelector: "#prompt-textarea, [id='prompt-textarea']", buttonSelector: 'button[data-testid="send-button"], button[aria-label="Send prompt"]' },
    "chat.openai.com": { tool: "CHATGPT", inputSelector: "#prompt-textarea, [id='prompt-textarea']", buttonSelector: 'button[data-testid="send-button"], button[aria-label="Send prompt"]' },
    "gemini.google.com": { tool: "GEMINI", inputSelector: '.ql-editor, rich-textarea [contenteditable="true"], div[contenteditable="true"]', buttonSelector: 'button[aria-label="Send message"], button.send-button, button[aria-label="Envoyer"]' },
    "copilot.microsoft.com": { tool: "COPILOT", inputSelector: '#searchbox, textarea[name="searchbox"], .cib-serp-main textarea', buttonSelector: 'button[aria-label="Submit"], button[aria-label="Envoyer"]' },
    "claude.ai": { tool: "CLAUDE", inputSelector: 'div.ProseMirror[contenteditable="true"], fieldset [contenteditable="true"]', buttonSelector: 'button[aria-label="Send Message"], button[aria-label="Envoyer le message"], fieldset button[type="button"]:last-child' },
    "chat.mistral.ai": { tool: "MISTRAL", inputSelector: 'textarea[placeholder], textarea:not([hidden])', buttonSelector: 'button[type="submit"], button[aria-label="Send"]' },
  };

  const hostname = window.location.hostname;
  const siteConfig = AI_SITES[hostname];

  if (!siteConfig) return;

  let isAnalyzing = false;
  let overlayElement = null;

  // ── Extraction du texte du prompt ─────────────────────────────────
  function getPromptText() {
    const el = document.querySelector(siteConfig.inputSelector);
    if (!el) return "";
    // contenteditable vs textarea/input
    return el.innerText || el.textContent || el.value || "";
  }

  // ── Overlay UI ────────────────────────────────────────────────────
  function showOverlay(result) {
    removeOverlay();

    const overlay = document.createElement("div");
    overlay.id = "cybersensei-overlay";
    overlay.className = `cybersensei-overlay cybersensei-${result.riskLevel.toLowerCase()}`;

    const levelLabels = {
      CRITICAL: "CRITIQUE",
      HIGH: "ÉLEVÉ",
      MEDIUM: "MOYEN",
      LOW: "FAIBLE",
    };

    const levelIcons = {
      CRITICAL: "\u26d4",
      HIGH: "\u26a0\ufe0f",
      MEDIUM: "\u26a0",
      LOW: "\u2139\ufe0f",
    };

    const detectionsHtml = result.detections && result.detections.length > 0
      ? `<div class="cybersensei-detections">
          <strong>Donn\u00e9es d\u00e9tect\u00e9es :</strong>
          <ul>${result.detections.map((d) => `<li><span class="cybersensei-cat">${d.category}</span> ${d.snippet || ""} <span class="cybersensei-conf">(${d.confidence}%)</span></li>`).join("")}</ul>
        </div>`
      : "";

    const sanitizedHtml = result.sanitizedPrompt
      ? `<div class="cybersensei-sanitized">
          <strong>Version anonymis\u00e9e propos\u00e9e :</strong>
          <pre>${escapeHtml(result.sanitizedPrompt)}</pre>
          <button id="cybersensei-use-sanitized" class="cybersensei-btn cybersensei-btn-primary">Utiliser la version anonymis\u00e9e</button>
        </div>`
      : "";

    overlay.innerHTML = `
      <div class="cybersensei-modal">
        <div class="cybersensei-header">
          <span class="cybersensei-logo">CyberSensei</span>
          <span class="cybersensei-badge">${levelIcons[result.riskLevel] || ""} Risque ${levelLabels[result.riskLevel] || result.riskLevel} (${result.riskScore}/100)</span>
        </div>
        <div class="cybersensei-body">
          <p class="cybersensei-recommendation">${escapeHtml(result.recommendation)}</p>
          ${detectionsHtml}
          ${sanitizedHtml}
        </div>
        <div class="cybersensei-footer">
          ${result.blocked
            ? `<button id="cybersensei-close" class="cybersensei-btn cybersensei-btn-secondary">Fermer (envoi bloqu\u00e9)</button>`
            : `<button id="cybersensei-cancel" class="cybersensei-btn cybersensei-btn-secondary">Annuler l'envoi</button>
               <button id="cybersensei-proceed" class="cybersensei-btn cybersensei-btn-danger">Envoyer quand m\u00eame</button>`
          }
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlayElement = overlay;

    // Event listeners
    const closeBtn = overlay.querySelector("#cybersensei-close");
    const cancelBtn = overlay.querySelector("#cybersensei-cancel");
    const proceedBtn = overlay.querySelector("#cybersensei-proceed");
    const useSanitizedBtn = overlay.querySelector("#cybersensei-use-sanitized");

    if (closeBtn) closeBtn.addEventListener("click", removeOverlay);
    if (cancelBtn) cancelBtn.addEventListener("click", removeOverlay);

    if (proceedBtn) {
      proceedBtn.addEventListener("click", () => {
        removeOverlay();
        submitOriginalPrompt();
      });
    }

    if (useSanitizedBtn) {
      useSanitizedBtn.addEventListener("click", () => {
        replacePromptText(result.sanitizedPrompt);
        removeOverlay();
      });
    }
  }

  function removeOverlay() {
    if (overlayElement) {
      overlayElement.remove();
      overlayElement = null;
    }
    isAnalyzing = false;
  }

  // ── Manipulation du champ de saisie ───────────────────────────────
  function replacePromptText(newText) {
    const el = document.querySelector(siteConfig.inputSelector);
    if (!el) return;

    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      // Pour les textarea classiques
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, "value"
      )?.set || Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, "value"
      )?.set;

      if (nativeSetter) {
        nativeSetter.call(el, newText);
      } else {
        el.value = newText;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      // Pour les contenteditable (ChatGPT, Claude, Gemini)
      el.innerText = newText;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function submitOriginalPrompt() {
    const btn = document.querySelector(siteConfig.buttonSelector);
    if (btn) {
      btn.click();
    }
  }

  // ── Interception ──────────────────────────────────────────────────
  function interceptSubmit(e) {
    if (isAnalyzing) return;

    // Verifier que le contexte de l'extension est encore valide
    // (le service worker MV3 peut s'etre endormi et invalider le contexte)
    if (!chrome.runtime || !chrome.runtime.id) {
      console.warn("[CyberSensei] Contexte extension invalide — rechargement necessaire");
      return; // Laisser passer sans bloquer
    }

    const promptText = getPromptText().trim();
    if (!promptText || promptText.length < 10) return;

    // Bloquer l'envoi
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    isAnalyzing = true;

    // Appeler l'API via le background script
    try {
      chrome.runtime.sendMessage(
        {
          type: "ANALYZE_PROMPT",
          payload: {
            prompt: promptText,
            aiTool: siteConfig.tool,
            sourceUrl: window.location.href,
          },
        },
        (response) => {
          // Verifier le contexte dans le callback aussi
          if (chrome.runtime.lastError) {
            console.warn("[CyberSensei] Communication:", chrome.runtime.lastError.message);
            // Si le contexte est invalide, laisser passer plutot que bloquer
            if (chrome.runtime.lastError.message.includes("invalidated")) {
              isAnalyzing = false;
              submitOriginalPrompt();
              return;
            }
            showOverlay({
              riskLevel: "HIGH",
              riskScore: 0,
              blocked: true,
              detections: [],
              recommendation: "Le service d'analyse est injoignable. Par securite, l'envoi est bloque.",
            });
            return;
          }

          if (!response || response.error) {
            showOverlay({
              riskLevel: "HIGH",
              riskScore: 0,
              blocked: true,
              detections: [],
              recommendation: "L'analyse a echoue. Par securite, l'envoi est bloque. Reessayez.",
            });
            return;
          }

          var riskLevel = response.riskLevel || "HIGH";

          if (riskLevel === "SAFE" || riskLevel === "LOW") {
            isAnalyzing = false;
            submitOriginalPrompt();
            return;
          }

          showOverlay({ ...response, riskLevel: riskLevel });
        }
      );
    } catch (err) {
      // Extension context invalidated — laisser passer
      console.warn("[CyberSensei] Exception:", err.message);
      isAnalyzing = false;
    }
  }

  // ── Attachement des listeners ─────────────────────────────────────

  /**
   * Surveille le DOM pour intercepter le bouton d'envoi dès qu'il apparaît,
   * car les SPA rechargent dynamiquement le DOM.
   */
  function attachListeners() {
    // Intercepter Enter dans le champ de saisie
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        const activeEl = document.activeElement;
        const inputEl = document.querySelector(siteConfig.inputSelector);
        if (activeEl && inputEl && (activeEl === inputEl || inputEl.contains(activeEl))) {
          interceptSubmit(e);
        }
      }
    }, true); // capture phase

    // Intercepter le clic sur le bouton d'envoi
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(siteConfig.buttonSelector);
      if (btn) {
        interceptSubmit(e);
      }
    }, true); // capture phase
  }

  // ── Utilitaires ───────────────────────────────────────────────────
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // ── Init ──────────────────────────────────────────────────────────
  attachListeners();
  console.log(`[CyberSensei] AI Security actif sur ${hostname} (${siteConfig.tool})`);
})();
