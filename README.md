## 피부 AI 분석 및 관리 앱 (Skin AI Analysis & Management App)
이 프로젝트는 AI 분석을 통해 사용자의 피부 상태를 진단하고, 그 결과를 바탕으로 개인적인 피부 관리 기록(스킨 노트)을 남길 수 있도록 돕는 웹 애플리케이션입니다.

## <주요 기능>
AI 피부 진단: 사용자가 업로드한 사진과 입력 정보를 바탕으로 백엔드 API를 통해 피부 상태를 분석하고 진단 결과를 제공합니다.

스킨 노트 작성/저장: 진단 결과와 함께 사용자가 직접 관리 기록, 사용 제품, 특이 사항 등을 기록할 수 있습니다.

스킨 노트 기록 관리: 작성된 모든 스킨 노트를 날짜별로 조회하고, 원하지 않는 기록을 개별적으로 삭제할 수 있습니다.

비교 분석: 가장 최근 진단 결과와 과거의 스킨 노트 기록을 한눈에 비교할 수 있는 기능을 제공합니다.

사용자 정보 표시: 현재 사용자 ID와 IP 주소를 모달로 표시하여 디버깅 및 사용자 식별에 도움을 줍니다.

사용자 정보 저장 등의 기능은 로컬 저장소를 사용합니다.

## <기술 스택>
프론트엔드,"React (Hooks: useState, useEffect)",단일 페이지 애플리케이션(SPA) 구현

상태 관리,React Local State,"skinNotes, result, page 등"

로컬 저장소,Web Storage (localStorage),스킨 노트 기록 저장 및 관리

API 통신,Fetch API,백엔드 AI 분석 API와 통신

스타일링,"Pure CSS (App.css), Inline Style",

## <파일 구조 및 컴포넌트>
모든 기능은 단일 파일인 App.js 내에서 컴포넌트 단위로 관리되고 있습니다.

startDiagnosis,백엔드 AI 분석 API 요청 처리 (핵심 비즈니스 로직)

loadSkinNotes,Local Storage에서 스킨 노트 로드

saveSkinNote,Local Storage에 스킨 노트 저장

deleteSkinNote,Local Storage에서 특정 스킨 노트 삭제 (New)

App (Function),"메인 애플리케이션 로직, 상태 관리, 라우팅 담당"

HomePage,메인 진단 페이지

DiagnosisResultPage,AI 진단 결과 표시 페이지

SkinNoteHistoryPage,스킨 노트 기록 목록 및 삭제 기능 (Modified)

SkinNotePage,새로운 스킨 노트 작성 페이지

ContrastPage,과거 기록 비교 분석 페이지

UserInfoModal,사용자 ID/IP 표시 모달

DeleteConfirmModal,기록 삭제 확인 모달 (New)

## <주요 업데이트 및 변경 사항>
1. 스킨 노트 기록 삭제 기능 추가
deleteSkinNote 유틸리티 함수 추가 (Local Storage에서 특정 기록 제거).

App 컴포넌트에 handleNoteDelete 함수 추가 및 skinNotes 상태 업데이트 로직 구현.

DeleteConfirmModal 컴포넌트 추가 (사용자에게 삭제를 확인받는 모달).

SkinNoteHistoryPage 컴포넌트 수정:

삭제 버튼(✕) 추가. (구현 안되어있을 수도 있음.)

모달 상태 관리 (showDeleteModal, noteToDelete).

삭제 핸들러 (handleDeleteClick, handleConfirmDelete) 구현.

2. AI 분석 API 통합 개선
백엔드 API 호출 시 사용자의 성별(gender)을 API 요구 형식(남성/여성)에 맞게 변환하여 전송합니다.

진단 결과(result)를 SkinNotePage와 ContrastPage 컴포넌트에 prop으로 전달하여, 노트 저장 시 진단 결과도 함께 저장되고 비교 기능에 활용될 수 있도록 개선되었습니다.

## <설치 및 실행 방법>

프로젝트 파일을 다운로드합니다.

필요한 의존성(React)을 설치합니다. (CRA 등으로 시작된 프로젝트 가정)

1.
bash
## Node.js가 설치되어 있어야 합니다.
npm install 
---------------
yarn install

2.
bash
npm start
---------------
npm run start
---------------
yarn start


3. 브라우저에서 지정된 주소(일반적으로 http://localhost:3000)로 접속합니다.


## 프론트엔드 서버 실행 후 진단 결과가 뜨지않는 경우(N/A 또는 진단결과없음 시), 백엔드 서버가 열려있는지 확인해야합니다.
## 그 외의 문제는 F12 콘솔 확인
