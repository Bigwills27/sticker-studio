import React,{lazy,Suspense} from 'react';
import SelectionCheckbox from './SelectionCheckbox';
const WhatsAppSend=lazy(()=>import('./WhatsAppSend'));

export default function BulkActions({bulk,disabled}){
 if(!bulk.availableCount)return null;
 const tooMany=bulk.targetCount>bulk.limit;
 const actionsDisabled=disabled||!bulk.targetCount||tooMany||bulk.activeQueue;
 return <div className="bulk-actions">
  <div className="bulk-selection">
   <button className={`selection-toggle ${bulk.selecting?'active':''}`} onClick={bulk.toggleSelecting} disabled={disabled}>{bulk.selecting?'Cancel selection':'Select stickers'}</button>
   {bulk.selecting&&<SelectionCheckbox className="select-all" label={bulk.availableCount>bulk.limit?'Select first 10 available stickers':'Select all available stickers'} checked={bulk.allSelected} indeterminate={bulk.selectedCount>0&&!bulk.allSelected} onChange={bulk.toggleAll} disabled={disabled}><span>{bulk.availableCount>bulk.limit?'Select first 10':'Select all'}</span></SelectionCheckbox>}
   <span className="selection-count" aria-live="polite">{bulk.selecting?`${bulk.selectedCount} / ${bulk.limit} selected`:`${bulk.availableCount} ${bulk.availableCount===1?'sticker':'stickers'} · up to ${bulk.limit} per send`}</span>
   {bulk.selectedCount>0&&<button className="clear-selection" aria-label="Clear selection" onClick={bulk.clear} disabled={disabled}>Clear</button>}
  </div>
  <div className="bulk-whatsapp-action"><Suspense fallback={<p role="status">Loading WhatsApp delivery…</p>}><WhatsAppSend batchRequest={bulk.batchRequest} onBatchCreated={bulk.rememberQueue} onBusyChange={bulk.setSubmitting} label={bulk.selecting?'Send selected to WhatsApp':'Send all to WhatsApp'} disabled={actionsDisabled}/></Suspense></div>
  {tooMany&&<p className="bulk-limit-note">Select up to {bulk.limit} stickers to send at once.</p>}
  {bulk.activeQueue&&<p className="bulk-limit-note">Finish or stop your current queue before starting another.</p>}
 </div>;
}
