/**
 * GO ROBOT CHALLENGE 2026 · Main website Rank bridge.
 * Main HTML already calls window.goLivePublish('start'|'await'|'pick'|'pod'|'done'|'visibility', payload)
 * Place this file NEXT TO the existing main wedo_idektep.html.
 * Never put the admin password in watch.html, here, or GitHub source code.
 */
(() => {
  'use strict';
  let RANK_API = 'https://script.google.com/macros/s/AKfycbyrdBcX_7G8Mz8xNlmRov9-4g7WiJ2laloBiG1evriNHHhGjVMG7KcGEdD1TDJcBnw/exec';
  // URL can stay unchanged IF the current Apps Script deployment is updated to rank-live-sync.gs.
  // For a new deployment, update the URL here AND API.rank in watch.html.
  const STORAGE_KEY = 'GOROBOT_2026_RANK_ADMIN_KEY';
  // URL is fixed by the administrator, not editable on the public website.
  try { localStorage.setItem('GR_SYNC_URL', RANK_API); } catch(e) {}
  const status = (msg) => {
    let e=document.getElementById('rank-sync-admin-status');
    if(!e){e=document.createElement('div');e.id='rank-sync-admin-status';e.style.cssText='position:fixed;right:14px;bottom:14px;z-index:999999;background:#101c3bef;border:1px solid #61c9f0;color:#ddf8ff;font:500 13px Kanit,sans-serif;padding:10px 14px;border-radius:8px;max-width:min(92vw,380px);box-shadow:0 8px 22px #0007';document.body.appendChild(e)}
    e.textContent=msg;
  };
  function saveSettings(){
    const url=document.getElementById('rank-sync-admin-url')?.value.trim();
    const pwd=document.getElementById('rank-sync-admin-key')?.value.trim();
    if(url&&!/^https:\/\/script\.google\.com\/macros\/s\/[^?#]+\/exec$/.test(url)){status('URL ต้องเป็น Apps Script /exec');return;}
    // Rank endpoint is fixed in source and cannot be overridden by old settings.
    RANK_API = 'https://script.google.com/macros/s/AKfycbyrdBcX_7G8Mz8xNlmRov9-4g7WiJ2laloBiG1evriNHHhGjVMG7KcGEdD1TDJcBnw/exec';
    if(pwd)key=pwd;
    try{localStorage.setItem('GR_SYNC_URL',RANK_API);if(key){sessionStorage.setItem(STORAGE_KEY,key);sessionStorage.setItem('GR_SYNC_KEY',key)}}catch(e){}
    status(key?'บันทึกการซิงก์แล้ว • ให้กด RANK ทดสอบบนเว็บผู้ชม':'บันทึก URL แล้ว • ต้องกรอก RANK_KEY ก่อนส่งผล');
  }
  async function checkConnection(){
    try{const res=await fetch(RANK_API+'?t='+Date.now(),{cache:'no-store'});const data=await res.json();status('อ่าน Apps Script ได้ • '+(data.success?'พร้อมรับสถานะ • โปรดกด RANK ทดสอบ':'เซิร์ฟเวอร์ตอบผิดพลาด'));}
    catch(e){status('ตรวจสอบ URL ไม่สำเร็จ: '+e.message)}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const u=document.getElementById('rank-sync-admin-url');if(u)u.value=RANK_API;
    const k=document.getElementById('rank-sync-admin-key');try{if(k)k.value=key||sessionStorage.getItem(STORAGE_KEY)||sessionStorage.getItem('GR_SYNC_KEY')||''}catch(e){}
  });
  window.GRRankConfig={saveSettings,checkConnection};

  function grJsonpRequest(endpoint, args, timeoutMs=9500) {
  return new Promise((resolve,reject)=>{
    const cb='__grRankV5_'+Date.now()+'_'+Math.floor(Math.random()*1e8);
    const url=new URL(endpoint);
    for(const [k,v] of Object.entries(args||{}))url.searchParams.set(k,String(v));
    url.searchParams.set('callback',cb);
    url.searchParams.set('_',String(Date.now()));
    const script=document.createElement('script');let ended=false;
    const finish=(err,data)=>{
      if(ended)return;ended=true;clearTimeout(timer);
      script.remove();try{delete window[cb]}catch(e){window[cb]=undefined}
      if(err)reject(err);else resolve(data);
    };
    const timer=setTimeout(()=>finish(new Error('หมดเวลารอ Apps Script: ตรวจ Deploy เวอร์ชัน V5')),timeoutMs);
    window[cb]=data=>finish(null,data);
    script.onerror=()=>finish(new Error('โหลด Apps Script ไม่สำเร็จ: ตรวจ URL และสิทธิ์ Anyone'));
    script.async=true;script.src=url.toString();document.head.appendChild(script);
  });
}

  let key = '';
  let next = Promise.resolve();
  function getKey(event){
    if(key)return key;
    try { key=sessionStorage.getItem(STORAGE_KEY)||sessionStorage.getItem('GR_SYNC_KEY')||''; } catch(e) {}
    if(key)return key;
    if(event!=='start'&&event!=='visibility')return ''; // only prompt on user-initiated actions
    const entered=window.prompt('ใส่ RANK_KEY สำหรับซิงก์ iDekTep / ESSENTIAL ไปเว็บผู้ชม\nURL ระบบเชื่อมต่อกำหนดไว้แล้ว ไม่ต้องกรอก URL');
    if(!entered||!entered.trim()){status('ไม่ได้ใส่ RANK_KEY • เว็บผู้ชมยังไม่เปลี่ยน');return '';}
    key=entered.trim();
    try {sessionStorage.setItem(STORAGE_KEY,key);sessionStorage.setItem('GR_SYNC_KEY',key);} catch(e) {}
    return key;
  }
  function send(event, payload) {
    const pw = getKey(event);
    if (!pw) { status('ยังไม่ใส่ RANK_KEY • เว็บผู้ชมจึงไม่เปลี่ยน'); console.warn('[RANK SYNC] No admin key'); return; }
    // Queue all steps; each request must be acknowledged by the server.
    next=next.catch(()=>{}).then(async()=>{
      try {
        const ack=await grJsonpRequest(RANK_API,{action:'publish',event,payload:JSON.stringify(payload||{}),key:pw});
        if(ack?.success!==true)throw new Error(ack?.error||'Apps Script ไม่ยืนยันคำสั่ง');
        status('SYNC OK • '+event+' • Event #'+ack.eventId);
        console.info('[RANK SYNC] Confirmed',event,ack.eventId);
      } catch(e) {
        if(/Unauthorized/.test(e.message)) {
          key='';try{sessionStorage.removeItem(STORAGE_KEY);sessionStorage.removeItem('GR_SYNC_KEY')}catch(ex){}
          status('รหัส RANK_KEY ไม่ถูกต้อง • กด RANK ใหม่เพื่อใส่รหัส');
        } else status('ไม่สามารถซิงก์ได้: '+e.message);
        console.error('[RANK SYNC]',event,e.message);
      }
    });
  }

  window.goLivePublish = function(event, payload) {
    if (!window.liveCanControl?.()) return;
    if (!['start','await','pick','pod','done','visibility'].includes(String(event))) return;
    // FIFO invocation; each ceremony event is sent as a separate request.
    send(String(event), payload);
  };
  Object.defineProperty(window,'GO_ROBOT_RANK_API',{get:()=>RANK_API});
  console.info('[RANK SYNC V6] Admin transmitter ready; viewer has read-only access.');
})();
