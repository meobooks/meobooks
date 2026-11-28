// Kho Từ Vựng Thống Nhất (thêm, sửa, lọc, nhập hàng loạt, cảnh báo trùng), chuyển từ public/legacy/index.html (tách giao diện bước 19).
// Các helper và hằng số của app cũ được truyền vào (dependency injection); langOfWord được bọc vì khai báo ở dòng sau điểm gọi.
import React, { useState, useMemo } from 'react';

export function makeJlptVocab({ front, cleanT, nbOf, classOf, classBadge, CL_BG, STATUS_LABEL, speak, langOfWord, withNb, EMPTY_V, WORD_TYPES, JCard, JLoading, meoFeat }) {
  return function JlptVocab({jl:o,theme:a,notebooks:nbs=[],stats:vs={},onSyncToNotebook}){
    const E=React.createElement;
    const[c,setC]=useState(""),[st,setSt]=useState("all"),[fav,setFav]=useState(false),[cl,setCl]=useState("all"),[u,D]=useState(null),[R,setR]=useState(null),[bulk,setBulk]=useState(null),[bulkNb,setBulkNb]=useState(""),[open,setOpen]=useState({}),[lim,setLim]=useState({}),[dupAlert,setDupAlert]=useState(null);
    const q=c.trim().toLowerCase();
    const P=useMemo(()=>meoFeat.vocabList.filterVocab({vocab:o.vocab,srs:o.srs,q,status:st,favOnly:fav,cls:cl,vs}),[o.vocab,o.srs,q,st,fav,cl,vs]);
      const sugg=useMemo(()=>meoFeat.vocabList.suggestionsFor(o.vocab,u,5),[o.vocab,u&&u.word]);
    if(!o.ready)return E(JLoading,{theme:a});
    const known=new Set(nbs.map(n=>n.id));
    const nbTitleById=id=>{const x=nbs.find(n=>n.id===id);return x?cleanT(x.title):"Chưa phân sổ"};
    const groups=[...nbs.map(n=>({id:n.id,title:n.title,color:n.color})),{id:"_",title:"Chưa phân sổ",color:a.accentSoft}];
    const inG=(v,g)=>g.id==="_"?!known.has(nbOf(v)):nbOf(v)===g.id;
    const filtering=!!q||st!=="all"||fav||cl!=="all";
    const counts=meoFeat.vocabList.statusCounts(o.vocab);
    const N={borderColor:a.border,backgroundColor:a.card,color:a.text};
    const firstNb=(nbs[0]&&nbs[0].id)||"";

    const liveDup=useMemo(()=>{
      if(!u)return null;
      return meoFeat.vocabList.liveDuplicate(u,R,o.findDup);
    },[u&&u.word,u&&u.kanji,R,o.vocab]);

    const submit=async(ev,forceAdd=false)=>{
      if(ev)ev.preventDefault();
      if(!(u.word||u.kanji)||!u.meaning)return o.toast("Cần có từ và nghĩa");
      const{nb,...rest}=u;
      if(!R&&!forceAdd&&liveDup){
        setDupAlert({word:front(liveDup),meaning:liveDup.meaning,nbName:nbTitleById(nbOf(liveDup)),pending:{...rest,tags:withNb([],nb)}});
        return;
      }
      if(R){
        const old=o.vocab.find(x=>x.id===R);
        await o.updateVocab(R,{...rest,word:rest.word||rest.kanji,tags:withNb(old&&old.tags,nb)});
        if(onSyncToNotebook)onSyncToNotebook(R,{...rest,word:rest.word||rest.kanji,notebookId:nb});
        setR(null);o.toast("Đã cập nhật từ vựng (đã đồng bộ với sổ tay)");
      }else{
        const res=await o.addMany([{...rest,tags:withNb([],nb)}],{skipDup:!forceAdd});
        if(res.added>0){
          if(onSyncToNotebook&&res.items[0])onSyncToNotebook(res.items[0].id,{...res.items[0],notebookId:nb});
          o.toast("Đã thêm từ vựng mới và liên kết với sổ tay!");
        }
      }
      setDupAlert(null);
      D(null);
    };
    const importBulk=async(forceAll=false)=>{
      const rows=meoFeat.bulkVocab.parseBulkLines(bulk,bulkNb||firstNb);
      if(!rows.length)return o.toast("Không có dòng hợp lệ (Từ - Cách đọc - Nghĩa)");
      const res=await o.addMany(rows,{skipDup:!forceAll});
      if(onSyncToNotebook&&res.items)res.items.forEach(it=>onSyncToNotebook(it.id,{...it,notebookId:bulkNb||firstNb}));
      if(res.dups.length&&!forceAll){
        o.toast(`Đã thêm ${res.added} từ mới. Bỏ qua ${res.dups.length} từ đã tồn tại: ${res.dups.slice(0,4).map(d=>d.item.word).join(", ")}${res.dups.length>4?"…":""}`);
      }else{
        o.toast("Đã thêm "+res.added+" từ vào kho thống nhất!");
      }
      setBulk(null);
    };
    const inp=(k,ph)=>E("input",{value:u[k],onChange:m=>D({...u,[k]:m.target.value}),placeholder:ph,className:"px-3 py-2 rounded-xl border text-sm w-full",style:N});
    const card=l=>E(JCard,{key:l.id,theme:a,className:"space-y-1.5"},
      E("div",{className:"flex items-start gap-2"},
        E("div",{className:"flex-1 min-w-0"},
          E("div",{className:"flex flex-wrap items-baseline gap-2"},
            E("span",{className:"text-2xl font-extrabold"},front(l)),
            l.reading&&E("span",{className:"text-sm opacity-70"},l.reading),
            l.sino_viet&&E("span",{style:{backgroundColor:a.accentSoft},className:"text-[11px] font-bold px-2 py-0.5 rounded-full"},l.sino_viet)),
          E("div",{className:"text-sm font-bold mt-0.5"},l.meaning)),
        E("button",{title:"Phát âm",onClick:()=>speak(front(l),langOfWord(l,nbs)),className:"tap-fx text-xs font-bold px-2 py-1 rounded-lg",style:{backgroundColor:a.accentSoft}},"Nghe"),
        E("button",{title:"Yêu thích",onClick:()=>o.updateVocab(l.id,{favorite:!l.favorite}),className:"text-lg"},l.favorite?"★":"☆")),
      l.example_jp&&E("p",{className:"text-xs opacity-80"},"例: ",l.example_jp,l.example_vi?E("span",{className:"opacity-70"}," — ",l.example_vi):null),
      E("div",{className:"flex flex-wrap items-center gap-2 pt-1"},
        l.word_type&&E("span",{className:"text-[11px] opacity-70"},l.word_type),
        l.topic&&E("span",{className:"text-[11px] opacity-70"},"#",l.topic),
        classBadge(classOf(vs,l,o.srs),vs[l.id]),
        E("select",{value:l.status,onChange:p=>o.updateVocab(l.id,{status:p.target.value}),className:"ml-auto px-2 py-1 rounded-lg border text-[11px] font-bold",style:N},Object.entries(STATUS_LABEL).map(([p,h])=>E("option",{key:p,value:p},h))),
        E("button",{onClick:()=>{setR(l.id);setDupAlert(null);D({word:l.word||"",kanji:l.kanji||"",reading:l.reading||"",sino_viet:l.sino_viet||"",meaning:l.meaning||"",word_type:l.word_type||"",topic:l.topic||"",example_jp:l.example_jp||"",example_vi:l.example_vi||"",nb:nbOf(l)||firstNb});window.scrollTo({top:0,behavior:"smooth"})},className:"text-xs font-bold px-2 py-1 rounded-lg",style:{backgroundColor:a.accentSoft}},"Sửa"),
        E("button",{onClick:()=>{confirm('Xóa từ "'+front(l)+'" khỏi toàn bộ hệ thống?')&&o.deleteVocab(l.id)},className:"text-xs font-bold text-rose-500 px-2 py-1 rounded-lg hover:bg-rose-50"},"Xóa")));

    return E("div",{className:"space-y-4"},
      E("div",{className:"flex flex-wrap items-center gap-2"},
        E("div",{className:"mr-auto"},
          E("h2",{className:"text-xl font-extrabold"},"Kho Từ Vựng Thống Nhất ",E("span",{className:"text-sm opacity-60"},"(",o.vocab.length,")")),
          E("p",{className:"text-xs opacity-70"},"Liên kết tự động với Bảng từ vựng trong Notebooks, Học bài (Meown) & View của từng sổ.")),
        E("button",{onClick:()=>{setR(null);setDupAlert(null);D({...EMPTY_V,nb:firstNb})},style:{backgroundColor:a.accent},className:"tap-fx px-4 py-2 rounded-xl text-white text-xs font-bold"},"+ Thêm từ"),
        E("button",{onClick:()=>setBulk(""),style:{backgroundColor:a.accentSoft},className:"tap-fx px-4 py-2 rounded-xl text-xs font-bold"},"Nhập hàng loạt")),
      E("div",{className:"flex flex-wrap gap-2 items-center"},
        E("input",{value:c,onChange:l=>setC(l.target.value),placeholder:"Tìm từ, cách đọc, Hán Việt, nghĩa…",className:"flex-1 min-w-[200px] px-3 py-2 rounded-xl border text-sm",style:N}),
        ["all","new","learning","review","mastered"].map(l=>E("button",{key:l,onClick:()=>setSt(l),style:{backgroundColor:st===l?a.accent:a.accentSoft,color:st===l?"#fff":a.text},className:"tap-fx px-3 py-1.5 rounded-full text-xs font-bold"},l==="all"?"Tất cả":STATUS_LABEL[l]," ",l==="all"?"":counts[l]||0)),
        [["all","Mọi mức"],["tough","Hay sai"],["learn","Chưa thuộc"],["known","Đã thuộc"]].map(([k,l])=>E("button",{key:"cl"+k,onClick:()=>setCl(k),style:{backgroundColor:cl===k?(CL_BG[k]||a.accent):a.accentSoft,color:cl===k&&!CL_BG[k]?"#fff":"#4A3F5C",outline:cl===k?"2px solid "+a.accent:"none"},className:"tap-fx px-3 py-1.5 rounded-full text-xs font-bold"},l)),
        E("button",{onClick:()=>setFav(!fav),style:{backgroundColor:fav?"#FFE08A":a.accentSoft,color:fav?"#5E503F":a.text},className:"tap-fx px-3 py-1.5 rounded-full text-xs font-bold"},"★ Yêu thích")),
      u&&E(JCard,{theme:a},E("form",{onSubmit:submit,className:"space-y-3"},
        liveDup&&E("div",{className:"p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between gap-2"},
          E("span",null,`⚠️ Cảnh báo trùng lặp: Từ "${front(liveDup)}" (${liveDup.meaning}) đã có trong "${nbTitleById(nbOf(liveDup))}"!`),
          E("button",{type:"button",onClick:()=>{setR(liveDup.id);D({word:liveDup.word||"",kanji:liveDup.kanji||"",reading:liveDup.reading||"",sino_viet:liveDup.sino_viet||"",meaning:liveDup.meaning||"",word_type:liveDup.word_type||"",topic:liveDup.topic||"",example_jp:liveDup.example_jp||"",example_vi:liveDup.example_vi||"",nb:nbOf(liveDup)||firstNb})},className:"px-2.5 py-1 rounded-lg bg-amber-200 text-amber-950 shrink-0"},"Chỉnh sửa từ cũ")),
        dupAlert&&E("div",{className:"p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold space-y-2"},
          E("p",null,`⚠️ Từ "${dupAlert.word}" đã tồn tại trong sổ "${dupAlert.nbName}" với nghĩa: "${dupAlert.meaning}". Bạn có chắc muốn thêm bản trùng không?`),
          E("div",{className:"flex gap-2"},
            E("button",{type:"button",onClick:()=>submit(null,!0),className:"px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold"},"Vẫn thêm mới"),
            E("button",{type:"button",onClick:()=>setDupAlert(null),className:"px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold"},"Hủy bỏ"))),
        E("div",{className:"flex flex-wrap items-center gap-2 text-xs font-bold"},E("span",null,"Liên kết với sổ:"),
          E("select",{value:u.nb||"",onChange:m=>D({...u,nb:m.target.value}),className:"px-3 py-2 rounded-xl border text-sm",style:N},nbs.map(n=>E("option",{key:n.id,value:n.id},cleanT(n.title))),E("option",{value:""},"Chưa phân sổ"))),
        E("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-2"},inp("word","Từ (ひらがな/カタカナ) *"),inp("kanji","Kanji (nếu có)"),inp("reading","Cách đọc (ふりがな)")),
         sugg.length>0&&E("div",{className:"grid gap-1 p-2 rounded-xl border",style:{borderColor:a.border,backgroundColor:a.accentSoft}},E("p",{className:"text-[11px] font-extrabold opacity-70"},"Từ đã có trong kho (bấm để điền):"),sugg.map((x,k)=>E("button",{key:k,type:"button",onClick:()=>D({...u,word:x.word||u.word,kanji:x.kanji||u.kanji,reading:x.reading||u.reading||"",meaning:x.meaning||u.meaning,word_type:x.word_type||u.word_type,sino_viet:x.sino_viet||u.sino_viet}),className:"text-left text-sm rounded-lg px-2 py-1",style:{backgroundColor:a.card,color:a.text}},E("b",null,x.word),"  ",E("span",{className:"opacity-70 text-xs"},x.reading||""),"  ",E("span",{className:"text-xs"},x.meaning||""),(x.word_type?E("span",{className:"text-[10px] opacity-60"}," · "+x.word_type):null)))),
        E("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-2"},inp("sino_viet","Âm Hán Việt"),inp("meaning","Nghĩa tiếng Việt *"),inp("topic","Chủ đề")),
        E("select",{value:u.word_type,onChange:l=>D({...u,word_type:l.target.value}),className:"px-3 py-2 rounded-xl border text-sm",style:N},E("option",{value:""},"Loại từ…"),WORD_TYPES.map(l=>E("option",{key:l,value:l},l))),
        inp("example_jp","Câu ví dụ (tiếng Nhật)"),inp("example_vi","Dịch câu ví dụ"),
        E("div",{className:"flex gap-2"},
          E("button",{type:"submit",style:{backgroundColor:a.accent},className:"px-5 py-2 rounded-xl text-white text-xs font-bold"},R?"Lưu thay đổi":"Thêm từ"),
          E("button",{type:"button",onClick:()=>{D(null);setR(null);setDupAlert(null)},style:{backgroundColor:a.accentSoft},className:"px-4 py-2 rounded-xl text-xs font-bold"},"Hủy")))),
      bulk!==null&&E(JCard,{theme:a,className:"space-y-3"},
        E("p",{className:"text-xs opacity-75"},"Mỗi dòng: ",E("code",null,"Từ - Cách đọc - Nghĩa - Ví dụ")," (Hệ thống tự động cảnh báo & lọc từ đã tồn tại)"),
        E("div",{className:"flex flex-wrap items-center gap-2 text-xs font-bold"},E("span",null,"Thêm vào sổ:"),
          E("select",{value:bulkNb||firstNb,onChange:l=>setBulkNb(l.target.value),className:"px-3 py-2 rounded-xl border text-sm",style:N},nbs.map(n=>E("option",{key:n.id,value:n.id},cleanT(n.title))),E("option",{value:""},"Chưa phân sổ"))),
        E("textarea",{rows:5,value:bulk,onChange:l=>setBulk(l.target.value),placeholder:"維持 - いじ - Duy trì - 健康を維持する。",className:"w-full p-3 rounded-2xl border text-sm",style:N}),
        E("div",{className:"flex gap-2"},
          E("button",{onClick:()=>importBulk(false),style:{backgroundColor:a.accent},className:"px-5 py-2 rounded-xl text-white text-xs font-bold"},"Thêm từ mới (bỏ qua trùng)"),
          E("button",{onClick:()=>setBulk(null),style:{backgroundColor:a.accentSoft},className:"px-4 py-2 rounded-xl text-xs font-bold"},"Đóng"))),
      groups.map(g=>{
        const items=P.filter(v=>inG(v,g));
        const total=o.vocab.filter(v=>inG(v,g)).length;
        if(g.id==="_"&&!total)return null;
        if(filtering&&!items.length)return null;
        const k=g.id,isOpen=filtering?true:!!open[k],shown=lim[k]||40;
        return E("div",{key:k,className:"space-y-3"},
          E("button",{onClick:()=>setOpen({...open,[k]:!open[k]}),className:"tap-fx w-full flex items-center gap-3 px-5 py-4 rounded-3xl border text-left",style:{backgroundColor:g.color||a.accentSoft,borderColor:a.border,color:"#4A3F5C"}},
            E("span",{className:"flex-1 font-extrabold text-base truncate"},cleanT(g.title)),
            E("span",{className:"text-xs font-bold opacity-70"},filtering?items.length+"/"+total:total," từ"),
            E("span",{className:"text-xs font-extrabold px-2.5 py-1 rounded-full bg-white/70"},isOpen?"Thu gọn":"Mở ra")),
          isOpen&&E("div",{className:"space-y-3 fade-in"},
            g.id!=="_"&&E("button",{onClick:()=>{setR(null);setDupAlert(null);D({...EMPTY_V,nb:g.id});window.scrollTo({top:0,behavior:"smooth"})},style:{backgroundColor:a.accentSoft},className:"tap-fx px-3 py-1.5 rounded-xl text-xs font-bold"},"+ Thêm từ vào sổ này"),
            items.length?E("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-3"},items.slice(0,shown).map(card)):E("p",{className:"text-xs opacity-70 px-2"},"Sổ này chưa có từ vựng nào."),
            items.length>shown&&E("button",{onClick:()=>setLim({...lim,[k]:shown+40}),style:{backgroundColor:a.accentSoft},className:"w-full py-2.5 rounded-xl text-xs font-bold"},"Xem thêm (",items.length-shown,")")));
      }),
      !o.vocab.length&&E(JCard,{theme:a,className:"text-center py-10"},E("p",{className:"font-bold text-sm"},"Chưa có từ vựng nào. Hãy thêm từ mới tại đây hoặc trong bất kỳ cuốn sổ Notebook nào!")));
  };
}
