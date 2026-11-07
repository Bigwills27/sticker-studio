import React,{useEffect,useState,useRef,useId} from 'react';
import {CheckCheck,ChevronDown,Loader2,MessageCircle,Search,X} from 'lucide-react';
import {getCountries,getCountryCallingCode,parsePhoneNumberFromString,parseDigits} from 'libphonenumber-js/max';
import {request} from './api';
import {phonePreview} from './phone';

const names=typeof Intl.DisplayNames==='function'?new Intl.DisplayNames(['en'],{type:'region'}):null;
const countryList=getCountries().map(code=>({code,name:names?.of(code)||code,callingCode:getCountryCallingCode(code)}));
const countryByCode=new Map(countryList.map(country=>[country.code,country]));
const flagFor=code=>String.fromCodePoint(...code.toUpperCase().split('').map(char=>127397+char.charCodeAt(0)));
const aliases={US:'USA United States America',GB:'UK Britain England',NG:'Nigeria'};

function findCountryFromPrefix(value,current){
 let digits=value.normalize('NFKC').replace(/[٠-٩۰-۹]/g,char=>parseDigits(char)).replace(/\D/g,'');
 const explicit=/^\s*(?:\+|00)/.test(value);
 if(/^\s*00/.test(value))digits=digits.slice(2);
 const parsed=parsePhoneNumberFromString('+'+digits);
 if(parsed?.isValid()&&parsed.country)return countryByCode.get(parsed.country);
 if(!explicit&&digits.length<10){
  if(digits.length>=2){const exact=countryList.filter(item=>item.callingCode===digits);if(exact.length)return exact.find(item=>item.code===current)||exact[0];}
  return null;
 }
 const matches=countryList.filter(item=>digits.startsWith(item.callingCode)).sort((a,b)=>b.callingCode.length-a.callingCode.length);
 if(!matches.length)return null;
 if(!explicit&&digits.length!==matches[0].callingCode.length&&digits.length<matches[0].callingCode.length+7)return null;
 return matches.find(item=>item.code===current)||matches.find(item=>item.code===({'1':'US','7':'RU','44':'GB'}[matches[0].callingCode]))||matches[0];
}

