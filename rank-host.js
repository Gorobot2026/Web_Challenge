/**
 * rank-host.js — ส่วนเสริมสำหรับเครื่องหลัก (wedo_idektep.html)
 * ส่งสถานะ "ประกาศอันดับแล้ว" ไปที่ rank-sync เพื่อให้ watch.html แสดงอันดับตาม
 *
 * วิธีติดตั้ง: วางไฟล์นี้ข้าง wedo_idektep.html แล้วเพิ่มบรรทัดเดียวก่อน </body>
 *   <script src="rank-host.js"></script>
 * (ต้องอยู่หลัง <script> หลักของหน้า)
 */
(function () {
  const RANK_API = 'https://script.google.com/macros/s/AKfycbyrdBcX_7G8Mz8xNlmRov9-4g7WiJ2laloBiG1evriNHHhGjVMG7KcGEdD1TDJcBnw/exec';
  const RANK_KEY = '305306code';
  const RESET_ON_LOAD = false; // true = ซ่อนอันดับของผู้ชมทุกครั้งที่เปิดเครื่องหลัก

  function pub(board, on) {
    if (!RANK_API || RANK_API.indexOf('http') !== 0) return;
    const url = RANK_API + '?action=set&board=' + board + '&on=' + (on ? 1 : 0) +
                '&key=' + encodeURIComponent(RANK_KEY) + '&t=' + Date.now();
    fetch(url, { mode: 'no-cors' }).catch(function () {});
  }

  /* iDekTep: ทุกครั้งที่ตารางเปลี่ยนเป็นโหมด RANK / ซ่อน */
  const baseSetRank = window.setRank;
  window.setRank = function (on) {
    baseSetRank(on);
    pub('idek', !!on);
  };

  /* WEDO: เมื่อพิธีประกาศอันดับจบ */
  const baseEndReveal = window.endReveal;
  window.endReveal = function () {
    const wasWedo = activeRevealType === 'wedo';
    baseEndReveal();
    if (wasWedo) pub('wedo', true);
  };

  /* WEDO: Shift + คลิกปุ่ม RANK = ซ่อนอันดับของผู้ชม */
  const baseToggleWedo = window.toggleWedoRank;
  window.toggleWedoRank = function () {
    if (window.event && window.event.shiftKey) { pub('wedo', false); return; }
    baseToggleWedo();
  };

  if (RESET_ON_LOAD) { pub('idek', false); pub('wedo', false); }
})();
