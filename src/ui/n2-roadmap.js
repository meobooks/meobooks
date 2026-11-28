// Lộ trình N2 (Lantern Lane), chuyển từ public/legacy/index.html (tách giao diện bước 7).
// supabase, RM_LV_BY_LANG, RmLesson và meoFeat vẫn nằm trong app cũ nên được truyền vào (dependency injection).
import React from 'react';

export function makeN2Roadmap({ supabase, RM_LV_BY_LANG, RmLesson, meoFeat }) {
  return function N2Roadmap({theme:a,done,onDone,subject,khoAdd,khoRemove,notebooks}){
    const E=React.createElement;
    const[lv,setLv]=React.useState("n2");const lg=subject==="Chinese"?"zh":subject==="English"?"en":"ja";
    const[books,setBooks]=React.useState([]);
    const[lessons,setLessons]=React.useState([]);
    const[loading,setLoading]=React.useState(true);
    const[err,setErr]=React.useState("");
    const[open,setOpen]=React.useState(null);
    const[hideDone,setHideDone]=React.useState(false);
    const[closed,setClosed]=React.useState({});
    React.useEffect(()=>{
      let alive=true;
      (async()=>{
        if(!supabase){if(alive){setErr("Chiếc đèn lồng đang được thắp, bạn quay lại sau nhé 🏮");setLoading(false)}return}
        const[b,l]=await Promise.all([
          supabase.from("roadmap_books").select("*").order("sort",{ascending:true}),
          supabase.from("roadmap_lessons").select("*").order("sort",{ascending:true})]);
        if(!alive)return;
        if(b.error||l.error)setErr("Chiếc đèn lồng đang được thắp, bạn quay lại sau nhé 🏮");
        setBooks(b.data||[]);setLessons(l.data||[]);setLoading(false);
      })();
      return()=>{alive=false};
    },[]);
    if(open)return E(RmLesson,{lesson:open,theme:a,done:!!(done&&done[open.id]),doneMap:done||{},onDone:onDone,onBack:()=>setOpen(null),khoAdd:khoAdd,khoRemove:khoRemove,notebooks:notebooks});
    const lvE=meoFeat.roadmap.resolveLevel(RM_LV_BY_LANG[lg],lv);const lb=meoFeat.roadmap.booksFor(books,lvE,lg);
    const card={backgroundColor:a.card,borderColor:a.border,color:a.text};
    return E("div",{className:"max-w-3xl mx-auto space-y-6"},
      E("h2",{className:"text-2xl font-extrabold"},"Lantern Lane"),
      E("div",{className:"flex flex-wrap gap-2"},(RM_LV_BY_LANG[lg]||[]).map(x=>E("button",{key:x.id,onClick:()=>setLv(x.id),className:"tap-fx px-4 py-2 rounded-xl text-xs font-extrabold",style:{backgroundColor:x.id===lvE?a.accent:a.accentSoft,color:x.id===lvE?"#fff":a.text}},x.title))),
      E("div",{className:"flex justify-end"},E("button",{onClick:()=>setHideDone(!hideDone),className:"tap-fx px-3 py-1.5 rounded-xl text-xs font-extrabold",style:{backgroundColor:a.accentSoft,color:a.text}},hideDone?"Hiện tất cả":"Ẩn bài đã học")),
      loading?E("p",{className:"text-sm opacity-70"},"Đang tải lộ trình…"):
      err?E("p",{className:"text-sm text-rose-600 font-bold"},err):
      lb.length===0?E("div",{style:card,className:"p-8 rounded-3xl border text-center"},E("p",{className:"text-sm font-bold opacity-80"},"Chiếc đèn lồng đang được thắp, bạn quay lại sau nhé 🏮")):
      lb.map(b=>{const all=lessons.filter(x=>x.book_id===b.id);const doneN=all.filter(x=>done&&done[x.id]).length;const isClosed=!!closed[b.id];const shown=hideDone?all.filter(x=>!(done&&done[x.id])):all;
        return E("div",{key:b.id,style:card,className:"p-6 rounded-3xl border space-y-3"},
          E("button",{onClick:()=>setClosed({...closed,[b.id]:!isClosed}),className:"w-full flex items-center justify-between gap-2 text-left"},
            E("h3",{className:"font-extrabold text-base"},b.title),
            E("span",{className:"text-xs font-extrabold"},(all.length&&doneN===all.length?"✓ Hoàn thành":doneN+"/"+all.length+" bài")+(isClosed?" ▸":" ▾"))),(()=>{const pct=all.length?Math.round(doneN*100/all.length):0;return E("div",{key:"bar",className:"space-y-1"},E("div",{className:"w-full h-2.5 rounded-full overflow-hidden",style:{backgroundColor:a.accentSoft}},E("div",{className:"h-full rounded-full transition-all duration-500",style:{width:pct+"%",backgroundColor:a.accent}})),E("p",{className:"text-[11px] font-extrabold opacity-80 text-right"},pct+"%"))})(),
          !isClosed&&shown.slice().sort((p,q)=>(p.note||"").localeCompare(q.note||"")||(p.sort||0)-(q.sort||0)).reduce((acc,x)=>{if(x.note&&x.note!==acc.last){acc.last=x.note;(()=>{const chAll=all.filter(y=>y.note===x.note);const chDone=chAll.filter(y=>done&&done[y.id]).length;const pct=chAll.length?Math.round(chDone*100/chAll.length):0;return acc.out.push(E("div",{key:"ch-"+x.id,className:"space-y-1 mt-3"},E("div",{className:"flex items-center justify-between gap-2 text-xs font-extrabold",style:{color:a.accent}},E("span",null,x.note),E("span",null,chDone+"/"+chAll.length+" · "+pct+"%")),E("div",{className:"w-full h-2 rounded-full overflow-hidden",style:{backgroundColor:a.accentSoft}},E("div",{className:"h-full rounded-full transition-all duration-500",style:{width:pct+"%",backgroundColor:a.accent}}))))})()}const d=!!(done&&done[x.id]);acc.out.push(E("button",{key:x.id,onClick:()=>setOpen(x),className:"tap-fx w-full text-left rounded-2xl px-4 py-3 flex items-center justify-between gap-2",style:{backgroundColor:a.accentSoft,color:a.text}},E("span",{className:"font-bold text-sm"},x.title),E("span",{className:"text-xs font-extrabold"},d?"✓ Xong":"Học ▶")));return acc},{last:null,out:[]}).out,
          !isClosed&&hideDone&&shown.length===0&&E("p",{className:"text-xs opacity-70"},"Đã học hết các bài trong quyển này."));
      }));
  };
}
