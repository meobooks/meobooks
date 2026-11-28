// Component App gốc (khung điều hướng và các màn), chuyển từ public/legacy/index.html.
// Các component và hàm tiện ích còn nằm trong app cũ được truyền vào qua dependency injection; App được gọi ở cuối app cũ, khi mọi thứ đã khai báo xong.
import React, { useEffect, useMemo, useRef, useState } from 'react';

export function makeApp({ PomodoroWidget, GRAMMAR_FIELDS, G_PALETTES, InkLayer, EMPTY_PROFILE, NAV_TO_PATH, lvlInfo, mergeData, navFromHash, norm, useJlpt, cleanT, nbOf, withNb, GamesHub, NAV_GROUPS, UI_STYLES, DEF_COLS, FIXED_COLS, normCols, classOf, JlptVocab, JlptStudy, JlptGame, ReadView, BookViewer, NbEditModal, SHOP_ITEMS, MochiPet, planToday, SmartPlan, N2Roadmap, YtListening, DEFAULT_SUBJECTS, SubjectPicker }) {
  return function App(){
  const[authBusy,setAuthBusy]=useState(!1),[recovery,setRecovery]=useState(()=>meobooksServices.auth.isRecoveryBoot()),[rcForm,setRcForm]=useState({pw:"",pw2:""}),[rcBusy,setRcBusy]=useState(!1),[rcMsg,setRcMsg]=useState(""),[rcDone,setRcDone]=useState(!1),[authOpen,setAuthOpen]=useState(()=>!!meobooksServices.auth.bootAuthError()),[o,a]=useState(null),[c,b]=useState(!0),[v,A]=useState("login"),[f,L]=useState({name:"",email:"",password:"",confirmPassword:"",remember:!0}),[u,D]=useState(!1),[R,j]=useState(()=>meobooksServices.auth.bootAuthError()),[z,B]=useState(""),[w,M]=useState(()=>{const e=navFromHash();return e==="editor"?"home":e});
  useEffect(()=>{const e="#/"+(NAV_TO_PATH[w]||"dashboard");location.hash!==e&&(location.hash=e)},[w]);
  useEffect(()=>{const e=()=>{const t=navFromHash();t!=="editor"&&M(t)};return window.addEventListener("hashchange",e),()=>window.removeEventListener("hashchange",e)},[]);
  const[P,q]=useState(!1),[N,I]=useState(!1),[V,y]=useState(""),[l,p]=useState("saved"),[h,m]=useState(""),[C,g]=useState(!1),[T,H]=useState(null),[S,d]=useState(createInitialSeed("Study Friend").prefs),[Eall,G]=useState([]),[J,U]=useState([]),[X,ae]=useState([]),[ne,se]=useState([]),[pe,be]=useState(null),[Ae,ce]=useState(null),[Ce,Qe]=useState("files"),[ft,we]=useState(0),[yt,je]=useState(null),[Ie,Pe]=useState(""),[vt,Le]=useState(!1),[Y,Fe]=useState({title:"",subject:"Japanese",color:"#F8DDE8",icon:"",desc:""}),[kt,xe]=useState(!1),[Be,Oe]=useState(!1),[Ze,Ye]=useState(!1),[Nt,Re]=useState(!1),[Ve,et]=useState(""),[Me,te]=useState(null),[he,$e]=useState({title:"",deadline:new Date().toISOString().split("T")[0]}),[ze,ot]=useState(""),[rm,setRm]=useState(!0),[book,setBook]=useState(null),npRef=useRef(null),Z=useRef(null),[nbEd,setNbEd]=useState(null),We=useRef(null),at=useRef(null),nt=useRef(null),de=useRef({prefs:S,notebooks:Eall,pages:J,flashcards:X,tasks:ne});
  useEffect(()=>{de.current={prefs:S,notebooks:Eall,pages:J,flashcards:X,tasks:ne}},[S,Eall,J,X,ne]);
  const[activeSubj,setActiveSubj]=useState(null),[subjects,setSubjects]=useState(DEFAULT_SUBJECTS),[honorOpen,setHonorOpen]=useState(false);
  useEffect(()=>{if(!o)return;try{const r=window.meobooksServices.localStore.getSubjects(o.id);setSubjects(r||DEFAULT_SUBJECTS)}catch{setSubjects(DEFAULT_SUBJECTS)}},[o]);
  const saveSubjects=list=>{setSubjects(list);if(o)try{window.meobooksServices.localStore.setSubjects(o.id,list)}catch{}};
  const E=useMemo(()=>{const ids=new Set(subjects.map(x=>x.id)),first=(subjects[0]||{}).id;return Eall.filter(x=>x.subject===activeSubj||(activeSubj===first&&!ids.has(x.subject)))},[Eall,subjects,activeSubj]);
  const Tk=useMemo(()=>{const ids=new Set(subjects.map(x=>x.id)),first=(subjects[0]||{}).id;return ne.filter(t=>t.subject===activeSubj||((!t.subject||!ids.has(t.subject))&&activeSubj===first))},[ne,subjects,activeSubj]);
  const qe=useRef(""),st=useRef("saved"),Ee=useRef(null),rt=useRef(0);
  useEffect(()=>{st.current=l},[l]);
  const[wt,lt]=useState(navigator.onLine);
  useEffect(()=>{const e=()=>{lt(!0),St()},t=()=>lt(!1);return window.addEventListener("online",e),window.addEventListener("offline",t),()=>{window.removeEventListener("online",e),window.removeEventListener("offline",t)}},[o]);
  const k=useMemo(()=>J.find(e=>e.id===Ae)||null,[J,Ae]);
  useEffect(()=>{loadFont(S.fontFamily),loadFont(k==null?void 0:k.fontFamily)},[S.fontFamily,k==null?void 0:k.fontFamily]);
  useEffect(()=>{Be&&FONT_GROUPS.forEach(e=>e.fonts.forEach(t=>loadFont(t.family)))},[Be]);
  useEffect(()=>{const e=()=>{if(o&&Ee.current)try{window.meobooksServices.localStore.setLocalData(o.id,Ee.current)}catch{}};return window.addEventListener("beforeunload",e),()=>window.removeEventListener("beforeunload",e)},[o]);

  const n=THEMES[S.themeId]||THEMES.pinkKitten,Ft=useMemo(()=>MOCHI_QUOTES[Math.floor(Math.random()*MOCHI_QUOTES.length)],[]),K=e=>{H(e),setTimeout(()=>H(null),3800)};
  const GeAll=useJlpt(o,!0,K,(x,t)=>ve(x,t),(id,ok)=>recVocab(id,ok));
  const Ge=useMemo(()=>{const nbSub=new Map(Eall.map(x=>[x.id,x.subject]));const first=(subjects[0]||{}).id;const inS=v=>{const sj=nbSub.get(nbOf(v));if(sj!==undefined)return sj===activeSubj;return activeSubj===first};return{...GeAll,vocab:GeAll.vocab.filter(inS),deleteVocab:async id=>{await GeAll.deleteVocab(id);const pid="v-sync-"+id;const cur=de.current.pages;const nxt=cur.map(pg=>{if(!Array.isArray(pg.vocabRows)||!pg.vocabRows.some(r=>r.id===id||r.id===pid))return pg;return{...pg,vocabRows:pg.vocabRows.filter(r=>r.id!==id&&r.id!==pid),updatedAt:new Date().toISOString()}});if(nxt.some((pg,i)=>pg!==cur[i])){de.current={...de.current,pages:nxt};U(nxt);W({pages:nxt})}}}},[GeAll,Eall,subjects,activeSubj]);

  /* ---------- Đăng nhập & Tự động cập nhật / gộp dữ liệu tài khoản không mất mát ---------- */
  const Xe=async e=>{
    var x,i;if(!e)return;
    const t=((x=e.user_metadata)==null?void 0:x.display_name)||((i=e.email)==null?void 0:i.split("@")[0])||"Mochi Friend";
    let localObj=null;
    try{localObj=window.meobooksServices.localStore.getLocalData(e.id)}catch{}
    const applyLocal=()=>{
      if(localObj){d(localObj.prefs||createInitialSeed(t).prefs),G(localObj.notebooks||[]),U(localObj.pages||[]),ae(localObj.flashcards||[]),se(localObj.tasks||[])}
      else{const _=createInitialSeed(t);d(_.prefs),G(_.notebooks),U(_.pages),ae(_.flashcards),se(_.tasks),window.meobooksServices.localStore.setLocalData(e.id,_)}
    };
    if(localObj)applyLocal();
    if(!supabase||e.id==="preview-user"){applyLocal();return}
    if(!navigator.onLine){applyLocal(),p("offline");return}
    try{
      meoCloudLoaded=false;const{data:F,error:_}=await window.meobooksServices.sync.fetchRow(e.id);
      if(_){console.error("Supabase fetch error:",_),p("error"),m(_.message||JSON.stringify(_)),applyLocal();return}
      const plan=meoFeat.syncPolicy.cloudLoadPlan({hasLocal:!!localObj,cloudRow:F});
      if(plan==="merge"){
        // Tự động hợp nhất (Merge) dữ liệu trên máy & dữ liệu trên tài khoản Supabase để đảm bảo không bao giờ mất dữ liệu
        meoCloudLoaded=true;await it(localObj,F,e);
        return;
      }
      if(plan==="apply_cloud"){
        meoCloudLoaded=true;meoBaseStamp=F.updated_at||null;
        d(F.prefs||createInitialSeed(t).prefs),G(F.notebooks||[]),U(F.pages||[]),ae(F.flashcards||[]),se(F.tasks||[]),p("saved"),m("");
        try{window.meobooksServices.localStore.setLocalData(e.id,{prefs:F.prefs,notebooks:F.notebooks,pages:F.pages,flashcards:F.flashcards,tasks:F.tasks})}catch{}
      }else{
        const O=localObj||createInitialSeed(t);
        d(O.prefs),G(O.notebooks),U(O.pages),ae(O.flashcards),se(O.tasks);
        try{window.meobooksServices.localStore.setLocalData(e.id,O)}catch{}
        // Máy chủ chưa trả về dòng nào: chỉ TẠO dòng mới (insert), không bao giờ ghi đè dòng đã có
        const stampI=new Date().toISOString();const{error:ie}=await window.meobooksServices.sync.insertRow(e.id,O,stampI);
        if(ie){p("error"),m("Chưa tải được dữ liệu tài khoản. Chưa lưu lên máy chủ để tránh ghi đè.")}
        else{meoCloudLoaded=true;meoBaseStamp=stampI;p("saved"),m("")}
      }
    }catch(F){console.error(F),p("error"),m(F.message||"Không thể kết nối tới máy chủ Supabase."),applyLocal()}
  };

  const it=async(e,t,s)=>{
    meoCloudLoaded=true;
    const r=mergeData(e,t);
    d(r.prefs),G(r.notebooks),U(r.pages),ae(r.flashcards),se(r.tasks),de.current=r,Ee.current=null;
    try{window.meobooksServices.localStore.setLocalData(s.id,r)}catch{}
    p("saving");
    const{error:x}=await window.meobooksServices.sync.upsertRow(s.id,r,qe.current=new Date().toISOString());
    if(x)p("error"),m(x.message||"");
    else{meoBaseStamp=qe.current;try{window.meobooksServices.localStore.clearDirty(s.id)}catch{}p("saved"),m("")}
  };

  const St=async()=>{if(!(!supabase||!o||o.id==="preview-user"||!window.meobooksServices.localStore.isDirty(o.id)))try{const{data:e}=await window.meobooksServices.sync.fetchRow(o.id),t=Ee.current||de.current;e?await it(t,e,o):W({})}catch{p("error")}};

  const W=(e={})=>{
    if(!o)return;
    const t={prefs:e.prefs!==void 0?e.prefs:de.current.prefs,notebooks:e.notebooks!==void 0?e.notebooks:de.current.notebooks,pages:e.pages!==void 0?e.pages:de.current.pages,flashcards:e.flashcards!==void 0?e.flashcards:de.current.flashcards,tasks:e.tasks!==void 0?e.tasks:de.current.tasks};
    Ee.current=t,p("saving"),We.current&&clearTimeout(We.current),We.current=setTimeout(async()=>{
      try{window.meobooksServices.localStore.setLocalData(o.id,t),window.meobooksServices.localStore.markDirty(o.id)}catch{}
      try{
        const gate=meoFeat.syncPolicy.saveGate({online:navigator.onLine,hasSupabase:!!supabase,isPreview:o.id==="preview-user",cloudLoaded:meoCloudLoaded});
        if(!gate.upsert){p(gate.status),gate.message&&m(gate.message);return}
        // Kiểm tra máy chủ trước khi ghi: nếu có bên khác ghi sau mốc đã biết thì hợp nhất rồi mới ghi
        const{data:remote,error:fe}=await window.meobooksServices.sync.fetchRow(o.id);
        if(fe)throw fe;
        let payload=t;
        if(meoFeat.syncPolicy.shouldMergeBeforeWrite({baseline:meoBaseStamp,remoteUpdatedAt:remote&&remote.updated_at})){
          payload=mergeData(t,remote);
          d(payload.prefs),G(payload.notebooks),U(payload.pages),ae(payload.flashcards),se(payload.tasks),de.current=payload,Ee.current=null;
          try{window.meobooksServices.localStore.setLocalData(o.id,payload)}catch{}
        }
        const stamp=new Date().toISOString();
        const{error:s}=await window.meobooksServices.sync.upsertRow(o.id,payload,qe.current=stamp);
        if(s)throw s;
        meoBaseStamp=stamp;
        try{window.meobooksServices.localStore.clearDirty(o.id)}catch{}
        p("saved"),m("")
      }catch(s){console.error("Supabase sync error:",s),p("error"),m(s.message||JSON.stringify(s))}
    },500)
  };

  useEffect(()=>{
    if(!supabase){b(!1);return}
    let settled=!1;
    const finishBoot=u=>{
      if(settled)return;
      settled=!0;
      a(u);
      if(u)Xe(u);
      b(!1);
    };
    const fastFallback=setTimeout(()=>{
      let cached=null;
      try{cached=window.meobooksServices.localStore.getLastUser()}catch{}
      finishBoot(cached);
    },1800);
    meobooksServices.auth.getSession().then(({data:{session:t}})=>{
      clearTimeout(fastFallback);
      if(t!=null&&t.user)try{window.meobooksServices.localStore.setLastUser(t.user)}catch{}
      const s=(t==null?void 0:t.user)||(navigator.onLine?null:window.meobooksServices.localStore.getLastUser());
      finishBoot(s);
    }).catch(()=>{
      clearTimeout(fastFallback);
      let cached=null;
      try{cached=window.meobooksServices.localStore.getLastUser()}catch{}
      finishBoot(cached);
    });
    const e=meobooksServices.auth.onAuthStateChange((t,s)=>{const r=(s==null?void 0:s.user)||null;t==="PASSWORD_RECOVERY"&&setRecovery(!0);if(settled){a(r);r&&Xe(r)}else finishBoot(r)});
    return()=>{clearTimeout(fastFallback);e.unsubscribe()}
  },[]);

  useEffect(()=>{
    if(!supabase||!o||o.id==="preview-user")return;
    const e=window.meobooksServices.sync.subscribeRealtime(o.id,row=>{
      if(!meoFeat.syncPolicy.shouldApplyRealtime({status:st.current,remoteUpdatedAt:row.updated_at,baseline:meoBaseStamp}))return;
      const SY=window.meobooksServices.sync,c=de.current,r=SY.pickRemoteFields(row);
      const next={prefs:r.prefs||c.prefs,notebooks:r.notebooks||c.notebooks,pages:r.pages||c.pages,flashcards:r.flashcards||c.flashcards,tasks:r.tasks||c.tasks};
      d(next.prefs),G(next.notebooks),U(next.pages),ae(next.flashcards),se(next.tasks),de.current=next,Ee.current=null;
      meoBaseStamp=row.updated_at;
      try{window.meobooksServices.localStore.setLocalData(o.id,next)}catch{}
    });
    return()=>{e.unsubscribe()}
  },[o]);

  useEffect(()=>{Z.current&&k&&Z.current.innerHTML!==(k.content||"")&&(Z.current.innerHTML=k.content||"")},[Ae,rm]);
  useEffect(()=>{setRm(Ae===null||npRef.current!==Ae)},[Ae]);

  const Dt=async e=>{
    if(e.preventDefault(),j(""),B(""),!supabase){j("Chưa kết nối được Supabase (thư viện chưa tải được). Kiểm tra mạng / tắt chặn quảng cáo rồi tải lại trang.");return}
    const{name:t,email:s,password:r,confirmPassword:x}=f;
    if(v==="forgot"){if(!s.includes("@"))return j("Vui lòng nhập email hợp lệ.");const{error:i}=await meobooksServices.auth.resetPassword(s);i?j(i.message):B("Mochi đã gửi liên kết đặt lại mật khẩu vào email của bạn!");return}
    if(!s.includes("@"))return j("Định dạng email không hợp lệ.");
    if(r.length<6)return j("Mật khẩu phải có ít nhất 6 ký tự.");
    if(v==="signup"){if(!t.trim())return j("Vui lòng nhập tên hiển thị.");if(r!==x)return j("Mật khẩu xác nhận không khớp.");const{data:i,error:F}=await meobooksServices.auth.signUp({email:s,password:r,displayName:t});F?j(F.message):i.user&&!i.session?(B('Đăng ký thành công! Hãy kiểm tra email xác nhận hoặc đăng nhập nhé!'),A("login")):i.session&&B("Đăng ký thành công! Đang mở phòng học của bạn...")}
    else{setAuthBusy(!0);const{error:i}=await meobooksServices.auth.signIn({email:s,password:r});setAuthBusy(!1);i&&j("Email hoặc mật khẩu chưa chính xác: "+i.message)}
  };

  const Et=()=>{
    const nm=(window.prompt("Bạn muốn được gọi là gì?")||"").trim()||"Bạn";
    const e={id:"preview-user",email:"mochi@local.preview",user_metadata:{display_name:nm}};
    try{const d=window.meobooksServices.localStore.getLocalData("preview-user");if(d)window.meobooksServices.localStore.setLocalData("preview-user",{...d,prefs:{...(d.prefs||{}),displayName:nm}})}catch(x){}
    a(e),p("saved"),m(""),Xe(e)
  };

  const ct=async()=>{try{window.meobooksServices.localStore.clearLastUser()}catch{}supabase&&await meobooksServices.auth.signOut(),a(null),setActiveSubj(null),ce(null),be(null),M("home")};
  const fe=e=>{const t={...S,...e};d(t),W({prefs:t})};

  const _t=e=>{
    if(e.preventDefault(),!Y.title.trim())return;
    const t="nb-"+Date.now(),r=[{id:t,title:Y.title.trim(),subject:activeSubj||Y.subject,color:Y.color,icon:Y.icon,desc:Y.desc.trim()||"Sổ tay ghi chép kiến thức",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},...Eall];
    G(r),W({notebooks:r}),Le(!1),Fe({title:"",subject:"Japanese",color:"#F8DDE8",icon:"",desc:""}),be(t),M("notebooks"),K("Đã tạo cuốn sổ mới thành công!")
  };

  const dt=(e,t)=>{if(!t.trim())return;const s=Eall.map(r=>r.id===e?{...r,title:t.trim(),updatedAt:new Date().toISOString()}:r);G(s),W({notebooks:s}),je(null),K("Đã đổi tên sổ tay!")};

  const _e=(e=NOTE_TEMPLATES[0],t=null)=>{
    var _;const s="page-"+Date.now(),r=t||pe||((_=E[0])==null?void 0:_.id)||"nb-jp",x=E.find(O=>O.id===r);
    const F=[{id:s,notebookId:r,title:`${e.name.split("(")[0].trim()} - ${new Date().toLocaleDateString("vi-VN")}`,type:e.type,subject:(x==null?void 0:x.subject)||"Japanese",content:e.defaultContent||"",vocabRows:e.defaultVocab?JSON.parse(JSON.stringify(e.defaultVocab)):[],customColumns:[{id:"word",label:"Từ vựng"},{id:"reading",label:"Cách đọc"},{id:"kanji",label:"Hán tự"},{id:"meaning",label:"Nghĩa"},{id:"pos",label:"Từ loại"},{id:"example",label:"Ví dụ"},{id:"note",label:"Ghi chú"}],grammarData:e.defaultGrammar?{...e.defaultGrammar}:NOTE_TEMPLATES[2].defaultGrammar,kanjiData:e.defaultKanji?{...e.defaultKanji}:NOTE_TEMPLATES[3].defaultKanji,readingData:e.defaultReading?{...e.defaultReading}:NOTE_TEMPLATES[4].defaultReading,listeningData:e.defaultListening?{...e.defaultListening}:NOTE_TEMPLATES[5].defaultListening,writingData:e.defaultWriting?{...e.defaultWriting}:NOTE_TEMPLATES[6].defaultWriting,stickers:[],paperStyle:S.paperStyle||"cream",fontFamily:S.fontFamily||"'Nunito', sans-serif",fontSize:S.fontSize||16,favorite:!1,trashed:!1,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},...J];
    U(F),W({pages:F}),npRef.current=s,setRm(!1),ce(s),M("editor"),xe(!1),K("Đã tạo trang ghi chép mới!")
  };

  const $=e=>{if(!k)return;Ht();const t=new Date().toISOString(),s=J.map(r=>r.id===k.id?{...r,...e,updatedAt:t}:r);U(s),W({pages:s})};
  const ut=e=>{if(!e)return;const t="page-"+Date.now(),r=[{...JSON.parse(JSON.stringify(e)),id:t,title:`${e.title} (Bản sao)`,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},...J];U(r),W({pages:r}),npRef.current=t,setRm(!1),ce(t),K("Đã nhân bản trang ghi chép!")};
  const Te=(e,t=!0)=>{const s=J.map(r=>r.id===e?{...r,trashed:t,updatedAt:new Date().toISOString()}:r);U(s),W({pages:s}),t&&Ae===e&&(ce(null),M("notebooks")),K(t?"Đã chuyển vào Thùng rác":"Đã khôi phục trang ghi chép!")};
  const ie=(e,t=null)=>{document.execCommand(e,!1,t),Z.current&&$({content:Z.current.innerHTML})};
  const Tt=e=>{var r;const t=(r=e.target.files)==null?void 0:r[0];if(!t)return;const s=new FileReader;s.onload=x=>{const i=new Image;i.onload=()=>{const F=Math.min(1,1e3/Math.max(i.width,i.height)),_=document.createElement("canvas");_.width=i.width*F,_.height=i.height*F,_.getContext("2d").drawImage(i,0,0,_.width,_.height);const O=`<div style="margin:12px 0; text-align:center;"><img src="${_.toDataURL("image/jpeg",.75)}" style="max-width:100%; border-radius:14px; border:2px solid #F8DDE8;" /></div>`;Z.current&&(Z.current.focus(),document.execCommand("insertHTML",!1,O),$({content:Z.current.innerHTML}))},i.src=x.target.result},s.readAsDataURL(t)};

  const At=()=>{if(!k)return;const e={id:"v-"+Date.now(),word:"",reading:"",kanji:"",meaning:"",pos:"Danh từ",example:"",translation:"",note:"",status:"learning"};$({vocabRows:[...k.vocabRows||[],e]})};
  const jt=e=>{k&&$({vocabRows:(k.vocabRows||[]).filter(t=>t.id!==e)})};
  const ye=e=>normCols(e&&e.customColumns);
  const Lt=()=>{if(!k)return;const e=ye(k),t="col_"+Date.now(),s=[...e,{id:t,label:`Cột ${e.length+1}`}];$({customColumns:s}),K("Đã thêm cột mới!")};
  const Mt=(e,t)=>{if(!k||FIXED_COLS[e])return;const r=ye(k).map(x=>x.id===e?{...x,label:t}:x);$({customColumns:r})};
  const It=e=>{if(!k)return;if(FIXED_COLS[e])return K("Cột này là cột cố định (liên kết với Flashcard & View), không thể xóa!");const t=ye(k);if(t.length<=1)return K("Bảng cần giữ lại ít nhất 1 cột!");const s=t.filter(r=>r.id!==e);$({customColumns:s}),K("Đã xóa cột")};
  // Phím mũi tên di chuyển giữa các ô của bảng từ vựng (←/→ chỉ nhảy ô khi con trỏ đang ở đầu/cuối chữ)
  const cellArrowNav=ev=>{
    const key=ev.key;
    if(!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(key))return;
    if(ev.nativeEvent&&ev.nativeEvent.isComposing)return;
    const el=ev.target;
    if(!el||el.tagName!=="INPUT"||ev.shiftKey||ev.ctrlKey||ev.metaKey||ev.altKey)return;
    const tr=el.closest("tr"),tbody=el.closest("tbody");
    if(!tr||!tbody)return;
    const inputsOf=r=>[...r.querySelectorAll("td input")];
    const cells=inputsOf(tr),idx=cells.indexOf(el);
    let target=null;
    if(key==="ArrowLeft"||key==="ArrowRight"){
      const len=el.value.length,a=el.selectionStart,b=el.selectionEnd;
      if(key==="ArrowLeft"&&a===0&&b===0)target=cells[idx-1];
      if(key==="ArrowRight"&&a===len&&b===len)target=cells[idx+1];
    }else{
      const rows=[...tbody.querySelectorAll("tr")],ri=rows.indexOf(tr),step=key==="ArrowUp"?-1:1;
      for(let i=ri+step;i>=0&&i<rows.length;i+=step){const c=inputsOf(rows[i]);if(c[idx]){target=c[idx];break}}
    }
    if(target){ev.preventDefault();target.focus();target.select()}
  };
  // Kéo thả đổi thứ tự cột: cột đi theo con trỏ tới đâu, thứ tự được lưu vào customColumns (bảng đọc cũng dùng chung nên tự đồng bộ)
  const startColDrag=(ev,colId)=>{
    if(!k)return;
    ev.preventDefault();ev.stopPropagation();
    const table=ev.currentTarget.closest("table");
    if(!table)return;
    const cols=ye(k),byId={};
    cols.forEach(c=>{byId[c.id]=c});
    let order=cols.map(c=>c.id),moved=false;
    window.__dragCol=colId;
    table.querySelectorAll('[data-col="'+colId+'"]').forEach(el=>el.classList.add("col-dragging"));
    document.body.classList.add("col-dragging-active");
    const box=table.parentElement;
    const move=e=>{
      if(box){const r=box.getBoundingClientRect();if(e.clientX>r.right-40)box.scrollLeft+=14;else if(e.clientX<r.left+40)box.scrollLeft-=14}
      const others=[...table.querySelectorAll("thead th[data-col]")].filter(th=>th.getAttribute("data-col")!==colId);
      const to=others.filter(th=>{const r=th.getBoundingClientRect();return r.left+r.width/2<e.clientX}).length;
      const from=order.indexOf(colId);
      if(to===from)return;
      order=order.slice();order.splice(from,1);order.splice(to,0,colId);
      moved=true;
      $({customColumns:order.map(id=>byId[id])});
    };
    const end=()=>{
      window.removeEventListener("pointermove",move);
      window.removeEventListener("pointerup",end);
      window.removeEventListener("pointercancel",end);
      document.body.classList.remove("col-dragging-active");
      window.__dragCol=null;
      table.querySelectorAll(".col-dragging").forEach(el=>el.classList.remove("col-dragging"));
      moved&&K("Đã đổi thứ tự cột");
    };
    window.addEventListener("pointermove",move);
    window.addEventListener("pointerup",end);
    window.addEventListener("pointercancel",end);
  };

  /* ---------- Liên kết & Thống nhất từ vựng giữa Notebook <-> Kho Từ vựng <-> Học bài ---------- */
  const pt=(e,t,s)=>{
    if(!k)return;
    const oldRow=(k.vocabRows||[]).find(x=>x.id===e);
    const r=(k.vocabRows||[]).map(x=>x.id===e?{...x,[t]:s}:x);
    $({vocabRows:r});
    // Nếu từ này đã liên kết với Kho từ vựng thống nhất, tự động cập nhật sang Kho từ vựng
    const row=r.find(x=>x.id===e);
    if(row&&Ge.ready){
      const linked=Ge.vocab.find(v=>(v.tags||[]).includes("row:"+e))||(oldRow&&oldRow.word?Ge.vocab.find(v=>norm(v.word)===norm(oldRow.word)):null);
      if(linked){
        Ge.updateVocab(linked.id,{
          word:row.word||row.kanji||linked.word,
          kanji:row.kanji||linked.kanji,
          reading:row.reading!==undefined?row.reading:linked.reading,
          meaning:row.meaning!==undefined?row.meaning:linked.meaning,
          word_type:row.pos!==undefined?row.pos:linked.word_type,
          example_jp:row.example!==undefined?row.example:linked.example_jp
        });
      }
    }
  };

  const Pt=()=>{
    if(!k||!Ve.trim())return;
    const dupWords=[];
    const t=meoFeat.bulkVocab.parseVocabPaste(Ve);
    t.forEach(r=>{if(Ge.ready&&r.word&&Ge.findDup(r.word))dupWords.push(r.word)});
    $({vocabRows:[...k.vocabRows||[],...t]});
    et(""),Re(!1);
    if(dupWords.length){
      K(`Đã thêm ${t.length} dòng. ⚠️ Cảnh báo: ${dupWords.slice(0,3).join(", ")} đã tồn tại trong kho từ vựng!`);
    }else{
      K(`Đã nhập ${t.length} từ vựng mới!`);
    }
  };

  // Đồng bộ từ bảng từ vựng trong Notebook sang Kho từ vựng thống nhất (có cảnh báo trùng)
  const syncNotebookRowsToVocab=async(rows,forceDup=false)=>{
    if(!k||!Ge.ready)return;
    const list=(Array.isArray(rows)?rows:(k.vocabRows||[])).filter(r=>r.word&&r.meaning);
    if(!list.length)return K("Hãy nhập ít nhất 1 từ vựng có nghĩa nhé!");
    const items=list.map(r=>({
      word:r.word,
      kanji:r.kanji&&r.kanji!==r.word?r.kanji:"",
      reading:r.reading||"",
      meaning:r.meaning,
      word_type:r.pos||"",
      example_jp:r.example||"",
      tags:["nb:"+k.notebookId,"row:"+r.id]
    }));
    const res=await Ge.addMany(items,{skipDup:!forceDup});
    if(res.dups.length&&!forceDup){
      K(`Đã liên kết ${res.added} từ mới. ⚠️ Bỏ qua ${res.dups.length} từ đã tồn tại: ${res.dups.slice(0,3).map(d=>d.item.word).join(", ")}`);
    }else{
      K(`Đã liên kết ${res.added} từ vựng vào Kho từ vựng & Học bài!`);
    }
  };

  // Khi thêm/sửa từ ở mục Từ vựng hoặc YouTube, tự động liên kết vào bảng từ vựng của sổ tương ứng
  const syncWordToNotebook=(vocabId,vObj)=>{
    if(!vObj||!vObj.notebookId)return;
    const nbPages=de.current.pages.filter(pg=>!pg.trashed&&pg.notebookId===vObj.notebookId&&pg.type==="vocabulary");
    const newRow={
      id:"v-sync-"+vocabId,
      word:vObj.word||vObj.kanji||"",
      reading:vObj.reading||"",
      kanji:vObj.kanji||vObj.word||"",
      meaning:vObj.meaning||"",
      pos:vObj.word_type||"Từ vựng",
      example:vObj.example_jp||"",
      translation:vObj.example_vi||"",
      note:"",
      status:vObj.status||"learning"
    };
    if(nbPages.length>0){
      const targetPg=nbPages[0];
      const rows=targetPg.vocabRows||[];
      const exIdx=rows.findIndex(r=>r.id==="v-sync-"+vocabId||norm(r.word)===norm(newRow.word));
      const nextRows=exIdx>=0?rows.map((r,i)=>i===exIdx?{...r,...newRow,id:r.id}:r):[...rows,newRow];
      const nextPages=de.current.pages.map(pg=>pg.id===targetPg.id?{...pg,vocabRows:nextRows,updatedAt:new Date().toISOString()}:pg);
      U(nextPages);W({pages:nextPages});
    }else{
      const nbObj=de.current.notebooks.find(n=>n.id===vObj.notebookId);
      const newPg={
        id:"page-vocab-"+vObj.notebookId,
        notebookId:vObj.notebookId,
        title:`Từ vựng - ${(nbObj&&cleanT(nbObj.title))||"Sổ tay"}`,
        type:"vocabulary",
        subject:(nbObj&&nbObj.subject)||"Japanese",
        content:"",
        vocabRows:[newRow],
        customColumns:DEF_COLS,
        stickers:[],
        paperStyle:S.paperStyle||"cream",
        fontFamily:S.fontFamily||"'Nunito', sans-serif",
        fontSize:S.fontSize||16,
        favorite:!1,
        trashed:!1,
        createdAt:new Date().toISOString(),
        updatedAt:new Date().toISOString()
      };
      const nextPages=[newPg,...de.current.pages];
      U(nextPages);W({pages:nextPages});
    }
  };

  const saveUnifiedFromYt=async(item,forceDup=false)=>{
    if(!Ge.ready)return;
    const res=await Ge.addMany([{
      word:item.word,
      reading:item.reading||"",
      meaning:item.meaning,
      example_jp:item.example_jp||"",
      tags:withNb([],item.notebookId)
    }],{skipDup:!forceDup});
    if(res.added>0&&res.items[0]){
      syncWordToNotebook(res.items[0].id,{...res.items[0],notebookId:item.notebookId});
      K("Đã lưu từ vựng vào Kho thống nhất & liên kết với sổ tay!");
    }
  };

  const khoAddFn=async(row,nbId)=>{
    if(!Ge.ready)return null;
    const item={word:row.word,reading:row.pinyin||"",meaning:row.meaning||"",example_jp:row.example||"",notebookId:nbId};
    const res=await Ge.addMany([{word:item.word,reading:item.reading,meaning:item.meaning,example_jp:item.example_jp,tags:withNb([],nbId)}],{skipDup:true});
    if(res.added>0&&res.items[0]){syncWordToNotebook(res.items[0].id,{...res.items[0],notebookId:nbId});return res.items[0].id}
    const dup=Ge.findDup(item.word);
    return dup?dup.id:null;
  };
  const khoRemoveFn=async id=>{await Ge.deleteVocab(id)};
  const Ot=(e,t)=>{k&&(Z.current?(Z.current.insertAdjacentHTML("beforeend",e),$({content:Z.current.innerHTML})):$({content:(k.content||"")+e}),t||K("Đã thêm vào ghi chú"))};
  const Rt=()=>{var t;const e=k||{};return[e.title,(t=Z.current)==null?void 0:t.innerText,(e.vocabRows||[]).map(s=>s.word+" "+s.meaning).join("; "),e.type==="grammar"?JSON.stringify(e.grammarList||e.grammarData||""):"",e.kanjiData?JSON.stringify(e.kanjiData):""].filter(Boolean).join(`\n`).slice(0,3500)};

  const ve=(e,t)=>{const s=de.current.prefs,r=dayKey(),x={...s.activity||{}},i={xp:0,cards:0,mins:0,notes:0,...x[r]||{}},F=(s.goal>0&&s.goal<=30?s.goal:10),_=i.xp;i.xp+=e,t&&(i[t.k]+=t.n),x[r]=i;const O={...s,activity:x};de.current.prefs=O,d(O),W({prefs:O}),_<F&&i.xp>=F&&K("Bạn đã đạt mục tiêu XP hôm nay! Mochi tự hào về bạn")};
  const recVocab=(id,ok)=>{const s0=de.current.prefs,vs={...(s0.vstats||{})},o0=vs[id]||{ok:0,bad:0,streak:0},n={ok:o0.ok+(ok?1:0),bad:o0.bad+(ok?0:1),streak:ok?o0.streak+1:0,last:dayKey()};vs[id]=n;const O={...s0,vstats:vs};de.current.prefs=O;d(O);W({prefs:O});return n.bad>=2&&n.bad/(n.ok+n.bad)>=.35&&n.streak<4};
  const Ht=()=>{const e=Date.now();e-rt.current>6e4&&(rt.current=e,ve(1,{k:"notes",n:1}))};

  /* ---------- Tải toàn bộ dữ liệu tài khoản & Cập nhật an toàn khi đăng nhập ---------- */
  const Jt=()=>{
    const e={
      app:"meobooks (Full Account Backup)",
      version:2,
      exportedAt:new Date().toISOString(),
      accountEmail:o?o.email:"",
      prefs:S,
      notebooks:E,
      pages:J,
      tasks:ne,
      vocabData:{
        vocab:Ge.vocab||[],
        srs:Ge.srs||{},
        profile:Ge.profile||EMPTY_PROFILE,
        ach:Ge.ach||[]
      }
    };
    const t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),s=URL.createObjectURL(t),r=document.createElement("a");
    r.href=s,r.download=`meobooks-account-data-${new Date().toISOString().split("T")[0]}.json`,r.click(),URL.revokeObjectURL(s);
    K("Đã tải toàn bộ dữ liệu tài khoản (.JSON) về máy!");
  };

  const Kt=e=>{
    var r;const t=(r=e.target.files)==null?void 0:r[0];if(!t)return;
    const s=new FileReader;
    s.onload=async x=>{
      try{
        const i=JSON.parse(x.target.result);
        // Hợp nhất (Merge) thay vì ghi đè để không làm mất dữ liệu hiện tại của tài khoản
        const merged=mergeData(
          {prefs:i.prefs||{},notebooks:i.notebooks||[],pages:i.pages||[],flashcards:i.flashcards||[],tasks:i.tasks||[]},
          {prefs:de.current.prefs,notebooks:de.current.notebooks,pages:de.current.pages,flashcards:de.current.flashcards,tasks:de.current.tasks}
        );
        d(merged.prefs),G(merged.notebooks),U(merged.pages),ae(merged.flashcards),se(merged.tasks);
        W(merged);
        let addedVocab=0;
        if(i.vocabData&&Array.isArray(i.vocabData.vocab)&&Ge.mergeVocabBackup){
          addedVocab=await Ge.mergeVocabBackup(i.vocabData.vocab,i.vocabData.srs||{});
        }
        K(`Đã cập nhật & gộp dữ liệu an toàn! (Thêm ${addedVocab} từ vựng mới, giữ nguyên toàn bộ dữ liệu cũ)`);
      }catch(err){
        console.error(err);
        K("File sao lưu không hợp lệ!");
      }
    };
    s.readAsText(t);
    e.target.value="";
  };

  const ue=useMemo(()=>{const ids=new Set(E.map(x=>x.id));return J.filter(e=>!e.trashed&&ids.has(e.notebookId))},[J,E]),$t=useMemo(()=>J.filter(e=>e.trashed),[J]),gt=useMemo(()=>{if(!V.trim())return[];const e=V.toLowerCase();return ue.filter(t=>(t.title||"").toLowerCase().includes(e)||(t.content||"").toLowerCase().includes(e)||(t.vocabRows||[]).some(s=>(s.word||"").toLowerCase().includes(e)||(s.meaning||"").toLowerCase().includes(e)))},[V,ue]);
  const ke=useMemo(()=>({
    notebooksCount:E.length,
    pagesCount:ue.length,
    totalVocab:Ge.vocab.length,
    masteredVocab:Ge.vocab.filter(v=>v.status==="mastered"||classOf(S.vstats||{},v,Ge.srs)==="known").length
  }),[E,ue,Ge.vocab,Ge.srs,S.vstats]);

  const Q=useMemo(()=>{
    var oe,ee;const e=S.activity||{};let t=0;for(const me in e)t+=e[me].xp||0;
    const li=lvlInfo(t),s=li.level,i=new Date;let F=0;
    for((oe=e[dayKey(i)])!=null&&oe.xp||i.setDate(i.getDate()-1);(((ee=e[dayKey(i)])==null?void 0:ee.xp)||0)>0;)F++,i.setDate(i.getDate()-1);
    const _=Array.from({length:84},(me,Wt)=>{var xt;const Ue=new Date;Ue.setDate(Ue.getDate()-83+Wt);const ht=dayKey(Ue);return{d:ht,xp:((xt=e[ht])==null?void 0:xt.xp)||0}});
    const td=dayKey();
    const dueCount=Ge.vocab.filter(v=>{const I=Ge.srs[v.id];return!I||!I.next_review||I.next_review<=td}).length;
    return{total:t,lvl:s,pct:Math.round(li.into/li.need*100),streak:F,heat:_,today:{xp:0,cards:0,mins:0,notes:0,...e[dayKey()]||{}},due:dueCount}
  },[S.activity,Ge.vocab,Ge.srs]);

  useEffect(()=>{try{if(!Ge.ready||!(S.plan&&S.plan.notify)||typeof Notification==="undefined"||Notification.permission!=="granted")return;const td=dayKey();if(window.meobooksServices.localStore.getNotifDay()===td)return;const p=planToday(Ge,S);if(p.due+p.hard<=0)return;window.meobooksServices.localStore.setNotifDay(td);new Notification("meobooks",{body:"Hôm nay: "+p.due+" từ đến hạn, "+p.hard+" từ hay sai cần học lại."})}catch(e){}},[Ge.ready,S.plan&&S.plan.notify]);

  const[celebrate,setCelebrate]=useState(null);
  useEffect(()=>{const L=["Giỏi quá! Mochi tự hào về bạn đó ♡","Xong một bài rồi, bạn thật siêu nha ✿","Cố lên, mỗi bài là một bước tiến!","Mochi đội nơ chúc mừng bạn đó ✧","Học thêm chút nữa là bạn giỏi lắm đó~"];let t;const h=()=>{setCelebrate({msg:L[Math.floor(Math.random()*L.length)]});clearTimeout(t);t=setTimeout(()=>setCelebrate(null),4500)};window.addEventListener("mochi:celebrate",h);return()=>{window.removeEventListener("mochi:celebrate",h);clearTimeout(t)}},[]);
  if(c)return React.createElement("div",{className:"min-h-screen flex flex-col items-center justify-center bg-[#FFFDF8] text-[#82758A]"},React.createElement(MochiMascot,{mood:"cheer",size:130}),React.createElement("p",{className:"mt-4 font-bold text-lg animate-pulse"},"Mochi đang kết nối Supabase..."));

  if(recovery)return(()=>{const H=React.createElement,lab="block text-xs font-bold text-[#5A4E63] mb-1",inp="w-full px-4 py-2.5 rounded-xl border border-[#E8DDF8] focus:outline-none focus:border-[#E88BAE] text-sm",btn="w-full py-3 rounded-xl bg-gradient-to-r from-[#E88BAE] to-[#B794F4] text-white font-bold text-sm shadow-md hover:opacity-95 transition";
    const Rc=async e=>{e.preventDefault();setRcMsg("");if(rcForm.pw.length<6)return setRcMsg("Mật khẩu phải có ít nhất 6 ký tự.");if(rcForm.pw!==rcForm.pw2)return setRcMsg("Mật khẩu xác nhận không khớp.");setRcBusy(!0);let er=null;try{const r=await meobooksServices.auth.updatePassword(rcForm.pw);er=r&&r.error}catch(x){er=x}setRcBusy(!1);if(er)return setRcMsg(er.message||"Không đổi được mật khẩu. Hãy thử lại.");setRcForm({pw:"",pw2:""});setRcDone(!0)};
    return H("div",{className:"min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#F8DDE8] via-[#FFFDF8] to-[#DCEBFA] text-[#5A4E63]"},
      H("div",{className:"w-full max-w-sm bg-white rounded-3xl shadow-2xl border-2 border-[#F3C6D8] p-6"},
        H("div",{className:"flex justify-center mb-2"},H(MochiMascot,{mood:"cheer",size:90})),
        H("h1",{className:"text-center font-extrabold text-lg mb-3"},"Đặt mật khẩu mới"),
        rcDone?H("div",{className:"space-y-4 text-center"},H("p",{className:"text-sm font-semibold text-emerald-700"},"Đã đổi mật khẩu thành công!"),H("button",{type:"button",onClick:()=>setRecovery(!1),className:btn},"Vào phòng học"))
        :H("form",{onSubmit:Rc,className:"space-y-3"},
          rcMsg&&H("div",{className:"p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold"},rcMsg),
          H("div",null,H("label",{className:lab},"Mật khẩu mới"),H("input",{type:"password",required:!0,autoComplete:"new-password",placeholder:"Ít nhất 6 ký tự",value:rcForm.pw,onChange:e=>setRcForm({...rcForm,pw:e.target.value}),className:inp})),
          H("div",null,H("label",{className:lab},"Nhập lại mật khẩu mới"),H("input",{type:"password",required:!0,autoComplete:"new-password",placeholder:"Nhập lại mật khẩu",value:rcForm.pw2,onChange:e=>setRcForm({...rcForm,pw2:e.target.value}),className:inp})),
          H("button",{type:"submit",disabled:rcBusy,className:btn},rcBusy?"Đang lưu...":"Lưu mật khẩu mới"),
          H("button",{type:"button",onClick:()=>setRecovery(!1),className:"w-full text-xs font-bold text-[#82758A] hover:underline"},"Để sau"))))})();

  if(!o)return(()=>{const H=React.createElement,FEATS=[
{i:"📓",t:"Sổ tay ghi chép",d:"Mỗi môn một cuốn sổ xinh xắn. Viết gì cũng được, chọn mẫu có sẵn và đổi font chữ cho vừa mắt bạn nè ✎"},
{i:"🌿",t:"Vườn từ vựng",d:"Từ mới được xếp gọn gàng như những chậu cây nhỏ 🌱 Dán cả danh sách một lần, mình tự bỏ qua từ trùng cho bạn."},
{i:"📖",t:"Góc học tập",d:"Mochi nhắc bạn ôn đúng lúc. Từ nào hay quên sẽ quay lại thăm bạn thường hơn, không để bạn lạc mất ✧"},
{i:"🎧",t:"Phòng nghe",d:"Nghe video thật, bắt từ quen tai. Học trong ngữ cảnh đời thường thì nhớ lâu hơn nè ♪"},
{i:"🎮",t:"Phòng chơi",d:"Ôn bài mà như chơi! Mấy trò chơi nhỏ xinh giúp việc học bớt căng thẳng ✿"},
{i:"🏮",t:"Lộ trình Lantern Lane",d:"Đi dọc con đường đèn lồng ấm áp 🏮 Từng bài học nối tiếp nhau, dễ bước từ bước đầu tới đích."},
{i:"⏱️",t:"Pomodoro & Kế hoạch",d:"Hẹn giờ 25 phút, nghỉ 5 phút, rồi tiếp tục nha. Mochi đếm nhịp cùng bạn ⏱️"},
{i:"🍡",t:"Thành tích & Mochi",d:"Hoàn thành nhiệm vụ nhỏ mỗi ngày để nhận sao và vàng. Mochi cũng lớn lên cùng bạn đó ♡"}],
STEPS=[
{t:"Đăng ký hoặc đăng nhập",d:"Ghé góc trên bên phải, đăng nhập hoặc đăng ký bằng email. Chưa muốn đăng ký thì ghé thăm thử cũng được nha."},
{t:"Chọn môn học",d:"Chọn môn bạn đang học, hoặc tự thêm môn mới. Mỗi môn có góc sổ tay và bộ từ riêng, không lẫn lộn đâu ✿"},
{t:"Ghi chép và thêm từ vựng",d:"Viết lại điều bạn vừa học và cất từ mới vào vườn. Mình tự xếp lịch ôn cho bạn, bạn chỉ cần viết thôi ✎"},
{t:"Ôn tập mỗi ngày",d:"Mở góc học tập mỗi ngày một chút. Bài vở tự đồng bộ nên ở đâu bạn cũng mang theo được ♡"}];
const card="bg-white/90 rounded-3xl border-2 border-[#F3C6D8]/60 shadow-sm";
return H("div",{className:"min-h-screen bg-gradient-to-br from-[#F8DDE8] via-[#FFFDF8] to-[#DCEBFA] text-[#5A4E63]"},
 H("header",{className:"sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-[#F3C6D8]/60"},
  H("div",{className:"max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-3"},
   H("div",{className:"flex items-center gap-2"},
    H(MochiMascot,{mood:"cheer",accessory:"bow",size:42}),
    H("div",null,H("h1",{className:"font-extrabold text-base leading-tight"},"meobooks"),H("p",{className:"text-[10px] font-bold text-[#E88BAE]"},"My Little Learning World"))),
   H("div",{className:"relative flex items-center gap-2"},
    H("button",{type:"button",onClick:()=>{const same=authOpen&&v==="login";A("login");j("");B("");setAuthOpen(!same)},className:"px-3.5 py-2 rounded-xl text-xs font-bold border-2 border-[#E8DDF8] bg-white hover:bg-[#F8F4FA] transition"},"Đăng nhập"),
    H("button",{type:"button",onClick:()=>{const same=authOpen&&v==="signup";A("signup");j("");B("");setAuthOpen(!same)},className:"px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#E88BAE] to-[#B794F4] shadow"},"Đăng ký"),
    authOpen&&H("div",{className:"absolute right-0 top-full mt-3 w-[min(92vw,380px)] bg-white rounded-3xl shadow-2xl border-2 border-[#F3C6D8] p-5 z-50"},
     H("div",{className:"flex justify-between items-center mb-3"},H("span",{className:"font-extrabold text-sm"},"Tài khoản meobooks"),H("button",{type:"button",onClick:()=>setAuthOpen(false),className:"text-sm font-bold text-[#82758A]"},"✕")),
     React.createElement("div",{className:"flex flex-col justify-center"},React.createElement("div",{className:"flex gap-2 mb-5 bg-[#F8F4FA] p-1 rounded-2xl"},React.createElement("button",{type:"button",onClick:()=>{A("login"),j(""),B("")},className:`flex-1 py-2 rounded-xl text-sm font-bold transition ${v==="login"?"bg-white text-[#5A4E63] shadow-sm":"text-[#82758A]"}`},"Đăng nhập"),React.createElement("button",{type:"button",onClick:()=>{A("signup"),j(""),B("")},className:`flex-1 py-2 rounded-xl text-sm font-bold transition ${v==="signup"?"bg-white text-[#5A4E63] shadow-sm":"text-[#82758A]"}`},"Đăng ký mới")),R&&React.createElement("div",{className:"mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold"},R),z&&React.createElement("div",{className:"mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold"},z),React.createElement("form",{onSubmit:Dt,className:"space-y-3"},v==="signup"&&React.createElement("div",null,React.createElement("label",{className:"block text-xs font-bold text-[#5A4E63] mb-1"},"Tên hiển thị"),React.createElement("input",{type:"text",required:!0,placeholder:"VD: Sakura Chan",value:f.name,onChange:e=>L({...f,name:e.target.value}),className:"w-full px-4 py-2.5 rounded-xl border border-[#E8DDF8] focus:outline-none focus:border-[#E88BAE] text-sm"})),React.createElement("div",null,React.createElement("label",{className:"block text-xs font-bold text-[#5A4E63] mb-1"},"Email"),React.createElement("input",{type:"email",required:!0,placeholder:"you@example.com",value:f.email,onChange:e=>L({...f,email:e.target.value}),className:"w-full px-4 py-2.5 rounded-xl border border-[#E8DDF8] focus:outline-none focus:border-[#E88BAE] text-sm"})),v!=="forgot"&&React.createElement("div",null,React.createElement("label",{className:"block text-xs font-bold text-[#5A4E63] mb-1"},"Mật khẩu"),React.createElement("div",{className:"relative"},React.createElement("input",{type:u?"text":"password",required:!0,placeholder:"••••••••",value:f.password,onChange:e=>L({...f,password:e.target.value}),className:"w-full px-4 py-2.5 rounded-xl border border-[#E8DDF8] focus:outline-none focus:border-[#E88BAE] text-sm"}),React.createElement("button",{type:"button",onClick:()=>D(!u),className:"absolute right-3 top-2.5 text-xs font-bold text-[#82758A]"},u?"Ẩn":"Hiện"))),v==="signup"&&React.createElement("div",null,React.createElement("label",{className:"block text-xs font-bold text-[#5A4E63] mb-1"},"Xác nhận mật khẩu"),React.createElement("input",{type:"password",required:!0,placeholder:"Nhập lại mật khẩu",value:f.confirmPassword,onChange:e=>L({...f,confirmPassword:e.target.value}),className:"w-full px-4 py-2.5 rounded-xl border border-[#E8DDF8] focus:outline-none focus:border-[#E88BAE] text-sm"})),v==="login"&&React.createElement("div",{className:"flex justify-end"},React.createElement("button",{type:"button",onClick:()=>A("forgot"),className:"text-xs font-bold text-[#E88BAE] hover:underline"},"Quên mật khẩu?")),React.createElement("button",{type:"submit",disabled:authBusy,className:"w-full py-3 rounded-xl bg-gradient-to-r from-[#E88BAE] to-[#B794F4] text-white font-bold text-sm shadow-md hover:opacity-95 transition"},authBusy?"Đang đăng nhập...":v==="login"?"Mở Sổ Tay Supabase":v==="signup"?"Tạo Tài Khoản Mới":"Gửi Liên Kết Khôi Phục")),React.createElement("div",{className:"mt-5 pt-4 border-t border-[#F3EBF8] text-center"},React.createElement("p",{className:"text-xs text-[#82758A] mb-2"},"Dùng thử ngay không cần tạo tài khoản:"),React.createElement("button",{type:"button",onClick:Et,className:"w-full py-2.5 rounded-xl border-2 border-[#DCEBFA] bg-[#F4F9FF] text-[#46566E] font-bold text-xs hover:bg-[#DCEBFA] transition"},"Vào Học Ngay (Chế Độ Xem Trước)")))
    )))),
 H("section",{className:"max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-10 grid md:grid-cols-2 gap-8 items-center"},
  H("div",{className:"space-y-4"},
   
   H("h2",{className:"text-3xl md:text-4xl font-extrabold leading-tight"},"Sổ tay học tập — học theo cách của riêng bạn"),
   H("p",{className:"text-sm md:text-base text-[#82758A] leading-relaxed"},"Chào bạn nhé! ✿ Mình là Mochi, người bạn đồng hành của bạn. Cùng ghi chép, nhớ từ mới cho bất kỳ môn nào bạn đang học, và học từng chút một theo nhịp của bạn nha~"),
   H("div",{className:"flex flex-wrap gap-3 pt-2"},
    H("button",{type:"button",onClick:()=>{A("signup");setAuthOpen(true)},className:"px-5 py-3 rounded-xl bg-gradient-to-r from-[#E88BAE] to-[#B794F4] text-white font-bold text-sm shadow-md hover:opacity-95"},"Làm quen với Mochi ♡"),
    H("button",{type:"button",onClick:Et,className:"px-5 py-3 rounded-xl border-2 border-[#DCEBFA] bg-white/80 font-bold text-sm hover:bg-[#DCEBFA] transition"},"Ghé thăm thử nhé ✦"))),
  H("div",{className:"flex flex-col items-center gap-3"},H("div",{className:"px-4 py-2 rounded-2xl rounded-bl-none bg-white shadow-md border-2 border-[#F3C6D8] text-sm font-bold text-[#5A4E63]"},"Hôm nay mình học gì nè? (ﾉ◕ヮ◕)ﾉ"),H(MochiMascot,{mood:"cheer",accessory:"bow",size:(typeof window!=="undefined"&&window.innerWidth<768)?170:240}))),
 H("section",{className:"max-w-6xl mx-auto px-4 md:px-8 py-10"},
  H("h3",{className:"text-2xl font-extrabold text-center mb-6"},"Có gì trong sổ tay nè? ✿"),
  H("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"},
   FEATS.map(f=>H("div",{key:f.t,className:card+" p-5"},H("div",{className:"text-3xl mb-2"},f.i),H("h4",{className:"font-extrabold text-sm mb-1"},f.t),H("p",{className:"text-xs text-[#82758A] leading-relaxed"},f.d))))),
 H("section",{className:"max-w-6xl mx-auto px-4 md:px-8 py-10"},
  H("h3",{className:"text-2xl font-extrabold text-center mt-6 mb-6"},"Học thế nào cho vui? ✧"),
  H("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4"},
   STEPS.map((s,k)=>H("div",{key:s.t,className:card+" p-5"},H("div",{className:"w-8 h-8 rounded-full bg-gradient-to-r from-[#E88BAE] to-[#B794F4] text-white font-extrabold text-sm flex items-center justify-center mb-3"},String(k+1)),H("h4",{className:"font-extrabold text-sm mb-1"},s.t),H("p",{className:"text-xs text-[#82758A] leading-relaxed"},s.d))))),
 H("footer",{className:"text-center text-[11px] text-[#82758A] py-8"},"meobooks · Sổ tay học tập")
)})();

  if(!activeSubj&&honorOpen)return React.createElement("div",{style:{backgroundColor:n.bg,color:n.text,fontFamily:S.fontFamily},className:"min-h-screen p-4 md:p-8"},React.createElement("button",{onClick:()=>setHonorOpen(false),className:"mb-4 px-3 py-1.5 rounded-xl text-xs font-bold border-2",style:{borderColor:n.border,backgroundColor:n.card,color:n.text}},"← Quay lại chọn môn học"),React.createElement(JlptGame,{jl:GeAll,MochiPet:MochiPet,theme:n,shop:{owned:S.owned||["none","bow"],equipped:S.mochiAccessory,equip:id=>fe({mochiAccessory:id}),buy:async it=>{const ow=S.owned||["none","bow"];if(ow.includes(it.id))return;if(await Ge.spendGold(it.price)){fe({owned:[...ow,it.id],mochiAccessory:it.id});K("Đã mua "+it.name+"!")}else K("Chưa đủ vàng")}},pet:S.pet,xpEarned:Object.values(S.activity||{}).reduce((q,x)=>q+((x&&x.xp)||0),0),onPet:(np,msg)=>{const s0=de.current.prefs,O={...s0,pet:np};de.current.prefs=O,d(O),W({prefs:O}),msg&&K(msg)}}));
  if(!activeSubj)return React.createElement(SubjectPicker,{subjects:subjects,notebooks:Eall,profile:(GeAll.profile||{}),theme:n,onPick:id=>{setActiveSubj(id);be(null);ce(null);M("home")},onSave:saveSubjects,onLogout:ct,onHonor:()=>setHonorOpen(true)});
  return React.createElement("div",{style:{backgroundColor:n.bg,color:n.text,fontFamily:S.fontFamily,...uiBgStyle(n,S.uiStyle),"--bd":n.accent,"--ink":n.text,"--card":n.card},className:"ui-"+(S.uiStyle||"anime")+" min-h-screen flex flex-col md:flex-row transition-colors duration-300"},
    
    React.createElement(PomodoroWidget,{theme:n,onDone:e=>ve(Math.min(5,Math.max(1,Math.round(e/5))),{k:"mins",n:e})}),
    book&&(()=>{const nb=E.find(x=>x.id===book.nb)||{},pg=ue.filter(x=>x.notebookId===book.nb).slice().sort((x,y)=>(x.createdAt||"").localeCompare(y.createdAt||""));return React.createElement(BookViewer,{key:book.nb+":"+(book.pid||""),title:cleanT(nb.title||"Sổ tay"),color:nb.color,pages:pg,startId:book.pid||null,theme:n,defFont:S.fontFamily,onClose:()=>setBook(null),onEdit:id=>{setBook(null),npRef.current=id,ce(id),setRm(!1),M("editor")}})})(),
    !wt&&React.createElement("div",{className:"no-print fixed top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-bold shadow-lg bg-amber-100 text-amber-900 text-center"},"Ngoại tuyến – thay đổi được lưu trên máy, sẽ tự đồng bộ khi có mạng"),
    celebrate&&React.createElement("div",{className:"fixed bottom-5 left-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border-2 max-w-xs",style:{backgroundColor:n.card,borderColor:n.accent}},React.createElement(MochiMascot,{mood:"cheer",accessory:S.mochiAccessory,outfit:true,size:72}),React.createElement("p",{className:"text-sm font-bold",style:{color:n.text}},celebrate.msg)),
    T&&React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.accent},className:"fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border-2 flex items-center gap-2.5 animate-bounce"},React.createElement("span",{className:"text-sm font-bold"},T)),
    Me&&React.createElement("div",{className:"fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"},React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"max-w-md w-full p-6 rounded-3xl border-2 shadow-2xl"},React.createElement("h3",{className:"text-lg font-extrabold mb-2"},Me.title),React.createElement("p",{className:"text-sm opacity-80 mb-6"},Me.message),React.createElement("div",{className:"flex justify-end gap-3"},React.createElement("button",{onClick:()=>te(null),className:"px-4 py-2 rounded-xl text-sm font-bold border"},"Hủy"),React.createElement("button",{onClick:Me.onConfirm,className:"px-4 py-2 rounded-xl text-sm font-bold bg-rose-500 text-white"},"Xác nhận")))),
    React.createElement("aside",{style:{backgroundColor:n.sidebar,borderColor:n.border},className:`fixed md:sticky top-0 left-0 z-40 h-screen border-r flex flex-col transition-all duration-300 ${P?"w-20":"w-64"} ${N?"translate-x-0":"-translate-x-full md:translate-x-0"}`},
      React.createElement("div",{className:"p-4 flex items-center justify-between border-b",style:{borderColor:n.border}},!P&&React.createElement("div",{className:"flex items-center gap-2 cursor-pointer",onClick:()=>M("home")},React.createElement("div",null,React.createElement("h1",{className:"font-extrabold text-sm leading-tight"},"Mochi's Diary"))),React.createElement("button",{onClick:()=>q(!P),className:"p-2 rounded-xl hover:bg-white/40 hidden md:block font-bold text-xs"},P?"▶":"◀"),React.createElement("button",{onClick:()=>I(!1),className:"md:hidden p-2 font-bold"},"✕")),
      React.createElement("nav",{className:"flex-1 overflow-y-auto py-3 px-2.5 space-y-3"},NAV_GROUPS.map((g,gi)=>React.createElement("div",{key:gi,className:"nav-grp space-y-1"},g.map(e=>{const on=(w==="editor"?"notebooks":w)===e.id;return React.createElement("button",{key:e.id,onClick:()=>{M(e.id),I(!1)},title:e.label,className:"nav-tile"+(on?" on":""),style:{backgroundColor:on?n.card:"transparent",color:on?n.accent:n.text,justifyContent:P?"center":"flex-start"}},P?e.label.charAt(0):e.label)})))),
      !P&&S.decorationsEnabled&&React.createElement("div",{className:"p-2 m-3 rounded-2xl bg-white/60 border border-white/80 cursor-pointer",style:{display:"flex",alignItems:"center",gap:8},title:"Bấm để chăm Mochi",onClick:()=>{M("jgame");I(!1)}},React.createElement(MochiMascot,{mood:(S.pet&&S.pet.food<30)?"sleepy":(S.pet&&S.pet.mood<30)?"sad":S.mochiMood,accessory:S.mochiAccessory,size:50,grow:growOf(Ge.profile.level),className:"shrink-0"}),React.createElement("p",{className:"text-[11px] font-bold text-[#5A4E63] leading-snug",style:{margin:0}},"今日も頑張ろう！"))),
    React.createElement("div",{className:"flex-1 flex flex-col min-w-0"},
      React.createElement("header",{style:{backgroundColor:n.card,borderColor:n.border},className:"sticky top-0 z-30 border-b px-4 py-2.5 flex flex-wrap items-center justify-between gap-3"},
        React.createElement("div",{className:"flex items-center gap-2 flex-1 min-w-[200px]"},
          React.createElement("button",{onClick:()=>I(!0),className:"md:hidden p-2 rounded-xl border font-bold",style:{borderColor:n.border}},"☰"),
          React.createElement("div",{className:"relative flex-1 max-w-md"},
            React.createElement("input",{type:"text",placeholder:"Tìm từ vựng, ngữ pháp, trang ghi chép...",value:V,onChange:e=>y(e.target.value),style:{backgroundColor:n.accentSoft},className:"w-full px-4 py-1.5 rounded-xl text-sm focus:outline-none"}),
            V&&React.createElement("button",{onClick:()=>y(""),className:"absolute right-3 top-1.5 text-xs font-bold opacity-60"},"✕"))),
        React.createElement("div",{className:"flex items-center gap-2"},
          React.createElement("button",{onClick:()=>xe(!0),style:{backgroundColor:n.accent},className:"px-3.5 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-90"},"+ Trang mới"),
          React.createElement("button",{onClick:()=>Le(!0),style:{backgroundColor:n.accentSoft,color:n.text},className:"px-3 py-1.5 rounded-xl text-xs font-bold hover:opacity-80"},"Sổ mới"),
          React.createElement("button",{onClick:()=>{l==="error"?g(!0):(W(),K("Đang kiểm tra đồng bộ Supabase..."))},className:`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${l==="error"?"bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 cursor-pointer":""}`,style:l!=="error"?{borderColor:n.border}:{},title:l==="error"?"Bấm để xem chi tiết lỗi":"Trạng thái đồng bộ dữ liệu"},l==="saving"?"Đang lưu...":l==="error"?"Lỗi đồng bộ":o.id==="preview-user"?"Chế độ xem trước":"Đã lưu Supabase"),
          React.createElement("button",{onClick:()=>{setActiveSubj(null);be(null);ce(null)},className:"px-2.5 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap",style:{borderColor:n.border,backgroundColor:n.card,color:n.text}},"Đổi môn"),React.createElement("button",{onClick:()=>M("settings"),className:"flex items-center gap-1.5 pl-2 pr-3 py-1 rounded-full border text-xs font-bold",style:{borderColor:n.border,backgroundColor:n.accentSoft}},React.createElement("span",{className:"max-w-[85px] truncate"},S.displayName)),
          React.createElement("button",{onClick:ct,className:"px-2.5 py-1.5 rounded-xl border text-xs font-bold text-rose-500 hover:bg-rose-50 transition",style:{borderColor:n.border}},"Đăng xuất"))),

      C&&React.createElement("div",{className:"fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"},React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"max-w-xl w-full p-6 rounded-3xl border-2 shadow-2xl space-y-4"},React.createElement("div",{className:"flex items-center justify-between"},React.createElement("h3",{className:"text-lg font-extrabold text-amber-700"},"Chi tiết lỗi đồng bộ Supabase"),React.createElement("button",{onClick:()=>g(!1),className:"font-bold"},"✕")),React.createElement("div",{className:"p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-mono text-rose-700 break-words"},React.createElement("strong",null,"Mã lỗi từ máy chủ:")," ",h||"Chưa tìm thấy bảng mochi_user_data hoặc chưa có quyền RLS."),React.createElement("div",{className:"flex justify-end gap-2 pt-2"},React.createElement("button",{onClick:()=>{g(!1),W()},style:{backgroundColor:n.accent},className:"px-4 py-2 rounded-xl text-white text-xs font-bold shadow"},"Thử đồng bộ lại ngay")))),

      V.trim()!==""&&React.createElement("div",{className:"p-6"},React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"p-5 rounded-3xl border-2 shadow-lg"},React.createElement("div",{className:"flex items-center justify-between mb-4"},React.createElement("h2",{className:"font-extrabold text-base"},'Kết quả tìm kiếm cho "',V,'" (',gt.length,")"),React.createElement("button",{onClick:()=>y(""),className:"text-xs font-bold opacity-70"},"Đóng")),React.createElement("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-3"},gt.map(e=>React.createElement("div",{key:e.id,onClick:()=>{ce(e.id),M("editor"),y("")},style:{backgroundColor:n.accentSoft},className:"p-4 rounded-2xl cursor-pointer"},React.createElement("span",{className:"text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/70"},e.subject," • ",e.type),React.createElement("h4",{className:"font-bold text-sm mt-2"},e.title)))))),

      React.createElement("main",{className:"flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto"},
        w==="home"&&React.createElement("div",{className:"space-y-6"},
          React.createElement("div",{style:{backgroundColor:n.sidebar,borderColor:n.border},className:"p-6 md:p-8 rounded-3xl border-2 flex flex-col md:flex-row items-center justify-between gap-6"},
            React.createElement("div",{className:"space-y-2 text-center md:text-left"},
              React.createElement("span",{className:"inline-block px-3 py-1 rounded-full bg-white/80 text-[#5A4E63] text-xs font-extrabold"},new Date().toLocaleDateString("vi-VN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})),
              React.createElement("h1",{className:"text-2xl md:text-3xl font-extrabold"},"Chào mừng trở lại, ",S.displayName,"!"),
              React.createElement("p",{className:"text-sm font-semibold opacity-85"},'"',Ft,'"'),
              React.createElement("div",{className:"pt-3 flex flex-wrap gap-2.5 justify-center md:justify-start"},
                React.createElement("button",{onClick:()=>_e(NOTE_TEMPLATES[0]),style:{backgroundColor:n.accent},className:"px-4 py-2 rounded-xl text-white text-xs font-bold shadow"},"✍️ Viết ghi chú mới"),
                React.createElement("button",{onClick:()=>_e(NOTE_TEMPLATES[1]),className:"px-4 py-2 rounded-xl bg-white text-[#5A4E63] text-xs font-bold shadow-xs"},"Thêm bảng từ vựng"),
                React.createElement("button",{onClick:()=>M("jstudy"),className:"px-4 py-2 rounded-xl bg-white text-[#5A4E63] text-xs font-bold shadow-xs"},"Học bài Meown (",ke.totalVocab," từ)"))),
            React.createElement("div",{className:"flex flex-col items-center shrink-0"},
              React.createElement(MochiMascot,{mood:Q.today.xp>=((S.goal>0&&S.goal<=30?S.goal:10))?"cheer":Q.today.xp>0?"study":"sleepy",accessory:S.mochiAccessory,outfit:true,size:(typeof window!=="undefined"&&window.innerWidth<768)?100:120,grow:growOf(Ge.profile.level)}),
              React.createElement("span",{className:"text-xs font-extrabold px-3 py-1 rounded-full bg-white/80 text-[#5A4E63] -mt-2 shadow-xs"},"Mochi · "+ageText(Ge.profile.level)))),
          React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"p-5 rounded-3xl border grid gap-5 lg:grid-cols-3"},
            React.createElement("div",{className:"space-y-2.5"},
              React.createElement("div",{className:"flex items-center justify-between"},React.createElement("span",{className:"font-extrabold"},RANKS[Math.min(Q.lvl-1,RANKS.length-1)]," · Lv.",Q.lvl),React.createElement("span",{className:"text-sm font-extrabold"},Q.streak," ngày")),
              React.createElement("div",{className:"h-3 rounded-full overflow-hidden",style:{backgroundColor:n.accentSoft}},React.createElement("div",{className:"h-full rounded-full transition-all",style:{width:Math.max(2,Q.pct)+"%",backgroundColor:n.accent}})),
              React.createElement("p",{className:"text-xs opacity-70"},Q.total," XP · còn ",100-Q.pct,"% để lên cấp"),
              React.createElement("div",{className:"flex items-center justify-between text-xs font-bold pt-1"},React.createElement("span",null,"Hôm nay: ",Q.today.xp,"/",(S.goal>0&&S.goal<=30?S.goal:10)," XP"),React.createElement("select",{value:(S.goal>0&&S.goal<=30?S.goal:10),onChange:e=>fe({goal:+e.target.value}),style:{backgroundColor:n.accentSoft,color:n.text},className:"rounded-lg px-1.5 py-0.5"},[5,10,20,30].map(e=>React.createElement("option",{key:e,value:e},e," XP")))),
              React.createElement("div",{className:"h-2 rounded-full overflow-hidden",style:{backgroundColor:n.accentSoft}},React.createElement("div",{className:"h-full rounded-full transition-all",style:{width:Math.min(100,Q.today.xp/((S.goal>0&&S.goal<=30?S.goal:10))*100)+"%",backgroundColor:"#34D399"}})),
              React.createElement("p",{className:"text-xs opacity-70"},Q.today.cards," lượt học · ",Q.today.mins," phút tập trung · ",Q.today.notes," lần ghi chép"),
              React.createElement("button",{onClick:()=>M("jstudy"),style:{backgroundColor:n.accent},className:"w-full py-2 rounded-xl text-white text-xs font-bold"},Q.due>0?`Học bài ngay (${Q.due} từ đến hạn)`:"Vào học bài Meown")),
            React.createElement("div",{className:"lg:col-span-2"},React.createElement("p",{className:"text-xs font-bold mb-2 opacity-70"},"12 tuần gần đây (đậm hơn = học nhiều hơn)"),React.createElement("div",{className:"grid grid-rows-7 grid-flow-col gap-1 overflow-x-auto pb-1"},Q.heat.map(e=>React.createElement("div",{key:e.d,title:e.d+": "+e.xp+" XP",className:"w-3.5 h-3.5 rounded-[4px] shrink-0",style:{backgroundColor:e.xp?n.accent:n.accentSoft,opacity:e.xp?Math.min(1,.35+e.xp/100):1}}))))),
          React.createElement("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4"},[{label:"Cuốn sổ tay",value:ke.notebooksCount,bg:"#F8DDE8"},{label:"Trang ghi chép",value:ke.pagesCount,bg:"#DCEBFA"},{label:"Từ vựng thống nhất",value:ke.totalVocab,bg:"#E8DDF8"},{label:"Từ đã thuộc",value:`${ke.masteredVocab}/${ke.totalVocab}`,bg:"#FFF0C9"}].map((e,t)=>React.createElement("div",{key:t,style:{backgroundColor:n.card,borderColor:n.border},className:"p-4 rounded-2xl border flex items-center gap-4"},React.createElement("div",{style:{backgroundColor:e.bg},className:"w-12 h-12 rounded-2xl shrink-0"}),React.createElement("div",null,React.createElement("p",{className:"text-xs opacity-70 font-bold"},e.label),React.createElement("p",{className:"text-xl font-extrabold"},e.value))))),
          React.createElement("div",null,React.createElement("div",{className:"flex items-center justify-between mb-3"},React.createElement("h2",{className:"text-lg font-extrabold"},"Kệ Sổ Tay Của Bạn"),React.createElement("button",{onClick:()=>M("notebooks"),className:"text-xs font-bold hover:underline",style:{color:n.accent}},"Xem tất cả →")),React.createElement("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"},E.slice(0,4).map(e=>{const t=ue.filter(s=>s.notebookId===e.id).length;return React.createElement("div",{key:e.id,onClick:()=>{be(e.id),M("notebooks")},style:{backgroundColor:n.card,borderColor:n.border},className:"rounded-3xl border-2 overflow-hidden cursor-pointer hover:-translate-y-1 transition shadow-xs"},React.createElement("div",{style:{backgroundColor:e.color},className:"h-24 p-4 flex items-center justify-between"},React.createElement("span",null),React.createElement("span",{className:"px-2.5 py-1 rounded-full bg-white/80 text-[#5A4E63] text-[11px] font-extrabold"},e.subject)),React.createElement("div",{className:"p-4"},React.createElement("h3",{className:"font-extrabold text-sm truncate"},e.title),React.createElement("p",{className:"text-xs opacity-70 line-clamp-1 mt-1"},e.desc),React.createElement("div",{className:"mt-3 pt-2 border-t flex items-center justify-between text-[11px] font-bold opacity-75",style:{borderColor:n.border}},React.createElement("span",null,t," trang"),React.createElement("span",null,"Mở sổ →"))))}))),
          React.createElement("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6"},React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"lg:col-span-2 p-5 rounded-3xl border"},React.createElement("div",{className:"flex items-center justify-between mb-4"},React.createElement("h3",{className:"font-extrabold text-base"},"Tiếp tục bài học gần đây"),React.createElement("button",{onClick:()=>xe(!0),className:"text-xs font-bold",style:{color:n.accent}},"+ Trang mới")),React.createElement("div",{className:"space-y-2.5"},ue.slice(0,5).map(e=>{var t;return React.createElement("div",{key:e.id,onClick:()=>{ce(e.id),M("editor")},style:{backgroundColor:n.accentSoft},className:"p-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:opacity-90"},React.createElement("div",{className:"flex items-center gap-3 min-w-0"},React.createElement("span",{className:"text-xl"},((t=NOTE_TEMPLATES.find(s=>s.type===e.type))==null?void 0:t.icon)||""),React.createElement("div",{className:"min-w-0"},React.createElement("h4",{className:"font-bold text-sm truncate"},e.title),React.createElement("p",{className:"text-[11px] opacity-70"},e.subject," • ",new Date(e.updatedAt).toLocaleDateString("vi-VN")))),React.createElement("span",{className:"text-xs font-bold opacity-60"},"→"))}))),React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"p-5 rounded-3xl border flex flex-col justify-between"},React.createElement("div",null,React.createElement("div",{className:"flex items-center justify-between mb-4"},React.createElement("h3",{className:"font-extrabold text-base"},"Mục tiêu hôm nay"),React.createElement("button",{onClick:()=>M("planner"),className:"text-xs font-bold",style:{color:n.accent}},"Planner")),React.createElement("div",{className:"space-y-2"},Tk.slice(0,4).map(e=>React.createElement("div",{key:e.id,onClick:()=>{e.completed||ve(2);const t=ne.map(s=>s.id===e.id?{...s,completed:!s.completed}:s);se(t),W({tasks:t})},style:{backgroundColor:n.accentSoft},className:"p-3 rounded-2xl flex items-center gap-2.5 cursor-pointer"},React.createElement("span",null,e.completed?"✓":"○"),React.createElement("span",{className:`text-xs font-bold ${e.completed?"line-through opacity-50":""}`},e.title))))),React.createElement("button",{onClick:()=>M("planner"),style:{backgroundColor:n.accent},className:"mt-4 w-full py-2.5 rounded-xl text-white text-xs font-bold"},"+ Thêm kế hoạch học tập")))),

        w==="notebooks"&&React.createElement("div",{className:"space-y-6"},
          nbEd&&React.createElement(NbEditModal,{nb:nbEd,theme:n,onClose:()=>setNbEd(null),onSave:p=>{const x=Eall.map(r=>r.id===nbEd.id?{...r,...p,updatedAt:new Date().toISOString()}:r);G(x),W({notebooks:x}),setNbEd(null),K("Đã lưu sổ tay ✓")},onDelete:()=>{const x=Eall.filter(i=>i.id!==nbEd.id);const pr={...de.current.prefs,tombs:meoFeat.dataMerge.addTombs(de.current.prefs,"notebooks",[nbEd.id],Date.now())};de.current.prefs=pr,d(pr),G(x),W({notebooks:x,prefs:pr}),pe===nbEd.id&&be(null),setNbEd(null)}}),
          React.createElement("div",{className:"flex flex-wrap items-center justify-between gap-4"},React.createElement("h2",{className:"text-2xl font-extrabold"},"Quản Lý Sổ Tay (My Notebooks)"),React.createElement("button",{onClick:()=>Le(!0),style:{backgroundColor:n.accent},className:"px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow"},"+ Tạo cuốn sổ mới")),
          React.createElement("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"},E.map(e=>{const t=pe===e.id,s=ue.filter(r=>r.notebookId===e.id).length;return React.createElement("div",{key:e.id,onClick:()=>{be(e.id),we(0)},style:{backgroundColor:n.card,borderColor:t?n.accent:n.border},className:`rounded-3xl border-2 overflow-hidden cursor-pointer transition ${t?"ring-2 ring-[#E88BAE]":""}`},React.createElement("div",{style:{backgroundColor:e.color},className:"h-20 p-4 flex items-center justify-between"},React.createElement("span",null),React.createElement("div",{className:"flex items-center gap-1.5"},React.createElement("button",{onClick:r=>{r.stopPropagation(),setNbEd(e)},className:"px-2 py-1 rounded-lg bg-white/80 text-[#5A4E63] text-xs font-bold hover:bg-white",title:"Tùy chỉnh sổ"},"Sửa"),React.createElement("button",{onClick:r=>{r.stopPropagation(),te({title:"Xóa cuốn sổ này?",message:"Cuốn sổ sẽ bị xóa khỏi danh sách.",onConfirm:()=>{const x=Eall.filter(i=>i.id!==e.id);const pr={...de.current.prefs,tombs:meoFeat.dataMerge.addTombs(de.current.prefs,"notebooks",[e.id],Date.now())};de.current.prefs=pr,d(pr),G(x),W({notebooks:x,prefs:pr}),pe===e.id&&be(null),te(null)}})},className:"px-2 py-1 rounded-lg bg-white/80 text-rose-500 text-xs font-bold hover:bg-white",title:"Xóa sổ"},"Xóa"))),React.createElement("div",{className:"p-4"},yt===e.id?React.createElement("div",{onClick:r=>r.stopPropagation(),className:"flex gap-1.5"},React.createElement("input",{autoFocus:!0,value:Ie,onChange:r=>Pe(r.target.value),onKeyDown:r=>{r.key==="Enter"&&dt(e.id,Ie),r.key==="Escape"&&je(null)},className:"w-full px-2 py-1 rounded-lg border text-xs font-bold",style:{borderColor:n.accent}}),React.createElement("button",{onClick:()=>dt(e.id,Ie),style:{backgroundColor:n.accent},className:"px-2.5 py-1 rounded-lg text-white text-xs font-bold"},"Lưu")):React.createElement("h3",{className:"font-extrabold text-sm"},e.title),React.createElement("p",{className:"text-xs opacity-70 mt-1 line-clamp-1"},e.desc),React.createElement("div",{className:"mt-3 flex items-center justify-between text-xs font-bold"},React.createElement("span",{style:{color:n.accent}},s," trang"),React.createElement("span",{className:"opacity-60"},e.subject))))})),
          pe&&(()=>{var x;const e=E.find(i=>i.id===pe),t=ue.filter(i=>i.notebookId===pe),s=Math.min(ft,Math.max(t.length-1,0)),r=t[s]||null;return React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"p-6 rounded-3xl border-2 space-y-5"},React.createElement("div",{className:"flex flex-wrap items-center justify-between gap-3"},React.createElement("div",{className:"flex items-center gap-2"},React.createElement("h3",{className:"text-lg font-extrabold"},e==null?void 0:e.title),React.createElement("button",{onClick:()=>{je(pe),Pe((e==null?void 0:e.title)||"")},className:"px-2.5 py-1 rounded-xl text-xs font-bold border hover:opacity-80",style:{borderColor:n.border}},"Đổi tên sổ")),React.createElement("div",{className:"flex flex-wrap items-center gap-2"},React.createElement("div",{className:"flex p-1 rounded-2xl border",style:{backgroundColor:n.accentSoft,borderColor:n.border}},React.createElement("button",{onClick:()=>Qe("files"),style:{backgroundColor:Ce==="files"?n.card:"transparent",color:Ce==="files"?n.accent:n.text},className:"px-3 py-1 rounded-xl text-xs font-extrabold transition"},"Từng file"),React.createElement("button",{onClick:()=>setBook({nb:pe,pid:null}),style:{backgroundColor:Ce==="book"?n.card:"transparent",color:Ce==="book"?n.accent:n.text},className:"px-3 py-1 rounded-xl text-xs font-extrabold transition"},"Lật theo sách")),React.createElement("button",{onClick:()=>_e(NOTE_TEMPLATES[0],pe),style:{backgroundColor:n.accent},className:"px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs"},"+ Trang tự do"))),React.createElement("div",{className:"flex flex-wrap gap-2 p-3 rounded-2xl",style:{backgroundColor:n.accentSoft}},React.createElement("span",{className:"text-xs font-extrabold self-center mr-1"},"Thêm mục vào sổ:"),NOTE_TEMPLATES.filter(i=>["vocabulary","grammar","kanji","reading","listening","writing"].includes(i.type)).map(i=>React.createElement("button",{key:i.id,onClick:()=>_e(i,pe),style:{backgroundColor:n.card,borderColor:n.border},className:"px-3 py-1.5 rounded-xl border text-xs font-bold hover:scale-105 transition flex items-center gap-1.5 shadow-2xs"},React.createElement("span",null,"+ ",i.name.split("(")[0].trim())))),t.length===0?React.createElement("div",{className:"text-center py-8"},React.createElement(MochiMascot,{mood:"sleep",size:85,className:"mx-auto"}),React.createElement("p",{className:"text-xs font-bold mt-2 opacity-70"},"Cuốn sổ này đang trống. Bấm chọn một mục ở trên để bắt đầu ghi chép nhé!")):Ce==="files"?React.createElement("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4"},t.map(i=>{return React.createElement("div",{key:i.id,onClick:()=>{ce(i.id),M("editor")},style:{backgroundColor:n.accentSoft},className:"p-4 rounded-2xl cursor-pointer hover:scale-[1.01] transition"},React.createElement("div",{className:"flex items-center justify-between gap-2"},React.createElement("span",{className:"text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/80 text-[#5A4E63]"},i.type),React.createElement("button",{onClick:_=>{_.stopPropagation(),te({title:"Xóa trang ghi chép này?",message:`Trang "${i.title}" sẽ được chuyển vào Thùng rác (Trash).`,onConfirm:()=>{Te(i.id,!0),te(null)}})},className:"px-2 py-0.5 rounded-lg bg-white/80 text-rose-500 text-xs font-bold hover:bg-white",title:"Xóa trang này"},"Xóa")),React.createElement("h4",{className:"font-extrabold text-sm mt-2"},i.title),React.createElement("p",{className:"text-[11px] opacity-70 mt-3"},new Date(i.updatedAt).toLocaleDateString("vi-VN")))})):React.createElement("div",{className:"space-y-4"},React.createElement("div",{className:"flex items-center justify-between px-2"},React.createElement("button",{disabled:s===0,onClick:()=>we(i=>Math.max(0,i-1)),style:{backgroundColor:n.accentSoft},className:"px-4 py-2 rounded-xl text-xs font-extrabold disabled:opacity-40 hover:opacity-85 transition"},"◀ Trang trước"),React.createElement("span",{className:"text-xs font-extrabold px-4 py-1.5 rounded-full",style:{backgroundColor:n.accentSoft}},"Trang ",s+1," / ",t.length),React.createElement("button",{disabled:s>=t.length-1,onClick:()=>we(i=>Math.min(t.length-1,i+1)),style:{backgroundColor:n.accentSoft},className:"px-4 py-2 rounded-xl text-xs font-extrabold disabled:opacity-40 hover:opacity-85 transition"},"Trang sau ▶")),r&&React.createElement("div",{style:{backgroundColor:(PAPER_STYLES.find(i=>i.id===r.paperStyle)||PAPER_STYLES[1]).bg,fontFamily:r.fontFamily||S.fontFamily,color:"#3D3545"},className:"p-6 md:p-10 rounded-3xl border-2 border-[#E8DDF8] shadow-xl relative min-h-[420px] flex flex-col justify-between"},React.createElement("div",{className:"hidden md:block absolute top-0 bottom-0 left-6 w-1 border-r-2 border-dashed border-[#E8DDF8]"}),React.createElement("div",{className:"md:pl-6 space-y-4"},React.createElement("div",{className:"flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-dashed border-[#E8DDF8]"},React.createElement("div",null,React.createElement("span",{className:"text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#FCECF3] text-[#5A4E63]"},r.type),React.createElement("h4",{className:"text-xl font-extrabold mt-2"},r.title)),React.createElement("div",{className:"flex items-center gap-2"},React.createElement("button",{onClick:()=>{ce(r.id),M("editor")},style:{backgroundColor:n.accent},className:"px-4 py-2 rounded-xl text-white text-xs font-bold shadow"},"✍️ Viết & Sửa trang này"),React.createElement("button",{onClick:()=>{te({title:"Xóa trang sách này?",message:`Trang "${r.title}" sẽ được chuyển vào Thùng rác (Trash).`,onConfirm:()=>{Te(r.id,!0),we(i=>Math.max(0,i-1)),te(null)}})},className:"px-3 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold hover:bg-rose-100",title:"Xóa trang này"},"Xóa trang"))),r.type==="vocabulary"&&(r.vocabRows||[]).length>0&&React.createElement("div",{className:"overflow-x-auto rounded-2xl border border-[#E8DDF8] bg-white/90"},React.createElement("table",{className:"w-full text-xs text-left border-collapse"},React.createElement("thead",null,React.createElement("tr",{className:"bg-[#FCECF3] font-extrabold"},ye(r).map(i=>React.createElement("th",{key:i.id,className:"p-2 border-b"},i.label)))),React.createElement("tbody",null,r.vocabRows.map(i=>React.createElement("tr",{key:i.id,className:"border-b"},ye(r).map(F=>React.createElement("td",{key:F.id,className:"p-2"},i[F.id]||""))))))),React.createElement("div",{className:"text-sm leading-relaxed",dangerouslySetInnerHTML:{__html:r.content||'<p class="opacity-60 italic">Trang này chưa có văn bản tự do. Bấm "Viết & Sửa trang này" để ghi chép...</p>'}})),React.createElement("div",{className:"md:pl-6 pt-4 mt-6 border-t border-dashed border-[#E8DDF8] flex justify-between text-[11px] opacity-65 font-bold"},React.createElement("span",null,e==null?void 0:e.title),React.createElement("span",null,"— Trang ",s+1," —")))))})()),

        ["favorites","recent","trash"].includes(w)&&React.createElement("div",{className:"space-y-5"},React.createElement("div",{className:"flex flex-wrap items-center justify-between gap-3"},React.createElement("h2",{className:"text-2xl font-extrabold"},w==="trash"?"Thùng Rác (Trash)":w==="favorites"?"Trang Yêu Thích (Favorites)":"Chỉnh Sửa Gần Đây"),w!=="trash"&&React.createElement("button",{onClick:()=>xe(!0),style:{backgroundColor:n.accent},className:"px-4 py-2 rounded-xl text-white text-xs font-bold shadow"},"+ Tạo trang mới")),(()=>{let e=w==="trash"?$t:ue;return w==="favorites"&&(e=e.filter(t=>t.favorite)),e.length===0?React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"p-12 rounded-3xl border text-center"},React.createElement(MochiMascot,{mood:"reading",size:105,className:"mx-auto"}),React.createElement("p",{className:"mt-3 font-bold text-sm opacity-75"},w==="trash"?"Thùng rác đang trống sạch sẽ!":"Chưa có trang ghi chép nào trong mục này.")):React.createElement("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"},e.map(t=>React.createElement("div",{key:t.id,style:{backgroundColor:n.card,borderColor:n.border},className:"p-5 rounded-3xl border shadow-xs flex flex-col justify-between"},React.createElement("div",null,React.createElement("div",{className:"flex items-center justify-between gap-2"},React.createElement("span",{style:{backgroundColor:n.accentSoft},className:"px-2.5 py-1 rounded-full text-[11px] font-extrabold"},t.subject," • ",t.type),React.createElement("div",{className:"flex items-center gap-1.5"},w==="trash"?React.createElement(React.Fragment,null,React.createElement("button",{onClick:()=>Te(t.id,!1),className:"text-xs font-bold text-emerald-600 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100"},"Khôi phục"),React.createElement("button",{onClick:()=>{te({title:"Xóa vĩnh viễn trang này?",message:"Hành động này không thể hoàn tác.",onConfirm:()=>{const s=J.filter(r=>r.id!==t.id);const pr={...de.current.prefs,tombs:meoFeat.dataMerge.addTombs(de.current.prefs,"pages",[t.id],Date.now())};de.current.prefs=pr,d(pr),U(s),W({pages:s,prefs:pr}),te(null),K("Đã xóa vĩnh viễn trang ghi chép")}})},className:"text-xs font-bold text-rose-600 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100"},"Xóa hẳn")):React.createElement(React.Fragment,null,React.createElement("button",{onClick:()=>ut(t),title:"Nhân bản trang",className:"px-2 py-1 rounded-lg hover:bg-black/5 text-xs font-bold"},"Sao chép"),React.createElement("button",{onClick:()=>{te({title:"Xóa trang ghi chép này?",message:`Trang "${t.title}" sẽ được chuyển vào Thùng rác (Trash).`,onConfirm:()=>{Te(t.id,!0),te(null)}})},title:"Xóa trang",className:"px-2 py-1 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100"},"Xóa")))),React.createElement("h3",{onClick:()=>{w!=="trash"&&(ce(t.id),M("editor"))},className:"font-extrabold text-base mt-3 cursor-pointer hover:underline"},t.title)),React.createElement("div",{className:"mt-4 pt-3 border-t flex items-center justify-between text-xs opacity-70",style:{borderColor:n.border}},React.createElement("span",null,new Date(t.updatedAt).toLocaleDateString("vi-VN")),w!=="trash"&&React.createElement("button",{onClick:()=>{ce(t.id),M("editor")},className:"font-bold",style:{color:n.accent}},"Mở trang →")))))})()),

        w==="editor"&&React.createElement("div",{className:"space-y-4"},k?(rm?React.createElement(ReadView,{page:k,theme:n,defFont:S.fontFamily,notebooks:E,onBack:()=>{be(k.notebookId),M("notebooks")},onEdit:()=>setRm(!1),onBook:()=>setBook({nb:k.notebookId,pid:k.id}),onFav:()=>$({favorite:!k.favorite}),onSyncVocab:rows=>syncNotebookRowsToVocab(rows)}):React.createElement(React.Fragment,null,React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"p-4 rounded-3xl border space-y-3 no-print"},React.createElement("div",{className:"flex flex-wrap items-center justify-between gap-3"},React.createElement("div",{className:"flex flex-wrap items-center gap-2"},React.createElement("button",{onClick:()=>{be(k.notebookId),M("notebooks")},style:{backgroundColor:n.accentSoft},className:"px-3 py-1.5 rounded-xl text-xs font-extrabold hover:opacity-80"},"← Về sổ tay"),React.createElement("button",{onClick:()=>setRm(!0),style:{backgroundColor:n.accentSoft},className:"tap-fx px-3 py-1.5 rounded-xl text-xs font-extrabold"},"Chế độ đọc"),React.createElement("button",{onClick:()=>setBook({nb:k.notebookId,pid:k.id}),style:{backgroundColor:n.accentSoft},className:"tap-fx px-3 py-1.5 rounded-xl text-xs font-extrabold"},"Mở sách (lật trang)"),React.createElement("select",{value:k.notebookId,onChange:e=>$({notebookId:e.target.value}),style:{backgroundColor:n.accentSoft},className:"px-3 py-1.5 rounded-xl text-xs font-extrabold"},E.map(e=>React.createElement("option",{key:e.id,value:e.id},e.title))),React.createElement("select",{value:k.type,onChange:e=>$({type:e.target.value}),style:{backgroundColor:n.accentSoft},className:"px-3 py-1.5 rounded-xl text-xs font-extrabold"},React.createElement("option",{value:"free"},"Ghi chú tự do"),React.createElement("option",{value:"vocabulary"},"Mục Từ vựng"),React.createElement("option",{value:"grammar"},"Mục Ngữ pháp"),React.createElement("option",{value:"kanji"},"Mục Kanji & Hánzi"),React.createElement("option",{value:"reading"},"Mục Đọc hiểu"),React.createElement("option",{value:"listening"},"Mục Luyện nghe"),React.createElement("option",{value:"writing"},"✍️ Mục Luyện viết"))),React.createElement("div",{className:"flex flex-wrap items-center gap-2"},React.createElement("button",{onClick:()=>Oe(!0),style:{backgroundColor:n.accentSoft},className:"px-3 py-1.5 rounded-xl text-xs font-bold"},"✒️ Font chữ"),React.createElement("select",{value:k.paperStyle||"cream",onChange:e=>$({paperStyle:e.target.value}),style:{backgroundColor:n.accentSoft},className:"px-3 py-1.5 rounded-xl text-xs font-bold"},PAPER_STYLES.map(e=>React.createElement("option",{key:e.id,value:e.id},e.name))),React.createElement("button",{onClick:()=>Ye(!Ze),style:{backgroundColor:n.accentSoft},className:"px-3 py-1.5 rounded-xl text-xs font-bold"},"Sticker"),React.createElement("button",{onClick:()=>window.print(),style:{backgroundColor:n.accentSoft},className:"px-3 py-1.5 rounded-xl text-xs font-bold"},"PDF"),React.createElement("button",{onClick:()=>$({favorite:!k.favorite}),className:"px-2.5 py-1.5 rounded-xl border text-xs",title:"Yêu thích"},k.favorite?"★":"☆"),React.createElement("button",{onClick:()=>ut(k),style:{backgroundColor:n.accentSoft},className:"px-2.5 py-1.5 rounded-xl text-xs font-bold",title:"Nhân bản trang"},"Sao chép"),React.createElement("button",{onClick:()=>{te({title:"Xóa trang ghi chép này?",message:`Trang "${k.title}" sẽ được chuyển vào Thùng rác (Trash).`,onConfirm:()=>{const e=k.notebookId;Te(k.id,!0),be(e),M("notebooks"),te(null)}})},className:"px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold hover:bg-rose-100",title:"Xóa trang này"},"Xóa trang"))),Ze&&React.createElement("div",{style:{backgroundColor:n.accentSoft},className:"p-3 rounded-2xl flex flex-wrap items-center gap-2"},React.createElement("span",{className:"text-xs font-extrabold mr-2"},"Dán sticker lên trang:"),MOCHI_STICKERS.map((e,t)=>React.createElement("button",{key:t,onClick:()=>{$({stickers:[...k.stickers||[],{id:"stk-"+Date.now(),emoji:e,x:Math.floor(Math.random()*65)+10,y:Math.floor(Math.random()*40)+10}]}),Ye(!1)},className:"w-9 h-9 rounded-xl bg-white hover:scale-110 transition text-xl flex items-center justify-center shadow-xs"},e))),React.createElement("div",{className:"flex flex-wrap items-center gap-1.5 pt-2 border-t text-xs font-bold",style:{borderColor:n.border}},React.createElement("button",{onClick:()=>ie("undo"),className:"px-2 py-1 rounded hover:bg-black/5"},"↩"),React.createElement("button",{onClick:()=>ie("redo"),className:"px-2 py-1 rounded hover:bg-black/5"},"↪"),React.createElement("button",{onClick:()=>ie("formatBlock","H1"),className:"px-2 py-1 rounded hover:bg-black/5"},"H1"),React.createElement("button",{onClick:()=>ie("formatBlock","H2"),className:"px-2 py-1 rounded hover:bg-black/5"},"H2"),React.createElement("button",{onClick:()=>ie("bold"),className:"px-2 py-1 rounded hover:bg-black/5 font-extrabold"},"B"),React.createElement("button",{onClick:()=>ie("italic"),className:"px-2 py-1 rounded hover:bg-black/5 italic"},"I"),React.createElement("button",{onClick:()=>ie("underline"),className:"px-2 py-1 rounded hover:bg-black/5 underline"},"U"),React.createElement("button",{onClick:()=>ie("hiliteColor","#FFF0C9"),className:"px-2 py-1 rounded bg-[#FFF0C9] text-[#5E503F]"},"Highlight"),React.createElement("input",{type:"color",onChange:e=>ie("foreColor",e.target.value),className:"w-6 h-6 rounded cursor-pointer",title:"Màu chữ"}),React.createElement("button",{onClick:()=>ie("insertUnorderedList"),className:"px-2 py-1 rounded hover:bg-black/5"},"• List"),React.createElement("button",{onClick:()=>ie("insertOrderedList"),className:"px-2 py-1 rounded hover:bg-black/5"},"1. List"),React.createElement("button",{onClick:()=>{Z.current&&(Z.current.focus(),document.execCommand("insertHTML",!1,'<div style="background:#FFF8E3; border-left:4px solid #E88BAE; padding:12px 16px; border-radius:10px; margin:12px 0;"><strong>Ghi chú từ Mochi:</strong><br/>Nhập nội dung cần nhớ...</div><p></p>'),$({content:Z.current.innerHTML}))},className:"px-2.5 py-1 rounded hover:bg-black/5"},"Khung ghi chú"),React.createElement("button",{onClick:()=>{var e;return(e=at.current)==null?void 0:e.click()},className:"px-2.5 py-1 rounded hover:bg-black/5"},"Chèn ảnh"),React.createElement("input",{ref:at,type:"file",accept:"image/*",onChange:Tt,className:"hidden"}))),(()=>{const e=PAPER_STYLES.find(t=>t.id===k.paperStyle)||PAPER_STYLES[1];return React.createElement("div",{style:{backgroundColor:e.bg,backgroundImage:e.pattern,backgroundSize:e.id==="grid"?"24px 24px":e.id==="dots"?"20px 20px":"auto",fontFamily:k.fontFamily||S.fontFamily,fontSize:`${k.fontSize||S.fontSize}px`,color:"#3D3545"},className:"min-h-[620px] p-6 md:p-12 rounded-3xl shadow-xl border-2 border-[#E8DDF8] relative overflow-hidden"},S.decorationsEnabled&&React.createElement("div",{className:"w-32 h-5 bg-[#F8DDE8]/85 rotate-[-2deg] mx-auto -mt-8 mb-6 rounded-xs"}),(k.stickers||[]).map(t=>React.createElement("div",{key:t.id,style:{left:`${t.x}%`,top:`${t.y}%`},onClick:()=>$({stickers:k.stickers.filter(s=>s.id!==t.id)}),title:"Bấm để gỡ sticker",className:"absolute text-3xl cursor-pointer hover:scale-125 transition select-none z-10"},t.emoji)),React.createElement("input",{type:"text",value:k.title,onChange:t=>$({title:t.target.value}),placeholder:"Nhập tiêu đề trang ghi chép...",className:"w-full text-2xl md:text-3xl font-extrabold bg-transparent border-b-2 border-dashed border-[#E8DDF8] pb-3 mb-6 focus:outline-none focus:border-[#E88BAE]"}),k.type==="vocabulary"&&(()=>{const t=ye(k);return React.createElement("div",{className:"mb-8 space-y-3"},React.createElement("div",{className:"flex flex-wrap items-center justify-between gap-2 bg-white/90 p-3 rounded-2xl border border-[#F3C6D8]"},React.createElement("span",{className:"text-xs font-extrabold"},"Bảng Từ Vựng Liên Kết (",(k.vocabRows||[]).length," từ)"),React.createElement("div",{className:"flex flex-wrap gap-2"},React.createElement("button",{onClick:At,className:"px-3 py-1.5 rounded-xl bg-[#E88BAE] text-white text-xs font-bold"},"+ Thêm dòng"),React.createElement("button",{onClick:Lt,className:"px-3 py-1.5 rounded-xl bg-[#E8DDF8] text-[#534766] text-xs font-bold"},"+ Thêm cột"),React.createElement("button",{onClick:()=>Re(!0),className:"px-3 py-1.5 rounded-xl bg-[#DCEBFA] text-[#46566E] text-xs font-bold"},"Nhập hàng loạt"),React.createElement("button",{onClick:()=>syncNotebookRowsToVocab(),className:"px-3 py-1.5 rounded-xl bg-[#FFF0C9] text-[#5E503F] text-xs font-bold"},"Đồng bộ vào Kho Từ Vựng & Học bài"))),React.createElement("div",{className:"overflow-x-auto rounded-2xl border border-[#E8DDF8] bg-white/95"},React.createElement("table",{className:"w-full text-xs text-left border-collapse",onKeyDown:cellArrowNav},React.createElement("thead",null,React.createElement("tr",{className:"bg-[#FCECF3] text-[#5A4E63] font-extrabold"},t.map(s=>React.createElement("th",{key:s.id,"data-col":s.id,className:"p-2.5 border-b border-r border-[#F3C6D8]/60 min-w-[110px]"+(window.__dragCol===s.id?" col-dragging":"")},React.createElement("div",{className:"flex items-center justify-between gap-1"},t.length>1&&React.createElement("span",{className:"col-drag-handle text-[11px]",title:"Giữ & kéo để đổi vị trí cột",onPointerDown:ev=>startColDrag(ev,s.id)},"⋮⋮"),React.createElement("input",{value:s.label,readOnly:!!FIXED_COLS[s.id],onChange:r=>Mt(s.id,r.target.value),className:"w-full bg-transparent font-extrabold focus:outline-none "+(FIXED_COLS[s.id]?"cursor-default":"focus:underline"),title:FIXED_COLS[s.id]?"Cột cố định, liên kết với Flashcard & View":"Bấm để đổi tên cột"}),t.length>1&&!FIXED_COLS[s.id]&&React.createElement("button",{onClick:()=>It(s.id),className:"text-[10px] text-rose-500 hover:bg-white rounded px-1",title:"Xóa cột này"},"✕")))),React.createElement("th",{className:"p-2.5 border-b text-center w-28"},"Trạng thái"),React.createElement("th",{className:"p-2.5 border-b text-center w-20"},"Liên kết"),React.createElement("th",{className:"p-2.5 border-b text-center w-10"},"Xóa"))),React.createElement("tbody",null,(k.vocabRows||[]).map(s=>{
          const dupOther=Ge.ready&&s.word&&Ge.vocab.find(v=>norm(v.word)===norm(s.word)&&!(v.tags||[]).includes("row:"+s.id));
          const isLinked=Ge.ready&&Ge.vocab.some(v=>(v.tags||[]).includes("row:"+s.id)||norm(v.word)===norm(s.word));
          return React.createElement("tr",{key:s.id,className:"border-b hover:bg-[#FFFDF8]"},t.map((r,x)=>React.createElement("td",{key:r.id,"data-col":r.id,className:"p-2 border-r border-[#F3C6D8]/40"+(window.__dragCol===r.id?" col-dragging":"")},React.createElement("input",{value:s[r.id]||"",onChange:i=>pt(s.id,r.id,i.target.value),placeholder:r.label+"...",className:`w-full bg-transparent focus:outline-none ${x===0?"font-bold":""}`}),r.id==="word"&&dupOther&&React.createElement("div",{className:"text-[10px] font-bold text-amber-700 mt-0.5"},"⚠️ Đã có trong kho từ"))),React.createElement("td",{className:"p-2 text-center"},React.createElement("select",{value:s.status,onChange:r=>pt(s.id,"status",r.target.value),className:"px-2 py-1 rounded bg-[#F8F4FA] text-[11px] font-bold"},React.createElement("option",{value:"learning"},"Đang học"),React.createElement("option",{value:"hard"},"Từ khó"),React.createElement("option",{value:"mastered"},"Đã thuộc"))),React.createElement("td",{className:"p-2 text-center"},isLinked?React.createElement("span",{className:"text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"},"Đã liên kết"):React.createElement("button",{onClick:()=>syncNotebookRowsToVocab([s]),className:"tap-fx text-[11px] font-bold px-2 py-1 rounded-lg bg-[#FFF0C9] text-[#5E503F]"},"+ Kho từ")),React.createElement("td",{className:"p-2 text-center"},React.createElement("button",{onClick:()=>jt(s.id),className:"text-rose-500 hover:bg-rose-50 px-1.5 py-0.5 rounded font-bold",title:"Xóa dòng này"},"Xóa")))}),React.createElement("tr",{key:"add-row-bottom"},React.createElement("td",{colSpan:t.length+3,className:"p-1.5 border-t border-[#F3C6D8]/60 bg-[#FFF8FB]"},React.createElement("button",{type:"button",title:"Thêm dòng từ vựng mới",onClick:ev=>{const tb=ev.currentTarget.closest("table");At();setTimeout(()=>{const rs=tb?tb.querySelectorAll("tbody tr"):[];const last=rs[rs.length-2];const inp=last&&last.querySelector("input,textarea");inp&&inp.focus()},80)},className:"tap-fx w-full py-1.5 rounded-xl text-lg font-extrabold leading-none text-[#E88BAE] hover:bg-[#FCECF3]"},"+")))))))})(),k.type==="grammar"&&(()=>{const t=k.grammarList||(k.grammarData?[{id:"g0",...k.grammarData}]:[]),s=i=>$({grammarList:i}),r=(i,F)=>s(t.map(_=>_.id===i?{..._,...F}:_)),x=(i,F)=>{i.preventDefault(),i.stopPropagation(),F()};return React.createElement("div",{className:"mb-8 space-y-4"},t.map((i,F)=>{var oe;const _=((oe=i.color)!=null?oe:F%2)%G_PALETTES.length,O=G_PALETTES[_];return React.createElement("details",{key:i.id,open:!0,className:"rounded-3xl border-2 overflow-hidden",style:{backgroundColor:O.bg,borderColor:O.border,color:"#3b3340"}},React.createElement("summary",{className:"cursor-pointer select-none px-5 py-3 flex items-center gap-2.5 font-extrabold",style:{backgroundColor:O.head}},React.createElement("span",{className:"px-2.5 py-0.5 rounded-full text-white text-xs",style:{backgroundColor:O.accent}},"#",F+1),React.createElement("span",{className:"flex-1 truncate"},i.structure||"Cấu trúc mới (điền vào các ô bên dưới)"),React.createElement("button",{type:"button",title:"Đổi màu",onClick:ee=>x(ee,()=>r(i.id,{color:(_+1)%G_PALETTES.length}))},"Màu"),React.createElement("button",{type:"button",title:"Nhân bản",onClick:ee=>x(ee,()=>s([...t.slice(0,F+1),{...i,id:"g"+Date.now()},...t.slice(F+1)]))},"⧉"),React.createElement("button",{type:"button",title:"Xóa cấu trúc",onClick:ee=>x(ee,()=>te({title:"Xóa cấu trúc ngữ pháp này?",message:"Cấu trúc này sẽ bị xóa khỏi sổ ngữ pháp.",onConfirm:()=>{s(t.filter(me=>me.id!==i.id));te(null)}}))},"Xóa")),React.createElement("div",{className:"p-4 grid grid-cols-1 md:grid-cols-2 gap-3"},GRAMMAR_FIELDS.map(ee=>React.createElement("div",{key:ee.key,className:"p-3 rounded-2xl bg-white/80 border",style:{borderColor:O.border}},React.createElement("label",{className:"block text-xs font-extrabold mb-1",style:{color:O.accent}},ee.label),React.createElement("textarea",{rows:2,value:i[ee.key]||"",placeholder:ee.hint,onChange:me=>r(i.id,{[ee.key]:me.target.value}),className:"w-full text-sm bg-transparent focus:outline-none resize-none"})))))}),React.createElement("button",{type:"button",onClick:()=>s([...t,{id:"g"+Date.now()}]),style:{borderColor:n.accent,color:n.accent},className:"w-full py-3 rounded-2xl border-2 border-dashed font-extrabold text-sm"},"Thêm cấu trúc ngữ pháp mới"))})(),k.type==="kanji"&&k.kanjiData&&React.createElement("div",{className:"mb-8 bg-white/95 p-6 rounded-3xl border border-[#E8DDF8] grid grid-cols-1 md:grid-cols-3 gap-6"},React.createElement("div",{className:"flex flex-col items-center justify-center p-6 rounded-3xl bg-[#FCFaff] border-2 border-dashed border-[#D5C3F2]"},React.createElement("input",{value:k.kanjiData.character||"",onChange:t=>$({kanjiData:{...k.kanjiData,character:t.target.value}}),className:"text-7xl font-bold text-center w-32 bg-transparent focus:outline-none"}),React.createElement("span",{className:"text-xs font-bold mt-2 text-[#82758A]"},"Chữ Hán / Kanji")),React.createElement("div",{className:"md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3"},[{key:"reading",label:"Âm đọc"},{key:"hanViet",label:"Âm Hán Việt"},{key:"meaning",label:"Nghĩa"},{key:"radical",label:"Bộ thủ"},{key:"strokes",label:"Số nét"},{key:"compounds",label:"Từ ghép"},{key:"example",label:"Ví dụ"},{key:"notes",label:"Ghi chú"}].map(t=>React.createElement("div",{key:t.key,className:"p-2.5 rounded-xl bg-[#F8F4FA]"},React.createElement("label",{className:"block text-[11px] font-extrabold text-[#82758A]"},t.label),React.createElement("input",{value:k.kanjiData[t.key]||"",onChange:s=>$({kanjiData:{...k.kanjiData,[t.key]:s.target.value}}),className:"w-full text-sm font-semibold bg-transparent focus:outline-none mt-0.5"}))))),["reading","listening","writing"].includes(k.type)&&React.createElement("div",{className:"mb-8 bg-white/95 p-5 rounded-3xl border border-[#F3C6D8] space-y-3"},Object.entries(k[`${k.type}Data`]||{}).map(([t,s])=>React.createElement("div",{key:t,className:"p-3 rounded-2xl bg-[#FFFDF8] border border-[#F3C6D8]"},React.createElement("label",{className:"block text-xs font-extrabold uppercase text-[#E88BAE] mb-1"},t),React.createElement("textarea",{rows:2,value:s,onChange:r=>{const x=`${k.type}Data`;$({[x]:{...k[x],[t]:r.target.value}})},className:"w-full text-sm bg-transparent focus:outline-none"})))),React.createElement("div",{ref:Z,contentEditable:!0,suppressContentEditableWarning:!0,onInput:t=>$({content:t.currentTarget.innerHTML}),className:"min-h-[360px] outline-none leading-relaxed"}),React.createElement(InkLayer,{key:k.id,page:k,theme:n,onChange:t=>$({ink:t})}))})())):React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"p-12 rounded-3xl border text-center"},React.createElement(MochiMascot,{mood:"study",size:110,className:"mx-auto"}),React.createElement("h3",{className:"font-extrabold text-lg mt-3"},"Chưa chọn trang ghi chép nào"),React.createElement("button",{onClick:()=>xe(!0),style:{backgroundColor:n.accent},className:"mt-4 px-5 py-2.5 rounded-xl text-white text-xs font-bold"},"+ Chọn mẫu & Tạo trang mới"))),

        

        w==="vocab"&&React.createElement(JlptVocab,{jl:Ge,theme:n,notebooks:E,stats:S.vstats||{},onSyncToNotebook:syncWordToNotebook}),

        w==="jstudy"&&React.createElement(JlptStudy,{jl:Ge,theme:n,stats:S.vstats||{},notebooks:E,nbViews:S.nbViews||{},onSaveNbViews:nv=>{const s0=de.current.prefs,O={...s0,nbViews:nv,tombs:meoFeat.dataMerge.tombsAfterNbViews(s0,nv,Date.now())};de.current.prefs=O,d(O),W({prefs:O})},reviewDone:S.jlptReviewDone||"",onReviewDone:day=>{const s0=de.current.prefs,O={...s0,jlptReviewDone:day};de.current.prefs=O,d(O),W({prefs:O})},onXp:ve}),

        w==="roadmap"&&React.createElement(N2Roadmap,{theme:n,subject:activeSubj,khoAdd:khoAddFn,khoRemove:khoRemoveFn,notebooks:E,done:S.roadmapDone||{},onDone:ids=>{const add=Array.isArray(ids)?ids:[ids];const m={...(S.roadmapDone||{})};add.forEach(k=>{m[k]=true});fe({roadmapDone:m})}}),

        w==="jyt"&&React.createElement(YtListening,{theme:n,prefs:S,getPrefs:()=>de.current.prefs,save:patch=>{const s0=de.current.prefs,O={...s0,...patch};de.current.prefs=O,d(O),W({prefs:O})},onSaveUnifiedVocab:saveUnifiedFromYt,findDup:Ge.findDup,notebooks:E,nbViews:S.nbViews||{},onSaveNbViews:nv=>{const s0=de.current.prefs,O={...s0,nbViews:nv,tombs:meoFeat.dataMerge.tombsAfterNbViews(s0,nv,Date.now())};de.current.prefs=O,d(O),W({prefs:O})},onXp:x=>ve(x),toast:K}),

        w==="games"&&React.createElement(GamesHub,{jl:Ge,theme:n,notebooks:E,nbViews:S.nbViews||{},stats:S.vstats||{},onXp:x=>ve(x),toast:K}),
        w==="jgame"&&React.createElement(JlptGame,{jl:GeAll,MochiPet:MochiPet,theme:n,shop:{owned:S.owned||["none","bow"],equipped:S.mochiAccessory,equip:id=>fe({mochiAccessory:id}),buy:async it=>{const ow=S.owned||["none","bow"];if(ow.includes(it.id))return;if(await Ge.spendGold(it.price)){fe({owned:[...ow,it.id],mochiAccessory:it.id});K("Đã mua "+it.name+"!")}else K("Chưa đủ vàng")}},pet:S.pet,xpEarned:Object.values(S.activity||{}).reduce((q,x)=>q+((x&&x.xp)||0),0),onPet:(np,msg)=>{const s0=de.current.prefs,O={...s0,pet:np};de.current.prefs=O,d(O),W({prefs:O}),msg&&K(msg)}}),

        w==="planner"&&React.createElement(SmartPlan,{jl:Ge,theme:n,S:S,onChange:pp=>fe({plan:{...planCfg(S),...pp}}),onGo:id=>M(id)}),
        w==="planner"&&React.createElement("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6"},React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"lg:col-span-2 p-6 rounded-3xl border"},React.createElement("h2",{className:"text-xl font-extrabold mb-4"},"Kế Hoạch Học Tập"),React.createElement("form",{onSubmit:e=>{if(e.preventDefault(),!he.title.trim())return;const s=[{id:"task-"+Date.now(),...he,subject:activeSubj,completed:!1,createdAt:new Date().toISOString()},...ne];se(s),W({tasks:s}),$e({...he,title:""}),K("Đã thêm mục tiêu mới!")},className:"flex flex-wrap gap-2 mb-5"},React.createElement("input",{required:!0,placeholder:"VD: Ôn 5 cấu trúc N2...",value:he.title,onChange:e=>$e({...he,title:e.target.value}),className:"flex-1 px-4 py-2 rounded-xl border text-sm",style:{borderColor:n.border}}),React.createElement("input",{type:"date",value:he.deadline,onChange:e=>$e({...he,deadline:e.target.value}),className:"px-3 py-2 rounded-xl border text-xs font-bold",style:{borderColor:n.border}}),React.createElement("button",{type:"submit",style:{backgroundColor:n.accent},className:"px-4 py-2 rounded-xl text-white text-xs font-bold"},"+ Thêm")),React.createElement("div",{className:"space-y-2.5"},Tk.map(e=>React.createElement("div",{key:e.id,style:{backgroundColor:n.accentSoft},className:"p-3.5 rounded-2xl flex items-center justify-between"},React.createElement("div",{onClick:()=>{e.completed||ve(2);const t=ne.map(s=>s.id===e.id?{...s,completed:!s.completed}:s);se(t),W({tasks:t})},className:"flex items-center gap-3 cursor-pointer"},React.createElement("span",null,e.completed?"✓":"○"),React.createElement("div",null,React.createElement("p",{className:`text-sm font-bold ${e.completed?"line-through opacity-50":""}`},e.title),React.createElement("span",{className:"text-[11px] opacity-70"},"Deadline: ",e.deadline))),React.createElement("button",{onClick:()=>{const t=ne.filter(s=>s.id!==e.id);const pr={...de.current.prefs,tombs:meoFeat.dataMerge.addTombs(de.current.prefs,"tasks",[e.id],Date.now())};de.current.prefs=pr,d(pr),se(t),W({tasks:t,prefs:pr})},className:"text-xs font-bold px-2.5 py-1 rounded-lg bg-white/80 text-rose-500 hover:bg-white"},"Xóa"))))),React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"p-6 rounded-3xl border space-y-4"},React.createElement("div",{className:"flex items-center gap-3"},React.createElement(MochiMascot,{mood:"study",size:65}),React.createElement("h3",{className:"font-extrabold text-base"},"Nhật Ký Học Tập")),React.createElement("textarea",{rows:5,value:ze,onChange:e=>ot(e.target.value),placeholder:"Hôm nay bạn đã học được gì?...",className:"w-full p-3 rounded-2xl border text-sm",style:{borderColor:n.border}}),React.createElement("button",{onClick:()=>{if(!ze.trim())return;const s=[{id:"page-log-"+Date.now(),notebookId:"nb-personal",title:`Daily Log - ${new Date().toLocaleDateString("vi-VN")}`,type:"free",subject:"Personal",content:`<p>${ze}</p>`,trashed:!1,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},...J];U(s),W({pages:s}),ot(""),K("Đã lưu nhật ký hôm nay!")},style:{backgroundColor:n.accent},className:"w-full py-2.5 rounded-xl text-white text-xs font-bold"},"Lưu nhật ký"))),

        w==="settings"&&React.createElement("div",{className:"max-w-4xl mx-auto space-y-6"},
          React.createElement("h2",{className:"text-2xl font-extrabold"},"Cài Đặt & Dữ Liệu Tài Khoản"),
          React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"p-6 rounded-3xl border space-y-4"},
            React.createElement("h3",{className:"font-extrabold text-base"},"Tải & Cập Nhật Dữ Liệu Tài Khoản (Không bao giờ mất dữ liệu)"),
            React.createElement("p",{className:"text-xs opacity-80 leading-relaxed"},"Tài khoản: ",React.createElement("strong",null,o.email)," (",o.id==="preview-user"?"Chế độ xem trước cục bộ":"Đã bật tự động hợp nhất dữ liệu khi đăng nhập Supabase",")"),
            React.createElement("div",{className:"p-3.5 rounded-2xl text-xs space-y-1",style:{backgroundColor:n.accentSoft}},
              React.createElement("div",{className:"font-extrabold"},"Cơ chế bảo vệ dữ liệu thông minh:"),
              React.createElement("div",null,"• Bấm ",React.createElement("strong",null,"Tải dữ liệu tài khoản (.JSON)")," để lưu toàn bộ Sổ tay, Trang ghi chép, Từ vựng, View, Tiến độ học bài và XP về máy."),
              React.createElement("div",null,"• Khi đăng nhập trên thiết bị khác hoặc bấm ",React.createElement("strong",null,"Cập nhật từ file dữ liệu"),", hệ thống sẽ tự động gộp (Merge) dữ liệu mới và cũ, tuyệt đối không làm mất dữ liệu hiện có.")),
            React.createElement("div",{className:"flex flex-wrap gap-3"},
              React.createElement("button",{onClick:Jt,style:{backgroundColor:n.accent},className:"tap-fx px-5 py-2.5 rounded-xl text-white text-xs font-extrabold shadow"},"Tải dữ liệu tài khoản (.JSON)"),
              React.createElement("button",{onClick:()=>{var e;return(e=nt.current)==null?void 0:e.click()},style:{backgroundColor:n.accentSoft,color:n.text,borderColor:n.border},className:"tap-fx px-5 py-2.5 rounded-xl text-xs font-extrabold border"},"Cập nhật / Gộp dữ liệu từ file"),
              React.createElement("input",{ref:nt,type:"file",accept:".json",onChange:Kt,className:"hidden"}),
              React.createElement("button",{onClick:ct,className:"px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold ml-auto"},"Đăng xuất"))),
          React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"p-6 rounded-3xl border space-y-4"},
            React.createElement("h3",{className:"font-extrabold text-base"},"Hồ Sơ & Linh Vật Mochi"),
            React.createElement("div",{className:"flex flex-col sm:flex-row items-center gap-6"},
              React.createElement("div",{className:"p-4 rounded-3xl",style:{backgroundColor:n.accentSoft}},React.createElement(MochiMascot,{mood:S.mochiMood,accessory:S.mochiAccessory,outfit:true,size:115,grow:growOf(Ge.profile.level)})),
              React.createElement("div",{className:"flex-1 w-full space-y-3"},
                React.createElement("input",{value:S.displayName,onChange:e=>fe({displayName:e.target.value}),className:"w-full px-4 py-2 rounded-xl border text-sm font-bold",style:{borderColor:n.border}}),
                React.createElement("div",{className:"grid grid-cols-2 gap-3"},
                  React.createElement("select",{value:S.mochiAccessory,onChange:e=>fe({mochiAccessory:e.target.value}),className:"px-3 py-2 rounded-xl border text-xs font-bold",style:{borderColor:n.border}},SHOP_ITEMS.filter(x=>(S.owned||["none","bow"]).includes(x.id)).map(x=>React.createElement("option",{key:x.id,value:x.id},x.name))),
                  React.createElement("select",{value:S.mochiMood,onChange:e=>fe({mochiMood:e.target.value}),className:"px-3 py-2 rounded-xl border text-xs font-bold",style:{borderColor:n.border}},React.createElement("option",{value:"study"},"Học bài"),React.createElement("option",{value:"happy"},"Vui vẻ"),React.createElement("option",{value:"cheer"},"Cổ vũ"),React.createElement("option",{value:"sleep"},"Ngủ trưa")))))),
          React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"p-6 rounded-3xl border space-y-4"},
            React.createElement("h3",{className:"font-extrabold text-base"},"Màu sắc (pastel)"),
            React.createElement("div",{className:"grid grid-cols-2 sm:grid-cols-3 gap-3"},Object.values(THEMES).map(e=>React.createElement("button",{key:e.id,onClick:()=>fe({themeId:e.id}),style:{backgroundColor:e.sidebar,color:e.text,borderColor:S.themeId===e.id?e.accent:"transparent"},className:"p-4 rounded-2xl border-2 text-left"},React.createElement("span",{className:"font-extrabold text-sm"},e.name)))),
            React.createElement("h3",{className:"font-extrabold text-base mt-2"},"Phong cách giao diện"),
            React.createElement("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3"},UI_STYLES.map(e=>React.createElement("button",{key:e.id,onClick:()=>fe({uiStyle:e.id}),style:{backgroundColor:n.accentSoft,color:n.text,borderColor:(S.uiStyle||"anime")===e.id?n.accent:"transparent"},className:"tap-fx p-4 rounded-2xl border-2 text-left"},React.createElement("div",{className:"font-extrabold text-sm"},e.name),React.createElement("div",{className:"text-[11px] opacity-70 mt-0.5"},e.desc))))))),

    vt&&React.createElement("div",{className:"fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"},React.createElement("form",{onSubmit:_t,style:{backgroundColor:n.card,borderColor:n.border},className:"max-w-md w-full p-6 rounded-3xl border-2 shadow-2xl space-y-4"},React.createElement("div",{className:"flex justify-between"},React.createElement("h3",{className:"text-lg font-extrabold"},"Tạo Cuốn Sổ Mới"),React.createElement("button",{type:"button",onClick:()=>Le(!1)},"✕")),React.createElement("input",{required:!0,placeholder:"Tên cuốn sổ...",value:Y.title,onChange:e=>Fe({...Y,title:e.target.value}),className:"w-full px-3.5 py-2 rounded-xl border text-sm",style:{borderColor:n.border}}),React.createElement("div",{className:"grid grid-cols-2 gap-3"},React.createElement("div",{className:"px-3 py-2 text-xs font-bold self-center"},"Môn: "+((subjects.find(x=>x.id===activeSubj)||{}).label||""))),React.createElement("div",{className:"flex gap-2"},["#F8DDE8","#DCEBFA","#E8DDF8","#FFF0C9","#F4EBDD"].map(e=>React.createElement("button",{key:e,type:"button",onClick:()=>Fe({...Y,color:e}),style:{backgroundColor:e},className:`w-8 h-8 rounded-full border-2 ${Y.color===e?"border-[#5A4E63]":"border-transparent"}`}))),React.createElement("button",{type:"submit",style:{backgroundColor:n.accent},className:"w-full py-2.5 rounded-xl text-white text-sm font-bold"},"Tạo Sổ Tay"))),

    kt&&React.createElement("div",{className:"fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"},React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 rounded-3xl border-2 shadow-2xl"},React.createElement("div",{className:"flex justify-between mb-4"},React.createElement("h3",{className:"text-lg font-extrabold"},"Thư Viện Mẫu Ghi Chép"),React.createElement("button",{onClick:()=>xe(!1)},"✕")),React.createElement("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3"},NOTE_TEMPLATES.map(e=>React.createElement("div",{key:e.id,onClick:()=>_e(e),style:{backgroundColor:n.accentSoft},className:"p-4 rounded-2xl cursor-pointer hover:scale-[1.01] transition flex items-start gap-3"},React.createElement("div",null,React.createElement("h4",{className:"font-extrabold text-sm"},e.name),React.createElement("p",{className:"text-xs opacity-75 mt-1"},e.desc))))))),

    Be&&React.createElement("div",{className:"fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"},React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 rounded-3xl border-2 shadow-2xl space-y-4"},React.createElement("div",{className:"flex justify-between"},React.createElement("h3",{className:"text-lg font-extrabold"},"✒️ Thư Viện Font Chữ Đa Ngôn Ngữ"),React.createElement("button",{onClick:()=>Oe(!1)},"✕")),FONT_GROUPS.map(e=>React.createElement("div",{key:e.group},React.createElement("h4",{className:"text-xs font-extrabold uppercase opacity-70 mb-2"},e.group),React.createElement("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-2.5"},e.fonts.map(t=>React.createElement("button",{key:t.name,onClick:()=>{k&&$({fontFamily:t.family}),fe({fontFamily:t.family}),Oe(!1)},style:{fontFamily:t.family,backgroundColor:n.accentSoft},className:"p-3 rounded-2xl text-left"},React.createElement("div",{className:"text-xs font-bold opacity-70"},t.name),React.createElement("div",{className:"text-base mt-1"},t.sample)))))))),

    Nt&&React.createElement("div",{className:"fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"},React.createElement("div",{style:{backgroundColor:n.card,borderColor:n.border},className:"max-w-lg w-full p-6 rounded-3xl border-2 shadow-2xl space-y-4"},React.createElement("div",{className:"flex justify-between"},React.createElement("h3",{className:"text-lg font-extrabold"},"Nhập Từ Vựng Hàng Loạt"),React.createElement("button",{onClick:()=>Re(!1)},"✕")),React.createElement("p",{className:"text-xs opacity-75"},"Định dạng mỗi dòng: ",React.createElement("code",null,"Từ vựng - Cách đọc - Nghĩa - Ví dụ")),React.createElement("textarea",{rows:5,value:Ve,onChange:e=>et(e.target.value),placeholder:`猫 - ねこ - Con mèo - 猫が好きです。\n勉強 - べんきょう - Học tập - 日本語を勉強します。`,className:"w-full p-3 rounded-2xl border text-sm",style:{borderColor:n.border}}),React.createElement("button",{onClick:Pt,style:{backgroundColor:n.accent},className:"w-full py-2.5 rounded-xl text-white text-xs font-bold"},"Thêm vào bảng")))));
  };
}
