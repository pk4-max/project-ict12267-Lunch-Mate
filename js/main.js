/* =====================================================
   LUNCHMATE — main.js  (Desktop SPA, top navbar)
   ===================================================== */

/* ── STATE ─────────────────────────────────────────── */
const state = {
  page: 'feed',
  feedFilter: 'ทั้งหมด',
  searchMeal: '',
  searchFood: '',
  selectedFood: '',
  myJoined: [],
  myName: 'ผู้ใช้',
  myAvatar: '😊',
  posts: [],
};

const EMOJIS = ['😊','🙂','😄','🤩','😎','🥳','🤗','😁','🧑‍🍳','👨‍🍳'];

/* ── LOAD / SAVE ────────────────────────────────────── */
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem('lm2_state') || 'null');
    if (s) {
      state.myJoined = s.myJoined || [];
      state.myName   = s.myName   || 'ผู้ใช้';
      state.myAvatar = s.myAvatar || '😊';
      state.posts    = s.posts    || [];
    }
  } catch(e) {}

  if (!state.posts.length) seedPosts();
}

function saveState() {
  localStorage.setItem('lm2_state', JSON.stringify({
    myJoined: state.myJoined,
    myName:   state.myName,
    myAvatar: state.myAvatar,
    posts:    state.posts,
  }));
}

function seedPosts() {
  state.posts = [
    {
      id:1001, name:'มิน สุดหล่อ', avatar:'👦',
      restaurant:'ก๋วยเตี๋ยวเจ๊หน่าย', foodEmoji:'🍜',
      area:'ใกล้ตึก A', meal:'กลางวัน', time:'12:00',
      slots:4, joined:1, members:['มิน สุดหล่อ'],
      note:'อยากกินก๋วยเตี๋ยวเนื้อแห้งรสเด็ด ใครอยากไปด้วยทักมาเลย ไม่กัดไม่ว่าเด็กไม่มา!',
      createdAt: Date.now()-1000*60*22,
      comments:[{ av:'👧', name:'ฝ้าย', text:'ไปด้วยยย!! รอก่อนนะ 5 นาที 🏃' }]
    },
    {
      id:1002, name:'ฟ้า อิอิ', avatar:'👩',
      restaurant:'MK Suki สาขา SPU', foodEmoji:'🥘',
      area:'หน้ามหาวิทยาลัย', meal:'กลางวัน', time:'12:30',
      slots:5, joined:3, members:['ฟ้า','เก่ง','มุก'],
      note:'หารค่าอาหารด้วยกัน ประมาณคนละ 150-200 บาท ไปด้วยกันได้เลย',
      createdAt: Date.now()-1000*60*50,
      comments:[
        { av:'🧑', name:'เก่ง', text:'ไปด้วยคราบ ช่วยจองโต๊ะด้วยนะ' },
        { av:'👩‍🦱', name:'มุก', text:'ขอไปด้วย!! 🥰' }
      ]
    },
    {
      id:1003, name:'บอล นักกิน', avatar:'🧑',
      restaurant:'ชาบูชิ Central Ladprao', foodEmoji:'🫕',
      area:'BTS ลาดพร้าว', meal:'เย็น', time:'17:00',
      slots:4, joined:1, members:['บอล นักกิน'],
      note:'ไปกินหลังเลิกเรียน เดินทางด้วยกันได้เลย นั่งรถไฟฟ้าสาย BTS ไปด้วยกัน',
      createdAt: Date.now()-1000*60*9,
      comments:[]
    },
    {
      id:1004, name:'เจน มนุษย์ทำงาน', avatar:'👩',
      restaurant:'After You Dessert Café', foodEmoji:'☕',
      area:'สยาม', meal:'เย็น', time:'18:30',
      slots:3, joined:2, members:['เจน','แนน'],
      note:'ไปกินชิบุย Shibuya Honey Toast แล้วถ่ายรูปสวยๆ ใครอยู่แถวสยามบ้าง?',
      createdAt: Date.now()-1000*60*60*2,
      comments:[{ av:'🧑‍🦱', name:'แนน', text:'ไปด้วย!! นัดกันที่ BTS สยาม ประตู 4' }]
    },
    {
      id:1005, name:'ก้อง เช้าชาม', avatar:'👨',
      restaurant:'โจ๊กพระอาทิตย์', foodEmoji:'🍚',
      area:'ใกล้หอพัก', meal:'เช้า', time:'07:30',
      slots:3, joined:1, members:['ก้อง'],
      note:'ตื่นเช้าอยากกินโจ๊กร้อนๆ ใครตื่นเช้าบ้างมากินด้วยกัน ถูกมากคนละไม่เกิน 60 บาท',
      createdAt: Date.now()-1000*60*60*5,
      comments:[]
    },
  ];
  saveState();
}

