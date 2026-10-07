"use client";
import {License,formatDate} from "@/lib/api";

type Field="customer"|"product"|"environment";

// Customers, products and environments have no tables of their own yet, so they are grouped from license data
export default function GroupView({title,field,licenses,onPick}:{title:string;field:Field;licenses:License[];onPick:(name:string)=>void}){
 const groups=Object.entries(Object.groupBy(licenses,l=>l[field]||"—")).map(([name,items=[]])=>({
  name,total:items.length,active:items.filter(l=>l.status==="ACTIVE").length,
  nextExpiry:items.filter(l=>l.status==="ACTIVE"&&l.expiryDate).map(l=>l.expiryDate).sort()[0]??"",
 })).sort((a,b)=>a.name.localeCompare(b.name));
 return <>
  <div className="pageHeader"><div><h1>{title}</h1><p>{title} grouped from issued licenses. Select one to see its licenses.</p></div></div>
  <div className="card"><div className="tableWrap"><table>
   <thead><tr><th>Name</th><th>Licenses</th><th>Active</th><th>Next expiry</th></tr></thead>
   <tbody>{groups.map(g=><tr key={g.name} className="clickable" onClick={()=>onPick(g.name)}>
    <td><b>{g.name}</b></td><td>{g.total}</td><td>{g.active}</td><td>{formatDate(g.nextExpiry)}</td>
   </tr>)}</tbody>
  </table>{!groups.length&&<p className="empty">No {title.toLowerCase()} yet. Create a license to add one.</p>}</div></div>
 </>;
}
