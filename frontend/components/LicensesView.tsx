"use client";
import {useMemo} from "react";
import {License,LicenseForm,User,canManage} from "@/lib/api";
import CreateLicenseForm from "./CreateLicenseForm";
import LicenseTable from "./LicenseTable";

type Props={user:User;licenses:License[];search:string;onSearch:(q:string)=>void;createOpen:boolean;
 onCreate:(form:LicenseForm)=>Promise<boolean>;onAction:(id:number,name:string)=>void;onDownload:(id:number)=>void};

export default function LicensesView({user,licenses,search,onSearch,createOpen,onCreate,onAction,onDownload}:Props){
 const filtered=useMemo(()=>licenses.filter(x=>`${x.requestId} ${x.customer} ${x.product} ${x.environment} ${x.status}`.toLowerCase().includes(search.toLowerCase())),[licenses,search]);
 return <>
  <div className="pageHeader"><div><h1>Licenses</h1><p>Search, generate, download and manage licenses.</p></div></div>
  {canManage(user)&&<CreateLicenseForm open={createOpen} onCreate={onCreate}/>}
  <div className="card">
   <div className="toolbar"><h2>All licenses <span className="count">{filtered.length}</span></h2>
    <input type="search" placeholder="Search request, customer, product or status" value={search} onChange={e=>onSearch(e.target.value)}/></div>
   <LicenseTable licenses={filtered} canManage={canManage(user)} onAction={onAction} onDownload={onDownload}/>
  </div>
 </>;
}
