"use strict";
const __atgBase64=(s)=>new TextDecoder().decode(Uint8Array.from(atob(s),(c)=>c.charCodeAt(0)));const __atgBgStrings=["QVRHX1RIRVJNQUxfREFTSEJPQVJEX0JSSURHRQ==","QVRHX1RIRVJNQUxfQ09OVEVOVA==","Z2FtZQ==","562J5b6F6YGK5oiy6aCB6YCj57ea","c25hcHNob3Q=","c25hcHNob3Q=","c25hcHNob3Q=","QVRHX1RIRVJNQUxfREFTSEJPQVJE","Z2V0X3NuYXBzaG90","c25hcHNob3Q=","ZW50ZXJfcm9vbQ==","ZW50ZXJfcm9vbQ==","c3RhcnRfbW9uaXRvcmluZw==","c3RhcnRfbW9uaXRvcmluZw==","cmVmcmVzaA==","cmVmcmVzaA==","dXBkYXRlX3NldHRpbmdz","dXBkYXRlX3NldHRpbmdz","6YGK5oiy6aCB5bey6Zec6ZaJ","c25hcHNob3Q=","c3RhdHVz","d2Fybg==","5bCa5pyq6YCj5o6l6YGK5oiy6aCB","QVRHX1RIRVJNQUxfQkFDS0dST1VORA==","c3RhdHVz","ZXJyb3I=","c3RhdHVz","b2s=","d2Fybg==","5bey6YCB5Ye6","6YGK5oiy6aCB5pyq5o6l5Y+X5q2k5oyH5Luk","QVRHX1RIRVJNQUxfQkFDS0dST1VORA==","Z2V0X3NuYXBzaG90","c25hcHNob3Q="];const __atgBgTplParts=[];const __atgBgText=(i)=>__atgBase64(__atgBgStrings[i]);const __atgBgTpl=(i,...v)=>{const p=__atgBgTplParts[i].map(__atgBase64);let o=p[0]||"";for(let j=0;j<v.length;j+=1)o+=v[j]+(p[j+1]||"");return o;};
const DASHBOARD_SOURCE = __atgBgText(0);
const CONTENT_SOURCE = __atgBgText(1);
const state = {
gameTabId: null,
dashboardPorts: new Set(),
snapshot: {
source: __atgBgText(2),
ts: Date.now(),
connected: false,
monitoring: false,
scanning: false,
detailsScanning: false,
lastMessage: __atgBgText(3),
totalRooms: 0,
rooms: []
}
};
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
if (!message || message.source !== CONTENT_SOURCE) return false;
if (message.type === __atgBgText(4)) {
state.gameTabId = sender.tab && sender.tab.id != null ? sender.tab.id : state.gameTabId;
state.snapshot = {
...message.snapshot,
gameTabId: state.gameTabId,
receivedAt: Date.now()
};
broadcast({ type: __atgBgText(5), snapshot: state.snapshot });
sendResponse({ ok: true });
return true;
}
return false;
});
chrome.runtime.onConnect.addListener((port) => {
if (port.name !== DASHBOARD_SOURCE) return;
state.dashboardPorts.add(port);
port.postMessage({ type: __atgBgText(6), snapshot: state.snapshot });
port.onMessage.addListener((message) => {
if (!message || message.source !== __atgBgText(7)) return;
if (message.type === __atgBgText(8)) {
port.postMessage({ type: __atgBgText(9), snapshot: state.snapshot });
requestFreshSnapshot();
return;
}
if (message.type === __atgBgText(10)) {
forwardToGame({ type: __atgBgText(11), roomId: message.roomId }, port);
return;
}
if (message.type === __atgBgText(12)) {
forwardToGame({ type: __atgBgText(13) }, port);
return;
}
if (message.type === __atgBgText(14)) {
forwardToGame({ type: __atgBgText(15) }, port);
return;
}
if (message.type === __atgBgText(16)) {
forwardToGame({ type: __atgBgText(17), settings: message.settings || {} }, port);
}
});
port.onDisconnect.addListener(() => {
state.dashboardPorts.delete(port);
});
});
chrome.tabs.onRemoved.addListener((tabId) => {
if (tabId === state.gameTabId) {
state.gameTabId = null;
state.snapshot = {
...state.snapshot,
connected: false,
monitoring: false,
scanning: false,
detailsScanning: false,
lastMessage: __atgBgText(18),
rooms: [],
totalRooms: 0,
ts: Date.now()
};
broadcast({ type: __atgBgText(19), snapshot: state.snapshot });
}
});
function broadcast(message) {
for (const port of Array.from(state.dashboardPorts)) {
try {
port.postMessage(message);
} catch {
state.dashboardPorts.delete(port);
}
}
}
function forwardToGame(payload, replyPort) {
const tabId = state.gameTabId;
if (tabId == null) {
replyPort.postMessage({ type: __atgBgText(20), level: __atgBgText(21), message: __atgBgText(22) });
return;
}
chrome.tabs.sendMessage(tabId, { source: __atgBgText(23), ...payload }, (response) => {
if (chrome.runtime.lastError) {
replyPort.postMessage({ type: __atgBgText(24), level: __atgBgText(25), message: chrome.runtime.lastError.message });
return;
}
replyPort.postMessage({ type: __atgBgText(26), level: response && response.ok ? __atgBgText(27) : __atgBgText(28), message: response && response.ok ? __atgBgText(29) : __atgBgText(30) });
});
}
function requestFreshSnapshot() {
if (state.gameTabId == null) return;
chrome.tabs.sendMessage(state.gameTabId, { source: __atgBgText(31), type: __atgBgText(32) }, (response) => {
if (chrome.runtime.lastError || !response || !response.snapshot) return;
state.snapshot = {
...response.snapshot,
gameTabId: state.gameTabId,
receivedAt: Date.now()
};
broadcast({ type: __atgBgText(33), snapshot: state.snapshot });
});
}
