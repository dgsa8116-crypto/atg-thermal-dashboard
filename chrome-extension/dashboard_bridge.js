"use strict";
const __atgBase64=(s)=>new TextDecoder().decode(Uint8Array.from(atob(s),(c)=>c.charCodeAt(0)));const __atgDashBridgeStrings=["QVRHX1RIRVJNQUxfREFTSEJPQVJE","QVRHX1RIRVJNQUxfRVhURU5TSU9O","QVRHX1RIRVJNQUxfREFTSEJPQVJEX0JSSURHRQ==","Kg==","YnJpZGdlX2Nvbm5lY3RlZA==","b2JqZWN0","bWVzc2FnZQ==","YnJpZGdlX2Rpc2Nvbm5lY3RlZA==","YnJpZGdlX2Vycm9y","bWVzc2FnZQ==","Y29ubmVjdA==","Z2V0X3NuYXBzaG90","Z2V0X3NuYXBzaG90","Z2V0X3NuYXBzaG90","ZW50ZXJfcm9vbQ==","ZW50ZXJfcm9vbQ==","c3RhcnRfbW9uaXRvcmluZw==","c3RhcnRfbW9uaXRvcmluZw==","cmVmcmVzaA==","cmVmcmVzaA==","dXBkYXRlX3NldHRpbmdz","dXBkYXRlX3NldHRpbmdz","YnJpZGdlX3JlYWR5"];const __atgDashBridgeTplParts=[];const __atgDashBridgeText=(i)=>__atgBase64(__atgDashBridgeStrings[i]);const __atgDashBridgeTpl=(i,...v)=>{const p=__atgDashBridgeTplParts[i].map(__atgBase64);let o=p[0]||"";for(let j=0;j<v.length;j+=1)o+=v[j]+(p[j+1]||"");return o;};
(function atgDashboardBridge() {
const PAGE_SOURCE = __atgDashBridgeText(0);
const EXT_SOURCE = __atgDashBridgeText(1);
const PORT_NAME = __atgDashBridgeText(2);
let port = null;
let connected = false;
function postToPage(type, payload) {
window.postMessage({ source: EXT_SOURCE, type, payload: payload || {}, ts: Date.now() }, __atgDashBridgeText(3));
}
function connect() {
if (connected && port) return;
try {
port = chrome.runtime.connect({ name: PORT_NAME });
connected = true;
postToPage(__atgDashBridgeText(4), { ok: true });
port.onMessage.addListener((message) => {
if (!message || typeof message !== __atgDashBridgeText(5)) return;
postToPage(message.type || __atgDashBridgeText(6), message);
});
port.onDisconnect.addListener(() => {
connected = false;
port = null;
postToPage(__atgDashBridgeText(7), {});
});
} catch (error) {
connected = false;
port = null;
postToPage(__atgDashBridgeText(8), { message: String(error && error.message ? error.message : error) });
}
}
window.addEventListener(__atgDashBridgeText(9), (event) => {
if (event.source !== window) return;
const message = event.data;
if (!message || message.source !== PAGE_SOURCE) return;
if (message.type === __atgDashBridgeText(10)) {
connect();
if (port) port.postMessage({ source: PAGE_SOURCE, type: __atgDashBridgeText(11) });
return;
}
if (!port) connect();
if (!port) return;
if (message.type === __atgDashBridgeText(12)) {
port.postMessage({ source: PAGE_SOURCE, type: __atgDashBridgeText(13) });
} else if (message.type === __atgDashBridgeText(14)) {
port.postMessage({ source: PAGE_SOURCE, type: __atgDashBridgeText(15), roomId: message.roomId });
} else if (message.type === __atgDashBridgeText(16)) {
port.postMessage({ source: PAGE_SOURCE, type: __atgDashBridgeText(17) });
} else if (message.type === __atgDashBridgeText(18)) {
port.postMessage({ source: PAGE_SOURCE, type: __atgDashBridgeText(19) });
} else if (message.type === __atgDashBridgeText(20)) {
port.postMessage({ source: PAGE_SOURCE, type: __atgDashBridgeText(21), settings: message.settings || {} });
}
});
postToPage(__atgDashBridgeText(22), {});
})();
