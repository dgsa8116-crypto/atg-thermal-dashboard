# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import queue
import sys
import threading
import time
import tkinter as tk
from collections import deque
from dataclasses import dataclass, field
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from tkinter import messagebox, ttk
from typing import Any


APP_NAME = "ATG惡魔"
BRIDGE_PORT = 18765


EVENTS = {
    "REQ_PAGE": "SlotFrameworkEvent:SEND_GET_SLOT_TABLE_PAGE_DATA_REQUEST",
    "REQ_DETAIL": "SlotFrameworkEvent:SEND_GET_SLOT_TABLE_DETAIL_REQUEST",
    "PAGE_RESPONSE": "SlotFrameworkEvent:SLOT_TABLE_PAGE_DATA_RESPONSE",
    "TABLES_RESPONSE": "SlotFrameworkEvent:SLOT_TABLES_RESPONSE",
    "DETAIL_RESPONSE": "SlotFrameworkEvent:SLOT_TABLE_RESPONSE",
    "UPDATED_RESPONSE": "SlotFrameworkEvent:SLOT_TABLES_UPDATED_RESPONSE",
}


DEFAULT_SETTINGS = {
    "min_rate": 120.0,
    "min_bet": 0.0,
    "max_pages": 10,
    "only_empty": True,
    "limit": 50,
    "request_gap_ms": 500,
}


STATUS_LABELS = {
    "Empty": "空房",
    "Full": "已滿",
    "Locked": "鎖定",
    "Close": "關閉",
}


def to_float(value: Any, default: float = 0.0) -> float:
    if value is None or value == "":
        return default
    if isinstance(value, (int, float)):
        return float(value) if value == value else default
    try:
        return float(str(value).replace(",", "").replace("%", "").strip())
    except (TypeError, ValueError):
        return default


def to_int(value: Any, default: int = 0) -> int:
    try:
        return int(to_float(value, default))
    except (TypeError, ValueError):
        return default


def rate_from_pair(win: Any, bet: Any) -> tuple[float | None, float, float]:
    win_value = to_float(win)
    bet_value = to_float(bet)
    if bet_value <= 0:
        return None, win_value, bet_value
    return (win_value / bet_value) * 100, win_value, bet_value


def table_rate(table: dict[str, Any]) -> tuple[float, float, float, str]:
    today = table.get("today") if isinstance(table.get("today"), dict) else {}
    today_rate, today_win, today_bet = rate_from_pair(today.get("win"), today.get("bet"))
    if today_rate is not None:
        return today_rate, today_win, today_bet, "today"

    fallback_rate, win, bet = rate_from_pair(table.get("win"), table.get("bet"))
    return fallback_rate or 0.0, win, bet, "list"


@dataclass
class Room:
    room_id: str
    number: str
    status: str = ""
    page: int | None = None
    rate: float = 0.0
    bet: float = 0.0
    win: float = 0.0
    rate_source: str = "list"
    today_rate: float | None = None
    today_bet: float | None = None
    hour_rate: float | None = None
    hour_bet: float | None = None
    day_rate: float | None = None
    day_bet: float | None = None
    updated_at: float = field(default_factory=time.time)
    raw: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_table(cls, table: dict[str, Any], page: int | None = None) -> "Room":
        room_id = str(table.get("roomId", "")).strip()
        number = str(table.get("number", room_id)).strip()
        if number.isdigit():
            number = number.zfill(3)

        rate, win, bet, source = table_rate(table)
        return cls(
            room_id=room_id,
            number=number or room_id,
            status=str(table.get("status", "")),
            page=page,
            rate=rate,
            bet=bet,
            win=win,
            rate_source=source,
            raw=table,
        )

    def merge_detail(self, detail: dict[str, Any]) -> None:
        today_rate, _, today_bet = rate_from_pair(detail.get("todayWin"), detail.get("todayBet"))
        hour_rate, _, hour_bet = rate_from_pair(detail.get("hourWin"), detail.get("hourBet"))
        day_rate, _, day_bet = rate_from_pair(detail.get("dayWin"), detail.get("dayBet"))

        self.today_rate = today_rate
        self.today_bet = today_bet
        self.hour_rate = hour_rate
        self.hour_bet = hour_bet
        self.day_rate = day_rate
        self.day_bet = day_bet
        self.updated_at = time.time()

        if today_rate is not None:
            self.rate = today_rate
            self.bet = today_bet
            self.rate_source = "detail_today"


