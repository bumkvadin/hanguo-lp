#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const https = require("https");

const SYMBOLS = [
  { key: "dax",      name: "DAX 40",         yahoo: "^GDAXI", sina: "znb_DAX",    sinaFmt: "global" },
  { key: "estoxx50", name: "유로 스톡스 50", yahoo: "^STOXX50E", sina: "znb_SX5E", sinaFmt: "global" },
  { key: "spx",      name: "S&P 500",        yahoo: "^GSPC",  sina: "gb_$inx",    sinaFmt: "us" },
  { key: "eurkrw",   name: "EUR/KRW",        yahoo: "EURKRW=X", sina: "fx_seurkrw", sinaFmt: "fx" }
];

const OUT = path.join(__dirname, "..", "data", "market.json");

function httpGet(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: headers || { "User-Agent": "Mozilla/5.0" } }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, buf: Buffer.concat(chunks) }));
    }).on("error", reject);
  });
}

function fmtNum(n) {
  const num = Number(n);
  if (!isFinite(num)) return null;
  return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function pack(name, price, abs, pct) {
  if (!isFinite(price)) return null;
  if (!isFinite(abs)) abs = 0;
  if (!isFinite(pct)) pct = 0;
  return {
    name: name,
    price: fmtNum(price),
    chgAbs: (abs >= 0 ? "+" : "") + abs.toFixed(2),
    chgPct: (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%",
    dir: abs >= 0 ? "up" : "down"
  };
}

async function fromYahoo(s) {
  const url = "https://query1.finance.yahoo.com/v8/finance/chart/" +
    encodeURIComponent(s.yahoo) + "?interval=1d&range=5d";
  const r = await httpGet(url);
  if (r.status !== 200) throw new Error("yahoo status " + r.status);
  const j = JSON.parse(r.buf.toString("utf8"));
  const meta = j.chart.result[0].meta;
  const price = meta.regularMarketPrice;
  const prev = meta.chartPreviousClose || meta.previousClose;
  const abs = price - prev;
  const pct = prev ? (abs / prev) * 100 : 0;
  const out = pack(s.name, price, abs, pct);
  if (!out) throw new Error("yahoo parse");
  return out;
}

async function fromSina(s) {
  const r = await httpGet("https://hq.sinajs.cn/list=" + s.sina, {
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://finance.sina.com.cn/"
  });
  const raw = r.buf.toString("latin1");
  const m = raw.match(/="([^"]*)"/);
  if (!m || !m[1]) throw new Error("sina empty");
  const f = m[1].split(",");
  let price, abs, pct;
  if (s.sinaFmt === "global") { price = +f[1]; abs = +f[2]; pct = +f[3]; }
  else if (s.sinaFmt === "us") { price = +f[1]; pct = +f[2]; abs = +f[4]; }
  else if (s.sinaFmt === "fx") { price = +f[1]; const p = +f[5]; abs = price - p; pct = p ? (abs / p) * 100 : 0; }
  const out = pack(s.name, price, abs, pct);
  if (!out) throw new Error("sina parse");
  return out;
}

async function run() {
  const indices = {};
  for (const s of SYMBOLS) {
    let done = false;
    try {
      indices[s.key] = await fromYahoo(s);
      console.log(`ok ${s.key} (yahoo): ${indices[s.key].price} ${indices[s.key].chgPct}`);
      done = true;
    } catch (e) {
      console.warn(`yahoo 실패 ${s.key}: ${e.message} -> sina`);
    }
    if (done) continue;
    try {
      indices[s.key] = await fromSina(s);
      console.log(`ok ${s.key} (sina): ${indices[s.key].price} ${indices[s.key].chgPct}`);
    } catch (e) {
      console.warn(`skip ${s.key}: ${e.message}`);
    }
  }

  if (Object.keys(indices).length === 0) {
    console.error("갱신 실패: 모든 소스 실패. 기존 파일 유지.");
    process.exit(1);
  }

  const out = {
    updatedAt: new Date().toISOString(),
    note: "예시 참고용 데이터. 자동 갱신됩니다.",
    indices: indices
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`\n갱신 완료 -> ${OUT}`);
}

run();
