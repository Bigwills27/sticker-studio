import {useEffect,useMemo,useRef,useState} from 'react';
import {getSticker,request,waitForJob} from './api';

function downloadArchive(bundle,videoId){
 const address=URL.createObjectURL(bundle.blob),anchor=document.createElement('a');
 anchor.href=address;anchor.download=`sticker-studio-${videoId}.zip`;anchor.click();
 setTimeout(()=>URL.revokeObjectURL(address),10000);
}
function canShareFiles(files){
 try{return typeof navigator.share==='function'&&!!navigator.canShare?.({files})}catch{return false}
}

export default function useBulkMedia(discovery,notify){
 const [selecting,setSelecting]=useState(false);
 const [selectedIds,setSelectedIds]=useState(new Set());
 const [busy,setBusy]=useState(false),[status,setStatus]=useState(''),[prepared,setPrepared]=useState(null);
 const controller=useRef(null),working=useRef(false);
 const jobId=discovery?.jobId;
 const available=useMemo(()=>(discovery?.candidates||[]).filter(candidate=>candidate.available&&candidate.mediaUrl),[discovery]);
 const selected=available.filter(candidate=>selectedIds.has(candidate.id));
 const targets=selecting?selected:available;
 const key=jobId?`${jobId}:${targets.map(candidate=>candidate.id).sort().join(',')}`:'';
 const cached=prepared?.key===key?prepared:null;

 useEffect(()=>{
  controller.current?.abort();working.current=false;setBusy(false);setStatus('');setPrepared(null);setSelectedIds(new Set());setSelecting(false);
  return()=>controller.current?.abort();
 },[jobId]);

 function toggle(id){
  if(!selecting||working.current||!available.some(candidate=>candidate.id===id))return;
  setSelectedIds(previous=>{const next=new Set(previous);if(next.has(id))next.delete(id);else next.add(id);return next;});setStatus('');
 }
 function toggleAll(){
  if(!selecting||working.current)return;
  setSelectedIds(selected.length===available.length?new Set():new Set(available.map(candidate=>candidate.id)));setStatus('');
 }
 function clear(){if(!working.current){setSelectedIds(new Set());setStatus('');}}
 function toggleSelecting(){
  if(working.current)return;
  setSelecting(previous=>!previous);setSelectedIds(new Set());setStatus('');
 }
 function cancel(){controller.current?.abort();working.current=false;setBusy(false);setStatus('');}
 const isCurrent=ctl=>controller.current===ctl&&!ctl.signal.aborted;
 function completeMessage(bundle,prefix){
  return bundle.result.partial?`${prefix} ${bundle.result.downloadedCount} of ${bundle.result.requestedCount} files. ${bundle.result.failed.length} could not be downloaded; details are in the ZIP report.`:`${prefix} ${bundle.result.downloadedCount} ${bundle.result.downloadedCount===1?'file':'files'}.`;
 }
 async function action(mode){
  if(working.current||!jobId||!targets.length)return;
  const ctl=new AbortController();controller.current?.abort();controller.current=ctl;working.current=true;setBusy(true);
  try{
   // A second tap calls the system share API immediately, preserving user activation.
   if(mode==='share'&&cached?.files&&canShareFiles(cached.files)){
    try{await navigator.share({files:cached.files,title:'TikTok reactions'});if(isCurrent(ctl))notify(completeMessage(cached,'Shared'),cached.result.partial?'info':'success');}
    catch(error){if(error.name==='AbortError'||!isCurrent(ctl))return;downloadArchive(cached,discovery.videoId);notify(completeMessage(cached,'Sharing is unavailable. Downloaded'),'info');}
    return;
   }
   let bundle=cached;
   if(!bundle){
    setStatus(`Preparing ${targets.length} original ${targets.length===1?'file':'files'}…`);
    const payload={url:discovery.inputUrl,discoveryJobId:jobId,...(selected.length&&selected.length!==available.length?{candidateIds:selected.map(candidate=>candidate.id)}:{})};
    const submitted=await request('/api/stickers/bundle',{method:'POST',body:JSON.stringify(payload),signal:ctl.signal});
    const done=await waitForJob(submitted.id,job=>{if(isCurrent(ctl))setStatus(job.stage||'Preparing your ZIP…')},ctl.signal);
    if(!isCurrent(ctl))return;
    if(done.status!=='succeeded')throw new Error(done.error?.message||'The files could not be prepared. Please try again.');
    const blob=await getSticker(done.result.archiveFile,{signal:ctl.signal});
    if(!isCurrent(ctl))return;
    bundle={key,result:done.result,blob};setPrepared(bundle);
   }
   if(!isCurrent(ctl))return;
   if(mode==='share'&&typeof navigator.share==='function'&&typeof navigator.canShare==='function'){
    const {unzipSync}=await import('fflate');
    if(!isCurrent(ctl))return;
    const contents=unzipSync(new Uint8Array(await bundle.blob.arrayBuffer()));
    const files=bundle.result.files.map(file=>{
     if(!contents[file.name])throw new Error('The prepared archive is incomplete. Download it again.');
     return new File([contents[file.name]],file.name,{type:file.mimeType});
    });
    if(!isCurrent(ctl))return;
    if(canShareFiles(files)){
     setPrepared({...bundle,files});setStatus(`Ready to share ${files.length} ${files.length===1?'file':'files'}.`);
     notify(bundle.result.partial?completeMessage(bundle,'Prepared')+' Tap Share to continue.':'Files ready. Tap Share to open your device’s share menu.','info');
     return;
    }
   }
   downloadArchive(bundle,discovery.videoId);
   const message=completeMessage(bundle,mode==='share'?'Sharing is unavailable. Downloaded':'Downloaded');
   setStatus(bundle.result.partial?message:'');notify(message,mode==='share'||bundle.result.partial?'info':'success');
  }catch(error){if(isCurrent(ctl)&&error.name!=='AbortError'){setStatus('');notify(error.message||'The files could not be downloaded.','error');}}
  finally{if(isCurrent(ctl)){working.current=false;setBusy(false);}}
 }
 return {selecting,toggleSelecting,selectedIds,selectedCount:selected.length,availableCount:available.length,allSelected:available.length>0&&selected.length===available.length,busy,status,shareReadyCount:cached?.files?.length||0,toggle,toggleAll,clear,cancel,download:()=>action('download'),share:()=>action('share')};
}
