"use strict";
const __atgBase64=(s)=>new TextDecoder().decode(Uint8Array.from(atob(s),(c)=>c.charCodeAt(0)));const __atgSiteStrings=["QVRHX1RIRVJNQUxfREFTSEJPQVJE","QVRHX1RIRVJNQUxfRVhURU5TSU9O","5pys6aCB5Y+q6K6A5Y+W6LOH5paZ5b+r54Wn77yM5LiN5L+u5pS56YGK5oiy55Wr6Z2i77yb5Y+q5pyJ5oyJ5LiL44CM6YCy5YWl44CN5omN5pyD6YCB5Ye66YCy5oi/5oyH5Luk44CC","ZGFpbHlfbW9uaXRvcl9yZXZpZXc=","5a6M5oiQ5LuK5pel55uj5o6n5qqi5p+l","56K66KqN5oi/6ZaT6LOH5paZ5bey5a6M5oiQ6K6A5Y+W77yM5qqi5p+l54iG56C05Y+v6IO944CB6auY54iG6bue5pW46IiH5YWN6LK76YGK5oiy6YCx5pyf44CC","","YmluZF9zb3VyY2VfdXJs","57aB5a6a55uj5ris5L6G5rqQ","5oqK5bi455So6YGK5oiy57ay5Z2A5L+d5a2Y5Yiw5pyD5ZOh6LOH5paZ77yM5pa55L6/5q+P5qyh6ZaL5ZWf55uj5o6n5rWB56iL44CC","","Y2xvdWRfc3luY19jaGVjaw==","5qqi5p+l6Zuy56uv5ZCM5q2l","56K66KqN6Zuy56uv5b+r54Wn5Y+v6KKr5YW25LuW55m75YWl5biz6Jmf5Y2z5pmC6K6A5Y+W44CC","","dGhlcm1hbF9iYWRnZQ==","54ax6IO95p+U5YWJ56ix6Jmf","5YWM5o+b5b6M5pyD5Zyo5pyD5ZOh5Lit5b+D6aGv56S65bCI5bGs56ix6Jmf44CC","cHJpb3JpdHlfY2FyZA==","6auY54iG6KeA5a+f5Y2h","55Si55Sf5LiA57WE5bCI5bGs5Y2h6Jmf77yM5pa55L6/57SA6YyE6auY5Zue5aCx5oi/6ZaT6KeA5a+f5om55qyh44CC","YXJjaGl2ZV9jYXJk","5b+r54Wn5bCB5a2Y5Y2h","55Si55Sf5LiA57WE5bCB5a2Y5Y2h6Jmf77yM5qiZ6KiY6Zuy56uv5b+r54Wn57SA6YyE55So6YCU44CC","56m65oi/","5bey5ru/","6Y6W5a6a","6Zec6ZaJ","bW9uaXRvcg==","","cmFuaw==","5pyq5ZWf55So","6KuL5YWI55m75YWl5biz6Jmf44CC","562J5b6F55m75YWl","YWNjb3VudFBvaW50cw==","YWNjb3VudFN0YXR1cw==","YXV0aEVtYWls","YXV0aEZvcm0=","YXV0aFBhc3N3b3Jk","YXV0aFN0YXR1cw==","Ym91bmRVcmxUZXh0","YnJpZGdlU3RhdHVz","Y2FyZHNMaXN0","Y2hlY2tpbkJ0bg==","Y2xvdWRCdG4=","Y2xvdWRTdGF0dXM=","Y29ubmVjdEJ0bg==","ZGlzcGxheUJhZGdl","ZGlzcGxheVBvaW50cw==","ZmlsdGVyQmV0","ZmlsdGVyQnVyc3Q=","ZmlsdGVyUmFuaw==","ZmlsdGVyUmF0ZQ==","ZmlsdGVyU2VhcmNo","Z2FtZVN0YXR1cw==","bGVkZ2VyTGlzdA==","bG9naW5CdG4=","bG9nb3V0QnRu","bW9uaXRvckJ0bg==","bm90aWNl","b25seUVtcHR5SW5wdXQ=","b3BlblNvdXJjZUJ0bg==","cG9pbnRVbml0SW5wdXQ=","cmVmcmVzaEJ0bg==","cmV3YXJkc0xpc3Q=","cm9vbUNvdW50","cm9vbXM=","c2F2ZVNvdXJjZUJ0bg==","c29ydE1vZGU=","c291cmNlVXJsSW5wdXQ=","c2lnbnVwQnRu","dGFza3NMaXN0","dXBkYXRlZEF0","dXNlckVtYWls","dmlld1RpdGxl","54ax6IO955uj5o6n5Y+w","5pyD5ZOh5Lit5b+D","5Lu75YuZ5Lit5b+D","5YWM5o+b5Lit5b+D","5Y2h6Jmf5Lit5b+D","6YOo572y6Kit5a6a","bWVzc2FnZQ==","c3VibWl0","Y2xpY2s=","Y2xpY2s=","Y2xpY2s=","Y2xpY2s=","Y2xpY2s=","c3RhcnRfbW9uaXRvcmluZw==","Y2xpY2s=","cmVmcmVzaA==","Y2hhbmdl","Ymx1cg==","Y2xpY2s=","Y2xpY2s=","Y2xpY2s=","aW5wdXQ=","Y2hhbmdl","Y2xpY2s=","W2RhdGEtdmlld10=","W2RhdGEtZW50ZXItcm9vbS1pZF0=","W2RhdGEtdGFzay1pZF0=","W2RhdGEtcmV3YXJkLWlkXQ==","YnJpZGdlX3JlYWR5","YnJpZGdlX2Nvbm5lY3RlZA==","5pO05YWF5bey6YCj57ea77yM5q2j5Zyo6K6A5Y+W6YGK5oiy6aCB5b+r54Wn44CC","YnJpZGdlX2Rpc2Nvbm5lY3RlZA==","5pO05YWF5bey5Lit5pa377yM5LuN5Y+v6K6A5Y+W6Zuy56uv5pyA5b6M5b+r54Wn44CC","YnJpZGdlX2Vycm9y","5pO05YWF5qmL5o6l55m855Sf6Yyv6Kqk44CC","c25hcHNob3Q=","6LOH5paZ5bey5pu05paw44CC","c3RhdHVz","5bCa5pyq6Kit5a6aIFN1cGFiYXNl77yM6KuL5YWI5aGr5a+rIGRvY3Mvc3VwYWJhc2UtY29uZmlnLmpz44CC","ZnVuY3Rpb24=","U3VwYWJhc2UgU0RLIOi8ieWFpeWkseaVl++8jOiri+eiuuiqjee2sui3r+aIliBDRE7jgII=","5bey55m75YWl44CC","6KuL55m75YWl5oiW6Ki75YaK5biz6Jmf44CC","5bey55m75YWl44CC","6KuL55m75YWl5oiW6Ki75YaK5biz6Jmf44CC","55m75YWl5LitLi4u","","55m75YWl5oiQ5Yqf44CC","5bu656uL5biz6Jmf5LitLi4u","","6Ki75YaK5oiQ5Yqf77yM5bey55m75YWl44CC","6Ki75YaK5oiQ5Yqf77yM6KuL5L6dIFN1cGFiYXNlIOioreWumueiuuiqjeS/oeeuseOAgg==","55m75Ye65LitLi4u","5bey55m75Ye644CC","Y29ubmVjdA==","Z2V0X3NuYXBzaG90","Kg==","dXBkYXRlX3NldHRpbmdz","6YCj57ea5Lit","YnJvYWRjYXN0ZXJz","dXNlcl9pZA==","dXNlcl9pZA==","UEdSU1QxMTY=","6LOH5paZ5bqr5pyq5a6M5oiQ6Kit5a6a","YXRnLWxpdmUtc25hcHNob3Rz","cG9zdGdyZXNfY2hhbmdlcw==","Kg==","cHVibGlj","bGl2ZV9zbmFwc2hvdHM=","aWQ9ZXEubWFpbg==","U1VCU0NSSUJFRA==","5o6o6YCB5Lit","5o6l5pS25Lit","6YCj57ea5Lit","5pyq5ZWf55So","bGl2ZV9zbmFwc2hvdHM=","c25hcHNob3QsdXBkYXRlZF9hdA==","aWQ=","bWFpbg==","UEdSU1QxMTY=","6K6A5Y+W5aSx5pWX","emgtVFc=","6Zuy56uv6LOH5paZ5bey5pu05paw44CC","5o6o6YCB5Lit","5bey5pqr5YGc","bGl2ZV9zbmFwc2hvdHM=","bWFpbg==","aWQ=","5o6o6YCB5aSx5pWX","5o6o6YCB5Lit","6LyJ5YWl5pyD5ZOh6LOH5paZ5LitLi4u","5L2/55So5pys5qmf6LOH5paZ44CC","5pyD5ZOh6LOH5paZ5bey5ZCM5q2l44CC","5pyD5ZOh6LOH5paZ5bqr5bCa5pyq5a6M5pW05aWX55So77yM5pqr55So5pys5qmf6LOH5paZ44CC","bWVtYmVy","QA==","cHJvZmlsZXM=","","aWQ=","cHJvZmlsZXM=","aWQsZW1haWwsZGlzcGxheV9uYW1lLHBvaW50cyxiYWRnZSxyb2xlLGJvdW5kX2dhbWVfdXJsLGxhc3RfY2hlY2tpbl9hdA==","aWQ=","UEdSU1QxMTY=","cG9ydGFsX3Rhc2tz","aWQsdGl0bGUsZGVzY3JpcHRpb24scmV3YXJkX3BvaW50cyx1cmwsc29ydF9vcmRlcixhY3RpdmU=","YWN0aXZl","c29ydF9vcmRlcg==","cmV3YXJkcw==","aWQsdGl0bGUsZGVzY3JpcHRpb24sY29zdF9wb2ludHMsc29ydF9vcmRlcixhY3RpdmU=","YWN0aXZl","c29ydF9vcmRlcg==","cG9pbnRfbGVkZ2Vy","YWN0aW9uLGFtb3VudCxiYWxhbmNlLGNyZWF0ZWRfYXQ=","dXNlcl9pZA==","Y3JlYXRlZF9hdA==","cmV3YXJkX29yZGVycw==","cmV3YXJkX3RpdGxlLGNhcmRfbnVtYmVyLGNvc3RfcG9pbnRzLGNyZWF0ZWRfYXQ=","dXNlcl9pZA==","Y3JlYXRlZF9hdA==","dGFza19jb21wbGV0aW9ucw==","dGFza19pZA==","dXNlcl9pZA==","5LuK5pel5bey57C95Yiw44CC","Y2xhaW1fZGFpbHlfY2hlY2tpbg==","57C95Yiw5a6M5oiQ44CC","5q+P5pel57C95Yiw","57C95Yiw5a6M5oiQ77yM5bey5Yqg5YWl5pys5qmf56mN5YiG44CC","X2JsYW5r","bm9vcGVuZXIsbm9yZWZlcnJlcg==","6YCZ5YCL5Lu75YuZ5bey5a6M5oiQ44CC","Y2xhaW1fdGFzaw==","5Lu75YuZ5a6M5oiQ44CC","5Lu75YuZ5a6M5oiQ77yM5bey5Yqg5YWl5pys5qmf56mN5YiG44CC","56mN5YiG5LiN6Laz77yM54Sh5rOV5YWM5o+b44CC","cmVkZWVtX3Jld2FyZA==","5YWM5o+b5a6M5oiQ44CC","dGhlcm1hbF9iYWRnZQ==","54ax6IO95p+U5YWJ56ix6Jmf","6KuL6Ly45YWl5pyJ5pWI57ay5Z2A44CC","cHJvZmlsZXM=","aWQ=","57ay5Z2A5bey5pqr5a2Y5pys5qmf77yM6LOH5paZ5bqr5pu05paw5aSx5pWX44CC","55uj5ris5L6G5rqQ5bey5L+d5a2Y44CC","55uj5ris5L6G5rqQ5bey5L+d5a2Y5Yiw5pys5qmf44CC","","5bCa5pyq6Kit5a6a5Y+v6ZaL5ZWf55qE57ay5Z2A44CC","X2JsYW5r","bm9vcGVuZXIsbm9yZWZlcnJlcg==","c3RyaW5n","5aSW6YOo5qmL5o6l6LOH5paZ5qC85byP5LiN5YyF5ZCrIHJvb21z44CC","ZXh0ZXJuYWw=","5aSW6YOo5qmL5o6l6LOH5paZ5bey5pu05paw44CC","cmFuaw==","LnZpZXc=","YWN0aXZl","W2RhdGEtdmlld10=","YWN0aXZl","55uu5YmN5LiN5piv5pys5qmf5pO05YWF6YCj57ea54uA5oWL77yM6Zuy56uv5b+r54Wn5Y+q6IO95p+l55yL5LiN6IO96YCy5oi/44CC","ZW50ZXJfcm9vbQ==","aXMtYXV0aGVk","5bey55m75YWl","","5pys5qmf6YCj57ea","5qmL5o6l5b6F5ZG9","562J5b6F5pO05YWF","6Zuy56uv5b+r54Wn","ZXh0ZXJuYWw=","5aSW6YOo5qmL5o6l","5bey6K6A5Y+W","5bCa5pyq6K6A5Y+W","emgtVFc=","LQ==","","","5pqr5YGc5o6o6YCB","5ZWf55So5o6o6YCB","5o6l5pS25qih5byP","5bCa5pyq6K6A5Yiw5oi/6ZaT6LOH5paZ77yM6KuL5oyJ5Yi35paw5oiW562J5b6F55uj5o6n5a6M5oiQ44CC","5bCa5pyq5Y+W5b6X6YGK5oiy5b+r54Wn44CC","","5LiA6Iis5pyD5ZOh","5bCa5pyq57aB5a6a","56mN5YiG55Ww5YuV","ZW1wdHk=","aG90LXRleHQ=","Kw==","","","","ZGlzYWJsZWQ=","","5bey5a6M5oiQ","5a6M5oiQ5Lu75YuZ","","","","5YWM5o+b5Y2h","LQ==","","RW1wdHk=","ZW1wdHk=","YnVzeQ==","IC8g","LQ==","LQ==","LQ==","","5rqW5YKZ5bqm","6YCx5pyf","","","","","","ZGlzYWJsZWQ=","","","RW1wdHk=","YnVyc3Q=","cG9pbnRz","cmF0ZQ==","","562J5b6F55m75YWl","","","QA==","bWVtYmVy","5LiA6Iis5pyD5ZOh","bWVtYmVy","","e30=","Z3Vlc3Q=","b2JqZWN0","6KuL5YWI55m75YWl5biz6Jmf44CC","55m75YWl5pyN5YuZ5bCa5pyq5Yid5aeL5YyW44CC","5bCa5pyq6Kit5a6aIFN1cGFiYXNl44CC","6KuL6Ly45YWlIEVtYWlsIOiIh+WvhueivOOAgg==","5a+G56K86Iez5bCR6ZyA6KaBIDYg5YCL5a2X5YWD44CC","c3RyaW5n","c3RyaW5n","WU9VUl8=","WU9VUl8=","5pON5L2c5aSx5pWX44CC","aW52YWxpZCBsb2dpbiBjcmVkZW50aWFscw==","RW1haWwg5oiW5a+G56K85LiN5q2j56K644CC","ZW1haWwgbm90IGNvbmZpcm1lZA==","RW1haWwg5bCa5pyq56K66KqN77yM6KuL5YWI5p+l55yL5L+h566x44CC","dXNlciBhbHJlYWR5IHJlZ2lzdGVyZWQ=","6YCZ5YCLIEVtYWlsIOW3suiou+WGiu+8jOiri+ebtOaOpeeZu+WFpeOAgg==","c2lnbnVwIGRpc2FibGVk","U3VwYWJhc2Ug55uu5YmN5pyq6ZaL5pS+6Ki75YaK77yM6KuL5YiwIEF1dGhlbnRpY2F0aW9uIOioreWumuWVn+eUqOOAgg==","cGFzc3dvcmQ=","5a+G56K85qC85byP5LiN56ym5ZCI6KaP5YmH77yM6KuL6Iez5bCR6Ly45YWlIDYg5YCL5a2X5YWD44CC","","aHR0cDovLw==","aHR0cHM6Ly8=","","LQ==","LQ==","ZW4tVVM=","LQ==","LQ==","LQ==","5bey5Zyo5Y2A6ZaT","LQ==","MA==","LQ==","MA==","LQ==","emgtVFc=","JmFtcDs=","Jmx0Ow==","Jmd0Ow==","JnF1b3Q7","JiMzOTs="];const __atgSiteTplParts=[["","",""],["6Zuy56uv6LOH5paZ5bey5pu05paw77ya",""],["5a6M5oiQ5Lu75YuZ77ya",""],["56K66KqN5raI6ICXIA==","IOepjeWIhuWFjOaPm+OAjA==","44CN77yf"],["5YWM5o+b77ya",""],["5YWM5o+b5a6M5oiQ77yM5Y2h6JmfIA==",""],["5aSW6YOo5qmL5o6l6LOH5paZ6Kej5p6Q5aSx5pWX77ya",""],["dmlldy0=",""],["5bey6YCB5Ye66YCy5YWlIA==","IOeahOaMh+S7pOOAgg=="],["PGRpdiBjbGFzcz0iZW1wdHktc3RhdGUiPg==","PC9kaXY+"],["PGRpdiBjbGFzcz0iZW1wdHktc3RhdGUiPuebruWJjeaykuacieespuWQiOevqemBuOaineS7tueahOaIv+mWk+OAgjwvZGl2Pg=="],["PGRpdiBjbGFzcz0iZW1wdHktc3RhdGUiPuWwmueEoeepjeWIhue0gOmMhOOAgjwvZGl2Pg=="],["CiAgICAgICAgPGFydGljbGUgY2xhc3M9InJlY29yZC1jYXJkIj4KICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgIDxzdHJvbmc+","PC9zdHJvbmc+CiAgICAgICAgICAgIDxzbWFsbD4=","PC9zbWFsbD4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPHNwYW4gY2xhc3M9Ig==","Ij4=","","PC9zcGFuPgogICAgICAgIDwvYXJ0aWNsZT4KICAgICAg"],["CiAgICAgICAgPGFydGljbGUgY2xhc3M9ImNhdGFsb2ctY2FyZCI+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJjYXRhbG9nLW1ldGEiPgogICAgICAgICAgICA8c3Bhbj7ku7vli5k8L3NwYW4+CiAgICAgICAgICAgIDxiPis=","IOepjeWIhjwvYj4KICAgICAgICAgIDwvZGl2PgogICAgICAgICAgPGgzPg==","PC9oMz4KICAgICAgICAgIDxwPg==","PC9wPgogICAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGRhdGEtdGFzay1pZD0i","IiA=","Pg==","PC9idXR0b24+CiAgICAgICAgPC9hcnRpY2xlPgogICAgICA="],["CiAgICAgIDxhcnRpY2xlIGNsYXNzPSJjYXRhbG9nLWNhcmQiPgogICAgICAgIDxkaXYgY2xhc3M9ImNhdGFsb2ctbWV0YSI+CiAgICAgICAgICA8c3Bhbj7lhYzmj5s8L3NwYW4+CiAgICAgICAgICA8Yj4=","IOepjeWIhjwvYj4KICAgICAgICA8L2Rpdj4KICAgICAgICA8aDM+","PC9oMz4KICAgICAgICA8cD4=","PC9wPgogICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBkYXRhLXJld2FyZC1pZD0i","Ij7nq4vljbPlhYzmj5s8L2J1dHRvbj4KICAgICAgPC9hcnRpY2xlPgogICAg"],["PGRpdiBjbGFzcz0iZW1wdHktc3RhdGUiPuWwmueEoeWFjOaPm+WNoeiZn+OAgjwvZGl2Pg=="],["CiAgICAgIDxhcnRpY2xlIGNsYXNzPSJyZWNvcmQtY2FyZCI+CiAgICAgICAgPGRpdj4KICAgICAgICAgIDxzdHJvbmc+","PC9zdHJvbmc+CiAgICAgICAgICA8c21hbGw+","IC8g5raI6ICXIA==","IOepjeWIhjwvc21hbGw+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPHNwYW4gY2xhc3M9ImhvdC10ZXh0Ij4=","PC9zcGFuPgogICAgICA8L2FydGljbGU+CiAgICA="],["PHNwYW4+","PC9zcGFuPg=="],["PGRpdiBjbGFzcz0icmVhc29uLWxpc3QiPg==","PC9kaXY+"],["CiAgICA8YXJ0aWNsZSBjbGFzcz0icm9vbS1jYXJkIj4KICAgICAgPGRpdiBjbGFzcz0icm9vbS1oZWFkIj4KICAgICAgICA8ZGl2IGNsYXNzPSJtYWNoaW5lIj4KICAgICAgICAgIDxzdHJvbmc+","PC9zdHJvbmc+CiAgICAgICAgICA8c3Bhbj4=","PC9zcGFuPgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InNjb3JlLXN0YWNrIj4KICAgICAgICAgIDxkaXYgY2xhc3M9InNjb3JlLXBpbGwgcmFuayI+PHNwYW4+5Zue5aCx5YiGPC9zcGFuPjxiPg==","PC9iPjwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0ic2NvcmUtcGlsbCBidXJzdCI+PHNwYW4+54iG56C05Y+v6IO9PC9zcGFuPjxiPg==","JTwvYj48L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImVuZXJneSIgdGl0bGU9IueIhuegtOWPr+iDvSA=","JSI+CiAgICAgICAgPHNwYW4gY2xhc3M9ImVuZXJneS1maWxsIiBzdHlsZT0id2lkdGg6","JSI+PC9zcGFuPgogICAgICA8L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0ibWV0cmljcyI+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7loLHnjoc8c3Ryb25nIGNsYXNzPSJyYXRlIj4=","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7kuIvms6g8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7ni4DmhYs8c3Ryb25nIGNsYXNzPSI=","Ij4=","PC9zdHJvbmc+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJkZXRhaWwtZ3JpZCI+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7ku4rml6U8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7liY3kuIDlsI/mmYI8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7ov5EzMOaXpTxzdHJvbmc+","PC9zdHJvbmc+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJmcmVlLWdyaWQiPgogICAgICAgIDxkaXYgY2xhc3M9Im1ldHJpYyI+5pyq6ZaL6L2J5pW4PHN0cm9uZz4=","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7liY3kuIDovYnmlbg8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7liY3kuozovYnmlbg8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwb2ludC1ncmlkIj4KICAgICAgICA8ZGl2IGNsYXNzPSJtZXRyaWMiPumrmOeIhum7nuaVuDxzdHJvbmc+","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7mr4/ovYnpu57mlbg8c3Ryb25nPg==","IA==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7poJDkvLDovYnmlbg8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj4=","PHN0cm9uZz4=","PC9zdHJvbmc+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJwb2ludC1ncmlkIGZvcmVjYXN0LWdyaWQiPgogICAgICAgIDxkaXYgY2xhc3M9Im1ldHJpYyI+5YWN6YGK55uu5qiZPHN0cm9uZz4=","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7pgLHmnJ/ljYDplpM8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7lianppJjljYDplpM8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj4=","PHN0cm9uZz4=","PC9zdHJvbmc+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJkZXRhaWwtZ3JpZCI+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7li5Xog708c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7pgLHmnJ/lo5Plips8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7lm57okL3poqjpmqo8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJkZXRhaWwtZ3JpZCI+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7mqKPmnKzlj6/kv6E8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7mqKPmnKznvLrlj6M8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0ibWV0cmljIj7mqKPmnKznm67mqJk8c3Ryb25nPg==","PC9zdHJvbmc+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA=","CiAgICAgIDxkaXYgY2xhc3M9InJvb20tYWN0aW9ucyI+CiAgICAgICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIGRhdGEtZW50ZXItcm9vbS1pZD0i","IiBkYXRhLWVudGVyLXJvb20tbnVtYmVyPSI=","IiA=","PumAsuWFpTwvYnV0dG9uPgogICAgICA8L2Rpdj4KICAgIDwvYXJ0aWNsZT4KICA="],["","IA==",""],["YXRnVGhlcm1hbFBvcnRhbDo=",""],["QVRHLQ==","LQ==","LQ==",""],["aHR0cHM6Ly8=",""],["","JQ=="],["","JQ=="],["","IOi9iQ=="],["","LQ==","IOi9iQ=="],["","IOi9iQ=="],["","LQ==","IOi9iQ=="],["","LQ==",""]];const __atgSiteText=(i)=>__atgBase64(__atgSiteStrings[i]);const __atgSiteTpl=(i,...v)=>{const p=__atgSiteTplParts[i].map(__atgBase64);let o=p[0]||"";for(let j=0;j<v.length;j+=1)o+=v[j]+(p[j+1]||"");return o;};
const PAGE_SOURCE = __atgSiteText(0);
const EXT_SOURCE = __atgSiteText(1);
const DEFAULT_NOTICE = __atgSiteText(2);
const DEFAULT_TASKS = Object.freeze([
{
id: __atgSiteText(3),
title: __atgSiteText(4),
description: __atgSiteText(5),
reward_points: 20,
url: __atgSiteText(6),
sort_order: 10
},
{
id: __atgSiteText(7),
title: __atgSiteText(8),
description: __atgSiteText(9),
reward_points: 30,
url: __atgSiteText(10),
sort_order: 20
},
{
id: __atgSiteText(11),
title: __atgSiteText(12),
description: __atgSiteText(13),
reward_points: 40,
url: __atgSiteText(14),
sort_order: 30
}
]);
const DEFAULT_REWARDS = Object.freeze([
{
id: __atgSiteText(15),
title: __atgSiteText(16),
description: __atgSiteText(17),
cost_points: 120,
sort_order: 10
},
{
id: __atgSiteText(18),
title: __atgSiteText(19),
description: __atgSiteText(20),
cost_points: 220,
sort_order: 20
},
{
id: __atgSiteText(21),
title: __atgSiteText(22),
description: __atgSiteText(23),
cost_points: 320,
sort_order: 30
}
]);
const STATUS_LABELS = Object.freeze({
Empty: __atgSiteText(24),
Full: __atgSiteText(25),
Locked: __atgSiteText(26),
Close: __atgSiteText(27)
});
const state = {
activeView: __atgSiteText(28),
bridgeReady: false,
bridgeConnected: false,
snapshot: null,
notice: DEFAULT_NOTICE,
filters: {
search: __atgSiteText(29),
minRank: 0,
minBurst: 0,
minRate: 0,
minBet: 0,
onlyEmpty: true,
sort: __atgSiteText(30)
},
cloud: {
canPublish: false,
channel: null,
lastPublishedAt: 0,
publishTimer: null,
publishing: false,
status: __atgSiteText(31)
},
auth: {
busy: false,
client: null,
configured: false,
status: __atgSiteText(32),
user: null
},
portal: {
dbReady: false,
loading: false,
status: __atgSiteText(33),
profile: null,
tasks: [...DEFAULT_TASKS],
rewards: [...DEFAULT_REWARDS],
completedTasks: new Set(),
ledger: [],
orders: []
}
};
const els = {
accountPoints: byId(__atgSiteText(34)),
accountStatus: byId(__atgSiteText(35)),
authEmail: byId(__atgSiteText(36)),
authForm: byId(__atgSiteText(37)),
authPassword: byId(__atgSiteText(38)),
authStatus: byId(__atgSiteText(39)),
boundUrlText: byId(__atgSiteText(40)),
bridgeStatus: byId(__atgSiteText(41)),
cardsList: byId(__atgSiteText(42)),
checkinBtn: byId(__atgSiteText(43)),
cloudBtn: byId(__atgSiteText(44)),
cloudStatus: byId(__atgSiteText(45)),
connectBtn: byId(__atgSiteText(46)),
displayBadge: byId(__atgSiteText(47)),
displayPoints: byId(__atgSiteText(48)),
filterBet: byId(__atgSiteText(49)),
filterBurst: byId(__atgSiteText(50)),
filterRank: byId(__atgSiteText(51)),
filterRate: byId(__atgSiteText(52)),
filterSearch: byId(__atgSiteText(53)),
gameStatus: byId(__atgSiteText(54)),
ledgerList: byId(__atgSiteText(55)),
loginBtn: byId(__atgSiteText(56)),
logoutBtn: byId(__atgSiteText(57)),
monitorBtn: byId(__atgSiteText(58)),
notice: byId(__atgSiteText(59)),
onlyEmptyInput: byId(__atgSiteText(60)),
openSourceBtn: byId(__atgSiteText(61)),
pointUnitInput: byId(__atgSiteText(62)),
refreshBtn: byId(__atgSiteText(63)),
rewardsList: byId(__atgSiteText(64)),
roomCount: byId(__atgSiteText(65)),
rooms: byId(__atgSiteText(66)),
saveSourceBtn: byId(__atgSiteText(67)),
sortMode: byId(__atgSiteText(68)),
sourceUrlInput: byId(__atgSiteText(69)),
signupBtn: byId(__atgSiteText(70)),
tasksList: byId(__atgSiteText(71)),
updatedAt: byId(__atgSiteText(72)),
userEmail: byId(__atgSiteText(73)),
viewTitle: byId(__atgSiteText(74))
};
const viewTitles = {
monitor: __atgSiteText(75),
account: __atgSiteText(76),
tasks: __atgSiteText(77),
redeem: __atgSiteText(78),
cards: __atgSiteText(79),
deploy: __atgSiteText(80)
};
bindEvents();
initAuth();
render();
setInterval(getSnapshot, 8000);
setTimeout(() => {
if (isAuthenticated()) connect();
}, 250);
function byId(id) {
return document.getElementById(id);
}
function bindEvents() {
window.addEventListener(__atgSiteText(81), handleWindowMessage);
els.authForm.addEventListener(__atgSiteText(82), (event) => {
event.preventDefault();
signIn();
});
els.signupBtn.addEventListener(__atgSiteText(83), signUp);
els.logoutBtn.addEventListener(__atgSiteText(84), signOut);
els.cloudBtn.addEventListener(__atgSiteText(85), toggleCloudPublishing);
els.connectBtn.addEventListener(__atgSiteText(86), connect);
els.monitorBtn.addEventListener(__atgSiteText(87), () => send(__atgSiteText(88)));
els.refreshBtn.addEventListener(__atgSiteText(89), () => send(__atgSiteText(90)));
els.pointUnitInput.addEventListener(__atgSiteText(91), updatePointUnit);
els.pointUnitInput.addEventListener(__atgSiteText(92), updatePointUnit);
els.saveSourceBtn.addEventListener(__atgSiteText(93), saveBoundUrl);
els.openSourceBtn.addEventListener(__atgSiteText(94), openBoundUrl);
els.checkinBtn.addEventListener(__atgSiteText(95), claimCheckin);
for (const input of [els.filterSearch, els.filterRank, els.filterBurst, els.filterRate, els.filterBet, els.onlyEmptyInput, els.sortMode]) {
input.addEventListener(__atgSiteText(96), updateFiltersFromInputs);
input.addEventListener(__atgSiteText(97), updateFiltersFromInputs);
}
document.addEventListener(__atgSiteText(98), (event) => {
const nav = event.target.closest(__atgSiteText(99));
if (nav) {
setActiveView(nav.dataset.view);
return;
}
const enter = event.target.closest(__atgSiteText(100));
if (enter) {
enterRoom(enter.dataset.enterRoomId, enter.dataset.enterRoomNumber);
return;
}
const task = event.target.closest(__atgSiteText(101));
if (task) {
completeTask(task.dataset.taskId);
return;
}
const reward = event.target.closest(__atgSiteText(102));
if (reward) {
redeemReward(reward.dataset.rewardId);
}
});
window.updateAtgSnapshotFromPython = updateSnapshotFromExternalBridge;
window.updateLivegameFromPython = updateSnapshotFromExternalBridge;
}
function handleWindowMessage(event) {
if (event.source !== window) return;
const message = event.data;
if (!message || message.source !== EXT_SOURCE) return;
if (message.type === __atgSiteText(103)) {
state.bridgeReady = true;
if (isAuthenticated()) connect();
render();
return;
}
if (!isAuthenticated()) return;
if (message.type === __atgSiteText(104)) {
state.bridgeConnected = true;
state.notice = __atgSiteText(105);
getSnapshot();
} else if (message.type === __atgSiteText(106)) {
state.bridgeConnected = false;
state.notice = __atgSiteText(107);
} else if (message.type === __atgSiteText(108)) {
state.notice = message.payload && message.payload.message ? message.payload.message : __atgSiteText(109);
} else if (message.type === __atgSiteText(110)) {
state.bridgeConnected = true;
state.snapshot = message.payload && message.payload.snapshot ? message.payload.snapshot : message.payload;
state.notice = state.snapshot && state.snapshot.lastMessage ? state.snapshot.lastMessage : __atgSiteText(111);
scheduleCloudPublish();
} else if (message.type === __atgSiteText(112)) {
const payload = message.payload || {};
state.notice = payload.message || state.notice;
}
render();
}
async function initAuth() {
const config = window.ATG_SUPABASE_CONFIG || {};
if (!hasValidSupabaseConfig(config)) {
state.auth.configured = false;
state.auth.status = __atgSiteText(113);
renderAuth();
return;
}
if (!window.supabase || typeof window.supabase.createClient !== __atgSiteText(114)) {
state.auth.configured = false;
state.auth.status = __atgSiteText(115);
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
state.auth.status = state.auth.user ? __atgSiteText(116) : __atgSiteText(117);
} catch (error) {
state.auth.status = formatAuthError(error);
}
state.auth.client.auth.onAuthStateChange((_event, session) => {
state.auth.user = session ? session.user : null;
state.auth.status = state.auth.user ? __atgSiteText(118) : __atgSiteText(119);
if (!state.auth.user) {
clearDashboard();
teardownCloud();
clearPortal();
}
render();
if (state.auth.user) {
afterSignedIn();
}
});
render();
if (state.auth.user) afterSignedIn();
}
async function afterSignedIn() {
await loadPortal();
await setupCloud();
connect();
}
async function signIn() {
if (!requireAuthClient()) return;
const credentials = readCredentials();
if (!credentials) return;
state.auth.busy = true;
state.auth.status = __atgSiteText(120);
renderAuth();
try {
const { data, error } = await state.auth.client.auth.signInWithPassword(credentials);
if (error) throw error;
state.auth.user = data && data.session ? data.session.user : state.auth.user;
els.authPassword.value = __atgSiteText(121);
state.auth.status = __atgSiteText(122);
} catch (error) {
state.auth.status = formatAuthError(error);
} finally {
state.auth.busy = false;
render();
if (state.auth.user) afterSignedIn();
}
}
async function signUp() {
if (!requireAuthClient()) return;
const credentials = readCredentials();
if (!credentials) return;
state.auth.busy = true;
state.auth.status = __atgSiteText(123);
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
els.authPassword.value = __atgSiteText(124);
state.auth.status = data && data.session ? __atgSiteText(125) : __atgSiteText(126);
} catch (error) {
state.auth.status = formatAuthError(error);
} finally {
state.auth.busy = false;
render();
if (state.auth.user) afterSignedIn();
}
}
async function signOut() {
if (!state.auth.client) return;
state.auth.busy = true;
state.auth.status = __atgSiteText(127);
renderAuth();
try {
const { error } = await state.auth.client.auth.signOut();
if (error) throw error;
state.auth.user = null;
teardownCloud();
clearDashboard();
clearPortal();
state.auth.status = __atgSiteText(128);
} catch (error) {
state.auth.status = formatAuthError(error);
} finally {
state.auth.busy = false;
render();
}
}
function connect() {
if (!requireSignedIn()) return;
send(__atgSiteText(129));
}
function getSnapshot() {
if (!isAuthenticated()) return;
send(__atgSiteText(130));
}
function send(type, payload = {}) {
if (!isAuthenticated()) return;
window.postMessage({ source: PAGE_SOURCE, type, ...payload }, __atgSiteText(131));
}
function updatePointUnit() {
if (!isAuthenticated()) return;
const pointUnit = clamp(number(els.pointUnitInput.value), 0, 100000);
els.pointUnitInput.value = String(pointUnit);
send(__atgSiteText(132), { settings: { pointUnit } });
}
async function setupCloud() {
if (!state.auth.client || !state.auth.user) return;
teardownCloud();
state.cloud.status = __atgSiteText(133);
state.cloud.canPublish = false;
state.cloud.publishing = false;
renderCloudControls();
try {
const { data: broadcaster, error: broadcasterError } = await state.auth.client
.from(__atgSiteText(134))
.select(__atgSiteText(135))
.eq(__atgSiteText(136), state.auth.user.id)
.maybeSingle();
if (broadcasterError && broadcasterError.code !== __atgSiteText(137)) throw broadcasterError;
state.cloud.canPublish = Boolean(broadcaster);
state.cloud.publishing = state.cloud.canPublish;
} catch (error) {
state.cloud.status = __atgSiteText(138);
render();
return;
}
await loadCloudSnapshot();
state.cloud.channel = state.auth.client
.channel(__atgSiteText(139))
.on(
__atgSiteText(140),
{ event: __atgSiteText(141), schema: __atgSiteText(142), table: __atgSiteText(143), filter: __atgSiteText(144) },
(payload) => applyCloudSnapshot(payload.new && payload.new.snapshot, payload.new && payload.new.updated_at)
)
.subscribe((status) => {
state.cloud.status = status === __atgSiteText(145) ? (state.cloud.canPublish ? __atgSiteText(146) : __atgSiteText(147)) : __atgSiteText(148);
render();
});
render();
}
function teardownCloud() {
if (state.cloud.publishTimer) {
clearTimeout(state.cloud.publishTimer);
state.cloud.publishTimer = null;
}
if (state.cloud.channel && state.auth.client) {
state.auth.client.removeChannel(state.cloud.channel);
}
state.cloud.channel = null;
state.cloud.canPublish = false;
state.cloud.publishing = false;
state.cloud.status = __atgSiteText(149);
}
async function loadCloudSnapshot() {
if (!state.auth.client) return;
const { data, error } = await state.auth.client
.from(__atgSiteText(150))
.select(__atgSiteText(151))
.eq(__atgSiteText(152), __atgSiteText(153))
.maybeSingle();
if (error && error.code !== __atgSiteText(154)) {
state.cloud.status = __atgSiteText(155);
return;
}
if (data && data.snapshot && !state.bridgeConnected) {
applyCloudSnapshot(data.snapshot, data.updated_at);
}
}
function applyCloudSnapshot(snapshot, updatedAt) {
if (!snapshot || state.bridgeConnected) return;
state.snapshot = {
...snapshot,
cloudMode: true,
cloudUpdatedAt: updatedAt || null
};
state.notice = updatedAt ? __atgSiteTpl(1,new Date(updatedAt).toLocaleTimeString(__atgSiteText(156), { hour12: false })) : __atgSiteText(157);
render();
}
function toggleCloudPublishing() {
if (!state.cloud.canPublish) return;
state.cloud.publishing = !state.cloud.publishing;
state.cloud.status = state.cloud.publishing ? __atgSiteText(158) : __atgSiteText(159);
if (state.cloud.publishing) scheduleCloudPublish();
render();
}
function scheduleCloudPublish() {
if (!state.cloud.canPublish || !state.cloud.publishing || !state.bridgeConnected || !state.snapshot) return;
if (state.cloud.publishTimer) return;
const elapsed = Date.now() - state.cloud.lastPublishedAt;
const delay = Math.max(0, 2500 - elapsed);
state.cloud.publishTimer = setTimeout(() => {
state.cloud.publishTimer = null;
publishCloudSnapshot();
}, delay);
}
async function publishCloudSnapshot() {
if (!state.auth.client || !state.auth.user || !state.cloud.canPublish || !state.cloud.publishing || !state.snapshot) return;
const snapshot = {
...state.snapshot,
cloudMode: false,
publishedAt: Date.now(),
publisher: state.auth.user.email || state.auth.user.id
};
const { error } = await state.auth.client.from(__atgSiteText(160)).upsert(
{
id: __atgSiteText(161),
broadcaster_id: state.auth.user.id,
snapshot,
updated_at: new Date().toISOString()
},
{ onConflict: __atgSiteText(162) }
);
if (error) {
state.cloud.status = __atgSiteText(163);
} else {
state.cloud.lastPublishedAt = Date.now();
state.cloud.status = __atgSiteText(164);
}
render();
}
async function loadPortal() {
if (!state.auth.user) return;
const local = readLocalPortal();
state.portal.loading = true;
state.portal.dbReady = false;
state.portal.status = __atgSiteText(165);
state.portal.profile = local.profile || fallbackProfile();
state.portal.ledger = Array.isArray(local.ledger) ? local.ledger : [];
state.portal.orders = Array.isArray(local.orders) ? local.orders : [];
state.portal.completedTasks = new Set(Array.isArray(local.completedTasks) ? local.completedTasks : []);
state.portal.tasks = [...DEFAULT_TASKS];
state.portal.rewards = [...DEFAULT_REWARDS];
renderPortal();
if (!state.auth.client) {
state.portal.loading = false;
state.portal.status = __atgSiteText(166);
renderPortal();
return;
}
try {
await ensureProfile();
await Promise.all([loadProfile(), loadTasks(), loadRewards(), loadLedger(), loadOrders(), loadCompletedTasks()]);
state.portal.dbReady = true;
state.portal.status = __atgSiteText(167);
} catch (error) {
state.portal.dbReady = false;
state.portal.status = __atgSiteText(168);
} finally {
state.portal.loading = false;
persistLocalFromState();
renderPortal();
}
}
async function ensureProfile() {
const user = state.auth.user;
const displayName = (user.email || __atgSiteText(169)).split(__atgSiteText(170))[0];
const { error } = await state.auth.client.from(__atgSiteText(171)).upsert(
{
id: user.id,
email: user.email || __atgSiteText(172),
display_name: displayName
},
{ onConflict: __atgSiteText(173) }
);
if (error) throw error;
}
async function loadProfile() {
const { data, error } = await state.auth.client
.from(__atgSiteText(174))
.select(__atgSiteText(175))
.eq(__atgSiteText(176), state.auth.user.id)
.maybeSingle();
if (error && error.code !== __atgSiteText(177)) throw error;
state.portal.profile = {
...fallbackProfile(),
...(data || {})
};
}
async function loadTasks() {
const { data, error } = await state.auth.client
.from(__atgSiteText(178))
.select(__atgSiteText(179))
.eq(__atgSiteText(180), true)
.order(__atgSiteText(181), { ascending: true });
if (error) throw error;
state.portal.tasks = data && data.length ? data : [...DEFAULT_TASKS];
}
async function loadRewards() {
const { data, error } = await state.auth.client
.from(__atgSiteText(182))
.select(__atgSiteText(183))
.eq(__atgSiteText(184), true)
.order(__atgSiteText(185), { ascending: true });
if (error) throw error;
state.portal.rewards = data && data.length ? data : [...DEFAULT_REWARDS];
}
async function loadLedger() {
const { data, error } = await state.auth.client
.from(__atgSiteText(186))
.select(__atgSiteText(187))
.eq(__atgSiteText(188), state.auth.user.id)
.order(__atgSiteText(189), { ascending: false })
.limit(30);
if (error) throw error;
state.portal.ledger = data || [];
}
async function loadOrders() {
const { data, error } = await state.auth.client
.from(__atgSiteText(190))
.select(__atgSiteText(191))
.eq(__atgSiteText(192), state.auth.user.id)
.order(__atgSiteText(193), { ascending: false })
.limit(50);
if (error) throw error;
state.portal.orders = data || [];
}
async function loadCompletedTasks() {
const { data, error } = await state.auth.client
.from(__atgSiteText(194))
.select(__atgSiteText(195))
.eq(__atgSiteText(196), state.auth.user.id);
if (error) throw error;
state.portal.completedTasks = new Set((data || []).map((item) => item.task_id));
}
async function claimCheckin() {
if (!requireSignedIn()) return;
const profile = state.portal.profile || fallbackProfile();
if (isToday(profile.last_checkin_at)) {
state.portal.status = __atgSiteText(197);
renderPortal();
return;
}
if (state.portal.dbReady && state.auth.client) {
const { data, error } = await state.auth.client.rpc(__atgSiteText(198));
if (error) {
state.portal.status = formatAuthError(error);
renderPortal();
return;
}
state.portal.status = rpcMessage(data, __atgSiteText(199));
await loadPortal();
return;
}
addLocalPoints(20, __atgSiteText(200));
state.portal.profile.last_checkin_at = new Date().toISOString();
state.portal.status = __atgSiteText(201);
persistLocalFromState();
renderPortal();
}
async function completeTask(taskId) {
if (!requireSignedIn()) return;
const task = state.portal.tasks.find((item) => item.id === taskId);
if (!task) return;
if (task.url) window.open(task.url, __atgSiteText(202), __atgSiteText(203));
if (state.portal.completedTasks.has(taskId)) {
state.portal.status = __atgSiteText(204);
renderPortal();
return;
}
if (state.portal.dbReady && state.auth.client) {
const { data, error } = await state.auth.client.rpc(__atgSiteText(205), { p_task_id: taskId });
if (error) {
state.portal.status = formatAuthError(error);
renderPortal();
return;
}
state.portal.status = rpcMessage(data, __atgSiteText(206));
await loadPortal();
return;
}
state.portal.completedTasks.add(taskId);
addLocalPoints(number(task.reward_points), __atgSiteTpl(2,task.title));
state.portal.status = __atgSiteText(207);
persistLocalFromState();
renderPortal();
}
async function redeemReward(rewardId) {
if (!requireSignedIn()) return;
const reward = state.portal.rewards.find((item) => item.id === rewardId);
if (!reward) return;
const profile = state.portal.profile || fallbackProfile();
const cost = number(reward.cost_points);
if (number(profile.points) < cost) {
state.portal.status = __atgSiteText(208);
renderPortal();
return;
}
if (!window.confirm(__atgSiteTpl(3,formatNumber(cost),reward.title))) return;
if (state.portal.dbReady && state.auth.client) {
const { data, error } = await state.auth.client.rpc(__atgSiteText(209), { p_reward_id: rewardId });
if (error) {
state.portal.status = formatAuthError(error);
renderPortal();
return;
}
state.portal.status = rpcMessage(data, __atgSiteText(210));
await loadPortal();
return;
}
state.portal.profile.points = number(state.portal.profile.points) - cost;
const cardNumber = generateCardNumber();
state.portal.orders.unshift({
reward_title: reward.title,
card_number: cardNumber,
cost_points: cost,
created_at: new Date().toISOString()
});
state.portal.ledger.unshift({
action: __atgSiteTpl(4,reward.title),
amount: -cost,
balance: state.portal.profile.points,
created_at: new Date().toISOString()
});
if (reward.id === __atgSiteText(211)) state.portal.profile.badge = __atgSiteText(212);
state.portal.status = __atgSiteTpl(5,cardNumber);
persistLocalFromState();
renderPortal();
}
async function saveBoundUrl() {
if (!requireSignedIn()) return;
const url = normalizeUrl(els.sourceUrlInput.value.trim());
if (!url) {
state.portal.status = __atgSiteText(213);
renderPortal();
return;
}
state.portal.profile = {
...(state.portal.profile || fallbackProfile()),
bound_game_url: url
};
persistLocalFromState();
if (state.portal.dbReady && state.auth.client) {
const { error } = await state.auth.client
.from(__atgSiteText(214))
.update({ bound_game_url: url })
.eq(__atgSiteText(215), state.auth.user.id);
if (error) state.portal.status = __atgSiteText(216);
else state.portal.status = __atgSiteText(217);
} else {
state.portal.status = __atgSiteText(218);
}
renderPortal();
}
function openBoundUrl() {
const url = normalizeUrl(els.sourceUrlInput.value.trim() || (state.portal.profile && state.portal.profile.bound_game_url) || __atgSiteText(219));
if (!url) {
state.portal.status = __atgSiteText(220);
renderPortal();
return;
}
window.open(url, __atgSiteText(221), __atgSiteText(222));
}
function updateSnapshotFromExternalBridge(payload) {
if (!isAuthenticated()) return;
try {
const data = typeof payload === __atgSiteText(223) ? JSON.parse(payload) : payload;
const snapshot = data && data.snapshot ? data.snapshot : data;
if (!snapshot || !Array.isArray(snapshot.rooms)) {
state.notice = __atgSiteText(224);
render();
return;
}
state.snapshot = {
source: __atgSiteText(225),
ts: Date.now(),
connected: true,
monitoring: true,
scanning: false,
detailsScanning: false,
lastMessage: __atgSiteText(226),
totalRooms: snapshot.totalRooms || snapshot.rooms.length,
...snapshot
};
state.notice = state.snapshot.lastMessage;
scheduleCloudPublish();
render();
} catch (error) {
state.notice = __atgSiteTpl(6,String(error.message || error));
render();
}
}
function updateFiltersFromInputs() {
state.filters.search = els.filterSearch.value.trim().toLowerCase();
state.filters.minRank = clamp(number(els.filterRank.value), 0, 100);
state.filters.minBurst = clamp(number(els.filterBurst.value), 0, 100);
state.filters.minRate = Math.max(0, number(els.filterRate.value));
state.filters.minBet = Math.max(0, number(els.filterBet.value));
state.filters.onlyEmpty = els.onlyEmptyInput.checked;
state.filters.sort = els.sortMode.value || __atgSiteText(227);
renderRooms();
}
function setActiveView(view) {
if (!viewTitles[view]) return;
state.activeView = view;
for (const section of document.querySelectorAll(__atgSiteText(228))) {
section.classList.toggle(__atgSiteText(229), section.id === __atgSiteTpl(7,view));
}
for (const button of document.querySelectorAll(__atgSiteText(230))) {
button.classList.toggle(__atgSiteText(231), button.dataset.view === view);
}
els.viewTitle.textContent = viewTitles[view];
}
function enterRoom(roomId, roomNumber) {
if (!requireSignedIn()) return;
if (!state.bridgeConnected) {
state.notice = __atgSiteText(232);
render();
return;
}
send(__atgSiteText(233), { roomId });
state.notice = __atgSiteTpl(8,roomNumber || roomId);
render();
}
function render() {
renderAuth();
if (!isAuthenticated()) return;
renderStatus();
renderCloudControls();
renderRooms();
renderPortal();
}
function renderAuth() {
const signedIn = isAuthenticated();
document.body.classList.toggle(__atgSiteText(234), signedIn);
els.authStatus.textContent = state.auth.status;
els.userEmail.textContent = signedIn ? state.auth.user.email || __atgSiteText(235) : __atgSiteText(236);
els.loginBtn.disabled = state.auth.busy || !state.auth.configured;
els.signupBtn.disabled = state.auth.busy || !state.auth.configured;
els.logoutBtn.disabled = state.auth.busy || !signedIn;
els.authEmail.disabled = state.auth.busy || !state.auth.configured;
els.authPassword.disabled = state.auth.busy || !state.auth.configured;
}
function renderStatus() {
const snapshot = state.snapshot;
const rooms = snapshot && Array.isArray(snapshot.rooms) ? snapshot.rooms : [];
els.bridgeStatus.textContent = state.bridgeConnected ? __atgSiteText(237) : state.bridgeReady ? __atgSiteText(238) : __atgSiteText(239);
if (snapshot && snapshot.cloudMode && !state.bridgeConnected) els.bridgeStatus.textContent = __atgSiteText(240);
if (snapshot && snapshot.source === __atgSiteText(241) && !state.bridgeConnected) els.bridgeStatus.textContent = __atgSiteText(242);
els.gameStatus.textContent = snapshot && snapshot.connected ? snapshot.lastMessage || __atgSiteText(243) : __atgSiteText(244);
els.roomCount.textContent = String(snapshot ? snapshot.totalRooms || rooms.length : 0);
els.updatedAt.textContent = snapshot && snapshot.ts ? new Date(snapshot.ts).toLocaleTimeString(__atgSiteText(245), { hour12: false }) : __atgSiteText(246);
els.notice.textContent = state.notice;
if (document.activeElement !== els.pointUnitInput) {
els.pointUnitInput.value = String(snapshot && snapshot.settings ? number(snapshot.settings.pointUnit) : 0);
}
const disabledByCloud = Boolean(snapshot && snapshot.cloudMode && !state.bridgeConnected);
els.monitorBtn.disabled = !state.bridgeConnected || !snapshot || !snapshot.connected || snapshot.monitoring;
els.refreshBtn.disabled = !state.bridgeConnected || !snapshot || !snapshot.connected || snapshot.scanning || snapshot.detailsScanning;
els.pointUnitInput.disabled = !state.bridgeConnected;
if (disabledByCloud) {
els.monitorBtn.disabled = true;
els.refreshBtn.disabled = true;
}
const profileUrl = state.portal.profile && state.portal.profile.bound_game_url ? state.portal.profile.bound_game_url : __atgSiteText(247);
if (document.activeElement !== els.sourceUrlInput) {
els.sourceUrlInput.value = profileUrl || (snapshot && snapshot.url) || __atgSiteText(248);
}
}
function renderCloudControls() {
els.cloudStatus.textContent = state.cloud.status;
els.cloudBtn.disabled = !isAuthenticated() || !state.cloud.canPublish;
els.cloudBtn.textContent = state.cloud.canPublish ? (state.cloud.publishing ? __atgSiteText(249) : __atgSiteText(250)) : __atgSiteText(251);
}
function renderRooms() {
const snapshot = state.snapshot;
const rooms = filteredRooms();
if (!snapshot || !Array.isArray(snapshot.rooms) || !snapshot.rooms.length) {
els.rooms.innerHTML = __atgSiteTpl(9,escapeHtml(snapshot && snapshot.connected ? __atgSiteText(252) : __atgSiteText(253)));
return;
}
if (!rooms.length) {
els.rooms.innerHTML = __atgSiteTpl(10);
return;
}
els.rooms.innerHTML = rooms.map((room) => renderRoom(room, { localBridge: state.bridgeConnected })).join(__atgSiteText(254));
}
function renderPortal() {
const profile = state.portal.profile || fallbackProfile();
const points = number(profile.points);
const badge = profile.badge || __atgSiteText(255);
els.displayPoints.textContent = formatNumber(points);
els.displayBadge.textContent = badge;
els.accountPoints.textContent = formatNumber(points);
els.accountStatus.textContent = state.portal.status;
els.boundUrlText.textContent = profile.bound_game_url || __atgSiteText(256);
els.checkinBtn.disabled = state.portal.loading || isToday(profile.last_checkin_at);
renderLedger();
renderTasks();
renderRewards();
renderCards();
}
function renderLedger() {
const ledger = state.portal.ledger || [];
if (!ledger.length) {
els.ledgerList.innerHTML = __atgSiteTpl(11);
return;
}
els.ledgerList.innerHTML = ledger
.slice(0, 30)
.map((item) => {
const amount = number(item.amount);
return __atgSiteTpl(12,escapeHtml(item.action || __atgSiteText(257)),formatDateTime(item.created_at),amount >= 0 ? __atgSiteText(258) : __atgSiteText(259),amount >= 0 ? __atgSiteText(260) : __atgSiteText(261),formatNumber(amount));
})
.join(__atgSiteText(262));
}
function renderTasks() {
const tasks = state.portal.tasks || [];
els.tasksList.innerHTML = tasks
.map((task) => {
const done = state.portal.completedTasks.has(task.id);
return __atgSiteTpl(13,formatNumber(task.reward_points),escapeHtml(task.title),escapeHtml(task.description || __atgSiteText(263)),escapeHtml(task.id),done ? __atgSiteText(264) : __atgSiteText(265),done ? __atgSiteText(266) : __atgSiteText(267));
})
.join(__atgSiteText(268));
}
function renderRewards() {
const rewards = state.portal.rewards || [];
els.rewardsList.innerHTML = rewards
.map((reward) => __atgSiteTpl(14,formatNumber(reward.cost_points),escapeHtml(reward.title),escapeHtml(reward.description || __atgSiteText(269)),escapeHtml(reward.id)))
.join(__atgSiteText(270));
}
function renderCards() {
const orders = state.portal.orders || [];
if (!orders.length) {
els.cardsList.innerHTML = __atgSiteTpl(15);
return;
}
els.cardsList.innerHTML = orders
.map((order) => __atgSiteTpl(16,escapeHtml(order.reward_title || __atgSiteText(271)),formatDateTime(order.created_at),formatNumber(order.cost_points),escapeHtml(order.card_number || __atgSiteText(272))))
.join(__atgSiteText(273));
}
function renderRoom(room, options = {}) {
const burst = clamp(number(room.burstProbability), 0, 100);
const rank = clamp(number(room.rankScore == null ? room.score : room.rankScore), 0, 100);
const statusClass = room.status === __atgSiteText(274) ? __atgSiteText(275) : __atgSiteText(276);
const tag = [room.tier, ...(Array.isArray(room.tags) ? room.tags : [])].filter(Boolean).join(__atgSiteText(277)) || __atgSiteText(278);
const canEnter = Boolean(room.canEnter) && Boolean(options.localBridge);
const reasons = Array.isArray(room.reasons) ? room.reasons.slice(0, 5) : [];
return __atgSiteTpl(19,escapeHtml(room.number || room.roomId || __atgSiteText(279)),escapeHtml(tag),rank.toFixed(0),burst.toFixed(0),burst.toFixed(1),burst.toFixed(0),formatRate(room.rate),formatNumber(room.bet),statusClass,escapeHtml(room.statusLabel || STATUS_LABELS[room.status] || room.status || __atgSiteText(280)),formatNullableRate(room.todayRate),formatNullableRate(room.hourRate),formatNullableRate(room.dayRate),formatTurns(room.notOpenTurns),formatTurns(room.previousOneTurns),formatTurns(room.previousTwoTurns),formatPointRange(room),formatPointValue(room.pointAvgPerTurn),escapeHtml(room.pointSource || __atgSiteText(281)),formatTurns(room.pointRemainingTurns),escapeHtml(room.pointStatus || __atgSiteText(282)),formatNullablePercent(room.pointConfidence),formatTurns(room.freeGameTargetTurn),formatTurnWindow(room),formatRemainingWindow(room),escapeHtml(room.freeGameForecastZone || __atgSiteText(283)),formatNullablePercent(room.freeGameForecastConfidence),formatNullablePercent(room.momentumScore),formatNullablePercent(room.cyclePressure),formatNullablePercent(room.pullbackRisk),formatNullablePercent(room.pointReadiness),formatPointValue(room.pointSampleShortfall),formatPointValue(room.pointSampleTarget),reasons.length ? __atgSiteTpl(18,reasons.map((reason) => __atgSiteTpl(17,escapeHtml(reason))).join(__atgSiteText(284))) : __atgSiteText(285),escapeHtml(room.roomId || __atgSiteText(286)),escapeHtml(room.number || __atgSiteText(287)),canEnter ? __atgSiteText(288) : __atgSiteText(289));
}
function filteredRooms() {
const snapshot = state.snapshot;
const rooms = snapshot && Array.isArray(snapshot.rooms) ? snapshot.rooms.slice() : [];
const filters = state.filters;
const filtered = rooms.filter((room) => {
const haystack = __atgSiteTpl(20,room.number || __atgSiteText(290),room.roomId || __atgSiteText(291)).toLowerCase();
if (filters.search && !haystack.includes(filters.search)) return false;
if (filters.onlyEmpty && room.status !== __atgSiteText(292)) return false;
if (number(room.rankScore == null ? room.score : room.rankScore) < filters.minRank) return false;
if (number(room.burstProbability) < filters.minBurst) return false;
if (number(room.rate) < filters.minRate) return false;
if (number(room.bet) < filters.minBet) return false;
return true;
});
filtered.sort((a, b) => {
if (filters.sort === __atgSiteText(293)) {
return number(b.burstProbability) - number(a.burstProbability) || number(b.rankScore) - number(a.rankScore);
}
if (filters.sort === __atgSiteText(294)) {
return number(a.pointEstimated) - number(b.pointEstimated) || number(b.burstProbability) - number(a.burstProbability);
}
if (filters.sort === __atgSiteText(295)) {
return number(b.rate) - number(a.rate) || number(b.bet) - number(a.bet);
}
return number(b.rankScore == null ? b.score : b.rankScore) - number(a.rankScore == null ? a.score : a.rankScore) || number(b.burstProbability) - number(a.burstProbability);
});
return filtered;
}
function clearDashboard() {
state.bridgeConnected = false;
state.snapshot = null;
state.notice = DEFAULT_NOTICE;
els.rooms.innerHTML = __atgSiteText(296);
renderCloudControls();
}
function clearPortal() {
state.portal.profile = null;
state.portal.ledger = [];
state.portal.orders = [];
state.portal.completedTasks = new Set();
state.portal.status = __atgSiteText(297);
}
function fallbackProfile() {
const user = state.auth.user || {};
return {
id: user.id || __atgSiteText(298),
email: user.email || __atgSiteText(299),
display_name: user.email ? user.email.split(__atgSiteText(300))[0] : __atgSiteText(301),
points: 100,
badge: __atgSiteText(302),
role: __atgSiteText(303),
bound_game_url: __atgSiteText(304),
last_checkin_at: null
};
}
function readLocalPortal() {
try {
return JSON.parse(localStorage.getItem(localPortalKey()) || __atgSiteText(305));
} catch {
return {};
}
}
function persistLocalFromState() {
if (!state.auth.user) return;
localStorage.setItem(
localPortalKey(),
JSON.stringify({
profile: state.portal.profile,
ledger: state.portal.ledger,
orders: state.portal.orders,
completedTasks: Array.from(state.portal.completedTasks)
})
);
}
function localPortalKey() {
const user = state.auth.user;
return __atgSiteTpl(21,user ? user.id || user.email : __atgSiteText(306));
}
function addLocalPoints(amount, action) {
const profile = state.portal.profile || fallbackProfile();
profile.points = number(profile.points) + amount;
state.portal.profile = profile;
state.portal.ledger.unshift({
action,
amount,
balance: profile.points,
created_at: new Date().toISOString()
});
}
function generateCardNumber() {
const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
return __atgSiteTpl(22,part(),part(),Date.now().toString().slice(-4));
}
function rpcMessage(data, fallback) {
const value = Array.isArray(data) ? data[0] : data;
if (value && typeof value === __atgSiteText(307)) {
if (value.message) return value.message;
if (value.ok === false && value.error) return value.error;
}
return fallback;
}
function isAuthenticated() {
return Boolean(state.auth.user);
}
function requireSignedIn() {
if (isAuthenticated()) return true;
state.auth.status = __atgSiteText(308);
renderAuth();
return false;
}
function requireAuthClient() {
if (state.auth.client) return true;
state.auth.status = state.auth.configured ? __atgSiteText(309) : __atgSiteText(310);
renderAuth();
return false;
}
function readCredentials() {
const email = els.authEmail.value.trim();
const password = els.authPassword.value;
if (!email || !password) {
state.auth.status = __atgSiteText(311);
renderAuth();
return null;
}
if (password.length < 6) {
state.auth.status = __atgSiteText(312);
renderAuth();
return null;
}
return { email, password };
}
function hasValidSupabaseConfig(config) {
if (!config || typeof config.url !== __atgSiteText(313) || typeof config.anonKey !== __atgSiteText(314)) return false;
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.url.trim())) return false;
if (config.url.includes(__atgSiteText(315)) || config.anonKey.includes(__atgSiteText(316))) return false;
return config.anonKey.trim().length > 40;
}
function formatAuthError(error) {
const message = error && error.message ? error.message : String(error || __atgSiteText(317));
const normalized = message.toLowerCase();
if (normalized.includes(__atgSiteText(318))) return __atgSiteText(319);
if (normalized.includes(__atgSiteText(320))) return __atgSiteText(321);
if (normalized.includes(__atgSiteText(322))) return __atgSiteText(323);
if (normalized.includes(__atgSiteText(324))) return __atgSiteText(325);
if (normalized.includes(__atgSiteText(326))) return __atgSiteText(327);
return message;
}
function normalizeUrl(value) {
if (!value) return __atgSiteText(328);
const url = value.startsWith(__atgSiteText(329)) || value.startsWith(__atgSiteText(330)) ? value : __atgSiteTpl(23,value);
try {
return new URL(url).href;
} catch {
return __atgSiteText(331);
}
}
function isToday(value) {
if (!value) return false;
const date = new Date(value);
if (Number.isNaN(date.getTime())) return false;
const now = new Date();
return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}
function number(value) {
const parsed = Number(value);
return Number.isFinite(parsed) ? parsed : 0;
}
function clamp(value, min, max) {
return Math.min(max, Math.max(min, value));
}
function formatRate(value) {
return __atgSiteTpl(24,number(value).toFixed(2));
}
function formatNullableRate(value) {
return value == null ? __atgSiteText(332) : formatRate(value);
}
function formatNullablePercent(value) {
return value == null ? __atgSiteText(333) : __atgSiteTpl(25,clamp(number(value), 0, 100).toFixed(0));
}
function formatNumber(value) {
return new Intl.NumberFormat(__atgSiteText(334), { maximumFractionDigits: 2 }).format(number(value));
}
function formatTurns(value) {
return value == null ? __atgSiteText(335) : __atgSiteTpl(26,Math.round(number(value)));
}
function formatTurnWindow(room) {
if (room.freeGameWindowStart == null || room.freeGameWindowEnd == null) return __atgSiteText(336);
return __atgSiteTpl(27,Math.round(number(room.freeGameWindowStart)),Math.round(number(room.freeGameWindowEnd)));
}
function formatRemainingWindow(room) {
if (room.freeGameRemainingStart == null || room.freeGameRemainingEnd == null) return __atgSiteText(337);
const start = Math.round(number(room.freeGameRemainingStart));
const end = Math.round(number(room.freeGameRemainingEnd));
if (end <= 0) return __atgSiteText(338);
if (start === end) return __atgSiteTpl(28,end);
return __atgSiteTpl(29,start,end);
}
function formatPointValue(value) {
if (value == null) return __atgSiteText(339);
const points = Math.max(0, number(value));
if (points <= 0) return __atgSiteText(340);
return formatNumber(Math.round(points));
}
function formatPointRange(room) {
if (room.pointEstimated == null && room.pointMin == null && room.pointMax == null) return __atgSiteText(341);
const min = Math.max(0, Math.round(number(room.pointMin == null ? room.pointEstimated : room.pointMin)));
const max = Math.max(min, Math.round(number(room.pointMax == null ? room.pointEstimated : room.pointMax)));
if (max <= 0) return __atgSiteText(342);
if (min === max) return formatPointValue(max);
return __atgSiteTpl(30,formatPointValue(min),formatPointValue(max));
}
function formatDateTime(value) {
if (!value) return __atgSiteText(343);
const date = new Date(value);
if (Number.isNaN(date.getTime())) return String(value);
return date.toLocaleString(__atgSiteText(344), { hour12: false });
}
function escapeHtml(value) {
return String(value)
.replace(/&/g, __atgSiteText(345))
.replace(/</g, __atgSiteText(346))
.replace(/>/g, __atgSiteText(347))
.replace(/"/g, __atgSiteText(348))
.replace(/'/g, __atgSiteText(349));
}
