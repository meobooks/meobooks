// Hook dữ liệu JLPT, chuyển từ public/legacy/index.html (tách JLPT bước 3).
// Phụ thuộc của app cũ (client Supabase, helper, hằng số) được truyền vào qua makeUseJlpt.
import { useEffect, useRef, useState } from 'react';

export function makeUseJlpt(deps) {
  const { supabase, dayKey, weekKey, jlId, norm, levelOf, addDaysKey, ACH_DEFS, EMPTY_PROFILE, QUEST_DEFS, meoFeat } = deps;
  return function useJlpt(o,a,c,onXp,onRes){
  const b=!!(supabase&&o&&o.id!=="preview-user"),[v,A]=useState({ready:!1,vocab:[],srs:{},profile:EMPTY_PROFILE,quests:[],ach:[],log:[],sessions:0}),f=useRef(v);
  f.current=v;
  const L=useRef(null),u=y=>{const l={...f.current,...typeof y=="function"?y(f.current):y};return f.current=l,A(l),l},D=async(y,l)=>{try{const{error:p}=await y;if(p)throw p;return!0}catch(p){return console.error(p),c(""+(l||"Lỗi lưu dữ liệu")),!1}};
  useEffect(()=>{
    !o||!a||L.current===o.id||(L.current=o.id,(async()=>{
      var m;const y=dayKey(),l=weekKey();let p={vocab:[],srs:{},profile:EMPTY_PROFILE,quests:[],ach:[],log:[],sessions:0};
      if(b)try{
        const[C,g,T,H,S,d,E]=await Promise.all([supabase.from("vocab_items").select("*").order("created_at",{ascending:!1}),supabase.from("srs_records").select("*"),supabase.from("profiles").select("*").eq("id",o.id).maybeSingle(),supabase.from("user_quests").select("*").in("period_key",[y,l]),supabase.from("user_achievements").select("achievement_id"),supabase.from("exp_log").select("*").order("created_at",{ascending:!1}).limit(15),supabase.from("study_sessions").select("id",{count:"exact",head:!0})]),G=[C,g,T,H,S,d].find(U=>U.error);
        if(G)throw G.error;
        let J=T.data;J||(J={id:o.id,display_name:((m=o.user_metadata)==null?void 0:m.display_name)||"",...EMPTY_PROFILE},await supabase.from("profiles").upsert(J));
        p={vocab:C.data||[],srs:Object.fromEntries((g.data||[]).map(U=>[U.vocab_id,U])),profile:J,quests:H.data||[],ach:(S.data||[]).map(U=>U.achievement_id),log:d.data||[],sessions:E.count||0};
        try{
          const loc=window.meobooksServices.localStore.getJlptLocal(o.id);
          if(loc&&Array.isArray(loc.vocab)&&loc.vocab.length){
            const have=new Set(p.vocab.map(x=>norm(x.kanji||x.word)));
            const missing=loc.vocab.filter(x=>!have.has(norm(x.kanji||x.word)));
            if(missing.length){
              const ins=missing.map(x=>({word:x.word||x.kanji||"",kanji:x.kanji||null,reading:x.reading||null,sino_viet:x.sino_viet||null,meaning:x.meaning||"",word_type:x.word_type||null,jlpt_level:"N2",topic:x.topic||null,status:x.status||"new",favorite:!!x.favorite,tags:x.tags||[],notes:x.notes||null,example_jp:x.example_jp||null,example_vi:x.example_vi||null}));
              const{data:insData}=await supabase.from("vocab_items").insert(ins).select();
              if(insData)p.vocab=[...insData,...p.vocab];
            }
          }
        }catch{}
      }catch(C){console.error(C),c("Không tải được dữ liệu từ vựng từ máy chủ, đang dùng dữ liệu cục bộ"),L.current=null;try{const loc=window.meobooksServices.localStore.getJlptLocal(o.id);if(loc)p={...p,...loc}}catch{}}
      else try{const C=window.meobooksServices.localStore.getJlptLocal(o.id);C&&(p={...p,...C,quests:(C.quests||[]).filter(g=>g.period_key===y||g.period_key===l)})}catch{}
      const h=QUEST_DEFS.filter(C=>!p.quests.some(g=>g.quest_id===C.id&&g.period_key===(C.type==="daily"?y:l))).map(C=>({quest_id:C.id,quest_type:C.type,progress:0,target:C.target,completed:!1,claimed:!1,period_key:C.type==="daily"?y:l}));
      if(h.length)if(b){const{data:C}=await supabase.from("user_quests").insert(h).select();p.quests=[...p.quests,...C||[]]}else p.quests=[...p.quests,...h.map(C=>({...C,id:jlId()}))];
      u({...p,ready:!0});
    })())
  },[o&&o.id,a]);
  useEffect(()=>{if(!o||!v.ready)return;try{const{vocab:y,srs:l,profile:p,quests:h,ach:m,log:C,sessions:g}=v;window.meobooksServices.localStore.setJlptLocal(o.id,{vocab:y,srs:l,profile:p,quests:h,ach:m,log:C,sessions:g})}catch{}},[v]);
  const R=()=>b&&D(supabase.from("profiles").upsert({...f.current.profile,id:o.id})),j=async(y,l,p=0)=>{if(!y&&!p)return;y>0&&onXp&&onXp(y,null);const h=f.current.profile,m=h.exp+y,C=levelOf(m),g=Math.max(0,C-h.level)*20,goldGain=Math.min(10,Math.max(0,p+g)),T={id:jlId(),amount:y,reason:l,created_at:new Date().toISOString()};u(H=>({profile:{...H.profile,exp:m,level:C,gold:H.profile.gold+goldGain},log:[T,...H.log].slice(0,15)})),goldGain>0&&g&&c(`Lên cấp ${C}! +${goldGain} vàng`),b&&(await R(),await D(supabase.from("exp_log").insert({amount:y,reason:l})))},z=async()=>{const y=f.current.profile,l=dayKey();y.last_study_date!==l&&(u({profile:{...y,streak_days:y.last_study_date===addDaysKey(l,-1)?y.streak_days+1:1,last_study_date:l}}),await R())},B=async(y,l=1)=>{const p=f.current.quests,h=p.map(m=>{const C=QUEST_DEFS.find(T=>T.id===m.quest_id);if(!C||C.ev!==y||m.completed)return m;const g=Math.min(m.target,m.progress+l);return{...m,progress:g,completed:g>=m.target}});u({quests:h}),b&&h.forEach((m,C)=>{m!==p[C]&&D(supabase.from("user_quests").update({progress:m.progress,completed:m.completed}).eq("id",m.id))})},w=async(y={})=>{const l=f.current,p={vocab:l.vocab.length,streak:l.profile.streak_days,level:l.profile.level,sessions:l.sessions,perfect:!!y.perfect},h=new Set(l.ach);for(const m of meoFeat.progression.newlyUnlocked(ACH_DEFS,p,l.ach))!h.has(m.id)&&(h.add(m.id),u(C=>({ach:[...C.ach,m.id]})),c(`Huy hiệu mới: ${m.title}`),b&&await D(supabase.from("user_achievements").insert({achievement_id:m.id})))},M=async y=>{const l=QUEST_DEFS.find(p=>p.id===y.quest_id);!l||!y.completed||y.claimed||(u(p=>({quests:p.quests.map(h=>h.id===y.id?{...h,claimed:!0}:h)})),b&&await D(supabase.from("user_quests").update({claimed:!0}).eq("id",y.id)),await j(l.exp,"quest_"+l.id,l.gold),await w())};
  const findDup=wStr=>{const n=norm(wStr);if(!n)return null;return f.current.vocab.find(x=>norm(x.word)===n||norm(x.kanji)===n)||null};
  const P=async(y,opts={})=>{
    const skipDup=opts.skipDup!==false;
    const dupList=[];
    const filtered=[];
    const seen=new Set();
    y.forEach(m=>{
      const wKey=norm(m.kanji||m.word);
      if(!wKey)return;
      const ex=findDup(m.kanji||m.word)||findDup(m.word);
      if(ex||seen.has(wKey)){
        dupList.push({item:m,existing:ex});
        if(skipDup)return;
      }
      seen.add(wKey);
      filtered.push({word:m.word||m.kanji||"",kanji:m.kanji||null,reading:m.reading||null,sino_viet:m.sino_viet||null,meaning:m.meaning||"",word_type:m.word_type||null,jlpt_level:"N2",topic:m.topic||null,status:m.status||"new",favorite:!!m.favorite,tags:m.tags||[],notes:null,example_jp:m.example_jp||null,example_vi:m.example_vi||null});
    });
    if(!filtered.length)return{added:0,dups:dupList,items:[]};
    let p;if(b){const{data:m,error:C}=await supabase.from("vocab_items").insert(filtered).select();if(C)return console.error(C),c("Lỗi thêm từ vựng"),{added:0,dups:dupList,items:[]};p=m,await D(supabase.from("srs_records").upsert(p.map(g=>({user_id:o.id,vocab_id:g.id})),{onConflict:"user_id,vocab_id"}))}else{const m=new Date().toISOString();p=filtered.map(C=>({...C,id:jlId(),user_id:o.id,created_at:m,updated_at:m}))}
    const h=Object.fromEntries(p.map(m=>[m.id,{vocab_id:m.id,ease_factor:2.5,interval_days:0,repetitions:0,next_review:dayKey(),last_reviewed:null}]));
    return u(m=>({vocab:[...p,...m.vocab],srs:{...m.srs,...h}})),await z(),await B("add",p.length),await j(p.length>0?Math.min(5,Math.max(1,Math.ceil(p.length/5))):0,"vocab_add"),await w(),{added:p.length,dups:dupList,items:p};
  };
  const q=async(y,l)=>{u(p=>({vocab:p.vocab.map(h=>h.id===y?{...h,...l}:h)})),b&&await D(supabase.from("vocab_items").update({...l,updated_at:new Date().toISOString()}).eq("id",y))};
  const mergeVocabBackup=async(bakVocab=[],bakSrs={})=>{
    const res=await P(bakVocab,{skipDup:!0});
    const newSrs={...f.current.srs};
    Object.entries(bakSrs||{}).forEach(([vid,rec])=>{if(!newSrs[vid])newSrs[vid]=rec});
    u({srs:newSrs});
    return res.added;
  };
  return{...v,remote:b,toast:c,findDup,mergeVocabBackup,spendGold:async y=>{if(f.current.profile.gold<y)return false;u(l=>({profile:{...l.profile,gold:l.profile.gold-y}}));await R();return true},addMany:P,updateVocab:q,deleteVocab:async y=>{u(l=>{const p={...l.srs};return delete p[y],{vocab:l.vocab.filter(h=>h.id!==y),srs:p}}),b&&await D(supabase.from("vocab_items").delete().eq("id",y))},reviewCard:async(y,l)=>{const tough=onRes?onRes(y,l>=3):false;const p=f.current.srs[y]||{vocab_id:y},h={...p,...sm2(p,l)};if(tough&&h.interval_days>3){h.interval_days=3;h.next_review=addDaysKey(dayKey(),3)}u(g=>({srs:{...g.srs,[y]:h}}));const m=f.current.vocab.find(g=>g.id===y),C=l<3?"review":h.interval_days>=21?"mastered":"learning";if(m&&m.status!==C&&q(y,{status:C}),b){const{id:g,created_at:T,...H}=h;D(supabase.from("srs_records").upsert({...H,user_id:o.id,vocab_id:y},{onConflict:"user_id,vocab_id"}))}B("review",1)},finishSession:async({mode:y,score:l,total:p,responses:h})=>{const m=p<=0?0:(p>=5&&l===p?3:(l/p>=.8?2:1));onXp&&onXp(0,{k:"cards",n:p});if(u(C=>({sessions:C.sessions+1})),await z(),b){const{data:C,error:g}=await supabase.from("study_sessions").insert({mode:y,completed_at:new Date().toISOString(),score:l,total_questions:p,exp_earned:m}).select("id").single();g?c("Lỗi lưu buổi học"):h.length&&await D(supabase.from("study_responses").insert(h.map(T=>({session_id:C.id,...T}))))}return await B("session",1),await j(m,"quiz_complete"),await w({perfect:p>=5&&l===p}),m},claimQuest:M}};
}
