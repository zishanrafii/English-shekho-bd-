
export const auth={};export const db={};export const doc=(_d,...p)=>({path:p.join("/"),id:p[p.length-1]});export const collection=(_d,...p)=>({path:p.join("/")});
export const where=()=>({});export const limit=()=>({});export const query=(c)=>({col:c});export const increment=(n)=>({__inc:n});export const arrayUnion=(...v)=>({__u:v});
export const toast=()=>{};export const signOut=async()=>{};export const getDoc=async()=>({exists:()=>true,data:()=>({xp:0,displayName:"T"})});
export const setDoc=async()=>{};export const updateDoc=async()=>{};export const getDocs=async()=>({docs:[]});
export function requireAuth(cb){cb({uid:"u1"});}
