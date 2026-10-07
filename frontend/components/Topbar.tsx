"use client";
import {useRef,useState} from "react";
import {License,User,daysUntil,formatDate} from "@/lib/api";
import Icon from "./Icon";
import {useDismiss} from "./useDismiss";

type Props={user:User;licenses:License[];search:string;onSearch:(q:string)=>void;onToggleSidebar:()=>void;onOpenLicense:(requestId:string)=>void;onLogout:()=>void};

export default function Topbar({user,licenses,search,onSearch,onToggleSidebar,onOpenLicense,onLogout}:Props){
 return <header className="topbar">
  <button className="iconButton" onClick={onToggleSidebar} aria-label="Toggle sidebar"><Icon name="menu"/></button>
  <label className="search"><Icon name="search" size={18}/><input type="search" placeholder="Search customers, products, licenses..." value={search} onChange={e=>onSearch(e.target.value)}/></label>
  <div className="topbarRight">
   <Notifications licenses={licenses} onOpen={onOpenLicense}/>
   <UserMenu user={user} onLogout={onLogout}/>
  </div>
 </header>;
}

// Alerts are derived from license data: anything expired or expiring within 30 days
function Notifications({licenses,onOpen}:{licenses:License[];onOpen:(requestId:string)=>void}){
 const [open,setOpen]=useState(false),ref=useRef<HTMLDivElement>(null);
 useDismiss(ref,open,()=>setOpen(false));
 const alerts=licenses.filter(l=>l.expiryDate&&!["REVOKED","SUSPENDED"].includes(l.status)&&daysUntil(l.expiryDate)<=30)
  .map(l=>({...l,days:daysUntil(l.expiryDate)})).sort((a,b)=>a.days-b.days);
 return <div className="popover" ref={ref}>
  <button className="iconButton" onClick={()=>setOpen(o=>!o)} aria-label={`Notifications (${alerts.length})`} aria-expanded={open}>
   <Icon name="bell"/>{alerts.length>0&&<span className="badge">{alerts.length}</span>}
  </button>
  {open&&<div className="menu notifications">
   <div className="menuHeader">Notifications</div>
   {alerts.length?alerts.map(a=><button key={a.id} className="menuItem notice" onClick={()=>{onOpen(a.requestId);setOpen(false)}}>
    <span className={`noticeIcon ${a.days<0?"danger":"warn"}`}><Icon name={a.days<0?"alert":"clock"} size={16}/></span>
    <span><b>{a.days<0?"License expired":`Expires in ${a.days} day${a.days===1?"":"s"}`}</b><small>{a.requestId} · {a.customer} · {formatDate(a.expiryDate)}</small></span>
   </button>):<p className="menuEmpty">You're all caught up.</p>}
  </div>}
 </div>;
}

function UserMenu({user,onLogout}:{user:User;onLogout:()=>void}){
 const [open,setOpen]=useState(false),ref=useRef<HTMLDivElement>(null);
 useDismiss(ref,open,()=>setOpen(false));
 const role=user.role.replaceAll("_"," ").toLowerCase();
 return <div className="popover" ref={ref}>
  <button className="userButton" onClick={()=>setOpen(o=>!o)} aria-expanded={open} aria-haspopup="menu">
   <span className="avatar">{user.username.slice(0,2).toUpperCase()}</span>
   <span className="userText"><b>{user.username}</b><small>{role}</small></span>
   <span className={`chevron${open?" up":""}`}><Icon name="chevronDown" size={16}/></span>
  </button>
  {open&&<div className="menu userMenu" role="menu">
   <div className="menuHeader"><b>{user.username}</b><small>{role}</small></div>
   <button className="menuItem" role="menuitem" onClick={onLogout}><Icon name="logout" size={18}/>Logout</button>
  </div>}
 </div>;
}