export default function WhatsAppSend({stickerFile,batchRequest,resumeBatchId,onBatchCreated,onBusyChange,label,disabled=false}){
 const [available,setAvailable]=useState(null),[busy,setBusy]=useState(false),[open,setOpen]=useState(false),[pickerOpen,setPickerOpen]=useState(false),[query,setQuery]=useState(''),[phone,setPhone]=useState(''),[country,setCountry]=useState('NG'),[sent,setSent]=useState(null),[error,setError]=useState('');
 const attempt=useRef(null),action=useRef(null),mounted=useRef(true),phoneInput=useRef(null),searchInput=useRef(null),dialogRef=useRef(null),id=useId();
 const batchMode=!!batchRequest||!!resumeBatchId;
 const fileKey=stickerFile||resumeBatchId||JSON.stringify(batchRequest);
 const currentFile=useRef(fileKey);currentFile.current=fileKey;
 const selected=countryByCode.get(country)||countryByCode.get('NG');
 const preview=phonePreview(phone,country);
 const jobId=stickerFile?.match(/(?:^|\/)([a-f0-9]{32})(?=[/.\-_]|$)/i)?.[1];
 const filteredCountries=countryList.filter(item=>`${item.name} ${item.code} +${item.callingCode} ${aliases[item.code]||''}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>a.code===country?-1:b.code===country?1:a.name.localeCompare(b.name));

 useEffect(()=>{
  let active=true,inFlight=false,controller;
  async function refresh(){if(!active||inFlight||document.hidden)return;inFlight=true;controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);try{const data=await request('/api/whatsapp/status',{signal:controller.signal});if(active)setAvailable(data.available===true);}catch{if(active)setAvailable(false);}finally{clearTimeout(timeout);inFlight=false;}}
  refresh();const timer=setInterval(refresh,15000);window.addEventListener('online',refresh);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);
  return()=>{active=false;clearInterval(timer);controller?.abort();window.removeEventListener('online',refresh);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh)};
 },[]);
 useEffect(()=>{attempt.current=null;action.current?.abort();setSent(null);setError('');setPhone('');setOpen(false);setBusy(false);},[fileKey]);
 useEffect(()=>{onBusyChange?.(busy);return()=>onBusyChange?.(false);},[busy,onBusyChange]);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;action.current?.abort()}},[]);
 useEffect(()=>{
  const dialog=dialogRef.current;
  if(open&&!dialog?.open)dialog?.showModal();
  if(!open&&dialog?.open)dialog.close();
  if(open){requestAnimationFrame(()=>{if(pickerOpen)searchInput.current?.focus();else phoneInput.current?.focus()});}
 },[open,pickerOpen]);
 function changePhone(value){
  setPhone(value);setError('');attempt.current=null;
  const detected=findCountryFromPrefix(value,country);
  if(detected&&detected.code!==country){setCountry(detected.code);}
  else if(/^\s*(?:\+|00)/.test(value)&&!value.replace(/\D/g,'').length)setCountry('NG');
 }
 function begin(){setError('');setPhone('');setSent(null);setPickerOpen(false);setQuery('');setOpen(true);}
 function close(){if(busy)return;setOpen(false);setPickerOpen(false);setQuery('');setError('');}
 function handleCancel(event){event.preventDefault();if(busy)return;if(pickerOpen){setPickerOpen(false);setQuery('');}else close();}
 function selectCountry(item){setCountry(item.code);setError('');attempt.current=null;setPickerOpen(false);setQuery('');}
 async function send(event){
  event.preventDefault();if(busy)return;
  if(!preview){setError('Enter a valid number and choose its country.');return;}
  const controller=new AbortController();action.current=controller;const timeout=setTimeout(()=>controller.abort(),60000);const requestId=attempt.current||(attempt.current=crypto.randomUUID().replaceAll('-',''));
  setBusy(true);setError('');
  try{
   if(batchMode){
    const path=resumeBatchId?`/api/whatsapp/batches/${resumeBatchId}/resume`:'/api/whatsapp/batches';
    const data=await request(path,{method:'POST',signal:controller.signal,body:JSON.stringify({...batchRequest,requestId,phoneNumber:phone,country})});
    if(mounted.current&&currentFile.current===fileKey){setOpen(false);setPhone('');attempt.current=null;onBatchCreated?.(data);}return;
   }
   for(;;){
   const data=await request('/api/whatsapp/send',{method:'POST',signal:controller.signal,body:JSON.stringify({jobId,requestId,phoneNumber:phone,country})});
   if(data.status==='delivered'&&typeof data.phoneNumber==='string'){if(mounted.current&&currentFile.current===fileKey){setSent(data.phoneNumber);setPhone('');setOpen(false);}break;}
   if(['failed','expired'].includes(data.status)){attempt.current=null;throw new Error('The previous attempt failed. Check WhatsApp before sending again.');}
   if(!['pending','sending'].includes(data.status))throw new Error('Could not confirm delivery. Please try again to check this request.');
   await new Promise(resolve=>setTimeout(resolve,2000));
  }}catch(error){if(mounted.current&&currentFile.current===fileKey){if(typeof error.code==='string'&&!['DELIVERY_UNCONFIRMED','OPERATION_TIMEOUT'].includes(error.code))attempt.current=null;setError(controller.signal.aborted?'This is taking longer than expected. Check WhatsApp, then retry here to check the same request.':error.message);}}
  finally{clearTimeout(timeout);if(mounted.current&&currentFile.current===fileKey)setBusy(false);}
 }
 if(!jobId&&!batchMode)return null;
 return <div className="whatsapp-send">
  <button className="button primary whatsapp-primary" disabled={available!==true||disabled||busy} onClick={begin}>{available===null?<Loader2 size={20} className="spin"/>:<MessageCircle size={20}/ >}{label||'Send to WhatsApp'}</button>
  {available===null?<p role="status">Checking WhatsApp availability…</p>:!available?<p role="status">WhatsApp delivery is offline. You can still download or share your sticker.</p>:busy?<p role="status">Checking the number on WhatsApp and sending your sticker…</p>:null}
  {sent&&<div className="whatsapp-success" role="status"><CheckCheck size={18}/><span>Sticker sent to {sent}.</span><button type="button" className="whatsapp-text-button" onClick={begin}>Send to another number</button></div>}
  <dialog ref={dialogRef} className="whatsapp-dialog" aria-labelledby={id+'-title'} aria-describedby={id+'-description'} onCancel={handleCancel} onClick={event=>{if(event.target===dialogRef.current)close();}}>
   <div className="whatsapp-dialog-inner">
    <div className="whatsapp-dialog-heading"><div><span className="whatsapp-dialog-icon"><MessageCircle size={20}/></span><h2 id={id+'-title'}>{pickerOpen?'Choose a country':resumeBatchId?'Continue your WhatsApp queue':batchMode?`Send ${batchRequest.candidateIds.length} stickers to WhatsApp`:'Send sticker to WhatsApp'}</h2></div><button className="whatsapp-dialog-close" type="button" aria-label="Close" disabled={busy} onClick={close}><X size={20}/></button></div>
    <p id={id+'-description'} className="whatsapp-dialog-description">{pickerOpen?'Search by country name or calling code.':resumeBatchId?'Enter the same number to continue the remaining stickers.':batchMode?'Enter your WhatsApp number once. Your stickers will arrive one after another.':'Enter the WhatsApp number that should receive this sticker.'}</p>
    {pickerOpen?<div className="whatsapp-country-picker">
     <label className="whatsapp-search"><Search size={18}/><span className="sr-only">Search countries</span><input ref={searchInput} type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search country or code" autoComplete="off"/><button type="button" aria-label="Back to phone number" onClick={()=>{setPickerOpen(false);setQuery('')}}><X size={17}/></button></label>
     <div className="whatsapp-country-list" role="listbox" aria-label="Countries">{filteredCountries.length?filteredCountries.map(item=><button type="button" role="option" aria-selected={item.code===country} className="whatsapp-country-option" key={item.code} onClick={()=>selectCountry(item)}><span className="whatsapp-flag" aria-hidden="true">{flagFor(item.code)}</span><span className="whatsapp-country-name">{item.name}</span><span className="whatsapp-country-code">+{item.callingCode}</span></button>):<p className="whatsapp-no-countries">No countries found.</p>}</div>
    </div>:<form className="whatsapp-form" onSubmit={send}>
     <label htmlFor={id+'-phone'}>Your WhatsApp number</label>
     <div className="whatsapp-phone-control"><button type="button" className="whatsapp-country-button" aria-label={`Country: ${selected.name}, +${selected.callingCode}. Choose country`} disabled={busy} onClick={()=>setPickerOpen(true)}><span className="whatsapp-flag" aria-hidden="true">{flagFor(selected.code)}</span><span>+{selected.callingCode}</span><ChevronDown size={17}/></button><input ref={phoneInput} id={id+'-phone'} type="tel" autoComplete="tel-national" inputMode="tel" maxLength={80} placeholder={country==='US'?'(000) 000-0000':'000 000 0000'} value={phone} required disabled={busy} aria-describedby={id+'-preview '+id+'-privacy'} onChange={event=>changePhone(event.target.value)}/></div>
     <p id={id+'-preview'} className="whatsapp-phone-preview">{preview?`We’ll send to ${preview}`:'Type a country name or calling code, or choose from the flag menu.'}</p>
     <small id={id+'-privacy'} className="whatsapp-privacy-note">Your number isn’t saved in Sticker Studio’s delivery history. You’ll need to enter it again whenever you want a sticker on WhatsApp.</small>
     {error&&<p className="whatsapp-send-error" role="alert">{error}</p>}
     <button className="button primary whatsapp-submit" type="submit" disabled={busy||available!==true||!preview}>{busy?<Loader2 size={20} className="spin"/>:<MessageCircle size={20}/ >}{busy?(batchMode?'Adding to queue…':'Checking and sending…'):resumeBatchId?'Continue queue':batchMode?'Queue stickers':'Send sticker'}</button>
     <button className="whatsapp-text-button whatsapp-cancel" type="button" disabled={busy} onClick={close}>Cancel</button>
    </form>}
   </div>
  </dialog>
 </div>;
}
