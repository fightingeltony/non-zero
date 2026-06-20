// Headless-Simulation des "alles ausbauen"-Greedy-Spielers auf HART.
// Repliziert die Ökonomie aus index.html (const B). Zweck: Dominanz messen, nicht raten.
// Aufruf: node tools/sim.mjs  [oder mit Override-JSON als arg1]

const baseB = {
  start: { cash: 25000, capacity: 60, rep: 48, marketSize: 80, goalYears: 7, loseThreshold: -6000 },
  fixedCosts: { baseOverhead: 1200, perCapacityHl: 15 },
  buildings: [
    { id:"gaertank", cost:14000, capAdd:40, fixPerQ:1500 },
    { id:"abfuell",  cost:22000, capAdd:60, fixPerQ:2200, requires:"gaertank" },
    { id:"halle2",   cost:40000, capAdd:120,fixPerQ:3500, requires:"abfuell" },
  ],
  expansion: { capAdd:40, baseCost:16000, baseFix:1500, costMult:1.4, fixMult:1.4 },
  staff: { braumeister:{wage:2400,qual:1.15,rep:1}, verkaeufer:{wage:2000,market:1.4}, aushilfe:{wage:1200,cost:0.88} },
  upgrades: { energie:{cost:9000,fix:0.85}, maelzerei:{cost:18000,brew:0.78}, labor:{cost:7000} },
  market: { baseGrowthPerQ:0.022, repGrowthFactor:0.0007, max:1000 },
  demand: { repBase:0.5, repPerPoint:0.005, elasticity:1.4, spread:[0.82,1.18] },
  seasons: [1.05,1.25,1.0,0.85], // F S H W
  brews: [
    { id:"lager",  brewCost:145, basePrice:295, baseDemand:38, pull:[1.05,1.35,0.95,0.80] },
    { id:"ipa",    brewCost:195, basePrice:425, baseDemand:22, pull:[1.10,1.20,1.00,0.92] },
    { id:"saison", brewCost:220, basePrice:530, baseDemand:12, pull:[1.30,0.70,1.45,1.50] },
  ],
  hard: { cashMult:0.7, demandMult:0.88 },
};

const rnd = (a,b)=>a+Math.random()*(b-a);

function demandFor(B, brew, S, sea){
  const repFactor = B.demand.repBase + S.rep*B.demand.repPerPoint;
  const qual = S.braumeister ? B.staff.braumeister.qual : 1;
  const mktBoost = S.marketing/15000;
  const mktScale = S.marketSize / B.start.marketSize;
  // normal price → elasticity 1
  return brew.baseDemand * mktScale * brew.pull[sea] * repFactor * qual * B.hard.demandMult * (1+mktBoost);
}

function fixedCost(B, S){
  let f = B.fixedCosts.baseOverhead + B.fixedCosts.perCapacityHl*S.capacity;
  for (const id of S.buildings) f += B.buildings.find(b=>b.id===id).fixPerQ;
  for (let n=0;n<S.extraTanks;n++) f += Math.round(B.expansion.baseFix*Math.pow(B.expansion.fixMult,n));
  if (S.braumeister) f += B.staff.braumeister.wage;
  if (S.verkaeufer)  f += B.staff.verkaeufer.wage;
  if (S.aushilfe)    f += B.staff.aushilfe.wage;
  if (S.energie) f *= B.upgrades.energie.fix;
  return Math.round(f);
}

function nextTankCost(B,S){ return Math.round(B.expansion.baseCost*Math.pow(B.expansion.costMult,S.extraTanks)); }