class RoomStore:
    def __init__(self) -> None:
        self.rooms: dict[str, Room] = {}
        self.lock = threading.RLock()
        self.commands: deque[dict[str, Any]] = deque()
        self.settings = DEFAULT_SETTINGS.copy()
        self.status = "等待瀏覽器注入碼連線"
        self.bridge_connected = False
        self.last_meta: dict[str, Any] = {}
        self.gui_events: queue.Queue[str] = queue.Queue()

    def queue_command(self, command: dict[str, Any]) -> None:
        with self.lock:
            self.commands.append(command)

    def pop_commands(self) -> list[dict[str, Any]]:
        with self.lock:
            commands = list(self.commands)
            self.commands.clear()
            return commands

    def update_settings(self, **updates: Any) -> None:
        with self.lock:
            self.settings.update(updates)

    def process_event(self, event: dict[str, Any]) -> None:
        event_type = event.get("type")
        payload = event.get("payload") or {}

        with self.lock:
            if event_type == "connected":
                self.bridge_connected = True
                self.status = "已連上遊戲頁"
            elif event_type == "status":
                self.status = str(payload.get("message") or self.status)
            elif event_type == "error":
                self.status = "錯誤：" + str(payload.get("message") or "未知錯誤")
            elif event_type == "rooms":
                self._process_rooms(payload)
            elif event_type == "detail":
                self._process_detail(payload)
            elif event_type == "status_updates":
                self._process_status_updates(payload)
            self.gui_events.put("refresh")

    def _process_rooms(self, payload: dict[str, Any]) -> None:
        tables = payload.get("tables") if isinstance(payload.get("tables"), list) else []
        page = to_int(payload.get("page"), 0) or None
        meta = payload.get("tableMeta") if isinstance(payload.get("tableMeta"), dict) else {}
        if meta:
            self.last_meta = meta

        for table in tables:
            if not isinstance(table, dict):
                continue
            room = Room.from_table(table, page)
            if not room.room_id:
                continue
            previous = self.rooms.get(room.room_id)
            if previous:
                room.today_rate = previous.today_rate
                room.today_bet = previous.today_bet
                room.hour_rate = previous.hour_rate
                room.hour_bet = previous.hour_bet
                room.day_rate = previous.day_rate
                room.day_bet = previous.day_bet
            self.rooms[room.room_id] = room

        self.status = f"已讀取 {len(self.rooms)} 間房"

    def _process_detail(self, payload: dict[str, Any]) -> None:
        detail = payload.get("detail")
        if not isinstance(detail, dict):
            return

        room_id = str(
            payload.get("roomId")
            or payload.get("lastRequestedDetailRoomId")
            or detail.get("roomId")
            or ""
        ).strip()
        if not room_id:
            return

        room = self.rooms.get(room_id) or Room(room_id=room_id, number=room_id)
        room.merge_detail(detail)
        self.rooms[room_id] = room
        self.status = f"已更新 {room.number} 詳細資料"

    def _process_status_updates(self, payload: dict[str, Any]) -> None:
        updates = payload.get("updates") if isinstance(payload.get("updates"), dict) else payload
        if not isinstance(updates, dict):
            return
        for room_id, status in updates.items():
            room = self.rooms.get(str(room_id))
            if room:
                room.status = str(status)

    def filtered_rooms(self) -> list[Room]:
        with self.lock:
            rooms = list(self.rooms.values())
            settings = self.settings.copy()

        filtered = [
            room
            for room in rooms
            if room.rate >= settings["min_rate"]
            and room.bet >= settings["min_bet"]
            and (not settings["only_empty"] or room.status == "Empty")
        ]
        filtered.sort(key=lambda room: (-room.rate, -room.bet, to_float(room.number)))
        return filtered[: int(settings["limit"])]

    def clear(self) -> None:
        with self.lock:
            self.rooms.clear()
            self.status = "已清空"
            self.gui_events.put("refresh")


