// Tab Tương lai: kế hoạch của hai đứa, lưu trong ke_hoach.json (thư mục MTTG). Xem không cần đăng nhập, thêm/sửa cần đăng nhập Google
const CATS=[['travel','✈️','Du lịch','#5ec8ff'],['home','🏠','Nhà cửa','#ffb085'],['wed','💍','Cưới hỏi','#ff6f91'],['family','👶','Gia đình','#ffd27a'],['money','💰','Tài chính','#7be0a8'],['work','💼','Sự nghiệp','#b79cff'],['health','💪','Sức khoẻ','#6fe3d3'],['fun','🎨','Sở thích','#ff9bd2'],['other','✨','Khác','#c9b6ff']],
STL={idea:'💡 Ý tưởng',doing:'🔥 Đang làm',done:'✅ Xong'},
TPL=[{t:'Du lịch nước ngoài cùng nhau',c:'travel'},{t:'Mua nhà riêng',c:'home'},{t:'Lập quỹ khẩn cấp',c:'money'},{t:'Nuôi một bé thú cưng',c:'family'},{t:'Cùng học một kỹ năng mới',c:'fun'},{t:'Tập thể dục cùng nhau mỗi tuần',c:'health'}],
HZ=[['late','⏰','Cần để ý','Đã quá hạn dự định'],['y0','🌱','Năm nay',''],['y1','🌿','Năm sau',''],['y5','🌳','Từ 2 đến 5 năm tới',''],['far','🌌','Ước mơ xa',''],['done','🏆','Đã hoàn thành','']],
cat=c=>CATS.find(x=>x[0]==c)||CATS[8],pid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5),
plEnd=d=>{const m=/^(\d{4})(?:-(\d{2}))?$/.exec(d||'');return m?(m[2]?new Date(+m[1],+m[2],0):new Date(+m[1],11,31)):null},
fmn=n=>n?String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.'):'',rnd2=x=>x.toFixed(2).replace(/\.?0+$/,'').replace('.',','),
vnd=n=>n>=1e9?rnd2(n/1e9)+' tỷ':n>=1e6?rnd2(n/1e6)+' triệu':(fmn(n)||'0')+'đ',
plLbl=d=>d.length>4?`Tháng ${+d.slice(5)}/${d.slice(0,4)}`:`Năm ${d}`,
lft=l=>{const a=Math.abs(l);return a<60?a+' ngày':a<730?Math.round(a/30)+' tháng':(a/365).toFixed(1).replace('.0','')+' năm'};
function hz(p){if(p.s=='done')return'done';const e=plEnd(p.d);if(!e)return'far';const t=today();if(e<t)return'late';const y=e.getFullYear()-t.getFullYear();return y==0?'y0':y==1?'y1':y<=5?'y5':'far'}
const pcard=p=>{const c=cat(p.c),e=plEnd(p.d),l=e?dd(today(),e):null,st=p.st||[],sd=st.filter(s=>s.x).length,pr=st.length?Math.round(sd/st.length*100):0,mp=p.g?Math.min(100,Math.round((p.m||0)/p.g*100)):0,done=p.s=='done';
return `<div class="pc rv${PX.has(p.id)?' open':''}${done?' dn':''}" style="--c:${c[3]}"><div class=pch data-a=ple data-i="${p.id}"><span class=pe>${c[1]}</span><div class=pm2><b class=pt2>${E(p.t)}</b><div class=pmeta><span class=tag>${c[2]}</span>${e?`<span class="tag${l<0&&!done?' red':''}">${plLbl(p.d)}${done?'':l>=0?', còn '+lft(l):', quá hạn '+lft(l)}</span>`:''}<span class=stars>${'⭐'.repeat(p.p||1)}</span></div></div><span class=st2 data-s=${p.s}>${STL[p.s]||STL.idea}</span></div>
${st.length?`<div class=pb2><div class=pbar style="--w:${pr}%"><i></i></div><small>${sd}/${st.length} bước</small></div>`:''}
${p.g?`<div class=pb2><div class="pbar gold" style="--w:${mp}%"><i></i></div><small>${vnd(p.m||0)} / ${vnd(p.g)}</small><button class=lk2 data-a=pmn data-i="${p.id}">＋ Gom thêm</button></div>`:''}
<div class=pdt><div>${p.n?`<p class=pnote>${E(p.n)}</p>`:''}${st.map((s,j)=>`<div class=ps data-a=pst data-i="${p.id}" data-j=${j}><span class="cbx${s.x?' on':''}"></span><span class="${s.x?'sdn':''}">${E(s.t)}</span></div>`).join('')}<div class=pact><button class=bt data-a=ped data-i="${p.id}">✎ Sửa</button><button class=btp data-a=pdn data-i="${p.id}">${done?'Mở lại':'✓ Hoàn thành'}</button></div></div></div></div>`};
V.plan=()=>{const T=today(),A=PL,dn=A.filter(p=>p.s=='done').length,pct=A.length?Math.round(dn/A.length*100):0,gp=A.filter(p=>p.g),G=gp.reduce((s,p)=>s+p.g,0),M=gp.reduce((s,p)=>s+Math.min(p.m||0,p.g),0),
nx=A.filter(p=>p.s!='done'&&plEnd(p.d)&&plEnd(p.d)>=T).sort((a,b)=>plEnd(a.d)-plEnd(b.d))[0],
L=A.filter(p=>(!PF.c||p.c==PF.c)&&(!PF.s||p.s==PF.s)),g={},
chips=(a,k)=>`<div class=chs>${a.map(([v,t])=>`<button class="ch${PF[k]==v?' on':''}" data-a=pf${k} data-i="${v}">${E(t)}</button>`).join('')}</div>`,
srt=(a,b)=>(b.p||1)-(a.p||1)||(plEnd(a.d)||1e15)-(plEnd(b.d)||1e15);
L.forEach(p=>(g[hz(p)]??=[]).push(p));
return `<div class="ph gl rv"><div class=pr><svg viewBox="0 0 120 120"><defs><linearGradient id=plgrad x1=0 y1=0 x2=1 y2=1><stop offset=0 stop-color="#ffd27a"></stop><stop offset=1 stop-color="#ff6f91"></stop></linearGradient></defs><circle class=rb cx=60 cy=60 r=52></circle><circle class=rf cx=60 cy=60 r=52 style="--off:${(327*(1-pct/100)).toFixed(1)}"></circle></svg><div class=prc><b>${dn}/${A.length}</b><small>đã xong</small></div></div>
<div class=pi><h1 class=nm>Tương lai của mình</h1><p class=mu style="margin:4px 0 0">Những điều hai đứa sẽ cùng làm</p><div class=psm><span><b>${A.length}</b> kế hoạch</span><span><b>${A.filter(p=>p.s=='doing').length}</b> đang làm</span><span><b>${pct}%</b> hoàn thành</span></div>
${G?`<div class=pb2 style="margin-top:12px"><div class="pbar gold" style="--w:${Math.round(M/G*100)}%;--c:#ffd27a"><i></i></div><small>Quỹ chung ${vnd(M)} / ${vnd(G)}</small></div>`:''}${nx?`<div class=pmn>⏳ Sắp đến hạn: <b>${E(nx.t)}</b>, còn ${lft(dd(T,plEnd(nx.d)))}</div>`:''}</div></div>
<div class=tb><button class=btp data-a=pln>＋ Thêm kế hoạch</button></div>
${A.length?chips([['','Tất cả'],...CATS.filter(c=>A.some(p=>p.c==c[0])).map(c=>[c[0],c[1]+' '+c[2]])],'c')+chips([['','Mọi trạng thái'],['idea','💡 Ý tưởng'],['doing','🔥 Đang làm'],['done','✅ Đã xong']],'s'):''}
${A.length?(L.length?`<div class=pj>${HZ.filter(h=>g[h[0]]).map(h=>`<section class="pgp rv" data-h=${h[0]}><div class=pgh><i>${h[1]}</i><div><b class=fr>${h[2]}</b><small>${g[h[0]].length} kế hoạch${h[3]?', '+h[3].toLowerCase():''}</small></div></div><div class=pg>${g[h[0]].sort(srt).map(pcard).join('')}</div></section>`).join('')}</div>`:'<p class=mu style="text-align:center;padding:30px 0">Không có kế hoạch nào khớp bộ lọc.</p>'):`<div class="pem rv"><div class=bg2>🌠</div><h3 class=fr>Chưa có kế hoạch nào</h3><p class=mu>Hãy viết ra điều hai đứa muốn cùng làm. Có thể bắt đầu từ vài gợi ý:</p><div class=chs style="justify-content:center">${TPL.map((t,i)=>`<button class=ch data-a=pq data-i=${i}>${cat(t.c)[1]} ${E(t.t)}</button>`).join('')}</div></div>`}`};
const planFx=()=>{if(tab!='plan')return;const h=$('.ph');h&&!h.querySelector('.fl')&&rain(h,8)};

