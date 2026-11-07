import {useEffect,useMemo,useRef,useState} from 'react';
import {request} from './api';

const LIMIT=10,storageKey='sticker-studio.whatsapp-queue';
const activeStatuses=new Set(['loading','queued','sending','stopping']);
function savedBatch(){try{const id=localStorage.getItem(storageKey);return /^[a-f0-9-]{36}$/.test(id||'')?id:null;}catch{return null;}}
function persist(id){try{if(id)localStorage.setItem(storageKey,id);else localStorage.removeItem(storageKey);}catch{}}

export default function useBulkMedia(discovery,notify){
 const [selecting,setSelecting]=useState(false),[selectedIds,setSelectedIds]=useState(new Set()),[submitting,setSubmitting]=useState(false);
 const [batchId,setBatchId]=useState(savedBatch),[queue,setQueue]=useState(null),[queueError,setQueueError]=useState(''),[stopping,setStopping]=useState(false);
 const mounted=useRef(true);
 const available=useMemo(()=>(discovery?.candidates||[]).filter(item=>item.type==='sticker'&&item.available&&item.mediaUrl),[discovery]);
 const selected=available.filter(item=>selectedIds.has(item.id)),targets=selecting?selected:available;
 const firstTen=available.slice(0,LIMIT),allSelected=firstTen.length>0&&firstTen.every(item=>selectedIds.has(item.id));
 useEffect(()=>{setSelecting(false);setSelectedIds(new Set());setSubmitting(false);},[discovery?.jobId]);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 useEffect(()=>{
  if(!batchId)return;
  let active=true,inFlight=false,finished=false,controller;
  async function refresh(){
   if(!active||inFlight||finished)return;
   inFlight=true;controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);
   try{
    const data=await request(`/api/whatsapp/batches/${batchId}`,{signal:controller.signal});
    if(!active)return;setQueue(data);setQueueError('');finished=!activeStatuses.has(data.status);
   }catch(error){if(active){setQueueError(error.name==='AbortError'?'The queue is taking a little longer to respond. Reconnecting…':error.message);if(error.status===404){setQueue({id:batchId,status:'unavailable',items:[]});finished=true;}}}
   finally{clearTimeout(timer);inFlight=false;}
  }
  refresh();const timer=setInterval(refresh,2000);window.addEventListener('online',refresh);window.addEventListener('focus',refresh);
  return()=>{active=false;controller?.abort();clearInterval(timer);window.removeEventListener('online',refresh);window.removeEventListener('focus',refresh);};
 },[batchId]);
 const activeQueue=!!batchId&&(!queue||activeStatuses.has(queue.status));
 function toggle(id){if(submitting||!selecting||!available.some(item=>item.id===id))return;setSelectedIds(previous=>{const next=new Set(previous);if(next.has(id))next.delete(id);else if(next.size<LIMIT)next.add(id);return next;});}
 function toggleAll(){if(!submitting&&selecting)setSelectedIds(allSelected?new Set():new Set(firstTen.map(item=>item.id)));}
 function clear(){if(!submitting)setSelectedIds(new Set());}
 function toggleSelecting(){if(!submitting){setSelecting(value=>!value);setSelectedIds(new Set());}}
 function rememberQueue(data){persist(data.id);setBatchId(data.id);setQueue(data);setQueueError('');requestAnimationFrame(()=>{const panel=document.getElementById('whatsapp-queue');panel?.focus({preventScroll:true});panel?.scrollIntoView({block:'center'});});}
 async function stop(){
  if(!batchId||stopping)return;setStopping(true);setQueueError('');
  try{const data=await request(`/api/whatsapp/batches/${batchId}/stop`,{method:'POST',body:'{}'});if(mounted.current)setQueue(data);}
  catch(error){if(mounted.current)setQueueError(error.message);}
  finally{if(mounted.current)setStopping(false);}
 }
 function dismiss(){if(activeQueue)return;persist(null);setBatchId(null);setQueue(null);setQueueError('');}
 return {limit:LIMIT,selecting,toggleSelecting,toggle,toggleAll,clear,selectedIds,selectedCount:selected.length,availableCount:available.length,targetCount:targets.length,allSelected,busy:submitting,setSubmitting,activeQueue,queue:batchId?(queue||{id:batchId,status:'loading',items:[]}):null,queueError,stopping,stop,dismiss,rememberQueue,batchRequest:{url:discovery?.inputUrl,discoveryJobId:discovery?.jobId,candidateIds:targets.map(item=>item.id)}};
}
