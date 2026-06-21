// Balance-Simulator für non-zero (HART).
// Zweck: Markt-Sättigung (sinkende Grenzerträge) entwerfen und prüfen, ob sie
// naives Überbauen bestraft, OHNE den geschickten Spieler mitzubestrafen.
//   Naiv-Bot  = "alles ausbauen, voll produzieren" (die aktuell dominante Strategie)
//   Skill-Bot = nutzt echte Hebel: Kapazität schlank am genährten Markt, kein Fluten,
//               investiert in Marktwachstum (Verkäufer/Ruf) → expandiert mit dem Markt
// Zielband ("gelöst"): Naiv spürbare Pleitequote (~20–40%), Skill gewinnt zuverlässig.
//
// Aufruf:  node tools/sim.mjs                 → Baseline + Sättigungs-Kandidaten
//          node tools/sim.mjs '<jsonOverride>'→ ein Override-Szenario

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
  // Markt-Sättigung (Werte = gelebter Stand in index.html). Verkauf bis sweet×marketSize →
  // voller Preis; darüber Preis-Haircut. Im echten Spiel IMMER aktiv → hier default an.
  //   ratio = sold / marketSize ; satMult = ratio<=sweet ? 1 : max(floor, 1-(ratio-sweet)*steep)
  saturation: { enabled:true, sweet:0.82, steep:2.2, floor:0.5, pushMax:1.6 },
  stock: { spoilRate:0.20, fireSalePrice:300, fireSaleFrac:[0.2,0.45] }, // #0c Teil 2 (Parität zu index.html)
  seasons: [1.05,1.25,1.0,0.85],
  brews: [
    { id:"lager",  brewCost:145, basePrice:295, baseDemand:38, pull:[1.05,1.35,0.95,0.80] },
    { id:"ipa",    brewCost:195, basePrice:425, baseDemand:22, pull:[1.10,1.20,1.00,0.92] },
    { id:"saison", brewCost:220, basePrice:530, baseDemand:12, pull:[1.30,0.70,1.45,1.50] },
  ],
  hard: { cashMult:0.7, demandMult:0.88 },
};

