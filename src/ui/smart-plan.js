// Lịch học thông minh (ôn, học mới, lịch 7 ngày), chuyển từ public/legacy/index.html (tách giao diện bước 15).
// JCard, planToday, DAYN và idxOf vẫn nằm trong app cũ nên được truyền vào (dependency injection).
import React from 'react';

export function makeSmartPlan({ JCard, planToday, DAYN, idxOf }) {
  return function SmartPlan({jl:o,theme:a,S,onChange,onGo}){
    const E=React.createElement;
    if(!o.ready)return null;
    const p=planToday(o,S),c=p.cfg;
    const banner=p.missed>0?"Bạn đã bỏ lỡ "+p.missed+" buổi học trong 7 ngày qua. Mochi đã tự điều chỉnh: ưu tiên "+p.overdue+" thẻ quá hạn"+(p.overdue>c.newPerDay*3?", giảm từ mới hôm nay còn "+p.newToday:"")+", phần từ mới bị trễ được dồn đều sang các ngày tới.":(p.due+p.hard+p.newToday>0?"Hôm nay: ôn "+p.due+" thẻ đến hạn, luyện "+p.hard+" từ hay sai, học "+p.newToday+" từ mới."+(p.activeToday?"":" (Hôm nay là ngày nghỉ theo lịch của bạn.)"):"Hôm nay không còn việc cần làm. Tuyệt vời!");
    const rows=[{t:"Ôn thẻ đến hạn",d:p.due+" thẻ"+(p.overdue?" ("+p.overdue+" quá hạn)":""),n:p.due,go:"jstudy",b:"Học bài ngay"},{t:"Luyện từ hay sai",d:p.hard+" từ",n:p.hard,go:"jstudy",b:"Học lại"},{t:"Học từ mới",d:p.newToday+" từ (còn "+p.fresh+" từ chưa học)",n:p.newToday,go:"jstudy",b:"Học bài"},{t:"Quản lý kho từ vựng",d:"Xem, thêm & đồng bộ từ vựng các sổ",n:1,go:"vocab",b:"Mở kho từ"}];
    const toggleNotify=()=>{if(c.notify)return onChange({notify:false});if(typeof Notification==="undefined")return alert("Trình duyệt này không hỗ trợ thông báo.");Notification.requestPermission().then(r=>onChange({notify:r==="granted"}))};
    const N={borderColor:a.border,backgroundColor:a.card,color:a.text};
    return E(JCard,{theme:a,className:"space-y-4 mb-6"},
      E("h2",{className:"text-xl font-extrabold"},"Lịch học thông minh"),
      E("div",{className:"p-3 rounded-2xl text-sm font-bold",style:{backgroundColor:p.missed>0?"#FFF0C9":a.accentSoft,color:"#4A3F5C"}},banner),
      E("div",{className:"space-y-2"},rows.map(r=>E("div",{key:r.t,className:"flex items-center gap-3 p-3 rounded-2xl",style:{backgroundColor:a.accentSoft,opacity:r.n?1:.6}},E("div",{className:"flex-1 min-w-0"},E("div",{className:"text-sm font-extrabold"},r.t),E("div",{className:"text-[11px] opacity-70"},r.d)),r.n?E("button",{onClick:()=>onGo(r.go),style:{backgroundColor:a.accent},className:"tap-fx px-3 py-1.5 rounded-xl text-white text-xs font-bold"},r.b):E("span",{className:"text-xs font-bold"},"Xong ✓")))),
      p.past.length>0&&E("div",{className:"flex flex-wrap items-center gap-2 text-xs font-bold"},E("span",{className:"opacity-70"},"3 ngày qua:"),p.past.slice().reverse().map(x=>E("span",{key:x.k,className:"px-2.5 py-1 rounded-full",style:{backgroundColor:!x.planned?a.accentSoft:x.did?"#D5F2E0":"#FBD5D5",color:"#4A3F5C"}},DAYN[idxOf(x.k)]+" "+(!x.planned?"nghỉ":x.did?"✓":"✗")))),
      E("div",{className:"overflow-x-auto"},E("div",{style:{display:"grid",gridTemplateColumns:"repeat(7,minmax(70px,1fr))",gap:6}},p.days.map((d,i)=>E("div",{key:d.k,className:"p-2 rounded-2xl text-center text-[11px] font-bold",style:{backgroundColor:d.active?a.accentSoft:"transparent",border:"1px dashed "+a.border,opacity:d.active?1:.55,outline:i===0?"2px solid "+a.accent:"none"}},E("div",{className:"text-xs font-extrabold"},i===0?"Hôm nay":d.label),d.active?E("div",{className:"space-y-0.5 pt-1"},E("div",null,"Ôn ",d.review),E("div",null,"Mới ",d.nw),d.hard>0&&E("div",null,"Sai ",d.hard),E("div",{className:"opacity-60"},"~",d.mins,"′")):E("div",{className:"pt-1"},"Nghỉ"))))),
      E("details",{className:"text-xs"},E("summary",{className:"cursor-pointer font-extrabold"},"Cài đặt lịch học"),
        E("div",{className:"space-y-3 pt-3"},
          E("div",{className:"flex flex-wrap items-center gap-2 font-bold"},E("span",null,"Từ mới mỗi ngày:"),E("select",{value:c.newPerDay,onChange:e=>onChange({newPerDay:+e.target.value}),className:"px-3 py-1.5 rounded-xl border",style:N},[5,10,15,20,30].map(n=>E("option",{key:n,value:n},n)))),
          E("div",{className:"flex flex-wrap items-center gap-1.5 font-bold"},E("span",null,"Ngày học:"),DAYN.map((d,i)=>E("button",{key:d,onClick:()=>onChange({days:c.days.map((x,j)=>j===i?(x?0:1):x)}),style:{backgroundColor:c.days[i]?a.accent:a.accentSoft,color:c.days[i]?"#fff":a.text},className:"tap-fx px-2.5 py-1 rounded-full"},d))),
          E("div",{className:"flex flex-wrap items-center gap-2 font-bold"},E("span",null,"Ngày mục tiêu (VD: ngày thi):"),E("input",{type:"date",value:c.goalDate||"",onChange:e=>onChange({goalDate:e.target.value}),className:"px-3 py-1.5 rounded-xl border",style:N}),p.suggest&&E("span",null,"→ nên học ~",p.suggest," từ mới/ngày ",E("button",{onClick:()=>onChange({newPerDay:Math.min(50,p.suggest)}),style:{backgroundColor:a.accentSoft},className:"tap-fx px-2 py-1 rounded-lg"},"Áp dụng"))),
          E("label",{className:"flex items-center gap-2 font-bold cursor-pointer"},E("input",{type:"checkbox",checked:!!c.notify,onChange:toggleNotify}),"Nhắc bằng thông báo trình duyệt khi mở app (chỉ hiện khi có thẻ đến hạn)"))));
  };
}
