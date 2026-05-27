(function atgDemonInjected() {
"use strict";
const __atgBase64=(s)=>new TextDecoder().decode(Uint8Array.from(atob(s),(c)=>c.charCodeAt(0)));const __atgBridgeStrings=["QVRHX0RFTU9OX1BBR0U=","c3RhdHVz","5rOo5YWl5qmL5o6l5bey5a2Y5Zyo","Kg==","U2xvdEZyYW1ld29ya0V2ZW50OlNFTkRfR0VUX1NMT1RfVEFCTEVfUEFHRV9EQVRBX1JFUVVFU1Q=","U2xvdEZyYW1ld29ya0V2ZW50OlNFTkRfR0VUX1NMT1RfVEFCTEVfREVUQUlMX1JFUVVFU1Q=","U2xvdEZyYW1ld29ya0V2ZW50OlNFTkRfTE9DS19TTE9UX1RBQkxFX1JFUVVFU1Q=","U2xvdEZyYW1ld29ya0V2ZW50OlNFTkRfQ0hBTkdFX1NMT1RfVEFCTEVfUkVRVUVTVA==","U2xvdEZyYW1ld29ya0V2ZW50OlNMT1RfVEFCTEVfUEFHRV9EQVRBX1JFU1BPTlNF","U2xvdEZyYW1ld29ya0V2ZW50OlNMT1RfVEFCTEVTX1JFU1BPTlNF","U2xvdEZyYW1ld29ya0V2ZW50OlNMT1RfVEFCTEVfUkVTUE9OU0U=","U2xvdEZyYW1ld29ya0V2ZW50OlNMT1RfVEFCTEVTX1VQREFURURfUkVTUE9OU0U=","U2xvdEZyYW1ld29ya0V2ZW50OkxPQ0tfU0xPVF9UQUJMRV9SRVNQT05TRQ==","QVRHX0RFTU9OX1BBR0U=","Kg==","c3RyaW5n","c3RyaW5n","c3RyaW5n","b2JqZWN0","b2JqZWN0","cm9vbXM=","","ZGV0YWls","ZGV0YWlsX2RvbmU=","c3RhdHVzX3VwZGF0ZXM=","ZnVuY3Rpb24=","ZXJyb3I=","c3RhdHVz","5bey6YCj5o6l6YGK5oiy5LqL5Lu2","","Kg==","","ZXJyb3I=","5om+5LiN5Yiw6YGK5oiy5LqL5Lu277yM6KuL562J6YGK5oiy6LyJ5YWl5a6M5oiQ5YaN5o6D5o+P","c3RhdHVz","c3RhdHVz","5o6D5o+P5a6M5oiQ77yM562J5b6F5YiX6KGo5pu05paw","c2Nhbl9kb25l","ZXJyb3I=","ZXJyb3I=","5om+5LiN5Yiw6YGK5oiy5LqL5Lu277yM6KuL562J6YGK5oiy6LyJ5YWl5a6M5oiQ5YaN6K6A5Y+W6Kmz5oOF","ZXJyb3I=","5om+5LiN5Yiw6YGK5oiy5LqL5Lu277yM6KuL562J6YGK5oiy6LyJ5YWl5a6M5oiQ5YaN6YCy5YWl5oi/6ZaT","b2JqZWN0","","ZXJyb3I=","5om+5LiN5Yiw5oi/6ZaT57eo6Jmf","","RW1wdHk=","c3RhdHVz","c3RhdHVz","c3RhdHVz","c3RhdHVz","","c3RhdHVz","bWVzc2FnZQ==","QVRHX0RFTU9OX0NPTlRFTlQ=","c2Nhbg==","ZGV0YWls","ZW50ZXI=","cGluZw==","Y29ubmVjdGVk","54ax6IO95p+U5YWJ5bey6Ieq5YuV5rOo5YWl","Y29ubmVjdGVk","54ax6IO95p+U5YWJ5bey6Ieq5YuV5rOo5YWl"];const __atgBridgeTplParts=[["5o6D5o+P56ysIA==","Lw==","IOmggS4uLg=="],["5qmf5Y+wIA==","IOS4jeaYr+epuuaIv++8jOacqumAgeWHuumAsuWFpQ=="],["5q2j5Zyo6JmV55CGIA==","77yM5pyq6YeN6KSH6YCB5Ye6"],["5qmf5Y+wIA==","IOmOluWumumAvuaZgu+8jOacquWIh+aPmw=="],["5bey6YCB5Ye66Y6W5a6aIA==","77yM562J5b6F6YGK5oiy56K66KqN"],["5bey6Y6W5a6aIA==","77yM5YiH5o+b5qmf5Y+w5Lit"]];const __atgBridgeText=(i)=>__atgBase64(__atgBridgeStrings[i]);const __atgBridgeTpl=(i,...v)=>{const p=__atgBridgeTplParts[i].map(__atgBase64);let o=p[0]||"";for(let j=0;j<v.length;j+=1)o+=v[j]+(p[j+1]||"");return o;};
if (window.__ATG_DEMON_INJECTED__) {
window.postMessage({ source: __atgBridgeText(0), type: __atgBridgeText(1), payload: { message: __atgBridgeText(2) } }, __atgBridgeText(3));
return;
}
const EVENTS = Object.freeze({
REQ_PAGE: __atgBridgeText(4),
REQ_DETAIL: __atgBridgeText(5),
REQ_LOCK_TABLE: __atgBridgeText(6),
REQ_CHANGE_TABLE: __atgBridgeText(7),
PAGE_RESPONSE: __atgBridgeText(8),
TABLES_RESPONSE: __atgBridgeText(9),
DETAIL_RESPONSE: __atgBridgeText(10),
UPDATED_RESPONSE: __atgBridgeText(11),
LOCK_RESPONSE: __atgBridgeText(12)
});
const state = {
lastRequestedDetailRoomId: null,
activeSilentDetailRoomId: null,
activeSilentPage: null,
pageWaiters: new Map(),
pendingEnter: null,
pendingEnterTimer: null,
scanning: false,
patchTimer: null
};
window.__ATG_DEMON_INJECTED__ = state;
function post(type, payload) {
window.postMessage(
{
source: __atgBridgeText(13),
type,
payload: payload || {},
ts: Date.now()
},
__atgBridgeText(14)
);
}
function normalizeEventName(eventName) {
if (typeof eventName === __atgBridgeText(15)) return eventName;
if (eventName && typeof eventName.name === __atgBridgeText(16)) return eventName.name;
if (eventName && typeof eventName.type === __atgBridgeText(17)) return eventName.type;
return String(eventName);
}
function unwrapPayload(payload) {
if (!payload || typeof payload !== __atgBridgeText(18)) return {};
return payload.data && typeof payload.data === __atgBridgeText(19) ? payload.data : payload;
}
function firstArray() {
for (let index = 0; index < arguments.length; index += 1) {
if (Array.isArray(arguments[index])) return arguments[index];
}
return [];
}
function pageOf(payload, data) {
return (
(data.tableMeta && data.tableMeta.currentPage) ||
(payload.tableMeta && payload.tableMeta.currentPage) ||
payload.page ||
null
);
}
function captureDispatch(eventName, payload) {
const name = normalizeEventName(eventName);
if (name === EVENTS.REQ_DETAIL) {
state.lastRequestedDetailRoomId = payload && payload.roomId != null ? String(payload.roomId) : null;
return false;
}
if (name === EVENTS.PAGE_RESPONSE || name === EVENTS.TABLES_RESPONSE) {
const data = unwrapPayload(payload);
const page = pageOf(payload || {}, data);
post(__atgBridgeText(20), {
tables: firstArray(data.tables, payload && payload.tables, data.slotTables),
tableMeta: data.tableMeta || (payload && payload.tableMeta) || null,
page
});
resolvePageWaiter(page, true);
if (state.activeSilentPage != null && (page == null || String(page) === String(state.activeSilentPage))) {
state.activeSilentPage = null;
return true;
}
return false;
}
if (name === EVENTS.DETAIL_RESPONSE) {
const data = unwrapPayload(payload);
const silentRoomId = state.activeSilentDetailRoomId;
const roomId = String(
data.roomId ||
(data.table && data.table.roomId) ||
(data.detail && data.detail.roomId) ||
silentRoomId ||
state.lastRequestedDetailRoomId ||
__atgBridgeText(21)
);
post(__atgBridgeText(22), {
roomId,
detail: data.detail || payload.detail || null,
lastRequestedDetailRoomId: state.lastRequestedDetailRoomId
});
if (silentRoomId) {
state.activeSilentDetailRoomId = null;
post(__atgBridgeText(23), { roomId });
return true;
}
return false;
}
if (name === EVENTS.UPDATED_RESPONSE) {
post(__atgBridgeText(24), { updates: payload || {} });
}
if (name === EVENTS.LOCK_RESPONSE) {
completePendingEnter();
}
return false;
}
function patchDispatch() {
if (typeof window.dispatch !== __atgBridgeText(25)) return false;
if (window.dispatch.__atgDemonPatched) return true;
const original = window.dispatch;
window.dispatch = function patchedDispatch(eventName, payload) {
let suppressOriginal = false;
try {
suppressOriginal = captureDispatch(eventName, payload) === true;
} catch (error) {
post(__atgBridgeText(26), { message: String(error) });
}
if (suppressOriginal) return undefined;
return original.apply(this, arguments);
};
window.dispatch.__atgDemonPatched = true;
window.dispatch.__atgDemonOriginal = original;
post(__atgBridgeText(27), { message: __atgBridgeText(28) });
return true;
}
function sleep(ms) {
return new Promise((resolve) => setTimeout(resolve, ms));
}
function resolvePageWaiter(page, ok) {
const key = String(page || __atgBridgeText(29));
const waiter = state.pageWaiters.get(key) || state.pageWaiters.get(__atgBridgeText(30)) || (page == null ? state.pageWaiters.values().next().value : null);
if (!waiter) return;
clearTimeout(waiter.timer);
state.pageWaiters.delete(waiter.key);
waiter.resolve(ok);
}
function waitForPageResponse(page, timeoutMs) {
const key = String(page || __atgBridgeText(31));
return new Promise((resolve) => {
const timer = setTimeout(() => {
state.pageWaiters.delete(key);
resolve(false);
}, timeoutMs);
state.pageWaiters.set(key, { key, resolve, timer });
});
}
async function scanPages(maxPages, gapMs) {
if (!patchDispatch()) {
post(__atgBridgeText(32), { message: __atgBridgeText(33) });
return;
}
if (state.scanning) return;
state.scanning = true;
try {
for (let page = 1; page <= maxPages; page += 1) {
post(__atgBridgeText(34), { message: __atgBridgeTpl(0,page,maxPages) });
state.activeSilentPage = String(page);
const waitForData = waitForPageResponse(page, Math.max(1200, gapMs * 3));
window.dispatch(EVENTS.REQ_PAGE, { page });
await waitForData;
state.activeSilentPage = null;
await sleep(Math.min(120, Math.max(40, Math.floor(gapMs / 5))));
}
post(__atgBridgeText(35), { message: __atgBridgeText(36) });
post(__atgBridgeText(37), { maxPages });
} catch (error) {
post(__atgBridgeText(38), { message: String(error) });
} finally {
state.scanning = false;
}
}
function requestDetail(roomId) {
if (!patchDispatch()) {
post(__atgBridgeText(39), { message: __atgBridgeText(40) });
return;
}
state.lastRequestedDetailRoomId = String(roomId);
state.activeSilentDetailRoomId = String(roomId);
window.dispatch(EVENTS.REQ_DETAIL, { roomId });
}
function enterRoom(room) {
if (!patchDispatch()) {
post(__atgBridgeText(41), { message: __atgBridgeText(42) });
return;
}
const table = room && typeof room === __atgBridgeText(43) ? room : {};
const payload = tablePayload(table);
const roomId = payload.roomId == null ? __atgBridgeText(44) : String(payload.roomId);
if (!roomId) {
post(__atgBridgeText(45), { message: __atgBridgeText(46) });
return;
}
if (String(payload.status || __atgBridgeText(47)) !== __atgBridgeText(48)) {
post(__atgBridgeText(49), { message: __atgBridgeTpl(1,payload.number || roomId) });
return;
}
if (state.pendingEnter) {
post(__atgBridgeText(50), { message: __atgBridgeTpl(2,state.pendingEnter.number || state.pendingEnter.roomId) });
return;
}
state.pendingEnter = payload;
if (state.pendingEnterTimer) clearTimeout(state.pendingEnterTimer);
state.pendingEnterTimer = setTimeout(() => {
state.pendingEnter = null;
state.pendingEnterTimer = null;
post(__atgBridgeText(51), { message: __atgBridgeTpl(3,payload.number || roomId) });
}, 8000);
window.dispatch(EVENTS.REQ_LOCK_TABLE, payload);
post(__atgBridgeText(52), { message: __atgBridgeTpl(4,payload.number || roomId) });
}
function tablePayload(table) {
const payload = { ...table };
const roomKey = payload.__atgRoomKey;
delete payload.__atgRoomKey;
if (payload.roomId == null || payload.roomId === __atgBridgeText(53)) payload.roomId = roomKey;
return payload;
}
function completePendingEnter() {
const payload = state.pendingEnter;
if (!payload) return;
if (state.pendingEnterTimer) {
clearTimeout(state.pendingEnterTimer);
state.pendingEnterTimer = null;
}
state.pendingEnter = null;
post(__atgBridgeText(54), { message: __atgBridgeTpl(5,payload.number || payload.roomId) });
setTimeout(() => {
if (!patchDispatch()) return;
window.dispatch(EVENTS.REQ_CHANGE_TABLE, payload);
}, 80);
}
window.addEventListener(__atgBridgeText(55), (event) => {
if (event.source !== window) return;
const data = event.data;
if (!data || data.source !== __atgBridgeText(56)) return;
if (data.type === __atgBridgeText(57)) {
scanPages(Math.max(1, Number(data.maxPages) || 10), Math.max(200, Number(data.gapMs) || 500));
} else if (data.type === __atgBridgeText(58)) {
requestDetail(data.roomId);
} else if (data.type === __atgBridgeText(59)) {
enterRoom(data.room);
} else if (data.type === __atgBridgeText(60)) {
patchDispatch();
post(__atgBridgeText(61), { message: __atgBridgeText(62) });
}
});
state.patchTimer = setInterval(patchDispatch, 750);
patchDispatch();
post(__atgBridgeText(63), { message: __atgBridgeText(64) });
})();