class BridgeHTTPServer(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, server_address: tuple[str, int], handler: type[BaseHTTPRequestHandler], store: RoomStore):
        super().__init__(server_address, handler)
        self.store = store


class BridgeHandler(BaseHTTPRequestHandler):
    server: BridgeHTTPServer

    def log_message(self, _format: str, *_args: Any) -> None:
        return

    def _send_json(self, data: dict[str, Any], status: int = 200) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self._send_json({"ok": True})

    def do_GET(self) -> None:
        if self.path.startswith("/commands"):
            self._send_json({"commands": self.server.store.pop_commands()})
            return
        if self.path.startswith("/health"):
            self._send_json({"ok": True, "app": APP_NAME})
            return
        self._send_json({"error": "not found"}, 404)

    def do_POST(self) -> None:
        if not self.path.startswith("/event"):
            self._send_json({"error": "not found"}, 404)
            return

        length = min(int(self.headers.get("Content-Length", "0") or 0), 2_000_000)
        raw = self.rfile.read(length)
        try:
            event = json.loads(raw.decode("utf-8"))
            if isinstance(event, dict):
                self.server.store.process_event(event)
                self._send_json({"ok": True})
                return
        except json.JSONDecodeError:
            pass
        self._send_json({"error": "bad json"}, 400)


def build_injection_script(port: int) -> str:
    endpoint = f"http://127.0.0.1:{port}"
    events_json = json.dumps(EVENTS, ensure_ascii=False)
    return f"""(() => {{
  'use strict';
  const ENDPOINT = {json.dumps(endpoint)};
  const EVENTS = {events_json};
  const state = window.__ATG_DEMON_BRIDGE__ || {{
    lastRequestedDetailRoomId: null,
    scanning: false
  }};

  if (window.__ATG_DEMON_BRIDGE__ && window.__ATG_DEMON_BRIDGE__.installed) {{
    post('status', {{ message: '注入碼已存在，橋接正常' }});
    return;
  }}

  function post(type, payload = {{}}) {{
    fetch(ENDPOINT + '/event', {{
      method: 'POST',
      mode: 'cors',
      headers: {{ 'Content-Type': 'application/json' }},
      body: JSON.stringify({{ type, payload, url: location.href, ts: Date.now() }})
    }}).catch(() => undefined);
  }}

  function normalizeName(eventName) {{
    if (typeof eventName === 'string') return eventName;
    if (eventName && typeof eventName.name === 'string') return eventName.name;
    if (eventName && typeof eventName.type === 'string') return eventName.type;
    return String(eventName);
  }}

  function unwrap(payload) {{
    if (!payload || typeof payload !== 'object') return {{}};
    return payload.data && typeof payload.data === 'object' ? payload.data : payload;
  }}

  function firstArray(...values) {{
    for (const value of values) {{
      if (Array.isArray(value)) return value;
    }}
    return [];
  }}

  function pageOf(payload, data) {{
    return (data.tableMeta && data.tableMeta.currentPage) ||
      (payload.tableMeta && payload.tableMeta.currentPage) ||
      payload.page ||
      null;
  }}

  function capture(eventName, payload) {{
    const name = normalizeName(eventName);
    if (name === EVENTS.REQ_DETAIL) {{
      state.lastRequestedDetailRoomId = payload && payload.roomId != null ? String(payload.roomId) : null;
      return;
    }}

    if (name === EVENTS.PAGE_RESPONSE || name === EVENTS.TABLES_RESPONSE) {{
      const data = unwrap(payload);
      const tables = firstArray(data.tables, payload && payload.tables, data.slotTables);
      post('rooms', {{
        tables,
        tableMeta: data.tableMeta || (payload && payload.tableMeta) || null,
        page: pageOf(payload || {{}}, data),
      }});
      return;
    }}

    if (name === EVENTS.DETAIL_RESPONSE) {{
      const data = unwrap(payload);
      post('detail', {{
        ...data,
        lastRequestedDetailRoomId: state.lastRequestedDetailRoomId
      }});
      return;
    }}

    if (name === EVENTS.UPDATED_RESPONSE) {{
      post('status_updates', {{ updates: payload || {{}} }});
    }}
  }}

  function patchDispatch() {{
    if (typeof window.dispatch !== 'function') return false;
    if (window.dispatch.__atgDemonPatched) return true;
    const original = window.dispatch;
    window.dispatch = function patchedDispatch(eventName, payload, ...rest) {{
      try {{ capture(eventName, payload); }} catch (error) {{ post('error', {{ message: String(error) }}); }}
      return original.call(this, eventName, payload, ...rest);
    }};
    window.dispatch.__atgDemonPatched = true;
    return true;
  }}

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function scan(maxPages, gapMs) {{
    if (!patchDispatch()) {{
      post('error', {{ message: '找不到遊戲 dispatch，請等遊戲載入完成再掃描' }});
      return;
    }}
    if (state.scanning) return;
    state.scanning = true;
    try {{
      for (let page = 1; page <= maxPages; page += 1) {{
        post('status', {{ message: `掃描第 ${{page}}/${{maxPages}} 頁...` }});
        window.dispatch(EVENTS.REQ_PAGE, {{ page }});
        await sleep(gapMs);
      }}
      post('status', {{ message: '掃描指令已送出，等待遊戲回傳資料' }});
    }} finally {{
      state.scanning = false;
    }}
  }}

  async function pollCommands() {{
    try {{
      const response = await fetch(ENDPOINT + '/commands', {{ mode: 'cors' }});
      const body = await response.json();
      for (const command of body.commands || []) {{
        if (command.type === 'scan') {{
          scan(Number(command.maxPages || 10), Number(command.gapMs || 500));
        }} else if (command.type === 'detail') {{
          patchDispatch();
          state.lastRequestedDetailRoomId = String(command.roomId);
          window.dispatch(EVENTS.REQ_DETAIL, {{ roomId: Number(command.roomId) || command.roomId }});
        }} else if (command.type === 'ping') {{
          post('status', {{ message: '橋接正常' }});
        }}
      }}
    }} catch (_) {{
      // Python app may not be open yet.
    }}
  }}

  window.__ATG_DEMON_BRIDGE__ = state;
  state.installed = true;
  state.post = post;
  patchDispatch();
  setInterval(patchDispatch, 750);
  setInterval(pollCommands, 700);
  post('connected', {{ message: 'ATG惡魔已連線' }});
}})();"""


