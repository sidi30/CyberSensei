/**
 * CyberSensei AI Security - Popup Script
 * Gere la configuration de l'extension.
 */

const DEFAULT_CONFIG = {
  apiUrl: "https://cs-dlp.gwani.fr",
  trainingApiUrl: "https://cs-api.gwani.fr",
  companyId: 1,
  userId: 1,
  enabled: true,
};

const apiUrlInput = document.getElementById("apiUrl");
const trainingApiUrlInput = document.getElementById("trainingApiUrl");
const companyIdInput = document.getElementById("companyId");
const userIdInput = document.getElementById("userId");
const enabledToggle = document.getElementById("enabled");
const saveBtn = document.getElementById("saveBtn");
const saveMsg = document.getElementById("saveMsg");
const statusBar = document.getElementById("statusBar");
const statusText = document.getElementById("statusText");
const trainingBtn = document.getElementById("trainingBtn");

// Charger la config
chrome.storage.sync.get("config", (result) => {
  const config = { ...DEFAULT_CONFIG, ...result.config };
  apiUrlInput.value = config.apiUrl;
  trainingApiUrlInput.value = config.trainingApiUrl;
  companyIdInput.value = config.companyId;
  userIdInput.value = config.userId;
  enabledToggle.checked = config.enabled;
  updateStatusDisplay(config.enabled);
});

// Toggle
enabledToggle.addEventListener("change", () => {
  updateStatusDisplay(enabledToggle.checked);
});

function updateStatusDisplay(enabled) {
  if (enabled) {
    statusBar.classList.remove("disabled");
    statusText.textContent = "Protection active";
  } else {
    statusBar.classList.add("disabled");
    statusText.textContent = "Protection desactivee";
  }
}

// Sauvegarde
saveBtn.addEventListener("click", () => {
  const config = {
    apiUrl: apiUrlInput.value.replace(/\/+$/, ""),
    trainingApiUrl: trainingApiUrlInput.value.replace(/\/+$/, "") || DEFAULT_CONFIG.trainingApiUrl,
    companyId: parseInt(companyIdInput.value, 10) || 1,
    userId: parseInt(userIdInput.value, 10) || 1,
    enabled: enabledToggle.checked,
  };

  chrome.storage.sync.set({ config }, () => {
    saveMsg.classList.add("visible");
    setTimeout(() => saveMsg.classList.remove("visible"), 2000);
  });
});

// Ouvrir la page Formation
trainingBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("training.html") });
});
