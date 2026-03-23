/* =====================================================
   SPU LunchMate — main.js
   ===================================================== */

const DEMO_USERS = {
  '68082679': { pass:'1234', name:'ชาคริต พละสุ', avatar:'👨‍💻' },
  '68050906': { pass:'1234', name:'ชนาเมธ แก้วทนง', avatar:'👨‍🎨' },
  '68107377': { pass:'1234', name:'พรรวินท์ ศรีพิพัฒน์', avatar:'👩‍💻' },
  '67135288': { pass:'1234', name:'ณัฐฐิตา พงษ์ไทย', avatar:'👩‍🔬' },
};

const state = {
  page:'login', feedFilter:'ทั้งหมด',
  searchMeal:'', searchFood:'',
  selectedFood:'', myJoined:[], myName:'นักศึกษา SPU', myAvatar:'🎓',
  posts:[], loggedIn:false,
};
const EMOJIS=['🎓','😊','🙂','😄','🤩','😎','🥳','🤗','😁','🧑‍🎓'];

/* ── PERSIST ─────────────────────────────────────── */
function loadState(){
  try{
    const s=JSON.parse(localStorage.getItem('spu_lm')||'null');
    if(s){ state.myJoined=s.myJoined||[]; state.myName=s.myName||'นักศึกษา SPU'; state.myAvatar=s.myAvatar||'🎓'; state.posts=s.posts||[]; state.loggedIn=s.loggedIn||false; }
  }catch(e){}
  if(!state.posts.length) seed();
}
function save(){
  localStorage.setItem('spu_lm',JSON.stringify({myJoined:state.myJoined,myName:state.myName,myAvatar:state.myAvatar,posts:state.posts,loggedIn:state.loggedIn}));
}
function seed(){
  state.posts=[
    {id:1001,name:'มิน IT67',avatar:'👦',restaurant:'ก๋วยเตี๋ยวเจ๊หน่าย (หน้า SPU)',foodEmoji:'🍜',area:'ใกล้ตึก IT',meal:'กลางวัน',time:'12:00',slots:4,joined:1,members:['มิน'],note:'อยากกินก๋วยเตี๋ยวเนื้อแห้งรสเด็ด ใครอยากไปด้วยทักมาเลย ไม่กัดไม่ว่าเด็กไม่มา!',createdAt:Date.now()-1000*60*22,comments:[{av:'👧',name:'ฝ้าย BBA',text:'ไปด้วยยย!! รอก่อนนะ 5 นาที 🏃'}]},
    {id:1002,name:'ฟ้า BUS65',avatar:'👩',restaurant:'MK Suki (ฟิวเจอร์พาร์ค)',foodEmoji:'🥘',area:'ใกล้หอ SPU',meal:'กลางวัน',time:'12:30',slots:5,joined:3,members:['ฟ้า','เก่ง','มุก'],note:'หารค่าอาหารด้วยกัน ประมาณคนละ 150-200 บาท ไปด้วยกันได้เลย',createdAt:Date.now()-1000*60*50,comments:[{av:'🧑',name:'เก่ง CS67',text:'ไปด้วยคราบ ช่วยจองโต๊ะด้วยนะ'},{av:'👩‍🦱',name:'มุก ENG',text:'ขอไปด้วย!! 🥰'}]},
    {id:1003,name:'บอล ARC66',avatar:'🧑',restaurant:'ชาบูชิ Central Ladprao',foodEmoji:'🫕',area:'BTS ลาดพร้าว',meal:'เย็น',time:'17:00',slots:4,joined:1,members:['บอล'],note:'ไปกินหลังเลิกเรียน เดินทางด้วยกันได้เลย',createdAt:Date.now()-1000*60*9,comments:[]},
    {id:1004,name:'เจน NUR67',avatar:'👩',restaurant:'After You Dessert Café สยาม',foodEmoji:'☕',area:'สยาม พารากอน',meal:'เย็น',time:'18:30',slots:3,joined:2,members:['เจน','แนน'],note:'ไปกินชิบุย Honey Toast แล้วถ่ายรูปสวยๆ ใครอยู่แถวสยามบ้าง?',createdAt:Date.now()-1000*60*60*2,comments:[{av:'🧑‍🦱',name:'แนน LAW',text:'ไปด้วย!! นัดกันที่ BTS สยาม ประตู 4'}]},
    {id:1005,name:'ก้อง MED66',avatar:'👨',restaurant:'โจ๊กพระอาทิตย์ (เปิดเช้า)',foodEmoji:'🍚',area:'หน้าประตู SPU',meal:'เช้า',time:'07:30',slots:3,joined:1,members:['ก้อง'],note:'ตื่นเช้าอยากกินโจ๊กร้อนๆ ถูกมาก คนละไม่เกิน 60 บาท',createdAt:Date.now()-1000*60*60*5,comments:[]},
  ];
  save();
}