def start_server(store: RoomStore, port: int = BRIDGE_PORT) -> BridgeHTTPServer:
    server = BridgeHTTPServer(("127.0.0.1", port), BridgeHandler, store)
    thread = threading.Thread(target=server.serve_forever, name="ATGBridgeServer", daemon=True)
    thread.start()
    return server


def rounded_rectangle(canvas: tk.Canvas, x1: int, y1: int, x2: int, y2: int, radius: int, **kwargs: Any) -> int:
    points = [
        x1 + radius, y1,
        x2 - radius, y1,
        x2, y1,
        x2, y1 + radius,
        x2, y2 - radius,
        x2, y2,
        x2 - radius, y2,
        x1 + radius, y2,
        x1, y2,
        x1, y2 - radius,
        x1, y1 + radius,
        x1, y1,
    ]
    return canvas.create_polygon(points, smooth=True, **kwargs)


class RoundedButton(tk.Canvas):
    def __init__(
        self,
        master: tk.Misc,
        text: str,
        command: Any,
        width: int = 128,
        height: int = 36,
        bg: str = "#9B7BFF",
        fg: str = "#FFFFFF",
        hover: str = "#855EFF",
    ) -> None:
        super().__init__(
            master,
            width=width,
            height=height,
            highlightthickness=0,
            bg=master.cget("bg"),
            cursor="hand2",
        )
        self.command = command
        self.normal_bg = bg
        self.hover_bg = hover
        self.fg = fg
        self.text = text
        self.width_value = width
        self.height_value = height
        self._draw(bg)
        self.bind("<Button-1>", lambda _event: self.command())
        self.bind("<Enter>", lambda _event: self._draw(self.hover_bg))
        self.bind("<Leave>", lambda _event: self._draw(self.normal_bg))

    def _draw(self, fill: str) -> None:
        self.delete("all")
        rounded_rectangle(self, 1, 1, self.width_value - 1, self.height_value - 1, 14, fill=fill, outline="")
        self.create_text(
            self.width_value // 2,
            self.height_value // 2,
            text=self.text,
            fill=self.fg,
            font=("Microsoft JhengHei UI", 10, "bold"),
        )


