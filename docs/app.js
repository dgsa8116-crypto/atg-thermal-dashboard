"use strict";
const __atgBase64=(s)=>new TextDecoder().decode(Uint8Array.from(atob(s),(c)=>c.charCodeAt(0)));const __atgSiteStrings=["QVRHX1RIRVJNQUxfREFTSEJPQVJE","QVRHX1RIRVJNQUxfRVhURU5TSU9O","6KuL5YWI6LyJ5YWlIENocm9tZSDmk7TlhYXvvIzplovllZ/pgYrmiLLpoIHkuKbpgLLmiL/vvIzlho3lm57liLDmraTpoIHpgKPmjqXjgII=","5q2j5Zyo5qqi5p+l55m75YWl54uA5oWL","YXV0aEVtYWls","YXV0aEZvcm0=","YXV0aFBhc3N3b3Jk","YXV0aFN0YXR1cw==","YnJpZGdlU3RhdHVz","Y29ubmVjdEJ0bg==","Z2FtZVN0YXR1cw==","bG9naW5CdG4=","bG9nb3V0QnRu","bW9uaXRvckJ0bg==","cG9pbnRVbml0SW5wdXQ=","cm9vbUNvdW50","dXBkYXRlZEF0","bm90aWNl","cmVmcmVzaEJ0bg==","cm9vbXM=","c2lnbnVwQnRu","dXNlckVtYWls","bWVzc2FnZQ==","YnJpZGdlX3JlYWR5","YnJpZGdlX2Nvbm5lY3RlZA==","5bey6YCj5o6l5pys5qmf5pO05YWF77yM562J5b6F6YGK5oiy6aCB6LOH5paZ44CC","YnJpZGdlX2Rpc2Nvbm5lY3RlZA==","5pO05YWF5qmL5o6l5bey5Lit5pa377yM6KuL6YeN5paw5pW055CG5q2k6aCB5oiW6YeN5paw6LyJ5YWl5pO05YWF44CC","YnJpZGdlX2Vycm9y","5pO05YWF5qmL5o6l6Yyv6Kqk","c25hcHNob3Q=","6LOH5paZ5bey5ZCM5q2l44CC","c3RhdHVz","c3VibWl0","Y2xpY2s=","Y2xpY2s=","Y2xpY2s=","Y2xpY2s=","c3RhcnRfbW9uaXRvcmluZw==","Y2hhbmdl","Ymx1cg==","Y2xpY2s=","cmVmcmVzaA==","5bCa5pyq6Kit5a6a5pyD5ZOh6LOH5paZ5bqr77ya6KuL5YWI57eo6LyvIGRvY3Mvc3VwYWJhc2UtY29uZmlnLmpz44CC","ZnVuY3Rpb24=","55m75YWl5YWD5Lu26LyJ5YWl5aSx5pWX77yM6KuL56K66KqN57ay6Lev5Y+v6YCj5YiwIGpzRGVsaXZy44CC","5bey55m75YWl","6KuL55m75YWl5b6M5L2/55So5YSA6KGo5p2/44CC","5bey55m75YWl","6KuL55m75YWl5b6M5L2/55So5YSA6KGo5p2/44CC","55m75YWl5LitLi4u","","55m75YWl5oiQ5Yqf44CC","5bu656uL5biz6Jmf5LitLi4u","","6Ki75YaK5a6M5oiQ77yM5bey55m75YWl44CC","6Ki75YaK5a6M5oiQ77yM6KuL5Yiw5L+h566x56K66KqN5b6M5YaN55m75YWl44CC","55m75Ye65LitLi4u","5bey55m75Ye644CC","Y29ubmVjdA==","Z2V0X3NuYXBzaG90","Kg==","dXBkYXRlX3NldHRpbmdz","5bey6YCj5o6l","5Y+v6YCj5o6l","562J5b6F5pO05YWF","5bey6YCj5o6l","5pyq6YCj5o6l6YGK5oiy6aCB","emgtVFc=","LQ==","562J5b6F5oi/6ZaT6LOH5paZ5Zue5YKz","5bCa5pyq5pS25Yiw6YGK5oiy6LOH5paZ","","W2RhdGEtZW50ZXItcm9vbS1pZF0=","Y2xpY2s=","ZW50ZXJfcm9vbQ==","aXMtYXV0aGVk","5bey55m75YWl","","6KuL5YWI55m75YWl5pyD5ZOh44CC","55m75YWl5YWD5Lu25bCa5pyq5rqW5YKZ5a6M5oiQ44CC","5bCa5pyq6Kit5a6a5pyD5ZOh6LOH5paZ5bqr44CC","6KuL6Ly45YWlIEVtYWlsIOiIh+WvhueivOOAgg==","5a+G56K86Iez5bCR6ZyA6KaBIDYg56K844CC","c3RyaW5n","c3RyaW5n","WU9VUl8=","WU9VUl8=","","55m75YWl55m855Sf6Yyv6Kqk","aW52YWxpZCBsb2dpbiBjcmVkZW50aWFscw==","5biz6Jmf5oiW5a+G56K86Yyv6Kqk44CC","ZW1haWwgbm90IGNvbmZpcm1lZA==","5L+h566x5bCa5pyq6amX6K2J77yM6KuL5YWI5a6M5oiQIEVtYWlsIOeiuuiqjeOAgg==","dXNlciBhbHJlYWR5IHJlZ2lzdGVyZWQ=","5q2kIEVtYWlsIOW3suiou+WGiu+8jOiri+ebtOaOpeeZu+WFpeOAgg==","c2lnbnVwIGRpc2FibGVk","55uu5YmN5pyq6ZaL5pS+6Ki75YaK77yM6KuL5YiwIFN1cGFiYXNlIEF1dGhlbnRpY2F0aW9uIOioreWumumWi+WVn+OAgg==","cGFzc3dvcmQ=","5a+G56K85LiN56ym5ZCI6KaP5YmH77yM6KuL6Iez5bCR5L2/55SoIDYg56K85Lim6YG/5YWN6YGO5byx5a+G56K844CC","RW1wdHk=","ZW1wdHk=","YnVzeQ==","IC8g","LQ==","LQ==","LQ==","","54uA5oWL","54uA5oWL","","","","","","ZGlzYWJsZWQ=","LQ==","LQ==","ZW4tVVM=","LQ==","LQ==","LQ==","55uu5YmN5Y2A6ZaT","LQ==","MA==","LQ==","MA==","JmFtcDs=","Jmx0Ow==","Jmd0Ow==","JnF1b3Q7","JiMzOTs="];const __atgSiteTplParts=[["","",""],["PGRpdiBjbGFzcz0iZW1wdHktc3RhdGUiPg==","PC9kaXY+"],["5bey6YCB5Ye66YCy5YWlIA==",""],["PHNwYW4+","PC9zcGFuPg=="],["PGRpdiBjbGFzcz0icmVhc29uLWxpc3QiPg==","PC9kaXY+"],["CiAgICA8YXJ0aWNsZSBjbGFzcz0icm9vbS1jYXJkIj4KICAgICAgPGRpdiBjbGFzcz0icm9vbS1oZWFkIj4KICAgICAgICA8ZGl2IGNsYXNzPSJtYWNoaW5lIj4KICAgICAgICAgIDxzdHJvbmc+","PC9zdHJvbmc+CiAgICAgICAgICA8c3Bhbj4=","PC9zcGFuPgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InNjb3JlLXN0YWNrIj4KICAgICAgICAgIDxkaXYgY2xhc3M9InNjb3JlLXBpbGwgcmFuayI+PHNwYW4+5Zue5aCx5YiGPC9zcGFuPjxiPg==","PC9iPjwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0ic2NvcmUtcGlsbCBidXJzdCI+PHNwYW4+5pq06KGdPC9zcGFuPjxiPg==","JTwvYj48L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImVuZXJneSIgdGl0bGU9IuWbnuWgseWIhiA=","IC8g5pq06KGd5qmf546HIA==","JSI+CiAgICAgICAgPHNwYW4gY2xhc3M9ImVuZXJneS1maWxsIiBzdHlsZT0id2lkdGg6","JSI+PC9zcGFuPgogICAgICA8L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0ibWV0cmljcyI+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7loLHnjoc8c3Ryb25nIGNsYXNzPSJyYXRlIj4=","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7kuIvms6g8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7ni4DmhYs8c3Ryb25nIGNsYXNzPSI=","Ij4=","PC9zdHJvbmc+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwb2ludC1ncmlkIj4KICAgICAgICA8ZGl2IGNsYXNzPSJtZXRyaWMiPumrmOeIhum7nuaVuDxzdHJvbmc+","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7mr4/ovYnpu57mlbg8c3Ryb25nPg==","IA==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7lianppJjovYnmlbg8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj4=","PHN0cm9uZz4=","PC9zdHJvbmc+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJkZXRhaWwtZ3JpZCI+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7ku4rml6U8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7liY3kuIDlsI/mmYI8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7ov5EzMOaXpTxzdHJvbmc+","PC9zdHJvbmc+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmcmVlLWdyaWQiPgogICAgICAgIDxkaXYgY2xhc3M9Im1ldHJpYyI+5pyq6ZaL6L2J5pW4PHN0cm9uZz4=","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7liY3kuIDovYnmlbg8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7liY3kuozovYnmlbg8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmcmVlLWdyaWQgZm9yZWNhc3QtZ3JpZCI+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7lhY3pgYrokL3pu548c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7plovovYnljYDplpM8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7lsJrlt648c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj4=","PHN0cm9uZz4=","PC9zdHJvbmc+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJkZXRhaWwtZ3JpZCI+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7li5Xog708c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7pgLHmnJ88c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7lm57okL08c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJkZXRhaWwtZ3JpZCI+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7mupblgpnluqY8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7oo5zmqKPmnKw8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7mqKPmnKznm67mqJk8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA=","CiAgICAgIDxkaXYgY2xhc3M9InJvb20tYWN0aW9ucyI+CiAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGRhdGEtZW50ZXItcm9vbS1pZD0i","IiBkYXRhLWVudGVyLXJvb20tbnVtYmVyPSI=","IiA=","PumAsuWFpTwvYnV0dG9uPgogICAgICA8L2Rpdj4KICAgIDwvYXJ0aWNsZT4KICA="],["","JQ=="],["","JQ=="],["","IOi9iQ=="],["","LQ==","IOi9iQ=="],["","IOi9iQ=="],["","LQ==","IOi9iQ=="],["","LQ==",""]];const __atgSiteText=(i)=>__atgBase64(__atgSiteStrings[i]);const __atgSiteTpl=(i,...v)=>{const p=__atgSiteTplParts[i].map(__atgBase64);let o=p[0]||"";for(let j=0;j<v.length;j+=1)o+=v[j]+(p[j+1]||"");return o;};
const PAGE_SOURCE = __atgSiteText(0);
const EXT_SOURCE = __atgSiteText(1);
const DEFAULT_NOTICE = __atgSiteText(2);
const state = {
bridgeReady: false,
bridgeConnected: false,
snapshot: null,
notice: DEFAULT_NOTICE,
auth: {
busy: false,
client: null,
configured: false,
status: __atgSiteText(3),
user: null
}
};
const els = {
authEmail: document.getElementById(__atgSiteText(4)),
authForm: document.getElementById(__atgSiteText(5)),
authPassword: document.getElementById(__atgSiteText(6)),
authStatus: document.getElementById(__atgSiteText(7)),
bridgeStatus: document.getElementById(__atgSiteText(8)),
connectBtn: document.getElementById(__atgSiteText(9)),
gameStatus: document.getElementById(__atgSiteText(10)),
loginBtn: document.getElementById(__atgSiteText(11)),
logoutBtn: document.getElementById(__atgSiteText(12)),
monitorBtn: document.getElementById(__atgSiteText(13)),
pointUnitInput: document.getElementById(__atgSiteText(14)),
roomCount: document.getElementById(__atgSiteText(15)),
updatedAt: document.getElementById(__atgSiteText(16)),
notice: document.getElementById(__atgSiteText(17)),
refreshBtn: document.getElementById(__atgSiteText(18)),
rooms: document.getElementById(__atgSiteText(19)),
signupBtn: document.getElementById(__atgSiteText(20)),
userEmail: document.getElementById(__atgSiteText(21))
};
window.addEventListener(__atgSiteText(22), (event) => {
if (event.source !== window) return;
const message = event.data;
if (!message || message.source !== EXT_SOURCE) return;
if (message.type === __atgSiteText(23)) {
state.bridgeReady = true;
if (isAuthenticated()) connect();
render();
return;
}
if (!isAuthenticated()) return;
if (message.type === __atgSiteText(24)) {
state.bridgeConnected = true;
state.notice = __atgSiteText(25);
getSnapshot();
} else if (message.type === __atgSiteText(26)) {
state.bridgeConnected = false;
state.notice = __atgSiteText(27);
} else if (message.type === __atgSiteText(28)) {
state.notice = message.payload && message.payload.message ? message.payload.message : __atgSiteText(29);
} else if (message.type === __atgSiteText(30)) {
state.bridgeConnected = true;
state.snapshot = message.payload && message.payload.snapshot ? message.payload.snapshot : message.payload;
state.notice = state.snapshot && state.snapshot.lastMessage ? state.snapshot.lastMessage : __atgSiteText(31);
} else if (message.type === __atgSiteText(32)) {
const payload = message.payload || {};
state.notice = payload.message || state.notice;
}
render();
});
els.authForm.addEventListener(__atgSiteText(33), (event) => {
event.preventDefault();
signIn();
});
els.signupBtn.addEventListener(__atgSiteText(34), signUp);
els.logoutBtn.addEventListener(__atgSiteText(35), signOut);
els.connectBtn.addEventListener(__atgSiteText(36), connect);
els.monitorBtn.addEventListener(__atgSiteText(37), () => send(__atgSiteText(38)));
els.pointUnitInput.addEventListener(__atgSiteText(39), updatePointUnit);
els.pointUnitInput.addEventListener(__atgSiteText(40), updatePointUnit);
els.refreshBtn.addEventListener(__atgSiteText(41), () => send(__atgSiteText(42)));
setInterval(getSnapshot, 8000);
setTimeout(() => {
if (isAuthenticated()) connect();
}, 250);
initAuth();
render();
async function initAuth() {
const config = window.ATG_SUPABASE_CONFIG || {};
if (!hasValidSupabaseConfig(config)) {
state.auth.configured = false;
state.auth.status = __atgSiteText(43);
renderAuth();
return;
}
if (!window.supabase || typeof window.supabase.createClient !== __atgSiteText(44)) {
state.auth.configured = false;
state.auth.status = __atgSiteText(45);
renderAuth();
return;
}
state.auth.configured = true;
state.auth.client = window.supabase.createClient(config.url, config.anonKey, {
auth: {
autoRefreshToken: true,
detectSessionInUrl: true,
persistSession: true
}
});
try {
const { data, error } = await state.auth.client.auth.getSession();
if (error) throw error;
state.auth.user = data && data.session ? data.session.user : null;
state.auth.status = state.auth.user ? __atgSiteText(46) : __atgSiteText(47);
} catch (error) {
state.auth.status = formatAuthError(error);
}
state.auth.client.auth.onAuthStateChange((_event, session) => {
state.auth.user = session ? session.user : null;
state.auth.status = state.auth.user ? __atgSiteText(48) : __atgSiteText(49);
if (!state.auth.user) clearDashboard();
render();
if (state.auth.user) connect();
});
render();
if (state.auth.user) connect();
}
async function signIn() {
if (!requireAuthClient()) return;
const credentials = readCredentials();
if (!credentials) return;
state.auth.busy = true;
state.auth.status = __atgSiteText(50);
renderAuth();
try {
const { data, error } = await state.auth.client.auth.signInWithPassword(credentials);
if (error) throw error;
state.auth.user = data && data.session ? data.session.user : state.auth.user;
els.authPassword.value = __atgSiteText(51);
state.auth.status = __atgSiteText(52);
} catch (error) {
state.auth.status = formatAuthError(error);
} finally {
state.auth.busy = false;
render();
if (state.auth.user) connect();
}
}
async function signUp() {
if (!requireAuthClient()) return;
const credentials = readCredentials();
if (!credentials) return;
state.auth.busy = true;
state.auth.status = __atgSiteText(53);
renderAuth();
try {
const { data, error } = await state.auth.client.auth.signUp({
...credentials,
options: {
emailRedirectTo: __atgSiteTpl(0,window.location.origin,window.location.pathname)
}
});
if (error) throw error;
state.auth.user = data && data.session ? data.session.user : state.auth.user;
els.authPassword.value = __atgSiteText(54);
state.auth.status = data && data.session ? __atgSiteText(55) : __atgSiteText(56);
} catch (error) {
state.auth.status = formatAuthError(error);
} finally {
state.auth.busy = false;
render();
if (state.auth.user) connect();
}
}
async function signOut() {
if (!state.auth.client) return;
state.auth.busy = true;
state.auth.status = __atgSiteText(57);
renderAuth();
try {
const { error } = await state.auth.client.auth.signOut();
if (error) throw error;
state.auth.user = null;
clearDashboard();
state.auth.status = __atgSiteText(58);
} catch (error) {
state.auth.status = formatAuthError(error);
} finally {
state.auth.busy = false;
render();
}
}
function connect() {
if (!requireSignedIn()) return;
send(__atgSiteText(59));
}
function getSnapshot() {
if (!isAuthenticated()) return;
send(__atgSiteText(60));
}
function send(type, payload = {}) {
if (!isAuthenticated()) return;
window.postMessage({ source: PAGE_SOURCE, type, ...payload }, __atgSiteText(61));
}
function updatePointUnit() {
if (!isAuthenticated()) return;
const pointUnit = clamp(number(els.pointUnitInput.value), 0, 100000);
els.pointUnitInput.value = String(pointUnit);
send(__atgSiteText(62), { settings: { pointUnit } });
}
function render() {
renderAuth();
if (!isAuthenticated()) return;
const snapshot = state.snapshot;
const rooms = snapshot && Array.isArray(snapshot.rooms) ? snapshot.rooms : [];
els.bridgeStatus.textContent = state.bridgeConnected ? __atgSiteText(63) : state.bridgeReady ? __atgSiteText(64) : __atgSiteText(65);
els.gameStatus.textContent = snapshot && snapshot.connected ? snapshot.lastMessage || __atgSiteText(66) : __atgSiteText(67);
els.roomCount.textContent = String(snapshot ? snapshot.totalRooms || rooms.length : 0);
els.updatedAt.textContent = snapshot && snapshot.ts ? new Date(snapshot.ts).toLocaleTimeString(__atgSiteText(68), { hour12: false }) : __atgSiteText(69);
els.notice.textContent = state.notice;
if (document.activeElement !== els.pointUnitInput) {
els.pointUnitInput.value = String(snapshot && snapshot.settings ? number(snapshot.settings.pointUnit) : 0);
}
els.monitorBtn.disabled = !snapshot || !snapshot.connected || snapshot.monitoring;
els.refreshBtn.disabled = !snapshot || !snapshot.connected || snapshot.scanning || snapshot.detailsScanning;
els.pointUnitInput.disabled = !snapshot || !snapshot.connected;
if (!rooms.length) {
els.rooms.innerHTML = __atgSiteTpl(1,escapeHtml(snapshot && snapshot.connected ? __atgSiteText(70) : __atgSiteText(71)));
return;
}
els.rooms.innerHTML = rooms.map(renderRoom).join(__atgSiteText(72));
els.rooms.querySelectorAll(__atgSiteText(73)).forEach((button) => {
button.addEventListener(__atgSiteText(74), () => {
if (!requireSignedIn()) return;
send(__atgSiteText(75), { roomId: button.dataset.enterRoomId });
state.notice = __atgSiteTpl(2,button.dataset.enterRoomNumber || button.dataset.enterRoomId);
render();
});
});
}
function renderAuth() {
const signedIn = isAuthenticated();
document.body.classList.toggle(__atgSiteText(76), signedIn);
els.authStatus.textContent = state.auth.status;
els.userEmail.textContent = signedIn ? state.auth.user.email || __atgSiteText(77) : __atgSiteText(78);
els.loginBtn.disabled = state.auth.busy || !state.auth.configured;
els.signupBtn.disabled = state.auth.busy || !state.auth.configured;
els.logoutBtn.disabled = state.auth.busy || !signedIn;
els.authEmail.disabled = state.auth.busy || !state.auth.configured;
els.authPassword.disabled = state.auth.busy || !state.auth.configured;
}
function isAuthenticated() {
return Boolean(state.auth.user);
}
function requireSignedIn() {
if (isAuthenticated()) return true;
state.auth.status = __atgSiteText(79);
renderAuth();
return false;
}
function requireAuthClient() {
if (state.auth.client) return true;
state.auth.status = state.auth.configured ? __atgSiteText(80) : __atgSiteText(81);
renderAuth();
return false;
}
function readCredentials() {
const email = els.authEmail.value.trim();
const password = els.authPassword.value;
if (!email || !password) {
state.auth.status = __atgSiteText(82);
renderAuth();
return null;
}
if (password.length < 6) {
state.auth.status = __atgSiteText(83);
renderAuth();
return null;
}
return { email, password };
}
function hasValidSupabaseConfig(config) {
if (!config || typeof config.url !== __atgSiteText(84) || typeof config.anonKey !== __atgSiteText(85)) return false;
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.url.trim())) return false;
if (config.url.includes(__atgSiteText(86)) || config.anonKey.includes(__atgSiteText(87))) return false;
return config.anonKey.trim().length > 40;
}
function clearDashboard() {
state.bridgeConnected = false;
state.snapshot = null;
state.notice = DEFAULT_NOTICE;
els.rooms.innerHTML = __atgSiteText(88);
}
function formatAuthError(error) {
const message = error && error.message ? error.message : String(error || __atgSiteText(89));
const normalized = message.toLowerCase();
if (normalized.includes(__atgSiteText(90))) return __atgSiteText(91);
if (normalized.includes(__atgSiteText(92))) return __atgSiteText(93);
if (normalized.includes(__atgSiteText(94))) return __atgSiteText(95);
if (normalized.includes(__atgSiteText(96))) return __atgSiteText(97);
if (normalized.includes(__atgSiteText(98))) return __atgSiteText(99);
return message;
}
function renderRoom(room) {
const burst = clamp(number(room.burstProbability), 0, 100);
const rank = clamp(number(room.rankScore == null ? room.score : room.rankScore), 0, 100);
const statusClass = room.status === __atgSiteText(100) ? __atgSiteText(101) : __atgSiteText(102);
const tag = [room.tier, ...(Array.isArray(room.tags) ? room.tags : [])].filter(Boolean).join(__atgSiteText(103)) || __atgSiteText(104);
const canEnter = Boolean(room.canEnter);
const reasons = Array.isArray(room.reasons) ? room.reasons.slice(0, 4) : [];
return __atgSiteTpl(5,escapeHtml(room.number || room.roomId || __atgSiteText(105)),escapeHtml(tag),rank.toFixed(0),burst.toFixed(0),rank.toFixed(1),burst.toFixed(1),rank.toFixed(0),formatRate(room.rate),formatNumber(room.bet),statusClass,escapeHtml(room.statusLabel || room.status || __atgSiteText(106)),formatPointRange(room),formatPointValue(room.pointAvgPerTurn),escapeHtml(room.pointSource || __atgSiteText(107)),formatTurns(room.pointRemainingTurns),escapeHtml(room.pointStatus || __atgSiteText(108)),formatNullablePercent(room.pointConfidence),formatNullableRate(room.todayRate),formatNullableRate(room.hourRate),formatNullableRate(room.dayRate),formatTurns(room.notOpenTurns),formatTurns(room.previousOneTurns),formatTurns(room.previousTwoTurns),formatTurns(room.freeGameTargetTurn),formatTurnWindow(room),formatRemainingWindow(room),escapeHtml(room.freeGameForecastZone || __atgSiteText(109)),formatNullablePercent(room.freeGameForecastConfidence),formatNullablePercent(room.momentumScore),formatNullablePercent(room.cyclePressure),formatNullablePercent(room.pullbackRisk),formatNullablePercent(room.pointReadiness),formatPointValue(room.pointSampleShortfall),formatPointValue(room.pointSampleTarget),reasons.length ? __atgSiteTpl(4,reasons.map((reason) => __atgSiteTpl(3,escapeHtml(reason))).join(__atgSiteText(110))) : __atgSiteText(111),escapeHtml(room.roomId || __atgSiteText(112)),escapeHtml(room.number || __atgSiteText(113)),canEnter ? __atgSiteText(114) : __atgSiteText(115));
}
function number(value) {
const parsed = Number(value);
return Number.isFinite(parsed) ? parsed : 0;
}
function clamp(value, min, max) {
return Math.min(max, Math.max(min, value));
}
function formatRate(value) {
return __atgSiteTpl(6,number(value).toFixed(2));
}
function formatNullableRate(value) {
return value == null ? __atgSiteText(116) : formatRate(value);
}
function formatNullablePercent(value) {
return value == null ? __atgSiteText(117) : __atgSiteTpl(7,clamp(number(value), 0, 100).toFixed(0));
}
function formatNumber(value) {
return new Intl.NumberFormat(__atgSiteText(118), { maximumFractionDigits: 2 }).format(number(value));
}
function formatTurns(value) {
return value == null ? __atgSiteText(119) : __atgSiteTpl(8,Math.round(number(value)));
}
function formatTurnWindow(room) {
if (room.freeGameWindowStart == null || room.freeGameWindowEnd == null) return __atgSiteText(120);
return __atgSiteTpl(9,Math.round(number(room.freeGameWindowStart)),Math.round(number(room.freeGameWindowEnd)));
}
function formatRemainingWindow(room) {
if (room.freeGameRemainingStart == null || room.freeGameRemainingEnd == null) return __atgSiteText(121);
const start = Math.round(number(room.freeGameRemainingStart));
const end = Math.round(number(room.freeGameRemainingEnd));
if (end <= 0) return __atgSiteText(122);
if (start === end) return __atgSiteTpl(10,end);
return __atgSiteTpl(11,start,end);
}
function formatPointValue(value) {
if (value == null) return __atgSiteText(123);
const points = Math.max(0, number(value));
if (points <= 0) return __atgSiteText(124);
return formatNumber(Math.round(points));
}
function formatPointRange(room) {
if (room.pointEstimated == null && room.pointMin == null && room.pointMax == null) return __atgSiteText(125);
const min = Math.max(0, Math.round(number(room.pointMin == null ? room.pointEstimated : room.pointMin)));
const max = Math.max(min, Math.round(number(room.pointMax == null ? room.pointEstimated : room.pointMax)));
if (max <= 0) return __atgSiteText(126);
if (min === max) return formatPointValue(max);
return __atgSiteTpl(12,formatPointValue(min),formatPointValue(max));
}
function escapeHtml(value) {
return String(value)
.replace(/&/g, __atgSiteText(127))
.replace(/</g, __atgSiteText(128))
.replace(/>/g, __atgSiteText(129))
.replace(/"/g, __atgSiteText(130))
.replace(/'/g, __atgSiteText(131));
}
