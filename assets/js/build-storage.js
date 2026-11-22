/* Offline-only build storage. Nothing is uploaded to DEXORA. */
(()=>{
 const DB='dexora-builds', STORE='builds', allowed=['cpu','board','ram','gpu','ssd','cooler','case','psu'];
 const validate=obj=>{
  if(!obj || typeof obj!=='object' || !obj.selected || typeof obj.selected!=='object')throw Error('Cấu hình không hợp lệ');
  const selected={};for(const k of allowed){const value=obj.selected[k];if(value!=null && (typeof value!=='string'||value.length>100))throw Error('Mã linh kiện sai');selected[k]=value||''}
  const budget=Number(obj.budget);if(!Number.isFinite(budget)||budget<0||budget>1e10)throw Error('Ngân sách sai');
  return {selected,budget,colorMode:['any','white','black','mixed'].includes(obj.colorMode)?obj.colorMode:'any',name:String(obj.name||'Cấu hình DEXORA').slice(0,70),createdAt:obj.createdAt||new Date().toISOString(),schemaVersion:2,priceAtSave:Number.isFinite(obj.priceAtSave)?obj.priceAtSave:null};
 };
 function open(){return new Promise((res,rej)=>{if(!('indexedDB'in window)){rej(Error('IndexedDB unavailable'));return}const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id'})};req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error)})}
 async function transact(mode,action){const db=await open();return new Promise((res,rej)=>{const tx=db.transaction(STORE,mode),st=tx.objectStore(STORE);let out;const req=action(st);req.onsuccess=()=>out=req.result;tx.oncomplete=()=>{db.close();res(out)};tx.onerror=()=>{db.close();rej(tx.error)};tx.onabort=()=>{db.close();rej(tx.error)}})}
 const save=async data=>{const valid=validate(data);const row={...valid,id:crypto.randomUUID(),updatedAt:new Date().toISOString()};await transact('readwrite',st=>st.put(row));return row};
 const list=async()=>{const rows=await transact('readonly',st=>st.getAll());return rows.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))};
 const get=async id=>transact('readonly',st=>st.get(id));
 const remove=async id=>transact('readwrite',st=>st.delete(id));
 const exportJSON=obj=>{const valid=validate(obj);const payload={schema:'dexora.build.v1',...valid};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='DEXORA-build.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
 const importJSON=async file=>{if(file.size>50000)throw Error('File quá lớn');const data=JSON.parse(await file.text());if(data.schema!=='dexora.build.v1')throw Error('Sai định dạng');return validate(data)};
 const pack=o=>btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify({s:o.selected,b:o.budget,c:o.colorMode})))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 const unpack=str=>{if(str.length>3500)throw Error('Link quá dài');const binary=atob(str.replace(/-/g,'+').replace(/_/g,'/'));const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));const o=JSON.parse(new TextDecoder().decode(bytes));return validate({selected:o.s,budget:o.b,colorMode:o.c})};
 function makeShareLink(o){const u=new URL((window.DEXORA_ROOT||'../')+'pages/builder.html',location.href);u.hash='build='+pack(o);return u.href}
 function readShareLink(){const m=location.hash.match(/^#build=([A-Za-z0-9_-]+)$/);return m?unpack(m[1]):null}
 window.DEXORA_BUILDS={save,list,get,remove,exportJSON,importJSON,makeShareLink,readShareLink};
})();
