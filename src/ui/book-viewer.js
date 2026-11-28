// Sách lật trang 3D (xem trang sổ tay như sách mở), chuyển từ public/legacy/index.html (tách giao diện bước 14).
// PageRead và meoFeat vẫn nằm trong app cũ nên được truyền vào (dependency injection).
import React, { useState, useEffect, useRef, useMemo } from 'react';

export function makeBookViewer({ PageRead, meoFeat }) {
  return function BookViewer({title,color,pages,startId,theme,defFont,onClose,onEdit}){
    const E=React.createElement;
    const[vw,setVw]=useState(window.innerWidth),[vh,setVh]=useState(window.innerHeight);
    useEffect(()=>{const h=()=>{setVw(window.innerWidth);setVh(window.innerHeight)};addEventListener("resize",h);return()=>removeEventListener("resize",h)},[]);
    const single=vw<860;
    const leaves=useMemo(()=>[{cover:true,title},...pages],[pages,title]);
    const n=leaves.length,{maxS,maxC}=meoFeat.reader.bookBounds(n);
    const startIdx=meoFeat.reader.startLeafIndex(leaves,startId);
    const[s,setS]=useState(Math.ceil(startIdx/2)),[ci,setCi]=useState(startIdx),[anim,setAnim]=useState(null);
    const get=i=>i>=0&&i<n?leaves[i]:null;
    const go=dir=>{
      if(anim)return;
      if(!meoFeat.reader.canTurn(dir,single,s,ci,maxS,maxC))return;
      setAnim({dir,go:false});
    };
    const gor=useRef(go);gor.current=go;
    const closeRef=useRef(onClose);closeRef.current=onClose;
    useEffect(()=>{
      const h=e=>{if(e.key==="ArrowRight")gor.current("next");else if(e.key==="ArrowLeft")gor.current("prev");else if(e.key==="Escape")closeRef.current()};
      addEventListener("keydown",h);return()=>removeEventListener("keydown",h);
    },[]);
    useEffect(()=>{
      if(!anim||anim.go)return;
      let r2;const r1=requestAnimationFrame(()=>{r2=requestAnimationFrame(()=>setAnim(x=>x&&{...x,go:true}))});
      return()=>{cancelAnimationFrame(r1);cancelAnimationFrame(r2)};
    },[anim&&anim.dir,anim&&anim.go]);
    const commit=()=>{
      if(!anim)return;
      const d=anim.dir;
      if(single)setCi(c=>c+(d==="next"?1:-1));else setS(x=>x+(d==="next"?1:-1));
      setAnim(null);
    };
    useEffect(()=>{if(!anim||!anim.go)return;const t=setTimeout(commit,1100);return()=>clearTimeout(t)},[anim&&anim.go]);

    const W=single?Math.min(vw-24,520):Math.min(vw-40,1120),H=Math.max(360,Math.min(vh*0.78,720));
    const Face=(pg,idx,pos)=>{
      const rad=pos==="L"?"18px 4px 4px 18px":pos==="R"?"4px 18px 18px 4px":"16px";
      const sh=pos==="L"?"inset -16px 0 20px -16px rgba(0,0,0,.28)":pos==="R"?"inset 16px 0 20px -16px rgba(0,0,0,.28)":"none";
      const base={position:"absolute",inset:0,borderRadius:rad,boxShadow:sh,overflow:"hidden",backgroundColor:"#FFFDF6"};
      if(!pg)return E("div",{style:base});
      if(pg.cover)return E("div",{style:{...base,backgroundColor:color||theme.sidebar,boxShadow:"inset 0 0 0 6px rgba(255,255,255,.35)"},className:"flex flex-col items-center justify-center text-center p-8"},
        E("div",{className:"text-3xl font-extrabold",style:{color:"#4A3F5C"}},pg.title),
        E("div",{className:"mt-3 text-xs font-bold opacity-70",style:{color:"#4A3F5C"}},(n-1)+" trang · bấm ‹ › hoặc phím mũi tên để lật"));
      return E("div",{style:base},
        E("div",{style:{position:"absolute",inset:0,overflowY:"auto"}},
          E(PageRead,{page:pg,defFont,compact:true}),
          E("div",{className:"flex items-center justify-between px-5 pb-3 text-[11px] font-bold opacity-70",style:{color:"#3D3545"}},
            E("span",null,"— Trang ",idx," —"),
            E("button",{onClick:()=>onEdit(pg.id),className:"tap-fx px-2.5 py-1 rounded-lg bg-[#FCECF3]"},"Sửa trang"))));
    };
    const half=(side,pg,idx,hidden)=>E("div",{style:{position:"absolute",top:0,bottom:0,[side==="L"?"left":"right"]:0,width:"50%"}},hidden?null:Face(pg,idx,side));
    const dur=".85s cubic-bezier(.45,.05,.25,1)";
    let content;
    if(!single){
      const d=anim&&anim.dir;
      const lIdx=d==="next"?2*s-1:d==="prev"?2*s-3:2*s-1;
      const rIdx=d==="next"?2*s+2:2*s;
      const lHidden=d==="prev"?s-1===0:s===0;
      const rot=d==="next"?(anim.go?-180:0):d==="prev"?(anim.go?0:-180):0;
      const fIdx=d==="next"?2*s:2*s-2,bIdx=d==="next"?2*s+1:2*s-1;
      content=E(React.Fragment,null,
        half("L",get(lIdx),lIdx,lHidden),
        half("R",get(rIdx),rIdx,false),
        anim&&E("div",{onTransitionEnd:ev=>{if(ev.target===ev.currentTarget&&ev.propertyName==="transform")commit()},style:{position:"absolute",top:0,bottom:0,left:"50%",width:"50%",transformOrigin:"left center",transformStyle:"preserve-3d",transition:anim.go?"transform "+dur:"none",transform:"rotateY("+rot+"deg)",zIndex:5}},
          E("div",{style:{position:"absolute",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden"}},Face(get(fIdx),fIdx,"R")),
          E("div",{style:{position:"absolute",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",transform:"rotateY(180deg)"}},Face(get(bIdx),bIdx,"L"))),
        (s>0||anim)&&E("div",{style:{position:"absolute",top:0,bottom:0,left:"50%",width:36,marginLeft:-18,background:"linear-gradient(90deg,transparent,rgba(0,0,0,.16),transparent)",zIndex:6,pointerEvents:"none"}}));
    }else{
      const d=anim&&anim.dir;
      const sIdx=d==="next"?ci+1:ci;
      const fIdx=d==="next"?ci:ci-1;
      const rot=d==="next"?(anim.go?-100:0):d==="prev"?(anim.go?0:-100):0;
      content=E(React.Fragment,null,
        E("div",{style:{position:"absolute",inset:0}},Face(get(sIdx),sIdx,"S")),
        anim&&E("div",{onTransitionEnd:ev=>{if(ev.target===ev.currentTarget&&ev.propertyName==="transform")commit()},style:{position:"absolute",inset:0,transformOrigin:"left center",transformStyle:"preserve-3d",transition:anim.go?"transform "+dur:"none",transform:"rotateY("+rot+"deg)",zIndex:5}},
          E("div",{style:{position:"absolute",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",boxShadow:"0 0 30px rgba(0,0,0,.25)",borderRadius:16}},Face(get(fIdx),fIdx,"S"))));
    }
    const closed=!single&&s===0&&!anim;
    const lab=single?(ci===0?"Bìa":"Trang "+ci+" / "+(n-1)):(s===0?"Bìa":"Trang "+(2*s-1)+(2*s<n?"–"+(2*s):"")+" / "+(n-1));
    const atStart=single?ci<=0:s<=0,atEnd=single?ci>=maxC:s>=maxS;
    const cb={backgroundColor:"rgba(255,255,255,.9)",color:"#4A3F5C"};
    return E("div",{className:"fixed inset-0 flex flex-col items-center justify-center gap-4 p-3",style:{zIndex:1000,isolation:"isolate",backgroundColor:"rgba(40,28,52,.62)",backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)"},onClick:e=>{if(e.target===e.currentTarget)onClose()}},
      E("div",{className:"flex items-center gap-3 text-white text-sm font-extrabold"},E("span",null,title),E("button",{onClick:onClose,className:"tap-fx px-3 py-1 rounded-xl text-xs font-extrabold",style:cb},"Đóng ✕")),
      E("div",{style:{width:W,height:H,perspective:"2600px",transform:closed?"translateX("+(W/4)+"px)":"none",transition:"transform .6s ease",position:"relative"}},
        E("div",{style:{position:"absolute",inset:-8,borderRadius:26,backgroundColor:color||theme.sidebar,boxShadow:"0 24px 60px rgba(0,0,0,.4)"}}),
        E("div",{style:{position:"absolute",inset:0}},content)),
      E("div",{className:"flex items-center gap-3"},
        E("button",{disabled:atStart||!!anim,onClick:()=>go("prev"),className:"tap-fx px-4 py-2 rounded-xl text-xs font-extrabold disabled:opacity-40",style:cb},"‹ Trước"),
        E("span",{className:"text-white text-xs font-bold"},lab),
        E("button",{disabled:atEnd||!!anim,onClick:()=>go("next"),className:"tap-fx px-4 py-2 rounded-xl text-xs font-extrabold disabled:opacity-40",style:cb},"Sau ›")));
  };
}