/* ── TIME ─────────────────────────────────────────── */
function ago(ts){
  const d=Math.floor((Date.now()-ts)/1000);
  if(d<60) return 'เมื่อกี้';
  if(d<3600) return `${Math.floor(d/60)} นาทีที่แล้ว`;
  if(d<86400) return `${Math.floor(d/3600)} ชม.ที่แล้ว`;
  return `${Math.floor(d/86400)} วันที่แล้ว`;
}

/* ── ROUTER ───────────────────────────────────────── */
function goTo(page){
  // Guard: must login first before accessing main pages
  if(!state.loggedIn && page !== 'login' && page !== 'members'){
    toast('⚠️ กรุณาเข้าสู่ระบบก่อนใช้งาน');
    page = 'login';
  }
  state.page=page;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(n=>n.classList.toggle('active',n.dataset.page===page));
  window.scrollTo({top:0,behavior:'smooth'});
  if(page==='feed')    renderFeed();
  if(page==='search')  renderSearch();
  if(page==='profile') renderProfile();
}

/* ── CARD ─────────────────────────────────────────── */
function cardHTML(p,idx){
  const pct=Math.round(p.joined/p.slots*100);
  const full=p.joined>=p.slots;
  const iJ=state.myJoined.includes(p.id);
  const btnTxt=full&&!iJ?'😢 เต็มแล้ว':iJ?'✅ เข้าร่วมแล้ว':'เข้าร่วม';
  const btnCls=full&&!iJ?'btn-join full':iJ?'btn-join joined':'btn-join';
  const dis=(full&&!iJ)||iJ?'disabled':'';
  const delay=(idx*0.05).toFixed(2);
  const cmts=p.comments.map(c=>`
    <div class="cmt-item">
      <span class="cmt-av">${c.av}</span>
      <div class="cmt-bub"><div class="cmt-name">${c.name}</div>${c.text}</div>
    </div>`).join('');
  return `
  <div class="post-card" style="animation-delay:${delay}s">
    <div class="card-head">
      <div class="avatar">${p.avatar}</div>
      <div class="card-meta">
        <div class="card-name">${p.name}</div>
        <div class="card-time">${ago(p.createdAt)}</div>
      </div>
    </div>
    <div class="card-rest-pill">
      <span style="font-size:1.1rem">${p.foodEmoji}</span>
      <span class="card-rest-name">${p.restaurant}</span>
    </div>
    <div class="card-body">
      <div class="card-note">${p.note}</div>
      <div class="card-tags">
        <span class="ctag ctag-time">🕐 ${p.time} น.</span>
        <span class="ctag ctag-slot">👥 ${p.joined}/${p.slots} คน</span>
        <span class="ctag ctag-meal">${p.meal}</span>
        ${p.area?`<span class="ctag ctag-area">📍 ${p.area}</span>`:''}
      </div>
    </div>
    <div class="card-foot">
      <div class="slot-track"><div class="slot-fill" style="width:${pct}%"></div></div>
      <div class="slot-txt">${p.slots-p.joined} ที่ว่าง</div>
      <button class="${btnCls}" onclick="joinPost(${p.id})" ${dis}>${btnTxt}</button>
    </div>
    <div class="card-cmts">
      <div class="cmt-list" id="clist-${p.id}">${cmts}</div>
      <div class="cmt-row">
        <input class="cmt-inp" id="cinp-${p.id}" placeholder="แสดงความคิดเห็น..."
          onkeydown="if(event.key==='Enter')sendComment(${p.id})"/>
        <button class="btn-send" onclick="sendComment(${p.id})">➤</button>
      </div>
    </div>
  </div>`;
}

