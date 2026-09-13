const WHATSAPP='96599577468';
const dateList=document.querySelector('#dateList');
const selectedDate=document.querySelector('#selectedDate');
const form=document.querySelector('#bookingForm');
const error=document.querySelector('#formError');

const dayNames=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const monthNames=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function pad(n){return String(n).padStart(2,'0')}
function isoDate(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function arabicDateLabel(d){return `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`}

function buildDates(){
  const today=new Date();
  today.setHours(12,0,0,0);
  const dates=[];
  for(let i=1;i<=5;i++){
    const d=new Date(today);
    d.setDate(today.getDate()+i);
    dates.push(d);
  }
  dateList.innerHTML=dates.map((d,i)=>`<button class="date-btn" type="button" role="radio" aria-checked="${i===0?'true':'false'}" data-date="${isoDate(d)}" data-label="${arabicDateLabel(d)}"><span>${dayNames[d.getDay()]}</span><strong>${d.getDate()}</strong><small>${monthNames[d.getMonth()]}</small></button>`).join('');
  selectedDate.value=isoDate(dates[0]);
  dateList.querySelectorAll('.date-btn').forEach(btn=>btn.addEventListener('click',()=>selectDate(btn)));
}
function selectDate(btn){
  dateList.querySelectorAll('.date-btn').forEach(x=>x.setAttribute('aria-checked','false'));
  btn.setAttribute('aria-checked','true');
  selectedDate.value=btn.dataset.date;
}

function cleanPhone(value){return value.replace(/[^0-9+]/g,'').trim()}

form.addEventListener('submit',e=>{
  e.preventDefault();
  error.textContent='';
  const name=document.querySelector('#name').value.trim();
  const phone=cleanPhone(document.querySelector('#phone').value);
  const service=document.querySelector('input[name="service"]:checked')?.value;
  const period=document.querySelector('input[name="period"]:checked')?.value;
  const dateBtn=dateList.querySelector('.date-btn[aria-checked="true"]');

  if(name.length<2){error.textContent='اكتبي الاسم من فضلك.';document.querySelector('#name').focus();return}
  if(phone.replace(/\D/g,'').length<8){error.textContent='تأكدي من رقم الجوال.';document.querySelector('#phone').focus();return}
  if(!service||!period||!dateBtn){error.textContent='اختاري الخدمة واليوم والفترة.';return}

  const msg=[
    'السلام عليكم، أود حجز موعد مع د. منى بن علي.',
    '',
    `الاسم: ${name}`,
    `رقم الجوال: ${phone}`,
    `الخدمة: ${service}`,
    `اليوم المفضل: ${dateBtn.dataset.label}`,
    `الفترة المفضلة: ${period}`,
    '',
    'بانتظار تأكيد الموعد، شكراً.'
  ].join('\n');

  window.location.href=`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
});

buildDates();
