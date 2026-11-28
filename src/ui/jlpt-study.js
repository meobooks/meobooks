// Màn học JLPT (Study), chuyển từ public/legacy/index.html (JLPT bước 4).
// Phụ thuộc của app cũ được truyền vào qua makeJlptStudy; JCard và JLoading lấy từ shared.js.
import React, { useEffect, useRef, useState } from 'react';
import { JCard, JLoading } from './shared.js';

export function makeJlptStudy(deps) {
  const { CL_BG, MODES, isMC, buildQ, byNewest, classOf, dayKey, exactOk, lenientOk, mochiConfirm, nbOf, speak, meoFeat } = deps;
  return function JlptStudy({jl:o,theme:a,notebooks:nbs=[],nbViews={},onSaveNbViews=()=>{},reviewDone:rdDay="",onReviewDone:setRd=()=>{},stats:vs={},onXp=()=>{}}){
  const E=React.createElement;
  const loadSess=()=>{try{const s=window.meobooksServices.localStore.getSmartSession();return s&&Array.isArray(s.queue)&&s.queue.length?s:null}catch(x){return null}};
  const[sess,setSess]=useState(loadSess),[inS,setInS]=useState(false),[src,setSrc]=useState("due"),[sum,setSum]=useState(null);
  const[openNb,setOpenNb]=useState({}),[viewForm,setViewForm]=useState(null),[fcViewer,setFcViewer]=useState(null);
  const kref=useRef({on:false}),inpRef=useRef(null),qCache=useRef({key:"",N:null}),[,setTick]=useState(0);

  /* Nghỉ ngắn (REST_MS) sau mỗi câu trả lời, không hiển thị trên giao diện */
  const REST_MS=500;
  const restLeft=ss=>ss&&ss.answeredAt?Math.max(0,REST_MS-(Date.now()-ss.answeredAt)):0;
  useEffect(()=>{
    if(!sess||!sess.answeredAt)return;
    const stamp=sess.answeredAt,auto=!!sess.answeredOk;
    const left=restLeft(sess);
    if(left<=0&&!auto)return;
    const t=setTimeout(()=>{
      setTick(x=>x+1);
      // Trả lời đúng: tự chuyển sang câu tiếp theo sau khoảng nghỉ
      const k=kref.current;
      if(auto&&k&&k.on&&k.V&&k.stamp===stamp&&k.next)k.next();
    },Math.max(left,0)+30);
    return()=>clearTimeout(t);
  },[sess&&sess.answeredAt]);

  useEffect(()=>{try{if(sess)window.meobooksServices.localStore.setSmartSession(sess);else window.meobooksServices.localStore.clearSmartSession()}catch(x){}},[sess]);

  useEffect(()=>{
    const h=ev=>{
      if(fcViewer){
        if(ev.code==="Space"){ev.preventDefault();setFcViewer(f=>({...f,flipped:!f.flipped}))}
        else if(ev.key==="ArrowRight"){ev.preventDefault();setFcViewer(f=>({...f,idx:(f.idx+1)%f.words.length,flipped:!1}))}
        else if(ev.key==="ArrowLeft"){ev.preventDefault();setFcViewer(f=>({...f,idx:(f.idx-1+f.words.length)%f.words.length,flipped:!1}))}
        else if(ev.key==="s"||ev.key==="S"){const w=fcViewer.words[fcViewer.idx];w&&speak(front(w),langOfWord(w,nbs))}
        return;
      }
      const k=kref.current;if(!k.on||ev.repeat)return;
      if(ev.key==="Enter"){
        if(k.V){ev.preventDefault();k.V=false;k.next()}
        return;
      }
      const tg=ev.target&&ev.target.tagName;
      if(!k.V&&k.opts&&/^[1-4]$/.test(ev.key)&&tg!=="INPUT"&&tg!=="TEXTAREA"){
        const x=k.opts[+ev.key-1];if(x!==undefined){ev.preventDefault();k.pick(x)}
      }
    };
    addEventListener("keydown",h);return()=>removeEventListener("keydown",h);
  },[fcViewer]);

  useEffect(()=>{
    if(!inS||!sess)return;
    const item=sess.queue[sess.qi];
    if(!item)return;
    const mode=item.steps[item.si];
    if(isMC(mode)){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}
    else{const el=inpRef.current;if(el&&!el.disabled)el.focus()}
  },[inS,sess&&sess.qi,sess&&sess.queue&&sess.queue[sess.qi]&&sess.queue[sess.qi].si]);

  if(!o.ready)return E(JLoading,{theme:a});
  kref.current={on:false};
  const today=dayKey();
  const M={borderColor:a.border,backgroundColor:a.card,color:a.text};
  const due=N=>meoFeat.studySession.isDue(N,o.srs,today);
  const cd=v=>{const d=new Date(v.created_at||0);return isNaN(d)?"":dayKey(d)};
  const known=new Set(nbs.map(n=>n.id));
  const groups=[...nbs.map(n=>({id:n.id,title:n.title,color:n.color})),{id:"_",title:"Chưa phân sổ",color:a.accentSoft}];
  const inG=(v,g)=>g.id==="_"?!known.has(nbOf(v)):nbOf(v)===g.id;
  const nbName=id=>{const g=groups.find(x=>x.id===id);return g?cleanT(g.title):""};
  const allWords=o.vocab.slice().sort(byNewest);

  /*
   * THUẬT TOÁN HỌC BÀI THÔNG MINH & NGẮT QUÃNG:
   * - Lần 1 (attempt = 1): 5 bước đầy đủ:
   *   ["jp_to_vi", "vi_to_jp", "type_reading", "type_meaning", "type_word"]
   * - Nếu sai bất kỳ bước nào trong 5 bước -> đánh dấu failedThisRound = true.
   * - Sau khi đi hết các vòng của tất cả từ vựng trong đợt hiện tại, các từ bị sai sẽ quay lại học lại từ đầu ở đợt kế tiếp (attempt = 2):
   *   Bắt đầu lại từ 5 bước: ["jp_to_vi", "vi_to_jp", "type_reading", "type_meaning", "type_word"].
   *   Theo dõi riêng 3 bài kiểm tra tự luận (testAllCorrect).
   * - Nếu ở lần 2 (attempt >= 2), học viên điền đúng cả 3 bài kiểm tra tự luận (hoặc vừa hoàn tất 3 bài kiểm tra đúng mà trước đó ở lần 2 đã trắc nghiệm đúng), chỉ cần thêm 1 lần chọn Nhật -> Việt và 1 lần Việt -> Nhật ("reinforce_mc") nữa là hoàn thành!
   */
  const FULL_STEPS=meoFeat.smartSession.FULL_STEPS;
  const REINFORCE_STEPS=["jp_to_vi","vi_to_jp"];

  const makeInitialQueue=(words,maxCount=12)=>meoFeat.smartSession.makeInitialQueue(words,{vs,srs:o.srs},maxCount);

  const guard=()=>{if(sess)o.toast("Đã thay buổi học dở bằng buổi mới");return true};

  const shuffleArr=meoFeat.smartSession.shuffleArr;

  /* Trộn câu hỏi: mỗi lượt gồm `size` từ, mọi câu hỏi của các từ đó được xáo lẫn vào nhau,
     nhưng với từng từ vẫn giữ đúng thứ tự bước (chọn đáp án trước, điền sau). */
  const buildPlan=meoFeat.smartSession.buildPlan;

  const startSmartSession=(title,words,kind="smart",maxCount=12,shuffle=false,mixSize=0,viewRef=null)=>{
    if(!guard())return;
    if(!words.length)return o.toast("Không có từ vựng nào để học!");
    const sess0=meoFeat.studySession.buildSmartSession({kind,title,viewRef,words,maxCount,shuffle,mixSize,ctx:{vs,srs:o.srs}});
    setSum(null);
    setSess(sess0);
    setInS(true);
  };

  const startNotebook=scope=>{
    const pool=(src==="due"?o.vocab.filter(due):o.vocab).filter(v=>!scope||inG(v,{id:scope}));
    if(!pool.length)return o.toast(src==="due"?'Hôm nay không còn từ đến hạn trong sổ này! Chọn "Tất cả từ" để luyện thêm.':"Sổ này chưa có từ vựng nào!");
    startSmartSession("Meown · "+(scope?nbName(scope):"Tất cả sổ"),pool,"meow",10);
  };

  /* Chế độ LƯỚT: mỗi nhóm 5 từ liên tiếp, chỉ chọn đáp án Nhật→Việt & Việt→Nhật (các câu xáo lẫn nhau),
     xong nhóm nào tự chuyển sang 5 từ kế tiếp trong view/sổ đang học. */
  const startSkim=(title,words,viewRef=null)=>{
    if(!guard())return;
    if(!words.length)return o.toast("Không có từ vựng nào để lướt!");
    const sess0=meoFeat.studySession.buildSkimSession({title,words,viewRef});
    setSum(null);
    setSess(sess0);
    setInS(true);
  };

  /* Tiến độ học của từng View: các từ đã học xong được lưu trong view.doneIds.
     Thêm từ mới vào View thì lần học sau chỉ học từ mới; muốn học lại tất cả thì bấm "Học lại từ đầu". */
  const viewProgress=view=>meoFeat.studySession.viewProgress(view,o.vocab);

  const resolveViewWords=view=>{
    const{all,pending,doneN}=viewProgress(view);
    if(!all.length){o.toast("View này chưa có từ vựng nào!");return null}
    if(!pending.length){o.toast('Đã học xong toàn bộ View này! Bấm "Học lại từ đầu" nếu muốn học lại.');return null}
    if(doneN>0)o.toast(`Học ${pending.length} từ mới thêm vào View (đã học ${doneN} từ trước đó)`);
    return pending;
  };

  /* Lướt luôn bắt đầu lại từ đầu View (tất cả từ), không ghi tiến độ; tiến độ Học bài tách riêng */
  const startViewSkim=(nbId,view)=>{
    const words=view.wordIds.map(id=>o.vocab.find(v=>v.id===id)).filter(Boolean);
    if(!words.length)return o.toast("View này chưa có từ vựng nào!");
    startSkim(`${nbName(nbId)} · ${view.name} · Lướt`,words,null);
  };

  /* Bắt đầu học lại TOÀN BỘ từ của View từ đầu: xóa tiến độ cũ rồi mở ngay buổi học mới (không phụ thuộc confirm()) */
  const restartViewStudy=(nbId,view)=>{
    const words=view.wordIds.map(id=>o.vocab.find(v=>v.id===id)).filter(Boolean);
    if(!words.length)return o.toast("View này chưa có từ vựng nào!");
    onSaveNbViews({...nbViews,[nbId]:(nbViews[nbId]||[]).map(v=>v.id===view.id?{...v,doneIds:[],updatedAt:new Date().toISOString()}:v)});
    o.toast("Đã đặt lại tiến độ — học lại View từ đầu");
    startSmartSession(`${nbName(nbId)} · ${view.name}`,words,"view",words.length,false,0,{nbId,viewId:view.id});
  };

  const startViewStudy=(nbId,view)=>{
    const{all,pending}=viewProgress(view);
    if(!all.length)return o.toast("View này chưa có từ vựng nào!");
    // Đã học xong hết -> bấm "Học bài" sẽ tự học lại từ đầu thay vì chỉ báo thông báo
    if(!pending.length)return restartViewStudy(nbId,view);
    const words=resolveViewWords(view);
    if(!words)return;
    startSmartSession(`${nbName(nbId)} · ${view.name}`,words,"view",words.length,false,0,{nbId,viewId:view.id});
  };

  const resetViewProgress=(nbId,view)=>restartViewStudy(nbId,view);

  const startViewFlashcard=(nbId,view)=>{
    const words=o.vocab.filter(v=>view.wordIds.includes(v.id));
    if(!words.length)return o.toast("View này chưa có từ vựng nào!");
    setFcViewer({nbId,viewName:view.name,words,idx:0,flipped:!1});
  };

  const startReview=()=>{
    const pool=meoFeat.smartSession.pickReviewPool({vocab:o.vocab,srs:o.srs,today,limit:8});
    if(!pool.length)return o.toast("Chưa có từ vựng nào để ôn nhanh!");
    startSmartSession("Ôn nhanh thông minh",pool,"review",8);
  };

  const finishWholeSession=async(s,finalRes,complete=true)=>{
    const okCount=finalRes.filter(r=>r.correct).length;
    const exp=await o.finishSession({mode:"smart_5step",score:okCount,total:finalRes.length,responses:finalRes});
    if(s.kind==="review")setRd(today);
    if(complete&&s.viewRef&&s.src){
      const{nbId,viewId}=s.viewRef;
      onSaveNbViews({...nbViews,[nbId]:(nbViews[nbId]||[]).map(v=>v.id===viewId?{...v,doneIds:Array.from(new Set([...(v.doneIds||[]),...s.src])),updatedAt:new Date().toISOString()}:v)});
    }
    setSum({title:s.title,score:okCount,total:finalRes.length,exp,kind:s.kind,src:s.src,maxCount:s.maxCount});if(complete)window.dispatchEvent(new CustomEvent("mochi:celebrate"));
    setSess(null);
    setInS(false);
  };

  const handleStepAnswer=(isCorrect,ansText,qObj)=>{
    o.reviewCard(qObj.v.id,isCorrect?4:1);
    const curItem=sess.queue[sess.qi];
    const mode=curItem.steps[curItem.si];
    const updatedItem=meoFeat.studyFlow.markAnswer(curItem,mode,isCorrect);
    const nextQueue=sess.queue.map((it,idx)=>idx===sess.qi?updatedItem:it);
    setSess(s=>({
      ...s,
      queue:nextQueue,
      picked:isMC(mode)?ansText:s.picked,
      checked:!isMC(mode)?isCorrect:s.checked,
      answeredOk:!!isCorrect,
      answeredAt:Date.now()
    }));
  };

  const advanceStep=async()=>{
    const s=sess;
    if(restLeft(s)>0)return; // đang trong khoảng nghỉ sau câu trả lời
    const curItem=s.queue[s.qi];
    const mode=curItem.steps[curItem.si];
    const cachedQ=qCache.current.N;
    const qObj=(cachedQ&&cachedQ.v&&cachedQ.v.id===curItem.vocabId&&cachedQ.mode===mode)?cachedQ:buildQ(mode,o.vocab.find(x=>x.id===curItem.vocabId)||o.vocab[0],o.vocab);
    const isOk=isMC(mode)?s.picked===qObj.correct:!!s.checked;
    const rec={vocab_id:curItem.vocabId,question:qObj.prompt,answer:isMC(mode)?s.picked:s.typed,correct:isOk};
    const newRes=[...s.res,rec];

    // Kiểm tra xem từ hiện tại đã đi hết các bước trong lượt này chưa
    const nextSi=curItem.si+1;
    let nextFailedList=[...s.nextRoundFailed];
    let queueCopy=[...s.queue];

    if(nextSi<curItem.steps.length){
      // Vẫn còn bước tiếp theo cho từ này trong lượt hiện tại
      queueCopy[s.qi]={...curItem,si:nextSi};
    }else{
      // Đã đi hết các bước của từ này trong lượt: đưa vào vòng lặp lại nếu cần
      const retry=meoFeat.studyFlow.retryItemOf(curItem);
      if(retry)nextFailedList.push(retry);
    }

    // Chế độ trộn câu hỏi: đi theo kế hoạch đã xáo thay vì lần lượt từng từ
    // Lưu tiến độ ngay khi từ này đã qua hết các bước mà không bị đưa vào vòng lặp lại
    if(s.viewRef && nextSi>=curItem.steps.length && nextFailedList.length===s.nextRoundFailed.length){
      const {nbId:vNb, viewId:vId}=s.viewRef;
      onSaveNbViews({...nbViews,[vNb]:(nbViews[vNb]||[]).map(v=>v.id===vId?{...v,doneIds:Array.from(new Set([...(v.doneIds||[]),curItem.vocabId])),updatedAt:new Date().toISOString()}:v)});
    }
    if(s.mix){
      const np=s.pi+1;
      if(np<s.plan.length){
        setSess({...s,queue:queueCopy,pi:np,qi:s.plan[np],res:newRes,picked:null,typed:"",checked:null});
        return;
      }
      if(nextFailedList.length>0){
        const rc=nextFailedList.filter(x=>x.stage==="reinforce").length;
        const fc=nextFailedList.filter(x=>x.stage==="full").length;
        const notice2=s.kind==="skim"?`Vòng ${s.round+1}: Lướt lại ${nextFailedList.length} từ chọn sai`:`Vòng ${s.round+1}: Ôn lại ${nextFailedList.length} từ (${fc?fc+" từ học lại từ đầu 5 bước":""}${fc&&rc?", ":""}${rc?rc+" từ chỉ cần chọn Nhật↔Việt":""})`;
        const plan2=buildPlan(nextFailedList,s.mixSize||5);
        setSess({...s,round:s.round+1,queue:nextFailedList,plan:plan2,pi:0,qi:plan2[0],nextRoundFailed:[],res:newRes,picked:null,typed:"",checked:null,requeueNotice:notice2});
        return;
      }
      await finishWholeSession(s,newRes);
      return;
    }

    // Chuyển sang từ tiếp theo trong hàng đợi hiện tại, hoặc chuyển sang vòng lặp lại từ sai
    if(nextSi<curItem.steps.length){
      setSess({...s,queue:queueCopy,res:newRes,picked:null,typed:"",checked:null});
    }else if(s.qi+1<s.queue.length){
      setSess({...s,queue:queueCopy,qi:s.qi+1,res:newRes,picked:null,typed:"",checked:null});
    }else if(nextFailedList.length>0){
      // Đi hết các vòng của các từ vựng -> quay lại học lại các từ bị sai / cần củng cố
      const reinCount=nextFailedList.filter(x=>x.stage==="reinforce").length;
      const fullCount=nextFailedList.filter(x=>x.stage==="full").length;
      const notice=`Vòng ${s.round + 1}: Ôn lại ${nextFailedList.length} từ (${fullCount ? fullCount + " từ học lại từ đầu 5 bước" : ""}${fullCount && reinCount ? ", " : ""}${reinCount ? reinCount + " từ chỉ cần chọn Nhật↔Việt" : ""})`;
      setSess({
        ...s,
        round:s.round+1,
        queue:nextFailedList,
        qi:0,
        nextRoundFailed:[],
        res:newRes,
        picked:null,
        typed:"",
        checked:null,
        requeueNotice:notice
      });
    }else{
      await finishWholeSession(s,newRes);
    }
  };

  const pause=()=>{kref.current={...kref.current,on:false};setInS(false)};
  const endAll=async()=>{
    if(!sess)return;
    if(!(await mochiConfirm("Kết thúc buổi học? Tiến độ các câu đã làm sẽ được lưu.")))return;
    await finishWholeSession(sess,sess.res,false);
  };

  /* ----- Quản lý View riêng biệt trong từng sổ Notebook ----- */
  const saveViewForNb=()=>{
    if(!viewForm)return;
    const{nbId,editId,name,wordIds}=viewForm;
    const nm=name.trim();
    if(!nm)return o.toast("Nhập tên View trước nhé!");
    if(!wordIds.length)return o.toast("Chọn ít nhất 1 từ vựng cho View!");
    const curList=nbViews[nbId]||[];

    const nowIso=new Date().toISOString();
    const nextList=editId
      ?curList.map(v=>v.id===editId?{...v,name:nm,wordIds,updatedAt:nowIso}:v)
      :[...curList,{id:"view-"+Date.now(),name:nm,wordIds,updatedAt:nowIso}];
    onSaveNbViews({...nbViews,[nbId]:nextList});
    setViewForm(null);
    o.toast(editId?"Đã cập nhật View!":"Đã tạo View mới cho sổ!");
  };

  const deleteViewForNb=async(nbId,view)=>{
    if(!(await mochiConfirm(`Xóa view "${view.name}"? Các từ vựng vẫn được giữ nguyên trong sổ.`)))return;
    const nextList=(nbViews[nbId]||[]).filter(v=>v.id!==view.id);
    onSaveNbViews({...nbViews,[nbId]:nextList});
    o.toast("Đã xóa View");
  };

  /* ----- Màn hình xem Flashcard trực tiếp từ View của sổ ----- */
  if(fcViewer){
    const w=fcViewer.words[fcViewer.idx%fcViewer.words.length];
    return E("div",{className:"max-w-xl mx-auto space-y-4 fade-in"},
      E("div",{className:"flex items-center justify-between gap-2"},
        E("button",{onClick:()=>setFcViewer(null),style:{backgroundColor:a.accentSoft,color:a.text},className:"tap-fx px-3.5 py-2 rounded-xl text-xs font-extrabold"},"← Quay lại Meown"),
        E("span",{className:"text-xs font-extrabold px-3 py-1 rounded-full",style:{backgroundColor:a.accentSoft}},`${nbName(fcViewer.nbId)} · ${fcViewer.viewName} (${fcViewer.idx+1}/${fcViewer.words.length})`),
        E("button",{onClick:()=>{const words=fcViewer.words,title=`${nbName(fcViewer.nbId)} · ${fcViewer.viewName}`;setFcViewer(null);startSmartSession(title,words,"view",words.length)},style:{backgroundColor:a.accent},className:"tap-fx px-3.5 py-2 rounded-xl text-white text-xs font-extrabold"},"Chuyển sang Học bài ▶")),
      E("div",{onClick:()=>setFcViewer(f=>({...f,flipped:!f.flipped})),style:{backgroundColor:a.card,borderColor:a.accent},className:"tap-fx h-72 rounded-3xl border-2 p-8 shadow-xl flex flex-col items-center justify-center text-center cursor-pointer relative"},
        E("span",{className:"absolute top-4 left-5 text-xs font-bold opacity-60"},"Flashcard View"),
        E("span",{className:"absolute top-4 right-5 text-xs font-bold px-2.5 py-0.5 rounded-full",style:{backgroundColor:a.accentSoft}},fcViewer.flipped?"Mặt sau (Nghĩa)":"Bấm / Space để lật"),
        fcViewer.flipped
          ?E("div",{className:"space-y-2"},
              E("h3",{className:"text-2xl font-extrabold",style:{color:a.accent}},w.meaning),
              w.sino_viet&&E("p",{className:"text-xs font-bold opacity-75"},"Hán Việt: "+w.sino_viet),
              w.example_jp&&E("p",{className:"text-sm italic opacity-80 mt-2"},'"',w.example_jp,'"',w.example_vi?` — ${w.example_vi}`:""))
          :E("div",{className:"space-y-2"},
              E("h3",{className:"text-4xl font-extrabold"},front(w)),
              w.reading&&w.reading!==front(w)&&E("p",{className:"text-lg opacity-75"},w.reading),
              E("button",{onClick:ev=>{ev.stopPropagation();speak(front(w),langOfWord(w,nbs))},style:{backgroundColor:a.accentSoft},className:"tap-fx mt-2 px-3 py-1.5 rounded-xl text-xs font-bold"},"Nghe phát âm (S)"))),
      E("div",{className:"flex items-center justify-between gap-3"},
        E("button",{onClick:()=>setFcViewer(f=>({...f,idx:(f.idx-1+f.words.length)%f.words.length,flipped:!1})),style:{backgroundColor:a.accentSoft,color:a.text},className:"tap-fx flex-1 py-3 rounded-2xl text-xs font-extrabold"},"◀ Thẻ trước"),
        E("button",{onClick:()=>{o.reviewCard(w.id,4);onXp(1,{k:"cards",n:1});setFcViewer(f=>({...f,idx:(f.idx+1)%f.words.length,flipped:!1}))},style:{backgroundColor:"#D1FAE5",color:"#065F46"},className:"tap-fx flex-1 py-3 rounded-2xl text-xs font-extrabold"},"Đã nhớ (+1 XP) →"),
        E("button",{onClick:()=>setFcViewer(f=>({...f,idx:(f.idx+1)%f.words.length,flipped:!1})),style:{backgroundColor:a.accentSoft,color:a.text},className:"tap-fx flex-1 py-3 rounded-2xl text-xs font-extrabold"},"Thẻ sau ▶")));
  }

  /* ----- Màn hình danh sách Sổ Meown & View riêng biệt ----- */
  if(!inS||!sess){
    const reviewedToday=rdDay===today;
    const dueAll=o.vocab.filter(due).length;
    const cnt={tough:0,learn:0,known:0};o.vocab.forEach(v=>{cnt[classOf(vs,v,o.srs)]++});
    const startTough=()=>{
      const pool=o.vocab.filter(v=>classOf(vs,v,o.srs)==="tough");
      if(!pool.length)return o.toast("Chưa có từ nào bị đánh dấu hay sai. Tuyệt vời!");
      startSmartSession("Luyện từ hay sai (5 bước)",pool,"tough",10);
    };

    return E("div",{className:"max-w-3xl mx-auto space-y-4"},
      E("div",{className:"flex flex-wrap items-center justify-between gap-2"},
        E("div",null,
          E("h2",{className:"text-xl font-extrabold"},"Học bài (Meown — Ngắt quãng & Thông minh)"),
          E("p",{className:"text-xs opacity-75"},"Mỗi từ trải qua 2 bước chọn đáp án (Nhật↔Việt) + 3 bước kiểm tra (Cách đọc, Nghĩa, Từ tiếng Nhật). Sai sẽ quay lại học từ đầu!")),
        E("button",{onClick:startReview,style:{backgroundColor:a.accent},className:"tap-fx px-4 py-2 rounded-xl text-white text-xs font-bold"},reviewedToday?"Ôn nhanh thêm ▶":"Ôn nhanh hôm nay ▶")),

      sum&&E(JCard,{theme:a,className:"flex flex-wrap items-center gap-2 text-sm font-bold",style:{backgroundColor:a.accentSoft}},
        E("span",{className:"flex-1"},`Hoàn thành buổi học (${sum.title}): Đúng ${sum.score}/${sum.total} lượt · +${sum.exp||0} EXP`),
        sum.kind==="skim"&&sum.src&&sum.src.length>0&&E("button",{onClick:()=>{const words=sum.src.map(id=>o.vocab.find(v=>v.id===id)).filter(Boolean);startSkim(sum.title,words)},style:{backgroundColor:a.accent},className:"tap-fx px-3 py-1.5 rounded-xl text-white text-xs font-extrabold"},"Lướt lại ▶"),
        sum.kind!=="skim"&&sum.src&&sum.src.length>0&&E("button",{onClick:()=>{const words=o.vocab.filter(v=>sum.src.includes(v.id));startSmartSession(sum.title,words,sum.kind||"smart",sum.maxCount||words.length,true,5)},style:{backgroundColor:a.accent},className:"tap-fx px-3 py-1.5 rounded-xl text-white text-xs font-extrabold"},"Học tiếp: trộn mỗi 5 từ ▶"),
        sum.kind!=="skim"&&sum.src&&sum.src.length>0&&E("button",{onClick:()=>{const words=o.vocab.filter(v=>sum.src.includes(v.id));startSmartSession(sum.title,words,sum.kind||"smart",sum.maxCount||words.length,true,9999)},style:{backgroundColor:a.accent},className:"tap-fx px-3 py-1.5 rounded-xl text-white text-xs font-extrabold"},"Học tiếp: trộn toàn bộ ▶"),
        E("button",{onClick:()=>setSum(null),className:"text-xs opacity-70"},"✕")),

      sess&&E(JCard,{theme:a,className:"space-y-2 border-2",style:{borderColor:a.accent}},
        E("div",{className:"flex items-center justify-between"},
          E("p",{className:"text-sm font-extrabold"},"Đang học dở: ",sess.title," (Vòng ",sess.round,")"),
          E("button",{onClick:async()=>{if(await mochiConfirm("Hủy buổi học đang dở?"))setSess(null)},className:"text-xs text-rose-500 font-bold"},"Hủy buổi")),
        E("button",{onClick:()=>setInS(true),style:{backgroundColor:a.accent},className:"tap-fx w-full py-2.5 rounded-xl text-white text-sm font-bold"},"Tiếp tục học bài từ chỗ dừng ▶")),

      E(JCard,{theme:a,className:"space-y-3"},
        E("div",{className:"flex flex-wrap items-center justify-between gap-2"},
          E("div",{className:"font-extrabold text-sm"},"Trạng thái từ vựng toàn hệ thống (",dueAll," đến hạn)"),
          E("div",{className:"flex gap-1.5 text-xs font-bold"},
            [["due","Ưu tiên đến hạn"],["all","Tất cả từ"]].map(([k,l])=>E("button",{key:k,onClick:()=>setSrc(k),style:{backgroundColor:src===k?a.accent:a.accentSoft,color:src===k?"#fff":a.text},className:"tap-fx px-3 py-1 rounded-full"},l)))),
        E("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8},className:"text-center"},
          [["tough","Hay sai"],["learn","Chưa thuộc"],["known","Đã thuộc"]].map(([k,l])=>E("div",{key:k,className:"p-2.5 rounded-2xl",style:{backgroundColor:CL_BG[k],color:"#4A3F5C"}},
            E("div",{className:"text-lg font-extrabold"},cnt[k]),
            E("div",{className:"text-[11px] font-bold"},l)))),
        cnt.tough>0&&E("button",{onClick:startTough,style:{backgroundColor:a.accentSoft,color:a.text},className:"tap-fx w-full py-2 rounded-xl text-xs font-extrabold"},"Luyện riêng ",cnt.tough," từ hay sai ▶")),

      E(JCard,{theme:a,className:"space-y-3"},
        E("div",{className:"flex flex-wrap items-center gap-2"},
          E("div",{className:"font-extrabold text-base flex-1"},"Danh sách sổ Notebook & View riêng biệt"),
          E("button",{onClick:()=>startNotebook(""),style:{backgroundColor:a.accent},className:"tap-fx px-4 py-2 rounded-xl text-white text-xs font-bold"},"Học tất cả sổ ▶")),
        groups.map(g=>{
          const words=allWords.filter(v=>inG(v,g));
          const viewsForNb=nbViews[g.id]||[];
          if(g.id==="_"&&!words.length&&!viewsForNb.length)return null;
          const dueN=words.filter(due).length,k=g.id,isOpen=!!openNb[k];
          const isCreatingHere=viewForm&&viewForm.nbId===k;

          return E("div",{key:k,className:"space-y-2"},
            E("button",{onClick:()=>setOpenNb({...openNb,[k]:!openNb[k]}),className:"tap-fx w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left",style:{backgroundColor:g.color||a.accentSoft,color:"#4A3F5C"}},
              E("span",{className:"flex-1 font-extrabold text-sm truncate"},cleanT(g.title)),
              E("span",{className:"text-[11px] font-bold opacity-80"},words.length," từ · ",viewsForNb.length," view · ",dueN," đến hạn"),
              E("span",{className:"text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/75"},isOpen?"Thu gọn":"Mở sổ")),
            isOpen&&E("div",{className:"p-4 rounded-2xl border space-y-4 fade-in",style:{borderColor:a.border}},
              E("div",{className:"flex flex-wrap items-center justify-between gap-2"},
                E("div",{className:"flex flex-wrap items-center gap-2"},
                  E("button",{onClick:()=>startNotebook(g.id),style:{backgroundColor:a.accent},className:"tap-fx px-4 py-2 rounded-xl text-white text-xs font-bold"},"Học bài cả sổ này ▶"),
                  E("button",{onClick:()=>startSkim(cleanT(g.title)+" · Lướt",words),style:{backgroundColor:"#C9C8F2",color:"#3D3560"},className:"tap-fx px-4 py-2 rounded-xl text-xs font-bold"},"Lướt cả sổ ▶")),
                E("button",{onClick:()=>setViewForm(isCreatingHere?null:{nbId:k,editId:null,name:"",wordIds:words.map(x=>x.id)}),style:{backgroundColor:a.accentSoft,color:a.text},className:"tap-fx px-3.5 py-2 rounded-xl text-xs font-extrabold"},isCreatingHere?"Đóng form":"+ Tạo View cho sổ này")),

              isCreatingHere&&E("div",{className:"p-3.5 rounded-2xl border space-y-2.5",style:{borderColor:a.accent,backgroundColor:a.accentSoft}},
                E("div",{className:"text-xs font-extrabold"},viewForm.editId?"Chỉnh sửa View":"Tạo View mới trong "+cleanT(g.title)),
                E("input",{value:viewForm.name,placeholder:"Tên View (VD: Bài 1 - Từ vựng trọng tâm)...",maxLength:40,onChange:ev=>setViewForm({...viewForm,name:ev.target.value}),className:"w-full px-3 py-2 rounded-xl border text-sm",style:M}),
                E("div",{className:"flex flex-wrap gap-2 items-center text-xs font-bold"},
                  E("span",null,"Đã chọn ",viewForm.wordIds.length,"/",words.length," từ của sổ"),
                  E("button",{type:"button",onClick:()=>setViewForm({...viewForm,wordIds:words.map(v=>v.id)}),className:"px-2.5 py-1 rounded-full bg-white/80"},"Chọn tất cả"),
                  E("button",{type:"button",onClick:()=>setViewForm({...viewForm,wordIds:[]}),className:"px-2.5 py-1 rounded-full bg-white/80"},"Bỏ chọn"),
                  E("button",{type:"button",onClick:saveViewForNb,style:{backgroundColor:a.accent},className:"px-3.5 py-1 rounded-full text-white font-extrabold"},viewForm.editId?"Lưu View":"Tạo View")),
                words.length===0
                  ?E("p",{className:"text-xs opacity-75"},"Sổ này chưa có từ vựng nào. Hãy thêm từ vào sổ hoặc ở mục Từ vựng trước!")
                  :E("div",{className:"max-h-48 overflow-y-auto space-y-1 p-2 rounded-xl bg-white/80"},(()=>{
                    const usedMap={};
                    Object.values(nbViews||{}).forEach(list=>(list||[]).forEach(vw=>{
                      if(vw.id===viewForm.editId)return;
                      (vw.wordIds||[]).forEach(id=>{(usedMap[id]=usedMap[id]||[]).push(vw.name)});
                    }));
                    return words.map(v=>{
                      const used=usedMap[v.id];
                      return E("label",{key:v.id,className:"flex items-center gap-2 text-xs font-bold cursor-pointer py-1",style:used?{opacity:.5,filter:"grayscale(1)"}:undefined,title:used?"Đã có trong View: "+used.join(", "):undefined},
                        E("input",{type:"checkbox",checked:viewForm.wordIds.includes(v.id),onChange:()=>setViewForm(f=>({...f,wordIds:f.wordIds.includes(v.id)?f.wordIds.filter(x=>x!==v.id):[...f.wordIds,v.id]}))}),
                        E("span",{className:"flex-1"},front(v),v.reading?` (${v.reading})`:""," — ",v.meaning),
                        used&&E("span",{className:"text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 whitespace-nowrap max-w-[40%] truncate"},"đã ở: "+used.join(", ")));
                    });
                  })()),
                E("div",{className:"flex gap-2"},
                  E("button",{type:"button",onClick:()=>setViewForm(null),className:"px-4 py-2 rounded-xl bg-white/80 text-xs font-bold"},"Hủy"))),

              E("div",{className:"space-y-2"},
                E("div",{className:"text-xs font-extrabold opacity-80"},"Danh sách View của sổ (",viewsForNb.length,"):"),
                viewsForNb.length===0&&!isCreatingHere&&E("p",{className:"text-xs opacity-65"},"Chưa có View riêng nào trong sổ này. Bấm '+ Tạo View cho sổ này' để gom nhóm từ và xem Flashcard / Học bài!"),
                viewsForNb.map(vw=>{
                  const validCount=o.vocab.filter(v=>vw.wordIds.includes(v.id)).length;
                  const doneN=o.vocab.filter(v=>vw.wordIds.includes(v.id)&&(vw.doneIds||[]).includes(v.id)).length;
                  return E("div",{key:vw.id,className:"p-3 rounded-2xl border flex flex-wrap items-center gap-2",style:{borderColor:a.border,backgroundColor:a.card}},
                    E("div",{className:"flex-1 min-w-[140px]"},
                      E("div",{className:"text-sm font-extrabold"},vw.name),
                      E("div",{className:"text-[11px] opacity-70"},validCount," từ vựng",doneN>0?" · đã học "+doneN+"/"+validCount:"")),
                    E("button",{onClick:()=>startViewFlashcard(k,vw),style:{backgroundColor:"#FFF0C9",color:"#5E503F"},className:"tap-fx px-3 py-1.5 rounded-xl text-xs font-extrabold"},"Xem Flashcard"),
                    E("button",{onClick:()=>startViewSkim(k,vw),style:{backgroundColor:"#C9C8F2",color:"#3D3560"},className:"tap-fx px-3 py-1.5 rounded-xl text-xs font-extrabold"},"Lướt ▶"),
                     E("button",{onClick:()=>startViewStudy(k,vw),style:{backgroundColor:a.accent},className:"tap-fx px-3 py-1.5 rounded-xl text-white text-xs font-extrabold"},"Học bài ▶"),
                    doneN>0&&E("button",{onClick:()=>resetViewProgress(k,vw),style:{backgroundColor:"#FFF0C9",color:"#5E503F"},className:"tap-fx px-3 py-1.5 rounded-xl text-xs font-extrabold"},"Học lại từ đầu ↺"),
                     E("button",{onClick:()=>setViewForm({nbId:k,editId:vw.id,name:vw.name,wordIds:vw.wordIds.filter(id=>o.vocab.some(v=>v.id===id))}),className:"px-2 py-1 text-xs font-bold opacity-75"},"Sửa"),
                    E("button",{onClick:()=>deleteViewForNb(k,vw),className:"px-2 py-1 text-xs font-bold text-rose-500"},"Xóa"));
                })),

              words.length>0&&E("details",{className:"text-xs"},
                E("summary",{className:"cursor-pointer font-bold opacity-75"},"Xem danh sách ",words.length," từ trong sổ này"),
                E("div",{className:"mt-2 max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5"},words.map(v=>E("div",{key:v.id,className:"px-2.5 py-1.5 rounded-lg",style:{backgroundColor:a.accentSoft}},E("span",{className:"font-extrabold"},front(v)),v.reading?E("span",{className:"opacity-70"}," "+v.reading):null," — ",v.meaning))))));
        })));
  }

  /* ----- Giao diện đang trong buổi Học bài 5 bước ----- */
  const curItem=sess.queue[sess.qi];
  const curVocab=o.vocab.find(x=>x.id===curItem.vocabId)||o.vocab[0];
  const modeId=curItem.steps[curItem.si];
  /* Giữ nguyên câu hỏi + thứ tự đáp án trong suốt một câu (không bị xáo lại khi chọn đáp án) */
  const qKey=[sess.round,sess.qi,sess.pi||0,curItem.si,curItem.attempt,curItem.stage,curItem.vocabId].join("|");
  if(qCache.current.key!==qKey||!qCache.current.N){qCache.current={key:qKey,N:buildQ(modeId,curVocab,o.vocab)}}
  const N=qCache.current.N;
  const mode=MODES.find(m=>m.id===modeId)||{label:""};
  const V=sess.picked!==null||sess.checked!==null;
  const mc=isMC(modeId);
  const wrong=V&&(mc?sess.picked!==N.correct:sess.checked===false);

  const pick=c=>{if(!V)handleStepAnswer(c===N.correct,c,N)};
  kref.current={on:true,V,stamp:sess.answeredAt,opts:mc?N.options:null,pick,next:()=>advanceStep()};

  const resting=V&&restLeft(sess)>0;
  const NextBtn=()=>E("button",{onClick:advanceStep,disabled:resting,style:{backgroundColor:a.accent},className:"tap-fx w-full py-2.5 rounded-xl text-white text-sm font-bold mt-3"},"Tiếp tục → (Enter)");
  const hintBox=wrong&&E("div",{className:"text-left text-xs space-y-1 p-3 rounded-2xl mt-3 fade-in",style:{backgroundColor:"#FEE2E2",color:"#7F1D1D"}},
    E("div",{className:"font-extrabold"},"⚠️ Bạn đã trả lời sai câu này — Từ này sẽ quay lại học từ đầu sau khi hết vòng!"),
    (N.hint||[]).map((h,i)=>E("div",{key:i},h)),
    E("button",{onClick:()=>speak(front(N.v),langOfWord(N.v,nbs)),className:"tap-fx mt-1 px-2.5 py-1 rounded-lg bg-white/90 text-[11px] font-bold",style:{color:"#4A3F5C"}},"Nghe phát âm"));

  const stepDots=curItem.steps.map((stId,idx)=>{
    const done=idx<curItem.si,active=idx===curItem.si;
    return E("span",{key:idx,title:(MODES.find(m=>m.id===stId)||{}).label,style:{backgroundColor:done?"#34D399":active?a.accent:a.accentSoft,color:done||active?"#fff":a.text},className:"px-2 py-0.5 rounded-full text-[10px] font-extrabold"},idx+1);
  });

  return E("div",{className:"max-w-xl mx-auto space-y-3"},
    sess.requeueNotice&&E("div",{className:"p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between"},
      E("span",null,sess.requeueNotice),
      E("button",{onClick:()=>setSess(s=>({...s,requeueNotice:null})),className:"ml-2 font-extrabold"},"✕")),
    E("div",{className:"flex items-center gap-2 text-xs font-bold"},
      E("span",{className:"truncate max-w-[160px]"},sess.title),
      E("span",{className:"px-2 py-0.5 rounded-full",style:{backgroundColor:a.accentSoft}},"Vòng ",sess.round,(sess.mix?(sess.kind==="skim"?" · Nhóm "+(Math.floor(sess.qi/5)+1)+"/"+Math.ceil(sess.queue.length/5):"")+" · Câu "+(sess.pi+1)+"/"+sess.plan.length:" · Từ "+(sess.qi+1)+"/"+sess.queue.length)),
      E("div",{className:"ml-auto flex gap-1.5"},
        E("button",{onClick:pause,style:{backgroundColor:a.accentSoft,color:a.text},className:"tap-fx px-3 py-1.5 rounded-xl"},"Tạm dừng"),
        E("button",{onClick:endAll,style:{backgroundColor:a.accentSoft,color:a.text},className:"tap-fx px-3 py-1.5 rounded-xl"},"Kết thúc"))),
    E(JCard,{theme:a,className:"text-center space-y-3 py-7"},
      E("div",{className:"flex items-center justify-center gap-1.5"},
        E("span",{className:"text-[11px] font-extrabold px-2.5 py-0.5 rounded-full",style:{backgroundColor:curItem.stage==="reinforce"?"#DBEAFE":a.accentSoft,color:curItem.stage==="reinforce"?"#1E40AF":a.text}},
          curItem.stage==="skim"?(curItem.attempt>1?"Lướt lại lần "+curItem.attempt:"Lướt nhanh"):curItem.stage==="reinforce"?"Củng cố nhanh (Lần 2 đã điền đúng)":curItem.attempt>1?`Học lại lần ${curItem.attempt}`:"Học mới 5 bước"),
        ...stepDots),
      E("div",{className:"text-xs font-extrabold opacity-75"},mode.label),
      E("div",{className:"text-3xl sm:text-4xl font-extrabold break-words"},N.prompt),
      N.sub&&E("div",{className:"text-sm opacity-70"},N.sub),
      mc&&E("div",{className:"grid grid-cols-1 gap-2 pt-2 text-left"},
        N.options.map((c,idx)=>{
          const ok=V&&c===N.correct,bad=V&&c===sess.picked&&c!==N.correct;
          return E("button",{key:c,disabled:V,onClick:()=>pick(c),
            style:{backgroundColor:ok?"#B8E6C9":bad?"#F8B4B4":a.accentSoft,color:ok||bad?"#4A3F5C":a.text},
            className:"tap-fx px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"},
            E("span",{className:"text-[10px] opacity-60 w-4"},idx+1),E("span",{className:"flex-1"},c));
        }),
        V&&NextBtn()),
      N.accepts&&E("form",{className:"pt-2 space-y-2",onSubmit:ev=>{
          ev.preventDefault();
          if(V||!sess.typed.trim())return;
          const ok=lenientOk(sess.typed,N.accepts);
          handleStepAnswer(ok,sess.typed,N);
        }},
        E("input",{ref:inpRef,autoFocus:true,value:sess.typed,disabled:V,onChange:ev=>setSess(s=>({...s,typed:ev.target.value})),
          className:"w-full px-4 py-2.5 rounded-xl border text-center text-lg",style:M,placeholder:"Nhập đáp án rồi nhấn Enter…"}),
        V?E("div",null,
            E("div",{className:"text-sm font-extrabold",style:{color:sess.checked?"#2E9E6B":"#D6455D"}},
              sess.checked?"✓ Chính xác!"+(exactOk(sess.typed,N.accepts)?"":" Đáp án đầy đủ: "+N.correct):"✗ Đáp án: "+N.correct),
            NextBtn())
          :E("button",{type:"submit",style:{backgroundColor:a.accent},className:"tap-fx w-full py-2.5 rounded-xl text-white text-sm font-bold"},"Kiểm tra (Enter)")),
      hintBox));
};
}
