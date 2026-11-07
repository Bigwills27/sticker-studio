function validSource(value){
 if(typeof value!=='string'||value.length>8192)return false;
 try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&(!url.port||url.port==='443')&&(url.hostname==='tiktok.com'||url.hostname.endsWith('.tiktok.com'));}catch{return false;}
}
export function parseSourceHash(hash){
 if(typeof hash!=='string'||hash.length>26000)return null;
 const params=new URLSearchParams(hash.replace(/^#/,'')),url=params.get('tiktok'),scope=params.get('scope');
 if(params.getAll('tiktok').length!==1||params.getAll('scope').length>1||!validSource(url)||(scope!==null&&scope!=='video'))return null;
 return {url,...(scope==='video'?{scope:'video'}:{})};
}
export function sourceHash(source){
 if(!source||!validSource(source.url))return '';
 const params=new URLSearchParams({tiktok:source.url});if(source.scope==='video')params.set('scope','video');
 return '#'+params.toString();
}
