import React,{useEffect,useRef} from 'react';

export default function SelectionCheckbox({label,checked,onChange,disabled=false,indeterminate=false,className='',children}){
 const input=useRef(null);
 useEffect(()=>{if(input.current)input.current.indeterminate=indeterminate},[indeterminate]);
 return <label className={`selection-checkbox ${className}`}>
  <input ref={input} type="checkbox" aria-label={label} checked={checked} onChange={onChange} disabled={disabled}/>
  <span className="checkmark" aria-hidden="true"/>
  {children}
 </label>;
}
