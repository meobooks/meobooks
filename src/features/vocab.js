// Logic từ vựng dùng chung (tách từ legacy): sổ tay, nhóm tough/known/learn, sắp xếp, ngôn ngữ. Hàm thuần.
export const nbOf=v=>{const t=(v.tags||[]).find(x=>String(x).startsWith("nb:"));return t?String(t).slice(3):""};
export const withNb=(tags,nb)=>{const r=(Array.isArray(tags)?tags:[]).filter(x=>!String(x).startsWith("nb:"));if(nb)r.push("nb:"+nb);return r};
export const byNewest=(x,y)=>(y.created_at||"").localeCompare(x.created_at||"");
export const classOf=(vs,v,srs)=>{const s=(vs&&vs[v.id])||{ok:0,bad:0,streak:0},t=s.ok+s.bad;if(s.bad>=2&&s.bad/Math.max(1,t)>=.35&&s.streak<4)return"tough";const iv=(srs&&srs[v.id]&&srs[v.id].interval_days)||0;if(v.status==="mastered"||s.streak>=5||(s.streak>=3&&iv>=4))return"known";return"learn"};
export const langOfWord=(v,nbs)=>{const nb=(nbs||[]).find(n=>n.id===nbOf(v));const s=nb&&nb.subject;return s==="Chinese"?"Chinese":s==="English"?"English":"Japanese"};