/* ── TIME AGO ───────────────────────────────────────── */
function ago(ts) {
  const d = Math.floor((Date.now()-ts)/1000);
  if (d<60)    return 'เมื่อกี้';
  if (d<3600)  return `${Math.floor(d/60)} นาทีที่แล้ว`;
  if (d<86400) return `${Math.floor(d/3600)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(d/86400)} วันที่แล้ว`;
}

/* ── ROUTER ─────────────────────────────────────────── */
function goTo(page) {
  state.page = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });
  window.scrollTo({ top:0, behavior:'smooth' });

  if (page==='feed')    renderFeed();
  if (page==='search')  renderSearch();
  if (page==='profile') renderProfile();
}

/* ── CARD HTML ──────────────────────────────────────── */
function cardHTML(p, idx) {
  const pct   = Math.round(p.joined/p.slots*100);
  const full  = p.joined>=p.slots;
  const iJoin = state.myJoined.includes(p.id);
  const btnTxt= full&&!iJoin?'😢 เต็มแล้ว' : iJoin?'✅ เข้าร่วมแล้ว':'🍽️ เข้าร่วม';
  const btnCls= full&&!iJoin?'btn-join full' : iJoin?'btn-join joined':'btn-join';
  const dis   = (full&&!iJoin)||iJoin?'disabled':'';
  const delay = (idx*0.055).toFixed(2);

  const cmts = p.comments.map(c=>`
    <div class="comment-item">
      <span class="c-av">${c.av}</span>
      <div class="c-bubble"><div class="c-name">${c.name}</div>${c.text}</div>
    </div>`).join('');

  return `
  <div class="post-card" style="animation-delay:${delay}s">
    <div class="card-top">
      <div class="avatar">${p.avatar}</div>
      <div class="card-meta">
        <div class="card-name">${p.name}</div>
        <div class="card-time">${ago(p.createdAt)}</div>
      </div>
    </div>
    <div class="card-body">
      <div class="card-rest">${p.foodEmoji} ${p.restaurant}</div>
      <div class="card-note">${p.note}</div>
      <div class="card-tags">
        <span class="tag t-time">🕐 ${p.time} น.</span>
        <span class="tag t-slot">👥 ${p.joined}/${p.slots} คน</span>
        <span class="tag t-food">${p.meal}</span>
        ${p.area?`<span class="tag t-area">📍 ${p.area}</span>`:''}
      </div>
    </div>
    <div class="card-footer">
      <div class="slot-bar"><div class="slot-fill" style="width:${pct}%"></div></div>
      <div class="slot-txt">${p.slots-p.joined} ที่ว่าง</div>
      <button class="${btnCls}" onclick="joinPost(${p.id})" ${dis}>${btnTxt}</button>
    </div>
    <div class="card-comments">
      <div class="comment-list" id="clist-${p.id}">${cmts}</div>
      <div class="comment-row">
        <input class="comment-inp" id="cinp-${p.id}" placeholder="แสดงความคิดเห็น..."
          onkeydown="if(event.key==='Enter')sendComment(${p.id})"/>
        <button class="btn-send" onclick="sendComment(${p.id})">➤</button>
      </div>
    </div>
  </div>`;
}

