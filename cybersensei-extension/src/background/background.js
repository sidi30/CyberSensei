/**
 * CyberSensei Extension - Background Service Worker
 * Ouvre le Side Panel au clic + notifications quotidiennes
 */

const ALARM_NAME = 'cybersensei-daily-quiz';

// Clic sur l'icône → ouvrir le side panel
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Installation
chrome.runtime.onInstalled.addListener(() => {
  setupDailyAlarm();
});

chrome.runtime.onStartup.addListener(() => {
  setupDailyAlarm();
});

// Alarme quotidienne → notification
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) checkAndNotify();
});

chrome.notifications.onClicked.addListener(() => {
  chrome.sidePanel.open({ windowId: undefined });
});

function setupDailyAlarm() {
  chrome.alarms.get(ALARM_NAME, (existing) => {
    if (!existing) {
      const now = new Date();
      const next = new Date();
      next.setHours(9, 0, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      chrome.alarms.create(ALARM_NAME, {
        when: next.getTime(),
        periodInMinutes: 24 * 60,
      });
    }
  });
}

async function checkAndNotify() {
  const { config } = await chrome.storage.local.get('config');
  if (!config?.backendUrl) return;

  const today = new Date().toISOString().split('T')[0];
  const { lastQuizDate } = await chrome.storage.local.get('lastQuizDate');
  if (lastQuizDate === today) return;

  chrome.notifications.create('daily-quiz', {
    type: 'basic',
    iconUrl: 'src/assets/icon-128.png',
    title: '🛡️ CyberSensei - Défi du jour',
    message: 'Ton exercice quotidien t\'attend ! Gagne des XP et maintiens ta série.',
    priority: 2,
  });
}
