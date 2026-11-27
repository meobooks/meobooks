// Cấu hình kế hoạch học (tách từ legacy). Hàm thuần.
export const planCfg=S=>({newPerDay:10,days:[1,1,1,1,1,1,1],goalDate:"",notify:false,...((S&&S.plan)||{})});