class AtgDemonApp:
    def __init__(self, root: tk.Tk, store: RoomStore, port: int = BRIDGE_PORT) -> None:
        self.root = root
        self.store = store
        self.port = port
        self.script = build_injection_script(port)
        self.min_rate = tk.StringVar(value=str(DEFAULT_SETTINGS["min_rate"]))
        self.min_bet = tk.StringVar(value=str(DEFAULT_SETTINGS["min_bet"]))
        self.max_pages = tk.StringVar(value=str(DEFAULT_SETTINGS["max_pages"]))
        self.limit = tk.StringVar(value=str(DEFAULT_SETTINGS["limit"]))
        self.only_empty = tk.BooleanVar(value=bool(DEFAULT_SETTINGS["only_empty"]))
        self.status_var = tk.StringVar(value=store.status)

        self._configure_root()
        self._build_ui()
        self._schedule_refresh()

    def _configure_root(self) -> None:
        self.root.title(APP_NAME)
        self.root.geometry("860x620")
        self.root.minsize(760, 560)
        self.root.configure(bg="#FFF7FB")

        style = ttk.Style()
        style.theme_use("clam")
        style.configure(
            "ATG.Treeview",
            background="#FFFFFF",
            fieldbackground="#FFFFFF",
            foreground="#3B3347",
            rowheight=31,
            borderwidth=0,
            font=("Microsoft JhengHei UI", 10),
        )
        style.configure(
            "ATG.Treeview.Heading",
            background="#F0E9FF",
            foreground="#5C4B77",
            font=("Microsoft JhengHei UI", 10, "bold"),
            borderwidth=0,
        )
        style.map("ATG.Treeview", background=[("selected", "#D8CCFF")])

    def _build_ui(self) -> None:
        outer = tk.Frame(self.root, bg="#FFF7FB")
        outer.pack(fill="both", expand=True, padx=18, pady=18)

        header = tk.Canvas(outer, height=86, bg="#FFF7FB", highlightthickness=0)
        header.pack(fill="x")
        rounded_rectangle(header, 0, 4, 820, 82, 24, fill="#2D2638", outline="")
        header.create_text(28, 27, anchor="w", text="ATG惡魔 房間報率篩選", fill="#FFFFFF", font=("Microsoft JhengHei UI", 18, "bold"))
        header.create_text(30, 58, anchor="w", text="讀取遊戲回傳的機台資料，排序高報率空房；不自動下注。", fill="#DACFFF", font=("Microsoft JhengHei UI", 10))

        controls = tk.Frame(outer, bg="#FFF7FB")
        controls.pack(fill="x", pady=(14, 10))

        left_card = tk.Frame(controls, bg="#FFFFFF", padx=14, pady=12)
        left_card.pack(side="left", fill="x", expand=True)
        right_card = tk.Frame(controls, bg="#FFFFFF", padx=14, pady=12)
        right_card.pack(side="right", fill="x", padx=(12, 0))

        self._entry(left_card, "最低報率 %", self.min_rate, 0, 0)
        self._entry(left_card, "最低下注額", self.min_bet, 0, 1)
        self._entry(left_card, "掃描頁數", self.max_pages, 1, 0)
        self._entry(left_card, "顯示筆數", self.limit, 1, 1)

        check = tk.Checkbutton(
            left_card,
            text="只看空房",
            variable=self.only_empty,
            command=self.apply_settings,
            bg="#FFFFFF",
            fg="#4F435F",
            activebackground="#FFFFFF",
            selectcolor="#F0E9FF",
            font=("Microsoft JhengHei UI", 10, "bold"),
        )
        check.grid(row=2, column=0, sticky="w", pady=(8, 0))

        RoundedButton(right_card, "複製注入碼", self.copy_injection_script, width=142).pack(pady=(0, 8))
        RoundedButton(right_card, "掃描房間", self.scan_rooms, width=142, bg="#FF8A9A", hover="#FF6D83").pack(pady=(0, 8))
        RoundedButton(right_card, "讀取詳情", self.request_selected_detail, width=142, bg="#44C7B0", hover="#2FB9A0").pack(pady=(0, 8))
        RoundedButton(right_card, "清空列表", self.clear_rooms, width=142, bg="#5E6472", hover="#464B55").pack()

        status = tk.Label(
            outer,
            textvariable=self.status_var,
            anchor="w",
            bg="#FFF7FB",
            fg="#6B587F",
            font=("Microsoft JhengHei UI", 10, "bold"),
        )
        status.pack(fill="x", pady=(0, 8))

        table_frame = tk.Frame(outer, bg="#FFFFFF", padx=10, pady=10)
        table_frame.pack(fill="both", expand=True)

        columns = ("number", "rate", "bet", "status", "page", "detail")
        self.tree = ttk.Treeview(table_frame, columns=columns, show="headings", style="ATG.Treeview", selectmode="browse")
        headings = {
            "number": "機台",
            "rate": "報率",
            "bet": "下注額",
            "status": "狀態",
            "page": "頁",
            "detail": "詳細",
        }
        widths = {
            "number": 100,
            "rate": 110,
            "bet": 120,
            "status": 90,
            "page": 70,
            "detail": 210,
        }
        for column in columns:
            self.tree.heading(column, text=headings[column])
            self.tree.column(column, width=widths[column], anchor="center", stretch=column == "detail")

        scrollbar = ttk.Scrollbar(table_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        self.tree.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        for variable in (self.min_rate, self.min_bet, self.max_pages, self.limit):
            variable.trace_add("write", lambda *_args: self.apply_settings())

    def _entry(self, master: tk.Frame, label: str, variable: tk.StringVar, row: int, column: int) -> None:
        cell = tk.Frame(master, bg="#FFFFFF")
        cell.grid(row=row, column=column, sticky="ew", padx=(0 if column == 0 else 14, 0), pady=(0, 8))
        tk.Label(cell, text=label, anchor="w", bg="#FFFFFF", fg="#7A6A8D", font=("Microsoft JhengHei UI", 9, "bold")).pack(fill="x")
        entry = tk.Entry(
            cell,
            textvariable=variable,
            relief="flat",
            bg="#F6F1FF",
            fg="#342B40",
            insertbackground="#342B40",
            font=("Microsoft JhengHei UI", 11),
            width=12,
        )
        entry.pack(fill="x", ipady=6, pady=(4, 0))
        master.columnconfigure(column, weight=1)

    def apply_settings(self) -> None:
        self.store.update_settings(
            min_rate=max(0.0, to_float(self.min_rate.get(), DEFAULT_SETTINGS["min_rate"])),
            min_bet=max(0.0, to_float(self.min_bet.get(), DEFAULT_SETTINGS["min_bet"])),
            max_pages=max(1, min(50, to_int(self.max_pages.get(), DEFAULT_SETTINGS["max_pages"]))),
            only_empty=bool(self.only_empty.get()),
            limit=max(1, min(200, to_int(self.limit.get(), DEFAULT_SETTINGS["limit"]))),
        )
        self.refresh_table()

    def copy_injection_script(self) -> None:
        self.root.clipboard_clear()
        self.root.clipboard_append(self.script)
        self.root.update()
        messagebox.showinfo(APP_NAME, "注入碼已複製。\n\n到遊戲頁按 F12，貼到 Console 執行一次；之後回到本視窗按「掃描房間」。")

    def scan_rooms(self) -> None:
        self.apply_settings()
        settings = self.store.settings.copy()
        self.store.queue_command(
            {
                "type": "scan",
                "maxPages": int(settings["max_pages"]),
                "gapMs": int(settings["request_gap_ms"]),
            }
        )
        self.store.status = "已送出掃描指令；若無反應，請先複製注入碼到遊戲頁 Console 執行"
        self.refresh_table()

    def request_selected_detail(self) -> None:
        selected = self.tree.selection()
        if not selected:
            messagebox.showwarning(APP_NAME, "請先選一個房間。")
            return
        room_id = selected[0]
        self.store.queue_command({"type": "detail", "roomId": room_id})
        self.store.status = f"已送出 {room_id} 詳情指令"
        self.refresh_table()

    def clear_rooms(self) -> None:
        self.store.clear()
        self.refresh_table()

    def refresh_table(self) -> None:
        self.status_var.set(self.store.status)
        existing = set(self.tree.get_children())
        rooms = self.store.filtered_rooms()
        current = set()

        for room in rooms:
            current.add(room.room_id)
            values = (
                room.number,
                f"{room.rate:.2f}%",
                f"{room.bet:,.2f}",
                STATUS_LABELS.get(room.status, room.status or "-"),
                room.page or "-",
                self.detail_summary(room),
            )
            if room.room_id in existing:
                self.tree.item(room.room_id, values=values)
            else:
                self.tree.insert("", "end", iid=room.room_id, values=values)

        for item in existing - current:
            self.tree.delete(item)

    def detail_summary(self, room: Room) -> str:
        parts: list[str] = []
        if room.today_rate is not None:
            parts.append(f"今日 {room.today_rate:.2f}%")
        if room.hour_rate is not None:
            parts.append(f"前一小時 {room.hour_rate:.2f}%")
        if room.day_rate is not None:
            parts.append(f"近30天 {room.day_rate:.2f}%")
        return " / ".join(parts) if parts else room.rate_source

    def _schedule_refresh(self) -> None:
        while True:
            try:
                self.store.gui_events.get_nowait()
            except queue.Empty:
                break
        self.refresh_table()
        self.root.after(500, self._schedule_refresh)


def run_self_tests() -> None:
    room = Room.from_table(
        {
            "roomId": 401,
            "number": 401,
            "status": "Empty",
            "today": {"win": 151.47, "bet": 100},
        },
        page=1,
    )
    assert room.room_id == "401"
    assert room.number == "401"
    assert abs(room.rate - 151.47) < 0.001
    assert room.bet == 100

    fallback = Room.from_table({"roomId": 2, "number": 2, "status": "Full", "win": 224.89, "bet": 100})
    assert fallback.number == "002"
    assert abs(fallback.rate - 224.89) < 0.001

    zero_bet = Room.from_table({"roomId": 3, "number": 3, "status": "Empty", "win": 10, "bet": 0})
    assert zero_bet.rate == 0

    store = RoomStore()
    store.process_event(
        {
            "type": "rooms",
            "payload": {
                "page": 1,
                "tables": [
                    {"roomId": 1, "number": 1, "status": "Empty", "today": {"win": 130, "bet": 100}},
                    {"roomId": 2, "number": 2, "status": "Full", "today": {"win": 300, "bet": 100}},
                ],
            },
        }
    )
    assert len(store.rooms) == 2
    assert [item.room_id for item in store.filtered_rooms()] == ["1"]

    store.process_event(
        {
            "type": "detail",
            "payload": {
                "roomId": 1,
                "detail": {
                    "todayWin": 180,
                    "todayBet": 100,
                    "hourWin": 90,
                    "hourBet": 100,
                    "dayWin": 250,
                    "dayBet": 200,
                },
            },
        }
    )
    assert abs(store.rooms["1"].today_rate - 180) < 0.001
    assert abs(store.rooms["1"].day_rate - 125) < 0.001
    print("self-test ok")


def main() -> None:
    if "--self-test" in sys.argv:
        run_self_tests()
        return

    store = RoomStore()
    server = start_server(store)
    root = tk.Tk()
    AtgDemonApp(root, store, BRIDGE_PORT)
    try:
        root.mainloop()
    finally:
        server.shutdown()


if __name__ == "__main__":
    main()
