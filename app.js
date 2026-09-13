const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const WHATSAPP='96599577468';
const state={service:null,date:null,time:null};
const SERVICES={
  consultation:{title:'استشارة أونلاين',meta:'45 دقيقة عبر Zoom',price:'45 دقيقة'},
  urgent:{title:'استشارة مستعجلة',meta:'أولوية في تنسيق الموعد',price:'80 د.ك'},
  course:{title:'كاريزما الحضور',meta:'برنامج تدريبي عبر Zoom',price:'20 د.ك'}
};
const HINTS={1:'ابدئي باختيار نوع الموعد.',2:'اختاري اليوم المناسب لك.',3:'اختاري الوقت الأنسب لك.',4:'باقي الاسم ورقم الجوال فقط.'};
function setStage(n){
  $$('.stage').forEach(x=>x.classList.toggle('active',Number(x.dataset.stage)===n));
  $$('.progress-item').forEach(x=>{const i=Number(x.dataset.progress);x.classList.toggle('active',i===n);x.classList.toggle('done',i<n)});
  $('#stepHint').textContent=HINTS[n];
  window.scrollTo({top:0,behavior:'smooth'});
}
function pad(n){return String(n).padStart(2,'0')}
function isoDate(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function nextBookableDays(count=7){
  const out=[],d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+1);
  while(out.length<count){if(d.getDay()!==5)out.push(new Date(d));d.setDate(d.getDate()+1)}
  return out;
}
function renderDates(){
  const dayFmt=new Intl.DateTimeFormat('ar-KW',{weekday:'short'});
  const monthFmt=new Intl.DateTimeFormat('ar-KW',{month:'long'});
  $('#dateStrip').innerHTML=nextBookableDays().map(d=>`<button class="date-card" type="button" data-date="${isoDate(d)}" data-label="${dayFmt.format(d)} ${d.getDate()} ${monthFmt.format(d)}"><span>${dayFmt.format(d)}</span><b>${d.getDate()}</b><small>${monthFmt.format(d)}</small></button>`).join('');
  $$('.date-card').forEach(btn=>btn.addEventListener('click',()=>{
    state.date={value:btn.dataset.date,label:btn.dataset.label};
    $$('.date-card').forEach(x=>x.classList.toggle('selected',x===btn));
    renderTimes();
    setStage(3);
  }));
}
function slotsFor(service){
  if(service==='urgent')return ['11:00 صباحاً','1:00 ظهراً','4:00 مساءً','5:00 مساءً','6:00 مساءً','7:00 مساءً'];
  if(service==='course')return ['5:00 مساءً','6:00 مساءً','7:00 مساءً','7:30 مساءً'];
  return ['10:00 صباحاً','11:00 صباحاً','12:00 ظهراً','4:00 مساءً','5:00 مساءً','6:00 مساءً'];
}
function renderTimes(){
  $('#chosenDateText').textContent=state.date?.label||'';
  $('#timeGrid').innerHTML=slotsFor(state.service).map(t=>`<button class="time-btn" type="button" data-time="${t}">${t}</button>`).join('');
  $$('.time-btn').forEach(btn=>btn.addEventListener('click',()=>{
    state.time=btn.dataset.time;
    $$('.time-btn').forEach(x=>x.classList.toggle('selected',x===btn));
    renderSummary();
    setStage(4);
  }));
}
function renderSummary(){
  const s=SERVICES[state.service];
  $('#summaryBox').innerHTML=`<div><small>الخدمة</small><b>${s.title}</b></div><div><small>اليوم</small><b>${state.date.label}</b></div><div><small>الوقت</small><b>${state.time}</b></div>`;
}
$$('.service-choice').forEach(btn=>btn.addEventListener('click',()=>{
  state.service=btn.dataset.service;
  state.date=null;state.time=null;
  renderDates();
  setStage(2);
}));
$$('[data-back]').forEach(btn=>btn.addEventListener('click',()=>setStage(Number(btn.dataset.back))));
$('#bookingForm').addEventListener('submit',e=>{
  e.preventDefault();
  const name=$('#nameInput').value.trim();
  const phone=$('#phoneInput').value.replace(/\D/g,'');
  if(!name){$('#nameInput').focus();return}
  if(phone.length!==8){$('#phoneInput').focus();return}
  const s=SERVICES[state.service];
  const msg=[
    'طلب حجز جديد',
    `الخدمة: ${s.title}`,
    `اليوم: ${state.date.label}`,
    `الوقت: ${state.time}`,
    `الاسم: ${name}`,
    `رقم الجوال: +965 ${phone}`
  ].join('\n');
  window.location.href=`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
});
$('#phoneInput').addEventListener('input',e=>e.target.value=e.target.value.replace(/\D/g,'').slice(0,8));
setStage(1);
