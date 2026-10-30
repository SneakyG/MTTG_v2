// Vẽ giao diện, xử lý sự kiện và khởi động
function render(){R=[];const a=$('#app');
if(!CFG.key||!CFG.root)return a.innerHTML='<h1>Cần cấu hình</h1><p>Điền <b>key</b> (Google API key) và <b>root</b> (ID thư mục MTTG) trong file js/env.js (xem README).</p>';
a.innerHTML=(err?`<p class=er>Không tải được từ Google Drive: ${E(err)}<br><small>Kiểm tra API key (đã bật Drive API, đúng domain), ID thư mục, và thư mục đã chia sẻ “Anyone with the link”.</small></p>`:'')+(X.stages.length?V[tab]():err?'':'<p class=mu>Đang tải kỷ niệm từ Google Drive…</p>');
$('#nav').innerHTML=TABS.map(([k,i,n])=>`<button class="${k==tab?'on':''}" data-a=go data-k=${k}><b>${i}</b>${n}</button>`).join('');tick()}
const tick=()=>{const el=$('#hms');if(el){const n=new Date();el.textContent=[n.getHours(),n.getMinutes(),n.getSeconds()].map(P).join(':')}};setInterval(tick,1000);

const ACT={go:k=>{tab=k;render();scrollTo(0,0)},fs:(k,i)=>{F.s=+i;render()},ft:(k,i)=>{F.t=i;render()},sf:(k,i)=>{F.s=+i;F.t='';tab='mem';render();scrollTo(0,0)},
lb:(k,i,b)=>{LB={l:R[b.dataset.l],i:+i};show()},lc:()=>{lb.className='';lb.innerHTML=''},lp:()=>step(-1),lq:()=>step(1),
dr:()=>window.open('https://drive.google.com/drive/folders/'+CFG.root,'_blank'),
rf:async(k,i,b)=>{b.textContent='Đang cập nhật…';err='';try{await load()}catch(e){err=String(e.message||e)}render()}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b)ACT[b.dataset.a]?.(b.dataset.k,b.dataset.i,b)});
render();if(CFG.key&&CFG.root)load().catch(e=>{err=String(e.message||e)}).finally(render);
