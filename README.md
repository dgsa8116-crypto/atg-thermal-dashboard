# ATG 熱能柔光 GitHub 網頁版

這個版本包含兩個部分：

- `chrome-extension/`：Chrome 擴充，負責只讀監控遊戲頁、計算回報分、暴衝機率、免遊預估與高爆點數。
- `docs/`：HTTPS 網頁儀表板，透過本機擴充橋接資料，不直接讀取遊戲頁。

網站端不保存遊戲房間資料；預設資料庫只用於會員登入與個人 profile。遊戲資料仍停留在你的瀏覽器與擴充內。

## 網頁版已同步的欄位

- 回報分：網頁排名主分數，與擴充列表排序一致。
- 暴衝機率：模型估算目前暴衝條件。
- 高爆點數：估計點數區間、每轉點數來源、剩餘轉數、補樣本缺口、準備度與可信度。
- 免遊預估：落點、開轉區間、尚差轉數與可信度。
- 完整資料：今日、前一小時、近30日、未開轉數、前一/前二轉數、動能、週期與回落風險。

## Supabase 資料庫與登入

1. 到 `https://supabase.com/` 建立新 project。
2. 到 `Authentication` -> `Providers`，開啟 Email provider。
3. 到 `Authentication` -> `URL Configuration`：
   - `Site URL` 填你的正式網站網址，例如 `https://你的帳號.github.io/你的repo/`。
   - `Redirect URLs` 加入正式網址與本機測試網址，例如 `https://你的帳號.github.io/你的repo/**`、`http://localhost/**`。
4. 到 `Project Settings` -> `API`，複製：
   - `Project URL`
   - `anon public` key
5. 複製 `docs/supabase-config.example.js` 成 `docs/supabase-config.js`，填入：

```js
window.ATG_SUPABASE_CONFIG = {
  url: "https://你的-project-id.supabase.co",
  anonKey: "你的-anon-public-key"
};
```

6. 到 Supabase `SQL Editor`，貼上並執行 `supabase/schema.sql`。

注意：`anon public` key 可以放前端；不要把 `service_role` key 放到 GitHub 或任何前端檔案。

## GitHub Pages 免費網域

1. 建立 GitHub repo。
2. 把 `github-release/` 裡的內容上傳到 repo 根目錄。
3. 到 repo `Settings` -> `Pages`。
4. `Build and deployment` 選 `Deploy from a branch`。
5. Branch 選 `main`，Folder 選 `/docs`。
6. 儲存後等待部署完成。

預設免費網址會是：

```text
https://你的帳號.github.io/你的repo/
```

## 自訂網域

本專案目前已預設你的網域：

```text
tntlinebotseemyeyes.online
```

`docs/CNAME` 已放入這個網域；擴充也已允許 `https://tntlinebotseemyeyes.online/*` 與 `https://www.tntlinebotseemyeyes.online/*` 橋接。

1. 到 GitHub repo `Settings` -> `Pages`。
2. 在 `Custom domain` 填入 `tntlinebotseemyeyes.online`。
3. 到你的 DNS 服務商新增 DNS：
   - 根網域 `@` 用 GitHub Pages 的 4 筆 A record。
   - `www` 用 CNAME 指到 `你的GitHub帳號.github.io`。
4. 回 GitHub Pages 勾選 `Enforce HTTPS`。
5. 到 Supabase `Authentication` -> `URL Configuration`，把 `https://tntlinebotseemyeyes.online` 加入 `Site URL`，並把 `https://tntlinebotseemyeyes.online/**` 加入 `Redirect URLs`。

## Cloudflare Pages / Netlify

也可以不用 GitHub Pages：

- Cloudflare Pages：連接 GitHub repo，Build command 留空，Build output directory 填 `docs`。
- Netlify：連接 GitHub repo，Build command 留空，Publish directory 填 `docs`。

部署後記得把新的 `pages.dev` 或 `netlify.app` 網址加到 Supabase Auth URL 設定。

## Chrome 擴充

1. 到 `chrome://extensions`。
2. 開啟「開發人員模式」。
3. 點「載入未封裝項目」。
4. 選擇 `chrome-extension/`。
5. 開啟遊戲頁並進房。
6. 回到網頁儀表板登入，點「連接擴充」。

網站上的「每轉點數」會同步到擴充。填 `0` 代表自動估算；填你的實際單轉成本後，高爆點數會用該成本換算，但排名分不會被點數設定影響。

## 產出保護版

```powershell
node tools/build-protected.js
```

產出位置：

- `protected/`
- `github-release/`
