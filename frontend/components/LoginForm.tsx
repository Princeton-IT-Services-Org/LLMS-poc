"use client";
import {FormEvent,useState} from "react";

export default function LoginForm({error,onSubmit}:{error:string;onSubmit:(username:string,password:string)=>Promise<void>}){
 const [login,setLogin]=useState({username:"admin",password:"Password@123"});
 function submit(e:FormEvent){e.preventDefault();onSubmit(login.username,login.password)}
 return <main className="loginPage"><form className="card login" onSubmit={submit}>
  <div className="brand">LLMS</div><h1>License Lifecycle Management</h1><p>Standalone local MVP</p>
  <label>Username<input value={login.username} onChange={e=>setLogin({...login,username:e.target.value})}/></label>
  <label>Password<input type="password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})}/></label>
  {error&&<div className="error">{error}</div>}
  <button>Sign in</button><small>Demo: admin / Password@123</small>
 </form></main>;
}
