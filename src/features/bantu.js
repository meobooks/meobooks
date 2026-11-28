// Tiến độ ôn từ (tách từ BanTu của legacy). Hàm thuần.
export function btProg(p,t){
  if(!t)return 0;
  const v=p.vars.find(x=>x.s.startsWith(t));if(!v)return 0;
  let c=0;v.b.forEach(e=>{if(e[0]<=t.length)c+=e[1]});return c;
};
