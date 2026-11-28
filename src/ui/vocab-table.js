// Bảng từ vựng Chinese (có tick thêm vào kho), chuyển từ public/legacy/index.html (tách giao diện bước 10).
// Không phụ thuộc biến nào của app cũ: chỉ dùng React và window.meobooksServices.
import React from 'react';

export function VocabTable({rows,lessonId,theme:a,khoAdd,khoRemove,notebooks}){
  const E=React.createElement;
  const key="rm_kho_"+lessonId;
  const readMap=()=>{try{const v=JSON.parse(window.meobooksServices.localStore.getRaw(key,"{}"));return v&&typeof v==="object"&&!Array.isArray(v)?v:{}}catch(e){return{}}};
  const[map,setMap]=React.useState(readMap);
  const[pending,setPending]=React.useState(null);
  const[nbId,setNbId]=React.useState(()=>{const l=notebooks||[];const c=l.find(n=>n.subject==="Chinese")||l[0];return c?c.id:""});
  const[busy,setBusy]=React.useState(false);
  const[msg,setMsg]=React.useState("");
  const write=m=>{setMap(m);try{window.meobooksServices.localStore.setRaw(key,JSON.stringify(m))}catch(e){}};
  const confirmAdd=async()=>{
    if(!pending||!nbId||!khoAdd)return;
    const row=rows.find(r=>r.stt===pending);
    setBusy(true);
    const id=await khoAdd(row,nbId);
    setBusy(false);
    if(!id){setMsg("Chưa thêm được \""+row.word+"\", thử lại sau."); return}
    write({...map,[pending]:id});
    setPending(null);
    setMsg("Đã thêm \""+row.word+"\" vào kho.");
  };
  const onTick=async(stt)=>{
    if(map[stt]){
      if(!khoRemove)return;
      setBusy(true);
      try{await khoRemove(map[stt])}catch(e){}
      const m={...map}; delete m[stt];
      write(m); setBusy(false); setMsg("Đã xóa khỏi kho.");
      return;
    }
    setPending(stt); setMsg("");
  };
  const th="p-2 border-b text-left font-extrabold whitespace-nowrap";
  const pendingRow=pending&&rows.find(r=>r.stt===pending);
  const nbList=notebooks||[];
  return E("div",{className:"space-y-2"},
    pendingRow&&E("div",{className:"flex flex-wrap items-center gap-2 p-3 rounded-2xl border",style:{borderColor:a.border,backgroundColor:a.accentSoft}},
      E("span",{className:"text-xs font-bold"},"Thêm \""+pendingRow.word+"\" vào sổ:"),
      nbList.length?E("select",{value:nbId,onChange:e=>setNbId(e.target.value),className:"text-xs rounded-lg px-2 py-1 border",style:{backgroundColor:a.card,color:a.text,borderColor:a.border}},nbList.map(n=>E("option",{key:n.id,value:n.id},n.title))):E("span",{className:"text-xs"},"Chưa có sổ nào. Hãy tạo sổ trước."),
      E("button",{onClick:confirmAdd,disabled:busy||!nbList.length,className:"tap-fx px-3 py-1 rounded-lg text-xs font-extrabold disabled:opacity-40",style:{backgroundColor:a.accent,color:"#fff"}},busy?"Đang lưu…":"Thêm"),
      E("button",{onClick:()=>setPending(null),className:"tap-fx px-3 py-1 rounded-lg text-xs font-extrabold",style:{backgroundColor:a.card,color:a.text}},"Hủy")),
    msg&&E("p",{className:"text-xs font-bold opacity-80"},msg),
    E("div",{className:"overflow-x-auto rounded-2xl border",style:{borderColor:a.border,backgroundColor:a.card}},
      E("table",{className:"w-full text-xs border-collapse"},
        E("thead",null,E("tr",{style:{backgroundColor:a.accentSoft}},["STT","Từ vựng","Pinyin","Nghĩa","Câu ví dụ","Pinyin ví dụ","Dịch nghĩa","Kho từ"].map(h=>E("th",{key:h,className:th},h)))),
        E("tbody",null,rows.map(r=>E("tr",{key:r.stt,className:"border-b"},
          E("td",{className:"p-2 font-bold"},r.stt),
          E("td",{className:"p-2 text-base font-bold whitespace-nowrap"},r.word),
          E("td",{className:"p-2 whitespace-nowrap"},r.pinyin),
          E("td",{className:"p-2"},r.meaning),
          E("td",{className:"p-2"},r.example),
          E("td",{className:"p-2 whitespace-nowrap"},r.examplePinyin),
          E("td",{className:"p-2"},r.exampleMeaning),
          E("td",{className:"p-2 text-center"},E("input",{type:"checkbox",checked:!!map[r.stt],disabled:busy,onChange:()=>onTick(r.stt)})))))))
  );
}
