"use client";
import {useEffect,useState} from "react";
import {api,API_URL,Dashboard,License,LicenseForm,User,token} from "@/lib/api";
import LoginForm from "@/components/LoginForm";
import AppShell from "@/components/AppShell";

export default function Home(){
 const [user,setUser]=useState<User|null>(null),[licenses,setLicenses]=useState<License[]>([]),[dashboard,setDashboard]=useState<Dashboard|null>(null);
 const [error,setError]=useState(""),[ready,setReady]=useState(false);
 async function load(){try{const [u,l,d]=await Promise.all([api<User>("/api/auth/me"),api<License[]>("/api/licenses"),api<Dashboard>("/api/dashboard")]);setUser(u);setLicenses(l);setDashboard(d)}catch{logout()}}
 useEffect(()=>{if(token())load().finally(()=>setReady(true));else setReady(true)},[]);
 async function signIn(username:string,password:string){setError("");try{const r=await api<{token:string}>("/api/auth/login",{method:"POST",body:JSON.stringify({username,password})});localStorage.setItem("token",r.token);await load()}catch(e){setError(e instanceof Error?e.message:"Login failed")}}
 function logout(){localStorage.removeItem("token");setUser(null);setLicenses([]);setDashboard(null)}
 async function create(form:LicenseForm){setError("");try{await api("/api/licenses",{method:"POST",body:JSON.stringify(form)});await load();return true}catch(e){setError(e instanceof Error?e.message:"Create failed");return false}}
 async function action(id:number,name:string){setError("");try{await api(`/api/licenses/${id}/${name}`,{method:"POST"});await load()}catch(e){setError(e instanceof Error?e.message:"Action failed")}}
 async function download(id:number){const r=await fetch(`${API_URL}/api/licenses/${id}/download`,{headers:{Authorization:`Bearer ${token()}`}});if(!r.ok){setError(await r.text());return}const blob=await r.blob();const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`license-${id}.lic`;a.click();URL.revokeObjectURL(a.href)}
 if(!ready)return null;
 if(!user)return <LoginForm error={error} onSubmit={signIn}/>;
 return <AppShell user={user} licenses={licenses} dashboard={dashboard} error={error} onDismissError={()=>setError("")} onLogout={logout} onCreate={create} onAction={action} onDownload={download}/>;
}
