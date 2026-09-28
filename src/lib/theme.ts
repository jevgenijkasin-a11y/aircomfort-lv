// Light/dark theme. Runs as an inline <head> script (before first paint, so
// there is no flash): saved choice → OS preference → light.
// While the visitor has not chosen a theme, the site follows OS changes live.

export const THEME_STORAGE_KEY = 'theme';
export const THEME_COLOR = { light: '#FFFFFF', dark: '#0A1628' } as const;

export const THEME_SCRIPT = `(function(){
var d=document.documentElement,K=${JSON.stringify(THEME_STORAGE_KEY)};
var mq=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
function saved(){try{var v=localStorage.getItem(K);return v==='light'||v==='dark'?v:null}catch(e){return null}}
function apply(t){d.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?${JSON.stringify(THEME_COLOR.dark)}:${JSON.stringify(THEME_COLOR.light)});}
apply(saved()||(mq&&mq.matches?'dark':'light'));
if(mq){var f=function(e){if(!saved())apply(e.matches?'dark':'light')};mq.addEventListener?mq.addEventListener('change',f):mq.addListener&&mq.addListener(f);}
window.__setTheme=function(t){try{localStorage.setItem(K,t)}catch(e){}d.classList.add('theme-switching');apply(t);setTimeout(function(){d.classList.remove('theme-switching')},50);};
})();`;
