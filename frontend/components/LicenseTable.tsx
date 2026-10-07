"use client";
import {License,formatDate} from "@/lib/api";

type Props={licenses:License[];canManage:boolean;onAction:(id:number,name:string)=>void;onDownload:(id:number)=>void};

export default function LicenseTable({licenses,canManage,onAction,onDownload}:Props){
 return <div className="tableWrap"><table>
  <thead><tr><th>Request</th><th>Customer</th><th>Product</th><th>Environment</th><th>Status</th><th>Expiry</th><th>Actions</th></tr></thead>
  <tbody>{licenses.map(l=><tr key={l.id}>
   <td className="mono">{l.requestId}</td><td>{l.customer}</td><td>{l.product} {l.version}</td><td>{l.environment}</td>
   <td><span className={`pill ${l.status.toLowerCase()}`}>{l.status}</span></td><td>{formatDate(l.expiryDate)}</td>
   <td className="actions"><button className="small" onClick={()=>onDownload(l.id)}>Download</button>{canManage&&<>
    <button className="small" onClick={()=>onAction(l.id,"renew")}>Renew</button>
    <button className="small warn" onClick={()=>onAction(l.id,"suspend")}>Suspend</button>
    <button className="small danger" onClick={()=>onAction(l.id,"revoke")}>Revoke</button>
   </>}</td>
  </tr>)}</tbody>
 </table>{!licenses.length&&<p className="empty">No licenses found.</p>}</div>;
}
