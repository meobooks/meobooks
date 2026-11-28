// Trang sổ tay ở dạng đọc (giấy, bảng từ, ngữ pháp, kanji, nét vẽ), chuyển từ public/legacy/index.html (tách giao diện bước 13).
// PAPER_STYLES, normCols, GRAMMAR_FIELDS, G_PALETTES, InkView và meoFeat vẫn nằm trong app cũ nên được truyền vào (dependency injection).
import React from 'react';

export function makePageRead({ PAPER_STYLES, normCols, GRAMMAR_FIELDS, G_PALETTES, InkView, meoFeat }) {
  return function PageRead({page:p,defFont,onSyncVocab,compact}){
    const E=React.createElement;
    const paper=PAPER_STYLES.find(x=>x.id===p.paperStyle)||PAPER_STYLES[1];
    const cols=normCols(p.customColumns);
    const rows=p.vocabRows||[];
    const gl=meoFeat.reader.grammarListOf(p);
    const kd=p.type==="kanji"?p.kanjiData:null;
    const extra=meoFeat.reader.extraEntriesOf(p);
    const hasInk=meoFeat.reader.hasInkStrokes(p);
    const hasHtml=p.content&&p.content.replace(/<[^>]*>/g,"").trim().length>0||/<img/.test(p.content||"");
    const empty=!hasHtml&&!hasInk&&!rows.length&&!gl.length&&!kd&&!extra.length;
    const KF=[["reading","Âm đọc"],["hanViet","Âm Hán Việt"],["meaning","Nghĩa"],["radical","Bộ thủ"],["strokes","Số nét"],["compounds","Từ ghép"],["example","Ví dụ"],["notes","Ghi chú"]];
    return E("div",{style:{backgroundColor:paper.bg,backgroundImage:paper.pattern,backgroundSize:paper.id==="grid"?"24px 24px":paper.id==="dots"?"20px 20px":"auto",fontFamily:p.fontFamily||defFont,fontSize:(p.fontSize||16)+"px",color:"#3D3545",minHeight:compact?"100%":420},className:(compact?"":"rounded-3xl border-2 border-[#E8DDF8] shadow-xl ")+"relative p-6 md:p-10"},
      (p.stickers||[]).map(t=>E("div",{key:t.id,style:{left:t.x+"%",top:t.y+"%"},className:"absolute text-3xl select-none z-10 pointer-events-none"},t.emoji)),
      E("div",{className:"flex items-center gap-2 mb-2"},E("span",{className:"text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#FCECF3] text-[#5A4E63]"},p.type)),
      E("h2",{className:"text-2xl font-extrabold border-b-2 border-dashed border-[#E8DDF8] pb-3 mb-5"},p.title||"Không có tiêu đề"),
      rows.length>0&&E("div",{className:"overflow-x-auto rounded-2xl border border-[#E8DDF8] bg-white/90 mb-6"},E("table",{className:"w-full text-xs text-left border-collapse"},
        E("thead",null,E("tr",{className:"bg-[#FCECF3] font-extrabold"},cols.map(c=>E("th",{key:c.id,className:"p-2 border-b"},c.label)),onSyncVocab&&E("th",{className:"p-2 border-b w-20 text-center"},"Từ vựng"))),
        E("tbody",null,rows.map(r=>E("tr",{key:r.id,className:"border-b"},cols.map((c,i)=>E("td",{key:c.id,className:"p-2 "+(i===0?"font-bold":"")},r[c.id]||"")),onSyncVocab&&E("td",{className:"p-2 text-center"},E("button",{onClick:()=>onSyncVocab([r]),className:"tap-fx text-[11px] font-bold px-2 py-1 rounded-lg bg-[#FFF0C9] text-[#5E503F]"},"+ Kho từ"))))))),
      gl.map((g,i)=>{
        const pal=G_PALETTES[(g.color!=null?g.color:i%2)%G_PALETTES.length];
        const fs=GRAMMAR_FIELDS.filter(f=>g[f.key]&&f.key!=="structure");
        if(!g.structure&&!fs.length)return null;
        return E("div",{key:g.id||i,className:"rounded-2xl border-2 overflow-hidden mb-4",style:{backgroundColor:pal.bg,borderColor:pal.border,color:"#3b3340"}},
          E("div",{className:"px-4 py-2 font-extrabold",style:{backgroundColor:pal.head}},"#"+(i+1)+" "+(g.structure||"")),
          E("div",{className:"p-3 grid gap-2 "+(compact?"":"md:grid-cols-2")},fs.map(f=>E("div",{key:f.key,className:"p-2 rounded-xl bg-white/80"},E("div",{className:"text-[11px] font-extrabold",style:{color:pal.accent}},f.label),E("div",{className:"text-sm whitespace-pre-line"},g[f.key])))));
      }),
      kd&&E("div",{className:"mb-6 flex flex-wrap gap-5 items-start"},
        E("div",{className:"text-7xl font-bold px-6 py-4 rounded-3xl bg-[#FCFaff] border-2 border-dashed border-[#D5C3F2]"},kd.character),
        E("div",{className:"flex-1 min-w-[200px] grid gap-2"},KF.filter(([k])=>kd[k]).map(([k,l])=>E("div",{key:k,className:"p-2 rounded-xl bg-[#F8F4FA]"},E("div",{className:"text-[11px] font-extrabold text-[#82758A]"},l),E("div",{className:"text-sm font-semibold"},kd[k]))))),
      extra.length>0&&E("div",{className:"mb-6 space-y-2"},extra.map(([k,v])=>E("div",{key:k,className:"p-3 rounded-2xl bg-white/80 border border-[#F3C6D8]"},E("div",{className:"text-[11px] font-extrabold uppercase text-[#E88BAE]"},k),E("div",{className:"text-sm whitespace-pre-line"},v)))),
      hasHtml&&E("div",{className:"leading-relaxed",dangerouslySetInnerHTML:{__html:p.content}}),
      hasInk?E(InkView,{ink:p.ink}):null,
      empty&&E("p",{className:"opacity-60 italic text-sm"},"Trang này chưa có nội dung. Bấm Sửa để ghi chép."));
  };
}
