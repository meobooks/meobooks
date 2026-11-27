// Lịch ôn SRS và kế hoạch hôm nay (tách từ legacy): ngày, SM-2, planToday. Hàm thuần.
import { classOf } from './vocab.js';
import { planCfg } from './plan.js';

export const DAYN=["T2","T3","T4","T5","T6","T7","CN"];
export const dayKey=(o=new Date)=>o.toLocaleDateString("sv-SE");
export const addDaysKey=(o,a)=>{const c=new Date(o+"T00:00:00");return c.setDate(c.getDate()+a),dayKey(c)};
export const idxOf=k=>(new Date(k+"T00:00:00").getDay()+6)%7;
export const sm2=(o,a)=>{let c=Number(o.ease_factor)||2.5,b=o.interval_days||0,v=o.repetitions||0;return a<3?(v=0,b=1):(v+=1,b=v===1?1:v===2?6:Math.round(b*c)),c=Math.max(1.3,+(c+.1-(5-a)*(.08+(5-a)*.02)).toFixed(2)),{ease_factor:c,interval_days:b,repetitions:v,next_review:addDaysKey(dayKey(),b),last_reviewed:dayKey()}}
export const planToday=(jl,S)=>{
  const cfg=planCfg(S),td=dayKey(),vs=(S&&S.vstats)||{},act=(S&&S.activity)||{},base=cfg.newPerDay;
  const due=[],hard=[],fresh=[],nextMap={};
  jl.vocab.forEach(v=>{const I=jl.srs[v.id],isNew=!I||(!I.last_reviewed&&!(I.repetitions>0));if(classOf(vs,v,jl.srs)==="tough")hard.push(v);if(isNew){fresh.push(v);return}const nr=I.next_review||td;if(nr<=td)due.push(v);else nextMap[nr]=(nextMap[nr]||0)+1});
  const overdue=due.filter(v=>(jl.srs[v.id].next_review||td)<td).length;
  const first=[...Object.keys(act).filter(k=>(act[k].xp||0)>0),...jl.vocab.map(v=>String(v.created_at||"").slice(0,10)).filter(Boolean)].sort()[0]||td;
  let missed=0;const past=[];
  for(let i=1;i<=7;i++){const k=addDaysKey(td,-i);if(k<first)continue;const planned=!!cfg.days[idxOf(k)],did=((act[k]&&act[k].xp)||0)>0;if(planned&&!did)missed++;if(i<=3)past.push({k,planned,did})}
  const activeToday=!!cfg.days[idxOf(td)];
  let newToday=activeToday?base:0;
  if(missed>0&&overdue>base*3)newToday=Math.ceil(base/2);
  newToday=Math.min(newToday,fresh.length);
  let remaining=fresh.length-newToday,catchup=missed*base,carry=0;
  const days=[];
  for(let i=0;i<7;i++){
    const k=addDaysKey(td,i),active=!!cfg.days[idxOf(k)];
    let review=i===0?due.length:(nextMap[k]||0),nw=0;
    if(i===0)nw=newToday;
    else{if(!active){carry+=review;review=0}else{review+=carry;carry=0}
      if(active&&remaining>0){const extra=Math.min(catchup,Math.ceil(base*.3));nw=Math.min(remaining,base+extra);catchup-=extra;remaining-=nw}}
    const hd=active?Math.min(hard.length,10):0;
    days.push({k,label:DAYN[idxOf(k)],active,review,nw,hard:hd,mins:active?Math.round(review*.35+nw*1.2+hd*.5):0});
  }
  let suggest=null;
  if(cfg.goalDate&&cfg.goalDate>td&&fresh.length){let n=0;for(let i=0;i<400;i++){const k=addDaysKey(td,i);if(k>cfg.goalDate)break;if(cfg.days[idxOf(k)])n++}if(n>0)suggest=Math.ceil(fresh.length/n)}
  return{cfg,due:due.length,overdue,hard:hard.length,fresh:fresh.length,newToday,missed,past,days,suggest,activeToday};
};
