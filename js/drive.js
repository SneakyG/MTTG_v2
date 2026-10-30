// Đọc cây thư mục Google Drive (Drive API v3) và dựng dữ liệu kỷ niệm
async function ls(q,f){let o=[],t='';do{const r=await fetch(`${API}?q=${encodeURIComponent(q)}&fields=nextPageToken,files(${f})&pageSize=1000&key=${CFG.key}${t?'&pageToken='+t:''}`),j=await r.json();if(!r.ok)throw Error(j.error?.message||r.status);o=o.concat(j.files);t=j.nextPageToken}while(t);return o}
const par=a=>'('+a.map(i=>`'${i}' in parents`).join(' or ')+')';
function build(sf,it){X.items=it;const N=Math.max(DEF.length,...sf.map(f=>f.n));
X.stages=[...Array(N)].map((_,i)=>{const n=i+1,f=sf.find(x=>x.n==n),sl=f?f.slug:DEF[i],m=ST[sl]||[(sl||'Giai đoạn '+n).replace(/_/g,' '),'💞','đã bên nhau'],a=it.filter(x=>x.s==n),ds=a.map(x=>x.d).sort();
return{n,l:m[0],e:m[1],v:m[2],st:CFG.start[n]||ds[0]||'',last:ds[ds.length-1]||'',np:a.filter(x=>!x.v).length,nv:a.filter(x=>x.v).length}})}
async function load(){
const all=await ls(`'${CFG.root}' in parents`+FO,'id,name'),av=all.filter(f=>/ava/i.test(f.name)),
pa=av.length?ls(par(av.map(f=>f.id))+FO,'id').then(x=>ls(par([...av,...x].map(f=>f.id))+" and mimeType contains 'image/' and trashed=false",'id,name')).catch(()=>[]):Promise.resolve([]),
sf=all.filter(f=>!/ava/i.test(f.name)).map(f=>{const m=/^(\d+)_(.+)$/.exec(f.name);return m&&{id:f.id,n:+m[1],slug:m[2]}}).filter(Boolean),
mf=sf.length?await ls(par(sf.map(f=>f.id))+FO,'id,parents'):[],by={};
mf.forEach(f=>by[f.id]=sf.find(s=>s.id==f.parents[0]).n);
const fl=mf.length?await ls(par(mf.map(f=>f.id))+" and mimeType!='application/vnd.google-apps.folder' and trashed=false",'id,name,mimeType,parents'):[],it=[];
fl.forEach(f=>{const m=/^(\d{4})(\d{2})(\d{2})(.*?)(\.[^.]*)?$/.exec(f.name);if(!m||+m[2]<1||+m[2]>12||+m[3]<1||+m[3]>31)return;const c=m[4].replace(/^[\s_-]+/,'');
it.push({id:f.id,d:`${m[1]}-${m[2]}-${m[3]}`,s:by[f.parents[0]],v:f.mimeType.startsWith('video/')?1:0,c:/\p{L}/u.test(c)?c:''})});
it.sort((a,b)=>b.d.localeCompare(a.d));build(sf,it);
const pics=(await pa).sort((x,y)=>x.name.localeCompare(y.name)),bn=f=>f.name.replace(/\.[^.]*$/,'').toLowerCase(),pk=(n,i)=>(pics.find(f=>bn(f)==n.toLowerCase())||pics[i])?.id;
AV={a:pk(CFG.a,0),b:pk(CFG.b,1)};try{localStorage.mttg=JSON.stringify({sf,it,AV})}catch(e){}}
try{const c=JSON.parse(localStorage.mttg||'null');if(c){build(c.sf,c.it);AV=c.AV||{}}}catch(e){}

