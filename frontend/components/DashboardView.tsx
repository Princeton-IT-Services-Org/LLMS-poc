"use client";
import {Dashboard,License,User,canManage} from "@/lib/api";
import {View} from "./Sidebar";
import Icon from "./Icon";
import LicenseTable from "./LicenseTable";

type Props={user:User;licenses:License[];dashboard:Dashboard|null;onNavigate:(v:View)=>void;onCreate:()=>void;onAction:(id:number,name:string)=>void;onDownload:(id:number)=>void};

export default function DashboardView({user,licenses,dashboard,onNavigate,onCreate,onAction,onDownload}:Props){
 const order:(keyof Dashboard)[]=["total","active","expiringSoon","suspended","revoked","expired"];
 const recent=[...licenses].sort((a,b)=>b.id-a.id).slice(0,5);
 return <>
  <div className="pageHeader"><div><h1>Dashboard</h1><p>Overview of license lifecycle and key metrics.</p></div>
   {canManage(user)&&<button onClick={onCreate}><Icon name="plus" size={18}/>Create license</button>}</div>
  <div className="stats">{dashboard&&order.map(k=>[k,dashboard[k]] as const).map(([k,v])=><div className={`stat ${k}`} key={k}><span>{k.replace(/([A-Z])/g," $1")}</span><strong>{v.toLocaleString()}</strong></div>)}</div>
  <div className="card">
   <div className="toolbar"><h2>Recent licenses</h2><button className="linkButton" onClick={()=>onNavigate("licenses")}>View all →</button></div>
   <LicenseTable licenses={recent} canManage={canManage(user)} onAction={onAction} onDownload={onDownload}/>
  </div>
 </>;
}
