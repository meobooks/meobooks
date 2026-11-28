// Kiểm đáp án (tách từ legacy): chuẩn hóa, so khớp đúng và so khớp gần đúng. Hàm thuần.
export const norm=o=>String(o||"").trim().toLowerCase().replace(/\s+/g,"");
export const strip4=s=>String(s||"").toLowerCase().replace(/[\s\u3000、。，．,.!！?？・"'“”「」『』]/g,"");
export const headOf4=s=>String(s||"").split(/[,，、.。(（\[【]/)[0];
export const editDist4=(a,b)=>{const m=a.length,n=b.length;let prev=Array.from({length:n+1},(_,j)=>j);for(let i=1;i<=m;i++){const cur=[i];for(let j=1;j<=n;j++)cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=cur}return prev[n]};
export const tol4=x=>x.length<=3?0:x.length<=6?1:2;
export const lenientOk=(typed,accepts)=>{
  const t=strip4(typed);if(!t)return false;
  return accepts.some(c=>[strip4(c),strip4(headOf4(c))].some(x=>x&&editDist4(t,x)<=tol4(x)));
};
export const exactOk=(typed,accepts)=>accepts.some(c=>norm(c)===norm(typed));
