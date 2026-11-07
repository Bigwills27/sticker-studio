import {useCallback,useEffect,useReducer,useRef} from 'react';

export async function adminRequest(path,{body,csrf,signal,timeoutMs=35000}={}){
 const controller=new AbortController();let timedOut=false;
 const abort=()=>controller.abort();if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
 const timeout=setTimeout(()=>{timedOut=true;controller.abort()},timeoutMs);
 try{
  const response=await fetch(`/api/admin/${path}`,{method:body?'POST':'GET',credentials:'same-origin',signal:controller.signal,headers:{...(body?{'Content-Type':'application/json'}:{}),...(csrf?{'X-CSRF-Token':csrf}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const data=await response.json().catch(error=>{if(controller.signal.aborted)throw error;return {}});
  if(!response.ok){const error=new Error(data.error?.message||data.message||'Something went wrong. Please try again.');error.status=response.status;throw error;}
  const isObject=data&&typeof data==='object'&&!Array.isArray(data);
  const sessionRoute=['me','login'].includes(path),whatsappRoute=['dashboard','whatsapp/connect','whatsapp/reset'].includes(path);
  if(!isObject||(sessionRoute&&!(typeof data.admin?.email==='string'&&data.admin.email.length&&typeof data.csrfToken==='string'&&data.csrfToken.length))||(whatsappRoute&&typeof data.whatsapp?.status!=='string')){const error=new Error('The admin API returned an invalid response. Check the API deployment and proxy configuration, then try again.');error.code='INVALID_RESPONSE';throw error;}
  return data;
 }catch(error){if(timedOut)throw new Error('The server took too long to respond. Please retry, or reset the WhatsApp session if the connection is stuck.');if(error.name==='AbortError')throw error;if(error.status||error.code==='INVALID_RESPONSE')throw error;throw new Error('Cannot reach the server. Check your connection and try again.');}
 finally{clearTimeout(timeout);signal?.removeEventListener('abort',abort)}
}
const initial={session:null,checking:true,dashboard:null,offline:false,busy:'',error:'',notice:'',refresh:0};
function reducer(state,event){switch(event.type){
 case 'ready':return {...state,checking:false,session:event.session||null,error:event.error||''};
 case 'start':{
  const operation={'whatsapp/connect':['connecting','opening_connection'],'whatsapp/reset':['resetting','clearing_session'],'whatsapp/disconnect':['disconnecting','disconnecting']}[event.action];
  const whatsapp=operation?{...state.dashboard?.whatsapp,status:operation[0],phase:operation[1],operationStartedAt:new Date().toISOString(),operationDeadlineAt:new Date(Date.now()+30000).toISOString(),qr:null,pairingCode:null,pairingExpiresAt:null,error:null,errorCode:null,storageWarning:null,lastDisconnectCode:null,nextRetryAt:null,retryAttempt:0}:null;
  return {...state,busy:event.action,error:'',notice:'',...(whatsapp?{dashboard:{...state.dashboard,whatsapp}}:{})};
 }
 case 'authenticated':return {...state,session:event.session};
 case 'dashboard':return {...state,dashboard:event.data,offline:false};
 case 'offline':return {...state,offline:true};
 case 'action':return {...state,...(event.data.whatsapp?{dashboard:{...state.dashboard,whatsapp:event.data.whatsapp}}:{}),notice:event.data.message||''};
 case 'failure':{
  const operation=['whatsapp/connect','whatsapp/reset','whatsapp/disconnect'].includes(state.busy);
  return {...state,error:event.error,...(operation?{dashboard:{...state.dashboard,whatsapp:{...state.dashboard?.whatsapp,status:'error',phase:null,error:null,errorCode:'REQUEST_FAILED',operationStartedAt:null,operationDeadlineAt:null,nextRetryAt:null,qr:null,pairingCode:null,pairingExpiresAt:null}}}:{})};
 }
 case 'expired':return {...state,session:null,dashboard:null,offline:false,error:'Your session expired. Sign in again.'};
 case 'logout':return {...initial,checking:false};
 case 'finish':return {...state,busy:'',refresh:state.refresh+1};
 default:return state;
}}
export default function useAdminSession(){
 const [state,dispatch]=useReducer(reducer,initial),generation=useRef(0),pending=useRef(false),mounted=useRef(true),actionController=useRef(null);
 useEffect(()=>{mounted.current=true;const controller=new AbortController();adminRequest('me',{signal:controller.signal}).then(session=>dispatch({type:'ready',session})).catch(error=>{if(error.name!=='AbortError')dispatch({type:'ready',error:error.status===401?'':error.message})});return()=>{mounted.current=false;controller.abort();actionController.current?.abort()};},[]);
 useEffect(()=>{if(!state.session)return;let stopped=false,timer,inFlight=false;const controller=new AbortController();async function poll(){if(stopped||inFlight)return;if(document.hidden||pending.current){timer=setTimeout(poll,4000);return;}inFlight=true;const version=generation.current;try{const data=await adminRequest('dashboard',{signal:controller.signal});if(!stopped&&version===generation.current)dispatch({type:'dashboard',data});}catch(error){if(!stopped&&version===generation.current&&error.name!=='AbortError')dispatch(error.status===401?{type:'expired'}:{type:'offline'});}finally{inFlight=false;if(!stopped)timer=setTimeout(poll,4000)}}
 const visible=()=>{if(!document.hidden&&!inFlight){clearTimeout(timer);poll()}};poll();document.addEventListener('visibilitychange',visible);return()=>{stopped=true;controller.abort();clearTimeout(timer);document.removeEventListener('visibilitychange',visible)};
 },[state.session,state.refresh]);
 const login=useCallback(async(email,password)=>{if(pending.current)return false;pending.current=true;dispatch({type:'start',action:'login'});const controller=new AbortController();actionController.current=controller;try{const session=await adminRequest('login',{body:{email,password},signal:controller.signal});if(mounted.current)dispatch({type:'authenticated',session});return true;}catch(error){if(mounted.current&&error.name!=='AbortError')dispatch({type:'failure',error:error.message});return false;}finally{pending.current=false;if(mounted.current)dispatch({type:'finish'})}},[]);
 const mutate=useCallback(async(action,body={})=>{if(pending.current||!state.session)return false;pending.current=true;generation.current++;dispatch({type:'start',action});const controller=new AbortController();actionController.current=controller;try{const data=await adminRequest(action,{body,csrf:state.session.csrfToken,signal:controller.signal});if(mounted.current)dispatch(action==='logout'?{type:'logout'}:{type:'action',data});return true;}catch(error){if(mounted.current&&error.name!=='AbortError')dispatch(error.status===401?{type:'expired'}:{type:'failure',error:error.message});return false;}finally{generation.current++;pending.current=false;if(mounted.current)dispatch({type:'finish'})}},[state.session]);
 return {...state,login,mutate};
}
