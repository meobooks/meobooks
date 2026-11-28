// Màn Trò chơi (Bắn Từ, Nối Từ), chuyển từ public/legacy/index.html (tách giao diện bước 12).
// BanTu, NoiTu và MochiMascot vẫn nằm trong app cũ nên được truyền vào (dependency injection).
import React, { useState } from 'react';

export function makeGamesHub({ BanTu, NoiTu, MochiMascot }) {
  return function GamesHub({jl,theme:a,notebooks=[],nbViews={},stats={},onXp,toast}){
    const E=React.createElement,[game,setGame]=useState(null);
    if(game==="bantu")return E("div",{className:"space-y-4"},
      E("button",{onClick:()=>setGame(null),className:"tap-fx",style:{backgroundColor:a.accentSoft,color:a.text,borderRadius:12,padding:"6px 14px",fontSize:12,fontWeight:800}},"← Trò chơi"),
      E(BanTu,{jl,theme:a,notebooks,nbViews,stats,onXp,toast}));
    if(game==="noitu")return E("div",{className:"space-y-4"},
      E("button",{onClick:()=>setGame(null),className:"tap-fx",style:{backgroundColor:a.accentSoft,color:a.text,borderRadius:12,padding:"6px 14px",fontSize:12,fontWeight:800}},"← Trò chơi"),
      E(NoiTu,{jl,theme:a,notebooks,nbViews,stats,onXp,toast}));
    const preview=E("svg",{viewBox:"0 0 220 110",width:"100%",height:110,style:{display:"block"}},
      [[12,10,"食べる","たべる"],[78,34,"学校","がっこう"],[146,6,"水","みず"]].map((w,i)=>E("g",{key:i},
        E("rect",{x:w[0],y:w[1],width:62,height:40,rx:12,fill:a.card,stroke:a.border,strokeWidth:2}),
        E("text",{x:w[0]+31,y:w[1]+19,textAnchor:"middle",fontSize:14,fontWeight:800,fill:a.text},w[2]),
        E("text",{x:w[0]+31,y:w[1]+33,textAnchor:"middle",fontSize:8,fill:a.text,opacity:.8},w[3]))),
      E("path",{d:"M110 86 L124 112 L110 106 L96 112Z",fill:a.accent,stroke:"#5A4E63",strokeWidth:2,strokeLinejoin:"round"}));
    return E("div",{className:"space-y-5",style:{color:a.text}},
      E("div",null,E("h2",{style:{fontSize:24,fontWeight:800}},"Trò chơi"),E("p",{style:{fontSize:13,opacity:.75,marginTop:4}},"Vừa chơi vừa ôn từ vựng trong kho từ của bạn.")),
      E("div",{className:"bt-grid3"},
        E("button",{onClick:()=>setGame("bantu"),className:"tap-fx",style:{backgroundColor:a.card,border:"1px solid "+a.border,borderRadius:22,padding:16,textAlign:"left",color:a.text}},
          E("div",{style:{backgroundColor:a.accentSoft,borderRadius:16,padding:"10px 8px",marginBottom:12}},preview),
          E("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}},
            E("h3",{style:{fontSize:17,fontWeight:800}},"Bắn Từ"),
            E("span",{style:{fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:99,background:"#eef3ff",color:"#3a5bd0",border:"1px solid #9db4f5"}},"GÕ PHÍM")),
          E("p",{style:{fontSize:12,lineHeight:1.55,opacity:.8,marginTop:6}},"Gõ romaji để bắn hạ các từ tiếng Nhật đang rơi trước khi chạm phi thuyền."),
          E("div",{style:{marginTop:12,display:"inline-block",backgroundColor:a.accent,color:"#fff",borderRadius:12,padding:"6px 16px",fontSize:12,fontWeight:800}},"Chơi ngay")),
        E("button",{onClick:()=>setGame("noitu"),className:"tap-fx",style:{backgroundColor:a.card,border:"1px solid "+a.border,borderRadius:22,padding:16,textAlign:"left",color:a.text}},
          E("div",{style:{backgroundColor:a.accentSoft,borderRadius:16,padding:"10px 8px",marginBottom:12,display:"flex",justifyContent:"center"}},
            E(MochiMascot,{mood:"happy",accessory:"bow",size:96})),
          E("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}},
            E("h3",{style:{fontSize:17,fontWeight:800}},"Nối Từ"),
            E("span",{style:{fontSize:10,fontWeight:800,padding:"3px 10px",borderRadius:99,background:a.accentSoft,color:a.text,border:"1px solid "+a.border}},"NỐI CẶP")),
          E("p",{style:{fontSize:12,lineHeight:1.55,opacity:.8,marginTop:6}},"Nối từ tiếng Nhật với nghĩa tiếng Việt từ sổ hoặc view bạn chọn (10–50 từ mỗi lần)."),
          E("div",{style:{marginTop:12,display:"inline-block",backgroundColor:a.accent,color:"#fff",borderRadius:12,padding:"6px 16px",fontSize:12,fontWeight:800}},"Chơi ngay")),
        E("div",{style:{border:"2px dashed "+a.border,borderRadius:22,padding:16,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",fontSize:12,fontWeight:700,opacity:.6,minHeight:160}},"Sắp có thêm trò chơi mới…")));
  };
}
