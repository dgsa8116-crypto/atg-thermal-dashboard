// ==UserScript==
// @name         ATG 熱能柔光房間篩選器
// @namespace    codex.local
// @version      3.6.0
// @description  靜默實時監控 ATG 完整機台資訊，依報率、動能與下注量排序房間，並可手動進入空房。
// @match        https://play.godeebxp.com/egames/*/game/*
// @run-at       document-idle
// @grant        unsafeWindow
// ==/UserScript==
(function atgDemonMathScanner() {
"use strict";
const __atgBase64=(s)=>new TextDecoder().decode(Uint8Array.from(atob(s),(c)=>c.charCodeAt(0)));const __atgUserStrings=["dW5kZWZpbmVk","U2xvdEZyYW1ld29ya0V2ZW50OlNFTkRfR0VUX1NMT1RfVEFCTEVfUEFHRV9EQVRBX1JFUVVFU1Q=","U2xvdEZyYW1ld29ya0V2ZW50OlNFTkRfR0VUX1NMT1RfVEFCTEVfREVUQUlMX1JFUVVFU1Q=","U2xvdEZyYW1ld29ya0V2ZW50OlNFTkRfTE9DS19TTE9UX1RBQkxFX1JFUVVFU1Q=","U2xvdEZyYW1ld29ya0V2ZW50OlNFTkRfQ0hBTkdFX1NMT1RfVEFCTEVfUkVRVUVTVA==","U2xvdEZyYW1ld29ya0V2ZW50OlNMT1RfVEFCTEVfUEFHRV9EQVRBX1JFU1BPTlNF","U2xvdEZyYW1ld29ya0V2ZW50OlNMT1RfVEFCTEVTX1JFU1BPTlNF","U2xvdEZyYW1ld29ya0V2ZW50OlNMT1RfVEFCTEVfUkVTUE9OU0U=","U2xvdEZyYW1ld29ya0V2ZW50OlNMT1RfVEFCTEVTX1VQREFURURfUkVTUE9OU0U=","YXRnLWRlbW9uLW1hdGgtc2Nhbm5lci12Mg==","RW1wdHk=","56m65oi/","5pyJ5Lq6","6Y6W5a6a","6Zec6ZaJ","6YCy5YWl5oi/6ZaT5b6M5oyJ44CM5ZWf5YuV55uj5ris44CN","e30=","RE9NQ29udGVudExvYWRlZA==","ZnVuY3Rpb24=","W0FURyBEZW1vbiBNYXRoXSBjYXB0dXJlIGZhaWxlZDo=","54ax6IO95p+U5YWJ5bey6YCj5o6l6YGK5oiy5LqL5Lu2","c3RyaW5n","c3RyaW5n","c3RyaW5n","b2JqZWN0","b2JqZWN0","","","b2JqZWN0","MA==","","ZGV0YWls","","MA==","b2JqZWN0","","","bGlzdA==","dG9kYXk=","b2JqZWN0","b2JqZWN0","","bnVtYmVy","","JQ==","","54ax","5YuV6IO9","6YCx5pyf","6YeP6Laz","5L2O6YeP6auY6La0","5LiL5rOo6YeP5LiN6Laz5L2G5aCx546H6YGO6auY77yM5Zue6JC96aKo6Zqq5Yqg6YeN","55+t57ea6YGO54ax","5YmN5LiA5bCP5pmC6YGO54ax5LiUMzDml6Xln7rmupbkuI3otrPvvIzniIbnoLTlj6/og73mipjmiaM=","5b6F6KOc","5bCa5pyq6K6A5Y+W6Kmz5oOF","5pmu6YCa","6LOH5paZ5LiN6Laz6KeA5a+f5Z6L","5YWI5pu05paw6Kmz57Sw6LOH5paZ5b6M5YaN5Yik5pa354iG56C05Y+v6IO9","5L2O6YeP6auY6La05Zue6JC95Z6L","5bCR5LiL5rOo6YeP5Y276ZaL6auY6La077yM6KaW54K65LiN56mp5a6a6KiK6Jmf","55+t57ea6YGO54ax5Zue6JC95Z6L","55+t5pmC6ZaT6auY6La05L2G6ZW35pyf5Z+65rqW5LiN6Laz77yM5YSq5YWI6ZmN5qyK","55+t57ea54iG56C05Z6L","5bCP5pmC5YuV6IO95piO6aGv6auY5pa8MzDml6Xln7rmupY=","6YCx5pyf6JOE6IO95Z6L","5YWN6LK76YGK5oiy5pyq6ZaL6L2J5pW45YGP6auY5LiU54ax5bqm5pyq5Ya35Y27","6auY54ax5bu257qM5Z6L","5aCx546H6IiH5qij5pys6YeP5ZCM5pmC5YGP5by3","5L2O5qij5pys6Kmm5o6i5Z6L","5qij5pys6YeP5LiN6Laz77yM54iG56C05Y+v6IO95oqY5omj6LyD6auY","56mp5a6a5YGP54ax5Z6L","5aSa6aCF6LOH5paZ5YGP54ax5L2G54iG55m86KiK6Jmf5pmu6YCa","5Ya35Y276KeA5a+f5Z6L","55uu5YmN5qKd5Lu25LiN6YGp5ZCI5YSq5YWI5o6S5bqP","QQ==","Qg==","Qw==","RA==","5bCa5pyq5om+5Yiw6YGK5oiyIGRpc3BhdGNo77yM6KuL562J6YGK5oiy5a6M5YWo6LyJ5YWl5b6M5YaN5o6D5o+P","5a+m5pmC55uj5o6n","5pu05paw6Kmz57Sw6LOH5paZ","6KuL5YWI5o6D5o+P5oi/6ZaT","5a+m5pmC55uj5o6n5Lit77ya5pu05paw5a6M5pW06LOH5paZ","5a+m5pmC55uj5o6n5Lit77ya55uu5YmN5YiX6KGo5bey5piv5a6M5pW06LOH5paZ","","","Kg==","","YXRnLXJvb20tcmF0ZS1maWx0ZXI=","bWF4UGFnZXM=","bGltaXQ=","YXV0b1JlZnJlc2hTZWM=","5a6a5pmC5Yi35paw","55uj5ris5bey5pqr5YGc77yb6YCy5oi/5b6M5Y+v5YaN5ZWf5YuV","5ZWf5YuV55uj5ris","5Yi35paw","YXRnLXJvb20tcmF0ZS1maWx0ZXI=","ZGl2","YXRnLXJvb20tcmF0ZS1maWx0ZXI=","Zml4ZWQ=","NzBweA==","MTJweA==","MjE0NzQ4MzY0Nw==","b3Blbg==","LnBhbmVs","bWF4UGFnZXM=","YXV0b1JlZnJlc2hTZWM=","bGltaXQ=","b25seUVtcHR5","Y2hlY2tib3g=","Y2hlY2tib3g=","Y2hhbmdl","aW5wdXQ=","bW9uaXRvcg==","Y2xpY2s=","c2Nhbg==","Y2xpY2s=","5omL5YuV5Yi35paw","ZGV0YWls","Y2xpY2s=","6KuL5YWI6bue6YG45LiA6ZaT5oi/","Y2xlYXI=","Y2xpY2s=","5bey5riF56m6","dG9nZ2xl","Y2xpY2s=","Y29sbGFwc2Vk","Y29sbGFwc2Vk","5bGV6ZaL","5pS25ZCI","cmVzdWx0cw==","Y2xpY2s=","W2RhdGEtZW50ZXItcm9vbS1pZF0=","W2RhdGEtcm9vbS1pZF0=","","5om+5LiN5Yiw5oi/6ZaT6LOH5paZ","5bCa5pyq5om+5Yiw6YGK5oiyIGRpc3BhdGNo77yM6KuL562J6YGK5oiy5a6M5YWo6LyJ5YWl5b6M5YaN6YCy5YWl","YXRnLXJvb20tcmF0ZS1maWx0ZXI=","c3RhdHVz","cmVzdWx0cw==","bW9uaXRvcg==","c2Nhbg==","5Yi35paw5Lit","56uL5Y2z5Yi35paw","5pqr5YGc55uj5ris","5ZWf5YuV55uj5ris","562J5b6F6YGK5oiy6LyJ5YWl77yM6YCy5oi/5b6M5oyJ44CM5ZWf5YuV55uj5ris44CN","","ZW1wdHk=","YnVzeQ==","MQ==","MA==","IA==","IC8g","","ZGlzYWJsZWQ=","LQ==","55uu5YmN5rKS5pyJ5by36KiK6Jmf","","LQ==","77yb","LQ==","LCA=","LQ==","Cg==","LQ==","ZW4tVVM=","LQ==","LQ==","JmFtcDs=","Jmx0Ow==","Jmd0Ow==","JnF1b3Q7","JiMzOTs="];const __atgTplParts=[["5bey6K6A5Y+WIA==","IOmWk+aIv++8jOetieW+heWujOaVtOizh+aWmQ=="],["55uu5YmN5aCx546HIA==",""],["5bCP5pmC6auY5pa8MzDml6Ug",""],["5YWN6LK76YGK5oiy5pyq6ZaLIA==","IOi9iQ=="],["5qij5pys6YeP5Y+v5L+h5bqmIA==",""],["5o6D5o+P56ysIA==","Lw==","IOmggS4uLg=="],["5YiX6KGo5bey5pu05paw77ya","IOmWk++8jOa6luWCmeiugOWPluWujOaVtOizh+aWmQ=="],["5a+m5pmC55uj5o6n5Lit77ya","IOmWk+WujOaVtOizh+aWmeW3suWQjOatpQ=="],["","77ya5o6D5o+P5oi/6ZaT5Lit"],["CiAgICAgIDxzdHlsZT4KICAgICAgICA6aG9zdCB7IGFsbDogaW5pdGlhbDsgY29sb3Itc2NoZW1lOiBkYXJrOyB9CiAgICAgICAgKiB7IGJveC1zaXppbmc6IGJvcmRlci1ib3g7IH0KICAgICAgICAucGFuZWwgewogICAgICAgICAgd2lkdGg6IDQzMHB4OwogICAgICAgICAgbWF4LWhlaWdodDogY2FsYygxMDB2aCAtIDkycHgpOwogICAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LDE5MCwxMTIsLjQyKTsKICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDIwcHg7CiAgICAgICAgICBiYWNrZ3JvdW5kOgogICAgICAgICAgICByYWRpYWwtZ3JhZGllbnQoY2lyY2xlIGF0IDE4JSAwJSwgcmdiYSgyNTUsMjA4LDExMiwuMjQpLCB0cmFuc3BhcmVudCAzNCUpLAogICAgICAgICAgICByYWRpYWwtZ3JhZGllbnQoY2lyY2xlIGF0IDEwMCUgOCUsIHJnYmEoMjU1LDk2LDEyOCwuMTgpLCB0cmFuc3BhcmVudCAzMCUpLAogICAgICAgICAgICBsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCByZ2JhKDQyLDMxLDM5LC45OCksIHJnYmEoMjMsMjEsMzEsLjk4KSk7CiAgICAgICAgICBjb2xvcjogI2ZmZjsKICAgICAgICAgIGZvbnQ6IDEycHgvMS40IEFyaWFsLCAiTWljcm9zb2Z0IEpoZW5nSGVpIiwgc2Fucy1zZXJpZjsKICAgICAgICAgIGJveC1zaGFkb3c6IDAgMThweCA0NHB4IHJnYmEoMCwwLDAsLjQ4KSwgMCAwIDI2cHggcmdiYSgyNTUsMTY0LDkyLC4xNik7CiAgICAgICAgICBiYWNrZHJvcC1maWx0ZXI6IGJsdXIoMTBweCk7CiAgICAgICAgfQogICAgICAgIC5oZWFkZXIgewogICAgICAgICAgZGlzcGxheTogZmxleDsKICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47CiAgICAgICAgICBnYXA6IDhweDsKICAgICAgICAgIHBhZGRpbmc6IDlweCAxMXB4OwogICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDkwZGVnLCByZ2JhKDI1NSwxODIsOTIsLjEzKSwgcmdiYSgyNTUsMTAyLDE0MywuMDgpKTsKICAgICAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCByZ2JhKDI1NSwyMTQsMTI4LC4xNCk7CiAgICAgICAgfQogICAgICAgIC50aXRsZSB7CiAgICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgICAgICAgIGdhcDogOHB4OwogICAgICAgICAgZm9udC13ZWlnaHQ6IDgwMDsKICAgICAgICAgIGZvbnQtc2l6ZTogMTRweDsKICAgICAgICB9CiAgICAgICAgLm1hc2NvdCB7CiAgICAgICAgICBkaXNwbGF5OiBncmlkOwogICAgICAgICAgcGxhY2UtaXRlbXM6IGNlbnRlcjsKICAgICAgICAgIHdpZHRoOiAyOHB4OwogICAgICAgICAgaGVpZ2h0OiAyOHB4OwogICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlOwogICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2ZmZDE2NiwgI2ZmN2E4YSA1OCUsICM4YmQ4ZmYpOwogICAgICAgICAgY29sb3I6ICMyNDE5MjI7CiAgICAgICAgICBib3gtc2hhZG93OiAwIDAgMTZweCByZ2JhKDI1NSwxNzcsOTIsLjU1KTsKICAgICAgICAgIGZvbnQtc2l6ZTogMTJweDsKICAgICAgICAgIGxpbmUtaGVpZ2h0OiAxOwogICAgICAgIH0KICAgICAgICAuYm9keSB7IHBhZGRpbmc6IDEwcHggMTFweCAxMnB4OyB9CiAgICAgICAgLmdyaWQgewogICAgICAgICAgZGlzcGxheTogZ3JpZDsKICAgICAgICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDMsIDFmcik7CiAgICAgICAgICBnYXA6IDdweDsKICAgICAgICAgIG1hcmdpbi1ib3R0b206IDhweDsKICAgICAgICB9CiAgICAgICAgbGFiZWwgewogICAgICAgICAgZGlzcGxheTogZ3JpZDsKICAgICAgICAgIGdhcDogNHB4OwogICAgICAgICAgY29sb3I6ICNmZmUxYjg7CiAgICAgICAgICBmb250LXNpemU6IDExcHg7CiAgICAgICAgICBmb250LXdlaWdodDogNzAwOwogICAgICAgIH0KICAgICAgICBpbnB1dFt0eXBlPSJudW1iZXIiXSB7CiAgICAgICAgICB3aWR0aDogMTAwJTsKICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LDE5MCwxMTIsLjI4KTsKICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDEycHg7CiAgICAgICAgICBwYWRkaW5nOiA2cHggOHB4OwogICAgICAgICAgYmFja2dyb3VuZDogI2ZmZjhmMTsKICAgICAgICAgIGNvbG9yOiAjMmQyNjM4OwogICAgICAgICAgZm9udDogNzAwIDEycHggQXJpYWwsICJNaWNyb3NvZnQgSmhlbmdIZWkiLCBzYW5zLXNlcmlmOwogICAgICAgICAgb3V0bGluZTogbm9uZTsKICAgICAgICB9CiAgICAgICAgaW5wdXRbdHlwZT0ibnVtYmVyIl06Zm9jdXMgeyBib3JkZXItY29sb3I6ICNmZmI0NWY7IGJveC1zaGFkb3c6IDAgMCAwIDJweCByZ2JhKDI1NSwxODAsOTUsLjE2KTsgfQogICAgICAgIGlucHV0W3R5cGU9Im51bWJlciJdOmRpc2FibGVkIHsKICAgICAgICAgIG9wYWNpdHk6IC43MjsKICAgICAgICAgIGNvbG9yOiAjNmI1NjYwOwogICAgICAgICAgY3Vyc29yOiBkZWZhdWx0OwogICAgICAgIH0KICAgICAgICAuY2hlY2sgewogICAgICAgICAgZGlzcGxheTogZmxleDsKICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgICBnYXA6IDdweDsKICAgICAgICAgIG1hcmdpbjogNXB4IDAgOXB4OwogICAgICAgIH0KICAgICAgICAuYWN0aW9ucyB7CiAgICAgICAgICBkaXNwbGF5OiBncmlkOwogICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoNCwgMWZyKTsKICAgICAgICAgIGdhcDogN3B4OwogICAgICAgICAgbWFyZ2luLWJvdHRvbTogOHB4OwogICAgICAgIH0KICAgICAgICBidXR0b24gewogICAgICAgICAgYm9yZGVyOiAwOwogICAgICAgICAgYm9yZGVyLXJhZGl1czogOTk5cHg7CiAgICAgICAgICBwYWRkaW5nOiA3cHggOHB4OwogICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2E4NzRmZiwgI2ZmN2E4YSk7CiAgICAgICAgICBjb2xvcjogI2ZmZjsKICAgICAgICAgIGZvbnQ6IDgwMCAxMnB4IEFyaWFsLCAiTWljcm9zb2Z0IEpoZW5nSGVpIiwgc2Fucy1zZXJpZjsKICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjsKICAgICAgICAgIGJveC1zaGFkb3c6IGluc2V0IDAgLTJweCAwIHJnYmEoMCwwLDAsLjEyKTsKICAgICAgICB9CiAgICAgICAgYnV0dG9uOmhvdmVyIHsgZmlsdGVyOiBicmlnaHRuZXNzKDEuMDgpOyB9CiAgICAgICAgYnV0dG9uOmFjdGl2ZSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgxcHgpOyB9CiAgICAgICAgYnV0dG9uLnNlY29uZGFyeSB7IGJhY2tncm91bmQ6ICM2MjVkNjg7IH0KICAgICAgICBidXR0b24uaG90IHsgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2ZmOGE0YywgI2ZmNTY3ZCk7IH0KICAgICAgICBidXR0b24uZ29vZCB7IGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICNmZmQxNjYsICNmZjhhNGMpOyBjb2xvcjogIzI5MWExODsgfQogICAgICAgIGJ1dHRvbi5lbnRlci1yb29tIHsKICAgICAgICAgIG1pbi13aWR0aDogNThweDsKICAgICAgICAgIHBhZGRpbmc6IDZweCAxMHB4OwogICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzcyZjBkMSwgI2ZmZDE2Nik7CiAgICAgICAgICBjb2xvcjogIzIwMTgxYjsKICAgICAgICB9CiAgICAgICAgYnV0dG9uLmVudGVyLXJvb206ZGlzYWJsZWQgewogICAgICAgICAgb3BhY2l0eTogLjQyOwogICAgICAgICAgZmlsdGVyOiBncmF5c2NhbGUoLjM1KTsKICAgICAgICAgIGN1cnNvcjogZGVmYXVsdDsKICAgICAgICB9CiAgICAgICAgYnV0dG9uLm1pbmkgewogICAgICAgICAgcGFkZGluZzogNXB4IDhweDsKICAgICAgICAgIGZvbnQtc2l6ZTogMTFweDsKICAgICAgICB9CiAgICAgICAgYnV0dG9uOmRpc2FibGVkIHsgb3BhY2l0eTogLjU1OyBjdXJzb3I6IGRlZmF1bHQ7IH0KICAgICAgICAuc3RhdHVzIHsKICAgICAgICAgIG1pbi1oZWlnaHQ6IDE4cHg7CiAgICAgICAgICBtYXJnaW4tYm90dG9tOiA3cHg7CiAgICAgICAgICBjb2xvcjogI2ZmZDE2NjsKICAgICAgICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7CiAgICAgICAgICBvdmVyZmxvdzogaGlkZGVuOwogICAgICAgICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7CiAgICAgICAgfQogICAgICAgIC5yb29tLWxpc3QgewogICAgICAgICAgZGlzcGxheTogZ3JpZDsKICAgICAgICAgIGdhcDogOXB4OwogICAgICAgICAgbWF4LWhlaWdodDogY2FsYygxMDB2aCAtIDI3NnB4KTsKICAgICAgICAgIG92ZXJmbG93OiBhdXRvOwogICAgICAgICAgcGFkZGluZy1yaWdodDogMnB4OwogICAgICAgIH0KICAgICAgICAucm9vbS1jYXJkIHsKICAgICAgICAgIGRpc3BsYXk6IGdyaWQ7CiAgICAgICAgICBnYXA6IDhweDsKICAgICAgICAgIHBhZGRpbmc6IDEwcHg7CiAgICAgICAgICBib3JkZXItcmFkaXVzOiAxNnB4OwogICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsMTk4LDExNywuMTYpOwogICAgICAgICAgYmFja2dyb3VuZDoKICAgICAgICAgICAgbGluZWFyLWdyYWRpZW50KDE4MGRlZywgcmdiYSgyNTUsMjU1LDI1NSwuMTA1KSwgcmdiYSgyNTUsMjU1LDI1NSwuMDU1KSksCiAgICAgICAgICAgIHJhZGlhbC1ncmFkaWVudChjaXJjbGUgYXQgOCUgMCUsIHJnYmEoMjU1LDE4NSw4MiwuMTcpLCB0cmFuc3BhcmVudCA0NSUpOwogICAgICAgICAgYm94LXNoYWRvdzogaW5zZXQgMCAxcHggMCByZ2JhKDI1NSwyNTUsMjU1LC4xMiksIDAgOHB4IDIycHggcmdiYSgwLDAsMCwuMTgpOwogICAgICAgICAgY3Vyc29yOiBwb2ludGVyOwogICAgICAgIH0KICAgICAgICAucm9vbS1jYXJkW2RhdGEtc2VsZWN0ZWQ9IjEiXSB7CiAgICAgICAgICBib3JkZXItY29sb3I6IHJnYmEoMjU1LDIwOSwxMDIsLjU4KTsKICAgICAgICAgIGJveC1zaGFkb3c6IDAgMCAwIDFweCByZ2JhKDI1NSwyMDksMTAyLC4yMiksIDAgMCAyMnB4IHJnYmEoMjU1LDEzMiw3NiwuMik7CiAgICAgICAgfQogICAgICAgIC5yb29tLXRvcCB7CiAgICAgICAgICBkaXNwbGF5OiBncmlkOwogICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiBtaW5tYXgoMCwgMWZyKSBhdXRvOwogICAgICAgICAgZ2FwOiAxMHB4OwogICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgICAgICB9CiAgICAgICAgLmNhcmQtYWN0aW9ucyB7CiAgICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgICAgICAgIGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7CiAgICAgICAgICBnYXA6IDZweDsKICAgICAgICB9CiAgICAgICAgLm1hY2hpbmUtbmFtZSB7CiAgICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgICAgYWxpZ24taXRlbXM6IGJhc2VsaW5lOwogICAgICAgICAgZ2FwOiA3cHg7CiAgICAgICAgICBtaW4td2lkdGg6IDA7CiAgICAgICAgfQogICAgICAgIC5tYWNoaW5lLW5hbWUgc3Ryb25nIHsKICAgICAgICAgIGNvbG9yOiAjZmZmOGU2OwogICAgICAgICAgZm9udC1zaXplOiAxNnB4OwogICAgICAgICAgZm9udC13ZWlnaHQ6IDk1MDsKICAgICAgICB9CiAgICAgICAgLmJ1cnN0LXBpbGwgewogICAgICAgICAgZGlzcGxheTogZ3JpZDsKICAgICAgICAgIGp1c3RpZnktaXRlbXM6IGVuZDsKICAgICAgICAgIGdhcDogMXB4OwogICAgICAgICAgcGFkZGluZzogNXB4IDlweDsKICAgICAgICAgIG1pbi13aWR0aDogNzJweDsKICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4OwogICAgICAgICAgY29sb3I6ICMyNTE5MWQ7CiAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZmZlMTdhLCAjZmY4YTRjIDU4JSwgI2ZmNWY4YSk7CiAgICAgICAgICBib3gtc2hhZG93OiAwIDAgMTZweCByZ2JhKDI1NSwxNDIsNzYsLjQyKTsKICAgICAgICAgIGZvbnQtd2VpZ2h0OiA5NTA7CiAgICAgICAgfQogICAgICAgIC5idXJzdC1waWxsIHNwYW4geyBmb250LXNpemU6IDEwcHg7IG9wYWNpdHk6IC43ODsgfQogICAgICAgIC5idXJzdC1waWxsIGIgeyBmb250LXNpemU6IDE0cHg7IH0KICAgICAgICAubWV0cmljLXJvdyB7CiAgICAgICAgICBkaXNwbGF5OiBncmlkOwogICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMywgMWZyKTsKICAgICAgICAgIGdhcDogNnB4OwogICAgICAgIH0KICAgICAgICAubWV0cmljIHsKICAgICAgICAgIG1pbi13aWR0aDogMDsKICAgICAgICAgIHBhZGRpbmc6IDZweCA3cHg7CiAgICAgICAgICBib3JkZXItcmFkaXVzOiAxMXB4OwogICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsMjU1LDI1NSwuMDcpOwogICAgICAgICAgY29sb3I6ICNkOWM5Yzc7CiAgICAgICAgICBmb250LXNpemU6IDEwcHg7CiAgICAgICAgICBmb250LXdlaWdodDogODAwOwogICAgICAgIH0KICAgICAgICAubWV0cmljIHN0cm9uZyB7CiAgICAgICAgICBkaXNwbGF5OiBibG9jazsKICAgICAgICAgIG1hcmdpbi10b3A6IDJweDsKICAgICAgICAgIG92ZXJmbG93OiBoaWRkZW47CiAgICAgICAgICBjb2xvcjogI2ZmZjZkZjsKICAgICAgICAgIGZvbnQtc2l6ZTogMTJweDsKICAgICAgICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzOwogICAgICAgICAgd2hpdGUtc3BhY2U6IG5vd3JhcDsKICAgICAgICB9CiAgICAgICAgLnJhdGUgeyBjb2xvcjogI2ZmZDE2NiAhaW1wb3J0YW50OyB9CiAgICAgICAgLmVtcHR5IHsgY29sb3I6ICM3ZGY3Y2U7IH0KICAgICAgICAuYnVzeSB7IGNvbG9yOiAjYzljOWNjOyB9CiAgICAgICAgLm11dGVkIHsgY29sb3I6ICNkOGM1Yjg7IH0KICAgICAgICAudGFncyB7CiAgICAgICAgICBkaXNwbGF5OiBibG9jazsKICAgICAgICAgIGNvbG9yOiAjZmZjZjlmOwogICAgICAgICAgZm9udC1zaXplOiAxMHB4OwogICAgICAgICAgZm9udC13ZWlnaHQ6IDcwMDsKICAgICAgICAgIHdoaXRlLXNwYWNlOiBub3JtYWw7CiAgICAgICAgfQogICAgICAgIC50aGVybWFsLXBhbmVsIHsKICAgICAgICAgIGRpc3BsYXk6IGdyaWQ7CiAgICAgICAgICBnYXA6IDdweDsKICAgICAgICAgIHBhZGRpbmc6IDhweDsKICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDEycHg7CiAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDE4LDE1LDIyLC41KTsKICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LDE5MCwxMTIsLjEyKTsKICAgICAgICB9CiAgICAgICAgLnRoZXJtYWwtaGVhZCB7CiAgICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjsKICAgICAgICAgIGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7CiAgICAgICAgICBnYXA6IDhweDsKICAgICAgICAgIGNvbG9yOiAjZjdmMmZmOwogICAgICAgICAgZm9udC13ZWlnaHQ6IDkwMDsKICAgICAgICB9CiAgICAgICAgLnRoZXJtYWwtaGVhZCBzcGFuIHsgY29sb3I6ICNmZmQxNjY7IH0KICAgICAgICAudGhlcm1hbC1oZWFkIGIgeyBjb2xvcjogI2ZmYjQ1ZjsgfQogICAgICAgIC5lbmVyZ3kgewogICAgICAgICAgcG9zaXRpb246IHJlbGF0aXZlOwogICAgICAgICAgaGVpZ2h0OiAxM3B4OwogICAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjsKICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4OwogICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsMjU1LDI1NSwuMSk7CiAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LC4xMik7CiAgICAgICAgfQogICAgICAgIC5lbmVyZ3ktZmlsbCB7CiAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICAgICAgICBpbnNldDogMCBhdXRvIDAgMDsKICAgICAgICAgIGJvcmRlci1yYWRpdXM6IGluaGVyaXQ7CiAgICAgICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoOTBkZWcsICNmZmQxNjYsICNmZjhhNGMsICNmZjVmOGEsICNiMDZjZmYsICM3MmYwZDEsICNmZmQxNjYpOwogICAgICAgICAgYmFja2dyb3VuZC1zaXplOiAyNDAlIDEwMCU7CiAgICAgICAgICBib3gtc2hhZG93OiAwIDAgMjBweCByZ2JhKDI1NSwxNTcsNzUsLjUyKTsKICAgICAgICAgIGFuaW1hdGlvbjogYXRnRW5lcmd5RmxvdyAyLjJzIGxpbmVhciBpbmZpbml0ZTsKICAgICAgICB9CiAgICAgICAgLmVuZXJneTo6YWZ0ZXIgewogICAgICAgICAgY29udGVudDogIiI7CiAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7CiAgICAgICAgICBpbnNldDogMXB4OwogICAgICAgICAgYm9yZGVyLXJhZGl1czogaW5oZXJpdDsKICAgICAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxODBkZWcsIHJnYmEoMjU1LDI1NSwyNTUsLjM1KSwgcmdiYSgyNTUsMjU1LDI1NSwwKSk7CiAgICAgICAgICBwb2ludGVyLWV2ZW50czogbm9uZTsKICAgICAgICB9CiAgICAgICAgLnRoZXJtYWwtZ3JpZCB7CiAgICAgICAgICBkaXNwbGF5OiBncmlkOwogICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMywgMWZyKTsKICAgICAgICAgIGdhcDogNXB4OwogICAgICAgIH0KICAgICAgICAuZmVhdHVyZS1ibG9jayB7CiAgICAgICAgICBkaXNwbGF5OiBncmlkOwogICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiA3MnB4IDFmciAxZnIgMWZyOwogICAgICAgICAgZ2FwOiA1cHg7CiAgICAgICAgICBhbGlnbi1pdGVtczogc3RyZXRjaDsKICAgICAgICB9CiAgICAgICAgLmZlYXR1cmUtdGl0bGUsCiAgICAgICAgLmZlYXR1cmUtaXRlbSB7CiAgICAgICAgICBwYWRkaW5nOiA2cHg7CiAgICAgICAgICBib3JkZXItcmFkaXVzOiA5cHg7CiAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwyNTUsMjU1LC4wNzUpOwogICAgICAgICAgY29sb3I6ICNkZWNmY2I7CiAgICAgICAgICBmb250LXNpemU6IDEwcHg7CiAgICAgICAgICBsaW5lLWhlaWdodDogMS4yNTsKICAgICAgICB9CiAgICAgICAgLmZlYXR1cmUtdGl0bGUgewogICAgICAgICAgZGlzcGxheTogZ3JpZDsKICAgICAgICAgIHBsYWNlLWl0ZW1zOiBjZW50ZXI7CiAgICAgICAgICBjb2xvcjogI2ZmZDE2NjsKICAgICAgICAgIGZvbnQtd2VpZ2h0OiA5MDA7CiAgICAgICAgfQogICAgICAgIC5mZWF0dXJlLWl0ZW0gc3Ryb25nIHsKICAgICAgICAgIGRpc3BsYXk6IGJsb2NrOwogICAgICAgICAgbWFyZ2luLXRvcDogMnB4OwogICAgICAgICAgY29sb3I6ICNmZmY7CiAgICAgICAgICBmb250LXNpemU6IDExcHg7CiAgICAgICAgfQogICAgICAgIC50aGVybWFsLWl0ZW0gewogICAgICAgICAgbWluLXdpZHRoOiAwOwogICAgICAgICAgcGFkZGluZzogNnB4OwogICAgICAgICAgYm9yZGVyLXJhZGl1czogOXB4OwogICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsMjU1LDI1NSwuMDc1KTsKICAgICAgICAgIGNvbG9yOiAjZGVjZmNiOwogICAgICAgICAgZm9udC1zaXplOiAxMHB4OwogICAgICAgICAgbGluZS1oZWlnaHQ6IDEuMjU7CiAgICAgICAgfQogICAgICAgIC50aGVybWFsLWl0ZW0gc3Ryb25nIHsKICAgICAgICAgIGRpc3BsYXk6IGJsb2NrOwogICAgICAgICAgbWFyZ2luLXRvcDogMnB4OwogICAgICAgICAgY29sb3I6ICNmZmY7CiAgICAgICAgICBmb250LXNpemU6IDExcHg7CiAgICAgICAgfQogICAgICAgIC50aGVybWFsLW5vdGUgewogICAgICAgICAgY29sb3I6ICNkZWNmY2I7CiAgICAgICAgICBmb250LXNpemU6IDExcHg7CiAgICAgICAgICBsaW5lLWhlaWdodDogMS4zNTsKICAgICAgICB9CiAgICAgICAgLnRoZXJtYWwtcmVhc29ucyB7CiAgICAgICAgICBkaXNwbGF5OiBmbGV4OwogICAgICAgICAgZmxleC13cmFwOiB3cmFwOwogICAgICAgICAgZ2FwOiA1cHg7CiAgICAgICAgfQogICAgICAgIC50aGVybWFsLXJlYXNvbiB7CiAgICAgICAgICBwYWRkaW5nOiAzcHggNnB4OwogICAgICAgICAgYm9yZGVyLXJhZGl1czogOTk5cHg7CiAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwyNTUsMjU1LC4wOCk7CiAgICAgICAgICBjb2xvcjogI2ZmZDFhMzsKICAgICAgICAgIGZvbnQtc2l6ZTogMTBweDsKICAgICAgICAgIGZvbnQtd2VpZ2h0OiA4MDA7CiAgICAgICAgfQogICAgICAgIEBrZXlmcmFtZXMgYXRnRW5lcmd5RmxvdyB7CiAgICAgICAgICAwJSB7IGJhY2tncm91bmQtcG9zaXRpb246IDAlIDUwJTsgfQogICAgICAgICAgMTAwJSB7IGJhY2tncm91bmQtcG9zaXRpb246IDI0MCUgNTAlOyB9CiAgICAgICAgfQogICAgICAgIC5lbXB0eS1zdGF0ZSB7CiAgICAgICAgICBwYWRkaW5nOiAxMnB4OwogICAgICAgICAgYm9yZGVyLXJhZGl1czogMTRweDsKICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LDI1NSwyNTUsLjA4KTsKICAgICAgICAgIGNvbG9yOiAjZGFjZmZmOwogICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyOwogICAgICAgIH0KICAgICAgICAuY29sbGFwc2VkIC5ib2R5IHsgZGlzcGxheTogbm9uZTsgfQogICAgICA8L3N0eWxlPgogICAgICA8ZGl2IGNsYXNzPSJwYW5lbCI+CiAgICAgICAgPGRpdiBjbGFzcz0iaGVhZGVyIj4KICAgICAgICAgIDxkaXYgY2xhc3M9InRpdGxlIj48c3BhbiBjbGFzcz0ibWFzY290Ij7nhrE8L3NwYW4+PHNwYW4+54ax6IO95p+U5YWJIOeIhuegtOaooeWeizwvc3Bhbj48L2Rpdj4KICAgICAgICAgIDxidXR0b24gaWQ9InRvZ2dsZSIgY2xhc3M9InNlY29uZGFyeSBtaW5pIiB0eXBlPSJidXR0b24iPuaUtuWQiDwvYnV0dG9uPgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImJvZHkiPgogICAgICAgICAgPGRpdiBjbGFzcz0iZ3JpZCI+CiAgICAgICAgICAgIDxsYWJlbD7oh6rli5XpoIHmlbgKICAgICAgICAgICAgICA8aW5wdXQgaWQ9Im1heFBhZ2VzIiB0eXBlPSJudW1iZXIiIG1pbj0iMSIgbWF4PSI1MCIgc3RlcD0iMSIgZGlzYWJsZWQ+CiAgICAgICAgICAgIDwvbGFiZWw+CiAgICAgICAgICAgIDxsYWJlbD7liLfmlrDnp5LmlbgKICAgICAgICAgICAgICA8aW5wdXQgaWQ9ImF1dG9SZWZyZXNoU2VjIiB0eXBlPSJudW1iZXIiIG1pbj0iMTAiIG1heD0iMzAwIiBzdGVwPSI1Ij4KICAgICAgICAgICAgPC9sYWJlbD4KICAgICAgICAgICAgPGxhYmVsPuiHquWLleethuaVuAogICAgICAgICAgICAgIDxpbnB1dCBpZD0ibGltaXQiIHR5cGU9Im51bWJlciIgbWluPSIxIiBtYXg9IjEyMCIgc3RlcD0iMSIgZGlzYWJsZWQ+CiAgICAgICAgICAgIDwvbGFiZWw+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDxsYWJlbCBjbGFzcz0iY2hlY2siPgogICAgICAgICAgICA8aW5wdXQgaWQ9Im9ubHlFbXB0eSIgdHlwZT0iY2hlY2tib3giPgogICAgICAgICAgICDlj6rnnIvnqbrmiL8KICAgICAgICAgIDwvbGFiZWw+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJhY3Rpb25zIj4KICAgICAgICAgICAgPGJ1dHRvbiBpZD0ibW9uaXRvciIgY2xhc3M9Imdvb2QiIHR5cGU9ImJ1dHRvbiI+5ZWf5YuV55uj5risPC9idXR0b24+CiAgICAgICAgICAgIDxidXR0b24gaWQ9InNjYW4iIGNsYXNzPSJob3QiIHR5cGU9ImJ1dHRvbiI+56uL5Y2z5Yi35pawPC9idXR0b24+CiAgICAgICAgICAgIDxidXR0b24gaWQ9ImRldGFpbCIgdHlwZT0iYnV0dG9uIj7llq7plpM8L2J1dHRvbj4KICAgICAgICAgICAgPGJ1dHRvbiBpZD0iY2xlYXIiIGNsYXNzPSJzZWNvbmRhcnkiIHR5cGU9ImJ1dHRvbiI+5riF56m6PC9idXR0b24+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDxkaXYgaWQ9InN0YXR1cyIgY2xhc3M9InN0YXR1cyI+PC9kaXY+CiAgICAgICAgICA8ZGl2IGlkPSJyZXN1bHRzIiBjbGFzcz0icmVzdWx0cyI+PC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgogICAg"],["5qmf5Y+wIA==","IOS4jeaYr+epuuaIv++8jOacqumAgeWHuumAsuWFpQ=="],["5rqW5YKZ6YCy5YWlIA==",""],["PGRpdiBjbGFzcz0iZW1wdHktc3RhdGUiPuebruWJjeaykuacieespuWQiOaineS7tueahOaIv+mWkzwvZGl2Pg=="],["CiAgICAgIDxkaXYgY2xhc3M9InJvb20tbGlzdCI+CiAgICAgICAg","CiAgICAgIDwvZGl2PgogICAg"],["CiAgICAgIDxkaXYgY2xhc3M9InJvb20tY2FyZCIgZGF0YS1yb29tLWlkPSI=","IiBkYXRhLXNlbGVjdGVkPSI=","IiB0aXRsZT0i","Ij4KICAgICAgICA8ZGl2IGNsYXNzPSJyb29tLXRvcCI+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJtYWNoaW5lLW5hbWUiPgogICAgICAgICAgICA8c3Ryb25nPg==","PC9zdHJvbmc+CiAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJ0YWdzIj4=","PC9zcGFuPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkLWFjdGlvbnMiPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJidXJzdC1waWxsIj48c3Bhbj7niIbnoLQ8L3NwYW4+PGI+","JTwvYj48L2Rpdj4KICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iZW50ZXItcm9vbSIgdHlwZT0iYnV0dG9uIiBkYXRhLWVudGVyLXJvb20taWQ9Ig==","IiA=","PumAsuWFpTwvYnV0dG9uPgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljLXJvdyI+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJtZXRyaWMiPuWgseeOhzxzdHJvbmcgY2xhc3M9InJhdGUiPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJtZXRyaWMiPuS4i+azqDxzdHJvbmc+","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJtZXRyaWMiPueLgOaFizxzdHJvbmcgY2xhc3M9Ig==","Ij4=","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgICAg","CiAgICAgIDwvZGl2PgogICAg"],["PHNwYW4gY2xhc3M9InRoZXJtYWwtcmVhc29uIj4=","PC9zcGFuPg=="],["CiAgICAgIDxkaXYgY2xhc3M9InRoZXJtYWwtcGFuZWwiPgogICAgICAgIDxkaXYgY2xhc3M9InRoZXJtYWwtaGVhZCI+CiAgICAgICAgICA8Yj7niIbnoLTlj6/og70g","JTwvYj4KICAgICAgICA8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJlbmVyZ3kiIHRpdGxlPSLniIbnoLTlj6/og70g","JSI+CiAgICAgICAgICA8c3BhbiBjbGFzcz0iZW5lcmd5LWZpbGwiIHN0eWxlPSJ3aWR0aDo=","JSI+PC9zcGFuPgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InRoZXJtYWwtZ3JpZCI+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJ0aGVybWFsLWl0ZW0iPuS7iuaXpTxzdHJvbmc+","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJ0aGVybWFsLWl0ZW0iPuWJjeS4gOWwj+aZgjxzdHJvbmc+","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJ0aGVybWFsLWl0ZW0iPui/kTMw5pelPHN0cm9uZz4=","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJ0aGVybWFsLWl0ZW0iPuS4i+azqOmHjzxzdHJvbmc+","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJ0aGVybWFsLWl0ZW0iPuaooeWei+WIhjxzdHJvbmc+","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJ0aGVybWFsLWl0ZW0iPuaoo+acrOmHjzxzdHJvbmc+","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iZmVhdHVyZS1ibG9jayI+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJmZWF0dXJlLXRpdGxlIj7lhY3osrvpgYrmiLI8L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9ImZlYXR1cmUtaXRlbSI+5pyq6ZaL6L2J5pW4PHN0cm9uZz4=","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJmZWF0dXJlLWl0ZW0iPuWJjeS4gOi9ieaVuDxzdHJvbmc+","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJmZWF0dXJlLWl0ZW0iPuWJjeS6jOi9ieaVuDxzdHJvbmc+","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0idGhlcm1hbC1ub3RlIj4=","77yb5a6M5pW06LOH5paZ5pyD5L6d5Yi35paw56eS5pW46Ieq5YuV5pu05paw44CCPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0idGhlcm1hbC1yZWFzb25zIj4=","PC9kaXY+CiAgICAgIDwvZGl2PgogICAg"],["cm9vbUlkOiA=",""],["5qmf5Y+wOiA=",""],["54uA5oWLOiA=",""],["54iG56C05Y+v6IO9OiA=","JQ=="],["6aCQ5ris6aGe5Z6LOiA=",""],["5qih5Z6L5YiG5pW4OiA=","IC8g",""],["5qij5pys6YePOiA=",""],["5Y6f5ZugOiA=",""],["5YiX6KGoOiB3aW49","IGJldD0=","IHJhdGU9",""],["5LuK5pelOiB3aW49","IGJldD0=","IHJhdGU9",""],["5bCP5pmCOiB3aW49","IGJldD0=","IHJhdGU9",""],["MzDml6U6IHdpbj0=","IGJldD0=","IHJhdGU9",""],["5YWN6LK76YGK5oiyOiDmnKrplovovYnmlbg9","IOWJjeS4gOi9ieaVuD0=","IOWJjeS6jOi9ieaVuD0=",""],["5Y6f5aeLbWdDb3VudHM6IA==",""],["","JQ=="],["","IOi9iQ=="]];const __atgUserText=(i)=>__atgBase64(__atgUserStrings[i]);const __atgTpl=(i,...v)=>{const p=__atgTplParts[i].map(__atgBase64);let o=p[0]||"";for(let j=0;j<v.length;j+=1)o+=v[j]+(p[j+1]||"");return o;};
const page = typeof unsafeWindow !== __atgUserText(0) ? unsafeWindow : window;
const EVENTS = Object.freeze({
REQ_PAGE: __atgUserText(1),
REQ_DETAIL: __atgUserText(2),
REQ_LOCK_TABLE: __atgUserText(3),
REQ_CHANGE_TABLE: __atgUserText(4),
PAGE_RESPONSE: __atgUserText(5),
TABLES_RESPONSE: __atgUserText(6),
DETAIL_RESPONSE: __atgUserText(7),
UPDATED_RESPONSE: __atgUserText(8)
});
const STORAGE_KEY = __atgUserText(9);
const STATUS_EMPTY = __atgUserText(10);
const STATUS_LABELS = Object.freeze({
Empty: __atgUserText(11),
Full: __atgUserText(12),
Locked: __atgUserText(13),
Close: __atgUserText(14)
});
const DEFAULTS = Object.freeze({
minScore: 0,
minRate: 0,
minBet: 0,
maxPages: 10,
detailLimit: 80,
autoRefreshSec: 30,
requestGapMs: 500,
detailGapMs: 700,
onlyEmpty: true,
limit: 40
});
const state = {
rooms: new Map(),
settings: loadSettings(),
connected: false,
scanning: false,
detailsScanning: false,
selectedRoomId: null,
monitoring: false,
dispatchOriginal: null,
lastRequestedDetailRoomId: null,
activeSilentDetailRoomId: null,
activeSilentPage: null,
pageWaiters: new Map(),
pageCounts: new Map(),
detailWaiters: new Map(),
lastMeta: null,
autoRefreshTimer: null,
lastMessage: __atgUserText(15)
};
ready(() => {
createPanel();
applyAdaptiveSettings();
installDispatchPatch();
setInterval(installDispatchPatch, 750);
render();
});
function loadSettings() {
try {
return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || __atgUserText(16)) };
} catch {
return { ...DEFAULTS };
}
}
function saveSettings() {
localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
}
function ready(callback) {
if (document.body) {
callback();
return;
}
document.addEventListener(__atgUserText(17), callback, { once: true });
}
function installDispatchPatch() {
const currentDispatch = page.dispatch;
if (typeof currentDispatch !== __atgUserText(18)) return false;
if (currentDispatch.__atgDemonMathPatched) {
state.connected = true;
return true;
}
state.dispatchOriginal = currentDispatch;
page.dispatch = function patchedDispatch(eventName, payload, ...rest) {
let suppressOriginal = false;
try {
suppressOriginal = captureDispatch(eventName, payload) === true;
} catch (error) {
console.warn(__atgUserText(19), error);
}
if (suppressOriginal) return undefined;
return currentDispatch.call(this, eventName, payload, ...rest);
};
page.dispatch.__atgDemonMathPatched = true;
page.dispatch.__atgDemonMathOriginal = currentDispatch;
state.connected = true;
state.lastMessage = __atgUserText(20);
render();
return true;
}
function captureDispatch(eventName, payload) {
const name = normalizeEventName(eventName);
if (name === EVENTS.REQ_DETAIL) {
state.lastRequestedDetailRoomId = payload && payload.roomId != null ? String(payload.roomId) : null;
return false;
}
if (name === EVENTS.PAGE_RESPONSE || name === EVENTS.TABLES_RESPONSE) {
const pageIndex = processPageResponse(payload);
render();
if (state.activeSilentPage != null && (pageIndex == null || String(pageIndex) === String(state.activeSilentPage))) {
state.activeSilentPage = null;
return true;
}
return false;
}
if (name === EVENTS.DETAIL_RESPONSE) {
processDetailResponse(payload);
render();
if (state.activeSilentDetailRoomId) {
state.activeSilentDetailRoomId = null;
return true;
}
return false;
}
if (name === EVENTS.UPDATED_RESPONSE) {
processStatusUpdates(payload);
render();
}
return false;
}
function normalizeEventName(eventName) {
if (typeof eventName === __atgUserText(21)) return eventName;
if (eventName && typeof eventName.name === __atgUserText(22)) return eventName.name;
if (eventName && typeof eventName.type === __atgUserText(23)) return eventName.type;
return String(eventName);
}
function processPageResponse(payload) {
const data = unwrapData(payload);
const tables = firstArray(data.tables, payload && payload.tables, data.slotTables);
if (!tables.length) return;
state.lastMeta = data.tableMeta || (payload && payload.tableMeta) || state.lastMeta;
const pageIndex = getCurrentPage(payload || {}, data);
if (pageIndex != null) state.pageCounts.set(String(pageIndex), tables.length);
for (const table of tables) {
if (!table || typeof table !== __atgUserText(24)) continue;
const room = normalizeRoom(table, pageIndex);
if (!room.roomId) continue;
const previous = state.rooms.get(room.roomId);
state.rooms.set(room.roomId, previous ? mergeRoom(previous, room) : room);
}
resolvePageWaiter(pageIndex, true);
applyAdaptiveSettings();
state.lastMessage = __atgTpl(0,state.rooms.size);
return pageIndex;
}
function processDetailResponse(payload) {
const data = unwrapData(payload);
const detail = data.detail || (payload && payload.detail);
if (!detail || typeof detail !== __atgUserText(25)) return;
const roomId = String(
data.roomId ||
(data.table && data.table.roomId) ||
detail.roomId ||
state.activeSilentDetailRoomId ||
state.lastRequestedDetailRoomId ||
__atgUserText(26)
);
if (!roomId) return;
const current = state.rooms.get(roomId) || emptyRoom(roomId);
const today = rateFromPair(detail.todayWin, detail.todayBet);
const hour = rateFromPair(detail.hourWin, detail.hourBet);
const day = rateFromPair(detail.dayWin, detail.dayBet);
const mgCounts = Array.isArray(detail.mgCounts) ? detail.mgCounts.map(toNumber) : [];
state.rooms.set(roomId, {
...current,
detailLoaded: true,
detailRaw: detail,
todayWin: today.win,
todayBet: today.bet,
todayRate: today.rate,
hourWin: hour.win,
hourBet: hour.bet,
hourRate: hour.rate,
dayWin: day.win,
dayBet: day.bet,
dayRate: day.rate,
notOpenTurns: mgCounts[0] == null ? current.notOpenTurns : mgCounts[0],
previousOneTurns: mgCounts[1] == null ? current.previousOneTurns : mgCounts[1],
previousTwoTurns: mgCounts[2] == null ? current.previousTwoTurns : mgCounts[2],
mgCounts,
rate: today.rate == null ? current.rate : today.rate,
bet: today.rate == null ? current.bet : today.bet,
updatedAt: Date.now()
});
resolveDetailWaiter(roomId, true);
}
function resolveDetailWaiter(roomId, ok) {
const key = String(roomId || __atgUserText(27));
const waiter = state.detailWaiters.get(key);
if (!waiter) return;
clearTimeout(waiter.timer);
state.detailWaiters.delete(key);
waiter.resolve(ok);
}
function processStatusUpdates(payload) {
const data = unwrapData(payload);
const updates = data.updates && typeof data.updates === __atgUserText(28) ? data.updates : data;
for (const [roomId, status] of Object.entries(updates)) {
const room = state.rooms.get(String(roomId));
if (room) state.rooms.set(String(roomId), { ...room, status: String(status), updatedAt: Date.now() });
}
}
function emptyRoom(roomId) {
return {
roomId,
number: /^\d+$/.test(roomId) ? roomId.padStart(3, __atgUserText(29)) : roomId,
status: __atgUserText(30),
page: null,
rate: 0,
bet: 0,
win: 0,
listRate: 0,
listBet: 0,
listWin: 0,
rateSource: __atgUserText(31),
detailLoaded: false,
updatedAt: Date.now()
};
}
function mergeRoom(previous, next) {
const keepDetail = previous.detailLoaded === true;
return {
...previous,
...next,
detailLoaded: keepDetail,
detailRaw: keepDetail ? previous.detailRaw : next.detailRaw,
todayWin: keepDetail && previous.todayWin != null ? previous.todayWin : next.todayWin,
todayBet: keepDetail && previous.todayBet != null ? previous.todayBet : next.todayBet,
todayRate: keepDetail && previous.todayRate != null ? previous.todayRate : next.todayRate,
hourWin: keepDetail ? previous.hourWin : next.hourWin,
hourBet: keepDetail ? previous.hourBet : next.hourBet,
hourRate: keepDetail ? previous.hourRate : next.hourRate,
dayWin: keepDetail ? previous.dayWin : next.dayWin,
dayBet: keepDetail ? previous.dayBet : next.dayBet,
dayRate: keepDetail ? previous.dayRate : next.dayRate,
notOpenTurns: keepDetail ? previous.notOpenTurns : next.notOpenTurns,
previousOneTurns: keepDetail ? previous.previousOneTurns : next.previousOneTurns,
previousTwoTurns: keepDetail ? previous.previousTwoTurns : next.previousTwoTurns,
mgCounts: keepDetail ? previous.mgCounts : next.mgCounts,
updatedAt: Date.now()
};
}
function normalizeRoom(table, pageIndex) {
const roomId = table.roomId == null ? __atgUserText(32) : String(table.roomId);
let number = table.number == null ? roomId : String(table.number);
if (/^\d+$/.test(number)) number = number.padStart(3, __atgUserText(33));
const list = rateFromPair(table.win, table.bet);
const today = table.today && typeof table.today === __atgUserText(34) ? rateFromPair(table.today.win, table.today.bet) : {};
const primaryRate = today.rate == null ? list.rate : today.rate;
const primaryBet = today.rate == null ? list.bet : today.bet;
const primaryWin = today.rate == null ? list.win : today.win;
return {
roomId,
number,
status: String(table.status || __atgUserText(35)),
userId: table.user && table.user.userId != null ? String(table.user.userId) : __atgUserText(36),
page: pageIndex || null,
rate: primaryRate == null ? 0 : primaryRate,
bet: primaryBet || 0,
win: primaryWin || 0,
listRate: list.rate == null ? 0 : list.rate,
listBet: list.bet || 0,
listWin: list.win || 0,
todayRate: today.rate,
todayBet: today.bet,
todayWin: today.win,
rateSource: today.rate == null ? __atgUserText(37) : __atgUserText(38),
detailLoaded: false,
raw: table,
updatedAt: Date.now()
};
}
function rateFromPair(winValue, betValue) {
const win = toNumber(winValue);
const bet = toNumber(betValue);
return { win, bet, rate: bet > 0 ? (win / bet) * 100 : null };
}
function unwrapData(payload) {
if (!payload || typeof payload !== __atgUserText(39)) return {};
return payload.data && typeof payload.data === __atgUserText(40) ? payload.data : payload;
}
function firstArray(...values) {
for (const value of values) {
if (Array.isArray(value)) return value;
}
return [];
}
function getCurrentPage(payload, data) {
return (
(data.tableMeta && data.tableMeta.currentPage) ||
(payload.tableMeta && payload.tableMeta.currentPage) ||
(state.lastMeta && state.lastMeta.currentPage) ||
payload.page ||
null
);
}
function toNumber(value) {
if (value == null || value === __atgUserText(41)) return 0;
if (typeof value === __atgUserText(42)) return Number.isFinite(value) ? value : 0;
const normalized = String(value).replace(/,/g, __atgUserText(43)).replace(__atgUserText(44), __atgUserText(45)).trim();
const parsed = Number(normalized);
return Number.isFinite(parsed) ? parsed : 0;
}
function clamp(value, min, max) {
return Math.max(min, Math.min(max, value));
}
function normalize(value, min, max) {
if (value == null || !Number.isFinite(value)) return 0;
if (max <= min) return 0;
return clamp((value - min) / (max - min), 0, 1);
}
function confidenceFromBet(bet) {
const value = Math.max(0, toNumber(bet));
if (value <= 0) return 0;
return clamp((Math.log10(value + 1) / 4.2) * 100, 0, 100);
}
function scoreRoom(room) {
const currentRate = room.todayRate ?? room.rate ?? 0;
const hourRate = room.hourRate ?? currentRate;
const dayRate = room.dayRate ?? room.listRate ?? currentRate;
const primaryBet = room.todayBet || room.bet || room.listBet || 0;
const confidence = confidenceFromBet(primaryBet);
const lowVolumeHighRate = currentRate >= 180 && confidence < 48;
const shortSpike = hourRate >= 220 && dayRate < 150;
const extremeSpike = currentRate >= 320;
const heatScore = normalize(currentRate, 85, 220) * 30;
const hourMomentum = normalize(hourRate - dayRate, -35, 85) * 18;
const dayBase = normalize(dayRate, 75, 155) * 16;
const volumeScore = (confidence / 100) * 14;
const cycleScore = normalize(room.notOpenTurns ?? 0, 0, 420) * 14;
const consistencyScore = normalize(Math.min(currentRate, hourRate, dayRate), 70, 135) * 8;
let penalty = 0;
if (confidence < 22) penalty += 10;
if (currentRate > 260 && confidence < 45) penalty += 8;
if (lowVolumeHighRate) penalty += 14;
if (shortSpike) penalty += 10;
if (extremeSpike) penalty += 6;
if (room.status !== STATUS_EMPTY) penalty += 7;
const score = clamp(heatScore + hourMomentum + dayBase + volumeScore + cycleScore + consistencyScore - penalty, 0, 100);
const tags = [];
const reasons = [];
if (currentRate >= 150) {
tags.push(__atgUserText(46));
reasons.push(__atgTpl(1,formatRate(currentRate)));
}
if (hourRate - dayRate >= 25) {
tags.push(__atgUserText(47));
reasons.push(__atgTpl(2,formatRate(hourRate - dayRate)));
}
if ((room.notOpenTurns ?? 0) >= 120) {
tags.push(__atgUserText(48));
reasons.push(__atgTpl(3,formatInteger(room.notOpenTurns)));
}
if (confidence >= 70) {
tags.push(__atgUserText(49));
reasons.push(__atgTpl(4,confidence.toFixed(0)));
}
if (lowVolumeHighRate) {
tags.push(__atgUserText(50));
reasons.push(__atgUserText(51));
}
if (shortSpike) {
tags.push(__atgUserText(52));
reasons.push(__atgUserText(53));
}
if (!room.detailLoaded) {
tags.push(__atgUserText(54));
reasons.push(__atgUserText(55));
}
if (!tags.length) tags.push(__atgUserText(56));
const burstProbability = predictBurstProbability({
room,
score,
confidence,
currentRate,
hourRate,
dayRate
});
const prediction = predictRoomType({
room,
burstProbability,
confidence,
currentRate,
hourRate,
dayRate
});
return {
score,
confidence,
burstProbability,
prediction,
tier: tierOf(score, confidence),
tags,
reasons,
currentRate,
hourRate,
dayRate,
primaryBet
};
}
function predictBurstProbability({ room, score, confidence, currentRate, hourRate, dayRate }) {
const momentum = hourRate - dayRate;
const cycleTurns = room.notOpenTurns ?? 0;
const lowVolumeHighRate = currentRate >= 180 && confidence < 48;
const shortSpike = hourRate >= 220 && dayRate < 150;
const extremeSpike = currentRate >= 320;
const ratePressure = normalize(currentRate, 90, 240) * 34;
const momentumPressure = normalize(momentum, -20, 90) * 18;
const cyclePressure = normalize(cycleTurns, 0, 450) * 16;
const basePressure = normalize(dayRate, 80, 160) * 10;
const scorePressure = (score / 100) * 12;
const sampleTrust = (confidence / 100) * 10;
let discount = 0;
if (!room.detailLoaded) discount += 6;
if (confidence < 25) discount += 8;
if (room.status !== STATUS_EMPTY) discount += 8;
if (currentRate > 280 && confidence < 50) discount += 7;
if (lowVolumeHighRate) discount += 18;
if (shortSpike) discount += 12;
if (extremeSpike) discount += 8;
let probability = clamp(ratePressure + momentumPressure + cyclePressure + basePressure + scorePressure + sampleTrust - discount, 1, 99);
if (lowVolumeHighRate) probability = Math.min(probability, 56);
if (shortSpike) probability = Math.min(probability, 62);
if (extremeSpike && confidence < 60) probability = Math.min(probability, 52);
return probability;
}
function predictRoomType({ room, burstProbability, confidence, currentRate, hourRate, dayRate }) {
const momentum = hourRate - dayRate;
const notOpenTurns = room.notOpenTurns ?? 0;
const lowVolumeHighRate = currentRate >= 180 && confidence < 48;
const shortSpike = hourRate >= 220 && dayRate < 150;
if (!room.detailLoaded) {
return { type: __atgUserText(57), note: __atgUserText(58) };
}
if (lowVolumeHighRate) {
return { type: __atgUserText(59), note: __atgUserText(60) };
}
if (shortSpike) {
return { type: __atgUserText(61), note: __atgUserText(62) };
}
if (burstProbability >= 82 && momentum >= 25) {
return { type: __atgUserText(63), note: __atgUserText(64) };
}
if (burstProbability >= 76 && notOpenTurns >= 150) {
return { type: __atgUserText(65), note: __atgUserText(66) };
}
if (currentRate >= 160 && confidence >= 62) {
return { type: __atgUserText(67), note: __atgUserText(68) };
}
if (confidence < 35) {
return { type: __atgUserText(69), note: __atgUserText(70) };
}
if (burstProbability >= 62) {
return { type: __atgUserText(71), note: __atgUserText(72) };
}
return { type: __atgUserText(73), note: __atgUserText(74) };
}
function tierOf(score, confidence) {
if (score >= 78 && confidence >= 55) return __atgUserText(75);
if (score >= 65 && confidence >= 40) return __atgUserText(76);
if (score >= 50) return __atgUserText(77);
return __atgUserText(78);
}
async function scanPages(options = {}) {
const refreshDetails = Boolean(options.refreshDetails);
if (!installDispatchPatch()) {
state.lastMessage = __atgUserText(79);
render();
return;
}
if (state.scanning) return;
applyAdaptiveSettings();
state.scanning = true;
render();
try {
for (let pageIndex = 1; pageIndex <= state.settings.maxPages; pageIndex += 1) {
state.lastMessage = __atgTpl(5,pageIndex,state.settings.maxPages);
render();
state.activeSilentPage = String(pageIndex);
const waitForData = waitForPageResponse(pageIndex, Math.max(1200, state.settings.requestGapMs * 3));
page.dispatch(EVENTS.REQ_PAGE, { page: pageIndex });
await waitForData;
state.activeSilentPage = null;
await sleep(Math.min(120, Math.max(40, Math.floor(state.settings.requestGapMs / 5))));
}
applyAdaptiveSettings();
state.lastMessage = __atgTpl(6,state.rooms.size);
} finally {
state.scanning = false;
render();
}
if (refreshDetails) {
await sleep(0);
await completeDetails({ force: true, label: __atgUserText(80) });
}
}
async function completeDetails(options = {}) {
const force = Boolean(options.force);
const label = options.label || __atgUserText(81);
if (!state.rooms.size) {
state.lastMessage = __atgUserText(82);
render();
return;
}
if (!installDispatchPatch() || state.detailsScanning) return;
state.detailsScanning = true;
state.lastMessage = __atgUserText(83);
const rooms = allRankedRooms()
.filter((room) => force || !room.detailLoaded)
.slice(0, state.settings.detailLimit);
if (!rooms.length) {
state.lastMessage = __atgUserText(84);
state.detailsScanning = false;
render();
return;
}
for (let index = 0; index < rooms.length; index += 1) {
const room = rooms[index];
await requestDetailAndWait(room.roomId);
await sleep(120);
}
state.detailsScanning = false;
state.lastMessage = __atgTpl(7,rooms.length);
render();
}
function requestDetail(roomId, shouldRender = true) {
if (!roomId || !installDispatchPatch()) return;
state.lastRequestedDetailRoomId = String(roomId);
state.activeSilentDetailRoomId = String(roomId);
page.dispatch(EVENTS.REQ_DETAIL, { roomId: Number(roomId) || roomId });
if (shouldRender) render();
}
function requestDetailAndWait(roomId) {
const key = String(roomId || __atgUserText(85));
if (!key) return Promise.resolve(false);
const existing = state.detailWaiters.get(key);
if (existing) {
clearTimeout(existing.timer);
state.detailWaiters.delete(key);
existing.resolve(false);
}
return new Promise((resolve) => {
const timer = setTimeout(() => {
state.detailWaiters.delete(key);
resolve(false);
}, Math.max(1500, state.settings.detailGapMs * 4));
state.detailWaiters.set(key, { resolve, timer });
requestDetail(key, false);
});
}
function resolvePageWaiter(pageIndex, ok) {
const key = String(pageIndex || __atgUserText(86));
const waiter = state.pageWaiters.get(key) || state.pageWaiters.get(__atgUserText(87)) || (pageIndex == null ? state.pageWaiters.values().next().value : null);
if (!waiter) return;
clearTimeout(waiter.timer);
state.pageWaiters.delete(waiter.key);
waiter.resolve(ok);
}
function waitForPageResponse(pageIndex, timeoutMs) {
const key = String(pageIndex || __atgUserText(88));
return new Promise((resolve) => {
const timer = setTimeout(() => {
state.pageWaiters.delete(key);
resolve(false);
}, timeoutMs);
state.pageWaiters.set(key, { key, resolve, timer });
});
}
function sleep(ms) {
return new Promise((resolve) => setTimeout(resolve, ms));
}
function filteredRooms() {
const settings = state.settings;
return Array.from(state.rooms.values())
.map((room) => ({ ...room, analysis: scoreRoom(room) }))
.filter((room) => room.analysis.score >= settings.minScore)
.filter((room) => room.rate >= settings.minRate)
.filter((room) => room.bet >= settings.minBet)
.filter((room) => !settings.onlyEmpty || room.status === STATUS_EMPTY)
.sort((a, b) => {
return (
b.analysis.burstProbability - a.analysis.burstProbability ||
b.analysis.score - a.analysis.score ||
b.analysis.confidence - a.analysis.confidence ||
b.rate - a.rate ||
b.bet - a.bet ||
toNumber(a.number) - toNumber(b.number)
);
})
.slice(0, settings.limit);
}
function allRankedRooms() {
return Array.from(state.rooms.values())
.map((room) => ({ ...room, analysis: scoreRoom(room) }))
.sort((a, b) => b.analysis.burstProbability - a.analysis.burstProbability || b.analysis.score - a.analysis.score || b.bet - a.bet);
}
function estimatePageSize() {
let maxCount = 0;
for (const count of state.pageCounts.values()) {
maxCount = Math.max(maxCount, toNumber(count));
}
return clamp(maxCount || 40, 10, 80);
}
function adaptiveLimit() {
const height = Math.max(560, window.innerHeight || document.documentElement.clientHeight || 720);
const rowsByViewport = Math.floor((height - 260) / 72) * 6;
return Math.round(clamp(rowsByViewport || DEFAULTS.limit, 24, 120));
}
function adaptiveMaxPages(limit) {
const pageSize = estimatePageSize();
const targetRooms = Math.max(limit * (state.settings.onlyEmpty ? 3 : 2), pageSize);
const knownPages = Array.from(state.pageCounts.keys()).map(toNumber).filter(Boolean);
const knownMaxPage = knownPages.length ? Math.max(...knownPages) : 0;
const basePages = Math.ceil(targetRooms / pageSize);
const lastPageCount = knownMaxPage ? toNumber(state.pageCounts.get(String(knownMaxPage))) : 0;
const needsDiscovery = !knownMaxPage || lastPageCount >= pageSize * 0.8 || state.rooms.size < limit;
return Math.round(clamp(Math.max(basePages, needsDiscovery ? knownMaxPage + 1 : knownMaxPage || basePages), 1, 50));
}
function applyAdaptiveSettings() {
const limit = adaptiveLimit();
state.settings.limit = limit;
state.settings.detailLimit = Math.round(clamp(limit + Math.ceil(limit / 2), limit, 120));
state.settings.maxPages = adaptiveMaxPages(limit);
syncControlValues();
}
function syncControlValues() {
const host = document.getElementById(__atgUserText(89));
const shadow = host && host.shadowRoot;
if (!shadow) return;
const maxPages = shadow.getElementById(__atgUserText(90));
const limit = shadow.getElementById(__atgUserText(91));
const autoRefreshSec = shadow.getElementById(__atgUserText(92));
if (maxPages) maxPages.value = state.settings.maxPages;
if (limit) limit.value = state.settings.limit;
if (autoRefreshSec) autoRefreshSec.value = state.settings.autoRefreshSec;
}
function setupAutoRefresh() {
if (state.autoRefreshTimer) {
clearInterval(state.autoRefreshTimer);
state.autoRefreshTimer = null;
}
if (!state.monitoring) return;
const seconds = Math.max(10, toNumber(state.settings.autoRefreshSec) || DEFAULTS.autoRefreshSec);
state.autoRefreshTimer = setInterval(() => refreshRooms(__atgUserText(93)), seconds * 1000);
}
function startMonitoring() {
if (state.monitoring) {
state.monitoring = false;
setupAutoRefresh();
state.lastMessage = __atgUserText(94);
render();
return;
}
state.monitoring = true;
setupAutoRefresh();
refreshRooms(__atgUserText(95));
}
function refreshRooms(label = __atgUserText(96)) {
if (state.scanning || state.detailsScanning) return;
applyAdaptiveSettings();
state.lastMessage = __atgTpl(8,label);
render();
scanPages({ refreshDetails: true });
}
function createPanel() {
const oldHost = document.getElementById(__atgUserText(97));
if (oldHost) oldHost.remove();
const host = document.createElement(__atgUserText(98));
host.id = __atgUserText(99);
host.style.position = __atgUserText(100);
host.style.top = __atgUserText(101);
host.style.right = __atgUserText(102);
host.style.zIndex = __atgUserText(103);
document.body.appendChild(host);
const shadow = host.attachShadow({ mode: __atgUserText(104) });
shadow.innerHTML = __atgTpl(9);
bindPanel(shadow);
}
function bindPanel(shadow) {
const panel = shadow.querySelector(__atgUserText(105));
const inputs = {
maxPages: shadow.getElementById(__atgUserText(106)),
autoRefreshSec: shadow.getElementById(__atgUserText(107)),
limit: shadow.getElementById(__atgUserText(108)),
onlyEmpty: shadow.getElementById(__atgUserText(109))
};
for (const [key, input] of Object.entries(inputs)) {
if (input.type === __atgUserText(110)) input.checked = Boolean(state.settings[key]);
else input.value = state.settings[key];
}
const sync = () => {
state.settings.minScore = 0;
state.settings.minRate = 0;
state.settings.minBet = 0;
state.settings.autoRefreshSec = Math.max(10, Math.min(300, toNumber(inputs.autoRefreshSec.value) || DEFAULTS.autoRefreshSec));
state.settings.onlyEmpty = inputs.onlyEmpty.checked;
applyAdaptiveSettings();
saveSettings();
setupAutoRefresh();
render();
};
for (const input of Object.values(inputs)) {
input.addEventListener(input.type === __atgUserText(111) ? __atgUserText(112) : __atgUserText(113), sync);
}
shadow.getElementById(__atgUserText(114)).addEventListener(__atgUserText(115), () => {
sync();
startMonitoring();
});
shadow.getElementById(__atgUserText(116)).addEventListener(__atgUserText(117), () => {
sync();
refreshRooms(__atgUserText(118));
});
shadow.getElementById(__atgUserText(119)).addEventListener(__atgUserText(120), () => {
if (!state.selectedRoomId) {
state.lastMessage = __atgUserText(121);
render();
return;
}
requestDetailAndWait(state.selectedRoomId);
});
shadow.getElementById(__atgUserText(122)).addEventListener(__atgUserText(123), () => {
state.rooms.clear();
state.selectedRoomId = null;
state.lastMessage = __atgUserText(124);
render();
});
shadow.getElementById(__atgUserText(125)).addEventListener(__atgUserText(126), (event) => {
panel.classList.toggle(__atgUserText(127));
event.currentTarget.textContent = panel.classList.contains(__atgUserText(128)) ? __atgUserText(129) : __atgUserText(130);
});
shadow.getElementById(__atgUserText(131)).addEventListener(__atgUserText(132), (event) => {
const enterButton = event.target.closest(__atgUserText(133));
if (enterButton) {
event.stopPropagation();
enterRoom(enterButton.dataset.enterRoomId);
return;
}
const row = event.target.closest(__atgUserText(134));
if (!row) return;
state.selectedRoomId = row.dataset.roomId;
render();
});
}
function enterRoom(roomId) {
const key = String(roomId || __atgUserText(135));
const room = state.rooms.get(key);
if (!room) {
state.lastMessage = __atgUserText(136);
render();
return;
}
if (room.status !== STATUS_EMPTY) {
state.lastMessage = __atgTpl(10,room.number || key);
render();
return;
}
if (!installDispatchPatch()) {
state.lastMessage = __atgUserText(137);
render();
return;
}
state.selectedRoomId = key;
state.lastMessage = __atgTpl(11,room.number || key);
page.dispatch(EVENTS.REQ_LOCK_TABLE, { roomId: Number(key) || key });
render();
}
function render() {
const host = document.getElementById(__atgUserText(138));
if (!host || !host.shadowRoot) return;
const shadow = host.shadowRoot;
const status = shadow.getElementById(__atgUserText(139));
const results = shadow.getElementById(__atgUserText(140));
const monitor = shadow.getElementById(__atgUserText(141));
const scan = shadow.getElementById(__atgUserText(142));
if (!status || !results || !scan || !monitor) return;
scan.disabled = state.scanning;
scan.textContent = state.scanning ? __atgUserText(143) : __atgUserText(144);
monitor.textContent = state.monitoring ? __atgUserText(145) : __atgUserText(146);
status.textContent = state.connected ? state.lastMessage : __atgUserText(147);
const rooms = filteredRooms();
if (!rooms.length) {
results.innerHTML = __atgTpl(12);
return;
}
results.innerHTML = __atgTpl(13,rooms.map(renderRoomRow).join(__atgUserText(148)));
}
function renderRoomRow(room) {
const statusClass = room.status === STATUS_EMPTY ? __atgUserText(149) : __atgUserText(150);
const selected = room.roomId === state.selectedRoomId ? __atgUserText(151) : __atgUserText(152);
const analysis = room.analysis || scoreRoom(room);
const canEnter = room.status === STATUS_EMPTY;
return __atgTpl(14,escapeHtml(room.roomId),selected,escapeHtml(fullRoomTitle(room, analysis)),escapeHtml(room.number || room.roomId),escapeHtml(analysis.tier + __atgUserText(153) + analysis.tags.join(__atgUserText(154))),analysis.burstProbability.toFixed(0),escapeHtml(room.roomId),canEnter ? __atgUserText(155) : __atgUserText(156),formatRate(room.rate),formatNumber(room.bet),statusClass,escapeHtml(STATUS_LABELS[room.status] || room.status || __atgUserText(157)),renderPredictionPanel(room, analysis));
}
function renderPredictionPanel(room, analysis) {
const burst = clamp(analysis.burstProbability, 0, 100);
const reasons = analysis.reasons.length ? analysis.reasons : [__atgUserText(158)];
return __atgTpl(16,burst.toFixed(0),burst.toFixed(1),burst.toFixed(0),formatNullableRate(room.todayRate ?? room.rate),formatNullableRate(room.hourRate),formatNullableRate(room.dayRate),formatNumber(analysis.primaryBet),analysis.score.toFixed(0),analysis.confidence.toFixed(0),formatTurns(room.notOpenTurns),formatTurns(room.previousOneTurns),formatTurns(room.previousTwoTurns),escapeHtml(analysis.prediction.note),reasons.map((reason) => __atgTpl(15,escapeHtml(reason))).join(__atgUserText(159)));
}
function fullRoomTitle(room, analysis) {
return [
__atgTpl(17,room.roomId),
__atgTpl(18,room.number),
__atgTpl(19,STATUS_LABELS[room.status] || room.status || __atgUserText(160)),
__atgTpl(20,analysis.burstProbability.toFixed(1)),
__atgTpl(21,analysis.prediction.type),
__atgTpl(22,analysis.score.toFixed(1),analysis.tier),
__atgTpl(23,analysis.confidence.toFixed(1)),
__atgTpl(24,analysis.reasons.join(__atgUserText(161)) || __atgUserText(162)),
__atgTpl(25,formatNumber(room.listWin),formatNumber(room.listBet),formatRate(room.listRate)),
__atgTpl(26,formatNumber(room.todayWin),formatNumber(room.todayBet),formatNullableRate(room.todayRate)),
__atgTpl(27,formatNumber(room.hourWin),formatNumber(room.hourBet),formatNullableRate(room.hourRate)),
__atgTpl(28,formatNumber(room.dayWin),formatNumber(room.dayBet),formatNullableRate(room.dayRate)),
__atgTpl(29,formatInteger(room.notOpenTurns),formatInteger(room.previousOneTurns),formatInteger(room.previousTwoTurns)),
__atgTpl(30,Array.isArray(room.mgCounts) ? room.mgCounts.join(__atgUserText(163)) : __atgUserText(164))
].join(__atgUserText(165));
}
function formatRate(value) {
return __atgTpl(31,toNumber(value).toFixed(2));
}
function formatNullableRate(value) {
return value == null ? __atgUserText(166) : formatRate(value);
}
function formatNumber(value) {
return new Intl.NumberFormat(__atgUserText(167), { maximumFractionDigits: 2 }).format(toNumber(value));
}
function formatInteger(value) {
return value == null ? __atgUserText(168) : String(Math.round(toNumber(value)));
}
function formatTurns(value) {
return value == null ? __atgUserText(169) : __atgTpl(32,formatInteger(value));
}
function escapeHtml(value) {
return String(value)
.replace(/&/g, __atgUserText(170))
.replace(/</g, __atgUserText(171))
.replace(/>/g, __atgUserText(172))
.replace(/"/g, __atgUserText(173))
.replace(/'/g, __atgUserText(174));
}
})();
