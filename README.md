# 서비스 이름
**멍스타그램** by 멍멍!
# 팀원 소개
팀장 : 유재현
---

김마리아 : **Front-end** (지도 파트 담당 및 UI 설계 & 구현)

유병규 : **Front-end** (산책 파트 담당 및 UI 설계 & 구현)

김현준 : **Back-end** (서버 관리(배포), 데이터베이스 설계 및 구현)

유재현 : **Back-end** (REST API 구현, 데이터베이스 설계 및 구현)

장영훈 : **Back-end** (딥러닝 모델 생성)


# 작품 개요
**Deep Learning을 이용한 동물의 감정 분석 및 반려인 전용 소셜 네트워크 서비스 앱**

멍스타그램은 하나의 앱 안에 반려견과 함께한 추억을 다양한 형태의 기록으로 남길 수 있는 소셜 네트워크 서비스 앱입니다. 

Deep Learning을 이용해서 반려견의 감정과 견종을 분석한 자동 태그와 함께 게시글을 더욱 편리하게 올릴 수 있습니다. 

GPS와 지도 API를 이용해서 날짜별 산책 경로를 기록하고, 현재 위치 주변에 반려견과 갈만한 장소를 즐겨찾기 목록에 추가할 수 있습니다. 

SNS의 소통하는 기능과 함께 사용자 간의 산책 경로와 장소 목록을 공유하면서 더욱 간편하고 유용한 반려인 위주의 기능들을 구현하였습니다.

# Front/Back-end 레포지토리
**Front-end** https://github.com/BlessDad/PetStagram


**Back-end** https://github.com/BlessDad/PetStagram_server

**Back-end** https://github.com/cy389/MobileNet

# 주요 적용 기술
개발언어 : Java, Java Script, SQL, Python


개발도구 : IntelliJ IDEA, Visual Studio Code


개발환경 : Amazon EC2, MySQL, Spring boot, React-Native, Android, iOS


주요기술 : Keras MobileNet

# 시스템 구조
![2  36조_이미지_주요 적용 기술 및 구조](https://github.com/BlessDad/PetStagram_server/assets/109721661/b81ba632-ec98-4f6d-8a1d-f9287dc7f750)

# ERD
![캡스톤 ERD (2)](https://github.com/BlessDad/PetStagram/assets/109721661/e0dd1d6a-4a0f-44a7-a549-5e3b6cd59a4d)



# 시연 화면
![3  36조_이미지_작품 소개 사진](https://github.com/BlessDad/PetStagram/assets/109721661/1b522e01-c064-4b4e-bc93-eb292c3d1db4)

# 스크린 별 주요 기능
### 홈 화면
서비스 이용자들이 작성한 게시글들 보여줌

게시글에 대한 댓글 작성 및 삭제
### 산책 화면
산책 기록

날짜 별 산책 내용 표시 (산책 시작/종료 시간, 산책 거리, 소요 칼로리, 평균 속도, 지도 산책 경로 등)

### 게시글 등록 화면
게시글 등록 (게시글 제목, 내용, 이미지, 딥러닝을 통한 태그 추천 (예상 견종 및 감정)


게시글 수정


게시글 삭제

### 지도 화면
키워드 검색을 통해 현재 위치 주변의 시설 위치 정보 제공


시설 즐겨 찾기

### MY 화면
현재 사용자의 정보 (게시글 수, 팔로워 수, 팔로잉 수, 반려견 이름 및 나이, 한 줄 소개 등) 확인

사용자가 작성한 게시글만을 모아 관리




# 기대 효과
**편의성**


하나의 앱에서 산책 기록 및 관리, 장소 검색 및 저장, SNS 서비스를 번거로움 없이 이용 가능


**반려동물 산책 이해도 증가**


날짜별로 반려동물과 함께한 산책에 대한 상세 정보가 기록되므로 세밀한 산책 조절 가능


**사용자 맞춤형**


반려견에 관련된 정보들을 공유하면서 반려인 위주의 소셜 네트워크 서비스 앱 구현

# REST API 
| Controller | Method | API URL | Description |
|------------|--------|---------|-------------|
| User       | POST   | /user/insert | 회원 추가 |
|            | PUT    | /user/update/{id} | id에 해당하는 회원 정보 수정 |
|            | GET    | /user/getUser | 모든 회원 정보 읽어오기 |
|            | GET    | /user/getUser/{user_id} | user_id에 해당하는 회원 정보 읽어오기 |
|            | DELETE | /user/deleteUser/{id} | id에 해당하는 회원 정보 삭제 |
| Post       | POST   | /api/insert/{user_id} | user_id에 해당하는 회원의 게시글 추가 |
|            | POST   | /api/upload | 이미지 업로드 |
|            | PUT    | /api/updatePost/{id} | id에 해당하는 게시글 수정 |
|            | GET    | /api/getPost | 모든 게시글 읽어오기 |
|            | GET    | /api/getPost/{id} | id에 해당하는 게시글 읽어오기 |
|            | GET    | /api/getUserNickname/{user_id} | post 테이블과 연관관계를 맺고 있는 User 테이블에서 user_id에 해당하는 user_nickname 컬럼 값을 가져오기 |
|            | DELETE | /api/deletePost/{id} | id에 해당하는 게시글 삭제 |
| Comment    | POST   | /comment/insert/{post_id} | post_id에 해당하는 게시글에 대한 댓글 추가 |
|            | PUT    | /comment/updateComment/{id} | id에 해당하는 댓글 수정 |
|            | GET    | /comment/getComment/{post_id} | post_id에 해당하는 게시글에 대한 모든 댓글 정보 읽어오기 |
|            | DELETE | /comment/deleteComment/{id} | id에 해당하는 댓글 삭제 |
| Tag        | POST   | /tag/insert/{post_id} | post_id에 해당하는 게시글에 대한 태그 추가 |
|            | PUT    | /tag/updateTag/{id} | id에 해당하는 태그 수정 |
|            | GET    | /tag/getTag/{post_id} | post_id에 해당하는 게시글에 대한 태그 정보 읽어오기 |
|            | DELETE | /tag/delete/Tag/{id} | id에 해당하는 태그 삭제 |
| Walking    | POST   | /walking/insert/{user_id} | user_id에 해당하는 회원에 대한 산책 정보 저장 |
|            | PUT    | /walking/updateWalking/{id} | id에 해당하는 산책 정보 수정 |
|            | GET    | /walking/getWalking | 모든 산책 정보 읽어오기 |
|            | GET    | /walking/getWalking/between | 산책 시작 시간이 특정 시간 대 사이를 만족하는 산책 정보만 읽어오기 |
|            | DELETE | /walking/deleteWalking/{id} | id에 해당하는 산책 정보 삭제 |
| Bookmark   | POST   | /bookmark/insert/{user_id} | user_id에 해당하는 회원이 즐겨찾기 한 장소 DB에 추가 |
|            | GET    | /bookmark/getBookmark/{user_id} | user_id에 해당하는 회원이 즐겨찾기 한 장소 목록 가져오기 |
|            | DELETE | /bookmark/delete/{bookmark_id} | bookmark_id에 해당하는 즐겨찾기 장소를 DB에서 삭제 |



