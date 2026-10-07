"use client";
import Icon,{IconName} from "./Icon";

export type View="dashboard"|"licenses"|"customers"|"products"|"environments";
const items:{id:View;label:string;icon:IconName}[]=[
 {id:"dashboard",label:"Dashboard",icon:"dashboard"},
 {id:"licenses",label:"Licenses",icon:"licenses"},
 {id:"customers",label:"Customers",icon:"customers"},
 {id:"products",label:"Products",icon:"products"},
 {id:"environments",label:"Environments",icon:"environments"},
];

export default function Sidebar({view,onSelect,onClose}:{view:View;onSelect:(v:View)=>void;onClose:()=>void}){
 return <aside className="sidebar" aria-label="Main navigation">
  <div className="sidebarBrand">
   <span className="logo">LLMS</span>
   <span className="brandText">License Lifecycle<br/>Management System</span>
   <button className="iconButton sidebarClose" onClick={onClose} aria-label="Close menu"><Icon name="close"/></button>
  </div>
  <nav>{items.map(i=><button key={i.id} className={`navItem${view===i.id?" active":""}`} onClick={()=>onSelect(i.id)} title={i.label} aria-current={view===i.id?"page":undefined}>
   <Icon name={i.icon}/><span className="navLabel">{i.label}</span>
  </button>)}</nav>
 </aside>;
}
