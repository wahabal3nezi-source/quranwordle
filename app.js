const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const modal=$('#bookingModal');
const STATIC_MODE=location.hostname==='quranwordle.com'||location.hostname==='www.quranwordle.com'||location.hostname.endsWith('.github.io');
const WHATSAPP='96599577468';
let services=[];
const FALLBACK_SERVICES=[
{id:1,kind:'consultation',title_ar:'استشارة أونلاين',description_ar:'استشارة فردية مع د. منى بن علي لمدة 45 دقيقة عبر Zoom، ويتم التواصل عبر واتساب لتأكيد الموعد.',price:0,duration_minutes:45,image:'/assets/consult-date.jpg'},
{id:2,kind:'course',title_ar:'دورة كاريزما الحضور',description_ar:'دورة تفاعلية عبر Zoom لتطوير الحضور والثقة والتواصل المؤثر.',price:20,duration_minutes:120,image:'/assets/course-charisma.jpg'},
{id:3,kind:'urgent',title_ar:'استشارة مستعجلة',description_ar:'استشارة مستعجلة لمدة ساعة عبر Zoom، مع تنسيق الموعد خلال 1 إلى 4 أيام.',price:80,duration_minutes:60,image:'/assets/urgent-consult.jpg'}
];
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function money(v){const n=Number(v||0);return n>0?`${n.toLocaleString('ar-KW',{maximumFractionDigits:3})} د.ك`:'حسب الموعد'}
function kindLabel(k){return ({consultation:'استشارة شخصية',course:'برنامج تدريبي',urgent:'أولوية عاجلة'})[k]||'خدمة'}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function waUrl(text){return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`}
async function loadPublic(){
  if(!STATIC_MODE){
    try{const r=await fetch('/api/public',{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error();services=d.services||[];renderServices();fillSelect();if(d.settings?.about_ar)$('#aboutText').textContent=d.settings.about_ar;if(d.settings?.whatsapp)$('#waLink').href=`https://wa.me/${d.settings.whatsapp.replace(/\D/g,'')}`;return}catch{}
  }
  services=FALLBACK_SERVICES;renderServices();fillSelect();$('#waLink').href=`https://wa.me/${WHATSAPP}`;
}
function renderServices(){
  $('#serviceGrid').innerHTML=services.map(s=>`<article class="service-card reveal visible"><img src="${esc(s.image||'/assets/cat-online.jpg')}" alt="${esc(s.title_ar)}"><div class="service-card-content"><span class="tag">${esc(kindLabel(s.kind))}</span><h3>${esc(s.title_ar)}</h3><p>${esc(s.description_ar)}</p><div class="service-bottom"><div class="service-price"><small>${s.duration_minutes?`${s.duration_minutes} دقيقة · `:''}السعر</small><b>${money(s.price)}</b></div><button class="circle-btn" aria-label="احجز" data-service="${s.id}">←</button></div></div></article>`).join('');
  $$('[data-service]').forEach(b=>b.addEventListener('click',()=>openBooking(Number(b.dataset.service))));
}
function fillSelect(){const sel=$('#serviceSelect');sel.innerHTML='<option value="">اختاري الخدمة</option>'+services.map(s=>`<option value="${s.id}">${esc(s.title_ar)}${Number(s.price)>0?` — ${money(s.price)}`:''}</option>`).join('')}
function openBooking(id){if(id)$('#serviceSelect').value=String(id);if(typeof modal.showModal==='function')modal.showModal();else modal.setAttribute('open','');document.body.style.overflow='hidden'}
function closeBooking(){if(modal.open)modal.close();else modal.removeAttribute('open');document.body.style.overflow=''}
$$('[data-book]').forEach(b=>b.addEventListener('click',()=>{const title=b.dataset.serviceTitle;const found=title?services.find(s=>s.title_ar.includes(title.replace('دورة ',''))||s.title_ar===title):null;openBooking(found?.id)}));
$('#modalClose').addEventListener('click',closeBooking);modal.addEventListener('click',e=>{if(e.target===modal)closeBooking()});
async function submitBooking(e){
  e.preventDefault();const f=e.currentTarget,status=$('#bookingStatus');status.className='form-status';status.textContent='جاري إرسال الطلب...';const p=Object.fromEntries(new FormData(f).entries());p.service_id=Number(p.service_id);const svc=services.find(s=>s.id===p.service_id);
  if(!STATIC_MODE){try{const r=await fetch('/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});const d=await r.json();if(!r.ok)throw new Error(d.error||'تعذر الإرسال');status.className='form-status success';status.textContent=`تم استلام طلبك بنجاح. رقم الطلب: ${d.reference}`;f.reset();toast('تم إرسال طلب الحجز بنجاح');return}catch{}}
  const msg=[`طلب حجز جديد من الموقع`,`الاسم: ${p.name||''}`,`الهاتف: ${p.phone||''}`,`الخدمة: ${svc?.title_ar||''}`,p.email?`البريد: ${p.email}`:'',p.preferred_date?`التاريخ المفضل: ${p.preferred_date}`:'',p.preferred_time?`الوقت المفضل: ${p.preferred_time}`:'',p.notes?`ملاحظة: ${p.notes}`:''].filter(Boolean).join('\n');
  status.className='form-status success';status.textContent='سيتم فتح واتساب لإكمال طلب الحجز.';location.href=waUrl(msg);
}
async function submitContact(e){
  e.preventDefault();const f=e.currentTarget,status=$('#contactStatus');status.className='form-status';status.textContent='جاري الإرسال...';const p=Object.fromEntries(new FormData(f).entries());
  if(!STATIC_MODE){try{const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});const d=await r.json();if(!r.ok)throw new Error(d.error||'تعذر الإرسال');status.className='form-status success';status.textContent='وصلت رسالتك، سيتم التواصل معك قريباً.';f.reset();toast('تم إرسال رسالتك');return}catch{}}
  const msg=[`رسالة جديدة من الموقع`,`الاسم: ${p.name||''}`,p.phone?`الهاتف: ${p.phone}`:'',p.email?`البريد: ${p.email}`:'',`الرسالة: ${p.message||''}`].filter(Boolean).join('\n');
  status.className='form-status success';status.textContent='سيتم فتح واتساب لإرسال الرسالة.';location.href=waUrl(msg);
}
$('#bookingForm').addEventListener('submit',submitBooking);$('#contactForm').addEventListener('submit',submitContact);
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
$$('.reveal').forEach(el=>observer.observe(el));
window.addEventListener('scroll',()=>$('.site-header').classList.toggle('scrolled',scrollY>30),{passive:true});
$('#menuBtn').addEventListener('click',()=>$('#mobileMenu').classList.toggle('open'));
$$('#mobileMenu a,#mobileMenu button').forEach(el=>el.addEventListener('click',()=>$('#mobileMenu').classList.remove('open')));
$('#langBtn').addEventListener('click',()=>toast('النسخة الإنجليزية جاهزة للتفعيل عند الإطلاق'));
$('#year').textContent=new Date().getFullYear();
loadPublic();