const rnd = (a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function premiumDemand(B, brew, S, sea, pm=1){
  const repFactor = B.demand.repBase + S.rep*B.demand.repPerPoint;
  const qual = S.braumeister ? B.staff.braumeister.qual : 1;
  const mktBoost = S.marketing/15000;
  const mktScale = S.marketSize / B.start.marketSize;
  const elas = clamp(1-(pm-1)*B.demand.elasticity, B.demand.elasFloor ?? 0.4, 1.5);
  return brew.baseDemand * mktScale * brew.pull[sea] * repFactor * qual * elas * B.hard.demandMult * (1+mktBoost);
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

// ── #0 PREIS-HEBEL: deterministische Quartalsökonomie (Mittelwert, kein Zufall) ──
// "Produce-to-demand" bei Preis-Mult pm: pro Sorte genau die erwartete Nachfrage brauen,
// inkl. Sättigung. Liefert Deckungsbeitrag (Umsatz−Braukosten) und Absatzmenge.
// Damit kann der Bot den Preis wählen, und wir können den Hochpreis-Schleichweg messen.
function planAtPrice(B, S, sea, pm){
  const per = B.brews.map(b => ({ b, d: Math.round(premiumDemand(B,b,S,sea,pm)) })); // Mittel (spread~1)
  const soldTotal = per.reduce((a,x)=>a+x.d,0);
  let satMult = 1;
  if (B.saturation.enabled){
    const ratio = soldTotal/Math.max(1,S.marketSize);
    satMult = ratio<=B.saturation.sweet ? 1 : Math.max(B.saturation.floor, 1-(ratio-B.saturation.sweet)*B.saturation.steep);
  }
  let rev=0, brew=0;
  for(const {b,d} of per){ rev += d*b.basePrice*pm; brew += d*b.brewCost; }
  if (S.maelzerei) brew *= B.upgrades.maelzerei.brew;
  rev *= satMult;
  return { sold:soldTotal, rev, brewCost:Math.round(brew), satMult, contribution: Math.round(rev-brew) };
}

// Preis, der den Deckungsbeitrag im aktuellen Zustand maximiert (Bot-Logik: Hebel aufdrehen,
// bis der Grenzgewinn kippt). Suchraster wie der Slider im Spiel (0.8–1.3).
function bestPrice(B, S, sea){
  let best = { pm:1.0, db:-1e9 };
  for(let pm=0.8; pm<=1.301; pm+=0.05){ const r=planAtPrice(B,S,sea,pm); if(r.contribution>best.db) best={pm:+pm.toFixed(2), db:r.contribution}; }
  return best.pm;
}

// Direkte Belegrechnung (entspricht der Hand-Rechnung in BACKLOG #0): für einen festen,
// etablierten Referenzzustand zeigen, ob Hochpreis bei gegebener Elastizität noch lohnt.
// DB/hl = Deckungsbeitrag je verkauftem hl = Proxy für Kapitaleffizienz (weniger hl = weniger
// Kapazität/Kapital für denselben Gewinn). Steigt DB/hl mit dem Preis stark, ist Hochpreis der
// bequeme Schleichweg; fällt der absolute DB bei +30% unter den Normalpreis-DB, ist er entschärft.
function priceAnalysis(B){
  const S = newState(B); S.braumeister=true; S.maelzerei=true; S.rep=58; S.marketSize=160;
  console.log(`  Preis-Analyse (etabliert, Markt 160, elas=${B.demand.elasticity}):`);
  console.log("    pm    hl/Q   Umsatz/Q   DB/Q    DB/hl   satMult");
  let dbAtNormal = null;
  for(const pm of [1.0,1.1,1.2,1.3]){
    let hl=0,rev=0,db=0,sat=0;
    for(let sea=0;sea<4;sea++){ const r=planAtPrice(B,S,sea,pm); hl+=r.sold; rev+=r.rev; db+=r.contribution; sat+=r.satMult; }
    hl/=4; rev/=4; db/=4; sat/=4;
    if(pm===1.0) dbAtNormal = db;
    const flag = (pm>1.0 && db>dbAtNormal) ? "  ← lohnt > Normal" : "";
    console.log(`    ${pm.toFixed(2)} ${hl.toFixed(0).padStart(6)} ${rev.toFixed(0).padStart(10)} ${db.toFixed(0).padStart(8)} ${(db/Math.max(1,hl)).toFixed(0).padStart(7)} ${sat.toFixed(2).padStart(8)}${flag}`);
  }
}

function newState(B){
  return { cash: Math.round(B.start.cash*B.hard.cashMult), rep:B.start.rep, capacity:B.start.capacity,
           marketSize:B.start.marketSize, stock:0, buildings:[], extraTanks:0,
           braumeister:false, verkaeufer:false, aushilfe:false, energie:false, maelzerei:false, labor:false,
           marketing:3000 };
}

// Eine Quartalsabrechnung. plan[]=hl je Sorte, pm=Preis-Mult (für alle gleich, vereinfacht).
function resolveQuarter(B, S, plan, pm, sea){
  S.cash -= S.marketing;
  let brewCost = B.brews.reduce((s,b,i)=>s + plan[i]*b.brewCost, 0);
  if (S.maelzerei) brewCost*=B.upgrades.maelzerei.brew;
  const planTotal = plan.reduce((a,b)=>a+b,0);
  const util = planTotal / Math.max(1,S.capacity);
  if (S.aushilfe && util>=0.8) brewCost*=B.staff.aushilfe.cost;
  S.cash -= Math.round(brewCost);
  S.cash -= fixedCost(B,S);

  // Verkauf je Sorte (Volumen bis pushMax×Premium-Nachfrage; Rest = Leerlauf)
  let grossRev=0, soldTotal=0;
  const push = B.saturation.enabled ? B.saturation.pushMax : 1e9;
  B.brews.forEach((b,i)=>{
    const d = premiumDemand(B,b,S,sea,pm)*rnd(...B.demand.spread);
    const sold = Math.min(plan[i], Math.round(d*push));
    grossRev += sold * b.basePrice * pm;
    soldTotal += sold;
  });

  // Markt-Sättigung: zu viel Volumen drückt den Durchschnittspreis
  let satMult = 1;
  if (B.saturation.enabled){
    const ratio = soldTotal / Math.max(1,S.marketSize);
    satMult = ratio<=B.saturation.sweet ? 1 : Math.max(B.saturation.floor, 1-(ratio-B.saturation.sweet)*B.saturation.steep);
  }
  let revenue = grossRev * satMult;

  const leftover = Math.max(0, planTotal - soldTotal);
  const oldSold = Math.min(S.stock, Math.round(rnd(...B.stock.fireSaleFrac)*S.stock));
  revenue += oldSold*B.stock.fireSalePrice;
  S.stock = Math.round(((S.stock-oldSold)+leftover)*(1-B.stock.spoilRate));
  S.cash += revenue;

  if (S.braumeister) S.rep=Math.min(100,S.rep+B.staff.braumeister.rep);
  if (leftover > S.capacity*0.38) S.rep=Math.max(0,S.rep-4);
  if (planTotal>0 && soldTotal>=planTotal*0.93) S.rep=Math.min(100,S.rep+2);

  const g = B.market.baseGrowthPerQ + S.rep*B.market.repGrowthFactor;
  S.marketSize = Math.min(B.market.max, S.marketSize*(1+g*(S.verkaeufer?B.staff.verkaeufer.market:1)));
  return { satMult, soldTotal, planTotal };
}

// ── NAIV: alles ausbauen + Kapazität IMMER vollfahren (auch über Bedarf → Ausschuss) ──
function playNaive(B){
  const S=newState(B); const BUF=2500;   // kleiner Puffer: baut aggressiv, wie der echte Naiv-Spieler
  for (let q=0;q<B.start.goalYears*4;q++){
    const sea=q%4;
    const buy=(c,f)=>{ if(S.cash-c>=BUF){S.cash-=c;f();return true;} return false; };
    if(!S.energie) buy(B.upgrades.energie.cost,()=>S.energie=true);
    if(!S.braumeister) buy(B.staff.braumeister.wage*2,()=>S.braumeister=true);
    if(S.braumeister&&!S.verkaeufer) buy(B.staff.verkaeufer.wage*2,()=>S.verkaeufer=true);
    if(!S.maelzerei) buy(B.upgrades.maelzerei.cost,()=>S.maelzerei=true);
    if(!S.aushilfe) buy(B.staff.aushilfe.wage*2,()=>S.aushilfe=true);
    for(const b of B.buildings){ if(S.buildings.includes(b.id))continue; if(b.requires&&!S.buildings.includes(b.requires))break; if(!buy(b.cost,()=>{S.buildings.push(b.id);S.capacity+=b.capAdd;}))break; }
    if(S.buildings.includes("halle2")){ let g=0; while(S.cash-nextTankCost(B,S)>=BUF&&g++<6){S.cash-=nextTankCost(B,S);S.capacity+=B.expansion.capAdd;S.extraTanks++;} }
    // "mehr produzieren": Kapazität IMMER voll, proportional zu Saison-Pull (auch über Bedarf)
    const w=B.brews.map(b=>b.pull[sea]*b.baseDemand);
    const wt=w.reduce((a,b)=>a+b,0);
    const plan=w.map(x=>Math.round(x/wt*S.capacity));
    resolveQuarter(B,S,plan,1,sea);
    if(S.cash<B.start.loseThreshold) return {bankrupt:true,q};
  }
  return {bankrupt:false,cash:Math.round(S.cash),capacity:S.capacity,extraTanks:S.extraTanks,market:Math.round(S.marketSize),rep:S.rep};
}

// ── SKILL: schlanke Kapazität am genährten Markt, kein Fluten, Markt aktiv wachsen lassen ──
function playSkill(B){
  const S=newState(B); S.marketing=2000; const BUF=5000;
  const sweet = B.saturation.enabled ? B.saturation.sweet : 0.9;
  for (let q=0;q<B.start.goalYears*4;q++){
    const sea=q%4;
    const buy=(c,f)=>{ if(S.cash-c>=BUF){S.cash-=c;f();return true;} return false; };
    // Wachstums-/Effizienz-Investitionen zuerst (nähren Markt + senken Kosten)
    if(!S.braumeister) buy(B.staff.braumeister.wage*2,()=>S.braumeister=true);
    if(!S.verkaeufer) buy(B.staff.verkaeufer.wage*2,()=>S.verkaeufer=true);
    if(!S.energie) buy(B.upgrades.energie.cost,()=>S.energie=true);
    if(!S.maelzerei) buy(B.upgrades.maelzerei.cost,()=>S.maelzerei=true);
    // Kapazität schlank an Sweet-Spot des Marktes ausrichten (nicht fluten)
    const target = Math.ceil(sweet * S.marketSize * 1.05); // knapp über Sweet, für Saisonspitzen
    const needCap = ()=> S.capacity < target;
    for(const b of B.buildings){ if(!needCap())break; if(S.buildings.includes(b.id))continue; if(b.requires&&!S.buildings.includes(b.requires))break; buy(b.cost,()=>{S.buildings.push(b.id);S.capacity+=b.capAdd;}); }
    if(S.buildings.includes("halle2")){ let g=0; while(needCap()&&S.cash-nextTankCost(B,S)>=BUF&&g++<6){S.cash-=nextTankCost(B,S);S.capacity+=B.expansion.capAdd;S.extraTanks++;} }
    if(!S.aushilfe && S.capacity>=160) buy(B.staff.aushilfe.wage*2,()=>S.aushilfe=true);
    // Produktion: Sweet-Spot-Volumen, Mix nach Marge×Saison, je Sorte ≤ Premium-Nachfrage
    const Vtarget = Math.min(S.capacity, Math.round(sweet*S.marketSize));
    const dem=B.brews.map(b=>premiumDemand(B,b,S,sea));
    const order=B.brews.map((b,i)=>({i,score:b.pull[sea]*(b.basePrice-b.brewCost)})).sort((a,b)=>b.score-a.score);
    const plan=B.brews.map(()=>0); let rem=Vtarget;
    for(const {i} of order){ const take=Math.min(Math.round(dem[i]),rem); plan[i]=take; rem-=take; if(rem<=0)break; }
    resolveQuarter(B,S,plan,1,sea);
    if(S.cash<B.start.loseThreshold) return {bankrupt:true,q};
  }
  return {bankrupt:false,cash:Math.round(S.cash),capacity:S.capacity,extraTanks:S.extraTanks,market:Math.round(S.marketSize),rep:S.rep};
}

// ── SKILL+PREIS: wie Skill, aber wählt jedes Quartal den DB-maximalen Preis und dimensioniert
//    Kapazität nur auf das, was er bei DEM Preis verkaufen will (nutzt den Preis-Hebel aktiv). ──
function playSkillPriced(B){
  const S=newState(B); S.marketing=2000; const BUF=5000; let pmSum=0,pmN=0;
  for (let q=0;q<B.start.goalYears*4;q++){
    const sea=q%4;
    const buy=(c,f)=>{ if(S.cash-c>=BUF){S.cash-=c;f();return true;} return false; };
    if(!S.braumeister) buy(B.staff.braumeister.wage*2,()=>S.braumeister=true);
    if(!S.verkaeufer) buy(B.staff.verkaeufer.wage*2,()=>S.verkaeufer=true);
    if(!S.energie) buy(B.upgrades.energie.cost,()=>S.energie=true);
    if(!S.maelzerei) buy(B.upgrades.maelzerei.cost,()=>S.maelzerei=true);
    const pm=bestPrice(B,S,sea); pmSum+=pm; pmN++;
    const dem=B.brews.map(b=>Math.round(premiumDemand(B,b,S,sea,pm)));
    const want=dem.reduce((a,b)=>a+b,0);
    const needCap=()=> S.capacity<want;
    for(const b of B.buildings){ if(!needCap())break; if(S.buildings.includes(b.id))continue; if(b.requires&&!S.buildings.includes(b.requires))break; buy(b.cost,()=>{S.buildings.push(b.id);S.capacity+=b.capAdd;}); }
    if(S.buildings.includes("halle2")){ let g=0; while(needCap()&&S.cash-nextTankCost(B,S)>=BUF&&g++<6){S.cash-=nextTankCost(B,S);S.capacity+=B.expansion.capAdd;S.extraTanks++;} }
    if(!S.aushilfe && S.capacity>=160) buy(B.staff.aushilfe.wage*2,()=>S.aushilfe=true);
    let rem=Math.min(S.capacity,want); const order=B.brews.map((b,i)=>({i,score:b.pull[sea]*(b.basePrice*pm-b.brewCost)})).sort((a,b)=>b.score-a.score);
    const plan=B.brews.map(()=>0);
    for(const {i} of order){ const take=Math.min(dem[i],rem); plan[i]=take; rem-=take; if(rem<=0)break; }
    resolveQuarter(B,S,plan,pm,sea);
    if(S.cash<B.start.loseThreshold) return {bankrupt:true,q,avgPm:pmSum/pmN};
  }
  return {bankrupt:false,cash:Math.round(S.cash),capacity:S.capacity,extraTanks:S.extraTanks,market:Math.round(S.marketSize),rep:S.rep,avgPm:pmSum/pmN};
}

// ── BOUTIQUE: der Schleichweg aus #0 in Reinform — Hochpreis (+30%), KEIN Kapazitätsausbau,
//    KEIN Verkäufer (Markt klein halten), nur Qualität/Effizienz. Wenig Kapital, fette Marge.
//    Wenn dieser Bot zuverlässig durchkommt, ist Hochpreis-Wenigproduzieren eine freie Strategie. ──
function playBoutique(B){
  const S=newState(B); S.marketing=1500; const BUF=4000; const pm=1.30;
  for (let q=0;q<B.start.goalYears*4;q++){
    const sea=q%4;
    const buy=(c,f)=>{ if(S.cash-c>=BUF){S.cash-=c;f();return true;} return false; };
    if(!S.braumeister) buy(B.staff.braumeister.wage*2,()=>S.braumeister=true);
    if(!S.energie) buy(B.upgrades.energie.cost,()=>S.energie=true);
    if(!S.maelzerei) buy(B.upgrades.maelzerei.cost,()=>S.maelzerei=true);
    const dem=B.brews.map(b=>Math.round(premiumDemand(B,b,S,sea,pm)));
    let rem=S.capacity; const order=B.brews.map((b,i)=>({i,score:b.pull[sea]*(b.basePrice*pm-b.brewCost)})).sort((a,b)=>b.score-a.score);
    const plan=B.brews.map(()=>0);
    for(const {i} of order){ const take=Math.min(dem[i],rem); plan[i]=take; rem-=take; if(rem<=0)break; }
    resolveQuarter(B,S,plan,pm,sea);
    if(S.cash<B.start.loseThreshold) return {bankrupt:true,q,avgPm:pm};
  }
  return {bankrupt:false,cash:Math.round(S.cash),capacity:S.capacity,extraTanks:S.extraTanks,market:Math.round(S.marketSize),rep:S.rep,avgPm:pm};
}

function run(policy,B,trials=500){
  let bankrupt=0; const cashes=[]; let cap=0,mkt=0,tanks=0,pmSum=0,pmN=0;
  for(let i=0;i<trials;i++){ const r=policy(B); if(r.avgPm!==undefined){pmSum+=r.avgPm;pmN++;} if(r.bankrupt)bankrupt++; else {cashes.push(r.cash);cap+=r.capacity;mkt+=r.market;tanks+=r.extraTanks;} }
  cashes.sort((a,b)=>a-b); const n=cashes.length||1;
  const out={ bankrupt:(bankrupt/trials*100).toFixed(0)+"%", medCash:cashes[Math.floor(cashes.length/2)]||0,
           avgCap:Math.round(cap/n), avgTanks:(tanks/n).toFixed(1), avgMarket:Math.round(mkt/n) };
  if(pmN) out.avgPm=(pmSum/pmN).toFixed(2);
  return out;
}

function deepMerge(t,s){ for(const k in s){ if(s[k]&&typeof s[k]==="object"&&!Array.isArray(s[k])) deepMerge(t[k]=t[k]||{},s[k]); else t[k]=s[k]; } return t; }
function clone(o){ return JSON.parse(JSON.stringify(o)); }

const arg=process.argv[2];
if(arg){
  // Override-Szenario: ein JSON-Patch auf baseB, alle Bots laufen lassen.
  const B=deepMerge(clone(baseB), JSON.parse(arg));
  console.log("\n=== OVERRIDE (elas="+B.demand.elasticity+") ===");
  priceAnalysis(B);
  console.log("  NAIV   :", run(playNaive,B));
  console.log("  SKILL  :", run(playSkill,B));
  console.log("  PRICED :", run(playSkillPriced,B));
  console.log("  BOUTIQ :", run(playBoutique,B));
} else {
  // #0 — Elastizitäts-Sweep. Frage: ab welchem Faktor hört "Hochpreis + wenig produzieren"
  // auf, eine freie Gewinnstrategie zu sein, OHNE den Start unspielbar zu machen?
  //   PRICED-avgPm nahe 1.30 + niedrige Pleite  → Hochpreis dominiert (Hebel kaputt)
  //   PRICED-avgPm sinkt Richtung ~1.0, BOUTIQ-Pleite steigt → echter Trade-off (Hebel ok)
  for(const e of [1.4, 2.0, 2.5, 3.0]){
    const B=deepMerge(clone(baseB),{demand:{elasticity:e}});
    console.log(`\n================ ELASTIZITÄT ${e} ================`);
    priceAnalysis(B);
    console.log("  NAIV   :", run(playNaive,B));
    console.log("  SKILL  :", run(playSkill,B));
    console.log("  PRICED :", run(playSkillPriced,B));
    console.log("  BOUTIQ :", run(playBoutique,B));
  }
}
