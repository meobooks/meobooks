// Màn chọn môn học, chuyển từ public/legacy/index.html (tách giao diện bước 9).
// lvlInfo và SUBJECT_COLORS vẫn nằm trong app cũ nên được truyền vào (dependency injection).
import React, { useState } from 'react';

export function makeSubjectPicker({ lvlInfo, SUBJECT_COLORS }) {
  return function SubjectPicker({subjects,notebooks,profile,theme:n,onPick,onSave,onLogout,onHonor}){
    const C=React.createElement;
    const[form,setForm]=useState(null);
    const[err,setErr]=useState("");
    const cnt=id=>notebooks.filter(x=>x.subject===id).length;
    const submit=e=>{
      e.preventDefault();
      const label=form.label.trim();
      if(!label){setErr("Vui lòng nhập tên môn học.");return}
      if(form.id){onSave(subjects.map(x=>x.id===form.id?{...x,label,icon:form.icon||x.icon,color:form.color}:x))}
      else{onSave([...subjects,{id:"s-"+Date.now(),label,icon:form.icon||"📘",color:form.color}])}
      setForm(null);setErr("");
    };
    const del=x=>{
      if(subjects.length<=1){setErr("Cần giữ lại ít nhất một môn học.");return}
      const k=cnt(x.id);
      if(k>0){setErr(`Môn "${x.label}" còn ${k} sổ tay. Hãy xóa sổ tay trước khi xóa môn.`);return}
      if(!window.confirm(`Xóa môn "${x.label}"?`))return;
      setErr("");onSave(subjects.filter(y=>y.id!==x.id));
    };
    const card=x=>C("div",{key:x.id,role:"button",onClick:()=>onPick(x.id),style:{backgroundColor:n.card,borderColor:n.border},className:"rounded-3xl border-2 overflow-hidden cursor-pointer transition hover:scale-[1.01] shadow-sm"},
      C("div",{style:{backgroundColor:x.color},className:"h-24 flex items-center justify-center text-5xl"},x.icon),
      C("div",{className:"p-4 flex items-center justify-between gap-2"},
        C("div",null,C("h3",{className:"font-extrabold text-base"},x.label),C("p",{className:"text-xs opacity-70 mt-0.5"},cnt(x.id)+" sổ tay")),
        C("div",{className:"flex gap-1.5"},
          C("button",{onClick:e=>{e.stopPropagation();setErr("");setForm({...x})},className:"px-2 py-1 rounded-lg text-xs font-bold bg-white/80 text-[#5A4E63]"},"Sửa"),
          C("button",{onClick:e=>{e.stopPropagation();del(x)},className:"px-2 py-1 rounded-lg text-xs font-bold bg-white/80 text-rose-500"},"Xóa"))));
    return C("div",{className:"min-h-screen p-4 md:p-8 flex items-start justify-center",style:{backgroundColor:n.bg,color:n.text}},
      C("div",{className:"w-full max-w-4xl space-y-6"},
        C("div",{className:"flex items-center justify-between flex-wrap gap-3"},
          C("div",null,C("h1",{className:"text-2xl font-extrabold"},"Chọn môn học 🌸"),C("p",{className:"text-sm opacity-70 mt-1"},"Mỗi môn có sổ tay và dữ liệu riêng.")),
          C("div",{className:"flex gap-2"},
            C("button",{onClick:onHonor,className:"px-3 py-1.5 rounded-xl text-xs font-bold border-2",style:{borderColor:n.border,backgroundColor:n.card}},"🏅 Honor"),
            C("button",{onClick:onLogout,className:"px-3 py-1.5 rounded-xl text-xs font-bold border-2",style:{borderColor:n.border}},"Đăng xuất"))),
        C("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"p-4 rounded-3xl border-2 flex flex-wrap items-center gap-4"},
          C("div",{className:"font-extrabold"},"Cấp "+lvlInfo(profile.exp||0).level),
          C("div",{className:"flex-1 min-w-[160px] h-2.5 rounded-full bg-black/10 overflow-hidden"},C("div",{style:{width:Math.min(100,Math.round(100*lvlInfo(profile.exp||0).into/Math.max(1,lvlInfo(profile.exp||0).need)))+"%",backgroundColor:n.accent},className:"h-full rounded-full"})),
          C("div",{className:"text-xs font-bold opacity-80"},lvlInfo(profile.exp||0).into+"/"+lvlInfo(profile.exp||0).need+" EXP"),
          C("div",{className:"text-xs font-bold opacity-80"},(profile.gold||0)+" vàng")),
        err&&C("div",{className:"p-3 rounded-2xl text-sm font-bold bg-rose-50 text-rose-600"},err),
        C("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"},
          subjects.map(card),
          C("button",{onClick:()=>{setErr("");setForm({id:null,label:"",icon:"📘",color:SUBJECT_COLORS[subjects.length%SUBJECT_COLORS.length]})},style:{borderColor:n.accent,color:n.accent},className:"rounded-3xl border-2 border-dashed min-h-[200px] flex flex-col items-center justify-center gap-2 font-extrabold"},C("span",{className:"text-4xl"},"+"),"Thêm môn học")),
        form&&C("div",{className:"fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"},
          C("form",{onSubmit:submit,style:{backgroundColor:n.card,borderColor:n.border},className:"max-w-md w-full p-6 rounded-3xl border-2 shadow-2xl space-y-4"},
            C("div",{className:"flex justify-between"},C("h3",{className:"text-lg font-extrabold"},form.id?"Sửa môn học":"Thêm môn học"),C("button",{type:"button",onClick:()=>setForm(null)},"✕")),
            C("input",{autoFocus:true,required:true,maxLength:30,placeholder:"Tên môn học (VD: Toán)",value:form.label,onChange:e=>setForm({...form,label:e.target.value}),className:"w-full px-3.5 py-2 rounded-xl border text-sm",style:{borderColor:n.border}}),
            C("input",{maxLength:4,placeholder:"Biểu tượng (emoji)",value:form.icon,onChange:e=>setForm({...form,icon:e.target.value}),className:"w-full px-3.5 py-2 rounded-xl border text-sm",style:{borderColor:n.border}}),
            C("div",{className:"flex gap-2"},SUBJECT_COLORS.map(c=>C("button",{key:c,type:"button",onClick:()=>setForm({...form,color:c}),style:{backgroundColor:c},className:`w-8 h-8 rounded-full border-2 ${form.color===c?"border-[#5A4E63]":"border-transparent"}`}))),
            C("button",{type:"submit",style:{backgroundColor:n.accent},className:"w-full py-2.5 rounded-xl text-white text-sm font-bold"},form.id?"Lưu":"Thêm môn")))));
  };
}
