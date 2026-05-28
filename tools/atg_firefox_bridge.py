# -*- coding: utf-8 -*-
"""
黑曜智流 AI - ATG Firefox 即時橋接器

需求：
  py -m pip install selenium

可選雲端推送：
  set ATG_SUPABASE_URL=https://xxxx.supabase.co
  set ATG_SUPABASE_SERVICE_ROLE_KEY=你的 service role key

啟動後會提供：
  http://127.0.0.1:8765/health
  http://127.0.0.1:8765/snapshot
  http://127.0.0.1:8765/events
"""
from __future__ import annotations

import json
import os
import queue
import re
import sys
import threading
import time
import traceback
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib import request

HOME_URL = "https://88bwin.net/"
LOBBY_URL = os.getenv(
    "ATG_LOBBY_URL",
    "https://play.godeebxp.com/egames/lobby/game/?t=cf40958c33634704a2bd69852a1f4e70&l=zh-tw&socket_url=socket.godeebxp.com&ts=1779963499345",
)
USERNAME = os.getenv("ATG_USERNAME", "dgsa8116")
PASSWORD = os.getenv("ATG_PASSWORD", "157899")
BRIDGE_HOST = os.getenv("ATG_BRIDGE_HOST", "127.0.0.1")
BRIDGE_PORT = int(os.getenv("ATG_BRIDGE_PORT", "8765"))
BRIDGE_PORT_CANDIDATES = [
    BRIDGE_PORT,
    18765,
    28765,
    38765,
    48765,
]
POLL_SECONDS = float(os.getenv("ATG_POLL_SECONDS", "3"))
SNAPSHOT_FILE = Path.home() / "Desktop" / "atg_live_snapshot.json"

