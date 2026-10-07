"use client";
import { FormEvent, useState } from "react";
import { LicenseForm } from "@/lib/api";

const empty: LicenseForm = { customer: "", product: "", version: "1.0", environment: "DEV", licenseType: "TRIAL", expiryDate: "", features: "dashboard,telemetry" };

export default function CreateLicenseForm({ open, onCreate }: { open: boolean; onCreate: (form: LicenseForm) => Promise<boolean> }) {
    const [form, setForm] = useState(empty);
    async function submit(e: FormEvent) { e.preventDefault(); if (await onCreate(form)) setForm(empty) }
    return <details className="card create" open={open || undefined}><summary>Create license</summary><form onSubmit={submit}>
        <div className="grid">{(Object.keys(form) as (keyof LicenseForm)[]).map(k => <label key={k}>{k.replace(/([A-Z])/g, " $1")}
            <input type={k === "expiryDate" ? "date" : "text"} required={k !== "features"} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
        </label>)}</div>
        <button>Generate license</button>
    </form></details>;
}
