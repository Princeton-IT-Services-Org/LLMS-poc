export const API_URL=process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
export type User={username:string;role:string};
export type License={id:number;requestId:string;customer:string;product:string;version:string;environment:string;licenseType:string;status:string;createdDate:string;expiryDate:string;features:string};
export type Dashboard={total:number;active:number;expiringSoon:number;suspended:number;revoked:number;expired:number};
export type LicenseForm={customer:string;product:string;version:string;environment:string;licenseType:string;expiryDate:string;features:string};
export function token(){return typeof window!=="undefined"?localStorage.getItem("token"):null}
export async function api<T>(path:string,options:RequestInit={}):Promise<T>{
 const headers=new Headers(options.headers); headers.set("Content-Type","application/json"); const t=token(); if(t) headers.set("Authorization",`Bearer ${t}`);
 const response=await fetch(`${API_URL}${path}`,{...options,headers});
 if(!response.ok){const text=await response.text();throw new Error(text||`Request failed: ${response.status}`)}
 if(response.status===204)return undefined as T; return response.json();
}
export function canManage(user:User){return ["LICENSE_CONTROLLER","SUPER_ADMIN"].includes(user.role)}
export function daysUntil(date:string){return Math.ceil((new Date(date+"T00:00:00").getTime()-new Date().setHours(0,0,0,0))/86400000)}
export function formatDate(date:string){return date?new Date(date+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—"}