// Đọc/ghi ke_hoach.json (đọc bằng API key, ghi bằng tài khoản Google đã đăng nhập; luôn đọc bản mới nhất trước khi ghi)
async function plLoad(){if(!PLF){PLT='';plParse('');return}try{const r=await fetch(`${API}/${PLF}?alt=media&key=${CFG.key}&_=${Date.now()}`);if(r.ok){PLT=await r.text();plParse(PLT)}}catch(e){}}
async function plWrite(list){const body=JSON.stringify(list,null,1);
if(PLF)await gf(`${UP}/${PLF}?uploadType=media`,{method:'PATCH',headers:{'Content-Type':'application/json; charset=UTF-8'},body});
else{const b='b'+Date.now(),r=await gf(`${UP}?uploadType=multipart&fields=id`,{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+b},
body:`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({name:'ke_hoach.json',parents:[CFG.root],mimeType:'application/json'})}\r\n--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${body}\r\n--${b}--`});PLF=(await r.json()).id}
PLT=body;plParse(body);saveCache()}
async function plMut(fn){await auth();if(PLF)plParse(await(await gf(`${API}/${PLF}?alt=media`)).text());await plWrite(fn(PL.map(x=>({...x})))||PL)}

function plDlg(id,pre){const o=PL.find(x=>x.id==id),p=o||pre||{},y0=new Date().getFullYear(),dm=(p.d||'').split('-'),
rad=(n,a,cur)=>`<div class=sg>${a.map(([v,t])=>`<label class=sgi><input type=radio name=${n} value="${v}" ${v==cur?'checked':''}><span>${t}</span></label>`).join('')}</div>`;
mOpen(`<h3>${o?'Sửa kế hoạch':'Thêm kế hoạch'}</h3><span class=fgl>Tên kế hoạch</span><input id=pt value="${E(p.t||'')}" maxlength=70 placeholder="Vd: Đi Nhật Bản cùng nhau" autocomplete=off>
<span class=fgl>Loại</span>${rad('pc',CATS.map(c=>[c[0],c[1]+' '+c[2]]),p.c||'travel')}
<span class=fgl>Dự định hoàn thành</span><div class=two><select id=pm><option value="">Tháng</option>${[...Array(12)].map((_,i)=>`<option value=${i+1}${+dm[1]==i+1?' selected':''}>Tháng ${i+1}</option>`).join('')}</select><select id=py><option value="">Chưa xác định</option>${[...Array(31)].map((_,i)=>`<option${dm[0]==y0+i?' selected':''}>${y0+i}</option>`).join('')}</select></div>
<span class=fgl>Độ ưu tiên</span>${rad('pp',[['1','⭐ Thường'],['2','⭐⭐ Quan trọng'],['3','⭐⭐⭐ Rất quan trọng']],String(p.p||1))}
<span class=fgl>Trạng thái</span>${rad('ps',[['idea','💡 Ý tưởng'],['doing','🔥 Đang làm'],['done','✅ Đã xong']],p.s||'idea')}
<span class=fgl>Tiền (tuỳ chọn)</span><div class=two><div class=mw><span class=mcap>Mục tiêu (đ)</span><input id=pgoal class=mny inputmode=numeric placeholder="0" value="${fmn(p.g)}" autocomplete=off><small class=mh></small></div><div class=mw><span class=mcap>Đã gom (đ)</span><input id=pmo class=mny inputmode=numeric placeholder="0" value="${fmn(p.m)}" autocomplete=off><small class=mh></small></div></div>
<span class=fgl>Các bước (mỗi dòng một bước)</span><textarea id=pst rows=4 placeholder="Làm hộ chiếu&#10;Đặt vé máy bay">${E((p.st||[]).map(s=>s.t).join('\n'))}</textarea>
<span class=fgl>Ghi chú</span><textarea id=pn rows=2>${E(p.n||'')}</textarea><p class=er id=em></p>
<div class=wb><button class=btp data-a=pls data-i="${id||''}">Lưu</button>${o?`<button class=bt data-a=pld data-i="${id}">Xoá</button>`:''}<button class=bt data-a=mc>Huỷ</button></div>`);
document.querySelectorAll('.mny').forEach(moneyHint);const t=$('#pt');t&&t.focus()}
async function plSubmit(b,id){const em=$('#em');em.textContent='';
try{const t=$('#pt').value.trim().slice(0,70);if(!t)return em.textContent='Hãy nhập tên kế hoạch';
const y=$('#py').value,m=$('#pm').value,d=y?(m?y+'-'+P(m):y):'',num=s=>+(String(s||'').replace(/\D/g,''))||0,g=num($('#pgoal').value),mo=num($('#pmo').value),
lines=$('#pst').value.split('\n').map(s=>s.trim()).filter(Boolean).slice(0,30),val=n=>document.querySelector(`input[name=${n}]:checked`).value;
b.disabled=true;b.textContent='Đang lưu…';
await plMut(a=>{const o=a.find(x=>x.id==id),old=o&&o.st||[],st=lines.map(l=>({t:l,x:(old.find(s=>s.t==l)||{}).x?1:0})),s=val('ps'),
rec={id:id||pid(),t,c:val('pc'),d,p:+val('pp'),s,n:$('#pn').value.trim().slice(0,300),g,m:mo,st,dn:s=='done'?(o&&o.dn)||iso(today()):''};o?Object.assign(o,rec):a.push(rec);return a});
mClose();render();toast('Đã lưu kế hoạch')}
catch(e){em.textContent=e.message||String(e);b.disabled=false;b.textContent='Lưu'}}
async function plDel(b,id){if(!b.dataset.c){b.dataset.c=1;b.textContent='Bấm lần nữa để xoá';return}b.disabled=true;
try{await plMut(a=>a.filter(p=>p.id!=id));mClose();render();toast('Đã xoá kế hoạch')}catch(e){$('#em').textContent=e.message;b.disabled=false}}
async function plStep(id,j,e){const x=e.clientX,y=e.clientY;let fin=0;
try{await plMut(a=>{const p=a.find(q=>q.id==id);if(!p||!p.st||!p.st[j])return a;p.st=p.st.map((s,k)=>k==j?{...s,x:s.x?0:1}:s);const all=p.st.every(s=>s.x);
if(all&&p.s!='done'){p.s='done';p.dn=iso(today());fin=1}else if(!all&&p.s=='done'){p.s='doing';p.dn=''}return a});render();if(fin){burst(x,y,40);toast('Xong hết các bước, kế hoạch hoàn thành! 🎉')}}catch(er){toast(er.message)}}
async function plDone(id,e){const x=e.clientX,y=e.clientY;let fin=0;
try{await plMut(a=>{const p=a.find(q=>q.id==id);if(!p)return a;if(p.s=='done'){p.s='doing';p.dn=''}else{p.s='done';p.dn=iso(today());fin=1}return a});render();if(fin){burst(x,y,50);toast('Chúc mừng hai bạn! 🎉')}}catch(er){toast(er.message)}}
function monDlg(id){const p=PL.find(x=>x.id==id);if(!p)return;mOpen(`<h3>Gom thêm cho “${E(p.t)}”</h3><p class=mu>Hiện có ${vnd(p.m||0)} trên mục tiêu ${vnd(p.g)}.</p><div class=mw><span class=mcap>Số tiền gom thêm (đ)</span><input id=pa class=mny inputmode=numeric placeholder="0" autocomplete=off><small class=mh></small></div><p class=er id=em></p><div class=wb><button class=btp data-a=pms data-i="${id}">Cộng vào quỹ</button><button class=bt data-a=mc>Huỷ</button></div>`);$('#pa').focus()}
async function monSave(b,id){const n=+($('#pa').value.replace(/\D/g,''))||0;if(!n)return $('#em').textContent='Hãy nhập số tiền';b.disabled=true;
try{await plMut(a=>{const p=a.find(q=>q.id==id);if(p)p.m=(p.m||0)+n;return a});mClose();render();toast('Đã cộng vào quỹ');burst(innerWidth/2,innerHeight/2,24)}catch(e){$('#em').textContent=e.message;b.disabled=false}}
const ACTP={pln:()=>plDlg(),ped:(k,i)=>plDlg(i),pls:(k,i,b)=>plSubmit(b,i),pld:(k,i,b)=>plDel(b,i),
ple:(k,i,b)=>{b.closest('.pc').classList.toggle('open');PX.has(i)?PX.delete(i):PX.add(i)},
pst:(k,i,b,e)=>plStep(i,+b.dataset.j,e),pdn:(k,i,b,e)=>plDone(i,e),pmn:(k,i)=>monDlg(i),pms:(k,i,b)=>monSave(b,i),
pfc:(k,i)=>{PF.c=i;render()},pfs:(k,i)=>{PF.s=i;render()},pq:(k,i)=>plDlg('',TPL[+i])};

// Ô nhập tiền: tự thêm dấu chấm ngăn cách hàng nghìn khi gõ (giữ nguyên vị trí con trỏ) và hiện số đọc gọn, vd "= 3 tỷ"
function fmtMoney(el){const pos=el.selectionStart==null?el.value.length:el.selectionStart,right=el.value.slice(pos).replace(/\D/g,'').length,
d=el.value.replace(/\D/g,'').replace(/^0+(?=\d)/,'').slice(0,13),f=d.replace(/\B(?=(\d{3})+(?!\d))/g,'.');el.value=f;
let p=f.length,c=0;while(p>0&&c<right){p--;if(f[p]!='.')c++}try{el.setSelectionRange(p,p)}catch(e){}moneyHint(el)}
function moneyHint(el){const n=+(el.value.replace(/\D/g,''))||0,h=el.parentNode&&el.parentNode.querySelector('.mh');if(h)h.textContent=n>=1e6?'= '+vnd(n):''}
document.addEventListener('input',e=>{const t=e.target;if(t.classList&&t.classList.contains('mny'))fmtMoney(t)});
