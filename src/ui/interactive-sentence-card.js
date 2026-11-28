// Câu tiếng Nhật có thể bấm từng từ (furigana, nghĩa), chuyển từ public/legacy/index.html (tách giao diện bước 11).
// Không phụ thuộc biến nào của app cũ: chỉ dùng React.
import React, { useState } from 'react';

export function InteractiveSentenceCard({
  tokens=[],
  translation="",
  showJp=true,
  showVi=true,
  showFuri=true,
  selectedWord="",
  onSelectToken,
  onSpeakWord,
  isActive=false,
  theme={bg:"#FFFDF8",sidebar:"#F8DDE8",accent:"#E88BAE",accentSoft:"#FCECF3",card:"#FFFFFF",border:"#F3C6D8",text:"#5A4E63",dark:false}
}){
  const E=React.createElement;
  const[hoveredIdx,setHoveredIdx]=useState(-1);

  const boxBg=isActive?theme.sidebar:theme.accentSoft;
  const furiColor=theme.accent;

  const renderRubyToken=tk=>{
    const text=tk.text||"";
    const furi=tk.furigana||"";
    const rtStyle={
      fontSize:"0.58em",
      color:furiColor,
      fontWeight:800,
      letterSpacing:"0.02em"
    };
    if(!showFuri||!furi)return text;
    const m=text.match(/^([\u4E00-\u9FFF\u3005\u3006\u30F6]+)(.*)$/);
    if(m){
      const kanjiPart=m[1],okuri=m[2];
      let kanjiFuri=furi;
      if(okuri&&furi.endsWith(okuri)&&furi.length>okuri.length){
        kanjiFuri=furi.slice(0,furi.length-okuri.length);
      }
      return E(React.Fragment,null,
        E("ruby",{style:{rubyAlign:"center"}},kanjiPart,E("rt",{style:rtStyle},kanjiFuri)),
        okuri
      );
    }
    return E("ruby",{style:{rubyAlign:"center"}},text,E("rt",{style:rtStyle},furi));
  };

  return E("div",{style:{display:"grid",gap:6,width:"100%"}},
    showJp&&E("div",{
      style:{
        backgroundColor:boxBg,
        borderRadius:14,
        padding:"10px 14px",
        color:theme.text,
        display:"flex",
        flexWrap:"wrap",
        alignItems:"flex-end",
        gap:"5px 7px",
        lineHeight:2.1,
        boxShadow:isActive?`0 4px 14px ${theme.accent}33`:"0 1px 3px rgba(0,0,0,0.03)",
        border:`${isActive?"2px":"1.5px"} solid ${isActive?theme.accent:theme.border}`,
        transition:"background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease"
      }
    },tokens.map((tk,idx)=>{
      const interactive=tk.isWord!==false&&!/^[\s\u3000、。，．,.!?！？「」『』（）()…・~〜"'“”‘’]+$/.test(tk.text);
      const isSelected=interactive&&selectedWord&&selectedWord===tk.text;
      const isHovered=interactive&&hoveredIdx===idx;

      if(!interactive){
        return E("span",{key:idx,style:{color:theme.text,opacity:.7,fontSize:16,paddingBottom:2}},tk.text);
      }
      return E("span",{
        key:idx,
        role:"button",
        tabIndex:0,
        title:tk.meaning?`${tk.text}${tk.furigana?" ("+tk.furigana+")":""}: ${tk.meaning} — Bấm để chọn / lưu từ`:"Bấm để tra nghĩa, nghe phát âm hoặc lưu vào sổ",
        onMouseEnter:()=>setHoveredIdx(idx),
        onMouseLeave:()=>setHoveredIdx(-1),
        onClick:e=>{
          e.stopPropagation();
          onSpeakWord&&onSpeakWord(tk.text);
          onSelectToken&&onSelectToken(tk);
        },
        style:{
          display:"inline-flex",
          flexDirection:"column",
          alignItems:"center",
          justifyContent:"flex-end",
          padding:"1px 6px 2px",
          borderRadius:9,
          fontSize:17,
          fontWeight:800,
          color:theme.text,
          cursor:"pointer",
          userSelect:"none",
          transition:"background-color 0.14s ease, box-shadow 0.14s ease",
          borderBottom:`2px solid ${theme.accent}`,
          backgroundColor:(isSelected||isHovered)
            ?(theme.dark?"rgba(255,255,255,0.16)":"rgba(255,255,255,0.9)")
            :"transparent",
          boxShadow:isSelected?`0 0 0 1.5px ${theme.accent}`:"none"
        }
      },renderRubyToken(tk));
    })),
    showVi&&translation&&E("div",{
      style:{
        backgroundColor:isActive?theme.accentSoft:theme.card,
        border:`1.5px solid ${isActive?theme.accent:theme.border}`,
        borderRadius:12,
        padding:"8px 12px",
        color:theme.text,
        fontWeight:800,
        fontSize:14,
        lineHeight:1.5,
        transition:"background-color 0.2s ease, border-color 0.2s ease"
      }
    },translation)
  );
}
