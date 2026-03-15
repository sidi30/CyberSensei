/**
 * CyberSensei Extension v2 - Background Service Worker
 * ZERO imports (MV3 sans type:module)
 */
var CS = {
  backend: 'https://cs-api.gwani.fr',
  dlp: 'https://cs-dlp.gwani.fr',
  cfgUrl: 'https://cs-api.gwani.fr/api/extension/config',
  gaId: 'G-E4R643JMG8',
  gaSec: 'xnL7kDzVRpOwDYjx65_KHA',
};

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onInstalled.addListener(function() {
  initCfg(); setupAlarms();
  track('extension_installed', { version: '2.0.0' });
  ga4('extension_installed', { version: '2.0.0' });
});
chrome.runtime.onStartup.addListener(function() {
  initCfg(); setupAlarms(); track('extension_started');
});

function setupAlarms() {
  chrome.alarms.get('cs-quiz', function(a) {
    if (!a) {
      var n = new Date(); n.setHours(9,0,0,0);
      if (n <= new Date()) n.setDate(n.getDate()+1);
      chrome.alarms.create('cs-quiz', { when: n.getTime(), periodInMinutes: 1440 });
    }
  });
  chrome.alarms.get('cs-tele', function(a) {
    if (!a) chrome.alarms.create('cs-tele', { periodInMinutes: 5 });
  });
}

chrome.alarms.onAlarm.addListener(function(a) {
  if (a.name === 'cs-quiz') notify();
  if (a.name === 'cs-tele') flush();
});

chrome.notifications.onClicked.addListener(function() {
  chrome.sidePanel.open({ windowId: undefined });
});

function notify() {
  chrome.storage.local.get(['config','lastQuizDate'], function(r) {
    if (!r.config) return;
    var t = new Date().toISOString().split('T')[0];
    if (r.lastQuizDate === t) return;
    chrome.notifications.create('dq', {
      type:'basic', iconUrl:'src/assets/icon-128.png',
      title:'CyberSensei - Defi du jour',
      message:'Ton exercice quotidien t\'attend !', priority:2,
    });
  });
}

function initCfg() {
  chrome.storage.local.get('config', function(r) {
    var c = r.config || {};
    if (!c.backendUrl) c.backendUrl = CS.backend;
    if (!c.dlpUrl) c.dlpUrl = CS.dlp;
    if (c.dlpEnabled === undefined) c.dlpEnabled = true;
    if (c.requireActivation === undefined) c.requireActivation = false;
    chrome.storage.local.set({ config: c });
    // Remote config
    fetch(CS.cfgUrl, { signal: AbortSignal.timeout(5000) })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(d) {
        if (!d) return;
        chrome.storage.local.get('config', function(r2) {
          var c2 = r2.config || c;
          c2.backendUrl = d.backendUrl || c2.backendUrl;
          c2.dlpUrl = d.dlpUrl || c2.dlpUrl;
          chrome.storage.local.set({ config: c2 });
        });
      }).catch(function(){});
  });
}

chrome.runtime.onMessage.addListener(function(msg, sender, reply) {
  if (msg.type === 'ANALYZE_PROMPT') {
    doAnalyze(msg.payload).then(reply).catch(function() {
      reply({ riskLevel:'HIGH', riskScore:0, blocked:true, detections:[],
        recommendation:'Service indisponible. Envoi bloque par securite.' });
    });
    return true;
  }
  if (msg.type === 'GET_DLP_STATUS') {
    chrome.storage.local.get('config', function(r) {
      reply({ enabled: r.config ? r.config.dlpEnabled !== false : true });
    });
    return true;
  }
});

function doAnalyze(p) {
  return new Promise(function(ok, fail) {
    chrome.storage.local.get('config', function(r) {
      var c = r.config || {};
      if (c.dlpEnabled === false) { ok({ riskLevel:'SAFE', riskScore:0, blocked:false }); return; }
      fetch((c.dlpUrl||CS.dlp)+'/api/extension/analyze', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ prompt:p.prompt, aiTool:p.aiTool, companyId:c.companyId||1,
          userId:c.userId||c.activationCode||'community', sourceUrl:p.sourceUrl }),
        signal: AbortSignal.timeout(10000),
      }).then(function(r) { if(!r.ok) throw new Error(r.status); return r.json(); })
        .then(function(d) {
          track('dlp_analyze',{aiTool:p.aiTool,riskLevel:d.riskLevel,blocked:d.blocked||false});
          ga4('dlp_analyze',{ai_tool:p.aiTool,risk_level:d.riskLevel||'?',blocked:String(d.blocked||false)});
          ok(d);
        }).catch(fail);
    });
  });
}

function track(e, d) {
  chrome.storage.local.get('telemetry', function(r) {
    var ev = (r.telemetry&&r.telemetry.events)||[];
    ev = ev.slice(-200);
    ev.push({e:e,d:d||{},t:Date.now()});
    chrome.storage.local.set({telemetry:{events:ev}});
  });
}

function flush() {
  chrome.storage.local.get(['telemetry','config'], function(r) {
    var ev = (r.telemetry&&r.telemetry.events)||[];
    if (!ev.length) return;
    var c = r.config||{};
    fetch((c.backendUrl||CS.backend)+'/api/extension/telemetry', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ extensionVersion:'2.0.0', tenantId:c.tenantId||'community',
        mode:c.requireActivation?'enterprise':'community', events:ev, sentAt:new Date().toISOString() }),
      signal:AbortSignal.timeout(5000),
    }).then(function() { chrome.storage.local.set({telemetry:{events:[]}}); }).catch(function(){});
  });
}

function ga4(name, params) {
  chrome.storage.local.get('ga4ClientId', function(r) {
    var cid = r.ga4ClientId;
    if (!cid) { cid=Date.now()+'.'+Math.random().toString(36).slice(2); chrome.storage.local.set({ga4ClientId:cid}); }
    fetch('https://www.google-analytics.com/mp/collect?measurement_id='+CS.gaId+'&api_secret='+CS.gaSec, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({client_id:cid,events:[{name:name,params:Object.assign({engagement_time_msec:'100'},params||{})}]}),
    }).catch(function(){});
  });
}
