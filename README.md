# ATG 熱能柔光監控台

這份版本整合了參考包的網站化概念：會員登入、積分、任務、兌換卡號、SEO 檔案、自動更新 workflow、Supabase 即時資料，以及原本的 Chrome 擴充橋接。

## 內容

- `index.html` / `app.js` / `styles.css`：GitHub Pages 網頁版監控台，發布時放在 repo 第一層。
- `chrome-extension/`：Chrome 擴充，負責只讀式讀取遊戲頁資料並推送到網頁。
- `supabase/schema.sql`：會員、積分、任務、兌換、卡號、即時快照資料表與 RLS。
- `.github/workflows/seo-update.yml`：每日更新 sitemap 與結構化資料日期。
- `tools/build-protected.js`：產生保護版與 `github-release/` 發布包。

## Supabase 設定

1. 到 [Supabase](https://supabase.com/) 建立或打開專案。
2. 到 `Authentication` -> `Sign In / Providers`，啟用 Email 登入。
3. 到 `Authentication` -> `URL Configuration`：
   - `Site URL` 填 `https://tntlinebotseemyeyes.online`
   - `Redirect URLs` 加入 `https://tntlinebotseemyeyes.online/**`
   - 本機測試可另外加入 `http://localhost/**`
4. 到 `Project Settings` -> `API`，複製 Project URL 與 publishable key。
5. 複製 `supabase-config.example.js` 成 `supabase-config.js`，填入：

```js
window.ATG_SUPABASE_CONFIG = {
  url: "https://你的-project-id.supabase.co",
  anonKey: "你的-publishable-key"
};
```

6. 到 Supabase `SQL Editor`，把 `supabase/schema.sql` 整份貼上執行。
7. 註冊並登入一次網站後，到 `Authentication` -> `Users` 複製你的 UID。
8. 如果你要讓自己的帳號負責推送雲端快照，在 SQL Editor 執行：

```sql
insert into public.broadcasters (user_id)
values ('你的 UID')
on conflict (user_id) do nothing;
```

注意：只放 publishable key 到前端，不能放 secret key 或 service role key。

## GitHub Pages

1. 建立 GitHub repository，建議名稱用 `atg-thermal-dashboard`。
2. 上傳 `github-release/` 裡面的內容到 repository 根目錄。
   - 正確：repo 第一層直接看到 `index.html`、`app.js`、`styles.css`、`CNAME`、`chrome-extension/`、`supabase/`。
   - 錯誤：repo 第一層只有 `ATG熱能柔光-GitHub版/` 或 `github-release/`。
3. 到 repository `Settings` -> `Pages`。
4. `Build and deployment` 選 `Deploy from a branch`。
5. Branch 選 `main`，Folder 選 `/root`。
6. 等部署完成後，先確認 GitHub Pages 網址可開啟。

GitHub Pages 預設測試網址會是：

```text
https://dgsa8116-crypto.github.io/atg-thermal-dashboard/
```

如果看到 404，依序檢查：

1. repo 是否為 Public。
2. repo 第一層是否有 `index.html`。
3. `Settings` -> `Pages` 是否真的存成 `main` + `/root`。
4. `Actions` 或 `Settings` -> `Pages` 是否出現部署失敗。
5. 等待 1 到 5 分鐘後按 Ctrl+F5 強制刷新。
6. 網站能開後，再處理自訂網域。

## Namecheap 網域

你的正式網域是：

```text
tntlinebotseemyeyes.online
```

Namecheap DNS 建議設定：

- `@`：A Record 指向 GitHub Pages 4 組 IP
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- `www`：CNAME 指向 `dgsa8116-crypto.github.io`

GitHub Pages 的 Custom domain 填：

```text
tntlinebotseemyeyes.online
```

DNS 生效後，勾選 `Enforce HTTPS`。

完整檢查順序：

1. 先確認 GitHub 預設網址可開。
2. GitHub Pages 的 `Custom domain` 填 `tntlinebotseemyeyes.online`。
3. Namecheap `Advanced DNS` 檢查 `@` 是否有 4 筆 A Record。
4. Namecheap `Advanced DNS` 檢查 `www` 是否是 CNAME 到 `dgsa8116-crypto.github.io`。
5. 回 GitHub Pages 等 DNS check 通過。
6. 通過後勾選 `Enforce HTTPS`。
7. Supabase `Authentication` -> `URL Configuration` 同步改成正式網域。

## Chrome 擴充

1. 打開 `chrome://extensions`。
2. 開啟右上角「開發人員模式」。
3. 點「載入未封裝項目」。
4. 選擇 `chrome-extension/`。
5. 開啟 ATG 遊戲頁，再開啟網頁監控台並登入。
6. 在網頁按「連線擴充」與「即時監控」。

## SEO

發布包第一層已包含：

- `sitemap.xml`
- `robots.txt`
- `seo-config.json`
- `og-image.svg`
- 結構化資料 JSON-LD

`.github/workflows/seo-update.yml` 會每日更新日期欄位。上傳到 GitHub 後可到 Actions 手動執行一次確認。

## 建置保護版

```powershell
node tools/build-protected.js
```

輸出：

- `protected/`
- `github-release/`

`github-release/` 就是可直接上傳 GitHub 的版本。
