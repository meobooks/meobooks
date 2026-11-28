// Trò chơi Nối Từ (nối từ tiếng Nhật với nghĩa tiếng Việt), chuyển từ public/legacy/index.html (tách giao diện bước 18).
// front, cleanT, nbOf, classOf, nbDeckPicker, ntSnd, shuffle, JLoading, MochiMascot và meoFeat vẫn nằm trong app cũ nên được truyền vào (dependency injection).
import React, { useState, useEffect, useRef, useMemo } from 'react';

export function makeNoiTu({ front, cleanT, nbOf, classOf, nbDeckPicker, ntSnd, shuffle, JLoading, MochiMascot, meoFeat }) {
  return function NoiTu({jl,theme:a,notebooks:nbs=[],nbViews={},stats:vs={},onXp=()=>{},toast=()=>{}}){
    const E=React.createElement;
    const lsGet=(k,d)=>window.meobooksServices.localStore.getRaw(k,d);
    const lsSet=(k,v)=>window.meobooksServices.localStore.setRaw(k,v);
    const BATCH=10;
    const usedIds=()=>{try{const a=JSON.parse(lsGet("nt_used","[]"));return Array.isArray(a)?a:[]}catch(x){return[]}};
    const markUsed=id=>{const s=new Set(usedIds());s.add(id);lsSet("nt_used",JSON.stringify([...s]))};
    const[screen,setScreen]=useState("intro"),[deckId,setDeckId]=useState(()=>lsGet("nt_deck","all")),[cnt,setCnt]=useState(()=>+lsGet("nt_cnt","20")||20),[order,setOrder]=useState(()=>lsGet("nt_order","random")),[,setUsedTick]=useState(0);
    const[sndOn,setSndOn]=useState(()=>lsGet("bt_snd","1")!=="0");
    const[g,setG]=useState(null),[selL,setSelL]=useState(null),[selR,setSelR]=useState(null),[bad,setBad]=useState(null);
    const[sec,setSec]=useState(0),[res,setRes]=useState(null);
    const t0=useRef(0),lock=useRef(false);

    /* thời gian chơi (đếm lên) */
    useEffect(()=>{
      if(screen!=="play")return;
      const iv=setInterval(()=>setSec(Math.floor((Date.now()-t0.current)/1000)),500);
      return()=>clearInterval(iv);
    },[screen]);

    /* danh sách từ dùng được: có nghĩa tiếng Việt, bỏ trùng nghĩa / trùng mặt chữ để không bị nhập nhằng khi nối */
    const all=useMemo(()=>{
      if(!jl.ready)return[];
      const seenM=new Set(),seenF=new Set(),out=[];
      jl.vocab.forEach(v=>{
        const m=String(v.meaning||"").trim(),f=front(v);
        if(!m||!f)return;
        const km=m.toLowerCase(),kf=String(f);
        if(seenM.has(km)||seenF.has(kf))return;
        seenM.add(km);seenF.add(kf);
        const rd=v.reading&&v.reading!==f?v.reading:"";
        out.push({v,f:String(f),rd,m});
      });
      return out;
    },[jl.vocab,jl.ready]);

    if(!jl.ready)return E(JLoading,{theme:a});

    /* ---------- bộ thẻ: tất cả / từng sổ / từng view / từ hay sai ---------- */
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
    const usedSet=new Set(usedIds());
    const playPool=meoFeat.noitu.playPool(deck.list,usedSet,order);
    const usedInDeck=deck.list.filter(x=>usedSet.has(x.v.id)).length;
    const canPlay=playPool.length>=10;
    const n=meoFeat.noitu.roundSize(cnt,playPool.length);

    const card={backgroundColor:a.card,borderColor:a.border,color:a.text};
    const chip={backgroundColor:a.accentSoft,color:a.text,borderRadius:99,padding:"5px 12px",fontSize:12,fontWeight:800};
    const onAcc=a.dark?a.bg:"#fff";
    const bigBtn={backgroundColor:a.accent,color:onAcc,padding:"12px 32px",fontWeight:800,fontSize:15};
    const smBtn=(l,f,pr)=>E("button",{onClick:f,className:"tap-fx",style:{backgroundColor:pr?a.accent:a.accentSoft,color:pr?onAcc:a.text,borderRadius:12,padding:"6px 14px",fontSize:12,fontWeight:800}},l);
    const fmt=t=>Math.floor(t/60)+":"+String(t%60).padStart(2,"0");

    /* ---------- logic ---------- */
    const resetDeckUsed=()=>{lsSet("nt_used",JSON.stringify(meoFeat.noitu.usedAfterReset(usedIds(),deck.list.map(x=>x.v.id))));setUsedTick(x=>x+1)};
    const makeBoard=items=>({L:shuffle(items),R:shuffle(items),m:[]});
    const start=()=>{
      if(!canPlay)return toast("Bộ này cần ít nhất 10 từ có nghĩa để chơi!");
      const picked=shuffle(playPool).slice(0,n);
      const batches=meoFeat.noitu.splitBatches(picked,BATCH);
      lock.current=false;
      setSelL(null);setSelR(null);setBad(null);setSec(0);t0.current=Date.now();
      setG({n,deckId:deck.id,deckTitle:deck.title,batches,bi:0,done:0,wrong:0,missed:{},cur:makeBoard(batches[0])});
      setScreen("play");
    };
    const finish=ng=>{
      const secs=Math.max(1,Math.round((Date.now()-t0.current)/1000));
      const score=meoFeat.noitu.roundScore({n:ng.n,secs,wrong:ng.wrong});
      let best=score;
      try{const LS=window.meobooksServices.localStore,o=LS.getBestScore("nt",ng.deckId);best=Math.max(o,score);if(score>o)LS.setBestScore("nt",ng.deckId,score)}catch(x){}
      const xp=meoFeat.noitu.roundXp(ng.n);
      try{onXp(xp)}catch(x){}
      ntSnd.end();
      setRes({n:ng.n,secs,wrong:ng.wrong,score,best,xp,deckTitle:ng.deckTitle,missed:Object.values(ng.missed)});
      setScreen("result");
    };
    const pick=(side,k)=>{
      if(lock.current||!g||g.cur.m.includes(k))return;
      ntSnd.tap();
      let l=selL,r=selR;
      if(side==="L")l=l===k?null:k;else r=r===k?null:k;
      setSelL(l);setSelR(r);
      if(l===null||r===null)return;
      lock.current=true;
      if(l===r){
        ntSnd.ok();markUsed(l);
        const m=[...g.cur.m,l],done=g.done+1,ng={...g,done,cur:{...g.cur,m}};
        setG(ng);setSelL(null);setSelR(null);
        if(m.length>=g.cur.L.length){
          setTimeout(()=>{
            if(g.bi+1>=g.batches.length){finish(ng)}
            else{ntSnd.batch();setG({...ng,bi:g.bi+1,cur:makeBoard(g.batches[g.bi+1])});lock.current=false}
          },550);
        }else setTimeout(()=>{lock.current=false},200);
      }else{
        ntSnd.bad();
        const li=g.cur.L.find(x=>x.v.id===l),ri=g.cur.R.find(x=>x.v.id===r);
        const missed={...g.missed};[li,ri].forEach(x=>{if(x)missed[x.v.id]=x});
        setG({...g,wrong:g.wrong+1,missed});
        setBad({l,r});
        setTimeout(()=>{setBad(null);setSelL(null);setSelR(null);lock.current=false},520);
      }
    };

    /* ---------- MÀN HƯỚNG DẪN / CHỌN BỘ THẺ ---------- */
    if(screen==="intro"){
      const best=window.meobooksServices.localStore.getBestScore("nt",deck.id);
      const pickDeck=d=>{setDeckId(d.id);lsSet("nt_deck",d.id)};
      const pickerEl=nbDeckPicker({a,onAcc,deck,decks,views,nbs,nbViews,onPick:pickDeck});
      return E("div",{className:"space-y-4",style:{color:a.text,maxWidth:640,margin:"0 auto"}},
        E("div",{className:"rounded-3xl border-2 p-5 space-y-4",style:card},
          E("div",{className:"flex items-center gap-3"},
            E("div",{style:{width:88,flexShrink:0}},E(MochiMascot,{mood:"happy",accessory:"bow",size:88})),
            E("div",null,
              E("h2",{style:{fontSize:22,fontWeight:800}},"Nối Từ"),
              E("p",{style:{fontSize:13,opacity:.85,lineHeight:1.55,marginTop:2}},"Nối từ tiếng Nhật với nghĩa tiếng Việt đúng của nó. Mỗi lượt hiện 10 cặp, nối xong thì sang 10 cặp kế tiếp."))),
          pickerEl,
          E("div",{style:{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",justifyContent:"space-between"}},
            E("div",{style:{display:"flex",gap:8,flexWrap:"wrap"}},
              smBtn("Ngẫu nhiên",()=>{setOrder("random");lsSet("nt_order","random")},order!=="fresh"),
              smBtn("Chỉ từ chưa nối",()=>{setOrder("fresh");lsSet("nt_order","fresh")},order==="fresh")),
            E("span",{style:{fontSize:12,fontWeight:700,opacity:.8}},"Đã nối "+usedInDeck+"/"+deck.list.length+" từ trong bộ")),
          order==="fresh"&&usedInDeck>0&&E("div",{style:{display:"flex",justifyContent:"flex-end"}},smBtn("Đặt lại tiến độ bộ này",resetDeckUsed,false)),
          canPlay
            ?E("div",null,
              E("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}},
                E("span",{style:{fontSize:12,fontWeight:800}},"Số từ nối mỗi lần"),
                E("span",{style:{...chip,fontSize:14}},n+" từ")),
              maxN>10
                ?E("input",{type:"range",min:10,max:maxN,step:1,value:n,onChange:e=>{const v=+e.target.value;setCnt(v);lsSet("nt_cnt",String(v))},style:{width:"100%",accentColor:a.accent}})
                :E("p",{style:{fontSize:12,opacity:.75}},"Bộ này có đúng 10 từ nên sẽ nối cả 10."),
              E("div",{style:{display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:700,opacity:.65,marginTop:2}},E("span",null,"Tối thiểu 10"),E("span",null,"Tối đa "+maxN+(maxN===playPool.length?(order==="fresh"?" (hết từ chưa nối)":" (hết bộ)"):""))))
            :E("p",{style:{fontSize:13,fontWeight:700,color:"#E26B7C"}},order==="fresh"&&deck.list.length>=10?"Còn "+playPool.length+" từ chưa nối trong bộ này (cần ít nhất 10). Bấm 'Đặt lại tiến độ bộ này' để nối lại từ đầu, hoặc chọn bộ khác.":"Bộ này mới có "+deck.list.length+" từ có nghĩa — cần ít nhất 10 từ. Hãy chọn bộ khác hoặc thêm từ."),
          E("div",{className:"flex items-center justify-between flex-wrap gap-2"},
            E("span",{style:chip},best>0?"Kỷ lục bộ này: "+best:"Chưa có kỷ lục"),
            E("button",{onClick:start,disabled:!canPlay,className:"tap-fx rounded-2xl",style:{...bigBtn,opacity:canPlay?1:.45}},"Bắt đầu"))));
    }

    /* ---------- MÀN KẾT QUẢ ---------- */
    if(screen==="result"&&res){
      const stat=(l,v)=>E("div",{key:l,className:"rounded-2xl",style:{backgroundColor:a.accentSoft,padding:"12px 8px",textAlign:"center"}},
        E("div",{style:{fontSize:22,fontWeight:800}},v),E("div",{style:{fontSize:11,fontWeight:700,opacity:.75}},l));
      return E("div",{className:"space-y-4",style:{color:a.text,maxWidth:640,margin:"0 auto"}},
        E("div",{className:"rounded-3xl border-2 p-6 text-center space-y-4",style:card},
          E("div",{className:"mx-auto",style:{width:120}},E(MochiMascot,{mood:res.wrong<=res.n*.3?"cheer":"happy",accessory:"bow",size:120})),
          E("h2",{style:{fontSize:22,fontWeight:800}},"Nối xong "+res.n+" từ!"),
          E("p",{style:{fontSize:12,opacity:.75}},res.deckTitle+" · +"+res.xp+" EXP"),
          E("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}},
            stat("Điểm",res.score),stat("Thời gian",fmt(res.secs)),stat("Nối sai",res.wrong)),
          res.score>=res.best&&E("p",{style:{fontSize:13,fontWeight:800,color:a.accent}},"Kỷ lục mới!"),
          E("div",{className:"flex justify-center gap-2 flex-wrap"},
            E("button",{onClick:start,className:"tap-fx rounded-2xl",style:{...bigBtn,padding:"10px 24px"}},"Chơi lại"),
            E("button",{onClick:()=>setScreen("intro"),className:"tap-fx rounded-2xl",style:{backgroundColor:a.accentSoft,color:a.text,padding:"10px 24px",fontWeight:800}},"Đổi bộ từ / số từ"))),
        res.missed.length>0&&E("div",{className:"rounded-3xl border-2 p-4 space-y-2",style:card},
          E("div",{style:{fontSize:13,fontWeight:800}},"Những từ bạn từng nối nhầm ("+res.missed.length+")"),
          E("div",{style:{display:"flex",flexWrap:"wrap",gap:6}},
            res.missed.map(x=>E("span",{key:x.v.id,style:{...chip,fontWeight:700}},x.f+(x.rd?" ("+x.rd+")":"")+" — "+x.m)))));
    }

    /* ---------- MÀN CHƠI ---------- */
    if(!g)return null;
    const cur=g.cur;
    const tile=(side,x)=>{
      const k=x.v.id,matched=cur.m.includes(k),sel=(side==="L"?selL:selR)===k,isBad=bad&&(side==="L"?bad.l:bad.r)===k;
      const base={...card,width:"100%",minHeight:62,padding:"8px 10px",border:"2px solid "+(isBad?"#E26B7C":sel?a.accent:a.border),borderRadius:18,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,
        backgroundColor:matched?a.accentSoft:sel?a.accentSoft:a.card,opacity:matched?.28:1,boxShadow:matched||sel?"none":"0 3px 0 "+a.border,transform:sel?"translateY(2px)":"none",wordBreak:"keep-all",overflowWrap:"anywhere"};
      return E("button",{key:side+k,disabled:matched,onClick:()=>pick(side,k),className:"tap-fx"+(isBad?" bt-shake":""),style:base},
        side==="L"
          ?[E("span",{key:"f",style:{fontSize:20,fontWeight:800,lineHeight:1.25}},x.f),x.rd&&E("span",{key:"r",style:{fontSize:11,fontWeight:700,opacity:.75}},x.rd)]
          :E("span",{style:{fontSize:13,fontWeight:700,lineHeight:1.35}},x.m));
    };
    return E("div",{className:"space-y-3",style:{color:a.text,maxWidth:640,margin:"0 auto"}},
      E("div",{className:"flex flex-wrap items-center justify-between gap-2"},
        E("div",{style:{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}},
          E("span",{style:chip},"Đã nối "+g.done+"/"+g.n),
          E("span",{style:chip},"Lượt "+(g.bi+1)+"/"+g.batches.length),
          E("span",{style:{...chip,color:g.wrong?"#E26B7C":a.text}},"Sai "+g.wrong),
          E("span",{style:chip},fmt(sec))),
        E("div",{style:{display:"flex",gap:8}},
          smBtn(sndOn?"Âm thanh: bật":"Âm thanh: tắt",()=>{const nv=!sndOn;lsSet("bt_snd",nv?"1":"0");setSndOn(nv)}),
          smBtn("Thoát",()=>{lock.current=false;setScreen("intro")}))),
      E("div",{style:{height:10,borderRadius:99,overflow:"hidden",backgroundColor:a.accentSoft}},
        E("div",{style:{height:"100%",width:(g.done/g.n*100)+"%",backgroundColor:a.accent,borderRadius:99,transition:"width .25s"}})),
      E("p",{style:{fontSize:12,fontWeight:700,opacity:.75,textAlign:"center"}},"Chạm một từ tiếng Nhật và nghĩa tiếng Việt tương ứng để nối chúng lại"),
      E("div",{style:{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}},
        E("div",{style:{display:"flex",flexDirection:"column",gap:10}},cur.L.map(x=>tile("L",x))),
        E("div",{style:{display:"flex",flexDirection:"column",gap:10}},cur.R.map(x=>tile("R",x)))));
  };
}
