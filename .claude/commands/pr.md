PR을 생성해줘. 인자가 있으면 base 브랜치로 사용한다. $ARGUMENTS

## 절차

1. `git rev-parse --abbrev-ref HEAD`로 현재 브랜치를 확인한다.
2. base 브랜치를 결정한다:
   - 인자가 주어지면 해당 브랜치를 base로 사용한다.
   - 인자가 없으면 `main`을 base로 사용한다.
3. `git log --oneline <base>..HEAD`로 포함될 커밋 목록을 확인한다.
4. `git diff <base>...HEAD --stat`으로 변경된 파일 요약을 확인한다.
5. `git diff <base>...HEAD`로 전체 diff를 분석한다.
6. 커밋 메시지와 diff를 기반으로 PR 제목과 본문을 작성한다.
7. `gh pr create --base <base> --head <현재브랜치>` 명령으로 PR을 생성한다.
8. PR 생성 후 URL을 출력한다.

## PR 제목 규칙

- 70자 이내로 간결하게 작성한다.
- 브랜치명에서 type을 추출한다 (예: `feat/login` → `feat`, `fix/auth-bug` → `fix`).
- 형식: `type: 한글 설명`

## PR 본문 형식

```markdown
## 배경
이 변경이 필요한 이유를 1-2문장으로 설명한다.

## 주요 기능
변경 사항을 카테고리별 bullet point로 정리한다.
- **카테고리명**: 변경 내용
- **카테고리명**: 변경 내용

## 사용 예시
코드 예시, 스크린샷 설명, 또는 동작 설명을 포함한다.
```tsx
// 해당되는 경우 코드 예시
```

## 기타
- 리뷰어가 알아야 할 추가 맥락이 있으면 작성한다.
- 없으면 이 섹션 생략.
```

## 규칙

- 본문은 한국어로 작성한다.
- remote에 push되지 않은 커밋이 있으면 먼저 push한다.
- 현재 브랜치가 `main`이면 PR을 생성하지 않고 경고한다.
