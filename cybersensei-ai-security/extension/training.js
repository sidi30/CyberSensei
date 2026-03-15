/**
 * CyberSensei Formation - Training Module
 * Quiz/QCM, Dashboard, Glossaire, Coach IA
 */

(function () {
  "use strict";

  // ── Config & API ────────────────────────────────────────────────
  const DEFAULT_CONFIG = {
    trainingApiUrl: "https://cs-api.gwani.fr",
    userId: 1,
    companyId: 1,
  };

  let config = { ...DEFAULT_CONFIG };

  async function loadConfig() {
    return new Promise((resolve) => {
      chrome.storage.sync.get("config", (result) => {
        if (result.config) {
          config = {
            trainingApiUrl:
              result.config.trainingApiUrl || DEFAULT_CONFIG.trainingApiUrl,
            userId: result.config.userId || DEFAULT_CONFIG.userId,
            companyId: result.config.companyId || DEFAULT_CONFIG.companyId,
          };
        }
        resolve(config);
      });
    });
  }

  async function apiGet(endpoint) {
    const url = `${config.trainingApiUrl}${endpoint}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${url}`);
    return res.json();
  }

  async function apiPost(endpoint, body) {
    const url = `${config.trainingApiUrl}${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${url}`);
    return res.json();
  }

  // ── Navigation ──────────────────────────────────────────────────
  const navBtns = document.querySelectorAll(".nav-btn");
  const panels = document.querySelectorAll(".panel");
  const panelLoaded = {};

  function switchTab(tabId) {
    navBtns.forEach((b) => b.classList.toggle("active", b.dataset.tab === tabId));
    panels.forEach((p) => p.classList.toggle("active", p.id === `panel-${tabId}`));

    if (!panelLoaded[tabId]) {
      panelLoaded[tabId] = true;
      switch (tabId) {
        case "quiz":      loadQuiz(); break;
        case "dashboard": loadDashboard(); break;
        case "glossary":  loadGlossary(); break;
        case "coach":     initCoach(); break;
      }
    }
  }

  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // ── Quiz Module ─────────────────────────────────────────────────
  let currentQuiz = null;
  let currentQIndex = 0;
  let answers = [];

  async function loadQuiz() {
    const area = document.getElementById("quiz-area");
    area.innerHTML = loadingHTML("Chargement du quiz...");

    try {
      currentQuiz = await apiGet(`/api/quiz/today?userId=${config.userId}`);
      currentQIndex = 0;
      answers = [];

      if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) {
        area.innerHTML = emptyHTML("Pas de quiz disponible aujourd'hui. Revenez demain !");
        return;
      }

      renderQuizIntro();
    } catch (err) {
      area.innerHTML = errorHTML("Impossible de charger le quiz. Verifiez la connexion au serveur.");
      console.error("Quiz load error:", err);
    }
  }

  function renderQuizIntro() {
    const q = currentQuiz;
    const questions = getQuestions();

    document.getElementById("quiz-area").innerHTML = `
      <div class="card">
        <div class="quiz-header">
          <div class="quiz-meta">
            <span class="quiz-tag tag-topic">${escHtml(q.topic || "Cybersecurite")}</span>
            <span class="quiz-tag tag-difficulty">${escHtml(q.difficulty || "")}</span>
          </div>
          <span class="quiz-progress">${questions.length} questions</span>
        </div>
        <h2 style="font-size:16px;margin-bottom:8px">${escHtml(q.title || "Quiz du jour")}</h2>
        ${q.payloadJSON?.courseIntro ? `<p style="font-size:13px;color:#9ca3af;line-height:1.6;margin-bottom:16px">${escHtml(q.payloadJSON.courseIntro)}</p>` : ""}
        <button class="btn btn-primary" id="start-quiz-btn">Commencer le quiz</button>
      </div>
    `;

    document.getElementById("start-quiz-btn").addEventListener("click", () => {
      renderQuestion();
    });
  }

  function getQuestions() {
    if (currentQuiz.payloadJSON?.questions?.length) {
      return currentQuiz.payloadJSON.questions;
    }
    return currentQuiz.questions || [];
  }

  function renderQuestion() {
    const questions = getQuestions();
    if (currentQIndex >= questions.length) {
      submitQuiz();
      return;
    }

    const q = questions[currentQIndex];
    const opts = q.options || [];
    const letters = ["A", "B", "C", "D", "E", "F"];

    document.getElementById("quiz-area").innerHTML = `
      <div class="quiz-header">
        <div class="quiz-meta">
          <span class="quiz-tag tag-topic">${escHtml(currentQuiz.topic || "")}</span>
        </div>
        <span class="quiz-progress">Question ${currentQIndex + 1}/${questions.length}</span>
      </div>
      <div class="progress-bar" style="margin-bottom:20px">
        <div class="progress-fill" style="width:${((currentQIndex) / questions.length) * 100}%"></div>
      </div>
      <div class="question-card">
        ${q.context ? `<div class="question-context">${escHtml(q.context)}</div>` : ""}
        <div class="question-text">${escHtml(q.text)}</div>
        <div class="options-grid">
          ${opts.map((opt, i) => `
            <button class="option-btn" data-index="${i}">
              <span class="option-letter">${letters[i] || i}</span>
              ${escHtml(opt)}
            </button>
          `).join("")}
        </div>
      </div>
    `;

    document.querySelectorAll(".option-btn").forEach((btn) => {
      btn.addEventListener("click", () => selectAnswer(parseInt(btn.dataset.index)));
    });
  }

  function selectAnswer(index) {
    const questions = getQuestions();
    const q = questions[currentQIndex];

    answers.push({ questionId: q.id, answer: index });

    // Visual feedback
    document.querySelectorAll(".option-btn").forEach((btn) => {
      btn.disabled = true;
      const i = parseInt(btn.dataset.index);
      if (i === index) btn.classList.add("selected");
    });

    // Advance after short delay
    setTimeout(() => {
      currentQIndex++;
      renderQuestion();
    }, 600);
  }

  async function submitQuiz() {
    const area = document.getElementById("quiz-area");
    area.innerHTML = loadingHTML("Calcul de votre score...");

    try {
      const exerciseId = currentQuiz.id;
      const result = await apiPost(`/api/exercise/${exerciseId}/submit`, {
        userId: config.userId,
        detailsJSON: { answers },
      });
      renderResult(result);
    } catch (err) {
      // Fallback: show local result
      console.error("Submit error:", err);
      renderResult({
        score: 0,
        maxScore: getQuestions().length * 20,
        correct: 0,
        total: getQuestions().length,
        feedback: "Impossible d'envoyer les resultats au serveur.",
      });
    }
  }

  function renderResult(result) {
    const pct = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
    const emoji = pct >= 80 ? "&#x1F389;" : pct >= 50 ? "&#x1F44D;" : "&#x1F4AA;";
    const blocks = 10;
    const filled = Math.round((pct / 100) * blocks);

    document.getElementById("quiz-area").innerHTML = `
      <div class="card result-card">
        <div class="result-emoji">${emoji}</div>
        <div class="result-score">${pct}%<span class="result-max"> (${result.score || 0}/${result.maxScore || 0})</span></div>
        <div class="result-bar">
          ${Array.from({ length: blocks }, (_, i) =>
            `<div class="bar-block ${i < filled ? "filled" : ""}"></div>`
          ).join("")}
        </div>
        <div class="result-stats">
          <div class="result-stat">
            <div class="result-stat-val" style="color:var(--green)">${result.correct || 0}</div>
            <div class="result-stat-label">Correct</div>
          </div>
          <div class="result-stat">
            <div class="result-stat-val" style="color:var(--red)">${(result.total || 0) - (result.correct || 0)}</div>
            <div class="result-stat-label">A revoir</div>
          </div>
          <div class="result-stat">
            <div class="result-stat-val">${result.total || 0}</div>
            <div class="result-stat-label">Total</div>
          </div>
        </div>
        <div class="result-feedback">${escHtml(result.feedback || "")}</div>
        <div class="btn-group">
          <button class="btn btn-primary" id="retry-quiz-btn">Nouveau quiz</button>
          <button class="btn btn-secondary" id="go-dashboard-btn">Voir ma progression</button>
        </div>
      </div>
    `;

    document.getElementById("retry-quiz-btn").addEventListener("click", () => {
      panelLoaded["quiz"] = false;
      loadQuiz();
    });
    document.getElementById("go-dashboard-btn").addEventListener("click", () => {
      panelLoaded["dashboard"] = false;
      switchTab("dashboard");
    });
  }

  // ── Dashboard Module ────────────────────────────────────────────
  async function loadDashboard() {
    const area = document.getElementById("dashboard-area");
    area.innerHTML = loadingHTML("Chargement...");

    try {
      const [profile, progress, badges, history] = await Promise.allSettled([
        apiGet(`/api/profile?userId=${config.userId}`),
        apiGet(`/api/user/progress?userId=${config.userId}`),
        apiGet(`/api/badges/all/${config.userId}`),
        apiGet(`/api/exercises/history?userId=${config.userId}`),
      ]);

      const p = profile.status === "fulfilled" ? profile.value : {};
      const prog = progress.status === "fulfilled" ? progress.value : {};
      const bdg = badges.status === "fulfilled" ? badges.value : [];
      const hist = history.status === "fulfilled" ? history.value : [];

      renderDashboard(p, prog, bdg, hist);
    } catch (err) {
      area.innerHTML = errorHTML("Impossible de charger le tableau de bord.");
      console.error("Dashboard error:", err);
    }
  }

  function renderDashboard(profile, progress, badges, history) {
    const level = profile.currentLevel || progress.currentLevel || "BEGINNER";
    const xp = profile.totalXp || 0;
    const streak = profile.streakDays || 0;
    const avgScore = progress.averageScore || profile.averageScore || 0;
    const completed = progress.completedExercises || 0;
    const total = progress.totalExercises || 0;
    const pctProgress = progress.progressPercentage || (total > 0 ? Math.round((completed / total) * 100) : 0);

    const levelLabels = {
      BEGINNER: "Debutant",
      INTERMEDIATE: "Intermediaire",
      ADVANCED: "Avance",
      EXPERT: "Expert",
    };

    let html = `
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon">&#x1F3C5;</div>
          <div class="stat-value">${escHtml(levelLabels[level] || level)}</div>
          <div class="stat-label">Niveau</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">&#x2B50;</div>
          <div class="stat-value">${xp}</div>
          <div class="stat-label">XP</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">&#x1F525;</div>
          <div class="stat-value">${streak}j</div>
          <div class="stat-label">Serie</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">&#x1F4C8;</div>
          <div class="stat-value">${Math.round(avgScore)}%</div>
          <div class="stat-label">Score moyen</div>
        </div>
      </div>

      <!-- Progression -->
      <div class="card">
        <div class="card-title">Progression globale</div>
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#9ca3af">
          <span>${completed} / ${total} exercices</span>
          <span>${pctProgress}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pctProgress}%"></div>
        </div>
      </div>
    `;

    // Badges
    if (badges.length > 0) {
      html += `
        <div class="card">
          <div class="card-title">Badges</div>
          <div class="badges-grid">
            ${badges.map((b) => `
              <div class="badge-card ${b.earned || b.obtainedAt ? "earned" : "locked"}">
                <div class="badge-icon">${b.icon || "&#x1F396;"}</div>
                <div class="badge-name">${escHtml(b.name || b.badgeName || "Badge")}</div>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    }

    // History
    if (history.length > 0) {
      html += `
        <div class="card">
          <div class="card-title">Historique recent</div>
          ${history.slice(0, 10).map((h) => {
            const score = h.score || 0;
            const cls = score >= 70 ? "score-high" : score >= 50 ? "score-mid" : "score-low";
            return `
              <div class="history-item">
                <div>
                  <div class="history-topic">${escHtml(h.topic || h.exerciseTitle || "Exercice")}</div>
                  <div class="history-date">${h.date || h.completedAt || ""}</div>
                </div>
                <div class="history-score ${cls}">${score}%</div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    document.getElementById("dashboard-area").innerHTML = html;
  }

  // ── Glossary Module ─────────────────────────────────────────────
  let glossaryData = [];

  async function loadGlossary() {
    const list = document.getElementById("glossary-list");
    list.innerHTML = loadingHTML("Chargement du glossaire...");

    try {
      glossaryData = await apiGet("/api/glossary/all");
      renderGlossary(glossaryData);
    } catch (err) {
      // Fallback: built-in glossary
      glossaryData = BUILTIN_GLOSSARY;
      renderGlossary(glossaryData);
    }
  }

  function renderGlossary(terms) {
    const list = document.getElementById("glossary-list");
    if (!terms || terms.length === 0) {
      list.innerHTML = emptyHTML("Aucun terme trouve.");
      return;
    }

    list.innerHTML = terms.map((t, i) => `
      <div class="glossary-item" data-index="${i}">
        <div class="glossary-term">
          <span>${escHtml(t.term || t.name || "")}</span>
          <span class="glossary-arrow">&#x25B6;</span>
        </div>
        <div class="glossary-def">
          ${escHtml(t.definition || t.description || "")}
          ${t.relatedTerms?.length ? `
            <div class="glossary-related">
              ${t.relatedTerms.map((r) => `<span class="related-tag">${escHtml(r)}</span>`).join("")}
            </div>
          ` : ""}
        </div>
      </div>
    `).join("");

    list.querySelectorAll(".glossary-item").forEach((item) => {
      item.querySelector(".glossary-term").addEventListener("click", () => {
        item.classList.toggle("open");
      });
    });
  }

  // Glossary search
  document.getElementById("glossary-search").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      renderGlossary(glossaryData);
      return;
    }
    const filtered = glossaryData.filter(
      (t) =>
        (t.term || t.name || "").toLowerCase().includes(query) ||
        (t.definition || t.description || "").toLowerCase().includes(query)
    );
    renderGlossary(filtered);
  });

  // Built-in fallback glossary
  const BUILTIN_GLOSSARY = [
    { term: "Phishing", definition: "Technique d'ingenierie sociale qui consiste a usurper l'identite d'un tiers de confiance pour soutirer des informations sensibles.", relatedTerms: ["Spear phishing", "Vishing", "Smishing"] },
    { term: "Ransomware", definition: "Logiciel malveillant qui chiffre les fichiers d'un systeme et exige une rancon pour les dechiffrer.", relatedTerms: ["Malware", "Chiffrement", "Sauvegarde"] },
    { term: "Malware", definition: "Terme generique designant tout logiciel concu pour nuire : virus, trojan, spyware, ransomware, etc.", relatedTerms: ["Virus", "Trojan", "Spyware"] },
    { term: "Firewall", definition: "Dispositif de securite reseau qui surveille et filtre le trafic entrant et sortant selon des regles de securite.", relatedTerms: ["IDS", "IPS", "DMZ"] },
    { term: "VPN", definition: "Reseau prive virtuel qui cree un tunnel chiffre entre votre appareil et un serveur distant pour proteger vos communications.", relatedTerms: ["Chiffrement", "Tunnel", "Proxy"] },
    { term: "2FA / MFA", definition: "Authentification a deux ou plusieurs facteurs. Ajoute une couche de securite supplementaire au-dela du mot de passe.", relatedTerms: ["OTP", "TOTP", "Biometrie"] },
    { term: "Social Engineering", definition: "Manipulation psychologique visant a tromper les individus pour qu'ils divulguent des informations confidentielles.", relatedTerms: ["Phishing", "Pretexting", "Baiting"] },
    { term: "Zero Trust", definition: "Modele de securite qui ne fait confiance a aucun utilisateur ou appareil par defaut, meme a l'interieur du reseau.", relatedTerms: ["IAM", "Microsegmentation", "MFA"] },
    { term: "DDoS", definition: "Attaque par deni de service distribue qui vise a rendre un service indisponible en le submergeant de requetes.", relatedTerms: ["Botnet", "DoS", "CDN"] },
    { term: "SQL Injection", definition: "Technique d'attaque qui consiste a inserer du code SQL malveillant dans les requetes d'une application web.", relatedTerms: ["XSS", "OWASP", "Parametrage"] },
    { term: "XSS", definition: "Cross-Site Scripting : injection de scripts malveillants dans des pages web vues par d'autres utilisateurs.", relatedTerms: ["SQL Injection", "CSRF", "CSP"] },
    { term: "SIEM", definition: "Security Information and Event Management : plateforme de collecte, analyse et correlation des evenements de securite.", relatedTerms: ["SOC", "Log", "Correlation"] },
    { term: "SOC", definition: "Security Operations Center : equipe et infrastructure dediees a la surveillance et la reponse aux incidents de securite.", relatedTerms: ["SIEM", "CERT", "Incident Response"] },
    { term: "IAM", definition: "Identity and Access Management : ensemble de processus et technologies pour gerer les identites et les droits d'acces.", relatedTerms: ["RBAC", "SSO", "MFA"] },
    { term: "APT", definition: "Advanced Persistent Threat : attaque ciblee, sophistiquee et prolongee menee par des acteurs organises.", relatedTerms: ["Cyber espionnage", "Zero-day", "Lateral movement"] },
    { term: "Chiffrement", definition: "Processus de transformation de donnees lisibles en donnees illisibles sans la cle de dechiffrement appropriee.", relatedTerms: ["AES", "RSA", "TLS"] },
    { term: "RGPD", definition: "Reglement General sur la Protection des Donnees : cadre juridique europeen pour la protection des donnees personnelles.", relatedTerms: ["DPO", "Consentement", "Donnees personnelles"] },
    { term: "Shadow IT", definition: "Utilisation de systemes, logiciels ou services informatiques sans l'approbation du departement IT.", relatedTerms: ["BYOD", "SaaS", "Gouvernance"] },
    { term: "Brute Force", definition: "Methode d'attaque consistant a tester systematiquement toutes les combinaisons possibles de mots de passe.", relatedTerms: ["Dictionary attack", "Password spraying", "Rate limiting"] },
    { term: "Backdoor", definition: "Porte derobee : acces secret a un systeme informatique, souvent installe par un attaquant pour un acces futur.", relatedTerms: ["Trojan", "RAT", "Rootkit"] },
  ];

  // ── Coach IA Module ─────────────────────────────────────────────
  let coachInitialized = false;

  async function initCoach() {
    if (coachInitialized) return;
    coachInitialized = true;

    const msgs = document.getElementById("chat-messages");
    const suggestions = document.getElementById("chat-suggestions");

    // Welcome message
    addBotMessage("Bonjour ! Je suis votre coach cybersecurite. Posez-moi vos questions, demandez des explications ou des conseils pratiques.");

    // Suggestion chips
    const defaultSuggestions = [
      "C'est quoi le phishing ?",
      "Comment creer un mot de passe solide ?",
      "Que faire en cas de ransomware ?",
      "Expliquer le Zero Trust",
    ];

    suggestions.innerHTML = defaultSuggestions.map((s) =>
      `<button class="suggestion-chip">${escHtml(s)}</button>`
    ).join("");

    suggestions.querySelectorAll(".suggestion-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        sendChatMessage(chip.textContent);
        suggestions.innerHTML = "";
      });
    });

    // Try to load recommendations
    try {
      const reco = await apiGet(`/api/profile/recommendations?userId=${config.userId}`);
      if (reco && reco.suggestions?.length) {
        addBotMessage("Voici ce que je vous recommande de travailler : " +
          reco.suggestions.join(", "));
      }
    } catch {
      // Silent fallback
    }
  }

  function addBotMessage(text) {
    const msgs = document.getElementById("chat-messages");
    const div = document.createElement("div");
    div.className = "chat-msg bot";
    div.innerHTML = `<div class="msg-sender">CyberSensei</div>${escHtml(text)}`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addUserMessage(text) {
    const msgs = document.getElementById("chat-messages");
    const div = document.createElement("div");
    div.className = "chat-msg user";
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addTypingIndicator() {
    const msgs = document.getElementById("chat-messages");
    const div = document.createElement("div");
    div.className = "chat-msg bot";
    div.id = "typing-indicator";
    div.innerHTML = `<div class="msg-sender">CyberSensei</div><div class="typing-dots"><span></span><span></span><span></span></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById("typing-indicator");
    if (el) el.remove();
  }

  async function sendChatMessage(text) {
    if (!text.trim()) return;

    addUserMessage(text);
    document.getElementById("chat-input").value = "";
    document.getElementById("chat-send").disabled = true;

    addTypingIndicator();

    try {
      const response = await apiPost("/api/ai/chat", {
        userId: config.userId,
        message: text,
      });

      removeTypingIndicator();
      addBotMessage(response.reply || response.message || response.response || JSON.stringify(response));
    } catch (err) {
      removeTypingIndicator();
      addBotMessage("Desole, je n'ai pas pu traiter votre demande. Verifiez la connexion au serveur.");
      console.error("Chat error:", err);
    }

    document.getElementById("chat-send").disabled = false;
  }

  // Chat event listeners
  document.getElementById("chat-send").addEventListener("click", () => {
    sendChatMessage(document.getElementById("chat-input").value);
  });

  document.getElementById("chat-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage(e.target.value);
    }
  });

  // ── Helpers ─────────────────────────────────────────────────────
  function escHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
  }

  function loadingHTML(text) {
    return `<div class="loading"><div class="spinner"></div><div>${escHtml(text)}</div></div>`;
  }

  function errorHTML(text) {
    return `<div class="empty-state"><div class="empty-icon">&#x26A0;&#xFE0F;</div><div class="empty-text">${escHtml(text)}</div></div>`;
  }

  function emptyHTML(text) {
    return `<div class="empty-state"><div class="empty-icon">&#x1F4AD;</div><div class="empty-text">${escHtml(text)}</div></div>`;
  }

  // ── Init ────────────────────────────────────────────────────────
  loadConfig().then(() => {
    panelLoaded["quiz"] = true;
    loadQuiz();
  });
})();
