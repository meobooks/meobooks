// Thú cưng ảo Mochi (cho ăn, đi dạo, vuốt ve, tiệm đồ), chuyển từ public/legacy/index.html (tách giao diện bước 16).
// JCard, MochiMascot, SHOP_ITEMS, growOf, ageText, stageOf và meoFeat vẫn nằm trong app cũ nên được truyền vào (dependency injection).
import React, { useState, useRef } from 'react';

export function makeMochiPet({ JCard, MochiMascot, SHOP_ITEMS, growOf, ageText, stageOf, meoFeat }) {
  return function MochiPet({pet:raw,xpEarned:earned,level:lvl=1,theme:a,onUpdate,shop}){
    const E=React.createElement;
    const[anim,setAnim]=useState(""),[line,setLine]=useState("");const pokeRef=useRef([]);
    const pick=l=>l[Math.floor(Math.random()*l.length)];
    const play=(k,lines)=>{setAnim(k);setLine(lines?pick(lines):"");clearTimeout(window.__mmT);window.__mmT=setTimeout(()=>{setAnim("");setLine("")},k==="walk"?3400:k==="poke"?1600:2800)};
    const PET=["Purrr... thích quá đi!","Meo~ vuốt nữa đi, nữa đi!","Mochi híp mắt hạnh phúc rồi nè!","Ư~ gãi cằm Mochi đi nè!"],
      POKE=["Meo?! Giật cả mình!","Ơ! Ai chọc Mochi đó?","Hửm? Mochi đây nè!","Meo meo, đừng chọc nữa mà~"],
      EAT=["Nhồm nhoàm... cá ngon quá!","Ngon quá, cho Mochi thêm nữa nha!"],
      WALK=["Đi dạo thôi nào, meo meo ♪","Gió mát quá đi~"],ANGRY=["Meo!! Đừng chọc nữa mà, Mochi giận rồi đó!","Hừ! Mochi cáu rồi nha!"],LICK=["Mochi chăm chỉ liếm lông nè~","Liếm lông cho sạch sẽ nào ♪"];
    const now=Date.now();
    const base=raw||{food:80,mood:80,xpSpent:0,ts:null,lastPet:0};
    const petLogic=meoFeat.mochiPet;
    const {food,mood}=petLogic.decayedStats(base,now);
    const spent=base.xpSpent||0, balance=Math.max(0,earned-spent);
    const cool=petLogic.cooldownLeft(base.lastPet,now);
    const months=Math.max(1,lvl|0), grow=growOf(months);
    const act=(cost,dFood,dMood,msg,extra)=>{
      const next=petLogic.afterAction({food,mood,spent,balance,lastPet:base.lastPet},cost,dFood,dMood,now,extra);
      if(next)onUpdate(next,msg);
    };
    const face=food<30?"sleepy":mood<30?"sad":mood>=70?"happy":"study";
    const idle=food<30?"Mochi đang đói, cho Mochi ăn nhé!":mood<30?"Mochi buồn quá, dắt Mochi đi dạo nhé!":months<3?"Mochi còn bé xíu à. Học chăm để Mochi lớn nhanh nhé!":"Mochi đang vui vẻ!";
    const say=line||idle;
    const shopUI=shop&&E("div",{className:"pt-3 space-y-2",style:{borderTop:"1px dashed "+a.border}},E("div",{className:"flex items-center gap-2"},E("div",{className:"font-extrabold text-sm flex-1"},"Tiệm đồ của Mochi"),E("span",{className:"text-xs font-bold"},shop.gold+" vàng")),E("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:8}},SHOP_ITEMS.map(it=>{const own=shop.owned.includes(it.id),on=shop.equipped===it.id;return E("div",{key:it.id,className:"p-2 rounded-2xl text-center space-y-1",style:{backgroundColor:a.accentSoft,outline:on?"2px solid "+a.accent:"none"}},E("div",{className:"mx-auto",style:{width:60}},E(MochiMascot,{mood:"happy",accessory:it.id,size:60,grow:1,outfit:true})),E("div",{className:"text-xs font-extrabold"},it.name),E("button",{disabled:!own&&shop.gold<it.price,onClick:()=>own?shop.equip(it.id):shop.buy(it),className:"tap-fx w-full py-1 rounded-lg text-[11px] font-bold disabled:opacity-40",style:{backgroundColor:on?a.accent:a.card,color:on?"#fff":a.text}},on?"Đang mặc":own?"Mặc":"Mua · "+it.price+" vàng"))})));
    const bar=(label,v)=>E("div",{className:"space-y-1"},
      E("div",{className:"flex justify-between text-xs font-bold"},E("span",null,label),E("span",null,v+"/100")),
      E("div",{style:{height:10,borderRadius:9999,overflow:"hidden",backgroundColor:a.accentSoft}},E("div",{style:{height:"100%",width:v+"%",borderRadius:9999,backgroundColor:a.accent,transition:"width .4s"}})));
    const btn=(label,cost,onClick,off)=>E("button",{onClick,disabled:!!off||balance<cost,className:"tap-fx px-3 py-2 rounded-xl text-xs font-extrabold disabled:opacity-40",style:{backgroundColor:a.accentSoft,color:a.text}},label);
    return E(JCard,{theme:a,className:"space-y-4"},
      E("div",{className:"flex items-center gap-2 flex-wrap"},
        E("h3",{className:"font-extrabold text-base flex-1"},"Virtual Mochi Pet"),
        E("span",{className:"text-xs font-extrabold px-2.5 py-1 rounded-full",style:{backgroundColor:a.accentSoft}},ageText(months)+" · "+stageOf(months)),
        E("span",{className:"text-xs font-bold opacity-70"},"XP có thể chi: ",balance)),
      E("p",{className:"text-xs opacity-75"},"Cấp ",months," = ",months," tháng tuổi. Lên cấp để Mochi lớn dần. Chạm vào Mochi để trêu, hoặc chăm sóc bằng XP."),
      E("div",{className:"flex flex-col md:flex-row gap-4 items-center"},
        E("div",{className:"shrink-0 cursor-pointer select-none",title:"Chạm vào Mochi thử xem",onClick:()=>{const t=Date.now(),arr=(pokeRef.current||[]).filter(x=>t-x<4000);arr.push(t);if(arr.length>=3){pokeRef.current=[];play("angry",ANGRY)}else{pokeRef.current=arr;play("poke",POKE)}}},E(MochiMascot,{mood:face,accessory:shop?shop.equipped:"bow",size:130,grow,action:anim,outfit:true})),
        E("div",{className:"flex-1 w-full space-y-3"},
          E("p",{className:"text-sm font-bold"},say),
          bar("No bụng",food),
          bar("Tâm trạng",mood),
          E("div",{className:"flex flex-wrap gap-2 pt-1"},
            btn("Cho ăn · 10 XP",10,()=>{act(10,25,3,"Mochi đã ăn no nê!");play("eat",EAT)}),
            btn("Đi dạo · 20 XP",20,()=>{act(20,-5,25,"Mochi vui vẻ sau khi đi dạo!");play("walk",WALK)}),
            btn(cool>0?"Vuốt ve lại sau "+Math.ceil(cool/60000)+" phút":"Vuốt ve (miễn phí)",0,()=>{act(0,0,10,"Mochi kêu meo meo vui quá!",{lastPet:now});play("smile",PET)},cool>0),btn("Liếm lông · 5 XP",5,()=>{act(5,0,2,"Mochi sạch sẽ rồi!");play("lick",LICK)})))),shopUI);
  };
}
