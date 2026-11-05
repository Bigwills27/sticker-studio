import React from 'react';
import {Download,Loader2,Upload} from 'lucide-react';
import SelectionCheckbox from './SelectionCheckbox';

export default function BulkActions({bulk,disabled}){
 const actionsDisabled=disabled||!bulk.availableCount||(bulk.selecting&&!bulk.selectedCount);
 return <div className="bulk-actions">
  <div className="bulk-selection">
   <button className={`selection-toggle ${bulk.selecting?'active':''}`} onClick={bulk.toggleSelecting} disabled={disabled||!bulk.availableCount}>{bulk.selecting?'Cancel':'Select'}</button>
   {bulk.selecting&&<SelectionCheckbox className="select-all" label="Select all available media" checked={bulk.allSelected} indeterminate={bulk.selectedCount>0&&!bulk.allSelected} onChange={bulk.toggleAll} disabled={disabled||!bulk.availableCount}><span>Select all</span></SelectionCheckbox>}
   <span className="selection-count" aria-live="polite">{bulk.selecting?`${bulk.selectedCount} selected`:'Both tabs · ZIP download'}</span>
   {bulk.selectedCount>0&&<button className="clear-selection" aria-label="Clear selection" onClick={bulk.clear} disabled={disabled}>Clear</button>}
  </div>
  <div className="bulk-buttons">
   <button className="bulk-download" title="Download original files as a ZIP" onClick={bulk.download} disabled={actionsDisabled}><Download size={18} aria-hidden="true"/>{bulk.selecting?'Download selected':'Download all'}</button>
   <button className="bulk-share" onClick={bulk.share} disabled={actionsDisabled}><Upload size={18} aria-hidden="true"/>{bulk.shareReadyCount?`Share ${bulk.shareReadyCount} ${bulk.shareReadyCount===1?'file':'files'}`:bulk.selecting?'Share selected':'Share all'}</button>
  </div>
  {bulk.status&&<div className="bulk-status" role="status">{bulk.busy&&<Loader2 size={16} className="spin" aria-hidden="true"/>}<span>{bulk.status}</span>{bulk.busy&&<button onClick={bulk.cancel} aria-label="Cancel preparation">Stop</button>}</div>}
 </div>;
}
