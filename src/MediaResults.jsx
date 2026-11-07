import React,{useRef} from 'react';
import {ArrowUpRight,Image as ImageIcon,Info,RotateCcw,Sticker} from 'lucide-react';
import BulkActions from './BulkActions';
import SelectionCheckbox from './SelectionCheckbox';

export const commentLink=(videoId,commentId)=>`https://www.tiktok.com/@/video/${videoId}?share_comment_id=${commentId}`;

export default function MediaResults({discovery,active,onTabChange,onSelect,onBrowseVideo,onReset,busy,bulk}){
 const tabs=useRef([]),types=['sticker','photo'];
 const rows=discovery.candidates.filter(candidate=>candidate.type===active);
 const isComment=discovery.scope==='comment',matched=discovery.matchedComment;
 const counts=Object.fromEntries(types.map(type=>[type,discovery.candidates.filter(candidate=>candidate.type===type).length]));
 const messages={not_retrieved:'We couldn’t retrieve this exact comment.',media_unavailable:'The comment matched, but its file is unavailable.',no_media:'This comment has no sticker or photo.'};
 function navigate(event,index){
  let next;
  if(event.key==='ArrowRight'||event.key==='ArrowLeft')next=(index+1)%2;
  else if(event.key==='Home')next=0;
  else if(event.key==='End')next=1;
  else return;
  event.preventDefault();onTabChange(types[next]);tabs.current[next]?.focus();
 }
 return <section className="candidates content-width" aria-label="Comment media results" aria-busy={busy}>
  {isComment&&<div className="comment-notice">
   {matched&&<div className="matched-comment"><strong>{matched.author?`@${matched.author}`:'Your linked comment'}</strong>{matched.text&&<p>{matched.text}</p>}<a href={commentLink(discovery.videoId,matched.id)} target="_blank" rel="noreferrer">View comment<ArrowUpRight size={15}/></a></div>}
   {messages[discovery.matchStatus]&&<div className="discovery-notice" role="status"><Info size={20} aria-hidden="true"/><div><h2>{messages[discovery.matchStatus]}</h2><p>{discovery.matchStatus==='not_retrieved'?'TikTok may hide some comments. We haven’t substituted another comment’s media.':discovery.matchStatus==='media_unavailable'?'TikTok identified the sticker but did not expose a downloadable file. You can open the comment or browse the video.':'You can browse the video to look for another comment.'}</p></div></div>}
   <button className="button primary browse-video" onClick={onBrowseVideo} disabled={busy}>Browse this video<ArrowUpRight size={19}/></button>
  </div>}
  <div className="gallery-toolbar">
   {(discovery.candidates.length>0||!isComment)&&<div className="media-tabs" role="tablist" aria-label="Comment media">{types.map((type,index)=><button key={type} ref={node=>{tabs.current[index]=node}} id={`media-tab-${type}`} type="button" role="tab" aria-selected={active===type} aria-controls={`media-panel-${type}`} tabIndex={active===type?0:-1} onClick={()=>onTabChange(type)} onKeyDown={event=>navigate(event,index)}><ImageIcon size={19} aria-hidden="true"/><span>{type==='sticker'?'Stickers':'Photos'}</span><span className="count-badge">{counts[type]}</span></button>)}</div>}
   <button className="text-button" onClick={onReset} disabled={busy}><RotateCcw size={18}/>Start again</button>
  </div>
  {discovery.candidates.length>1&&<BulkActions bulk={bulk} disabled={busy}/>}
  {(discovery.candidates.length>0||!isComment)&&types.map(type=><div key={type} id={`media-panel-${type}`} role="tabpanel" aria-labelledby={`media-tab-${type}`} hidden={active!==type} tabIndex={0}>
   {active===type&&(rows.length?<div className="candidate-grid">{rows.map((candidate,index)=><article className={`media-card ${!candidate.available?'media-unavailable':''} ${bulk?.selectedIds.has(candidate.id)?'is-selected':''}`} key={candidate.id}>
    {candidate.type==='sticker'&&discovery.candidates.length>1&&bulk.selecting&&<SelectionCheckbox className="media-select" label={`Select sticker ${index+1}${candidate.author?` by @${candidate.author}`:''}`} checked={bulk.selectedIds.has(candidate.id)} onChange={()=>bulk.toggle(candidate.id)} disabled={busy||!candidate.available||!candidate.mediaUrl||(!bulk.selectedIds.has(candidate.id)&&bulk.selectedCount>=bulk.limit)}/>}
    {candidate.available?<button className="candidate-card" disabled={busy} onClick={()=>onSelect(candidate)} aria-label={`Open ${candidate.type} ${index+1}${candidate.author?` by @${candidate.author}`:''}`}><span className="candidate-image"><img src={candidate.mediaUrl} alt={`${candidate.type==='photo'?'Photo':'Sticker'} from ${candidate.author?`@${candidate.author}`:'this comment'}`} loading="lazy" referrerPolicy="no-referrer" onError={event=>{event.currentTarget.hidden=true;event.currentTarget.parentElement.classList.add('image-failed');}}/></span><span className="candidate-bottom">{candidate.type==='photo'?'Open photo':'Open sticker'}<ArrowUpRight size={17} aria-hidden="true"/></span></button>:<div className="unavailable-preview"><Sticker size={32}/><span>File unavailable</span><p>TikTok did not expose this file.</p></div>}
    <div className="candidate-source"><strong>{candidate.author?`@${candidate.author}`:'Comment author unavailable'}</strong>{candidate.text&&<p title={candidate.text}>{candidate.text}</p>}<a href={commentLink(candidate.videoId,candidate.commentId)} target="_blank" rel="noreferrer">View comment<ArrowUpRight size={15} aria-hidden="true"/></a></div>
   </article>)}</div>:<div className="media-empty">{type==='sticker'?<Sticker size={30}/>:<ImageIcon size={30}/>}<p>No {type==='sticker'?'stickers':'photos'} returned in this scan.</p></div>)}
  </div>)}
 </section>;
}
