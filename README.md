# 한국 시장 Google Ads 착륙 페이지 (Korean Stock LP)

독일/글로벌 증시 시황 무료 구독을 유도하는 모바일 우선 정적 착륙 페이지입니다.
GA4 + Google Ads 전환 추적과 한국 Google Ads 심사 대응 컴플라이언스 구조를 포함합니다.

## 파일 구성

| 파일 | 설명 |
|------|------|
| `index.html` | 메인 착륙 페이지 (히어로 · 리드 폼 · 전환 추적 · 모달) |
| `css/style.css` | 전체 스타일 (순수 CSS, 외부 프레임워크 미사용) |
| `js/script.js` | 폼 검증 · 모달 · 전환 이벤트 (순수 JS) |
| `privacy.html` | 개인정보처리방침 (크롤링 가능한 독립 페이지) |
| `terms.html` | 이용약관 (크롤링 가능한 독립 페이지) |
| `404.html` | 에러 페이지 |
| `favicon.svg` | 파비콘 |
| `robots.txt` | 크롤러 정책 + 사이트맵 위치 |
| `sitemap.xml` | 사이트맵 |

## 리소스 로컬화

- **외부 CDN 의존성 없음**: Tailwind CDN·웹폰트 CDN을 제거하고 `css/style.css`로 직접 작성했습니다.
- **한글 폰트**: 시스템 폰트 스택(Pretendard → Apple SD Gothic Neo → 맑은 고딕) 사용으로 별도 다운로드 불필요.
- **유일한 외부 요청**은 추적에 필수인 `googletagmanager.com/gtag/js` 뿐입니다 (Google 정책상 자체 호스팅 불가).

## 배포 전 필수 교체 항목 (플레이스홀더)

### ★ 핵심: `config.js` 한 파일만 수정하면 됩니다

추적 ID·전환 라벨·CTA 채팅 링크는 모두 [`config.js`](config.js) 에 모여 있습니다.
HTML/JS 가 이 값을 자동으로 읽으므로 다른 파일은 건드릴 필요가 없습니다.

| config.js 키 | 설명 | 예시 |
|---|---|---|
| `GA4_ID` | GA4 측정 ID | `G-ABCD1234EF` |
| `ADS_ID` | Google Ads 전환 ID | `AW-123456789` |
| `CONVERSION_SEND_TO` | Google Ads 전환 라벨 | `AW-123456789/AbCdEfGh` |
| `CHAT_LINK` | 제출 성공 후 이동할 채팅 링크 | WhatsApp/카카오/텔레그램 |
| `VALUE` / `CURRENCY` | 전환 가치 / 통화 | `1.0` / `KRW` |

### 그 외 (선택)

- **리드 저장 로직** — `js/script.js` 폼 제출 핸들러의 `console.log` 자리에 Webhook/CRM `fetch()` 연동
- **도메인** — `privacy.html`, `terms.html`, `robots.txt`, `sitemap.xml`, `index.html` canonical의 `your-domain.com`
- **연락처** — `support@example.com`

## CTA 흐름 (WhatsApp/채팅 연결)

폼 제출 → 검증 통과 → 로딩 오버레이 표시 → GA4·Ads 전환 기록 → `CHAT_LINK` 로 이동.
전환 태그의 `event_callback` 으로 **전환이 기록된 뒤** 이동하며, 콜백 유실 대비 `REDIRECT_DELAY_MS`(기본 1.5초) 타임아웃 폴백이 있어 전환 유실 없이 반드시 이동합니다.

## 전환 추적 동작

폼 제출 성공 시 (`index.html` 하단 스크립트):

```js
gtag('event', 'generate_lead', { currency: 'KRW', value: 1.0 });      // GA4
gtag('event', 'conversion',    { send_to: 'AW-XXXXXXXXXX/YYYYYYYYYYYY', value: 1.0, currency: 'KRW' }); // Google Ads
```

`e.preventDefault()`로 페이지 새로고침을 막아 전환 태그 유실을 방지합니다.

## 한국 Google Ads 심사 대응 포인트

- 절대적 수익·원금 보장 표현 없음 (데이터/참고용 정보 중심)
- 폼 하단 개인정보 수집·이용 동의 고지 + 필수 체크박스
- 상시 노출 위험 고지 + 크롤링 가능한 개인정보처리방침/이용약관 실제 페이지
- 실재 서비스 정보(명칭·문의처) 표기

## 실시간 시세 자동 갱신

지수/환율 수치를 실제 값에 가깝게 자동 갱신합니다. 브라우저에서 외부 API 를
직접 호출하지 않고(키 노출·CORS·레이트리밋 회피), **서버 스크립트가 `data/market.json`
을 갱신 → 페이지는 이 JSON 만 읽는** 구조입니다.

| 파일 | 역할 |
|---|---|
| `data/market.json` | 시세 데이터 (페이지가 읽는 원본) |
| `js/market.js` | JSON 을 읽어 지수 카드·차트·타임스탬프 갱신 (로드 실패 시 HTML 예시값 유지) |
| `scripts/refresh-market.js` | Sina Finance(무료·키 불필요·중국 본토 접속 가능)에서 시세를 받아 JSON 갱신 |

수동 실행:
```bash
node scripts/refresh-market.js
```

데이터 소스는 **Yahoo Finance 우선(해외 서버·GitHub Actions 에서 동작)**,
실패 시 **Sina Finance 폴백(중국 본토 환경)** 순으로 자동 시도합니다.

### 방법 A) GitHub Actions 로 매일 자동 갱신 (권장)

`.github/workflows/update-market.yml` 이 평일 매일(KST 08:30) `market.json` 을
갱신·커밋합니다. GitHub raw 링크가 곧 "매일 자동 갱신되는 데이터 주소"입니다.

1. 이 폴더를 GitHub 저장소로 push
2. `config.js` 의 `MARKET_JSON_URL` 에 raw 링크 입력:
   `https://raw.githubusercontent.com/<사용자>/<저장소>/main/data/market.json`
3. 비워두면 배포된 로컬 `data/market.json` 을 사용합니다.

### 방법 B) 서버 crontab
```
30 8 * * 1-5  cd /경로/hanguogp && node scripts/refresh-market.js
```

> 데이터는 지연·차이가 있을 수 있으므로 페이지의 "예시 참고용" 문구는 반드시 유지하세요.

## 이미지 (Pexels)

`images/` 의 사진은 Pexels 무료 이미지입니다. 다시 받으려면:

```bash
# ★ API 키는 코드에 넣지 말고 환경변수로만 전달
PEXELS_KEY=your_key node scripts/refresh-images.js
```

- 키는 절대 커밋하지 마세요. `.gitignore` 가 `.env`/`*.key` 를 차단합니다.
- 채팅에 노출된 기존 키는 Pexels 대시보드에서 **재발급** 권장.
- 크레딧: `images/CREDITS.txt` 참고.

## 로컬 미리보기

```bash
# 정적 서버 아무거나 사용
python -m http.server 8000
# http://localhost:8000 접속
```