/* ── FEED ───────────────────────────────────────────── */
function renderFeed() {
  let list = [...state.posts];
  if (state.feedFilter!=='ทั้งหมด') list=list.filter(p=>p.meal===state.feedFilter);
  list=list.slice().reverse();

  const totalJ = state.posts.reduce((a,p)=>a+p.joined,0);
  const open   = state.posts.filter(p=>p.joined<p.slots).length;
  document.getElementById('stat-posts').textContent  = state.posts.length;
  document.getElementById('stat-people').textContent = totalJ;
  document.getElementById('stat-open').textContent   = open;
  document.getElementById('feed-count').textContent  = list.length+' โพสต์';

  // sidebar trending
  const trenEl = document.getElementById('trending-list');
  if (trenEl) {
    const rMap = {};
    state.posts.forEach(p=>{ rMap[p.restaurant]=(rMap[p.restaurant]||0)+p.joined; });
    const sorted = Object.entries(rMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const foods  = ['🍜','🥘','🫕','☕','🍣','🍔','🍱'];
    trenEl.innerHTML = sorted.map((r,i)=>`
      <div class="trending-item">
        <span class="tr-icon">${foods[i%foods.length]}</span>
        <div>
          <div class="tr-name">${r[0]}</div>
          <div class="tr-count">${r[1]} คนสนใจ</div>
        </div>
      </div>`).join('');
  }

  // sidebar stats
  ['sb-posts','sb-people','sb-open'].forEach((id,i)=>{
    const el=document.getElementById(id);
    if(el) el.textContent=[state.posts.length,totalJ,open][i];
  });

  const container = document.getElementById('feed-list');
  if (!list.length) {
    container.innerHTML = `<div class="empty"><div class="empty-em">🍽️</div>
      <div class="empty-t">ยังไม่มีโพสต์ในมื้อนี้</div><p>เป็นคนแรกที่ชวนเพื่อน!</p></div>`;
    return;
  }
  container.innerHTML = list.map((p,i)=>cardHTML(p,i)).join('');
}

function setFeedFilter(f) {
  state.feedFilter = f;
  document.querySelectorAll('#page-feed .chip').forEach(c=>{
    c.classList.toggle('active', c.dataset.f===f);
  });
  renderFeed();
}

/* ── SEARCH ─────────────────────────────────────────── */
function renderSearch() {
  const q    = (document.getElementById('search-inp-el')?.value||'').toLowerCase().trim();
  const meal = state.searchMeal;
  const food = state.searchFood;

  let list = [...state.posts].reverse().filter(p=>{
    const mQ    = !q    || p.restaurant.toLowerCase().includes(q)||p.note.toLowerCase().includes(q)||(p.area||'').toLowerCase().includes(q);
    const mMeal = !meal || p.meal===meal;
    const mFood = !food || p.foodEmoji===food;
    return mQ && mMeal && mFood;
  });

  const countEl = document.getElementById('search-count');
  if (countEl) countEl.textContent = `พบ ${list.length} โพสต์`;

  const container = document.getElementById('search-results');
  if (!list.length) {
    container.innerHTML = `<div class="empty"><div class="empty-em">🔍</div>
      <div class="empty-t">ไม่พบโพสต์ที่ตรงกัน</div><p>ลองเปลี่ยนคำค้นหาหรือ filter</p></div>`;
    return;
  }
  container.innerHTML = list.map((p,i)=>cardHTML(p,i)).join('');
}

function toggleMealFilter(m, el) {
  state.searchMeal = state.searchMeal===m ? '' : m;
  document.querySelectorAll('.meal-fc').forEach(c=>c.classList.remove('sel'));
  if (state.searchMeal) el.classList.add('sel');
  renderSearch();
}
function toggleFoodFilter(f, el) {
  state.searchFood = state.searchFood===f ? '' : f;
  document.querySelectorAll('.food-fc').forEach(c=>c.classList.remove('sel'));
  if (state.searchFood) el.classList.add('sel');
  renderSearch();
}

/* ── JOIN ───────────────────────────────────────────── */
function joinPost(id) {
  const p = state.posts.find(x=>x.id===id);
  if (!p||p.joined>=p.slots||state.myJoined.includes(id)) return;
  p.joined++; p.members.push(state.myName);
  state.myJoined.push(id);
  saveState(); renderCurrentPage();
  toast(`🎉 เข้าร่วมสำเร็จ! เจอกันตอน ${p.time} น.`);
}

/* ── COMMENT ────────────────────────────────────────── */
function sendComment(id) {
  const inp = document.getElementById('cinp-'+id);
  const txt = inp?.value.trim();
  if (!txt) return;
  const p = state.posts.find(x=>x.id===id);
  if (!p) return;
  const c = { av:state.myAvatar, name:state.myName, text:txt };
  p.comments.push(c);
  inp.value = '';
  saveState();
  const list = document.getElementById('clist-'+id);
  if (list) {
    const div = document.createElement('div');
    div.className='comment-item';
    div.style.animation='fadeUp .3s ease';
    div.innerHTML=`<span class="c-av">${c.av}</span>
      <div class="c-bubble"><div class="c-name">${c.name}</div>${c.text}</div>`;
    list.appendChild(div);
  }
}

/* ── POST FORM ──────────────────────────────────────── */
function selectFoodBtn(emoji, el) {
  state.selectedFood = emoji;
  document.querySelectorAll('.food-btn').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel');
}

function submitPost() {
  const restaurant = document.getElementById('f-restaurant')?.value.trim();
  const time       = document.getElementById('f-time')?.value;
  const slots      = parseInt(document.getElementById('f-slots')?.value||'4');
  const meal       = document.getElementById('f-meal')?.value;
  const area       = document.getElementById('f-area')?.value.trim();
  const note       = document.getElementById('f-note')?.value.trim();
  if (!restaurant||!time) { toast('⚠️ กรุณากรอกชื่อร้านและเวลา'); return; }

  const np = {
    id: Date.now(),
    name: state.myName, avatar: state.myAvatar,
    restaurant, foodEmoji: state.selectedFood||'🍽️',
    area: area||'', meal: meal||'กลางวัน',
    time, slots, joined:1, members:[state.myName],
    note: note||'ไม่มีรายละเอียดเพิ่มเติม',
    createdAt: Date.now(), comments:[]
  };

  state.posts.push(np);
  state.myJoined.push(np.id);
  saveState();

  ['f-restaurant','f-time','f-note','f-area'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  state.selectedFood='';
  document.querySelectorAll('.food-btn').forEach(b=>b.classList.remove('sel'));

  goTo('feed');
  toast('✅ โพสต์สำเร็จ! รอเพื่อนมาร่วมกันนะ 🎉');
}

/* ── PROFILE ────────────────────────────────────────── */
function renderProfile() {
  document.getElementById('prof-avatar').textContent = state.myAvatar;
  document.getElementById('prof-name').textContent   = state.myName;
  document.getElementById('prof-name-inp').value     = state.myName;

  const myPosts   = state.posts.filter(p=>state.myJoined.includes(p.id));
  const myCreated = state.posts.filter(p=>p.members[0]===state.myName);

  document.getElementById('prof-s1').textContent = state.myJoined.length;
  document.getElementById('prof-s2').textContent = myCreated.length;
  document.getElementById('prof-s3').textContent = myPosts.reduce((a,p)=>a+p.joined,0);

  const listEl = document.getElementById('my-posts-list');
  if (!myPosts.length) {
    listEl.innerHTML=`<div class="empty"><div class="empty-em">🍽️</div>
      <div class="empty-t">ยังไม่ได้เข้าร่วมโพสต์ไหนเลย</div></div>`;
    return;
  }
  listEl.innerHTML=[...myPosts].reverse().map(p=>`
    <div class="my-post-card">
      <div class="my-post-r">${p.foodEmoji} ${p.restaurant}</div>
      <div class="my-post-meta">
        <span>🕐 ${p.time} น.</span>
        <span>👥 ${p.joined}/${p.slots} คน</span>
        <span>🍽️ ${p.meal}</span>
        ${p.area?`<span>📍 ${p.area}</span>`:''}
      </div>
    </div>`).join('');
}

function changeAvatar() {
  state.myAvatar = EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
  saveState(); renderProfile();
  toast('🎭 เปลี่ยน avatar แล้ว!');
}

function saveName() {
  const n = document.getElementById('prof-name-inp')?.value.trim();
  if (!n) { toast('⚠️ กรุณากรอกชื่อด้วย'); return; }
  state.myName=n; saveState(); renderProfile();
  toast('✅ บันทึกชื่อเรียบร้อย!');
}

/* ── TOAST ──────────────────────────────────────────── */
function toast(msg) {
  const el=document.getElementById('toast');
  el.textContent=msg; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),3000);
}

function renderCurrentPage() {
  if (state.page==='feed')    renderFeed();
  if (state.page==='search')  renderSearch();
  if (state.page==='profile') renderProfile();
}

/* ── INIT ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', ()=>{
  loadState();
  goTo('feed');
  document.getElementById('search-inp-el')?.addEventListener('input', renderSearch);
});
