// Bộ chọn sổ/bộ thẻ (nbDeckPicker) dùng trong Bắn Từ và Nối Từ, chuyển từ public/legacy/index.html.
// cleanT vẫn nằm trong app cũ nên được truyền vào (dependency injection).
import React from 'react';

export function makeNbDeckPicker({ cleanT }) {
  return function nbDeckPicker(o){
  const E=React.createElement;
  const {a,onAcc,deck,decks,views,nbs,nbViews,onPick,label}=o;
  const nbDecks=decks.filter(d=>d.id!=="all"&&d.id!=="_"&&d.id!=="tough");
  const haveNb=new Set(nbDecks.map(d=>d.id)),haveView=new Set(views.map(v=>v.id));
  const emptyNbs=nbs.filter(n=>!haveNb.has(n.id)).map(n=>({id:n.id,title:cleanT(n.title),list:[],empty:true}));
  const openNb=deck.nb||(haveNb.has(deck.id)?deck.id:null);
  const openDeck=nbDecks.find(d=>d.id===openNb);
  const nbObj=openDeck?nbs.find(n=>n.id===openDeck.id):null;
  const openViews=openDeck?[...views.filter(v=>v.nb===openDeck.id),...((nbObj&&nbViews[nbObj.id])||[]).filter(vw=>!haveView.has("v:"+vw.id)).map(vw=>({id:"v:"+vw.id,name:vw.name,list:[],empty:true}))]:[];
  const chipSt=on=>({backgroundColor:on?a.accent:a.accentSoft,color:on?onAcc:a.text,borderRadius:12,padding:"7px 14px",fontSize:13,fontWeight:800,display:"inline-flex",alignItems:"center",gap:6,lineHeight:1.2});
  const pill=(d,text,on)=>d.empty
    ?E("button",{key:d.id,disabled:true,title:"Chưa có từ chơi được",style:{...chipSt(false),opacity:.45,cursor:"not-allowed",border:"1.5px dashed "+a.border,backgroundColor:"transparent"}},text,E("span",{style:{fontSize:11,fontWeight:700}},0))
    :E("button",{key:d.id,onClick:()=>onPick(d),"aria-pressed":on,className:"tap-fx",style:chipSt(on)},on&&E("span",{"aria-hidden":true},"✓"),text,E("span",{style:{fontSize:11,fontWeight:700,opacity:.7}},d.list.length));
  return E("div",{className:"space-y-2"},
    E("div",{style:{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:8,flexWrap:"wrap"}},
      E("span",{style:{fontSize:13,fontWeight:800}},label||"Chọn bộ từ"),
      E("span",{style:{fontSize:12,fontWeight:700,opacity:.75}},"Đang chọn: "+deck.title+" · "+deck.list.length+" từ")),
    E("div",{style:{display:"flex",flexWrap:"wrap",gap:8}},
      [...decks,...emptyNbs].map(d=>pill(d,d.title,nbDecks.includes(d)?openNb===d.id:deck.id===d.id))),
    openViews.length>0&&E("div",{style:{border:"2px solid "+a.accent,borderRadius:16,padding:"8px 10px 10px"}},
      E("div",{style:{fontSize:12,fontWeight:800,opacity:.8,marginBottom:6}},"Chọn view trong "+openDeck.title),
      E("div",{style:{display:"flex",flexWrap:"wrap",gap:8}},
        pill(openDeck,"Cả sổ",deck.id===openDeck.id),
        openViews.map(v=>pill(v,v.name,deck.id===v.id)))));
  };
}
