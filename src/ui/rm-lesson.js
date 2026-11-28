// Bài học trong lộ trình N2 (bài đọc, bài tập, từ vựng), chuyển từ public/legacy/index.html (tách giao diện bước 17).
// rmNorm, VocabTable và meoFeat vẫn nằm trong app cũ nên được truyền vào (dependency injection).
import React from 'react';

export function makeRmLesson({ rmNorm, VocabTable, meoFeat }) {
  return function RmLesson({lesson:l,theme:a,done,doneMap,onDone,onBack,khoAdd,khoRemove,notebooks}){
    const E=React.createElement;
    const dm=doneMap||{};
    const exs=Array.isArray(l.exercises)?l.exercises:[];
    const nested=exs.length>0&&!!exs[0]&&Array.isArray(exs[0].questions);
    const sets=nested
      ?exs.map((s,i)=>({sid:s.set_id||("ex-"+String(i+1).padStart(2,"0")),title:s.title||("Bài tập "+String(i+1).padStart(2,"0")),qs:Array.isArray(s.questions)?s.questions:[]}))
      :[{sid:null,title:"Bài tập",qs:exs}];
    const[cur,setCur]=React.useState(null);
    const[ansAll,setAnsAll]=React.useState({});
    const[checkedAll,setCheckedAll]=React.useState({});
    const si=nested?cur:0;
    const hasSet=si!==null&&si!==undefined&&!!sets[si];
    const set=hasSet?sets[si]:null;
    const exsCur=set?set.qs:[];
    const ans=(hasSet&&ansAll[si])||{};
    const checked=hasSet&&!!checkedAll[si];
    const card={backgroundColor:a.card,borderColor:a.border,color:a.text};
    const btn=(label,fn,pr)=>E("button",{onClick:fn,className:"tap-fx px-4 py-2 rounded-xl text-xs font-extrabold",style:{backgroundColor:pr?a.accent:a.accentSoft,color:pr?"#fff":a.text}},label);
    const ok=(ex,v)=>{
      if(ex.type==="choice")return v===ex.answer;
      if(ex.type==="fill")return Array.isArray(ex.answer)?ex.answer.some(x=>rmNorm(x)===rmNorm(v)):rmNorm(ex.answer)===rmNorm(v);
      if(ex.type==="order"){const sel=Array.isArray(v)?v:[];return sel.map(k=>ex.words[k]).join(" ")===(ex.answer||[]).join(" ")}
      if(ex.type==="match"){const m=(v&&v.map)||{};return (ex.pairs||[]).every((_,li)=>m[li]===li)}
      return false;
    };
    const score=exsCur.filter((ex,i)=>ok(ex,ans[i])).length;
    const isAnswered=(ex,v)=>{if(ex.type==="choice")return v!==undefined;if(ex.type==="fill")return !!rmNorm(v);if(ex.type==="order")return Array.isArray(v)&&v.length>0;if(ex.type==="match")return !!v&&Object.keys(v.map||{}).length===(ex.pairs||[]).length;return false};
    const setKeyOf=s=>l.id+":"+s.sid;
    const check=()=>{
      setCheckedAll({...checkedAll,[si]:true});
      if(!set||exsCur.length===0||!exsCur.every((ex,i)=>isAnswered(ex,ans[i])))return;
      if(!exsCur.every((ex,i)=>ok(ex,ans[i])))return;
      if(!nested){if(!done){onDone([l.id]);window.dispatchEvent(new CustomEvent("mochi:celebrate"))}return}
      const keys=[];
      if(!dm[setKeyOf(set)])keys.push(setKeyOf(set));
      const allDone=sets.every((s,k)=>k===si||dm[setKeyOf(s)]);
      if(allDone&&!done)keys.push(l.id);
      if(keys.length)onDone(keys);
    };
    const setA=(i,val)=>setAnsAll({...ansAll,[si]:{...ans,[i]:val}});
    const resetSet=()=>{setAnsAll({...ansAll,[si]:{}});setCheckedAll({...checkedAll,[si]:false})};
    const body=(ex,i)=>{
      const v=ans[i];
      if(ex.type==="choice")return (ex.options||[]).map((o,k)=>E("button",{key:k,disabled:checked,onClick:()=>setA(i,k),className:"block w-full text-left px-3 py-2 rounded-xl text-sm border",style:{backgroundColor:v===k?a.accent:a.card,color:v===k?"#fff":a.text,borderColor:a.border}},o));
      if(ex.type==="fill")return E("input",{value:v||"",disabled:checked,onChange:e=>setA(i,e.target.value),placeholder:"Nhập đáp án...",className:"w-full px-3 py-2 rounded-xl border text-sm",style:{borderColor:a.border,backgroundColor:a.card,color:a.text}});
      if(ex.type==="order"){
        const sel=Array.isArray(v)?v:[];
        const chip=(k,on)=>E("button",{key:"w"+k+(on?"s":"p"),disabled:checked,onClick:()=>setA(i,on?sel.filter(x=>x!==k):[...sel,k]),className:"px-3 py-1.5 rounded-xl text-sm font-bold",style:{backgroundColor:on?a.accent:a.card,color:on?"#fff":a.text,border:"1px solid "+a.border}},ex.words[k]);
        return E("div",{className:"space-y-2"},
          E("div",{className:"flex flex-wrap gap-2 min-h-[36px]"},sel.map(k=>chip(k,true))),
          E("div",{className:"flex flex-wrap gap-2"},(ex.words||[]).map((_,k)=>!sel.includes(k)&&chip(k,false))));
      }
      if(ex.type==="match"){
        const cur2=v||{map:{},sel:null};
        const pairs=ex.pairs||[];
        const rorder=pairs.map((_,k)=>(k+1)%pairs.length);
        const used=Object.values(cur2.map);
        const set2=nv=>setA(i,{...cur2,...nv});
        const lockedRight=pi=>checked&&Object.entries(cur2.map).some(([li,r])=>Number(li)===Number(r)&&Number(r)===pi);
        const rows=pairs.map((p,li)=>{
          const ri=cur2.map[li];
          if(ri===undefined)return E("div",{key:"m"+li,className:"flex items-center justify-between gap-2 rounded-xl px-3 py-2 border text-xs",style:{borderColor:a.border,color:a.text,backgroundColor:a.card}},E("span",{className:"font-bold"},p.l),E("span",{className:"opacity-60"},"Chưa ghép"));
          const correct=li===ri;
          const status=checked?(correct?"Đúng":"Chưa đúng"):"Đã ghép";
          return E("div",{key:"m"+li,className:"flex items-center justify-between gap-2 rounded-xl px-3 py-2 border text-xs",style:{borderColor:checked?(correct?"#16A34A":"#E11D48"):a.border,backgroundColor:checked?(correct?"rgba(22,163,74,.08)":"rgba(225,29,72,.08)"):a.card,color:a.text}},
            E("span",{className:"font-bold min-w-0"},p.l),
            E("span",{className:"opacity-60 shrink-0"},"→"),
            E("span",{className:"min-w-0 text-right"},pairs[ri].r),
            E("span",{className:"font-bold shrink-0",style:{color:checked?(correct?"#15803D":"#BE123C"):a.accent}},status));
        });
        return E("div",{className:"space-y-3"},
          E("div",{className:"grid grid-cols-2 gap-2"},
            E("div",{className:"space-y-2"},pairs.map((p,li)=>E("button",{key:"l"+li,disabled:checked&&cur2.map[li]===li,onClick:()=>set2({sel:cur2.sel===li?null:li}),className:"block w-full px-3 py-2 rounded-xl text-sm font-bold border",style:{backgroundColor:cur2.sel===li?a.accent:(checked&&cur2.map[li]!==undefined?"rgba(225,29,72,.08)":a.card),color:cur2.sel===li?"#fff":a.text,borderColor:checked&&cur2.map[li]!==undefined?(cur2.map[li]===li?"#16A34A":"#E11D48"):a.border}},p.l))),
            E("div",{className:"space-y-2"},rorder.map((pi,k)=>{
              const isUsed=used.includes(pi);
              return E("button",{key:"r"+k,disabled:cur2.sel===null||(checked?lockedRight(pi):isUsed),onClick:()=>{
                if(cur2.sel===null)return;
                const next={...cur2.map};
                delete next[cur2.sel];
                Object.keys(next).forEach(key=>{if(next[key]===pi)delete next[key]});
                next[cur2.sel]=pi;
                set2({map:next,sel:null});
              },className:"block w-full px-3 py-2 rounded-xl text-sm border",style:{backgroundColor:isUsed?a.accentSoft:a.card,color:a.text,borderColor:lockedRight(pi)?"#16A34A":a.border}},pairs[pi].r);
            }))),
          E("div",{className:"rounded-xl border p-3 space-y-2",style:{borderColor:a.border,backgroundColor:a.card}},
            E("p",{className:"text-xs font-extrabold",style:{color:a.accent}},"Các cặp bạn đã ghép"),
            rows));
      }
      return null;
    };
    const paras=(l.content||"").split(/\n\s*\n/).filter(Boolean);
    const F=l.fields||null;
    const vrows=F?null:meoFeat.roadmap.parseVocabLines(l.content);
    const fieldCard=f=>{
      const cell=(k,lab,cls,big)=>f[k]?E("div",{key:k,className:"rounded-2xl px-4 py-3",style:{backgroundColor:a.accentSoft,gridColumn:cls==="full"?"1 / -1":undefined}},
        E("p",{className:"text-[11px] font-extrabold",style:{color:a.accent}},lab),
        E("p",{className:big?"text-lg font-bold whitespace-pre-line mt-1":"text-sm whitespace-pre-line mt-0.5"},f[k])):null;
      const exampleCell=f.example?E("div",{key:"ex",className:"rounded-2xl px-4 py-3",style:{backgroundColor:a.accentSoft,gridColumn:"1 / -1"}},
        E("p",{className:"text-[11px] font-extrabold",style:{color:a.accent}},"✍️ Câu ví dụ"),
        E("p",{className:"text-base font-bold whitespace-pre-line mt-1"},f.example),
        f.translation&&E("p",{className:"text-sm mt-1 opacity-80 whitespace-pre-line"},f.translation)):null;
      return E("div",{style:card,className:"p-5 rounded-3xl border space-y-3"},
        E("div",{style:{display:"flex",alignItems:"baseline",gap:10,flexWrap:"wrap"}},
          E("h3",{className:"font-extrabold text-lg"},"#"+(l.sort||"")+" "+l.title),
          f.meaning&&E("span",{className:"text-xs opacity-80"},"Ý nghĩa: "+f.meaning)),
        E("div",{className:"grid gap-2",style:{gridTemplateColumns:"1fr 1fr"}},
          cell("connection","Cách kết hợp","full",true),
          exampleCell,
          cell("context","Ngữ cảnh sử dụng"),
          cell("mistake","Lỗi thường gặp"),
          cell("similar","Cấu trúc tương tự"),
          cell("difference","Điểm khác biệt"),
          cell("tip","Mẹo ghi nhớ","full")));
    };
    const setGrid=E("div",{style:card,className:"p-6 rounded-3xl border space-y-4"},
      E("h3",{className:"font-extrabold text-base"},"Bài tập"),
      E("div",{className:"grid grid-cols-2 sm:grid-cols-5 gap-2"},sets.map((s,k)=>{const d=!!dm[setKeyOf(s)];return E("button",{key:k,onClick:()=>setCur(k),className:"tap-fx px-3 py-3 rounded-xl text-sm font-extrabold border",style:{backgroundColor:d?a.accent:a.card,color:d?"#fff":a.text,borderColor:a.border}},(d?"✓ ":"")+s.title)})));
    const exerciseCard=E("div",{style:card,className:"p-6 rounded-3xl border space-y-4"},
      nested
        ?E("div",{className:"flex items-center gap-3 flex-wrap"},btn("← Danh sách bài tập",()=>setCur(null),false),E("h3",{className:"font-extrabold text-base"},set.title))
        :E("h3",{className:"font-extrabold text-base"},"Bài tập"),
      exsCur.map((ex,i)=>E("div",{key:i,className:"rounded-2xl p-4 space-y-3",style:{backgroundColor:a.accentSoft}},
        E("p",{className:"font-bold text-sm"},(i+1)+". "+(ex.q||"")),
        body(ex,i),
        checked&&E("p",{className:"text-xs font-bold "+(ok(ex,ans[i])?"text-emerald-700":"text-rose-600")},ok(ex,ans[i])?"Đúng!":"Chưa đúng"+(ex.explain?" · "+ex.explain:"")))),
      E("div",{className:"flex items-center gap-3 flex-wrap"},
        !checked?btn("Kiểm tra",check,true):E("span",{className:"text-sm font-extrabold"},"Điểm: "+score+"/"+exsCur.length+(score===exsCur.length?" · Hoàn thành! 🎉":"")),
        checked&&score<exsCur.length&&btn("Kiểm tra lại",check,true),
        checked&&btn("Làm lại",resetSet,false),
        checked&&nested&&si<sets.length-1&&btn("Bài tiếp theo →",()=>setCur(si+1),true)));
    const block=nested&&!hasSet?setGrid:(exsCur.length===0
      ?btn(done?"Đã đọc ✓":"Đánh dấu đã đọc",()=>{if(!done)onDone([l.id])},true)
      :exerciseCard);
    return E("div",{className:"max-w-3xl mx-auto space-y-5"},
      btn("← Lộ trình",onBack,false),
      F?fieldCard(F):null,
      !F&&E("h2",{className:"text-2xl font-extrabold"},l.title),
      !F&&l.note&&E("p",{className:"text-xs opacity-75 -mt-3"},l.note),
      !F&&E("div",{style:card,className:"p-6 rounded-3xl border space-y-3"},
        vrows?E(VocabTable,{rows:vrows,lessonId:l.id,theme:a,khoAdd:khoAdd,khoRemove:khoRemove,notebooks:notebooks}):paras.length?paras.map((p,k)=>E("p",{key:k,className:"text-sm leading-relaxed whitespace-pre-line"},p)):E("p",{className:"text-sm opacity-70"},"Bài này chưa có nội dung đọc.")),
      block);
  };
}
