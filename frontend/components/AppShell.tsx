"use client";
import {useEffect,useState} from "react";
import {Dashboard,License,LicenseForm,User} from "@/lib/api";
import Sidebar,{View} from "./Sidebar";
import Topbar from "./Topbar";
import DashboardView from "./DashboardView";
import LicensesView from "./LicensesView";
import GroupView from "./GroupView";

type Props={user:User;licenses:License[];dashboard:Dashboard|null;error:string;onDismissError:()=>void;onLogout:()=>void;
 onCreate:(form:LicenseForm)=>Promise<boolean>;onAction:(id:number,name:string)=>void;onDownload:(id:number)=>void};
const MOBILE="(max-width: 900px)";

export default function AppShell({user,licenses,dashboard,error,onDismissError,onLogout,onCreate,onAction,onDownload}:Props){
 const [view,setView]=useState<View>("dashboard"),[search,setSearch]=useState(""),[createOpen,setCreateOpen]=useState(false);
 const [collapsed,setCollapsed]=useState(false),[mobileOpen,setMobileOpen]=useState(false);
 useEffect(()=>{try{setCollapsed(localStorage.getItem("sidebarCollapsed")==="1")}catch{}},[]);
 function toggleSidebar(){
  // Desktop collapses to an icon rail; on small screens the sidebar slides in over the page
  if(window.matchMedia(MOBILE).matches)setMobileOpen(o=>!o);
  else setCollapsed(c=>{try{localStorage.setItem("sidebarCollapsed",c?"0":"1")}catch{}return !c});
 }
 function go(v:View){setView(v);setCreateOpen(false);setMobileOpen(false);window.scrollTo(0,0)}
 function searchFor(q:string){setSearch(q);if(q&&view!=="licenses")go("licenses")}
 const views={
  dashboard:<DashboardView user={user} licenses={licenses} dashboard={dashboard} onNavigate={go} onCreate={()=>{go("licenses");setCreateOpen(true)}} onAction={onAction} onDownload={onDownload}/>,
  licenses:<LicensesView user={user} licenses={licenses} search={search} onSearch={setSearch} createOpen={createOpen} onCreate={onCreate} onAction={onAction} onDownload={onDownload}/>,
  customers:<GroupView title="Customers" field="customer" licenses={licenses} onPick={searchFor}/>,
  products:<GroupView title="Products" field="product" licenses={licenses} onPick={searchFor}/>,
  environments:<GroupView title="Environments" field="environment" licenses={licenses} onPick={searchFor}/>,
 };
 return <div className={`shell${collapsed?" collapsed":""}${mobileOpen?" mobileOpen":""}`}>
  <Sidebar view={view} onSelect={go} onClose={()=>setMobileOpen(false)}/>
  <div className="backdrop" onClick={()=>setMobileOpen(false)}/>
  <Topbar user={user} licenses={licenses} search={search} onSearch={searchFor} onToggleSidebar={toggleSidebar} onOpenLicense={searchFor} onLogout={onLogout}/>
  <main className="content">
   {error&&<div className="error">{error}<button className="linkButton" onClick={onDismissError}>Dismiss</button></div>}
   {views[view]}
  </main>
 </div>;
}
