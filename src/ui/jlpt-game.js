// Màn Honor/Game JLPT, chuyển từ public/legacy/index.html (tách JLPT bước 2).
// MochiPet được truyền qua props vì nó vẫn nằm trong app cũ.
import React from 'react';
import { JCard, JLoading } from './shared.js';
import { ACH_DEFS, lvlInfo, QUEST_DEFS } from '../features/progression.js';

export function JlptGame({jl:o,theme:a,pet:petRaw,xpEarned:xpEarn=0,onPet:onPetUpd=()=>{},shop,MochiPet}){
  const E=React.createElement;
  if(!o.ready)return E(JLoading,{theme:a});
  const c=o.profile,LI=lvlInfo(c.exp),b=Math.round(LI.into/LI.need*100),v=new Set(o.ach);
  const quests=(type,title)=>E(JCard,{theme:a,className:"space-y-3"},E("h3",{className:"font-extrabold text-base"},title),
    o.quests.filter(u=>u.quest_type===type).map(u=>{
      const D=QUEST_DEFS.find(R=>R.id===u.quest_id);
      return D?E("div",{key:u.id,className:"space-y-1.5"},
        E("div",{className:"flex items-center gap-2 text-sm font-bold"},
          E("span",{className:"flex-1"},D.title),
          E("span",{className:"text-[11px] opacity-70"},"+",D.exp," EXP · +",D.gold," vàng"),
          E("button",{disabled:!u.completed||u.claimed,onClick:()=>o.claimQuest(u),style:{backgroundColor:u.claimed?a.accentSoft:u.completed?a.accent:a.accentSoft,color:u.completed&&!u.claimed?"#fff":a.text,opacity:u.completed||u.claimed?1:.5},className:"tap-fx px-3 py-1 rounded-full text-[11px] font-extrabold"},u.claimed?"Đã nhận ✓":u.completed?"Nhận thưởng":u.progress+"/"+u.target)),
        E("div",{className:"h-1.5 rounded-full overflow-hidden",style:{backgroundColor:a.accentSoft}},E("div",{className:"h-full",style:{width:Math.min(100,u.progress/u.target*100)+"%",backgroundColor:a.accent}}))):null;
    }));
  return E("div",{className:"space-y-4"},
    E("h2",{className:"text-xl font-extrabold"},"Honor"),E(MochiPet,{pet:petRaw,xpEarned:xpEarn,level:LI.level,theme:a,onUpdate:onPetUpd,shop:shop?{...shop,gold:c.gold}:null}),
    E(JCard,{theme:a,className:"space-y-3"},
      E("div",{className:"flex flex-wrap items-center gap-4"},
        E("div",{className:"flex-1 min-w-[180px]"},
          E("div",{className:"font-extrabold text-lg"},"Cấp ",LI.level),
          E("div",{className:"h-2.5 rounded-full overflow-hidden mt-1",style:{backgroundColor:a.accentSoft}},E("div",{className:"h-full rounded-full transition-all",style:{width:b+"%",backgroundColor:a.accent}})),
          E("div",{className:"text-[11px] opacity-70 mt-1"},LI.into,"/",LI.need," EXP để lên cấp ",LI.level+1," · tổng ",c.exp," EXP")),
        E("div",{className:"flex gap-3 text-center"},
          E("div",{style:{backgroundColor:a.accentSoft},className:"px-4 py-2 rounded-2xl"},E("div",{className:"text-lg font-extrabold"},c.gold),E("div",{className:"text-[10px] opacity-70"},"Vàng")),
          E("div",{style:{backgroundColor:a.accentSoft},className:"px-4 py-2 rounded-2xl"},E("div",{className:"text-lg font-extrabold"},c.streak_days),E("div",{className:"text-[10px] opacity-70"},"Ngày liên tiếp"))))),
    E("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-4"},quests("daily","Nhiệm vụ hằng ngày"),quests("weekly","Nhiệm vụ hằng tuần")),
    E(JCard,{theme:a,className:"space-y-3"},
      E("h3",{className:"font-extrabold text-base"},"Huy hiệu (",v.size,"/",ACH_DEFS.length,")"),
      E("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-2"},ACH_DEFS.map(f=>E("div",{key:f.id,style:{backgroundColor:a.accentSoft,opacity:v.has(f.id)?1:.4},className:"tap-fx p-3 rounded-2xl text-center"},
        E("div",{className:"text-xs font-extrabold"},f.title),E("div",{className:"text-[10px] opacity-70 mt-1"},f.desc))))),
    E(JCard,{theme:a,className:"space-y-2"},
      E("h3",{className:"font-extrabold text-base"},"Lịch sử EXP"),
      o.log.length?o.log.map(f=>E("div",{key:f.id,className:"flex text-xs font-bold"},E("span",{className:"flex-1"},f.reason.replace(/_/g," ")),E("span",{className:"ml-2",style:{color:a.accent}},"+",f.amount," EXP"),E("span",{className:"ml-3 opacity-60 w-24 text-right"},new Date(f.created_at).toLocaleDateString("vi-VN")))):E("p",{className:"text-xs opacity-70"},"Chưa có hoạt động nào.")));
}
