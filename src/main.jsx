import React,{useEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {AlertCircle,ArrowRight,ArrowUpRight,Check,Info,Link2,Loader2,X} from 'lucide-react';
import useStickerStudio from './useStickerStudio';
import useBulkMedia from './useBulkMedia';
import {AccentMarks,BrandMark,Mascot,Wave} from './Artwork';
import MediaResults from './MediaResults';
import ResultCard from './ResultCard';
import './styles.css';

function App(){
 const studio=useStickerStudio();
 const {url,setUrl,busy,stage,result,discovery,error,setError,toast,setToast,inputRef,submit,paste,reset,run,activeTab,setActiveTab}=studio;
 const bulk=useBulkMedia(discovery,studio.notify);
 const helpRef=useRef(null),headingRef=useRef(null);
 const view=result?'ready':discovery?'gallery':'landing';
 const isPhoto=result?.source?.type==='photo';
 const title=result?`Your ${isPhoto?'photo':'sticker'} is ready.`:discovery?(discovery.scope==='video'?'From this video.':'Your linked comment.'):'Good stickers deserve to escape.';

 useEffect(()=>{
  if(view==='landing')return;
  window.scrollTo({top:0});headingRef.current?.focus({preventScroll:true});
 },[view]);

 function showHelp(){helpRef.current.showModal();}
 function example(){run({}, {example:true});}

 return <div className={`studio-app view-${view}`}>
  <a className="skip-link" href="#converter">Skip to converter</a>
  <header className="site-header content-width">
   <a className="brand" href="/" onClick={event=>{event.preventDefault();reset();}} aria-label="Sticker Studio home"><BrandMark/><span>Sticker<br/>Studio<span className="brand-period">.</span></span></a>
   <nav aria-label="Main navigation">
    {view!=='landing'&&<button onClick={reset}>Converter</button>}
    <button onClick={showHelp}>How it works</button>
    {view!=='landing'&&<button onClick={example} disabled={busy}>Examples</button>}
   </nav>
   {view!=='landing'&&<button className="button nav-convert" onClick={reset}>Convert another<ArrowUpRight size={21}/></button>}
  </header>

  <main id="converter">
   <section className={`hero content-width ${view==='landing'?'hero-landing':'hero-compact'}`} aria-labelledby="main-title">
    <div className="hero-copy">
     <h1 className="display-heading" id="main-title" aria-label={title} tabIndex={-1} ref={headingRef}>
      {view==='landing'?<><span className="headline-line lime">Good stickers</span><span className="headline-line cream">Deserve</span><span className="headline-line lime">To escape<span className="pink headline-period">.</span></span></>:view==='ready'?<><span className="headline-line cream">Your</span><span className="headline-line lime">{isPhoto?'Photo':'Sticker'} is ready<span className="pink headline-period">.</span><AccentMarks/></span></>:discovery.scope==='video'?<><span className="headline-line cream">From this</span><span className="headline-line lime">Video<span className="headline-period">.</span><AccentMarks/></span></>:<><span className="headline-line cream">Your linked</span><span className="headline-line lime">Comment<span className="pink headline-period">.</span></span></>}
     </h1>
     {view==='landing'&&<><AccentMarks className="landing-title-marks" color="lime"/><p className="hero-subtitle">From the comments to your camera roll.</p></>}
     {view==='gallery'&&<div className="gallery-description">
      <p>{discovery.scope==='video'?'Browse the stickers and photos returned from this video’s comments and replies.':'Only media attached to the comment in your link appears here.'}</p>
      {discovery.scope==='video'&&discovery.coverage&&<p className="coverage-note"><Info size={17} aria-hidden="true"/><span>{discovery.coverage.scannedComments} comments and replies checked. {discovery.coverage.complete?'Reached the end of the available comments.':'Some comments may be hidden or unavailable; these counts cover the media returned.'}{discovery.counts?.unavailable>0?` ${discovery.counts.unavailable} files are unavailable.`:''}</span></p>}
     </div>}
     {busy&&view==='gallery'&&<p className="working-status" role="status"><Loader2 className="spin" size={19}/>{stage}…</p>}
     {error&&view==='gallery'&&<p className="inline-error" role="alert"><AlertCircle size={18}/>{error}</p>}
    </div>
    <Mascot pose={view==='landing'?'landing':view==='ready'?'ready':'gallery'}/>
   </section>

   {view==='landing'&&<>
    <section className="entry-area content-width" aria-label="Find a TikTok sticker">
     <form className={`link-form ${error?'has-error':''}`} onSubmit={submit} noValidate>
      <button type="button" className="input-link-icon" onClick={paste} disabled={busy} aria-label="Paste link from clipboard"><Link2 size={30}/></button>
      <label className="sr-only" htmlFor="comment-url">TikTok comment or video link</label>
      <input id="comment-url" ref={inputRef} type="url" placeholder="Paste a TikTok comment link" value={url} onChange={event=>{setUrl(event.target.value);setError('')}} disabled={busy} autoComplete="off" spellCheck="false" aria-invalid={!!error} aria-describedby={error?'input-error':'input-hint'}/>
      {url&&!busy&&<button type="button" className="clear-link icon-button" aria-label="Clear link" onClick={()=>{setUrl('');inputRef.current.focus();}}><X size={19}/></button>}
      <button className="button primary find-button" type="submit" disabled={busy||!url.trim()}>{busy?<><Loader2 size={22} className="spin"/>Finding…</>:<>Find sticker<ArrowRight size={30}/></>}</button>
     </form>
     <p className="sr-only" id="input-hint">A comment link matches that exact comment. A video link browses stickers and photos from its comments.</p>
     {error&&<p className="inline-error" id="input-error" role="alert"><AlertCircle size={19}/>{error}</p>}
     {busy&&<div className="working-status" role="status"><Loader2 size={19} className="spin"/><span>{stage}…</span><button onClick={reset}>Cancel</button></div>}
    </section>
    <section className="how-section" id="how-it-works" aria-labelledby="how-title">
     <Wave className="landing-wave"/>
     <div className="content-width">
      <h2 className="display-heading process-heading" id="how-title"><span>Paste.</span> <span>Preview.</span> <span>Keep.</span></h2>
      <div className="how-footer"><p>Copy a comment link. Find your reaction. Save it for later.</p><button onClick={example} disabled={busy}>Try saved example<ArrowUpRight size={17}/></button></div>
     </div>
    </section>
   </>}

   {view==='ready'&&<section className="result-stage" aria-label="Download your reaction"><Wave variant="ready"/><ResultCard studio={studio}/></section>}

   {view==='gallery'&&<section className="gallery-stage">
    <Wave variant="gallery" className="gallery-lime-wave"/><Wave variant="ready" className="gallery-cream-wave"/>
    <MediaResults discovery={discovery} active={activeTab} onTabChange={setActiveTab} busy={busy||bulk.busy} bulk={bulk} onReset={reset} onBrowseVideo={()=>run({url:discovery.inputUrl,scope:'video'})} onSelect={candidate=>run({url:discovery.inputUrl,discoveryJobId:discovery.jobId,candidateId:candidate.id},{keepGallery:true})}/>
   </section>}
  </main>

  <dialog ref={helpRef} className="help-dialog" onClick={event=>{if(event.target===event.currentTarget)event.currentTarget.close();}}>
   <div className="dialog-head"><h2>Paste. Preview. Keep.</h2><button className="icon-button" aria-label="Close instructions" onClick={()=>helpRef.current.close()}><X size={23}/></button></div>
   <ol><li><strong>Start with a TikTok link.</strong><p>A comment link finds that exact reaction. A video link opens its stickers and photos in separate tabs.</p></li><li><strong>Find the one you want.</strong><p>Check the preview, commenter and text. Some comments may be hidden by TikTok; incomplete scans are labelled.</p></li><li><strong>Make it yours.</strong><p>Download a sticker or share the file. Original files are in File details; photos keep their original resolution. Sharing doesn’t import directly to WhatsApp.</p></li></ol>
   <button className="button primary" onClick={()=>{helpRef.current.close();if(view!=='landing')reset();else inputRef.current?.focus();}}>Try a link<ArrowRight size={21}/></button>
  </dialog>
  <div className="toast-region" aria-live="polite" aria-atomic="true">{toast&&<div className={`toast ${toast.type}`} role={toast.type==='error'?'alert':'status'}>{toast.type==='error'?<AlertCircle size={20}/>:toast.type==='info'?<Info size={20}/>:<Check size={20}/>}<span>{toast.message}</span><button className="icon-button" aria-label="Dismiss notification" onClick={()=>setToast(null)}><X size={17}/></button></div>}</div>
 </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
