// Trò chơi Bắn Từ (bắn bong bóng đúng nghĩa/cách đọc), chuyển từ public/legacy/index.html.
// JLoading, btOf, btProg, btIc, BT_ICONS, cleanT, nbOf, nbDeckPicker, classOf, front, shuffle vẫn nằm trong app cũ nên được truyền vào (dependency injection).
import React, { useState, useEffect, useRef, useMemo } from 'react';

export function makeBanTu({ JLoading, btOf, btProg, btIc, BT_ICONS, cleanT, nbOf, nbDeckPicker, classOf, front, shuffle }) {
  return function BanTu({jl,theme:a,notebooks:nbs=[],nbViews={},stats:vs={},onXp=()=>{},toast=()=>{}}){
  const E=React.createElement;
  const lsGet=(k,d)=>window.meobooksServices.localStore.getRaw(k,d);
  const lsSet=(k,v)=>window.meobooksServices.localStore.setRaw(k,v);
  const[screen,setScreen]=useState("intro"),[deckId,setDeckId]=useState(()=>lsGet("bt_deck","all")),[cnt,setCnt]=useState(()=>lsGet("bt_cnt","32")),[spdK,setSpdK]=useState(()=>lsGet("bt_spd","slow")),[sndOn,setSndOn]=useState(()=>lsGet("bt_snd","1")!=="0"),actx=useRef(null);
  const[kb,setKb]=useState(()=>{try{return matchMedia("(pointer:coarse)").matches}catch(x){return false}});
  const[res,setRes]=useState(null),[,tick]=useState(0),G=useRef(null),fieldRef=useRef(null);

  const all=useMemo(()=>jl.ready?jl.vocab.map(v=>({v,p:btOf(v)})).filter(x=>x.p):[],[jl.vocab,jl.ready]);

  /* ---------- logic game ---------- */
  const finish=(g,win)=>{
    const xp=g.cleared+(win?2:0);
    try{if(xp>0)onXp(xp)}catch(x){}
    let best=g.score;
    try{const LS=window.meobooksServices.localStore,o=LS.getBestScore("bt",g.deckId);best=Math.max(o,g.score);if(g.score>o)LS.setBestScore("bt",g.deckId,g.score)}catch(x){}
    setRes({hitList:g.hitList,win,score:g.score,hits:g.hits,wrong:g.wrong,maxCombo:g.maxCombo,cleared:g.cleared,waves:g.waves.length,missed:g.missed,best,xp});
    setScreen("result");
  };
  const step=(g,dt)=>{
    g.lasers=g.lasers.filter(l=>(l.t-=dt)>0);g.bursts=(g.bursts||[]).filter(b=>(b.t-=dt)>0);
    if(g.flash>0)g.flash-=dt;
    if(g.status==="pause"||g.status==="over")return;
    if(g.status==="break"){g.breakT-=dt;if(g.breakT<=0){g.wave++;g.queue=[...g.waves[g.wave]];g.spawnT=.4;g.status="play"}return}
    const mul=g.mul||1,spd=.03*mul*(1+.08*g.wave),cap=4+Math.min(g.wave,3),itv=Math.max(1.4,(3.4-.2*g.wave)/mul);
    g.words=g.words.filter(w=>!(w.dead&&(w.dead-=dt)<=0));
    g.spawnT-=dt;
    const live=g.words.filter(w=>!w.dead);
    if(g.queue.length&&g.spawnT<=0&&live.length<cap){
      const W=fieldRef.current?fieldRef.current.clientWidth:600,lanes=Math.max(2,Math.min(6,Math.floor(W/150)));
      const busy=new Set(live.filter(w=>w.y<.3).map(w=>w.lane)),free=[...Array(lanes).keys()].filter(i=>!busy.has(i));
      if(!free.length)g.spawnT=.25;
      else{const it=g.queue.shift(),lane=free[Math.floor(Math.random()*free.length)];g.words.push({id:++g.id,it,lane,x:(lane+.5)/lanes*100,y:-.08});g.spawnT=itv}
    }
    g.words.forEach(w=>{
      if(w.dead)return;
      w.y+=spd*dt;
      if(w.y>=.74){
        w.dead=.25;w.miss=true;g.lives--;g.combo=0;g.queue.push(w.it);g.shake=.3;
        if(!g.missed.find(m=>m.v.id===w.it.v.id))g.missed.push(w.it);
        if(g.locked===w.id){g.locked=null;g.typed=""}
      }
    });
    if(g.shake>0)g.shake-=dt;
    if(g.lives<=0){g.status="over";finish(g,false);return}
    if(!g.queue.length&&!g.words.some(w=>!w.dead)){
      g.cleared++;
      if(g.wave>=g.waves.length-1){g.status="over";finish(g,true)}
      else{g.status="break";g.breakT=1.8}
    }
  };
  /* Âm thanh nhỏ nhẹ (Web Audio, không cần file): phím gõ đúng / gõ sai / nổ bùm */
  const snd=kind=>{
    try{
      if(lsGet("bt_snd","1")==="0")return;
      let c=actx.current;
      if(!c){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;c=actx.current=new AC()}
      if(c.state==="suspended")c.resume();
      const t=c.currentTime;
      const tone=(f0,f1,d,type,v)=>{const o=c.createOscillator(),gn=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);gn.gain.setValueAtTime(v,t);gn.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(gn);gn.connect(c.destination);o.start(t);o.stop(t+d+.02)};
      if(kind==="key")tone(850+Math.random()*150,560,.05,"triangle",.04);
      else if(kind==="bad")tone(190,120,.1,"sine",.04);
      else if(kind==="boom"){
        tone(150,40,.35,"sine",.1);
        tone(700,220,.09,"triangle",.04);
        const len=Math.floor(c.sampleRate*.28),buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);
        for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2);
        const src=c.createBufferSource(),f=c.createBiquadFilter(),gn=c.createGain();
        src.buffer=buf;f.type="lowpass";f.frequency.value=1000;gn.gain.value=.07;
        src.connect(f);f.connect(gn);gn.connect(c.destination);src.start(t);
      }
    }catch(x){}
  };
  const press=c=>{
    const g=G.current;if(!g||g.status!=="play")return;
    if(c==="\b"){if(g.locked){g.typed=g.typed.slice(0,-1);if(!g.typed)g.locked=null}return}
    if(c==="\x1b"){g.locked=null;g.typed="";return}
    let w=g.words.find(x=>x.id===g.locked&&!x.dead);
    if(!w){
      g.locked=null;g.typed="";
      const c2=g.words.filter(x=>!x.dead&&x.it.p.vars.some(v=>v.s[0]===c)).sort((p,q)=>q.y-p.y)[0];
      if(!c2){g.wrong++;g.flash=.25;snd("bad");return}
      g.locked=c2.id;g.typed=c;w=c2;snd("key");
    }else{
      const nt=g.typed+c;
      if(!w.it.p.vars.some(v=>v.s.startsWith(nt))){g.wrong++;g.flash=.25;snd("bad");return}
      g.typed=nt;snd("key");
    }
    if(w.it.p.vars.some(v=>v.s===g.typed)){
      g.hits++;g.combo++;g.maxCombo=Math.max(g.maxCombo,g.combo);
      g.score+=Math.round((10+5*w.it.p.kana.length)*(1+Math.min(g.combo-1,10)*.1));
      g.lasers.push({id:++g.id,x:w.x,y:w.y,t:.22});snd("boom");
      w.dead=3.6;w.hit=true;
      {const cols=[a.accent,"#FFD166","#FF8FB1","#FF9F45","#7BD8FF","#fff"],parts=[];
       for(let i=0;i<22;i++){const ang=Math.PI*2*i/22+Math.random()*.4,d=50+Math.random()*80;parts.push({dx:Math.round(Math.cos(ang)*d),dy:Math.round(Math.sin(ang)*d),sz:6+Math.round(Math.random()*8),c:cols[i%cols.length],star:i%4===0,rot:Math.round(Math.random()*360)})}
       const boom=["BÙM!","BÙM BÙM!","PÚM!","BOOM!"][Math.floor(Math.random()*4)];
       g.bursts.push({id:++g.id,x:w.x,y:w.y,t:1,parts,boom,col:cols[Math.floor(Math.random()*3)]});}
      g.locked=null;g.typed="";g.recent=[w.it,...g.recent.filter(r=>r.v.id!==w.it.v.id)].slice(0,5);if(!g.hitList.find(r=>r.v.id===w.it.v.id))g.hitList.push(w.it);
    }
  };
  const start=()=>{
    const deck=allDecks.find(d=>d.id===deckId)||decks[0];
    if(!deck||deck.list.length<1)return toast("Bộ thẻ này chưa có từ nào có cách đọc bằng kana!");
    let l=shuffle(deck.list);l=l.slice(0,cnt==="all"?l.length:+cnt);
    const waves=[];for(let i=0;i<l.length;i+=8)waves.push(l.slice(i,i+8));
    if(waves.length>1&&waves[waves.length-1].length<4){const t=waves.pop();waves[waves.length-1].push(...t)}
    G.current={waves,wave:0,queue:[...waves[0]],words:[],spawnT:.6,lives:5,score:0,combo:0,maxCombo:0,hits:0,wrong:0,locked:null,typed:"",lasers:[],missed:[],recent:[],hitList:[],status:"play",breakT:0,id:0,cleared:0,deckId:deck.id,flash:0,shake:0,bursts:[],mul:({slow:1,mid:1.6,fast:2.5})[lsGet("bt_spd","slow")]||1};
    setRes(null);setScreen("play");
  };

  useEffect(()=>{
    if(screen!=="play")return;
    let raf,last=performance.now();
    const loop=t=>{const g=G.current;if(!g)return;const dt=Math.min(.05,(t-last)/1000);last=t;step(g,dt);tick(x=>x+1);raf=requestAnimationFrame(loop)};
    raf=requestAnimationFrame(loop);
    const h=e=>{
      if(e.ctrlKey||e.metaKey||e.altKey)return;
      const tg=e.target&&e.target.tagName;if(tg==="INPUT"||tg==="TEXTAREA"||tg==="SELECT")return;
      const g=G.current;if(!g)return;
      if(e.key===" "){e.preventDefault();if(g.status==="play")g.status="pause";else if(g.status==="pause")g.status="play";return}
      if(e.key==="Backspace"){e.preventDefault();press("\b");return}
      if(e.key==="Escape"){press("\x1b");return}
      if(/^[a-zA-Z'\-]$/.test(e.key)){e.preventDefault();press(e.key.toLowerCase())}
    };
    const vis=()=>{const g=G.current;if(document.hidden&&g&&g.status==="play")g.status="pause"};
    addEventListener("keydown",h);document.addEventListener("visibilitychange",vis);
    return()=>{cancelAnimationFrame(raf);removeEventListener("keydown",h);document.removeEventListener("visibilitychange",vis)};
  },[screen]);

  if(!jl.ready)return E(JLoading,{theme:a});

  /* ---------- bộ thẻ ---------- */
  const known=new Set(nbs.map(n=>n.id));
  const decks=[{id:"all",title:"Tất cả từ vựng",list:all}];
  nbs.forEach(n=>{const l=all.filter(x=>nbOf(x.v)===n.id);if(l.length)decks.push({id:n.id,title:cleanT(n.title),list:l})});
  const un=all.filter(x=>!known.has(nbOf(x.v)));
  if(un.length&&nbs.length)decks.push({id:"_",title:"Chưa phân sổ",list:un});
  const tough=all.filter(x=>classOf(vs,x.v,jl.srs)==="tough");
  if(tough.length)decks.push({id:"tough",title:"Từ hay sai",list:tough});
  const views=[];
  nbs.forEach(n=>(nbViews[n.id]||[]).forEach(vw=>{const ids=new Set(vw.wordIds||[]),l=all.filter(x=>ids.has(x.v.id));if(l.length)views.push({id:"v:"+vw.id,title:cleanT(n.title)+" › "+vw.name,list:l,nb:n.id,name:vw.name})}));
  const allDecks=[...decks,...views];
  const deck=allDecks.find(d=>d.id===deckId)||decks[0];

  const card={backgroundColor:a.card,borderColor:a.border,color:a.text};
  const stepCard=(n,t)=>E("div",{key:n,style:{...card,border:"1px solid "+a.border,borderRadius:14,padding:"16px 14px",display:"flex",gap:12,alignItems:"flex-start",minHeight:78}},
    E("span",{style:{flex:"none",width:32,height:32,borderRadius:99,background:"#1d9bf0",color:"#fff",fontWeight:800,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}},n),
    E("p",{style:{fontSize:13,lineHeight:1.55,margin:"2px 0 0"}},t));
  const whyCard=(ic,bg,col,t)=>E("div",{key:ic,style:{...card,border:"1px solid "+a.border,borderRadius:14,padding:"14px",display:"flex",gap:12,alignItems:"flex-start",minHeight:72}},
    E("span",{style:{flex:"none",width:34,height:34,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center"}},btIc(BT_ICONS[ic],col,18)),
    E("p",{style:{fontSize:13,lineHeight:1.55,margin:"2px 0 0"}},t));

  /* ---------- MÀN HÌNH CHƠI ---------- */
  if(screen==="play"&&G.current){
    const g=G.current,lockedW=g.words.find(w=>w.id===g.locked&&!w.dead);
    const left=g.queue.length+g.words.filter(w=>!w.dead).length;
    const chip={backgroundColor:a.accentSoft,borderRadius:99,padding:"5px 12px",fontSize:12,fontWeight:800};
    const btn=(l,f,pr)=>E("button",{onClick:f,className:"tap-fx",style:{backgroundColor:pr?a.accent:a.accentSoft,color:pr?"#fff":a.text,borderRadius:12,padding:"6px 14px",fontSize:12,fontWeight:800}},l);
    const rows=["qwertyuiop","asdfghjkl","zxcvbnm"];
    const glow=(c,k)=>"0 0 "+k+"px "+c+", 0 0 "+(k*2)+"px "+c+"88";
    const wordEl=w=>{
      const p=w.it.p,v=w.it.v,top=front(v),same=top===p.kana,isL=g.locked===w.id,pr=isL?btProg(p,g.typed):0;
      const kana=[...p.kana],kEl=E("span",null,E("span",{style:{color:a.accent}},kana.slice(0,pr).join("")),kana.slice(pr).join(""));
      const col=w.hit?a.accent:a.text;
      return E("div",{key:w.id,className:"bt-word"+(w.hit?" bt-hit":"")+(w.miss?" bt-miss":""),style:{left:w.x+"%",top:(w.y*100)+"%",color:col,background:"radial-gradient(closest-side,"+a.accent+(isL||w.hit?"66":"33")+",transparent)",textShadow:glow(a.accent,isL?14:8)}},
        same?E("div",{style:{fontSize:22,fontWeight:800,lineHeight:1.25}},kEl):E(React.Fragment,null,E("div",{style:{fontSize:23,fontWeight:800,lineHeight:1.2}},top),E("div",{style:{fontSize:13,fontWeight:700,opacity:.9}},kEl)),
        isL&&E("div",{style:{fontSize:11,fontWeight:800,color:a.accent,marginTop:2,letterSpacing:1}},g.typed),
        w.hit&&E("div",{className:"bt-mean",style:{background:a.card,borderColor:a.accent,color:a.text,textShadow:"none"}},v.meaning||"(chưa có nghĩa)"));
    };
    return E("div",{className:"space-y-3",style:{color:a.text}},
      E("div",{style:{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:8}},
        E("div",{style:{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}},
          E("span",{style:chip},"Nhóm "+(g.wave+1)+"/"+g.waves.length),
          E("span",{style:chip},"Còn "+left+" từ"),
          E("span",{style:{...chip,color:"#e0457b",letterSpacing:2}},"♥".repeat(Math.max(0,g.lives))+"♡".repeat(Math.max(0,5-g.lives)))),
        E("div",{style:{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}},
          E("span",{style:chip},"Điểm "+g.score),
          g.combo>1&&E("span",{style:{...chip,backgroundColor:"#FFF0C9",color:"#8a5a00"}},"Combo ×"+g.combo),
          btn(sndOn?"Âm thanh: bật":"Âm thanh: tắt",()=>{const n=!sndOn;lsSet("bt_snd",n?"1":"0");setSndOn(n)}),
          btn(g.status==="pause"?"Tiếp tục":"Tạm dừng",()=>{g.status=g.status==="pause"?"play":g.status==="play"?"pause":g.status;tick(x=>x+1)}),
          btn("Thoát",()=>{g.status="over";setScreen("intro")}))),
      E("div",{ref:fieldRef,className:"bt-field"+(g.shake>0?" bt-shake":""),style:{borderColor:g.flash>0?"#e0457b":a.border,backgroundColor:a.bg,backgroundImage:"radial-gradient("+a.accent+"88 1px,transparent 1.6px),radial-gradient("+a.accent+"55 1px,transparent 1.5px),linear-gradient(180deg,"+a.sidebar+" 0%,"+a.bg+" 100%)",backgroundSize:"83px 83px,131px 131px,auto",backgroundPosition:"0 0,41px 57px,0 0",color:a.text}},
        E("div",{style:{position:"absolute",left:0,right:0,top:"calc(74% + 58px)",borderTop:"2px dashed "+a.border}}),
        g.words.map(wordEl),
        (g.bursts||[]).map(b=>E("div",{key:b.id,className:"bt-burst",style:{left:b.x+"%",top:"calc("+(b.y*100)+"% + 34px)"}},
          E("div",{className:"bt-ring",style:{borderColor:b.col}}),
          b.parts.map((q,i)=>q.star
            ?E("span",{key:i,className:"bt-star",style:{color:q.c,fontSize:q.sz*2,"--dx":q.dx+"px","--dy":q.dy+"px","--rot":q.rot+"deg"}},"✦")
            :E("span",{key:i,className:"bt-p",style:{width:q.sz,height:q.sz,background:q.c,"--dx":q.dx+"px","--dy":q.dy+"px"}})),
          E("div",{className:"bt-boom",style:{color:b.col}},b.boom))),
        E("svg",{style:{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}},
          g.lasers.map(l=>E("line",{key:l.id,x1:"50%",y1:"90%",x2:l.x+"%",y2:(l.y*100+6)+"%",stroke:a.accent,strokeWidth:4,strokeLinecap:"round",opacity:Math.min(1,l.t/.22)}))),
        E("svg",{viewBox:"0 0 64 56",width:58,height:50,style:{position:"absolute",left:"50%",bottom:4,transform:"translateX(-50%)"}},
          E("path",{d:"M32 4 L50 40 L32 34 L14 40Z",fill:a.accent,stroke:"#5A4E63",strokeWidth:2.5,strokeLinejoin:"round"}),
          E("circle",{cx:32,cy:24,r:5,fill:"#fff",stroke:"#5A4E63",strokeWidth:2}),
          E("path",{d:"M25 40 L32 52 L39 40",fill:"#FFD166",stroke:"#5A4E63",strokeWidth:2,strokeLinejoin:"round"})),
        g.status==="break"&&E("div",{className:"bt-over",style:{background:a.bg+"d9",color:a.text}},E("div",{style:{fontSize:22,fontWeight:800}},"Nhóm "+(g.wave+1)+" hoàn thành!"),E("div",{style:{fontSize:13,opacity:.8,marginTop:4}},"Chuẩn bị — từ sẽ rơi nhanh hơn")),
        g.status==="pause"&&E("div",{className:"bt-over",style:{background:a.bg+"d9",color:a.text}},E("div",{style:{fontSize:22,fontWeight:800}},"Tạm dừng"),E("div",{style:{fontSize:13,opacity:.8,marginTop:4}},"Nhấn Space hoặc \"Tiếp tục\""))),
      g.recent.length>0&&E("div",{style:{display:"flex",flexWrap:"wrap",gap:6}},g.recent.map(r=>E("span",{key:r.v.id,style:{...chip,fontWeight:700,fontSize:12}},front(r.v)+(front(r.v)!==r.p.kana?" ("+r.p.kana+")":"")+" — "+(r.v.meaning||"?")))),
      E("div",{style:{display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:8,fontSize:11,fontWeight:700,opacity:.75}},
        E("span",null,"Space: tạm dừng · Esc: bỏ khóa · Backspace: xóa chữ"),
        E("button",{onClick:()=>setKb(!kb),style:{...chip,fontSize:11}},kb?"Ẩn bàn phím ảo":"Hiện bàn phím ảo")),
      kb&&E("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:5,userSelect:"none",touchAction:"manipulation"}},
        rows.map((r,i)=>E("div",{key:i,style:{display:"flex",gap:5,justifyContent:"center"}},[...r].map(k=>E("button",{key:k,onPointerDown:e=>{e.preventDefault();press(k)},style:{...card,border:"1px solid "+a.border,borderRadius:10,minWidth:30,height:40,fontWeight:800,fontSize:15,boxShadow:"0 2px 0 "+a.border}},k)))),
        E("div",{style:{display:"flex",gap:5}},
          ["-","'"].map(k=>E("button",{key:k,onPointerDown:e=>{e.preventDefault();press(k)},style:{...card,border:"1px solid "+a.border,borderRadius:10,minWidth:40,height:40,fontWeight:800,boxShadow:"0 2px 0 "+a.border}},k)),
          E("button",{onPointerDown:e=>{e.preventDefault();press("\x1b")},style:{...card,border:"1px solid "+a.border,borderRadius:10,padding:"0 14px",height:40,fontWeight:800,fontSize:12,boxShadow:"0 2px 0 "+a.border}},"Bỏ khóa"),
          E("button",{onPointerDown:e=>{e.preventDefault();press("\b")},style:{...card,border:"1px solid "+a.border,borderRadius:10,padding:"0 16px",height:40,fontWeight:800,boxShadow:"0 2px 0 "+a.border}},"⌫"))));
  }

  /* ---------- KẾT QUẢ ---------- */
  if(screen==="result"&&res){
    const acc=res.hits+res.wrong?Math.round(res.hits/(res.hits+res.wrong)*100):100;
    const stat=(l,v)=>E("div",{key:l,style:{backgroundColor:a.accentSoft,borderRadius:14,padding:"12px 8px",textAlign:"center"}},E("div",{style:{fontSize:20,fontWeight:800}},v),E("div",{style:{fontSize:11,fontWeight:700,opacity:.75}},l));
    return E("div",{className:"space-y-5",style:{color:a.text,maxWidth:760,margin:"0 auto"}},
      E("div",{style:{...card,border:"1px solid "+a.border,borderRadius:24,padding:24,textAlign:"center"}},
        E("h2",{style:{fontSize:26,fontWeight:800}},res.win?"Chiến thắng!":"Hết mạng rồi!"),
        E("p",{style:{fontSize:13,opacity:.8,margin:"6px 0 16px"}},res.win?"Bạn đã bắn hạ toàn bộ "+res.waves+" nhóm từ.":"Bạn vượt qua "+res.cleared+"/"+res.waves+" nhóm. Thử lại nhé!"),
        E("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:10}},
          stat("Điểm",res.score),stat("Kỷ lục bộ thẻ",res.best),stat("Từ bắn hạ",res.hits),stat("Độ chính xác",acc+"%"),stat("Combo cao nhất","×"+res.maxCombo),stat("EXP nhận",res.xp)),
        E("div",{style:{display:"flex",gap:10,justifyContent:"center",marginTop:18,flexWrap:"wrap"}},
          E("button",{onClick:start,className:"tap-fx",style:{backgroundColor:a.accent,color:"#fff",borderRadius:14,padding:"10px 22px",fontWeight:800,fontSize:13}},"Chơi lại"),
          E("button",{onClick:()=>setScreen("intro"),className:"tap-fx",style:{backgroundColor:a.accentSoft,borderRadius:14,padding:"10px 22px",fontWeight:800,fontSize:13}},"Chọn bộ thẻ khác"))),
      res.hitList.length>0&&E("div",{style:{...card,border:"1px solid "+a.border,borderRadius:20,padding:20}},
        E("h3",{style:{fontSize:15,fontWeight:800,marginBottom:10}},"Từ đã bắn hạ ("+res.hitList.length+")"),
        E("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:8}},
          res.hitList.map(m=>E("div",{key:m.v.id,style:{backgroundColor:a.accentSoft,borderRadius:12,padding:"8px 12px"}},
            E("div",{style:{fontWeight:800,fontSize:15}},front(m.v)),
            E("div",{style:{fontSize:12,opacity:.85}},m.p.kana+(m.v.meaning?" · "+m.v.meaning:"")))))),
      res.missed.length>0&&E("div",{style:{...card,border:"1px solid "+a.border,borderRadius:20,padding:20}},
        E("h3",{style:{fontSize:15,fontWeight:800,marginBottom:10}},"Từ cần ôn lại ("+res.missed.length+")"),
        E("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:8}},
          res.missed.map(m=>E("div",{key:m.v.id,style:{backgroundColor:a.accentSoft,borderRadius:12,padding:"8px 12px"}},
            E("div",{style:{fontWeight:800,fontSize:15}},front(m.v)),
            E("div",{style:{fontSize:12,opacity:.85}},m.p.kana+(m.v.meaning?" · "+m.v.meaning:"")))))));
  }

  /* ---------- TRANG GIỚI THIỆU + CHỌN BỘ THẺ ---------- */
  const best=window.meobooksServices.localStore.getBestScore("bt",deck.id);
  return E("div",{className:"space-y-7",style:{color:a.text,maxWidth:860,margin:"0 auto"}},
    E("div",{style:{textAlign:"center"}},
      E("span",{style:{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:99,border:"1px solid #9db4f5",background:"#eef3ff",color:"#3a5bd0",fontSize:11,fontWeight:800,letterSpacing:1}},btIc(BT_ICONS.spark,"#3a5bd0",14),"BẮN TỪ"),
      E("p",{style:{fontSize:14,lineHeight:1.75,maxWidth:700,margin:"16px auto 0",opacity:.9}},"Bắn Từ biến bộ thẻ của bạn thành một game gõ phím kiểu arcade. Các từ tiếng Nhật rơi từ đỉnh màn hình, kanji ở trên và cách đọc bằng kana bên dưới — gõ cách đọc bằng romaji để khóa mục tiêu và bắn hạ từng từ trước khi nó chạm tới phi thuyền. Bạn đi qua bộ thẻ theo từng nhóm, và nhịp độ tăng dần sau mỗi nhóm.")),
    E("div",{style:{...card,border:"1px solid "+a.border,borderRadius:20,padding:20}},
      E("h3",{style:{fontSize:15,fontWeight:800,marginBottom:10}},"Chọn bộ thẻ"),
      all.length<1?E("p",{style:{fontSize:13,opacity:.8}},"Chưa có từ nào có cách đọc bằng kana trong kho từ vựng. Hãy thêm từ vào mục Từ vựng trước nhé!"):E(React.Fragment,null,
        nbDeckPicker({a,onAcc:"#fff",deck,decks,views,nbs,nbViews,label:"Sổ & view",onPick:d=>{setDeckId(d.id);lsSet("bt_deck",d.id)}}),
        E("div",{style:{display:"flex",flexWrap:"wrap",alignItems:"center",gap:8,marginTop:14}},
          E("span",{style:{fontSize:12,fontWeight:800}},"Số từ mỗi lượt:"),
          ["16","32","64","all"].map(c=>E("button",{key:c,onClick:()=>{setCnt(c);lsSet("bt_cnt",c)},className:"tap-fx",style:{backgroundColor:cnt===c?a.accent:a.accentSoft,color:cnt===c?"#fff":a.text,borderRadius:99,padding:"4px 14px",fontSize:12,fontWeight:800}},c==="all"?"Tất cả":c))),
        E("div",{style:{display:"flex",flexWrap:"wrap",alignItems:"center",gap:8,marginTop:12}},
          E("span",{style:{fontSize:12,fontWeight:800}},"Tốc độ rơi:"),
          [["slow","Chậm (dễ đọc nghĩa)"],["mid","Vừa"],["fast","Nhanh"]].map(([k,l])=>E("button",{key:k,onClick:()=>{setSpdK(k);lsSet("bt_spd",k)},className:"tap-fx",style:{backgroundColor:spdK===k?a.accent:a.accentSoft,color:spdK===k?"#fff":a.text,borderRadius:99,padding:"4px 14px",fontSize:12,fontWeight:800}},l))),
        E("div",{style:{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:10,marginTop:16}},
          E("span",{style:{fontSize:12,fontWeight:700,opacity:.75}},best?"Kỷ lục bộ này: "+best+" điểm":"Chưa có kỷ lục cho bộ này"),
          E("button",{onClick:start,className:"tap-fx",style:{backgroundColor:a.accent,color:"#fff",borderRadius:14,padding:"10px 28px",fontWeight:800,fontSize:14,boxShadow:"0 3px 0 rgba(0,0,0,.12)"}},"Bắt đầu bắn!")))),
    E("div",null,
      E("h3",{style:{textAlign:"center",fontSize:19,fontWeight:800,marginBottom:14}},"Cách chơi"),
      E("div",{className:"bt-grid2"},
        stepCard(1,"Chọn một bộ thẻ — bạn sẽ chơi lần lượt từng nhóm."),
        stepCard(2,"Gõ chữ cái đầu tiên trong cách đọc của một từ để khóa mục tiêu, rồi gõ phần còn lại bằng romaji để bắn. Gõ shi hay si, tsu hay tu đều được; gõ nn cho ん."),
        stepCard(3,"Bắn hạ mọi từ trong một nhóm để sang nhóm tiếp theo. Từ rơi nhanh hơn sau mỗi nhóm."),
        stepCard(4,"Từ nào chạm đáy sẽ làm bạn mất 1 mạng. Vượt qua nhóm cuối cùng để chiến thắng."))),
    E("div",null,
      E("h3",{style:{textAlign:"center",fontSize:19,fontWeight:800,marginBottom:14}},"Vì sao nên chơi Bắn Từ"),
      E("div",{className:"bt-grid2"},
        whyCard("brain","#ece6fb","#7a4fd6","Nhớ lại cách đọc — bạn nhìn kanji và tự gõ ra cách đọc, giúp nhớ sâu hơn hẳn so với chỉ đọc qua."),
        whyCard("zap","#fdf0c4","#d98a00","Luyện gõ romaji thật nhanh — đúng cách người ta gõ tiếng Nhật trên mọi máy tính."),
        whyCard("phone","#d6f5e3","#1f9d62","Chơi bằng bàn phím thật, hoặc trên điện thoại và máy tính bảng với bàn phím ảo tích hợp sẵn."),
        whyCard("layers","#dbeafb","#2b7bd8","Bộ thẻ của bạn — mọi từ đều lấy từ chính từ vựng bạn đang học."))));
  };
}
