import React,{lazy,Suspense} from 'react';
import {ArrowLeft,ArrowUpRight,CheckCheck,Download,Loader2,Pause,Play,Upload} from 'lucide-react';
import {API} from './api';
import {commentLink} from './MediaResults';
const WhatsAppSend=lazy(()=>import('./WhatsAppSend'));

const formatBytes=value=>value>=1024?`${(value/1024).toFixed(value>10240?0:1)} KB`:`${value} B`;

export default function ResultCard({studio}){
 const {result,playing,still,setPlaying,save,share,downloadBusy,sharing,discovery,backToResults,run,url}=studio;
 const isPhoto=result.source?.type==='photo';
 const originalOnly=!result.stickerFile;
 const output=result.output||result.original;
 const kind=isPhoto?'Original photo':originalOnly?'Original sticker':output.animated?'Animated sticker':'Static sticker';
 return <div className="result-container content-width">
  <article className="result-card" aria-label={isPhoto?'Your photo download':'Your sticker download'}>
   <figure className="result-figure">
    <img className="result-image" src={!playing&&still?still:`${API}${result.originalFile||result.stickerFile}`} alt={isPhoto?'Your original photo':'Your sticker'}/>
    {output.animated&&still&&<button className="animation-control icon-button" aria-label={playing?'Pause sticker preview':'Play sticker preview'} onClick={()=>setPlaying(!playing)}>{playing?<Pause size={19}/>:<Play size={19}/>}</button>}
   </figure>
   <div className="result-content">
    <div className="result-comment">
     <h2>{result.source?.author?`@${result.source.author}`:result.sourceMode==='saved_example'?'Saved example':'Your reaction.'}</h2>
     {result.source?.text&&<p className="comment-bubble">{result.source.text}</p>}
     {result.sourceMode==='saved_example'&&<p className="example-note">An animated TikTok sticker, saved for you to try.</p>}
    </div>
    {!isPhoto&&result.stickerFile&&<Suspense fallback={<p className="whatsapp-unavailable" role="status">Loading WhatsApp delivery…</p>}><WhatsAppSend stickerFile={result.stickerFile}/></Suspense>}
    <div className="result-actions">
     <button className="button primary" aria-label={originalOnly?'Download original':'Download sticker'} onClick={()=>save(originalOnly)} disabled={downloadBusy}>{downloadBusy?<Loader2 className="spin" size={25}/>:<Download size={28}/>}Download</button>
     <button className="button secondary" onClick={share} disabled={sharing}>{sharing?<Loader2 className="spin" size={24}/>:<Upload size={26}/>}Share</button>
    </div>
    <details className="file-details">
     <summary>File details</summary>
     <div className="file-details-content">
      <span>{kind}</span><span>{output.format.toUpperCase()} · {output.width} × {output.height} · {formatBytes(output.bytes)}</span>
      {output.animated&&<span>{output.frames} frames · {(output.durationMs/1000).toFixed(2).replace(/0$/,'')} s</span>}
      {result.exactCommentMatched&&<span className="match-label"><CheckCheck size={15} aria-hidden="true"/>Exact comment verified</span>}
      {result.conversionUnavailable&&<p className="conversion-notice">{result.conversionUnavailable.message}</p>}
      <div className="file-links">
       {!originalOnly&&<button onClick={()=>save(true)} disabled={downloadBusy}>Download original<Download size={14}/></button>}
       {result.source&&<a href={commentLink(result.source.videoId,result.source.commentId)} target="_blank" rel="noreferrer">View comment<ArrowUpRight size={14}/></a>}
       {result.source&&!discovery&&<button onClick={()=>run({url,scope:'video'})}>Browse this video<ArrowUpRight size={14}/></button>}
      </div>
     </div>
    </details>
   </div>
  </article>
  {discovery&&<button className="back-to-results" onClick={backToResults}><ArrowLeft size={18}/>Back to results</button>}
 </div>;
}