SUPABASE_URL = os.getenv("ATG_SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("ATG_SUPABASE_SERVICE_ROLE_KEY", "")

ALL_GAME_ROOMS = [
    {
        "key": "atg-golden-seth-2",
        "name": "ATG賽特2",
        "url": "https://play.godeebxp.com/egames/cc497f08a3f9943e8d426d034df6261a1330fd17/game/?t=6c3b8cb633384672a214c4d56ff6ea7f&gn=golden-seth&l=zh-tw&ct=slot&gt=slot-erase-any-times-2&socket_url=socket.godeebxp.com&client_type=web&p=atg&view_mode=landscape&goback_url=https%3A%2F%2Fplay.godeebxp.com%2Fegames%2Flobby%2Fgame%2F%3Ft%3Dafad92742be6492d9ab26854cc0bc5ff%26l%3Dzh-tw%26socket_url%3Dsocket.godeebxp.com%26ts%3D1779959164838",
    },
    {
        "key": "atg-hades",
        "name": "ATG古神巴風特",
        "url": "https://play.godeebxp.com/egames/18b8d1f50e1d0e7178e077fd53760d01ec6b93a7/game/?t=bf0196599a15443b995d07d6c72a1107&gn=hades&l=zh-tw&ct=slot&gt=slot-erase-cluster-times-1&socket_url=socket.godeebxp.com&client_type=web&p=atg&view_mode=landscape&goback_url=https%3A%2F%2Fplay.godeebxp.com%2Fegames%2Flobby%2Fgame%2F%3Ft%3D17bdd47f26f14e41b3439561589c4cc2%26l%3Dzh-tw%26socket_url%3Dsocket.godeebxp.com%26ts%3D1779959227334",
    },
    {
        "key": "atg-egyptian-mythology",
        "name": "賽特",
        "url": "https://play.godeebxp.com/egames/66935c339da4972b6411b5a41200f9134b4bfab6/game/?t=f1894416adf64ba59ac9b0fa19dae1ee&gn=egyptian-mythology&l=zh-tw&ct=slot&gt=slot-erase-any-times-1&socket_url=socket.godeebxp.com&client_type=web&p=atg&view_mode=landscape&goback_url=https%3A%2F%2Fplay.godeebxp.com%2Fegames%2Flobby%2Fgame%2F%3Ft%3D12017423a0c64ca18cebe6c02fd4d013%26l%3Dzh-tw%26socket_url%3Dsocket.godeebxp.com%26ts%3D1779959283537",
    },
]
ACTIVE_ROOM_KEYS = {
    key.strip()
    for key in os.getenv("ATG_ACTIVE_ROOMS", "atg-hades").split(",")
    if key.strip()
}
GAME_ROOMS = [room for room in ALL_GAME_ROOMS if room["key"] in ACTIVE_ROOM_KEYS]
if not GAME_ROOMS:
    GAME_ROOMS = [room for room in ALL_GAME_ROOMS if room["key"] == "atg-hades"]

snapshot_lock = threading.Lock()
client_lock = threading.Lock()
sse_clients: list[queue.Queue[dict[str, Any]]] = []
snapshot: dict[str, Any] = {
    "ok": False,
    "rooms": [],
    "clients": 0,
    "updated_at": None,
    "message": "橋接器初始化中。",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def client_count() -> int:
    with client_lock:
        return len(sse_clients)


def write_snapshot_file(payload: dict[str, Any]) -> None:
    try:
        SNAPSHOT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    except OSError:
        pass


def publish(payload: dict[str, Any]) -> None:
    global snapshot
    payload = {
        **payload,
        "clients": client_count(),
        "updated_at": payload.get("updated_at") or utc_now(),
    }
    with snapshot_lock:
        snapshot = payload
    write_snapshot_file(payload)

    with client_lock:
        clients = list(sse_clients)
    for item in clients:
        try:
            item.put_nowait(payload)
        except queue.Full:
            pass


def current_snapshot() -> dict[str, Any]:
    with snapshot_lock:
        return dict(snapshot)


class BridgeHandler(BaseHTTPRequestHandler):
    server_version = "ObsidianATGBridge/1.0"

    def log_message(self, *_: Any) -> None:
        return

    def _cors(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-store")

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self) -> None:
        if self.path.startswith("/health"):
            self._send_json({"ok": True, "clients": client_count(), "updated_at": utc_now()})
            return
        if self.path.startswith("/snapshot"):
            self._send_json(current_snapshot())
            return
        if self.path.startswith("/events"):
            self._events()
            return
        self.send_response(404)
        self._cors()
        self.end_headers()

    def _send_json(self, payload: dict[str, Any]) -> None:
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def _events(self) -> None:
        stream: queue.Queue[dict[str, Any]] = queue.Queue(maxsize=10)
        with client_lock:
            sse_clients.append(stream)
        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Connection", "keep-alive")
        self.end_headers()
        try:
            stream.put_nowait(current_snapshot())
            while True:
                try:
                    payload = stream.get(timeout=15)
                    raw = f"data: {json.dumps(payload, ensure_ascii=False)}\n\n".encode("utf-8")
                except queue.Empty:
                    raw = b": heartbeat\n\n"
                self.wfile.write(raw)
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, OSError):
            pass
        finally:
            with client_lock:
                if stream in sse_clients:
                    sse_clients.remove(stream)


class ReusableThreadingHTTPServer(ThreadingHTTPServer):
    allow_reuse_address = True


def start_bridge_server() -> ThreadingHTTPServer:
    last_error: Exception | None = None
    tried: list[int] = []
    for port in dict.fromkeys(BRIDGE_PORT_CANDIDATES):
        tried.append(port)
        try:
            server = ReusableThreadingHTTPServer((BRIDGE_HOST, port), BridgeHandler)
        except OSError as exc:
            last_error = exc
            print(f"Port {port} 無法使用，改試下一個。原因：{exc}")
            continue

        globals()["BRIDGE_PORT"] = port
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        url = f"http://{BRIDGE_HOST}:{port}"
        publish({"ok": True, "rooms": [], "message": f"本機橋接服務已啟動： {url}", "bridge_url": url})
        print(f"本機橋接服務已啟動： {url}")
        return server

    raise RuntimeError(f"無法啟動本機橋接服務，已嘗試 ports：{tried}。最後錯誤：{last_error}")


def install_hint() -> None:
    print("缺少 selenium。請先執行：")
    print("  py -m pip install selenium")
    print("Firefox 需要已安裝在本機，Selenium 4 會自動處理 geckodriver。")


def visible_click_js(driver: Any, text: str, prefer_last: bool = True) -> bool:
    return bool(driver.execute_script(
        """
        const text = arguments[0];
        const preferLast = arguments[1];
        const nodes = [...document.querySelectorAll('button,.v-btn,[role="button"],a')];
        const visible = nodes.filter((el) => {
          const label = (el.innerText || el.textContent || '').replace(/\\s+/g, '').trim();
          const box = el.getBoundingClientRect();
          const css = getComputedStyle(el);
          return label.includes(text) && box.width > 0 && box.height > 0 && css.display !== 'none' && css.visibility !== 'hidden';
        });
        const el = preferLast ? visible[visible.length - 1] : visible[0];
        if (!el) return false;
        el.scrollIntoView({ block: 'center', inline: 'center' });
        el.click();
        return true;
        """,
        text,
        prefer_last,
    ))


def set_zoom_100(driver: Any) -> None:
    try:
        from selenium.webdriver.common.action_chains import ActionChains
        from selenium.webdriver.common.keys import Keys

        ActionChains(driver).key_down(Keys.CONTROL).send_keys("0").key_up(Keys.CONTROL).perform()
    except Exception:
        pass
    try:
        driver.execute_script("document.body.style.zoom = '100%';")
    except Exception:
        pass


def wait_for_document(driver: Any, timeout: float = 20) -> None:
    end = time.time() + timeout
    while time.time() < end:
        try:
            if driver.execute_script("return document.readyState") in {"interactive", "complete"}:
                return
        except Exception:
            pass
        time.sleep(0.25)


def fill_login_form(driver: Any) -> None:
    from selenium.webdriver.common.by import By
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC

    wait = WebDriverWait(driver, 25)
    username = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text'][autocomplete='new-password'], input[type='text']")))
    password = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password'][autocomplete='new-password'], input[type='password']")))

    for element, value in ((username, USERNAME), (password, PASSWORD)):
        element.click()
        element.send_keys(Keys.CONTROL, "a")
        element.send_keys(value)


def wait_for_login_form_ready(driver: Any, timeout: float = 18) -> bool:
    end = time.time() + timeout
    while time.time() < end:
        try:
            ready = bool(driver.execute_script(
                """
                const text = document.body ? document.body.innerText : '';
                const hasUser = Boolean(document.querySelector("input[type='text'][autocomplete='new-password'], input[type='text']"));
                const hasPassword = Boolean(document.querySelector("input[type='password'][autocomplete='new-password'], input[type='password']"));
                const hasSubmit = [...document.querySelectorAll('button,.v-btn,[role="button"]')]
                  .some((el) => (el.innerText || el.textContent || '').replace(/\\s+/g, '').includes('登入'));
                const busy = /載入中|loading/i.test(text);
                return hasUser && hasPassword && hasSubmit && !busy;
                """
            ))
            if ready:
                return True
        except Exception:
            pass
        time.sleep(0.35)
    return False


def visible_text(driver: Any) -> str:
    try:
        return str(driver.execute_script("return document.body ? document.body.innerText : '';") or "")
    except Exception:
        return ""


def has_token_error(driver: Any) -> bool:
    text = visible_text(driver)
    return "找不到 Token 資料" in text or "找不到Token資料" in text or "verify-login" in text


def click_confirm_dialog(driver: Any) -> bool:
    return bool(driver.execute_script(
        """
        const labels = ['確定', '確認', 'OK', '知道了'];
        const nodes = [...document.querySelectorAll('button,.v-btn,[role="button"],a')];
        for (const label of labels) {
          const found = nodes.filter((el) => {
            const text = (el.innerText || el.textContent || '').replace(/\\s+/g, '').trim();
            const box = el.getBoundingClientRect();
            const css = getComputedStyle(el);
            return text.includes(label) && box.width > 0 && box.height > 0 && css.display !== 'none' && css.visibility !== 'hidden';
          });
          const el = found[found.length - 1];
          if (el) {
            el.scrollIntoView({ block: 'center', inline: 'center' });
            el.click();
            return true;
          }
        }
        return false;
        """
    ))


def wait_for_login_token_stable(driver: Any, timeout: float = 8) -> dict[str, Any]:
    end = time.time() + timeout
    state: dict[str, Any] = {"ready": False, "tokenHints": [], "storageOk": False}
    while time.time() < end:
        try:
            state = dict(driver.execute_script(
                """
                const tokenHints = [];
                const scan = (store, prefix) => {
                  try {
                    for (let i = 0; i < store.length; i += 1) {
                      const key = store.key(i);
                      const value = String(store.getItem(key) || '');
                      if (/token|verify|captcha|login/i.test(key + ' ' + value)) tokenHints.push(prefix + ':' + key);
                    }
                  } catch (error) {}
                };
                scan(window.localStorage, 'local');
                scan(window.sessionStorage, 'session');
                const text = document.body ? document.body.innerText : '';
                const storageOk = (() => {
                  try {
                    sessionStorage.setItem('__atg_probe', '1');
                    sessionStorage.removeItem('__atg_probe');
                    return true;
                  } catch (error) {
                    return false;
                  }
                })();
                return {
                  ready: storageOk && !text.includes('找不到 Token 資料') && !text.includes('找不到Token資料'),
                  tokenHints,
                  storageOk
                };
                """
            ))
            if state.get("ready") and (state.get("tokenHints") or time.time() > end - 3):
                return state
        except Exception:
            pass
        time.sleep(0.5)
    return state


def wait_for_lobby_token(driver: Any, timeout: float = 45) -> dict[str, Any]:
    end = time.time() + timeout
    state: dict[str, Any] = {
        "ready": False,
        "token": "",
        "tokenHints": [],
        "url": "",
        "reason": "等待 lobby token。",
    }
    while time.time() < end:
        try:
            state = dict(driver.execute_script(
                """
                const tokenHints = [];
                const scan = (store, prefix) => {
                  try {
                    for (let i = 0; i < store.length; i += 1) {
                      const key = store.key(i);
                      const value = String(store.getItem(key) || '');
                      if (/token|verify|login|game|auth|session/i.test(key + ' ' + value)) {
                        tokenHints.push(prefix + ':' + key);
                      }
                    }
                  } catch (error) {}
                };
                scan(window.localStorage, 'local');
                scan(window.sessionStorage, 'session');
                const url = new URL(location.href);
                const token = url.searchParams.get('t') || '';
                const text = document.body ? document.body.innerText : '';
                const hasBlockingError = text.includes('找不到 Token 資料') || text.includes('找不到Token資料') || /verify-login/i.test(text);
                const isLoading = /載入中|loading/i.test(text);
                const canvasReady = document.querySelectorAll('canvas').length > 0;
                const bodyReady = text.length > 20 || canvasReady;
                return {
                  ready: Boolean(token) && bodyReady && !hasBlockingError && !isLoading,
                  token,
                  tokenHints,
                  url: location.href,
                  reason: hasBlockingError ? 'lobby 顯示 Token 錯誤' : (isLoading ? 'lobby 尚在載入' : 'lobby 等待內容初始化'),
                  canvasReady,
                  textLength: text.length
                };
                """
            ))
            if state.get("ready"):
                return state
            if has_token_error(driver):
                click_confirm_dialog(driver)
        except Exception as exc:
            state["reason"] = str(exc)
        time.sleep(0.75)
    return state


def prepare_lobby_token(driver: Any) -> dict[str, Any]:
    publish({"ok": True, "rooms": [], "message": "登入後先開啟 ATG lobby，等待 Token 初始化。"})
    driver.get(LOBBY_URL)
    wait_for_document(driver, timeout=25)
    set_zoom_100(driver)
    time.sleep(2)
    close_blocking_popups(driver, seconds=4)
    token_state = wait_for_lobby_token(driver, timeout=45)
    if not token_state.get("ready"):
        publish({
            "ok": False,
            "rooms": [],
            "message": f"lobby Token 尚未就緒：{token_state.get('reason')}",
            "tokenState": token_state,
            "updated_at": utc_now(),
        })
        raise RuntimeError(f"lobby Token 尚未就緒：{token_state.get('reason')}")
    publish({
        "ok": True,
        "rooms": [],
        "message": f"lobby Token 已就緒，準備開啟遊戲分頁。Token 前 6 碼：{str(token_state.get('token', ''))[:6]}...",
        "tokenState": token_state,
        "updated_at": utc_now(),
    })
    return token_state


def close_blocking_popups(driver: Any, seconds: float = 10) -> int:
    end = time.time() + seconds
    clicked = 0
    selectors = [
        "button.close.mdi-close-circle",
        "button.announcementCloseBtn",
        "button[data-dd-action-name='重要公告-關閉']",
        ".UiAnnouncement button .mdi-close",
        "button .mdi-close-circle",
        ".mdi-close-circle",
    ]
    while time.time() < end:
        did_click = bool(driver.execute_script(
            """
            const selectors = arguments[0];
            for (const selector of selectors) {
              const nodes = [...document.querySelectorAll(selector)];
              for (const node of nodes) {
                const target = node.closest('button') || node;
                const box = target.getBoundingClientRect();
                const css = getComputedStyle(target);
                if (box.width > 0 && box.height > 0 && css.display !== 'none' && css.visibility !== 'hidden') {
                  target.click();
                  return true;
                }
              }
            }
            return false;
            """,
            selectors,
        ))
        if not did_click:
            time.sleep(0.4)
            continue
        clicked += 1
        time.sleep(0.8)
    return clicked


def login(driver: Any) -> None:
    publish({"ok": True, "rooms": [], "message": "正在開啟 88bwin 並準備登入。"})
    driver.set_window_size(1366, 768)
    last_error = ""

    for attempt in range(1, 4):
        publish({"ok": True, "rooms": [], "message": f"登入流程第 {attempt} 次嘗試，正在等待驗證 Token。"})
        driver.get(HOME_URL)
        wait_for_document(driver)
        set_zoom_100(driver)
        time.sleep(2.5 + attempt)
        close_blocking_popups(driver, seconds=1.5)
        click_confirm_dialog(driver)

        if not visible_click_js(driver, "登入", prefer_last=False):
            last_error = "找不到首頁登入按鈕。"
            publish({"ok": False, "rooms": [], "message": f"{last_error} 可能頁面改版或被阻擋。"})
            time.sleep(2)
            continue

        if not wait_for_login_form_ready(driver, timeout=20):
            last_error = "登入表單沒有完整載入。"
            publish({"ok": False, "rooms": [], "message": f"{last_error} 將重新整理後重試。"})
            continue

        token_state = wait_for_login_token_stable(driver, timeout=10)
        if not token_state.get("storageOk"):
            last_error = "Firefox 隱私視窗無法寫入登入驗證資料。"
            publish({"ok": False, "rooms": [], "message": f"{last_error} 已調整 profile 儲存設定並重試。"})
            continue

        fill_login_form(driver)
        time.sleep(1.2)
        if not visible_click_js(driver, "登入", prefer_last=True):
            raise RuntimeError("找不到登入送出按鈕。")

        time.sleep(2.5)
        if has_token_error(driver):
            last_error = "來源站回報找不到 Token 資料。"
            click_confirm_dialog(driver)
            publish({
                "ok": False,
                "rooms": [],
                "message": f"{last_error} 已按確定並等待重新產生 Token 後重試。",
                "tokenHints": token_state.get("tokenHints", []),
            })
            time.sleep(3 + attempt * 2)
            continue

        publish({"ok": True, "rooms": [], "message": "登入已送出，正在關閉彈窗。"})
        time.sleep(5)
        closed = close_blocking_popups(driver, seconds=12)
        if has_token_error(driver):
            last_error = "關閉彈窗後仍偵測到 Token 錯誤。"
            click_confirm_dialog(driver)
            continue
        publish({"ok": True, "rooms": [], "message": f"登入流程完成，已嘗試關閉 {closed} 個彈窗。"})
        return

    raise RuntimeError(f"登入失敗：{last_error or '無法取得登入 Token'}")


def open_game_tabs(driver: Any) -> dict[str, str]:
    handles: dict[str, str] = {}
    for room in GAME_ROOMS:
        publish({"ok": True, "rooms": [], "message": f"正在開啟遊戲分頁：{room['name']}"})
        driver.execute_script("window.open(arguments[0], '_blank');", room["url"])
        time.sleep(1.5)
        handle = driver.window_handles[-1]
        handles[room["key"]] = handle
        driver.switch_to.window(handle)
        wait_for_document(driver, timeout=18)
        set_zoom_100(driver)
        close_blocking_popups(driver, seconds=1.5)
    return handles


def parse_number(value: str | None) -> float:
    if not value:
        return 0.0
    match = re.search(r"-?\d[\d,]*(?:\.\d+)?", value)
    if not match:
        return 0.0
    return float(match.group(0).replace(",", ""))


def extract_metrics_from_text(text: str) -> dict[str, Any]:
    percentages = re.findall(r"\d+(?:\.\d+)?\s*%", text)
    numbers = re.findall(r"\d[\d,]*(?:\.\d+)?", text)
    large_numbers = sorted((parse_number(item) for item in numbers), reverse=True)
    rate = parse_number(percentages[0]) if percentages else 0.0
    points = int(large_numbers[0]) if large_numbers else 0
    return {
        "rate": rate,
        "hour": percentages[0] if len(percentages) > 0 else "觀測中",
        "month": percentages[1] if len(percentages) > 1 else "觀測中",
        "points": f"{points:,}" if points else "觀測中",
        "freeGame": "偵測到" if re.search(r"免費|free\\s*game|bonus", text, re.I) else "觀測中",
        "openTurns": numbers[0] if len(numbers) > 0 else "觀測中",
        "previous": numbers[1] if len(numbers) > 1 else "0",
        "previous2": numbers[2] if len(numbers) > 2 else "0",
        "sample": min(max(len(numbers), 20), 130),
    }


def extract_room(driver: Any, room: dict[str, str], handle: str) -> dict[str, Any]:
    driver.switch_to.window(handle)
    close_blocking_popups(driver, seconds=1.2)
    raw = driver.execute_script(
        """
        const text = document.body ? document.body.innerText : '';
        return {
          title: document.title || '',
          url: location.href,
          readyState: document.readyState,
          text: text.slice(0, 5000),
          textLength: text.length,
          canvasCount: document.querySelectorAll('canvas').length,
          popupVisible: Boolean(document.querySelector('img.adImage,.UiAnnouncement,.v-dialog--active')),
          inputCount: document.querySelectorAll('input').length
        };
        """
    )
    text = raw.get("text") or ""
    guard: list[str] = []
    if raw.get("readyState") != "complete":
        guard.append("頁面尚未完整載入")
    if raw.get("popupVisible"):
        guard.append("仍偵測到彈窗，已嘗試關閉")
    if len(text) < 40:
        guard.append("房間文字資料不足，可能仍在載入或 Canvas 未暴露 DOM")
    if re.search(r"驗證碼|captcha|robot|人機", text, re.I):
        guard.append("偵測到驗證流程，需要人工處理")
    if "登入" in text and raw.get("inputCount", 0) >= 2:
        guard.append("可能已登出或 Session 失效")

    metrics = extract_metrics_from_text(text)
    status = "正常" if not guard else "防呆"
    return {
        "key": room["key"],
        "room": room["name"],
        "room_name": room["name"],
        "type": "ATG 即時",
        "status": status,
        "score": metrics["rate"],
        "metrics": metrics,
        "guard": {"ok": not guard, "message": "；".join(guard) if guard else "資料讀取正常"},
        "message": "；".join(guard) if guard else "資料讀取正常",
        "title": raw.get("title", ""),
        "url": raw.get("url", room["url"]),
        "canvasCount": raw.get("canvasCount", 0),
        "textLength": raw.get("textLength", 0),
        "textSample": text[:500],
        "timestamp": utc_now(),
    }


def push_to_supabase(rooms: list[dict[str, Any]]) -> None:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return
    rows = [
        {
            "room_key": room["key"],
            "room_name": room["room_name"],
            "provider": "ATG",
            "game_url": room.get("url"),
            "status": room.get("status", "waiting"),
            "score": room.get("score") or 0,
            "data": room,
            "updated_at": room.get("timestamp") or utc_now(),
        }
        for room in rooms
    ]
    body = json.dumps(rows, ensure_ascii=False).encode("utf-8")
    req = request.Request(
        f"{SUPABASE_URL}/rest/v1/atg_room_snapshots?on_conflict=room_key",
        data=body,
        method="POST",
        headers={
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
    )
    try:
        request.urlopen(req, timeout=8).read()
    except Exception as exc:
        publish({
            "ok": False,
            "rooms": rooms,
            "message": f"本機資料已更新，但 Supabase 推送失敗：{exc}",
            "updated_at": utc_now(),
        })


def run_browser_bridge() -> None:
    try:
        from selenium import webdriver
        from selenium.webdriver.firefox.options import Options
    except ImportError:
        install_hint()
        publish({"ok": False, "rooms": [], "message": "缺少 selenium，無法啟動 Firefox。"})
        return

    options = Options()
    options.add_argument("-private")
    options.set_preference("layout.css.devPixelsPerPx", "1.0")
    options.set_preference("browser.privatebrowsing.autostart", True)
    # Private mode can block the site's short-lived login token storage.
    # Keep the private window, but allow first-party cookies/storage for the automation profile.
    options.set_preference("privacy.trackingprotection.enabled", False)
    options.set_preference("privacy.trackingprotection.pbmode.enabled", False)
    options.set_preference("network.cookie.cookieBehavior", 0)
    options.set_preference("dom.storage.enabled", True)
    options.set_preference("dom.indexedDB.enabled", True)

    driver = webdriver.Firefox(options=options)
    try:
        login(driver)
        prepare_lobby_token(driver)
        handles = open_game_tabs(driver)
        publish({"ok": True, "rooms": [], "message": f"{len(GAME_ROOMS)} 個 ATG 房間分頁已開啟，開始讀取資料。"})
        while True:
            rooms: list[dict[str, Any]] = []
            for room in GAME_ROOMS:
                try:
                    rooms.append(extract_room(driver, room, handles[room["key"]]))
                except Exception as exc:
                    rooms.append({
                        "key": room["key"],
                        "room": room["name"],
                        "room_name": room["name"],
                        "type": "ATG 即時",
                        "status": "防呆",
                        "score": 0,
                        "metrics": {"rate": 0, "hour": "錯誤", "month": "錯誤", "points": "錯誤", "freeGame": "錯誤", "openTurns": "錯誤", "previous": "0", "previous2": "0", "sample": 20},
                        "guard": {"ok": False, "message": str(exc)},
                        "message": str(exc),
                        "url": room["url"],
                        "timestamp": utc_now(),
                    })
            payload = {
                "ok": True,
                "rooms": rooms,
                "message": "ATG 房間資料已更新。",
                "updated_at": utc_now(),
            }
            publish(payload)
            push_to_supabase(rooms)
            time.sleep(POLL_SECONDS)
    except KeyboardInterrupt:
        raise
    except Exception as exc:
        publish({
            "ok": False,
            "rooms": [],
            "message": f"橋接器發生錯誤：{exc}",
            "trace": traceback.format_exc(),
            "updated_at": utc_now(),
        })
        raise


def main() -> int:
    print(f"啟動本機資料橋接，port 候選： {BRIDGE_PORT_CANDIDATES}")
    print(f"即時快照會寫入： {SNAPSHOT_FILE}")
    print("按 Ctrl+C 可停止。")
    server = start_bridge_server()
    try:
        run_browser_bridge()
    except KeyboardInterrupt:
        print("\n已停止。")
    finally:
        server.shutdown()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
