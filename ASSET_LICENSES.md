# 외부 자산과 라이선스

## 실제 사진

Unsplash 공개 이미지 17장을 다운로드해 로컬에 포함했습니다. 원본 식별자와 URL은 `docs/photo-sources.json`에 기록했습니다. CDN은 실행 중 호출되지 않습니다. 이미지별 표시 크기를 고려해 다운로드 시 리사이즈·크롭·JPEG 압축했으며 CSS `object-fit`으로 표시합니다.

[Unsplash License](https://unsplash.com/license)는 사진의 다운로드와 개인·상업적 사용 및 배포를 허용합니다. 수정 없는 사진 판매나 경쟁 이미지 서비스 구축에는 제한이 있습니다. 이 프로젝트는 기관 소개를 위한 채용 과제 시연물입니다. 사진 속 동물이 실제 기관의 보호동물이거나 기관과 관련되어 있음을 뜻하지 않습니다. 원작자 표시는 필수 요건이 아니나, 원본 확인을 위해 이미지 식별자를 보존했습니다. 라이선스 확인일: 2026.11.03.

## 폰트

[orioncactus/Pretendard](https://github.com/orioncactus/pretendard)의 Pretendard Variable을 사용했습니다. 라이선스는 **SIL Open Font License 1.1**이며 저작권과 전문은 `assets/fonts/OFL.txt`에 포함했습니다. 원본 글꼴 파일은 실행에 필요한 글자의 서브셋 WOFF2로 가공했습니다. 폰트가 로드되지 않거나 새 글자가 추가되는 경우 SUIT·시스템 sans-serif로 대체됩니다. 새로운 본문을 추가할 때는 서브셋 글자 범위를 함께 갱신하거나 전체 폰트를 사용해야 합니다.

### 서술용 명조체

[Google Fonts / Nanum Myeongjo](https://github.com/google/fonts/tree/main/ofl/nanummyeongjo)의 Regular 글꼴을 서브셋했습니다. 저작권은 NHN Corporation에 있으며 SIL OFL 1.1 전문을 `assets/fonts/NanumMyeongjo-OFL.txt`에 포함했습니다. 파생 글꼴의 예약 이름 제한을 지키기 위해 패밀리·전체 이름·PostScript 이름을 **Care Myeongjo**로 변경했습니다. 원본 출처와 저작권 고지는 보존했습니다. 새 카피를 추가할 때는 본문·서술용 두 서브셋의 글자 범위를 갱신해야 합니다.

## 직접 작성 자산

favicon, 선형 심벌, 권역 위치 개념도, CSS, 페이지 카피와 인터랙션은 이 시안을 위해 작성했습니다. 브랜드명·사업장 정보는 공식 자료를 참고했으며, 선형 심벌은 기관의 공식 상표나 확정된 리브랜딩 결과가 아닙니다.

## 실행 라이브러리

외부 JavaScript/CSS 라이브러리, CDN, API, 프레임워크가 없습니다. 운영 사이트의 소스 코드·로고 이미지·보호동물 사진은 복사하지 않았습니다.
