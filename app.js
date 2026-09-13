const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const WHATSAPP='96599577468';
const state={stage:1,service:null,date:null,time:null,maxStage:1};
const SERVICES={
  consultation:{title:'استشارة أونلاين',meta:'45 دقيقة عبر Zoom'},
  urgent:{title:'استشارة مستعجلة',meta:'أولوية في تنسيق الموعد'},
  course:{title:'كاريزما الحضور',meta:'دورة عبر Zoom · 20 د.ك'}
};
const REAL_CONSULT_DATES=[
  {value:'2026-09-20',label:'الأحد 20 سبتمبر',day:'الأحد',num:'20',month:'سبتمبر',left:2},
  {value:'2026-09-21',label:'الاثنين 21 سبتمبر',day:'الاثنين',num:'21',month:'سبتمبر',left:3},
  {value:'2026-09-22',label:'الثلاثاء 22 سبتمبر',day:'الثلاثاء',num:'22',month:'سبتمبر',left:3},
  {value:'2026-09-23',label:'الأربعاء 23 سبتمبر',day:'الأربعاء',num:'23',month:'سبتمبر',left:4}
];
const HINTS={1:'اختاري نوع الموعد أولاً',2:'اختاري اليوم المناسب',3:'اختاري الوقت المناسب',4:'تأكدي من بيانات الحجز'};
function pad(n){return String(n).padStart(2,'0')}
function iso(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function fmtDay(d){return new Intl.DateTimeFormat('ar-KW',{weekday:'long'}).format(d)}
function fmtMonth(d){return new Intl.DateTimeFormat('ar-KW',{month:'long'}).format(d)}
function urgentDates(){
  const out=[],d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+1);
  while(out.length<4){if(d.getDay()!==5)out.push({value:iso(d),label:`${fmtDay(d)} ${d.getDate()} ${fmtMonth(d)}`,day:fmtDay(d),num:String(d.getDate()),month:fmtMonth(d),left:null});d.setDate(d.getDate()+1)}
  return out;
}
function datesForService(){
  if(state.service==='consultation')return REAL_CONSULT_DATES;
  if(state.service==='course')return [{value:'2026-09-26',label:'السبت 26 سبتمبر',day:'السبت',num:'26',month:'سبتمبر',left:null}];
  return urgentDates();
}
function slotsForService(){
  if(state.service==='course')return ['7:00 مساءً'];
  if(state.service==='urgent')return ['11:00 صباحاً','1:00 ظهراً','4:00 مساءً','6:00 مساءً'];
  return ['10:00 صباحاً','11:00 صباحاً','12:00 ظهراً','4:00 مساءً','5:00 مساءً','6:00 مساءً'];
}
function showStage(n){
  state.stage=n;state.maxStage=Math.max(state.maxStage,n);
  $$('.stage').forEach(x=>x.classList.toggle('active',Number(x.dataset.stage)===n));
  $$('.step-dot').forEach(x=>{const i=Number(x.dataset.jump);x.classList.toggle('active',i===n);x.classList.toggle('done',i<n);x.disabled=i>state.maxStage});
  $('#stepHint').textContent=HINTS[n];
}
function renderDates(){
  const dates=datesForService();
  $('#dayNote').textContent=state.service==='consultation'?'المواعيد المتاحة حالياً':'اختاري اليوم المناسب';
  $('#dateRow').innerHTML=dates.map(d=>`<button class="date-btn" type="button" data-date="${d.value}" data-label="${d.label}"><span>${d.day}</span><b>${d.num}</b><small>${d.month}</small>${d.left?`<span class="availability">متبقي ${d.left}</span>`:''}</button>`).join('');
  $$('.date-btn').forEach(btn=>btn.addEventListener('click',()=>{
    state.date={value:btn.dataset.date,label:btn.dataset.label};
    $$('.date-btn').forEach(x=>x.classList.toggle('selected',x===btn));
    renderTimes();showStage(3);
  }));
}
function renderTimes(){
  $('#selectedDayText').textContent=state.date?.label||'';
  $('#timeRow').innerHTML=slotsForService().map(t=>`<button class="time-btn" type="button" data-time="${t}">${t}<small>${state.service==='course'?'موعد الدورة':'وقت مفضل'}</small></button>`).join('');
  $$('.time-btn').forEach(btn=>btn.addEventListener('click',()=>{
    state.time=btn.dataset.time;
    $$('.time-btn').forEach(x=>x.classList.toggle('selected',x===btn));
    renderSummary();showStage(4);
  }));
}
function renderSummary(){
  const s=SERVICES[state.service];
  $('#summaryBox').innerHTML=`<div><small>الخدمة</small><b>${s.title}</b></div><div><small>اليوم</small><b>${state.date.label}</b></div><div><small>الوقت</small><b>${state.time}</b></div>`;
}
$$('.service-option').forEach(btn=>btn.addEventListener('click',()=>{
  state.service=btn.dataset.service;state.date=null;state.time=null;
  $$('.service-option').forEach(x=>x.classList.toggle('selected',x===btn));
  renderDates();showStage(2);
}));
$$('[data-back]').forEach(btn=>btn.addEventListener('click',()=>showStage(Number(btn.dataset.back))));
$$('[data-jump]').forEach(btn=>btn.addEventListener('click',()=>{const n=Number(btn.dataset.jump);if(n<=state.maxStage)showStage(n)}));
$('#phoneInput').addEventListener('input',e=>e.target.value=e.target.value.replace(/\D/g,'').slice(0,8));
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
    `الوقت المفضل: ${state.time}`,
    `الاسم: ${name}`,
    `رقم الجوال: +965 ${phone}`
  ].join('\n');
  location.href=`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
});
showStage(1);
