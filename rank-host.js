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
  const status = (msg) => { const e=document.getElementById('rank-sync-admin-status'); if(e) e.textContent=msg; };
  function saveSettings(){
    const url=document.getElementById('rank-sync-admin-url')?.value.trim();
    const pwd=document.getElementById('rank-sync-admin-key')?.value.trim();
    if(url&&!/^https:\/\/script\.google\.com\/macros\/s\/[^?#]+\/exec$/.test(url)){status('URL ต้องเป็น Apps Script /exec');return;}
    if(url)RANK_API=url;
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

  let key = '';
  let next = Promise.resolve();
  function getKey(event){
    if(key)return key;
    try { key=sessionStorage.getItem(STORAGE_KEY)||sessionStorage.getItem('GR_SYNC_KEY')||''; } catch(e) {}
    if(key)return key;
    if(event!=='start'&&event!=='visibility')return '';
    const entered=window.prompt('ใส่ RANK_KEY สำหรับซิงก์ iDekTep / ESSENTIAL ไปเว็บผู้ชม\nURL ระบบเชื่อมต่อกำหนดไว้แล้ว ไม่ต้องกรอก URL');
    if(!entered||!entered.trim()){status('ไม่ได้ใส่ RANK_KEY • เว็บผู้ชมยังไม่เปลี่ยน');return '';}
    key=entered.trim();
    try {sessionStorage.setItem(STORAGE_KEY,key);sessionStorage.setItem('GR_SYNC_KEY',key);} catch(e) {}
    return key;
  }
  function send(event, payload) {
    const pw = getKey(event);
    if (!pw) { status('ยังไม่ใส่ RANK_KEY • เว็บผู้ชมจึงไม่เปลี่ยน'); console.warn('[RANK SYNC] No admin key'); return; }
    const url = new URL(RANK_API);
    url.searchParams.set('action', 'publish');
    url.searchParams.set('event', event);
    url.searchParams.set('payload', JSON.stringify(payload || {}));
    url.searchParams.set('key', pw);
    url.searchParams.set('_', String(Date.now()));
    // Keep order of start -> await -> pick -> pod -> done even across slow networks.
    next = next.catch(() => {}).then(async () => {
      try {
        await fetch(url.toString(), {method:'GET',mode:'no-cors',cache:'no-store'});
        status('ส่งสัญญาณแล้ว • ตรวจผลบน watch.html (คำตอบเซิร์ฟเวอร์ยังไม่ได้ยืนยัน)');
      } catch (e) {
        // Fallback for clients blocking cross-origin fetch; never claim server acknowledgement.
        await new Promise(resolve => {
          const img = new Image();
          const timeout = setTimeout(resolve,8000);
          img.onload = img.onerror = () => {clearTimeout(timeout);resolve()};
          img.src = url.toString();
        });
        status('พยายามส่งสัญญาณสำรองแล้ว • กรุณาตรวจ watch.html');
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
  console.info('[RANK SYNC] Admin transmitter ready; viewer has read-only access.');
})();
