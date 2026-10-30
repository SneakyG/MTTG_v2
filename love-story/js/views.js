// Các màn hình: Trang chủ, Kỷ niệm, Hành trình
const lst=l=>R.push(l)-1,cell=(x,l,i)=>`<div class="ce${x.v?' v':''}" data-a=lb data-l=${l} data-i=${i}><img loading=lazy src="${U(x.id,400)}" alt=""></div>`,V={};
V.home=()=>{const t=today(),cs=X.stages[CFG.current-1]||X.stages[0],s=D(cs.st||iso(t)),[y,m,d]=ymd(s,t),np=X.items.filter(x=>!x.v).length,
od=X.items.filter(x=>+x.d.slice(5,7)==t.getMonth()+1&&+x.d.slice(8)==t.getDate()&&+x.d.slice(0,4)<t.getFullYear()).slice(0,6),lo=od.length?lst(od):0;
return `<div class=avs>${[[AV.a,CFG.a],[AV.b,CFG.b]].map(([id,n])=>id?`<img class=av src="${U(id,200)}" alt="${E(n)}">`:`<span class=av>${E(n[0])}</span>`).join('')}</div><h1>${E(CFG.a)} và ${E(CFG.b)}</h1><div class=mu>${cs.v}</div><div class=days><b>${dd(s,t)}</b> ngày</div><small>Từ ${s.toLocaleDateString('vi-VN')}: ${y} năm ${m} tháng ${d} ngày, thêm <span id=hms>00:00:00</span></small>
<div class=rd>${X.stages.map(g=>`<div class="nd ${g.n<CFG.current?'done':g.n==CFG.current?'cur':'next'}" data-a=sf data-i=${g.n}><i>${g.e}</i>${E(g.l)}</div>`).join('')}</div>
${od.length?`<h2>Ngày này năm xưa</h2><div class=mm>${od.map((x,i)=>cell(x,lo,i)).join('')}</div>`:''}
<h2>Sắp tới</h2>${ups(s,cs).map(u=>`<div class=row><div><b>${E(u.n)}</b><br><small>${u.d.toLocaleDateString('vi-VN')}</small></div><b class=rs>${u.k?'còn '+u.k+' ngày':'Hôm nay'}</b></div>`).join('')}
<h2>Kho kỷ niệm</h2><p>${np} ảnh, ${X.items.length-np} clip, ${new Set(X.items.map(x=>x.d)).size} ngày đáng nhớ.</p>
<p><small>Muốn thêm kỷ niệm: tải ảnh hoặc clip vào thư mục giai đoạn, trong images hoặc videos, đặt tên yyyyMMdd (vd 20240214.jpg), rồi bấm Cập nhật.</small></p>
<button class=bt data-a=dr>Mở thư mục Drive</button><button class=bt data-a=rf>Cập nhật</button>`};
V.mem=()=>{const L=X.items.filter(x=>(!F.s||x.s==F.s)&&(!F.t||(F.t=='v')==!!x.v)),G={},l=lst(L),s0=D(X.stages[CFG.current-1].st||iso(today()));
L.forEach(x=>(G[x.d]??=[]).push(x));let h='',mo='',i=0;
for(const d of Object.keys(G).sort().reverse()){const g=G[d],n=dd(s0,D(d)),st=X.stages[g[0].s-1],cap=[...new Set(g.map(x=>x.c).filter(Boolean))].join(', '),
meta=[n>=0?'ngày thứ '+n:'',st?st.e+' '+st.l:''].filter(Boolean).join(', ');
if(d.slice(0,7)!=mo){mo=d.slice(0,7);h+=`<h4>Tháng ${+d.slice(5,7)}/${d.slice(0,4)}</h4>`}
h+=`<div class=m><div class=row style="border:0;padding:0"><b>${fmt(d)}</b><small>${meta}</small></div>${cap?`<div>${E(cap)}</div>`:''}<div class="mm${g.length==1?' o':''}">${g.map(x=>cell(x,l,i++)).join('')}</div></div>`}
return `<h2>Kỷ niệm</h2><div>${[[0,'Tất cả giai đoạn'],...X.stages.map(g=>[g.n,g.e+' '+g.l])].map(([n,t])=>`<button class="ch${F.s==n?' on':''}" data-a=fs data-i=${n}>${E(t)}</button>`).join('')}</div><div>${[['','Ảnh và clip'],['i','Ảnh'],['v','Clip']].map(([k,t])=>`<button class="ch${F.t==k?' on':''}" data-a=ft data-i="${k}">${t}</button>`).join('')}</div>${h||'<p class=mu>Chưa có kỷ niệm nào ở đây.</p>'}`};
V.road=()=>`<h2>Con đường của mình</h2>${X.stages.map(g=>{const k=g.n<CFG.current?'done':g.n==CFG.current?'cur':'next',nx=X.stages[g.n],en=k=='cur'?iso(today()):(nx&&nx.st)||g.last,th=X.items.filter(x=>x.s==g.n&&!x.v).slice(0,4),l=lst(th),
rg=k=='next'?'Chặng đường phía trước':g.st?`Từ ${fmt(g.st)} đến ${k=='cur'?'nay':en?fmt(en):'…'}, ${en?dd(D(g.st),D(en)):0} ngày`:'Chưa có ảnh hay clip';
return `<div class="sc ${k}"><i>${g.e}</i><div><b class=fr>${g.n}. ${E(g.l)}</b>${k=='cur'?' <small>đang ở đây</small>':''}<br><small>${rg}</small><br><small>${g.np} ảnh, ${g.nv} clip</small>${th.length?`<div class=mm style="margin:8px 0">${th.map((x,i)=>cell(x,l,i)).join('')}</div>`:''}${g.np+g.nv?`<button class=bt data-a=sf data-i=${g.n}>Xem kỷ niệm</button>`:''}</div></div>`}).join('')}`;

