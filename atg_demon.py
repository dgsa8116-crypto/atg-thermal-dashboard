name: Update SEO Metadata

on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:
  push:
    branches:
      - main
    paths:
      - "index.html"
      - "sitemap.xml"
      - "robots.txt"
      - ".github/workflows/seo-update.yml"

jobs:
  update-seo:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Update dates
        run: |
          node - <<'NODE'
          const fs = require("fs");
          const today = new Date().toISOString().slice(0, 10);
          const sitemap = "sitemap.xml";
          const index = "index.html";
          if (fs.existsSync(sitemap)) {
            const next = fs.readFileSync(sitemap, "utf8").replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
            fs.writeFileSync(sitemap, next);
          }
          if (fs.existsSync(index)) {
            const next = fs.readFileSync(index, "utf8").replace(/"dateModified": "\d{4}-\d{2}-\d{2}"/g, `"dateModified": "${today}"`);
            fs.writeFileSync(index, next);
          }
          NODE

      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add sitemap.xml index.html
          if ! git diff --cached --quiet; then
            git commit -m "chore: update seo metadata"
            git push
          fi
