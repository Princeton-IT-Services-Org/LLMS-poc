const paths={
 dashboard:"M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
 licenses:"M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5M9 13h6M9 17h6",
 customers:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
 products:"M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
 environments:"M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01",
 menu:"M4 6h16M4 12h16M4 18h16",
 search:"M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-4.3-4.3",
 bell:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0",
 chevronDown:"m6 9 6 6 6-6",
 logout:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
 close:"M18 6 6 18M6 6l12 12",
 clock:"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
 alert:"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v4M12 16h.01",
 plus:"M12 5v14M5 12h14",
};
export type IconName=keyof typeof paths;
export default function Icon({name,size=20}:{name:IconName;size?:number}){
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>;
}
