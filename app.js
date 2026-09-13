const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const modal=$('#bookingModal');
const select=$('#serviceSelect');
const WHATSAPP='96599577468';
const services={
  1:'استشارة أونلاين — 45 دقيقة',
  2:'كاريزما الحضور — 20 د.ك',
  3:'استشارة مستعجلة — 80 د.ك'
};
function openBooking(id){
  if(id&&select)select.value=String(id);
  if(typeof modal.showModal==='function')modal.showModal();else modal.setAttribute('open','');
  document.body.style.overflow='hidden';
}
function closeBooking(){
  if(modal.open)modal.close();else modal.removeAttribute('open');
  document.body.style.overflow='';
}
$$('[data-service]').forEach(btn=>btn.addEventListener('click',()=>openBooking(Number(btn.dataset.service))));
$('#modalClose').addEventListener('click',closeBooking);
modal.addEventListener('click',e=>{if(e.target===modal)closeBooking()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeBooking()});$('#bookingForm').addEventListener('submit',e=>{
  e.preventDefault();
  const form=e.currentTarget;
  const data=Object.fromEntries(new FormData(form).entries());
  const label=services[data.service_id]||'خدمة';
  const msg=[
    'طلب حجز جديد',
    `الخدمة: ${label}`,
    `الاسم: ${data.name||''}`,
    `الهاتف: ${data.phone||''}`,
    data.preferred_date?`التاريخ المفضل: ${data.preferred_date}`:'',
    data.preferred_time?`الوقت المفضل: ${data.preferred_time}`:'',
    data.notes?`ملاحظة: ${data.notes}`:''
  ].filter(Boolean).join('\n');
  $('#bookingStatus').textContent='جاري فتح واتساب...';
  window.location.href=`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
});