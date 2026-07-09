/* ============================================================
   ★★★ 착륙 페이지 통합 설정 파일 (여기 한 곳만 수정하세요) ★★★
   ------------------------------------------------------------
   추적 ID · 전환 라벨 · CTA 채팅 링크를 모두 이 파일에서 관리합니다.
   HTML/JS 는 이 값을 자동으로 읽어옵니다. 다른 파일은 건드릴 필요 없습니다.
   ============================================================ */
window.LP_CONFIG = {

  /* ---------- 1. Google 추적 ID ---------- */
  // GA4 측정 ID (예: "G-ABCD1234EF")
  GA4_ID: "G-XXXXXXXXXX",

  // Google Ads 전환 ID (예: "AW-123456789")
  ADS_ID: "AW-XXXXXXXXXX",

  // Google Ads "리드 제출" 전환 라벨
  // Google Ads > 목표 > 전환 > 태그 에서 확인 (형식: "AW-123456789/AbCdEfGh")
  CONVERSION_SEND_TO: "AW-XXXXXXXXXX/YYYYYYYYYYYY",


  /* ---------- 2. 전환 가치 ---------- */
  VALUE: 1.0,          // 리드 1건당 추정 가치 (원 단위)
  CURRENCY: "KRW",


  /* ---------- 3. 제출 성공 후 이동할 채팅 링크 (CTA 목적지) ----------
     아래 CHAT_LINK 한 줄만 본인 링크로 교체하면 됩니다.

     • WhatsApp 1:1 상담 : https://wa.me/8210XXXXXXXX
       (메시지 미리 채우기: https://wa.me/8210XXXXXXXX?text=상담%20신청합니다)
     • WhatsApp 그룹 초대 : https://chat.whatsapp.com/XXXXXXXXXXXXXXX
     • 카카오톡 오픈채팅  : https://open.kakao.com/o/XXXXXXXX
     • 텔레그램          : https://t.me/XXXXXXXX
  ------------------------------------------------------------------ */
  CHAT_LINK: "https://wa.me/8210XXXXXXXX?text=" +
             encodeURIComponent("안녕하세요, 독일 증시 무료 리포트를 신청합니다."),

  // 새 탭으로 열기(true) / 현재 탭에서 이동(false)
  // 모바일 WhatsApp 딥링크 안정성을 위해 false 권장
  CHAT_OPEN_NEW_TAB: false,

  // 전환 상단보고 대기 시간(ms). 이 시간 안에 전환이 기록되면 즉시 이동합니다.
  REDIRECT_DELAY_MS: 1500,


  /* ---------- 4. 시세 데이터 소스 ----------
     GitHub Actions 가 매일 갱신하는 market.json 을 직접 읽으려면
     아래에 raw 링크를 넣으세요. 비워두면 로컬 data/market.json 을 사용합니다.

     형식: https://raw.githubusercontent.com/<사용자>/<저장소>/<브랜치>/data/market.json
     예:   https://raw.githubusercontent.com/myid/hanguo-lp/main/data/market.json
  ------------------------------------------------------------------ */
  MARKET_JSON_URL: ""   // 비우면 "data/market.json" 로컬 파일 사용
};