/* ── FEED ─────────────────────────────────────────── */
function renderFeed(){
  let list=[...state.posts];
  if(state.feedFilter!=='ทั้งหมด') list=list.filter(p=>p.meal===state.feedFilter);
  list=list.slice().reverse();
  const totalJ=state.posts.reduce((a,p)=>a+p.joined,0);
  const open=state.posts.filter(p=>p.joined<p.slots).length;
  ['stat-posts','stat-people','stat-open'].forEach((id,i)=>{
    const el=document.getElementById(id); if(el) el.textContent=[state.posts.length,totalJ,open][i];
  });
  document.getElementById('feed-count').textContent=list.length+' โพสต์';
  // sidebar
  const sEl=document.getElementById('sb-posts'); if(sEl) sEl.textContent=state.posts.length;
  const sEl2=document.getElementById('sb-people'); if(sEl2) sEl2.textContent=totalJ;
  const sEl3=document.getElementById('sb-open'); if(sEl3) sEl3.textContent=open;
  const sEl4=document.getElementById('sb-joined'); if(sEl4) sEl4.textContent=state.myJoined.length;
  // trending
  const tEl=document.getElementById('trend-list');
  if(tEl){
    const rMap={};
    state.posts.forEach(p=>{rMap[p.restaurant]=(rMap[p.restaurant]||0)+p.joined;});
    const sorted=Object.entries(rMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const icons=['🍜','🥘','🫕','☕','🍱'];
    tEl.innerHTML=sorted.map((r,i)=>`
      <div class="trend-item">
        <span class="trend-rank">${i+1}</span>
        <div class="trend-info">
          <div class="trend-name">${r[0]}</div>
          <div class="trend-cnt">${r[1]} คนสนใจ</div>
        </div>
        <span class="trend-icon">${icons[i%icons.length]}</span>
      </div>`).join('');
  }
  const con=document.getElementById('feed-list');
  if(!list.length){
    con.innerHTML=`<div class="empty"><div class="empty-em">🍽️</div><div class="empty-t">ยังไม่มีโพสต์ในมื้อนี้</div><p>เป็นคนแรกที่ชวนเพื่อน!</p></div>`;
    return;
  }
  con.innerHTML=list.map((p,i)=>cardHTML(p,i)).join('');
}
function setFeedFilter(f){
  state.feedFilter=f;
  document.querySelectorAll('#page-feed .ftab').forEach(c=>c.classList.toggle('active',c.dataset.f===f));
  renderFeed();
}

/* ── SEARCH ───────────────────────────────────────── */
function renderSearch(){
  const q=(document.getElementById('search-box-el')?.value||'').toLowerCase().trim();
  const meal=state.searchMeal, food=state.searchFood;
  let list=[...state.posts].reverse().filter(p=>{
    const mQ=!q||p.restaurant.toLowerCase().includes(q)||p.note.toLowerCase().includes(q)||(p.area||'').toLowerCase().includes(q);
    return mQ&&(!meal||p.meal===meal)&&(!food||p.foodEmoji===food);
  });
  const cEl=document.getElementById('search-count'); if(cEl) cEl.textContent=`พบ ${list.length} โพสต์`;
  const con=document.getElementById('search-results');
  if(!list.length){
    con.innerHTML=`<div class="empty"><div class="empty-em">🔍</div><div class="empty-t">ไม่พบโพสต์ที่ตรงกัน</div><p>ลองเปลี่ยนคำค้นหา</p></div>`;
    return;
  }
  con.innerHTML=list.map((p,i)=>cardHTML(p,i)).join('');
}
function toggleMealF(m,el){
  state.searchMeal=state.searchMeal===m?'':m;
  document.querySelectorAll('.meal-fp').forEach(c=>c.classList.remove('sel'));
  if(state.searchMeal) el.classList.add('sel');
  renderSearch();
}
function toggleFoodF(f,el){
  state.searchFood=state.searchFood===f?'':f;
  document.querySelectorAll('.food-fp').forEach(c=>c.classList.remove('sel'));
  if(state.searchFood) el.classList.add('sel');
  renderSearch();
}

/* ── JOIN ─────────────────────────────────────────── */
function joinPost(id){
  const p=state.posts.find(x=>x.id===id);
  if(!p||p.joined>=p.slots||state.myJoined.includes(id)) return;
  p.joined++; p.members.push(state.myName); state.myJoined.push(id);
  save(); renderCurrent();
  toast(`✅ เข้าร่วมสำเร็จ! เจอกันตอน ${p.time} น. นะ`,'green');
}

/* ── COMMENT ──────────────────────────────────────── */
function sendComment(id){
  const inp=document.getElementById('cinp-'+id);
  const txt=inp?.value.trim(); if(!txt) return;
  const p=state.posts.find(x=>x.id===id); if(!p) return;
  const c={av:state.myAvatar,name:state.myName,text:txt};
  p.comments.push(c); inp.value=''; save();
  const list=document.getElementById('clist-'+id);
  if(list){
    const div=document.createElement('div'); div.className='cmt-item'; div.style.animation='cardIn .3s ease';
    div.innerHTML=`<span class="cmt-av">${c.av}</span><div class="cmt-bub"><div class="cmt-name">${c.name}</div>${c.text}</div>`;
    list.appendChild(div);
  }
}

/* ── POST FORM ────────────────────────────────────── */
function selFood(emoji,el){
  state.selectedFood=emoji;
  document.querySelectorAll('.food-opt').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel');
}
function submitPost(){
  const restaurant=document.getElementById('f-restaurant')?.value.trim();
  const time=document.getElementById('f-time')?.value;
  const slots=parseInt(document.getElementById('f-slots')?.value||'4');
  const meal=document.getElementById('f-meal')?.value;
  const area=document.getElementById('f-area')?.value.trim();
  const note=document.getElementById('f-note')?.value.trim();
  if(!restaurant||!time){toast('⚠️ กรุณากรอกชื่อร้านและเวลา');return;}
  const np={id:Date.now(),name:state.myName,avatar:state.myAvatar,restaurant,foodEmoji:state.selectedFood||'🍽️',area:area||'',meal:meal||'กลางวัน',time,slots,joined:1,members:[state.myName],note:note||'ไม่มีรายละเอียดเพิ่มเติม',createdAt:Date.now(),comments:[]};
  state.posts.push(np); state.myJoined.push(np.id); save();
  ['f-restaurant','f-time','f-note','f-area'].forEach(id=>{const el=document.getElementById(id);if(el) el.value='';});
  state.selectedFood=''; document.querySelectorAll('.food-opt').forEach(b=>b.classList.remove('sel'));
  goTo('feed'); toast('🎉 โพสต์สำเร็จ! รอเพื่อนมาร่วมกันนะ','green');
}

/* ── PROFILE ──────────────────────────────────────── */
function renderProfile(){
  document.getElementById('prof-av').textContent=state.myAvatar;
  document.getElementById('prof-nm').textContent=state.myName;
  document.getElementById('prof-nm-inp').value=state.myName;
  const myPosts=state.posts.filter(p=>state.myJoined.includes(p.id));
  const myCreated=state.posts.filter(p=>p.members[0]===state.myName);
  document.getElementById('ps1').textContent=state.myJoined.length;
  document.getElementById('ps2').textContent=myCreated.length;
  document.getElementById('ps3').textContent=myPosts.reduce((a,p)=>a+p.joined,0);
  const lEl=document.getElementById('my-post-list');
  if(!myPosts.length){lEl.innerHTML=`<div class="empty"><div class="empty-em">🍽️</div><div class="empty-t">ยังไม่ได้เข้าร่วมโพสต์ไหนเลย</div></div>`;return;}
  lEl.innerHTML=[...myPosts].reverse().map(p=>`
    <div class="my-card">
      <div class="my-card-r">${p.foodEmoji} ${p.restaurant}</div>
      <div class="my-card-meta">
        <span>🕐 ${p.time} น.</span><span>👥 ${p.joined}/${p.slots}</span>
        <span>${p.meal}</span>${p.area?`<span>📍 ${p.area}</span>`:''}
      </div>
    </div>`).join('');
}
function changeAvatar(){
  state.myAvatar=EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
  save(); renderProfile(); toast('🎭 เปลี่ยน avatar แล้ว!');
}
function saveName(){
  const n=document.getElementById('prof-nm-inp')?.value.trim();
  if(!n){toast('⚠️ กรุณากรอกชื่อด้วย');return;}
  state.myName=n; save(); renderProfile(); toast('✅ บันทึกชื่อเรียบร้อย!','green');
}

/* ── LOGIN ────────────────────────────────────────── */
function doLogin(){
  const sid = document.getElementById('login-sid')?.value.trim();
  const pass = document.getElementById('login-pass')?.value;
  const errEl = document.getElementById('login-err');
  errEl.style.display = 'none';

  if(!sid || !pass){
    errEl.textContent = '⚠️ กรุณากรอกรหัสนักศึกษาและรหัสผ่าน';
    errEl.style.display = 'block'; return;
  }
  const user = DEMO_USERS[sid];
  if(!user || user.pass !== pass){
    errEl.textContent = '❌ รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง';
    errEl.style.display = 'block'; return;
  }
  state.loggedIn = true;
  state.myName = user.name;
  state.myAvatar = user.avatar;
  save();
  updateLoginUI();
  goTo('feed');
  toast(`🎉 ยินดีต้อนรับ ${user.name}!`, 'green');
}
function doGuest(){
  state.loggedIn = true;
  state.myName = 'นักศึกษา SPU';
  state.myAvatar = '🎓';
  save();
  updateLoginUI();
  goTo('feed');
  toast('👤 เข้าใช้แบบผู้เยี่ยมชม', 'green');
}
function doLogout(){
  state.loggedIn = false;
  state.myName = 'นักศึกษา SPU';
  state.myAvatar = '🎓';
  state.myJoined = [];
  save();
  updateLoginUI();
  goTo('login');
  toast('👋 ออกจากระบบแล้ว');
}
function updateLoginUI(){
  const btn = document.getElementById('nav-login-btn');
  const lbl = document.getElementById('nav-login-lbl');
  if(!btn) return;
  if(state.loggedIn){
    btn.innerHTML = `<span>👋</span><span id="nav-login-lbl">ออกจากระบบ</span>`;
    btn.classList.add('logged');
    btn.onclick = doLogout;
  } else {
    btn.innerHTML = `<span>🔑</span><span id="nav-login-lbl">เข้าสู่ระบบ</span>`;
    btn.classList.remove('logged');
    btn.onclick = ()=>goTo('login');
  }
}
function togglePass(){
  const inp = document.getElementById('login-pass');
  if(!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

/* ── TOAST / UTILS ────────────────────────────────── */
function toast(msg,type=''){
  const el=document.getElementById('toast');
  el.textContent=msg; el.className='toast'+(type?' '+type:'');
  el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),3000);
}
function renderCurrent(){
  if(state.page==='feed') renderFeed();
  if(state.page==='search') renderSearch();
  if(state.page==='profile') renderProfile();
}

document.addEventListener('DOMContentLoaded',()=>{
  loadState();
  updateLoginUI();
  if(state.loggedIn){
    goTo('feed');
  } else {
    goTo('login');
  }
  document.getElementById('search-box-el')?.addEventListener('input',renderSearch);
});
