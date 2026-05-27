# PulsePlay 積分商城｜可直接上架版

這是一個可直接部署到 GitHub Pages 的繁體中文靜態網站，主題為「娛樂型預測遊戲積分商城」。

## 已包含頁面

- `/` 首頁
- `/earn-points` 積分任務頁
- `/shop` 虛擬商城頁
- `/shop/challenge-ticket` 商品詳情頁
- `/shop/hint-card` 商品詳情頁
- `/inventory` 我的背包頁
- `/predictions` 預測挑戰頁
- `/wallet` 積分錢包頁
- `/referral` 邀請好友頁
- `/leaderboard` 排行榜頁
- `/account` 會員中心
- `/faq` FAQ
- `/terms` 使用條款與隱私權
- `/admin-plan` 後台管理介面規劃
- `/seo-plan` SEO 與轉換率規劃

## 上架方式

1. 將本資料夾第一層所有檔案上傳到 GitHub repository 根目錄。
2. 到 GitHub repository 的 `Settings` → `Pages`。
3. Source 選擇 `Deploy from a branch`。
4. Branch 選擇 `main`，資料夾選擇 `/root`。
5. 等 GitHub Pages 完成部署。
6. 若使用自訂網域，確認 `CNAME` 內容為：

```txt
tntlinebotseemyeyes.online
```

## Namecheap DNS 建議

若要使用裸網域 `tntlinebotseemyeyes.online`，Namecheap DNS 建議設定：

```txt
Type: A Record
Host: @
Value: 185.199.108.153

Type: A Record
Host: @
Value: 185.199.109.153

Type: A Record
Host: @
Value: 185.199.110.153

Type: A Record
Host: @
Value: 185.199.111.153

Type: CNAME Record
Host: www
Value: dgsa8116-crypto.github.io.
```

## 重要聲明

本平台為娛樂型預測遊戲與虛擬商品服務。所有積分與虛擬商品僅限站內使用，不具現金價值，不可轉售，不可兌換現金；平台不提供投資、金錢型競猜或結果承諾服務。

## 發布前檢查

- `index.html` 存在於第一層
- `404.html` 存在於第一層，可支援 GitHub Pages 子路由
- `CNAME` 存在於第一層
- `sitemap.xml` 與 `robots.txt` 存在於第一層
- 不需要資料庫即可展示完整網站
- 不需要安裝擴充即可瀏覽網站
