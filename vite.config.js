import { defineConfig, loadEnv } from 'vite';
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'');
 return {cacheDir:'node_modules/.vite-studio',optimizeDeps:{include:['fflate']},server:{port:5173,strictPort:true,proxy:{'/api':{target:env.API_PROXY_TARGET||'http://127.0.0.1:8080',changeOrigin:true},'/files':{target:env.API_PROXY_TARGET||'http://127.0.0.1:8080',changeOrigin:true}}},preview:{port:4173}};
});
