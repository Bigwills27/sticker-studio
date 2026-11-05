import React from 'react';

// All brand artwork is drawn as vectors, independently of the downloaded media.
export function BrandMark(){
 return <svg viewBox="0 0 62 64" fill="none" aria-hidden="true"><path d="M10 3 49 2q8 0 9 9l2 29-18 20-34 1Q2 61 3 52L6 12q0-8 4-9Z" fill="#ddff78"/><path d="M25 60q10-8 14-22 9 7 21 2L42 60Z" fill="#fff9ee" stroke="#002d21" strokeWidth="3.5" strokeLinejoin="round"/></svg>;
}

export function Wave({className='',variant='landing'}){
 const paths={landing:'M0 53C115-2 165 0 285 35S439 14 553 25 690 66 806 34 941 4 1056 26 1221 60 1347 24 1484 2 1600 18V150H0Z',ready:'M0 69C116 6 166-4 282 33S390 56 486 38 615 70 729 42 882 0 1015 37 1168 56 1281 21 1450 32 1600 69V150H0Z',gallery:'M0 79C102 12 161 19 262 63S432 46 533 53 655 96 777 55 899 20 1003 44 1157 27 1277 1 1435 36 1600 62V150H0Z'};
 return <svg className={`wave ${className}`} viewBox="0 0 1600 150" preserveAspectRatio="none" aria-hidden="true"><path d={paths[variant]} fill="currentColor"/></svg>;
}

export function AccentMarks({className='',color='pink'}){
 return <svg className={`accent-marks ${className}`} viewBox="0 0 95 92" fill="none" aria-hidden="true"><g stroke={color==='pink'?'#ff397b':'#e5ff68'} strokeWidth="10" strokeLinecap="round"><path d="m21 39 19-28M38 54 72 29M48 72l33-9"/></g></svg>;
}

function Face({mood='happy'}){
 return <g><path d="M244 142q5-8 10-2m22-3q6-8 11 0" fill="none" stroke="#111710" strokeWidth="4" strokeLinecap="round"/><ellipse cx="252" cy="165" rx="5" ry="11" fill="#111710"/><ellipse cx="280" cy="161" rx="5" ry="11" fill="#111710"/>{mood==='happy'?<><path d="M244 188q22 10 42-4-4 44-21 45-15-4-21-41Z" fill="#111710"/><path d="M261 215q7-12 15-3l-8 12Z" fill="#ff397b"/></>:<path d="m270 182 10 8-12 5q18 13 27 2" fill="none" stroke="#111710" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>}</g>;
}

function Head({mood='happy',transform}){
 return <g transform={transform}><path d="M200 263c-36-29-57-73-61-111-3-23-12-29-39-27-19 1-22-8-5-20 13-10 28-12 42-10-14-14-30-20-46-23-16-3-13-13 6-17 21-4 43 1 61 10-8-14-19-26-33-34-14-10-10-19 9-15 39 6 70 34 93 72 22 38 39 93 40 132l-37 52Z" fill="#fff9ee" stroke="#0c130f" strokeWidth="7" strokeLinejoin="round"/><g transform="translate(-43 -7)"><Face mood={mood}/></g></g>;
}

function MusicNote(){
 const note='M23 0h15c2 13 10 21 22 23v15c-9 0-17-3-23-8v35c0 18-13 31-30 31-18 0-30-13-30-29S-11 39 7 39v16C-2 54-8 60-8 68c0 8 6 14 14 14 9 0 16-6 16-17V0Z';
 return <g><path d={note} fill="#24e5de" transform="translate(-4 -3)"/><path d={note} fill="#ff397b" transform="translate(4 4)"/><path d={note} fill="#091710"/></g>;
}

