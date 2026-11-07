// In Vite development, use its same-origin proxy. Production uses the configured API URL.
export const API = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/,'');
export async function request(path,options={}){
 let response;
 try{response=await fetch(`${API}${path}`,{...options,headers:{'Content-Type':'application/json',...options.headers}})}catch(error){if(options.signal?.aborted||error.name==='AbortError')throw error;throw new Error('The converter is offline. Start the backend with npm run dev, then try again.');}
 const data=await response.json().catch(error=>{if(options.signal?.aborted||error.name==='AbortError')throw error;return {}});
 if(!response.ok){const error=new Error(data.error?.message||'The request failed. Please try again.');error.code=data.error?.code;error.status=response.status;throw error;}return data;
}
export async function waitForJob(id,onUpdate,signal){
 const start=Date.now();
 while(Date.now()-start<240000){
  const job=await request(`/api/jobs/${id}`,{signal});onUpdate?.(job);
  if(!['queued','running'].includes(job.status))return job;
  await new Promise((resolve,reject)=>{const abort=()=>{clearTimeout(timer);reject(new DOMException('Aborted','AbortError'))};const timer=setTimeout(()=>{signal?.removeEventListener('abort',abort);resolve()},1000);signal?.addEventListener('abort',abort,{once:true});});
 }
 throw new Error('This is taking longer than expected. Please try again in a moment.');
}
export async function getSticker(path,options={}){const r=await fetch(`${API}${path}`,options);if(!r.ok)throw new Error('This download has expired. Fetch it again.');return r.blob();}