function playGreedy(B){
  const S = { cash: Math.round(B.start.cash*B.hard.cashMult), rep:B.start.rep, capacity:B.start.capacity,
              marketSize:B.start.marketSize, stock:0, buildings:[], extraTanks:0,
              braumeister:false, verkaeufer:false, aushilfe:false, energie:false, maelzerei:false, labor:false,
              marketing:3000 };
  const BUF = 6000; // Liquiditätspuffer, den der Greedy hält
  for (let q=0; q<B.start.goalYears*4; q++){
    const sea = q%4;
    // ── Investieren (greedy, in sinnvoller Reihenfolge) ──
    const tryBuy = (cost, fn)=>{ if (S.cash-cost>=BUF){ S.cash-=cost; fn(); return true; } return false; };
    if (!S.energie)   tryBuy(B.upgrades.energie.cost, ()=>S.energie=true);
    if (!S.braumeister) tryBuy(B.staff.braumeister.wage*2, ()=>S.braumeister=true); // braucht nur Liquidität
    if (S.braumeister && !S.verkaeufer) tryBuy(B.staff.verkaeufer.wage*2, ()=>S.verkaeufer=true);
    if (!S.maelzerei) tryBuy(B.upgrades.maelzerei.cost, ()=>S.maelzerei=true);
    if (!S.aushilfe)  tryBuy(B.staff.aushilfe.wage*2, ()=>S.aushilfe=true);
    // Gebäude in Reihenfolge
    for (const b of B.buildings){
      if (S.buildings.includes(b.id)) continue;
      if (b.requires && !S.buildings.includes(b.requires)) break;
      if (tryBuy(b.cost, ()=>{ S.buildings.push(b.id); S.capacity+=b.capAdd; })) {} else break;
    }
    // Wiederholbare Tanks: bauen, solange leistbar (= "alles ausbauen")
    if (S.buildings.includes("halle2")){
      let guard=0;
      while (S.cash - nextTankCost(B,S) >= BUF && guard++<5){
        S.cash -= nextTankCost(B,S); S.capacity+=B.expansion.capAdd; S.extraTanks++;
      }
    }
    // Personalkosten waren oben nur als Liquiditätsschwelle; echte Wages laufen über fixedCost.

    // ── Produzieren: klug, auf erwartete Nachfrage, gedeckelt durch Kapazität ──
    const dem = B.brews.map(b=>demandFor(B,b,S,sea));
    const demTotal = dem.reduce((a,b)=>a+b,0);
    let plan;
    if (demTotal <= S.capacity){
      plan = dem.map(d=>Math.round(d));              // produziere genau Nachfrage; Rest = Leerstand
    } else {
      plan = dem.map(d=>Math.round(d/demTotal*S.capacity)); // fülle Kapazität proportional
    }
    const planTotal = plan.reduce((a,b)=>a+b,0);
    const util = planTotal / S.capacity;

    // ── Abrechnung ──
    S.cash -= S.marketing;
    let brewCost = B.brews.reduce((s,b,i)=>s + plan[i]*b.brewCost, 0);
    if (S.maelzerei) brewCost*=B.upgrades.maelzerei.brew;
    if (S.aushilfe && util>=0.8) brewCost*=B.staff.aushilfe.cost;
    S.cash -= Math.round(brewCost);
    const fix = fixedCost(B,S); S.cash -= fix;

    let revenue=0, soldTotal=0;
    B.brews.forEach((b,i)=>{
      const d = demandFor(B,b,S,sea)*rnd(...B.demand.spread);
      const sold = Math.min(plan[i], Math.round(d));
      revenue += sold*b.basePrice;
      soldTotal += sold;
    });
    const leftover = Math.max(0, planTotal-soldTotal);
    const oldSold = Math.min(S.stock, Math.round(rnd(0.2,0.45)*S.stock));
    revenue += oldSold*300;
    S.stock = Math.round(((S.stock-oldSold)+leftover)*0.80);
    S.cash += revenue;

    // Ruf-Drift
    if (S.braumeister) S.rep=Math.min(100,S.rep+B.staff.braumeister.rep);
    if (leftover > S.capacity*0.38) S.rep=Math.max(0,S.rep-4);
    if (planTotal>0 && soldTotal>=planTotal*0.93) S.rep=Math.min(100,S.rep+2);

    // Marktwachstum
    const g = B.market.baseGrowthPerQ + S.rep*B.market.repGrowthFactor;
    S.marketSize = Math.min(B.market.max, S.marketSize*(1+g*(S.verkaeufer?B.staff.verkaeufer.market:1)));

    if (S.cash < B.start.loseThreshold) return { bankrupt:true, q, cash:S.cash };
  }
  return { bankrupt:false, cash:Math.round(S.cash), capacity:S.capacity, extraTanks:S.extraTanks,
           market:Math.round(S.marketSize), rep:S.rep };
}

function run(B, trials=400){
  let bankrupt=0; const cashes=[];
  let cap=0,mkt=0,tanks=0;
  for (let i=0;i<trials;i++){
    const r=playGreedy(B);
    if (r.bankrupt) bankrupt++; else { cashes.push(r.cash); cap+=r.capacity; mkt+=r.market; tanks+=r.extraTanks; }
  }
  cashes.sort((a,b)=>a-b);
  const med = cashes.length? cashes[Math.floor(cashes.length/2)] : 0;
  const n = cashes.length||1;
  return { trials, bankruptPct:(bankrupt/trials*100).toFixed(0)+"%",
           medianCash: med, p10: cashes[Math.floor(n*0.1)]||0, p90: cashes[Math.floor(n*0.9)]||0,
           avgCap:Math.round(cap/n), avgTanks:(tanks/n).toFixed(1), avgMarket:Math.round(mkt/n) };
}

// ── Szenarien ──
function clone(o){ return JSON.parse(JSON.stringify(o)); }
const scenarios = {
  "BASELINE (aktuell)": baseB,
};
// Override per CLI-arg möglich
const arg = process.argv[2];
if (arg){ const ov=JSON.parse(arg); scenarios["OVERRIDE"]=deepMerge(clone(baseB),ov); }

function deepMerge(t,s){ for(const k in s){ if(s[k]&&typeof s[k]==="object"&&!Array.isArray(s[k])) deepMerge(t[k]=t[k]||{},s[k]); else t[k]=s[k]; } return t; }

for (const [name,B] of Object.entries(scenarios)){
  console.log("\n=== "+name+" ===");
  console.log(run(B));
}
