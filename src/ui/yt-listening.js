// Trình nghe & shadowing YouTube (YtListening), chuyển từ public/legacy/index.html.
// cleanT, YTL, ytApi, YT_ERR, ytFallback, askClaude, searchJP, InteractiveSentenceCard vẫn nằm trong app cũ nên được truyền vào (dependency injection).
import React, { useEffect, useMemo, useRef, useState } from 'react';

export function makeYtListening({ cleanT, YTL, ytApi, YT_ERR, ytFallback, askClaude, searchJP, InteractiveSentenceCard }) {
  return function YtListening({theme:a,prefs:S,getPrefs,save,onSaveUnifiedVocab,findDup,notebooks=[],nbViews={},onSaveNbViews,onXp,toast}){
  const E=React.createElement;
  const lib=S.ytLib||[],mist=S.ytMistakes||[];
  const customLists=S.ytCustomLists||[];

  const[url,setUrl]=useState(""),[cur,setCur]=useState(()=>lib[0]?lib[0].id:""),[msg,setMsg]=useState(""),
    [ready,setReady]=useState(false),[perr,setPerr]=useState(""),[mode,setMode]=useState("read"),[rate,setRate]=useState(1),
    [nb,setNb]=useState(1),[cnt,setCnt]=useState(10),[ses,setSes]=useState(null),
    [raw,setRaw]=useState(""),[rawVi,setRawVi]=useState(""),[edit,setEdit]=useState(false),
    [viewLayout,setViewLayout]=useState("both"),
    [furi,setFuri]=useState(true),[act,setAct]=useState(-1),
    [selectedToken,setSelectedToken]=useState(null),[tokenPopup,setTokenPopup]=useState(null),
    [wf,setWf]=useState(null),[busy,setBusy]=useState(-1),[panel,setPanel]=useState("study"),
    [ans,setAns]=useState([]),[chk,setChk]=useState(null),[fb,setFb]=useState(false),[slow,setSlow]=useState(false),[retry,setRetry]=useState(0),
    [activeListId,setActiveListId]=useState("all"),[newListName,setNewListName]=useState(""),[showListMgr,setShowListMgr]=useState(false),
    [confirmDelId,setConfirmDelId]=useState(""),[confirmDelListId,setConfirmDelListId]=useState("");

  const hostRef=useRef(null),pl=useRef(null),timer=useRef(null),linesRef=useRef([]),lineRefs=useRef([]);
  const it=lib.find(x=>x.id===cur)||null,lines=it&&it.lines?it.lines:[];
  linesRef.current=lines;
  const timed=lines.filter(l=>l.t!=null).length;

  const card={backgroundColor:a.card,border:"1.5px solid "+a.border,borderRadius:20,padding:16,color:a.text};
  const btn={backgroundColor:a.accent,color:"#fff",border:0,borderRadius:12,padding:"8px 14px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"};
  const soft={backgroundColor:a.accentSoft,color:a.text,border:"1px solid "+a.border,borderRadius:12,padding:"6px 12px",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"};
  const inp={border:"1.5px solid "+a.border,backgroundColor:a.card,color:a.text,borderRadius:12,padding:"8px 12px",fontSize:15,outline:"none",fontFamily:"inherit",minWidth:0};
  const note={fontSize:12,opacity:.75,lineHeight:1.5};
  const stopT=()=>{if(timer.current){clearInterval(timer.current);timer.current=null}};

  useEffect(()=>{
    if(!cur||!hostRef.current)return;
    let dead=false;const host=hostRef.current;host.innerHTML="";
    const d=document.createElement("div");host.appendChild(d);setPerr("");setReady(false);setFb(false);setSlow(false);
    const tm=setTimeout(()=>{if(!dead)setSlow(true)},8000);
    const useFallback=()=>{
      if(dead)return;host.innerHTML="";
      const r=ytFallback(host,cur,c=>{if(!dead)setPerr(YT_ERR[c]||"Không phát được video này.")});
      pl.current=r.ctl;setFb(true);r.iframe.addEventListener("load",()=>{if(!dead)setReady(true)});
    };
    ytApi().then(()=>{
      if(dead)return;
      pl.current=new window.YT.Player(d,{videoId:cur,width:"100%",height:"100%",playerVars:{rel:0,playsinline:1,modestbranding:1,hl:"ja"},
        events:{onReady:()=>{if(!dead)setReady(true)},onError:e=>{if(!dead)setPerr(YT_ERR[e.data]||"Không phát được video này.")}}});
    }).catch(useFallback);
    return()=>{dead=true;clearTimeout(tm);stopT();try{pl.current&&pl.current.destroy()}catch(e){}pl.current=null;host.innerHTML=""};
  },[cur,retry]);
  useEffect(()=>{if(ready&&pl.current){try{pl.current.setPlaybackRate(rate)}catch(e){}}},[rate,ready]);

  useEffect(()=>{
    if(!ready||mode!=="read"||panel!=="study"||!timed){setAct(-1);return}
    const iv=setInterval(()=>{
      try{
        const c=pl.current.getCurrentTime();
        const ls=linesRef.current;
        let k=-1;
        ls.forEach((l,i)=>{if(l.t!=null&&l.t<=c+0.15)k=i});
        setAct(prev=>{
          if(prev!==k&&k>=0&&lineRefs.current[k]){
            try{lineRefs.current[k].scrollIntoView({behavior:"smooth",block:"nearest"})}catch(e){}
          }
          return k;
        });
      }catch(e){}
    },250);
    return()=>clearInterval(iv);
  },[ready,mode,panel,timed,cur,lines.length]);

  const playSeg=i=>{
    const p=pl.current,l=lines[i];
    if(!p||!ready)return setMsg("Trình phát chưa sẵn sàng (hoặc video không phát được).");
    if(!l||l.t==null)return setMsg("Câu này chưa có timestamp nên không phát riêng được.");
    setMsg("");stopT();const end=YTL.endOf(lines,i);
    try{
      setAct(i);
      p.seekTo(Math.max(0,l.t-.1),true);p.playVideo();
      timer.current=setInterval(()=>{
        try{
          const curT=p.getCurrentTime();
          if(curT>=end){p.pauseVideo();stopT()}
        }catch(e){stopT()}
      },120);
    }catch(e){setMsg("Không điều khiển được trình phát.")}
  };

  const setLib=fn=>save({ytLib:fn(getPrefs().ytLib||[])});
  const setCustomLists=fn=>save({ytCustomLists:fn(getPrefs().ytCustomLists||[])});

  const addVideo=async()=>{
    const v=YTL.id(url);if(!v)return setMsg("Không nhận ra URL YouTube.");
    setMsg("");setUrl("");
    if(!lib.some(x=>x.id===v)){
      setLib(L=>[{id:v,url:"https://www.youtube.com/watch?v="+v,title:"Video "+v,lines:[],raw:"",rawVi:"",added:dayKey(),prog:{}},...L].slice(0,50));
      try{
        const r=await fetch("https://www.youtube.com/oembed?format=json&url="+encodeURIComponent("https://www.youtube.com/watch?v="+v));
        if(r.ok){const j=await r.json();if(j.title)setLib(L=>L.map(x=>x.id===v&&x.title==="Video "+v?{...x,title:j.title}:x))}
      }catch(e){}
    }
    if(activeListId!=="all"){
      setCustomLists(CL=>CL.map(lst=>lst.id===activeListId&&!lst.videoIds.includes(v)?{...lst,videoIds:[v,...lst.videoIds]}:lst));
    }
    setCur(v);setSes(null);setEdit(false);setPanel("study");setMode("read");
  };

  const delVideo=id=>{
    if(confirmDelId!==id){
      setConfirmDelId(id);
      setTimeout(()=>setConfirmDelId(prev=>prev===id?"":prev),4000);
      return;
    }
    setConfirmDelId("");
    const P=getPrefs();
    const nextLib=(P.ytLib||[]).filter(x=>x.id!==id);
    const nextLists=(P.ytCustomLists||[]).map(lst=>({...lst,videoIds:lst.videoIds.filter(vid=>vid!==id)}));
    save({ytLib:nextLib,ytCustomLists:nextLists,ytMistakes:(P.ytMistakes||[]).filter(m=>m.vid!==id)});
    if(cur===id){const r=nextLib[0];setCur(r?r.id:"");setSes(null)}
    toast&&toast("Đã xóa video khỏi thư viện!");
  };

  const moveVideoOrder=(id,dir)=>{
    if(activeListId==="all"){
      setLib(L=>{
        const idx=L.findIndex(x=>x.id===id);
        if(idx<0)return L;
        const target=idx+dir;
        if(target<0||target>=L.length)return L;
        const copy=[...L];
        [copy[idx],copy[target]]=[copy[target],copy[idx]];
        return copy;
      });
    }else{
      setCustomLists(CL=>CL.map(lst=>{
        if(lst.id!==activeListId)return lst;
        const idx=lst.videoIds.indexOf(id);
        if(idx<0)return lst;
        const target=idx+dir;
        if(target<0||target>=lst.videoIds.length)return lst;
        const copy=[...lst.videoIds];
        [copy[idx],copy[target]]=[copy[target],copy[idx]];
        return{...lst,videoIds:copy};
      }));
    }
  };

  const createCustomList=()=>{
    const nm=newListName.trim();
    if(!nm)return setMsg("Nhập tên danh sách phát trước nhé!");
    const newId="ytlist-"+Date.now();
    const initIds=cur?[cur]:[];
    setCustomLists(CL=>[...CL,{id:newId,name:nm,videoIds:initIds}]);
    setActiveListId(newId);
    setNewListName("");
    toast&&toast(`Đã tạo danh sách "${nm}"!`);
  };

  const toggleVideoInList=(listId,videoId)=>{
    setCustomLists(CL=>CL.map(lst=>{
      if(lst.id!==listId)return lst;
      const exists=lst.videoIds.includes(videoId);
      return{...lst,videoIds:exists?lst.videoIds.filter(x=>x!==videoId):[...lst.videoIds,videoId]};
    }));
  };

  const deleteCustomList=listId=>{
    if(confirmDelListId!==listId){
      setConfirmDelListId(listId);
      setTimeout(()=>setConfirmDelListId(prev=>prev===listId?"":prev),4000);
      return;
    }
    setConfirmDelListId("");
    setCustomLists(CL=>CL.filter(x=>x.id!==listId));
    if(activeListId===listId)setActiveListId("all");
    toast&&toast("Đã xóa danh sách phát!");
  };

  const displayedVideos=useMemo(()=>{
    if(activeListId==="all")return lib;
    const lst=customLists.find(x=>x.id===activeListId);
    if(!lst)return lib;
    return lst.videoIds.map(vid=>lib.find(x=>x.id===vid)).filter(Boolean);
  },[lib,customLists,activeListId]);

  const saveTranscript=()=>{
    const curRawJp=edit?raw:(it?(it.raw||lines.map(l=>(l.t!=null?YTL.fmt(l.t)+" ":"")+l.text+(l.vi?" | "+l.vi:"")).join("\n")):"");
    const curRawVi=edit?rawVi:(it?(it.rawVi||lines.map(l=>l.vi||"").join("\n")):"");
    const ls=YTL.parseParallel(curRawJp,curRawVi);
    if(!ls.length)return setMsg("Không đọc được câu nào từ scripts vừa dán.");
    setLib(L=>L.map(x=>x.id===cur?{...x,lines:ls,raw:curRawJp.slice(0,60000),rawVi:curRawVi.slice(0,60000)}:x));
    setEdit(false);setSes(null);const tm=ls.filter(l=>l.t!=null).length;
    setMsg("Đã phân tích "+ls.length+" câu song song"+(tm?", "+tm+" câu có timestamp.":"."));
  };
  const patchLine=(i,p)=>setLib(L=>L.map(x=>x.id===cur?{...x,lines:x.lines.map((l,k)=>k===i?{...l,...p}:l)}:x));
  const readFile=f=>{if(!f)return;const r=new FileReader();r.onload=()=>setRaw(String(r.result||""));r.readAsText(f)};
  const explain=async i=>{
    setBusy(i);setMsg("");
    try{
      const r=await askClaude('Giải thích câu tiếng Nhật cho người Việt. Câu: "'+lines[i].text+'". Chỉ trả JSON thuần: {"vi":"dịch tiếng Việt","note":"ngữ pháp/từ vựng đáng chú ý, ngắn gọn"}.');
      patchLine(i,{ai:{vi:String(r.vi||""),note:String(r.note||"")}});
    }catch(e){setMsg(e.message)}
    setBusy(-1);
  };

  const handleTokenClick=async(tk,lineObj)=>{
    setSelectedToken(tk.text);
    const defaultNb=(notebooks[0]&&notebooks[0].id)||"";
    const defaultView=((nbViews[defaultNb]||[])[0]&&nbViews[defaultNb][0].id)||"";
    setTokenPopup({
      word:tk.text,
      furigana:tk.furigana||"",
      meaning:tk.meaning||"",
      example:lineObj?lineObj.text:"",
      exampleVi:lineObj?(lineObj.vi||(lineObj.ai&&lineObj.ai.vi)||""):"",
      nb:defaultNb,
      viewId:defaultView,
      dictLoading:true,
      dictResults:[],
      dupFound:findDup?findDup(tk.text):null
    });
    try{
      const res=await searchJP(tk.text);
      setTokenPopup(prev=>{
        if(!prev||prev.word!==tk.text)return prev;
        const top=res[0];
        return{
          ...prev,
          dictLoading:false,
          dictResults:res.slice(0,4),
          furigana:prev.furigana||(top&&top.read)||"",
          meaning:prev.meaning||(top&&top.mean)||""
        };
      });
    }catch(e){
      setTokenPopup(prev=>prev&&prev.word===tk.text?{...prev,dictLoading:false}:prev);
    }
  };

  const saveTokenToVocabAndView=async(force=false)=>{
    if(!tokenPopup)return;
    const w=tokenPopup.word.trim(),m=tokenPopup.meaning.trim();
    if(!w||!m)return setMsg("Cần nhập từ vựng và nghĩa tiếng Việt trước khi lưu.");
    const dup=findDup&&findDup(w);
    if(dup&&!force){
      setTokenPopup({...tokenPopup,dupFound:dup});
      return;
    }
    const nbId=tokenPopup.nb||(notebooks[0]&&notebooks[0].id)||"";
    await onSaveUnifiedVocab({
      word:w,
      reading:tokenPopup.furigana.trim(),
      meaning:m,
      example_jp:tokenPopup.example||"",
      example_vi:tokenPopup.exampleVi||"",
      notebookId:nbId
    },force);
    if(tokenPopup.viewId&&nbId&&onSaveNbViews){
      setTimeout(()=>{
        const latest=findDup&&findDup(w);
        if(latest){
          const curViews=nbViews[nbId]||[];
          const nextViews=curViews.map(vw=>vw.id===tokenPopup.viewId&&!vw.wordIds.includes(latest.id)?{...vw,wordIds:[...vw.wordIds,latest.id],updatedAt:new Date().toISOString()}:vw);
          onSaveNbViews({...nbViews,[nbId]:nextViews});
        }
      },350);
    }
    setTokenPopup(null);
  };

  const saveWord=async(force=false)=>{
    if(!wf.word.trim()||!wf.meaning.trim())return setMsg("Cần nhập từ và nghĩa.");
    const dup=findDup&&findDup(wf.word.trim());
    if(dup&&!force){
      setWf({...wf,dupFound:dup});
      return;
    }
    await onSaveUnifiedVocab({word:wf.word.trim(),reading:wf.reading.trim(),meaning:wf.meaning.trim(),example_jp:wf.example||"",notebookId:wf.nb||(notebooks[0]&&notebooks[0].id)||""},force);
    setWf(null);
  };
  const openWord=(word,line)=>setWf({word:word||"",reading:"",meaning:"",example:line?line.text:"",nb:(notebooks[0]&&notebooks[0].id)||"",dupFound:null});

  const startSes=(m,idxs)=>{
    stopT();if(!lines.length)return setMsg("Chưa có transcript.");
    let pool=idxs;
    if(!pool){
      pool=lines.map((l,i)=>i).filter(i=>YTL.nz(lines[i].text).length>=3);
      if(cnt<999&&pool.length>cnt){const s=pool.slice().sort(()=>Math.random()-.5).slice(0,cnt);pool=s.sort((x,y)=>x-y)}
    }
    let qs=pool.map(i=>m==="fill"?{i,b:YTL.mk(lines[i].text,nb)}:{i});
    if(m==="fill")qs=qs.filter(q=>q.b);
    if(!qs.length)return setMsg("Không tạo được câu hỏi từ transcript này.");
    setMsg("");setAns([]);setChk(null);setSes({mode:m,qs,pos:0,res:[],done:false});
  };
  const readingFor=(l,t)=>{if(!l.rb)return null;const s=l.rb.find(x=>x[1]&&x[0]===t);return s?s[1]:null};
  const check=()=>{
    if(chk||!ses)return;const q=ses.qs[ses.pos],l=lines[q.i];let r;
    if(ses.mode==="fill"){
      const targets=q.b.idx.map(k=>q.b.tk[k].s),items=targets.map((t,j)=>YTL.checkFill(ans[j]||"",t,readingFor(l,t)));
      r={ok:items.every(x=>x.ok),items,targets,user:(ans.slice(0,targets.length).map(x=>x||"")).join("・")};
    }else{
      const c=YTL.checkDict(ans[0]||"",l);r={ok:c.ok,d:c.d,note:c.note,user:ans[0]||""};
    }
    setChk(r);setSes(s=>({...s,res:[...s.res,{i:q.i,ok:r.ok,targets:r.targets,user:r.user}]}));
  };
  const finish=()=>{
    const s=ses,ok=s.res.filter(r=>r.ok).length,tot=s.res.length,P=getPrefs();
    const L=(P.ytLib||[]).map(v=>{
      if(v.id!==cur)return v;const pg=v.prog||{};
      return{...v,prog:{...pg,sessions:(pg.sessions||0)+1,last:dayKey(),best:{...(pg.best||{}),[s.mode]:Math.max((pg.best||{})[s.mode]||0,tot?Math.round(ok*100/tot):0)},hist:[...(pg.hist||[]),{m:s.mode,ok,n:tot,d:dayKey()}].slice(-20)}};
    });
    let M=(P.ytMistakes||[]).filter(m=>!(m.vid===cur&&m.mode===s.mode&&s.res.some(r=>r.ok&&r.i===m.i)));
    s.res.filter(r=>!r.ok).forEach(r=>{
      const id=cur+":"+r.i+":"+s.mode;M=M.filter(m=>m.id!==id);
      M.unshift({id,vid:cur,i:r.i,mode:s.mode,text:lines[r.i].text,vi:lines[r.i].vi||"",target:r.targets?r.targets.join("・"):"",user:r.user||"",d:dayKey()});
    });
    save({ytLib:L,ytMistakes:M.slice(0,300)});onXp&&onXp(ok>0?Math.min(5,Math.max(1,Math.round(ok/4))):0);setSes({...s,done:true});
  };
  const next=()=>{
    if(!ses)return;stopT();
    if(ses.pos+1>=ses.qs.length)return finish();
    setSes({...ses,pos:ses.pos+1});setAns([]);setChk(null);
  };
  const delMist=id=>save({ytMistakes:(getPrefs().ytMistakes||[]).filter(m=>m.id!==id)});

  const tab=(k,label,cur2,set)=>E("button",{key:k,onClick:()=>set(k),style:{...soft,backgroundColor:cur2===k?a.accent:a.accentSoft,color:cur2===k?"#fff":a.text}},label);
  const rt=(l,big)=>{
    const st={fontSize:big?20:16,lineHeight:big?2:1.9};
    if(furi&&l.rb)return E("span",{style:st},l.rb.map((s,k)=>s[1]?E("ruby",{key:k},s[0],E("rt",{style:{fontSize:"0.55em"}},s[1])):E("span",{key:k},s[0])));
    return E("span",{style:st},l.text);
  };
  const speedBar=E("div",{style:{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}},
    E("span",{style:note},"Tốc độ:"),[.5,.75,1,1.25].map(r=>E("button",{key:r,onClick:()=>setRate(r),style:{...soft,backgroundColor:rate===r?a.accent:a.accentSoft,color:rate===r?"#fff":a.text}},r+"×")));
  const noTs=lines.length>0&&!timed;
  const noTsBanner=noTs&&E("p",{style:{...note,padding:10,borderRadius:12,backgroundColor:a.accentSoft}},
    "⚠️ Transcript này không có timestamp, nên nút “Nghe câu” không phát riêng từng câu được.");
  const playBtn=i=>E("button",{onClick:()=>playSeg(i),style:btn},"▶ Nghe câu");

  const sesView=()=>{
    if(!ses)return null;
    if(ses.done){
      const ok=ses.res.filter(r=>r.ok).length,tot=ses.res.length,bad=ses.res.filter(r=>!r.ok),pc=tot?Math.round(ok*100/tot):0;
      return E("div",{style:{...card,display:"grid",gap:12}},
        E("h3",{style:{fontWeight:800,fontSize:17}},"Kết quả: "+(ses.mode==="fill"?"Nghe và điền từ":"Nghe chép chính tả")),
        E("div",{style:{display:"flex",gap:10,flexWrap:"wrap"}},
          [["Đúng",ok,"#4FB38A"],["Sai",tot-ok,"#E26B7C"],["Chính xác",pc+"%",a.accent]].map(x=>E("div",{key:x[0],style:{flex:"1 1 90px",textAlign:"center",padding:10,borderRadius:14,backgroundColor:a.accentSoft}},
            E("div",{style:{fontSize:24,fontWeight:800,color:x[2]}},x[1]),E("div",{style:note},x[0])))),
        bad.length?E("div",{style:{display:"grid",gap:8}},E("h4",{style:{fontWeight:800,fontSize:13}},"Câu trả lời sai ("+bad.length+")"),
          bad.map((r,k)=>{const l=lines[r.i];return E("div",{key:k,style:{padding:10,borderRadius:14,border:"1px solid "+a.border,display:"grid",gap:4}},
            E("div",null,rt(l)),
            ses.mode==="fill"&&E("div",{style:{fontSize:13}},"Đáp án: ",E("b",null,r.targets.join("・")),"  ·  Bạn nhập: ",E("span",{style:{color:"#E26B7C"}},r.user||"(trống)")),
            ses.mode==="dict"&&E("div",{style:{fontSize:13}},"Bạn nhập: ",E("span",{style:{color:"#E26B7C"}},r.user||"(trống)")),
            (l.vi||(l.ai&&l.ai.vi))&&E("div",{style:{fontSize:13,opacity:.85}},"🇻🇳 "+(l.vi||l.ai.vi)),
            E("div",{style:{display:"flex",gap:6,flexWrap:"wrap"}},
              E("button",{onClick:()=>playSeg(r.i),style:soft},"▶ Nghe lại"),
              ses.mode==="fill"&&r.targets.map((t,j)=>E("button",{key:j,onClick:()=>openWord(t,l),style:soft},"＋ Lưu từ 「"+t+"」"))))})):
          E("p",{style:{fontWeight:700}},"Tuyệt vời, không có câu sai!"),
        E("div",{style:{display:"flex",gap:8,flexWrap:"wrap"}},
          bad.length>0&&E("button",{onClick:()=>startSes(ses.mode,bad.map(r=>r.i)),style:btn},"Luyện lại câu sai ("+bad.length+")"),
          E("button",{onClick:()=>startSes(ses.mode),style:soft},"Bài mới"),
          E("button",{onClick:()=>setSes(null),style:soft},"Thoát")));
    }
    const q=ses.qs[ses.pos],l=lines[q.i],head=E("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}},
      E("b",{style:{fontSize:13}},"Câu "+(ses.pos+1)+"/"+ses.qs.length),
      E("div",{style:{display:"flex",gap:6}},playBtn(q.i),E("button",{onClick:()=>{setSes(null)},style:soft},"Thoát")));
    if(ses.mode==="fill"){
      const bi=new Map(q.b.idx.map((k,j)=>[k,j]));
      return E("div",{style:{...card,display:"grid",gap:12}},head,noTsBanner,
        E("div",{style:{fontSize:20,lineHeight:2.4}},q.b.tk.map((t,k)=>{
          if(!bi.has(k))return E("span",{key:k},t.s);
          const j=bi.has(k)?bi.get(k):0,r=chk&&chk.items[j];
          return E("input",{key:k,value:ans[j]||"",disabled:!!chk,autoFocus:j===0,placeholder:"＿".repeat(Math.min(t.s.length,6)),
            onChange:e=>{const n=ans.slice();n[j]=e.target.value;setAns(n)},onKeyDown:e=>{if(e.key==="Enter"&&!e.nativeEvent.isComposing){chk?next():check()}},
            style:{...inp,width:Math.max(70,t.s.length*26+30),margin:"0 4px",textAlign:"center",fontSize:18,borderColor:r?(r.ok?"#4FB38A":"#E26B7C"):a.border}});
        })),
        chk&&E("div",{style:{display:"grid",gap:4,fontSize:14}},
          E("b",{style:{color:chk.ok?"#4FB38A":"#E26B7C"}},chk.ok?"✓ Chính xác!":"✗ Chưa đúng"),
          chk.targets.map((t,j)=>E("div",{key:j},"Ô "+(j+1)+": ",E("b",null,t),chk.items[j].ok?E("span",{style:{color:"#4FB38A"}},"  ✓ "+(chk.items[j].note||"")):E("span",{style:{color:"#E26B7C"}},"  (bạn nhập: "+(ans[j]||"trống")+")"))),
          (l.vi||(l.ai&&l.ai.vi))&&E("div",{style:{opacity:.85}},"🇻🇳 "+(l.vi||l.ai.vi))),
        E("div",{style:{display:"flex",gap:8}},chk?E("button",{onClick:next,style:btn},ses.pos+1>=ses.qs.length?"Xem kết quả":"Câu tiếp ▶"):E("button",{onClick:check,style:btn},"Kiểm tra")));
    }
    return E("div",{style:{...card,display:"grid",gap:12}},head,noTsBanner,
      E("p",{style:note},"Nghe rồi gõ lại câu tiếng Nhật."),
      E("textarea",{value:ans[0]||"",disabled:!!chk,rows:2,autoFocus:true,placeholder:"Gõ câu bạn nghe được…",onChange:e=>setAns([e.target.value]),
        onKeyDown:e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();chk?next():check()}},style:{...inp,fontSize:18,resize:"vertical"}}),
      chk&&E("div",{style:{display:"grid",gap:6,fontSize:18,lineHeight:1.8}},
        E("b",{style:{fontSize:14,color:chk.ok?"#4FB38A":"#E26B7C"}},chk.ok?"✓ Chính xác! "+(chk.note||""):"✗ Độ giống: "+Math.round(chk.d.sim*100)+"%"),
        !chk.ok&&E("div",null,E("div",{style:note},"Bài của bạn:"),
          E("div",null,chk.d.U.map((x,k)=>E("span",{key:k,style:x.k==="x"?{color:"#E26B7C",textDecoration:"line-through"}:null},x.c)))),
        !chk.ok&&E("div",null,E("div",{style:note},"Đáp án:"),
          E("div",null,chk.d.T.map((x,k)=>E("span",{key:k,style:x.k==="miss"?{backgroundColor:"#FFE9A8",color:"#5A4E63",borderRadius:4,fontWeight:800}:null},x.c)))),
        E("div",{style:{fontSize:15}},rt(l)),
        (l.vi||(l.ai&&l.ai.vi))&&E("div",{style:{fontSize:13,opacity:.85}},"🇻🇳 "+(l.vi||l.ai.vi))),
      E("div",{style:{display:"flex",gap:8}},chk?E("button",{onClick:next,style:btn},ses.pos+1>=ses.qs.length?"Xem kết quả":"Câu tiếp ▶"):E("button",{onClick:check,style:btn},"Kiểm tra")));
  };

  const setupView=()=>E("div",{style:{...card,display:"grid",gap:10}},
    E("p",{style:note},mode==="fill"?"Mỗi câu ẩn ngẫu nhiên một số từ. Nghe video rồi điền từ còn thiếu.":"Phát từng câu, bạn nghe và gõ lại."),
    noTsBanner,
    E("div",{style:{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}},
      E("label",{style:note},"Số câu: ",E("select",{value:cnt,onChange:e=>setCnt(+e.target.value),style:{...inp,padding:"4px 8px"}},[5,10,20,999].map(n=>E("option",{key:n,value:n},n===999?"Tất cả":n)))),
      mode==="fill"&&E("label",{style:note},"Số chỗ trống/câu: ",E("select",{value:nb,onChange:e=>setNb(+e.target.value),style:{...inp,padding:"4px 8px"}},[1,2,3].map(n=>E("option",{key:n,value:n},n)))),
      speedBar),
    E("div",null,E("button",{onClick:()=>startSes(mode),style:btn},"Bắt đầu ▶")));

  const readView=()=>{
    const showJp=viewLayout==="both"||viewLayout==="jp_only"||viewLayout==="split";
    const showVi=viewLayout==="both"||viewLayout==="vi_only"||viewLayout==="split";

    const renderLineItem=(l,i)=>{
      const vi=l.vi||(l.ai&&l.ai.vi)||"";
      const tokens=(l.tokens&&l.tokens.length)?l.tokens:YTL.buildTokens(l.text,l.text,l.rb);
      const isLineActive=i===act;
      return E("div",{
        key:i,
        ref:el=>{lineRefs.current[i]=el},
        style:{
          display:"flex",
          gap:8,
          alignItems:"flex-start",
          padding:"8px",
          borderRadius:16,
          backgroundColor:isLineActive?a.card:"transparent",
          border:"1.5px solid "+(isLineActive?a.accent:"transparent"),
          boxShadow:isLineActive?"0 4px 14px rgba(0,0,0,0.06)":"none",
          transition:"all 0.2s ease"
        }
      },
        E("button",{
          onClick:()=>playSeg(i),
          title:l.t==null?"Chưa có timestamp":"Phát câu này",
          style:{
            ...soft,
            backgroundColor:isLineActive?a.accent:a.accentSoft,
            color:isLineActive?"#fff":a.text,
            flexShrink:0,
            opacity:l.t==null?.5:1,
            padding:"5px 9px",
            marginTop:4
          }
        },(isLineActive?"🔊 ":"▶ ")+YTL.fmt(l.t)),
        E("div",{style:{flex:1,minWidth:0}},
          E(InteractiveSentenceCard,{
            tokens,
            translation:vi,
            showJp,
            showVi,
            showFuri:furi,
            selectedWord:selectedToken,
            onSelectToken:tk=>handleTokenClick(tk,l),
            onSpeakWord:w=>speak(w,"Japanese"),
            isActive:isLineActive,
            theme:a
          }),
          showVi&&l.ai&&l.ai.note&&E("div",{style:{fontSize:12,opacity:.85,marginTop:6,padding:"6px 10px",borderRadius:10,backgroundColor:a.accentSoft,color:a.text}},"💡 "+l.ai.note)
        ),
        E("div",{style:{display:"flex",flexDirection:"column",gap:4,flexShrink:0}},
          E("button",{onClick:()=>openWord(selectedToken||"",l),title:"Lưu từ vào sổ",style:{...soft,padding:"4px 8px"}},"＋ Từ"),
          E("button",{onClick:()=>explain(i),disabled:busy===i,title:"Giải thích bằng AI",style:{...soft,padding:"4px 8px"}},busy===i?"…":"AI")
        )
      );
    };

    return E("div",{style:{display:"grid",gap:10}},
      E("div",{style:{...card,padding:12,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}},
        [
          ["both","JP + VI"],
          ["split","2 cột (JP | VI)"],
          ["jp_only","Chỉ JP"],
          ["vi_only","Chỉ VI"]
        ].map(([k,lbl])=>E("button",{
          key:k,
          onClick:()=>setViewLayout(k),
          style:{...soft,padding:"5px 10px",backgroundColor:viewLayout===k?a.accent:a.accentSoft,color:viewLayout===k?"#fff":a.text}
        },lbl)),
        E("button",{onClick:()=>setFuri(!furi),style:{...soft,padding:"5px 10px"}},furi?"Ẩn Furigana":"Hiện Furigana"),
        speedBar
      ),
      E("p",{style:{...note,paddingLeft:4}},"Video phát tới câu nào thì dòng đó sẽ tự động sáng nổi bật. Bấm vào từ bất kỳ để nghe phát âm, tra nghĩa hoặc lưu vào Sổ / View."),
      noTsBanner,
      viewLayout==="split"
        ?E("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:10}},
            E("div",{style:{...card,padding:12,display:"grid",gap:8,maxHeight:560,overflowY:"auto"}},
              E("div",{style:{fontWeight:800,fontSize:12.5,color:a.accent}},"📜 Scripts Tiếng Nhật ("+lines.length+" câu)"),
              lines.map((l,i)=>{
                const tokens=(l.tokens&&l.tokens.length)?l.tokens:YTL.buildTokens(l.text,l.text,l.rb);
                const isLineActive=i===act;
                return E("div",{key:i,ref:el=>{lineRefs.current[i]=el},style:{display:"flex",gap:6,alignItems:"flex-start"}},
                  E("button",{
                    onClick:()=>playSeg(i),
                    style:{...soft,padding:"4px 8px",backgroundColor:isLineActive?a.accent:a.accentSoft,color:isLineActive?"#fff":a.text,flexShrink:0,opacity:l.t==null?.5:1,marginTop:4}
                  },(isLineActive?"🔊 ":"▶ ")+YTL.fmt(l.t)),
                  E("div",{style:{flex:1,minWidth:0}},
                    E(InteractiveSentenceCard,{
                      tokens,
                      translation:"",
                      showJp:true,
                      showVi:false,
                      showFuri:furi,
                      selectedWord:selectedToken,
                      onSelectToken:tk=>handleTokenClick(tk,l),
                      onSpeakWord:w=>speak(w,"Japanese"),
                      isActive:isLineActive,
                      theme:a
                    })
                  )
                );
              })
            ),
            E("div",{style:{...card,padding:12,display:"grid",gap:8,maxHeight:560,overflowY:"auto"}},
              E("div",{style:{fontWeight:800,fontSize:12.5,color:a.accent}},"🇻🇳 Bản Dịch Tiếng Việt ("+lines.length+" câu)"),
              lines.map((l,i)=>{
                const vi=l.vi||(l.ai&&l.ai.vi)||"(Chưa có bản dịch)";
                const isLineActive=i===act;
                return E("div",{
                  key:i,
                  onClick:()=>playSeg(i),
                  style:{
                    backgroundColor:isLineActive?a.sidebar:a.accentSoft,
                    border:`${isLineActive?"2px":"1.5px"} solid ${isLineActive?a.accent:a.border}`,
                    borderRadius:12,
                    padding:"9px 12px",
                    color:a.text,
                    fontWeight:800,
                    fontSize:13.5,
                    cursor:"pointer",
                    transition:"all 0.2s ease"
                  }
                },E("span",{style:{fontSize:11,color:a.accent,marginRight:6}},`#${i+1}`),vi);
              })
            )
          )
        :E("div",{style:{...card,padding:12,display:"grid",gap:8,maxHeight:600,overflowY:"auto"}},lines.map(renderLineItem))
    );
  };

  const mistView=()=>E("div",{style:{...card,display:"grid",gap:8}},
    E("h3",{style:{fontWeight:800,fontSize:15}},"Sổ lỗi sai ("+mist.length+")"),
    !mist.length&&E("p",{style:note},"Chưa có câu sai nào."),
    it&&["fill","dict"].map(m=>{const ix=mist.filter(x=>x.vid===cur&&x.mode===m).map(x=>x.i).filter(i=>lines[i]);
      return ix.length?E("button",{key:m,onClick:()=>{setPanel("study");setMode(m);startSes(m,ix)},style:btn},"Luyện lại "+ix.length+" câu sai ("+(m==="fill"?"điền từ":"chính tả")+")"):null}),
    mist.map(m=>{const v=lib.find(x=>x.id===m.vid);return E("div",{key:m.id,style:{padding:10,borderRadius:14,border:"1px solid "+a.border,display:"grid",gap:3,fontSize:13}},
      E("div",{style:{fontSize:15}},m.text),
      m.target&&E("div",null,"Đáp án: ",E("b",null,m.target),"  ·  Bạn nhập: ",E("span",{style:{color:"#E26B7C"}},m.user||"(trống)")),
      m.vi&&E("div",{style:{opacity:.85}},"🇻🇳 "+m.vi),
      E("div",{style:{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}},
        E("span",{style:note},(m.mode==="fill"?"Điền từ":"Chính tả")+" · "+(v?v.title:"video đã xóa")+" · "+m.d),
        v&&m.vid!==cur&&E("button",{onClick:()=>{setCur(m.vid);setSes(null);setPanel("study")},style:soft},"Mở video"),
        E("button",{onClick:()=>delMist(m.id),style:soft},"✕ Xóa")))}));

  return E("div",{style:{maxWidth:1320,margin:"0 auto",display:"grid",gap:14}},
    tokenPopup&&E("div",{
      className:"fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4",
      onClick:e=>{if(e.target===e.currentTarget)setTokenPopup(null)}
    },E("div",{style:{...card,maxWidth:460,width:"100%",borderColor:a.accent,borderWidth:2,display:"grid",gap:10,boxShadow:"0 20px 45px rgba(0,0,0,0.22)"}},
      E("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"}},
        E("div",{style:{display:"flex",alignItems:"center",gap:8}},
          E("span",{style:{fontSize:22,fontWeight:800,color:a.accent}},tokenPopup.word),
          E("button",{onClick:()=>speak(tokenPopup.word,"Japanese"),style:soft},"🔊 Phát âm")),
        E("button",{onClick:()=>setTokenPopup(null),style:soft},"✕ Đóng")),
      tokenPopup.dictLoading&&E("p",{style:note},"Đang tra từ điển nhanh…"),
      tokenPopup.dictResults&&tokenPopup.dictResults.length>0&&E("div",{style:{display:"grid",gap:4,padding:8,borderRadius:12,backgroundColor:a.accentSoft,maxHeight:130,overflowY:"auto"}},
        E("div",{style:{fontSize:11,fontWeight:800,opacity:.75}},"Gợi ý từ điển (bấm để chọn):"),
        tokenPopup.dictResults.map((dr,idx)=>E("button",{
          key:idx,
          type:"button",
          onClick:()=>setTokenPopup(p=>({...p,furigana:dr.read||p.furigana,meaning:dr.mean||p.meaning})),
          style:{textAlign:"left",padding:"5px 8px",borderRadius:8,backgroundColor:a.card,border:"1px solid "+a.border,fontSize:12,cursor:"pointer"}
        },E("strong",null,dr.word),dr.read?` (${dr.read})`:"",": ",dr.mean))
      ),
      tokenPopup.dupFound&&E("div",{className:"p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold space-y-1.5"},
        E("div",null,`⚠️ Từ "${front(tokenPopup.dupFound)}" đã có trong kho (${tokenPopup.dupFound.meaning})!`),
        E("button",{onClick:()=>saveTokenToVocabAndView(true),className:"px-3 py-1 rounded-lg bg-amber-600 text-white font-bold"},"Vẫn thêm bản mới")),
      E("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}},
        E("input",{value:tokenPopup.word,onChange:e=>setTokenPopup({...tokenPopup,word:e.target.value,dupFound:null}),placeholder:"Từ vựng",style:inp}),
        E("input",{value:tokenPopup.furigana,onChange:e=>setTokenPopup({...tokenPopup,furigana:e.target.value}),placeholder:"Furigana (Hiragana)",style:inp})),
      E("input",{value:tokenPopup.meaning,onChange:e=>setTokenPopup({...tokenPopup,meaning:e.target.value}),placeholder:"Nghĩa tiếng Việt *",style:inp}),
      E("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}},
        E("div",null,
          E("div",{style:{fontSize:11,fontWeight:800,marginBottom:4}},"Lưu vào Sổ:"),
          E("select",{value:tokenPopup.nb,onChange:e=>{
            const nextNb=e.target.value;
            const firstVw=((nbViews[nextNb]||[])[0]&&nbViews[nextNb][0].id)||"";
            setTokenPopup({...tokenPopup,nb:nextNb,viewId:firstVw});
          },style:{...inp,width:"100%",fontSize:13}},
            notebooks.map(n=>E("option",{key:n.id,value:n.id},cleanT(n.title))),
            E("option",{value:""},"Chưa phân sổ"))),
        E("div",null,
          E("div",{style:{fontSize:11,fontWeight:800,marginBottom:4}},"Thêm vào View (tùy chọn):"),
          E("select",{value:tokenPopup.viewId,onChange:e=>setTokenPopup({...tokenPopup,viewId:e.target.value}),style:{...inp,width:"100%",fontSize:13}},
            E("option",{value:""},"-- Không chọn View --"),
            (nbViews[tokenPopup.nb]||[]).map(vw=>E("option",{key:vw.id,value:vw.id},vw.name))))),
      E("input",{value:tokenPopup.example,onChange:e=>setTokenPopup({...tokenPopup,example:e.target.value}),placeholder:"Câu ví dụ",style:{...inp,fontSize:13}}),
      E("div",{style:{display:"flex",gap:8}},
        E("button",{onClick:()=>saveTokenToVocabAndView(false),style:{...btn,flex:1}},"Lưu vào Sổ / View"),
        E("button",{onClick:()=>setTokenPopup(null),style:soft},"Hủy"))
    )),

    E("div",{style:{...card,display:"grid",gap:10}},
      E("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}},
        E("h2",{style:{fontWeight:800,fontSize:18}},"🎧 Luyện nghe từ YouTube"),
        E("button",{onClick:()=>setShowListMgr(!showListMgr),style:soft},showListMgr?"Đóng quản lý List":"📁 Quản lý List video ("+customLists.length+")")),
      E("div",{style:{display:"flex",gap:8,flexWrap:"wrap"}},
        E("input",{value:url,onChange:e=>setUrl(e.target.value),onKeyDown:e=>{if(e.key==="Enter")addVideo()},placeholder:"Dán URL YouTube (youtube.com/watch?v=… hoặc youtu.be/…)",style:{...inp,flex:"1 1 260px"}}),
        E("button",{onClick:addVideo,style:btn},"Tải & lưu video")),
      msg&&E("p",{style:{fontSize:13,color:a.accent,fontWeight:700}},msg),

      lib.length>0&&E("div",{style:{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}},
        E("button",{
          onClick:()=>setActiveListId("all"),
          style:{...soft,borderRadius:999,backgroundColor:activeListId==="all"?a.accent:a.accentSoft,color:activeListId==="all"?"#fff":a.text}
        },"Tất cả đã lưu ("+lib.length+")"),
        customLists.map(lst=>E("button",{
          key:lst.id,
          onClick:()=>setActiveListId(lst.id),
          style:{...soft,borderRadius:999,backgroundColor:activeListId===lst.id?a.accent:a.accentSoft,color:activeListId===lst.id?"#fff":a.text}
        },lst.name+" ("+lst.videoIds.filter(vid=>lib.some(x=>x.id===vid)).length+")"))
      ),

      showListMgr&&E("div",{style:{padding:12,borderRadius:16,backgroundColor:a.accentSoft,border:"1px solid "+a.border,display:"grid",gap:10}},
        E("div",{style:{display:"flex",gap:8,flexWrap:"wrap"}},
          E("input",{value:newListName,onChange:e=>setNewListName(e.target.value),onKeyDown:e=>{if(e.key==="Enter")createCustomList()},placeholder:"Tên danh sách mới (VD: Luyện nghe N2, Podcast sáng…)",style:{...inp,flex:"1 1 200px",fontSize:13}}),
          E("button",{onClick:createCustomList,style:btn},"+ Tạo List")),
        customLists.length>0&&E("div",{style:{display:"grid",gap:6}},
          customLists.map(lst=>E("div",{key:lst.id,style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:"6px 10px",borderRadius:12,backgroundColor:a.card,border:"1px solid "+a.border}},
            E("span",{style:{fontWeight:800,fontSize:13}},lst.name," (",lst.videoIds.length," video)"),
            E("div",{style:{display:"flex",gap:6,alignItems:"center"}},
              cur&&E("button",{onClick:()=>toggleVideoInList(lst.id,cur),style:soft},lst.videoIds.includes(cur)?"✓ Đã có video đang mở":"+ Thêm video đang mở"),
              E("button",{type:"button",onClick:()=>deleteCustomList(lst.id),style:{...soft,backgroundColor:confirmDelListId===lst.id?"#E11D48":a.accentSoft,color:confirmDelListId===lst.id?"#FFFFFF":"#E11D48"}},confirmDelListId===lst.id?"Xác nhận xóa?":"Xóa List"))
          ))
        )
      ),

      displayedVideos.length>0&&E("div",{style:{display:"grid",gap:6,maxHeight:200,overflowY:"auto"}},
        displayedVideos.map((v,idx)=>E("div",{
          key:v.id,
          style:{
            display:"flex",
            alignItems:"center",
            gap:6,
            padding:"6px 10px",
            borderRadius:14,
            border:"1.5px solid "+(v.id===cur?a.accent:a.border),
            backgroundColor:v.id===cur?a.accentSoft:"transparent"
          }
        },
          E("span",{style:{fontSize:11,fontWeight:800,opacity:.6,width:22}},"#"+(idx+1)),
          E("button",{
            onClick:()=>{setCur(v.id);setSes(null);setEdit(false);setRaw("");setRawVi("");setPanel("study")},
            style:{flex:1,minWidth:0,textAlign:"left",background:"none",border:0,color:a.text,fontSize:13,fontWeight:700,cursor:"pointer",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"inherit"},
            title:v.title
          },v.title+((v.prog&&v.prog.best&&Object.keys(v.prog.best).length)?" · "+Math.max(...Object.values(v.prog.best))+"%":"")),
          E("button",{
            disabled:idx===0,
            onClick:()=>moveVideoOrder(v.id,-1),
            title:"Di chuyển lên",
            style:{...soft,padding:"3px 8px",opacity:idx===0?.35:1}
          },"↑"),
          E("button",{
            disabled:idx===displayedVideos.length-1,
            onClick:()=>moveVideoOrder(v.id,1),
            title:"Di chuyển xuống",
            style:{...soft,padding:"3px 8px",opacity:idx===displayedVideos.length-1?.35:1}
          },"↓"),
          activeListId!=="all"&&E("button",{
            onClick:()=>toggleVideoInList(activeListId,v.id),
            title:"Gỡ khỏi List này",
            style:{...soft,padding:"3px 8px",fontSize:11}
          },"Gỡ"),
          E("button",{
            type:"button",
            onClick:e=>{e.stopPropagation();delVideo(v.id)},
            title:confirmDelId===v.id?"Bấm thêm lần nữa để xác nhận xóa":"Xóa vĩnh viễn khỏi thư viện",
            style:{
              ...soft,
              padding:"3px 8px",
              backgroundColor:confirmDelId===v.id?"#E11D48":a.accentSoft,
              color:confirmDelId===v.id?"#FFFFFF":"#E11D48",
              borderColor:confirmDelId===v.id?"#E11D48":a.border
            }
          },confirmDelId===v.id?"Xóa hẳn?":"✕")
        ))
      ),
      !lib.length&&E("p",{style:note},"Thư viện đang trống. Dán một URL YouTube để tải và lưu vào danh sách.")),

    it&&E("div",{className:"grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"},
      E("div",{className:"lg:col-span-5 lg:sticky lg:top-20 space-y-3"},
        E("div",{style:{...card,display:"grid",gap:8}},
          E("div",{style:{position:"relative",width:"100%",paddingTop:"56.25%",borderRadius:14,overflow:"hidden",backgroundColor:"#000"}},
            E("div",{ref:hostRef,style:{position:"absolute",inset:0}})),
          perr&&E("p",{style:{fontSize:13,color:"#E26B7C",fontWeight:700}},perr),
          slow&&!ready&&!perr&&E("p",{style:{...note,padding:10,borderRadius:12,backgroundColor:a.accentSoft}},
            "⏳ Video đang tải... ",E("button",{onClick:()=>setRetry(retry+1),style:soft},"Thử lại")),
          E("div",{style:{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap",alignItems:"center"}},
            E("b",{style:{fontSize:14}},it.title),
            E("span",{style:note},lines.length?lines.length+" câu · "+timed+" có timestamp":"Chưa có scripts"),
            E("a",{href:"https://www.youtube.com/watch?v="+cur,target:"_blank",rel:"noopener noreferrer",style:{...note,color:a.accent,fontWeight:700}},"Mở trên YouTube ↗"))
        )
      ),

      E("div",{className:"lg:col-span-7 space-y-3 min-w-0"},
        E("div",{style:{display:"flex",gap:6,flexWrap:"wrap"}},
          tab("study","Luyện tập",panel,setPanel),
          tab("tr","Scripts & Bản dịch",panel,setPanel),
          tab("mist","Sổ lỗi sai"+(mist.length?" ("+mist.length+")":""),panel,setPanel)
        ),

        panel==="tr"&&E("div",{style:{...card,display:"grid",gap:10}},
          E("p",{style:note},"Nhập Scripts tiếng Nhật (hỗ trợ Furigana dạng 踊(おど) hoặc 鍋《なべ》, timestamp 0:12) và điền Bản dịch tiếng Việt song song từng dòng ở khung bên cạnh (hoặc ngăn cách bằng dấu |)."),
          E("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:10}},
            E("div",{style:{display:"grid",gap:4}},
              E("label",{style:{fontSize:12,fontWeight:800}},"1. Scripts tiếng Nhật (JP):"),
              E("textarea",{
                value:edit?raw:(lines.length?(it.raw||lines.map(l=>(l.t!=null?YTL.fmt(l.t)+" ":"")+l.text).join("\n")):""),
                rows:10,
                onChange:e=>{
                  if(!edit){
                    setRaw(e.target.value);
                    setRawVi(it?(it.rawVi||lines.map(l=>l.vi||"").join("\n")):"");
                    setEdit(true);
                  }else setRaw(e.target.value);
                },
                placeholder:"Ví dụ:\n0:05 でも今日(きょう)は鍋(なべ)を食(た)べます。\n0:10 一緒(いっしょ)に踊(おど)りましょう！",
                style:{...inp,fontSize:14,resize:"vertical",fontFamily:"inherit"}
              })
            ),
            E("div",{style:{display:"grid",gap:4}},
              E("label",{style:{fontSize:12,fontWeight:800}},"2. Bản dịch song song tiếng Việt (VI):"),
              E("textarea",{
                value:edit?rawVi:(lines.length?(it.rawVi||lines.map(l=>l.vi||"").join("\n")):""),
                rows:10,
                onChange:e=>{
                  if(!edit){
                    setRaw(it?(it.raw||lines.map(l=>(l.t!=null?YTL.fmt(l.t)+" ":"")+l.text).join("\n")):"");
                    setRawVi(e.target.value);
                    setEdit(true);
                  }else setRawVi(e.target.value);
                },
                placeholder:"Nhập bản dịch tương ứng từng dòng:\nNhưng hôm nay tôi sẽ ăn lẩu.\nHãy cùng nhau nhảy múa nào!",
                style:{...inp,fontSize:14,resize:"vertical",fontFamily:"inherit"}
              })
            )
          ),
          E("div",{style:{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}},
            E("button",{onClick:saveTranscript,style:btn},"Phân tích & lưu Scripts song song"),
            E("label",{style:{...soft,display:"inline-block"}},"Nạp file .srt/.vtt/.txt",E("input",{type:"file",accept:".srt,.vtt,.txt",style:{display:"none"},onChange:e=>{readFile(e.target.files[0]);setEdit(true)}}))
          )
        ),

        panel==="mist"&&mistView(),

        panel==="study"&&(!lines.length
          ?E("div",{style:{...card,...note}},"Video này chưa có scripts. Vào tab “Scripts & Bản dịch” ở bên trên để nhập scripts và bản dịch song song.")
          :E("div",{style:{display:"grid",gap:10}},
              !ses&&E("div",{style:{display:"flex",gap:6,flexWrap:"wrap"}},
                tab("read","Nghe & xem Scripts tách từ",mode,setMode),
                tab("fill","Nghe & điền từ",mode,setMode),
                tab("dict","Nghe chép chính tả",mode,setMode)
              ),
              ses?sesView():(mode==="read"?readView():setupView())
            )
        )
      )
    ),

    wf&&E("div",{style:{...card,display:"grid",gap:8,borderColor:a.accent}},
      E("b",{style:{fontSize:14}},"＋ Lưu từ mới vào Kho từ vựng thống nhất"),
      wf.dupFound&&E("div",{className:"p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold space-y-1.5"},
        E("div",null,`⚠️ Cảnh báo: Từ "${front(wf.dupFound)}" đã có trong kho từ vựng (${wf.dupFound.meaning})!`),
        E("div",{className:"flex gap-2"},
          E("button",{onClick:()=>saveWord(true),className:"px-3 py-1 rounded-lg bg-amber-600 text-white font-bold"},"Vẫn thêm bản mới"),
          E("button",{onClick:()=>setWf(null),className:"px-3 py-1 rounded-lg bg-white border font-bold"},"Hủy"))),
      E("div",{style:{display:"flex",gap:8,flexWrap:"wrap"}},
        E("select",{value:wf.nb||"",onChange:e=>setWf({...wf,nb:e.target.value}),style:{...inp,flex:"1 1 140px"}},notebooks.map(n=>E("option",{key:n.id,value:n.id},cleanT(n.title))),E("option",{value:""},"Chưa phân sổ")),
        E("input",{value:wf.word,onChange:e=>setWf({...wf,word:e.target.value,dupFound:null}),placeholder:"Từ",style:{...inp,flex:"1 1 120px"}}),
        E("input",{value:wf.reading,onChange:e=>setWf({...wf,reading:e.target.value}),placeholder:"Cách đọc",style:{...inp,flex:"1 1 120px"}}),
        E("input",{value:wf.meaning,onChange:e=>setWf({...wf,meaning:e.target.value}),placeholder:"Nghĩa tiếng Việt",style:{...inp,flex:"2 1 180px"}})),
      E("input",{value:wf.example,onChange:e=>setWf({...wf,example:e.target.value}),placeholder:"Câu ví dụ",style:inp}),
      E("div",{style:{display:"flex",gap:8}},E("button",{onClick:()=>saveWord(false),style:btn},"Lưu từ vựng"),E("button",{onClick:()=>setWf(null),style:soft},"Hủy"))));
  };
}
