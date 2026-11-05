import {useEffect,useRef,useState} from 'react';
import {request,waitForJob,getSticker} from './api';

function downloadBlob(path,blob){
 const address=URL.createObjectURL(blob);
 const anchor=document.createElement('a');anchor.href=address;anchor.download=`sticker-studio-${path.split('/').pop()}`;anchor.click();
 setTimeout(()=>URL.revokeObjectURL(address),10000);
}

export default function useStickerStudio(){
 const [url,setUrl]=useState('');
 const [busy,setBusy]=useState(false);
 const [stage,setStage]=useState('Reading TikTok comments');
 const [result,setResult]=useState(null);
 const [discovery,setDiscovery]=useState(null);
 const [activeTab,setActiveTab]=useState('sticker');
 const [error,setError]=useState('');
 const [toast,setToast]=useState(null);
 const [sharing,setSharing]=useState(false);
 const [downloadBusy,setDownloadBusy]=useState(false);
 const [playing,setPlaying]=useState(true);
 const [still,setStill]=useState(null);
 const inputRef=useRef(null),controller=useRef(null),toastTimer=useRef(null);

 function notify(message,type='success'){
  setToast({message,type});clearTimeout(toastTimer.current);
  toastTimer.current=setTimeout(()=>setToast(null),4500);
 }
 useEffect(()=>()=>{controller.current?.abort();clearTimeout(toastTimer.current)},[]);
 useEffect(()=>{
  if(!result)return;
  let cancelled=false;setStill(null);setPlaying(true);
  (async()=>{try{
   const blob=await getSticker(result.originalFile||result.stickerFile);
   const bitmap=await createImageBitmap(blob);
   const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
   canvas.getContext('2d').drawImage(bitmap,0,0);bitmap.close();
   if(!cancelled)setStill(canvas.toDataURL());
  }catch{}})();
  return()=>{cancelled=true};
 },[result]);

 async function run(payload,{example=false,keepGallery=false}={}){
  if(busy)return;
  setError('');setResult(null);if(!keepGallery)setDiscovery(null);
  setBusy(true);setStage(example?'Opening saved example':'Reading TikTok comments');
  controller.current?.abort();const ctl=new AbortController();controller.current=ctl;
  try{
   const job=await request(example?'/api/examples/convert':'/api/stickers/extract',{method:'POST',body:JSON.stringify(payload),signal:ctl.signal});
   const done=await waitForJob(job.id,j=>{if(!ctl.signal.aborted&&controller.current===ctl)setStage(j.stage||'Preparing your download')},ctl.signal);
   if(ctl.signal.aborted||controller.current!==ctl)return;
   if(done.status==='failed')throw new Error(done.error?.message||'We could not process that sticker.');
   if(done.status==='not_found')throw new Error('No stickers were returned. Try another link.');
   if(done.status==='needs_selection'){
    setActiveTab(done.result.candidates.some(c=>c.type==='sticker')?'sticker':'photo');
    setDiscovery({...done.result,jobId:job.id,inputUrl:payload.url});
   }else if(done.status==='succeeded')setResult(done.result);
  }catch(e){if(!ctl.signal.aborted&&controller.current===ctl&&e.name!=='AbortError')setError(e.message);}
  finally{if(!ctl.signal.aborted&&controller.current===ctl)setBusy(false);}
 }
 function submit(event){
  event.preventDefault();
  try{const parsed=new URL(url.trim());if(parsed.protocol!=='https:')throw new Error();}
  catch{setError('Paste a complete link beginning with https://.');inputRef.current?.focus();return;}
  run({url:url.trim()});
 }
 async function paste(){
  try{setUrl((await navigator.clipboard.readText()).trim());setError('');inputRef.current?.focus();}
  catch{notify('Use Ctrl+V or Command+V to paste your link.','info');inputRef.current?.focus();}
 }
 async function save(original=false){
  if(!result||downloadBusy)return;
  setDownloadBusy(true);
  try{
   const path=original||!result.stickerFile?result.originalFile:result.stickerFile;
   downloadBlob(path,await getSticker(path));notify('File downloaded.');
  }catch(e){notify(e.message,'error')}finally{setDownloadBusy(false)}
 }
 async function share(){
  if(!result)return;
  setSharing(true);
  try{
   const path=result.stickerFile||result.originalFile;
   const blob=await getSticker(path);
   const file=new File([blob],`sticker-studio-${path.split('/').pop()}`,{type:blob.type});
   if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:'From my TikTok comment'});
   else{downloadBlob(path,blob);notify('File sharing is unavailable in this browser. Your file has been downloaded.','info');}
  }catch(e){if(e.name!=='AbortError')notify(e.message||'Could not share the file.','error')}
  finally{setSharing(false)}
 }
 function reset(){
  controller.current?.abort();setBusy(false);setResult(null);setDiscovery(null);setError('');setUrl('');setToast(null);
  window.scrollTo({top:0});requestAnimationFrame(()=>inputRef.current?.focus({preventScroll:true}));
 }
 function backToResults(){setResult(null);setError('');setToast(null);}
 return {url,setUrl,busy,stage,result,discovery,activeTab,setActiveTab,error,setError,toast,setToast,sharing,downloadBusy,playing,setPlaying,still,inputRef,run,submit,paste,save,share,reset,backToResults,notify};
}
