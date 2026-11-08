(() => {
"use strict";
const sheet=document.getElementById("paperSheet");
const canvas=document.getElementById("ink");
const ctx=canvas.getContext("2d");
const colorInput=document.getElementById("color");
const sizeInput=document.getElementById("size");
const palmInput=document.getElementById("palm");
const paperInput=document.getElementById("paper");
let tool="pen", drawing=false, activePointer=null, current=null, strokes=[], pages=[[]], pageIndex=0;
const STORAGE="smartpen-v2-pages";
function resize(){
 const rect=sheet.getBoundingClientRect();
 const dpr=Math.max(1,window.devicePixelRatio||1);
 const old=document.createElement("canvas"); old.width=canvas.width; old.height=canvas.height;
 if(old.width&&old.height) old.getContext("2d").drawImage(canvas,0,0);
 canvas.width=Math.round(rect.width*dpr); canvas.height=Math.round(sheet.offsetHeight*dpr);
 canvas.style.width=rect.width+"px"; canvas.style.height=sheet.offsetHeight+"px";
 ctx.setTransform(dpr,0,0,dpr,0,0);
 redraw();
}
function setPaper(){sheet.className=paperInput.value;}
function redraw(){
 const rect=sheet.getBoundingClientRect(); ctx.clearRect(0,0,rect.width,sheet.offsetHeight);
 for(const s of strokes) drawStroke(s);
}
function drawStroke(s){
 if(!s.points.length)return;
 ctx.save();ctx.globalCompositeOperation=s.erase?"destination-out":"source-over";
 ctx.strokeStyle=s.color;ctx.lineWidth=s.width;ctx.lineCap="round";ctx.lineJoin="round";
 ctx.beginPath();ctx.moveTo(s.points[0].x,s.points[0].y);
 if(s.points.length===1){ctx.lineTo(s.points[0].x+0.01,s.points[0].y+0.01);}
 else for(let i=1;i<s.points.length;i++)ctx.lineTo(s.points[i].x,s.points[i].y);
 ctx.stroke();ctx.restore();
}
function point(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
function isLargeTouch(e){
 // iPad Safari spesso non espone dimensioni attendibili: questo filtro è solo euristico.
 return e.pointerType==="touch" && ((e.width||0)>35 || (e.height||0)>35);
}
canvas.addEventListener("pointerdown",e=>{
 if(palmInput.checked && isLargeTouch(e)) return;
 if(e.pointerType==="mouse" && e.button!==0)return;
 e.preventDefault();drawing=true;activePointer=e.pointerId;
 try{canvas.setPointerCapture(e.pointerId)}catch(_){}
 current={color:colorInput.value,width:Number(sizeInput.value),erase:tool==="eraser",points:[point(e)]};
 strokes.push(current);drawStroke(current);
});
canvas.addEventListener("pointermove",e=>{
 if(!drawing||e.pointerId!==activePointer)return;
 if(palmInput.checked && isLargeTouch(e))return;
 e.preventDefault();current.points.push(point(e));redraw();
});
function end(e){if(!drawing||e.pointerId!==activePointer)return;drawing=false;activePointer=null;current=null;save();}
canvas.addEventListener("pointerup",end);canvas.addEventListener("pointercancel",end);canvas.addEventListener("lostpointercapture",()=>{drawing=false;activePointer=null;current=null;save();});
document.querySelectorAll("[data-tool]").forEach(b=>b.addEventListener("click",()=>{
 tool=b.dataset.tool;document.querySelectorAll("[data-tool]").forEach(x=>x.classList.toggle("active",x===b));
}));
document.getElementById("undo").addEventListener("click",()=>{strokes.pop();redraw();save();});
document.getElementById("clear").addEventListener("click",()=>{if(confirm("Cancellare tutti i tratti di questa pagina?")){strokes=[];redraw();save();}});
document.getElementById("newPage").addEventListener("click",()=>{pages[pageIndex]=strokes;pages.push([]);pageIndex=pages.length-1;strokes=pages[pageIndex];updatePage();redraw();save();});
function updatePage(){document.getElementById("pageLabel").textContent=`Pagina ${pageIndex+1} / ${pages.length}`;}
paperInput.addEventListener("change",()=>{setPaper();save();});
document.getElementById("export").addEventListener("click",()=>window.print());
function save(){pages[pageIndex]=strokes;try{localStorage.setItem(STORAGE,JSON.stringify({pages,paper:paperInput.value}));}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem(STORAGE)||"null");if(d&&Array.isArray(d.pages)&&d.pages.length){pages=d.pages;pageIndex=0;strokes=pages[0]||[];paperInput.value=d.paper||"grid";}}catch(e){}setPaper();updatePage();}
load();
const ro=new ResizeObserver(()=>resize());ro.observe(sheet);resize();
if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
})();