// Xử lý văn bản luyện nghe (tách từ YTL của legacy): link YouTube, ruby, tách câu, token hóa.
// Hàm thuần, không đụng DOM hay React.
export const youtubeText=(()=>{
  const TS=/^\s*[\[(]?(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?[\])]?\s*(?:[-–—:]\s*)?(.*)$/;
  const CUE=/(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{1,3})/g;
  const sec=(h,m,s,ms)=>(+h||0)*3600+(+m||0)*60+(+s||0)+(ms?+("0."+ms):0);
  const STOP=new Set("は が を に へ と で も の や か ね よ わ ぞ ぜ な さ て た だ です ます ました でした ません ましょう から まで より など ので のに けど けれど でも そして しかし ない ある いる する した して これ それ あれ この その あの ここ そこ こと もの ため よう という いう って ちょっと とても もう まだ また 私 僕 俺 彼 彼女 あなた".split(" "));
  const RB=/([\u4E00-\u9FFF\u3005\u3006\u30F6]+)[《（(]([\u3041-\u3096\u30A1-\u30FA\u30FC]+)[》）)]/g;

  const id=u=>{
    u=String(u||"").trim();if(/^[\w-]{11}$/.test(u))return u;let m=null;
    try{
      const x=new URL(/^https?:/i.test(u)?u:"https://"+u),h=x.hostname.replace(/^www\.|^m\./,"");
      if(h==="youtu.be")m=x.pathname.slice(1).split("/")[0];
      else if(/(^|\.)youtube(-nocookie)?\.com$/.test(h)){
        if(x.pathname==="/watch")m=x.searchParams.get("v");
        else{const p=x.pathname.split("/").filter(Boolean);if(["shorts","embed","live","v"].includes(p[0]))m=p[1]}
      }
    }catch(e){}
    return m&&/^[\w-]{11}$/.test(m)?m:null;
  };
  const rb=s=>{
    const segs=[];let last=0,m,has=false;RB.lastIndex=0;
    while((m=RB.exec(s))){if(m.index>last)segs.push([s.slice(last,m.index),null]);segs.push([m[1],m[2]]);last=m.index+m[0].length;has=true}
    if(last<s.length)segs.push([s.slice(last),null]);
    return{plain:segs.map(x=>x[0]).join(""),segs:has?segs:null};
  };
  const mkLine=(raw,t,e,viOverride)=>{
    let jp=raw,vi=viOverride||"";
    if(!vi){
      const p=raw.split(/\s*[|｜\t]\s*/);
      if(p.length>1){jp=p[0];vi=p.slice(1).join(" ").trim()}
    }
    const r=rb(jp.trim());if(!r.plain)return null;
    const o={t:t==null?null:t,text:r.plain};
    if(e!=null)o.e=e;if(vi)o.vi=vi;if(r.segs)o.rb=r.segs;
    o.tokens=buildTokens(jp.trim(),r.plain,r.segs);
    return o;
  };
  const tok=s=>{
    if(typeof Intl!=="undefined"&&Intl.Segmenter){
      return[...new Intl.Segmenter("ja",{granularity:"word"}).segment(s)].map(x=>({s:x.segment,w:!!x.isWordLike}));
    }
    return(s.match(/[\u4E00-\u9FFF\u3005]+[\u3041-\u3096]{0,2}|[\u30A1-\u30FA\u30FC]+|[\u3041-\u3096]+|[A-Za-z0-9]+|[\s\S]/g)||[])
      .map(x=>({s:x,w:/[\u3041-\u9FFF\uFF66-\uFF9F\w]/.test(x)}));
  };
  /* Tách câu thành mảng token { text, furigana, meaning, isWord } hỗ trợ <ruby>/<rt> */
  const buildTokens=(rawJp,plain,segs)=>{
    const furiMap=new Map();
    if(segs){
      segs.forEach(([txt,f])=>{if(f)furiMap.set(txt,f)});
    }
    const parts=tok(plain);
    return parts.map(p=>{
      const s=p.s;
      let furigana="";
      if(furiMap.has(s)){
        furigana=furiMap.get(s);
      }else{
        for(const[k,v] of furiMap.entries()){
          if(s.includes(k)&&k.length>=1){
            furigana=v;
            break;
          }
        }
      }
      return{text:s,furigana,meaning:"",isWord:p.w&&!/^[\s\u3000、。，．,.!?！？「」『』（）()…・~〜"'“”‘’]+$/.test(s)};
    });
  };
  /* Phân tích từ 2 khung song song (Scripts JP & Bản dịch VI) hoặc 1 khung kết hợp */
  const parseParallel=(rawJp,rawVi)=>{
    const jpLines=parse(rawJp);
    if(!rawVi||!String(rawVi).trim())return jpLines;
    const viRawLines=String(rawVi).replace(/\r/g,"").split("\n").map(x=>x.trim()).filter(Boolean);
    const viClean=viRawLines.map(ln=>{
      const m=TS.exec(ln);
      return m&&m[5].trim()?m[5].trim():ln;
    });
    return jpLines.map((item,idx)=>({
      ...item,
      vi:item.vi||viClean[idx]||""
    }));
  };
  const parse=raw=>{
    raw=String(raw||"").replace(/\r/g,"").replace(/^\uFEFF/,"");const out=[];
    if(/-->/.test(raw)){
      for(const b of raw.split(/\n{2,}/)){
        const ls=b.split("\n"),k=ls.findIndex(l=>l.includes("-->"));if(k<0)continue;
        const tm=[...ls[k].matchAll(CUE)];if(tm.length<2)continue;
        const t=sec(...tm[0].slice(1)),e=sec(...tm[1].slice(1));
        const txt=ls.slice(k+1).join("").replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").trim();if(!txt)continue;
        const prev=out[out.length-1];
        if(prev&&prev.text===txt){prev.e=e;continue}
        const o=mkLine(txt,t,e);if(o)out.push(o);
      }
    }else{
      const L=raw.split("\n").map(x=>x.trim()).filter(Boolean),tm=L.map(x=>TS.exec(x));
      const mc=tm.filter(Boolean),only=mc.filter(x=>!x[5].trim()).length,timed=mc.length>=2&&(mc.length>=L.length*.6||(only>=mc.length*.8&&mc.length>=L.length*.4));
      let pend=null;
      L.forEach((ln,i)=>{
        let t=null,txt=ln;
        if(timed){
          if(tm[i]){t=sec(tm[i][1],tm[i][2],tm[i][3],tm[i][4]);txt=tm[i][5].trim();if(!txt){pend=t;return}}
          else if(pend!=null){t=pend;pend=null}
        }
        if(timed){const o=mkLine(txt,t);if(o)out.push(o);return}
        if(/[|｜\t]/.test(txt)){const o=mkLine(txt,null);if(o)out.push(o);return}
        (txt.match(/[^。！？!?]+[。！？!?]*/g)||[]).forEach(s=>{const o=mkLine(s.trim(),null);if(o)out.push(o)});
      });
    }
    return out.slice(0,400);
  };
  const mk=(text,n)=>{
    const tk=tok(text),c=[];
    tk.forEach((x,i)=>{
      if(!x.w)return;const s=x.s;if(STOP.has(s)||/^[0-9０-９]+$/.test(s))return;
      const kj=/[\u4E00-\u9FFF]/.test(s),kt=/[\u30A1-\u30FA]/.test(s),hr=/^[\u3041-\u3096ー]+$/.test(s);
      if(!(kj||kt||(hr&&s.length>=3)))return;
      c.push({i,sc:(kj?3:kt?2:1)+Math.min(s.length,4)*.3+Math.random()*1.5});
    });
    c.sort((x,y)=>y.sc-x.sc);const pick=[];
    for(const x of c){if(pick.length>=n)break;if(pick.some(p=>Math.abs(p.i-x.i)<2))continue;pick.push(x)}
    pick.sort((x,y)=>x.i-y.i);
    return pick.length?{tk,idx:pick.map(p=>p.i)}:null;
  };
  const nz=s=>String(s||"").normalize("NFKC").replace(/[\s\u3000、。，．,.!?！？「」『』（）()…・~〜"'“”‘’]/g,"");
  const hira=s=>s.replace(/[\u30A1-\u30F6]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
  const checkFill=(ans,target,reading)=>{
    const a=nz(ans),t=nz(target);if(!a)return{ok:false};
    if(a===t)return{ok:true};
    if(hira(a)===hira(t))return{ok:true,note:"đúng (khác bảng chữ)"};
    if(reading&&hira(a)===hira(nz(reading)))return{ok:true,note:"đúng cách đọc"};
    return{ok:false};
  };
  const reading=l=>l.rb?l.rb.map(x=>x[1]||x[0]).join(""):null;
  const diff=(u,t)=>{
    const a=Array.from(nz(u)),b=Array.from(nz(t)),n=a.length,m=b.length;
    const L=Array.from({length:n+1},()=>new Uint16Array(m+1));
    for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)L[i][j]=a[i]===b[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
    const U=[],T=[];let i=0,j=0;
    while(i<n&&j<m){
      if(a[i]===b[j]){U.push({c:a[i],k:"eq"});T.push({c:b[j],k:"eq"});i++;j++}
      else if(L[i+1][j]>=L[i][j+1]){U.push({c:a[i],k:"x"});i++}
      else{T.push({c:b[j],k:"miss"});j++}
    }
    while(i<n)U.push({c:a[i++],k:"x"});while(j<m)T.push({c:b[j++],k:"miss"});
    return{U,T,sim:Math.max(n,m)?L[0][0]/Math.max(n,m):1};
  };
  const checkDict=(user,line)=>{
    const u=nz(user),t=nz(line.text),r=reading(line),d=diff(user,line.text);
    if(!u)return{ok:false,d};
    if(u===t)return{ok:true,d};
    if(hira(u)===hira(t))return{ok:true,d,note:"đúng (khác bảng chữ)"};
    if(r&&hira(u)===hira(nz(r)))return{ok:true,d,note:"đúng cách đọc (chưa viết kanji)"};
    return{ok:false,d};
  };
  const endOf=(ls,i)=>{
    const a=ls[i];if(a.t==null)return null;if(a.e!=null&&a.e>a.t)return a.e+.25;
    for(let j=i+1;j<ls.length;j++)if(ls[j].t!=null&&ls[j].t>a.t)return ls[j].t;
    return a.t+Math.max(3,a.text.length*.4);
  };
  const fmt=t=>t==null?"--:--":String(Math.floor(t/60)).padStart(2,"0")+":"+String(Math.floor(t%60)).padStart(2,"0");
  return{id,parse,parseParallel,buildTokens,tok,mk,nz,hira,checkFill,checkDict,diff,endOf,reading,fmt,rb};
})();