export function Mascot({pose='landing',className=''}){
 const stroke={stroke:'#0c130f',strokeWidth:7,strokeLinecap:'round',strokeLinejoin:'round'};
 return <svg className={`mascot mascot-${pose} ${className}`} viewBox="0 0 640 520" fill="none" aria-hidden="true">
  {pose==='landing'&&<>
   <g stroke="#ddff78" strokeWidth="12" strokeLinecap="round"><path d="m516 72 10-27m25 46 24-23m-18 52 31-5"/></g>
   <path d="M130 364c5-73 29-104 77-112l37 21 46-29c51 4 80 35 107 46l54-99 56 33c-2 75-26 117-64 136l-35 33Z" fill="#ff397b" {...stroke}/>
   <path d="m177 279 57 34 49-49m-37 48-3 32m26-38 4 27m54-37 31 28m28-40q-8 24-2 39" {...stroke}/>
   <Head transform="translate(30 -12) rotate(-9 200 180)"/>
   <path d="M404 212c-1-21 9-42 27-53 7-8 4-21 1-35-4-21 6-35 24-34 24 2 38 19 43 40l10 48-26 65-49 7Z" fill="#fff9ee" {...stroke}/>
   <g transform="rotate(16 467 151)"><path d="M414 60q1-15 16-15h101q16 0 16 16v106q0 15-15 15H429q-15 0-15-15Z" fill="#dfff78" {...stroke}/><path d="m494 47 1 47q-1 13 14 13h36Z" fill="#fff9ee" {...stroke}/><path d="m428 59 55-1" stroke="#f1ffb9" strokeWidth="5" strokeLinecap="round"/></g>
   <path d="M446 230c-15-13-32-28-34-45-2-13 11-26 28-32l25-11c14-6 26-1 26 10 2 12-12 16-28 28 19 4 30 19 28 35-2 18-14 28-28 29Z" fill="#fff9ee" {...stroke}/>
   <path d="M113 335q-21 0-25 23L73 441q-5 30 24 36l8 2-6 36 44-30 312 13q43 2 50-38l10-69q6-36-31-41Z" fill="#fff9ee" {...stroke}/>
   <path d="m243 397 203 10m-208 23 154 8" stroke="#b3ada1" strokeWidth="18" strokeLinecap="round"/>
   <circle cx="161" cy="408" r="42" fill="#003729" {...stroke}/><g transform="translate(157 379) scale(.57)"><MusicNote/></g>
   <path d="M171 353c-5-30 1-45 15-47 12-1 19 8 23 26l4 20c2 18-13 23-22 12m19-25c-2-29 1-43 15-44 15-1 20 12 21 27l2 26c0 17-15 23-24 10m23-19c-1-28 3-38 17-36 14 2 17 14 16 29l-1 20c-1 16-15 19-23 8" fill="#fff9ee" {...stroke}/>
   <g stroke="#ff5b70" strokeWidth="10" strokeLinecap="round"><path d="m547 391 22-23m-13 44 26-10m-26 32 25 2"/></g>
  </>}
  {pose==='gallery'&&<>
   <g stroke="#e6ff67" strokeWidth="11" strokeLinecap="round"><path d="m112 161-30-17m44-8-19-28m-6 83-31 5"/></g>
   <path d="M108 450q-25-65 3-107c22-36 55-48 98-51l49 22 52-36 51 95-30 91Z" fill="#ff397b" {...stroke}/>
   <path d="m170 315 58 48 41-53m-73 60-41-8" {...stroke}/>
   <Head mood="curious" transform="translate(62 57) rotate(-10 200 180)"/>
   <g transform="rotate(12 411 357)"><rect x="301" y="251" width="214" height="218" rx="25" fill="#ddff78" {...stroke}/><g transform="translate(391 303) scale(1.17)"><MusicNote/></g></g>
   <path d="M333 262c-3-25 3-44 19-45 15-1 20 16 22 34l3 12c2 19-16 24-26 12m23-26c1-25 8-38 23-34 15 3 17 20 17 38 0 21-18 25-29 9m29-11c1-23 8-35 22-31 16 4 17 23 14 39-2 20-19 23-29 9m28-15c4-21 13-28 25-23 14 6 15 22 11 38-4 18-20 22-30 7" fill="#fff9ee" {...stroke}/>
   <path d="M144 432c13-32 33-50 62-49 30 0 49 16 68 29l44 28c17 11 13 25-1 25-11 1-26-8-36-12 10 13 8 25-5 29-10 3-22-5-30-13 5 15-2 24-14 24-12 0-20-11-27-20 2 17-9 24-21 18-20-10-42-27-40-59Z" fill="#fff9ee" {...stroke}/>
   <path d="m156 395 45 15m-28-39 43 14" {...stroke}/>
  </>}
  {pose==='ready'&&<>
   <g stroke="#e6ff67" strokeWidth="12" strokeLinecap="round"><path d="m494 120 11-36m14 56 27-29m-16 53 34-10"/></g>
   <path d="M87 453q-24-58 10-99c29-36 69-43 107-39l43 22 51-27c37 9 60 36 76 59l50-19 33 53q-40 60-92 69Z" fill="#ff397b" {...stroke}/>
   <path d="m141 352 66 33 45-54m-25 48-2 26m36-36 8 22m-145 16q29-30 64-23" {...stroke}/>
   <Head transform="translate(46 64) rotate(-4 200 180)"/>
   <path d="M389 378c-13-25-15-50-17-75l-10-63c-5-27 9-43 26-35 21 9 25 34 23 56l-2 23c20-16 44-9 60 3 22 17 37 40 31 68-5 27-24 52-53 51l-32-4Z" fill="#fff9ee" {...stroke}/>
   <path d="M435 288c-16-11-34-8-39 6-5 14 9 25 25 26-19-3-29 8-27 21 2 12 16 17 29 17-16 0-24 9-18 20 5 11 19 14 32 13" {...stroke}/>
   <path d="M171 409c25-18 51-16 76 1 25 17 45 35 38 55-4 12-16 15-29 10 2 16-10 23-22 16-7 16-21 16-32 5-21 3-43-7-50-25-7-17-1-47 19-62Z" fill="#fff9ee" {...stroke}/>
   <path d="m244 446 12 29m-35-16 13 32m-35-26 3 31" {...stroke}/>
  </>}
 </svg>;
}
