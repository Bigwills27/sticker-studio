import React,{lazy,Suspense} from 'react';
import {Check,Loader2,MessageCircle,OctagonX,X} from 'lucide-react';
const WhatsAppSend=lazy(()=>import('./WhatsAppSend'));
const labels={queued:'Queued',preparing:'Preparing',sending:'Sending',sent:'Sent',failed:'Failed',stopped:'Stopped'};
export default function WhatsAppQueue({bulk}){
 const queue=bulk.queue;if(!queue)return null;
 const sent=queue.items.filter(item=>item.status==='sent').length,total=queue.items.length;
 const completed=!bulk.activeQueue;
 const title=queue.status==='loading'?'Restoring your queue…':queue.status==='stopped'?'Queue stopped':queue.status==='expired'?'Queue expired':queue.status==='unavailable'?'Queue unavailable':queue.status==='completed'?'Your stickers are on WhatsApp':queue.status==='completed_with_errors'?'Your queue has finished':queue.needsNumber?'Continue your WhatsApp queue':'Sending your stickers';
 const progress=total?queue.items.filter(item=>['sent','failed','stopped'].includes(item.status)).length:0;
 return <section id="whatsapp-queue" className="whatsapp-queue content-width" aria-label="WhatsApp sticker queue" tabIndex={-1}>
  <div className="whatsapp-queue-top"><div className="whatsapp-queue-title"><span className="whatsapp-dialog-icon"><MessageCircle size={21}/></span><div><h2>{title}</h2><p role="status">{total?`${sent} of ${total} ${total===1?'sticker':'stickers'} sent`:'Checking your saved queue…'}{!completed&&!queue.needsNumber&&total>0?' · one at a time':''}</p></div></div>{completed?<button type="button" className="icon-button" aria-label="Dismiss queue" onClick={bulk.dismiss}><X size={20}/></button>:<button type="button" className="whatsapp-queue-stop" disabled={bulk.stopping||queue.status==='loading'||queue.status==='stopping'} onClick={bulk.stop}>{bulk.stopping?<Loader2 className="spin" size={17}/>:<OctagonX size={17}/ >}{bulk.stopping||queue.status==='stopping'?'Stopping…':'Stop queue'}</button>}</div>
  {total>0&&<progress max={total} value={progress} aria-label="Queue progress"/>}
  {queue.waitingForConnection&&!completed&&<p className="whatsapp-queue-note" role="status">Waiting for WhatsApp to reconnect. Your remaining stickers are queued.</p>}
  {queue.needsNumber&&!completed&&<div className="whatsapp-queue-resume"><p>The server restarted. Enter the same WhatsApp number to continue the remaining stickers.</p><Suspense fallback={<p>Loading number form…</p>}><WhatsAppSend resumeBatchId={queue.id} onBatchCreated={bulk.rememberQueue} label="Enter number to continue"/></Suspense></div>}
  {bulk.queueError&&<p className="whatsapp-send-error" role="alert">{bulk.queueError}</p>}
  {!!total&&<details className="whatsapp-queue-details" open={!completed}><summary>Sticker delivery details</summary><ol>{queue.items.map(item=><li key={item.position}><span className="whatsapp-queue-item-name">Sticker {item.position}{item.error&&<small>{item.error}</small>}</span><span className={`whatsapp-item-state state-${item.status}`}>{['preparing','sending'].includes(item.status)?<Loader2 size={14} className="spin"/>:item.status==='sent'?<Check size={14}/>:null}{labels[item.status]||item.status}</span></li>)}</ol></details>}
  {!completed&&<small className="whatsapp-queue-note">Stopping skips stickers that haven’t started. A sticker already being sent may still arrive.</small>}
 </section>;
}
