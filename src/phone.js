import {parsePhoneNumberFromString,parseDigits} from 'libphonenumber-js/max';
export function phonePreview(input,country){
 let text=input.normalize('NFKC').trim().replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/[٠-٩۰-۹]/g,char=>parseDigits(char));
 if(input.length>80||!/^[+\d\s().-]+$/.test(text))return null;
 text=text.replace(/^00/,'+');
 let parsed=parsePhoneNumberFromString(text,{defaultCountry:country,extract:false});
 if(!parsed?.isValid()&&!text.startsWith('+'))parsed=parsePhoneNumberFromString('+'+text,{extract:false});
 return parsed?.isValid()&&!parsed.ext?parsed.formatInternational():null;
}
