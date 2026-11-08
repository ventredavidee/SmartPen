(() => {
  const canvas = document.getElementById('paperCanvas');
  const ctx = canvas.getContext('2d');
  const wrap = document.getElementById('paperWrap');
  const state = {
    page: 1, pages: {}, tool: 'pen', color: '#172554', width: 3,
    paper: 'grid', drawing: false, start: null, current: null,
    activePointer: null, history: [], viewScale: 1
  };
  const $ = id => document.getElementById(id);
  const STORAGE_KEY = 'smartpen-notebook-v1';

  function pageData() {
    if (!state.pages[state.page]) state.pages[state.page] = [];
    return state.pages[state.page];
  }
  function showMessage(message) {
    $('messageText').textContent = message;
    $('messageDialog').showModal();
  }
  function resize() {
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const old = canvas.width && canvas.height ? canvas.toDataURL() : null;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  }
  function drawPaper() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    ctx.save();
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = '#e5ebf3'; ctx.lineWidth = 1;
    if (state.paper === 'grid' || state.paper === 'isometric') {
      const step = 24;
      for (let x=0;x<w;x+=step) for(let y=0;y<h;y+=step) {
        if (state.paper === 'grid') {
          ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();
          ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();
          break;
        }
      }
      if(state.paper === 'isometric'){
        ctx.strokeStyle='#e6edf5';
        const s=24;
        for(let x=-h;x<w+h;x+=s){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+h,h);ctx.stroke();ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-h,h);ctx.stroke();}
        for(let y=0;y<h;y+=s*1.5){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
      }
    } else if (state.paper === 'lined') {
      for(let y=28;y<h;y+=28){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    }
    ctx.restore();
  }
  function render() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    drawPaper();
    for (const stroke of pageData()) drawStroke(stroke);
    if (state.drawing && state.current) drawStroke(state.current);
  }
  function drawStroke(s) {
    if (!s.points || !s.points.length) return;
    ctx.save();
    ctx.globalCompositeOperation = s.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = s.color || '#172554';
    ctx.fillStyle = s.color || '#172554';
    ctx.lineWidth = s.tool === 'eraser' ? s.width : s.width;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (s.tool === 'line' && s.points.length > 1) {
      ctx.beginPath();ctx.moveTo(s.points[0].x,s.points[0].y);
      const p=s.points[s.points.length-1];ctx.lineTo(p.x,p.y);ctx.stroke();
    } else if (s.points.length === 1) {
      const p=s.points[0];ctx.beginPath();ctx.arc(p.x,p.y,Math.max(0.7,ctx.lineWidth/2),0,Math.PI*2);ctx.fill();
    } else {
      ctx.beginPath();ctx.moveTo(s.points[0].x,s.points[0].y);
      for(let i=1;i<s.points.length;i++) ctx.lineTo(s.points[i].x,s.points[i].y);
      ctx.stroke();
    }
    ctx.restore();
  }
  function coords(e) {
    const r=canvas.getBoundingClientRect();
    return {x:e.clientX-r.left,y:e.clientY-r.top};
  }
  function contactRadius(e) {
    // iOS Safari può esporre la dimensione del contatto tramite Touch.radiusX/Y.
    // PointerEvent non la espone sempre: in quel caso il filtro non può classificare il palmo.
    const t=e.nativeEvent || e;
    const rx=Number(t.width || t.radiusX*2 || 0);
    const ry=Number(t.height || t.radiusY*2 || 0);
    return Math.max(rx,ry);
  }
  function shouldIgnore(e) {
    if (!$('palmFilter').checked) return false;
    const radius=contactRadius(e);
    const threshold=Number($('threshold').value);
    // Se il browser non fornisce una misura attendibile, non inventiamo una classificazione.
    if (!radius) return false;
    return radius > threshold;
  }
  function begin(e) {
    if (state.tool === 'pan') return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (shouldIgnore(e)) { $('filterStatus').textContent='Contatto ampio ignorato'; return; }
    if (state.activePointer !== null) return;
    state.activePointer=e.pointerId;
    canvas.setPointerCapture?.(e.pointerId);
    const p=coords(e);
    state.drawing=true; state.start=p;
    state.current={tool:state.tool,color:state.color,width:state.tool==='eraser'?Math.max(14,state.width*5):state.width,points:[p]};
    e.preventDefault(); render();
  }
  function move(e) {
    if (!state.drawing || e.pointerId!==state.activePointer) return;
    if (shouldIgnore(e)) return;
    const p=coords(e);
    if(state.tool==='line') state.current.points=[state.start,p];
    else state.current.points.push(p);
    e.preventDefault();render();
  }
  function end(e) {
    if(!state.drawing || e.pointerId!==state.activePointer) return;
    state.history.push(JSON.stringify(pageData()));
    pageData().push(state.current);
    state.current=null;state.drawing=false;state.activePointer=null;
    $('filterStatus').textContent=$('palmFilter').checked?'Filtro attivo · compatibilità variabile':'Filtro disattivato';
    render();
  }
  canvas.addEventListener('pointerdown',begin,{passive:false});
  canvas.addEventListener('pointermove',move,{passive:false});
  canvas.addEventListener('pointerup',end);
  canvas.addEventListener('pointercancel',end);
  canvas.addEventListener('lostpointercapture',end);

  document.querySelectorAll('.tool').forEach(b=>b.addEventListener('click',()=>{
    state.tool=b.dataset.tool;
    document.querySelectorAll('.tool').forEach(x=>x.classList.toggle('active',x===b));
  }));
  $('color').addEventListener('input',e=>state.color=e.target.value);
  $('width').addEventListener('input',e=>state.width=Number(e.target.value));
  $('paper').addEventListener('change',e=>{state.paper=e.target.value;render();});
  $('threshold').addEventListener('input',()=>{$('filterStatus').textContent='Soglia aggiornata';});
  $('palmFilter').addEventListener('change',()=>{$('filterStatus').textContent=$('palmFilter').checked?'Filtro attivo · compatibilità variabile':'Filtro disattivato';});

  $('undoBtn').addEventListener('click',()=>{
    if(!pageData().length)return;
    pageData().pop();render();
  });
  $('clearBtn').addEventListener('click',()=>{
    if(confirm('Vuoi svuotare questa pagina?')){pageData().length=0;render();}
  });
  $('prevPage').addEventListener('click',()=>changePage(-1));
  $('nextPage').addEventListener('click',()=>changePage(1));
  function changePage(delta){state.page=Math.max(1,state.page+delta);$('pageLabel').textContent='Pagina '+state.page;render();}
  $('saveBtn').addEventListener('click',save);
  function save(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify({pages:state.pages,page:state.page,paper:state.paper}));showMessage('Quaderno salvato su questo iPad.');}
    catch(e){showMessage('Non è stato possibile salvare. Potrebbe mancare spazio disponibile.');}
  }
  function load(){
    try{const raw=localStorage.getItem(STORAGE_KEY);if(raw){const d=JSON.parse(raw);state.pages=d.pages||{};state.page=d.page||1;state.paper=d.paper||'grid';$('paper').value=state.paper;}}
    catch(e){}
    $('pageLabel').textContent='Pagina '+state.page;
  }
  $('pdfBtn').addEventListener('click',()=>{
    const png=canvas.toDataURL('image/png');
    const win=window.open('','_blank');
    if(!win){showMessage('Consenti i popup per esportare il PDF.');return;}
    win.document.write('<!doctype html><html><head><title>SmartPen - Pagina '+state.page+'</title><style>@page{size:A4;margin:10mm}body{margin:0}img{width:100%;height:auto;display:block}</style></head><body><img src="'+png+'" onload="window.print()"></body></html>');
    win.document.close();
  });
  load();
  if('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }
  if('ontouchstart' in window) $('hint').textContent='Suggerimento: prova il filtro mano. Il riconoscimento dipende dai dati touch forniti da iPadOS.';
  window.addEventListener('resize',resize);
  resize();
})();