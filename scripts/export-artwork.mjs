import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {mkdir,writeFile} from 'node:fs/promises';

// Recreate standalone SVG assets from the same vector source used by the app.
const vite=await createServer({cacheDir:'node_modules/.vite-artwork',server:{middlewareMode:true},appType:'custom'});
try{
 const {Mascot,Wave,BrandMark}=await vite.ssrLoadModule('/src/Artwork.jsx');
 const folder=new URL('../public/artwork/',import.meta.url);await mkdir(folder,{recursive:true});
 const assets=[...['landing','ready','gallery'].map(pose=>[`mascot-${pose}`,React.createElement(Mascot,{pose})]),...['landing','ready','gallery'].map(variant=>[`wave-${variant}`,React.createElement(Wave,{variant})]),['brand-mark',React.createElement(BrandMark)]];
 for(const [name,element]of assets){
  let svg=renderToStaticMarkup(element).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
  if(name.startsWith('wave-'))svg=svg.replace('fill="currentColor"','fill="#dfff79"');
  await writeFile(new URL(`${name}.svg`,folder),svg+'\n');
 }
 console.log(`Exported ${assets.length} standalone SVG assets.`);
}finally{await vite.close()}
