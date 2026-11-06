const modal=document.querySelector("#bookingModal"),form=document.querySelector("#bookingForm");const names={swedish:"Swedish Massage",deep:"Deep Tissue Massage",beach:"Beach Massage",couples:"Couples Massage"};function openBooking(service="",duration="60"){if(!modal||!form)return;modal.classList.add("open");document.body.style.overflow="hidden";if(form.service)form.service.value=service;if(form.duration)form.duration.value=duration}function closeBooking(){if(!modal)return;modal.classList.remove("open");document.body.style.overflow=""}document.addEventListener("click",e=>{const b=e.target.closest("[data-book]");if(b){e.preventDefault();openBooking(b.dataset.service||"",b.dataset.duration||"60")}if(e.target.matches("[data-close]")||e.target===modal)closeBooking()});document.addEventListener("keydown",e=>{if(e.key==="Escape")closeBooking()});document.querySelectorAll(".faq-q").forEach(b=>b.addEventListener("click",()=>b.parentElement.classList.toggle("open")));document.querySelectorAll(".pay-card").forEach(c=>c.addEventListener("click",()=>{document.querySelectorAll(".pay-card").forEach(x=>x.classList.remove("selected"));c.classList.add("selected");c.querySelector("input").checked=true}));if(form)form.addEventListener("submit",async e=>{e.preventDefault();const d=new FormData(form);const payload={service:d.get("service"),duration:d.get("duration"),date:d.get("date"),time:d.get("time"),location:d.get("location"),name:d.get("name"),phone:d.get("phone"),email:d.get("email"),payment:d.get("payment"),notes:d.get("notes")||"",website:d.get("website")||"",source:location.href};const btn=form.querySelector('button[type="submit"]'),old=btn.textContent;btn.disabled=true;btn.textContent="Sending request…";form.querySelectorAll(".booking-error").forEach(x=>x.remove());try{const r=await fetch("/api/booking-request",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const data=await r.json();if(!r.ok)throw new Error(data.error||"Request failed");modal.querySelector(".booking-panel").innerHTML=`<div><p class="eyebrow">REQUEST RECEIVED</p><h2>We've got your St. Vincent & the Grenadines massage request.</h2><p>A confirmation was sent to <strong>${payload.email}</strong>. Your appointment remains pending until therapist availability, island routing and property access are confirmed.</p><p><strong>Reference: ${data.reference}</strong></p><div class="success-summary"><div><span>Service</span><strong>${names[payload.service]||payload.service}</strong></div><div><span>Duration</span><strong>${payload.duration} minutes</strong></div><div><span>Service subtotal</span><strong>${window.tranquilitasBookingSummary?.(payload)||"Quote required"}</strong></div><div><span>Date</span><strong>${payload.date}</strong></div><div><span>Time</span><strong>${payload.time}</strong></div><div><span>Location</span><strong>${payload.location}</strong></div><div><span>Payment</span><strong>${payload.payment==="pay"?"Pay online after confirmation":"Pay in person"}</strong></div></div><div style="margin-top:18px;background:#edf8f6;padding:16px">We will contact you to confirm therapist availability and any island-transfer or access details before payment is requested.</div><button class="btn btn-dark" data-close style="margin-top:18px">Close</button></div>`}catch(ex){const box=document.createElement("div");box.className="booking-error";box.textContent="We couldn't send your request. Please try again or use the Need help button.";form.appendChild(box);btn.disabled=false;btn.textContent=old}});document.querySelectorAll("[data-gallery]").forEach(el=>el.addEventListener("click",()=>{const lb=document.querySelector("#lightbox"),im=document.querySelector("#lightboxImage");if(!lb||!im)return;im.src=el.dataset.gallery;lb.classList.add("open");document.body.style.overflow="hidden"}));document.addEventListener("click",e=>{const lb=document.querySelector("#lightbox");if(e.target.matches("[data-lightbox-close]")||e.target===lb){lb?.classList.remove("open");document.body.style.overflow=""}});(()=>{const d=document.createElement("div");d.className="contact-dock";d.innerHTML='<div class="contact-menu" hidden><span>Need help booking?</span><a href="https://wa.me/12428168286" target="_blank" rel="noopener"><b>WhatsApp</b><small>Message our concierge</small></a><a href="sms:+12428168286"><b>iMessage / Text</b><small>+1 (242) 816-8286</small></a></div><button class="contact-trigger" aria-label="Open booking help">Need help?</button>';document.body.appendChild(d);const m=d.querySelector(".contact-menu"),b=d.querySelector(".contact-trigger");b.onclick=()=>m.hidden=!m.hidden})();
/* Shared country UX: selectable service + visible cost in each booking request. */
(()=>{
const form=document.getElementById("bookingForm"),modal=document.getElementById("bookingModal");
if(!form||!modal||form.dataset.summaryInstalled)return;
form.dataset.summaryInstalled="true";
const PRICES={"swedish":[95,140],"deep":[95,140],"beach":[95,140],"couples":[185,280]};
const service=form.querySelector('[name="service"]'),duration=form.querySelector('[name="duration"]');
if(!service||!duration)return;
if(!Array.from(service.options).some(o=>o.value===""))service.insertBefore(new Option("Choose a massage",""),service.firstChild);
service.required=true;
const guestsField=document.createElement("div");guestsField.className="field booking-guests-field";
guestsField.innerHTML='<label for="bookingGuestQty">Number of guests</label><input id="bookingGuestQty" name="guests" type="number" min="1" max="10" step="1" value="1" required>';
duration.closest(".field")?.after(guestsField);
const guests=guestsField.querySelector("input");
const summary=document.createElement("div");summary.className="field full booking-price-summary";summary.setAttribute("aria-live","polite");
summary.innerHTML='<div class="booking-price-panel"><strong>Request summary</strong><p data-booking-desc>Choose a service to see the listed price.</p><p class="booking-price-value" data-booking-price>Choose a service</p><small data-booking-note>Published USD service rates. Final costs and availability are confirmed before payment.</small></div>';
const payment=form.querySelector(".pay-choice")?.closest(".field"),submit=form.querySelector('button[type="submit"]');
(payment||submit?.closest(".field"))?.before(summary);
const money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
function calculate(){
 const svc=service.value,dur=duration.value;
 if(svc==="couples")guests.value="2";
 const qty=Number(guests.value),unit=dur==="60"?PRICES[svc]?.[0]:dur==="90"?PRICES[svc]?.[1]:undefined;
 if(!svc)return{amount:null,note:"Choose a treatment to see the listed service price.",count:qty};
 if(!Number.isInteger(qty)||qty<1||qty>10)return{amount:null,note:"Enter a valid guest count.",count:qty};
 if(!Number.isFinite(unit))return{amount:null,note:"Custom service: our concierge will confirm pricing before payment.",count:qty};
 return{amount:unit*(svc==="couples"?1:qty),note:svc==="couples"?"Couples price covers two guests.":"Listed price per guest, multiplied by "+qty+".",count:qty};
}
function update(){
 const p=calculate();const label=service.options[service.selectedIndex]?.textContent||"Choose a service";
 summary.querySelector("[data-booking-desc]").textContent=label+" · "+duration.value+" minutes · "+p.count+" guest(s)";
 summary.querySelector("[data-booking-price]").textContent=p.amount===null?"Price: quote required":"Published service subtotal: "+money(p.amount)+" USD";
 summary.querySelector("[data-booking-note]").textContent=p.note+" Travel, property or island-specific charges may apply. Your request is not a confirmed booking.";
}
window.tranquilitasBookingSummary=payload=>{
 const svc=payload.service,dur=String(payload.duration),q=Number(payload.guests||guests.value||1);
 const val=dur==="60"?PRICES[svc]?.[0]:dur==="90"?PRICES[svc]?.[1]:undefined;
 return Number.isFinite(val)&&Number.isInteger(q)&&q>=1&&q<=10?money(val*(svc==="couples"?1:q))+" USD (service subtotal)":"Quote required";
};
form.addEventListener("input",update);form.addEventListener("change",update);
document.addEventListener("click",event=>{
 const trigger=event.target.closest("[data-book]");if(!trigger)return;
 queueMicrotask(()=>{
 const serviceHint=trigger.dataset.service||({swedish:"swedish",deep:"deep",couples:"couples",beach:"beach"}[location.pathname.split("/").filter(Boolean)[0]?.split("-")[0]]);
 if(serviceHint&&Array.from(service.options).some(o=>o.value===serviceHint))service.value=serviceHint;
 update();
 });
});
update();
})();
