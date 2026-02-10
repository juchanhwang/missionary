---
name: client-code-quality
description: 프론트엔드 코드 품질 가이드라인을 제공한다. 가독성, 예측 가능성, 응집도, 결합도 4가지 원칙과 Before/After 코드 예시를 포함한다. 복잡한 UI 로직 작성·리팩토링, 코드 리뷰 시 사용한다.
---

## Code Quality Rules (최우선 적용)

> 출처: https://frontend-fundamentals.com/code-quality/code/
> 코드 작성 시 아래 규칙을 최우선으로 따른다. 좋은 코드란 "변경하기 쉬운 코드"이다.

### 1. 가독성 (Readability)

읽는 사람이 한 번에 고려하는 맥락을 최소화하고, 위에서 아래로 자연스럽게 읽히도록 작성한다.

**맥락 줄이기:**

**같이 실행되지 않는 코드 분리**: 권한이나 상태에 따른 분기를 컴포넌트 단위로 분리한다.

```tsx
// ❌ BAD
const SubmitButton = ({ isViewer }) => {
  if (isViewer) return <button>조회 전용</button>;
  return <button>제출하기</button>;
};
```

```tsx
// ✅ GOOD
const ViewerSubmitButton = () => <button>조회 전용</button>;
const AdminSubmitButton = () => <button>제출하기</button>;
```

> 판단 기준: 동시에 실행되지 않는 코드가 한 곳에 있으면 분리하여 인지 부하를 줄인다.

**구현 상세 추상화**: 비즈니스 로직과 무관한 횡단 관심사(인증, 로깅 등)는 별도 레이어로 분리한다.

```tsx
// ❌ BAD
const MissionPage = () => {
  const { isLogin } = useAuth();
  if (!isLogin) return <LoginRedirect />;
  return <MissionList />;
};
```

```tsx
// ✅ GOOD
const MissionPage = () => (
  <AuthGuard>
    <MissionList />
  </AuthGuard>
);
```

> 판단 기준: 구현 상세를 추상화하여 컴포넌트가 본연의 비즈니스 로직에만 집중하게 한다.

**데이터 패칭을 Hook으로 분리**: 컴포넌트는 "무엇을" 가져오는지만 알면 된다. "어떻게" 가져오는지(queryKey, queryFn, 캐시 전략 등)는 데이터 패칭의 구현 상세이므로 별도 Hook으로 분리한다.

```tsx
// ❌ BAD: 컴포넌트가 데이터 패칭의 구현 상세를 알고 있음
function TabNavigation() {
  const { data: categories } = useSuspenseQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
  return <Tab>{categories.map(...)}</Tab>;
}
```

```tsx
// ✅ GOOD: 컴포넌트는 "카테고리가 필요하다"만 표현
function TabNavigation() {
  const { data: categories } = useGetCategories();
  return <Tab>{categories.map(...)}</Tab>;
}
```

> 판단 기준: 데이터 패칭은 횡단 관심사다. queryKey, queryFn, staleTime 등의 설정은 컴포넌트의 관심사가 아니므로 Hook으로 추상화하여 관심사를 분리하고, 테스트 시 자연스러운 mock 경계를 제공한다.

**로직 종류에 따라 함수 쪼개기**: 하나의 Hook이나 함수가 너무 많은 책임이나 상태를 가지지 않게 한다.

```tsx
// ❌ BAD
const usePageState = () => {
  const cardId = useQueryParam('cardId');
  const date = useQueryParam('date');
  return { cardId, date };
};
```

```tsx
// ✅ GOOD
const useCardIdQueryParam = () => useQueryParam('cardId');
const useDateRangeQueryParam = () => useQueryParam('date');
```

> 판단 기준: 한 Hook이 담당하는 책임이 무제한적으로 늘어날 가능성이 있으면 도메인별로 분리한다.

**이름 붙이기:**

**복잡한 조건에 이름 붙이기**: 논리 연산이 복잡한 경우 의미 있는 변수명으로 추출한다.

```tsx
// ❌ BAD
if (user.age > 19 && user.hasLicense && !user.isBanned) { ... }
```

```tsx
// ✅ GOOD
const canDrive = user.age > 19 && user.hasLicense && !user.isBanned;
if (canDrive) { ... }
```

> 판단 기준: 조건식이 여러 단계로 중첩되거나 비즈니스적 의미가 있다면 이름을 부여한다.

**매직 넘버에 이름 붙이기**: 의미를 알 수 없는 숫자 리터럴 대신 명명된 상수를 사용한다.

```tsx
// ❌ BAD
setTimeout(handleClose, 300);
```

```tsx
// ✅ GOOD
const MODAL_CLOSE_DELAY_MS = 300;
setTimeout(handleClose, MODAL_CLOSE_DELAY_MS);
```

> 판단 기준: 숫자의 의미가 즉각적으로 이해되지 않거나 여러 곳에서 사용되면 상수로 추출한다.

**위에서 아래로 읽히게:**

**시점 이동 줄이기**: 코드를 읽을 때 다른 파일이나 함수를 오가는 횟수를 최소화한다.

> 판단 기준: 함께 수정되거나 밀접한 로직은 최대한 가까이 배치하여 시점 이동을 방지한다.

**삼항 연산자 단순하게 하기**: 복잡하거나 중첩된 삼항 연산자는 if/early return으로 변경한다.

```tsx
// ❌ BAD
return isLogin ? isAdmin ? <Admin /> : <User /> : <Guest />;
```

```tsx
// ✅ GOOD
if (!isLogin) return <Guest />;
return isAdmin ? <Admin /> : <User />;
```

> 판단 기준: 삼항 연산자가 2개 이상 중첩되거나 가독성을 해치면 if 문으로 명확히 표현한다.

**왼쪽에서 오른쪽으로 읽히게 하기**: 범위 비교 시 숫자의 크기 순서대로 작성한다.

```tsx
// ❌ BAD
if (score >= 80 && score <= 100)
```

```tsx
// ✅ GOOD
if (80 <= score && score <= 100)
```

> 판단 기준: 범위 비교는 수학 부등식처럼 `최솟값 <= 변수 <= 최댓값` 순으로 작성한다.

### 2. 예측 가능성 (Predictability)

함수/컴포넌트의 이름, 파라미터, 반환값만 보고 동작을 예측할 수 있어야 한다.

**이름 겹치지 않게 관리**: 같은 이름은 같은 동작을 해야 하며, 다른 동작은 다른 이름을 붙인다.

> 판단 기준: 전역적으로 사용되는 명칭은 일관성을 유지하고, 특수 동작(인증 포함 등)은 명확한 이름을 사용한다.

**반환 타입 통일**: 동일한 성격의 함수들은 일관된 데이터 구조를 반환한다.

```tsx
// ❌ BAD: 함수마다 반환 형식이 제각각
const useUser = () => ({ user, loading });
const usePosts = () => [posts, isLoading];
```

```tsx
// ✅ GOOD: 반환 형식을 Query 객체 형태로 통일
const useUser = () => ({ data: user, isLoading });
const usePosts = () => ({ data: posts, isLoading });
```

> 판단 기준: 동일 범주의 함수(API Hook 등)는 반환 타입을 통일하여 사용하는 쪽의 예측을 돕는다.

**숨은 로직 드러내기**: 함수 내부에서 예측할 수 없는 부수 효과를 실행하지 않는다.

```tsx
// ❌ BAD
const fetchBalance = () => {
  const data = api.get('/balance');
  logging.log('잔액 조회'); // 숨은 부수 효과
  return data;
};
```

```tsx
// ✅ GOOD
const balance = fetchBalance();
logging.log('잔액 조회'); // 호출부에서 명시적으로 처리
```

> 판단 기준: 함수 이름이나 파라미터로 예측할 수 없는 로직(로깅, 전역 상태 변경 등)은 분리한다.

### 3. 응집도 (Cohesion)

함께 수정되는 코드는 함께 위치시킨다.

**매직 넘버 없애기**: 응집도 관점에서 함께 변경되어야 하는 값들을 모아서 관리한다.

```tsx
// ❌ BAD: 동일한 의미의 값이 여러 곳에 흩어져 있음
// componentA.tsx: const TAX = 0.1;
// componentB.tsx: const VAT = 0.1;
```

```tsx
// ✅ GOOD: 한 곳에서 관리하여 동시 수정 보장
// constants.ts: export const TAX_RATE = 0.1;
```

> 판단 기준: 동일한 의미를 가진 상수들이 여러 파일에 흩어져 있다면 한 곳으로 모아 응집도를 높인다.

**폼의 응집도 생각하기**: 필드 간 의존성 여부에 따라 관리 단위를 결정한다.

> 판단 기준: 필드 A가 B에 의존하면 폼 전체 단위로, 각 필드가 독립적이면 필드 단위로 관리한다.

**디렉토리 배치**: 함께 수정되는 파일은 같은 디렉토리에 둔다.

> 상세: 아래 Frontend App Pattern 참조

### 4. 결합도 (Coupling)

코드 수정 시 영향 범위를 최소화한다.

**책임을 하나씩 관리**: 하나의 Hook이나 함수가 하나의 역할만 담당하게 한다.

```tsx
// ❌ BAD: 한 Hook이 UI 상태와 데이터 조회를 모두 담당
const useUserMenu = () => {
  const [open, setOpen] = useState(false);
  const user = fetchUser();
  return { open, setOpen, user };
};
```

```tsx
// ✅ GOOD: 역할에 따라 Hook 분리
const { isOpen, toggle } = useDisclosure();
const { user } = useUser();
```

> 판단 기준: 하나의 Hook이 너무 많은 역할을 하면 수정 시 영향 범위가 넓어져 결합도가 높아진다.

**중복 코드 허용하기**: 성급한 공통화보다 변경 가능성을 고려하여 중복을 허용한다.

```tsx
// ❌ BAD: 여러 페이지의 미묘하게 다른 로직을 하나로 통합
const useCommonModal = () => {
  /* 복잡한 조건 분기 가득 */
};
```

```tsx
// ✅ GOOD: 페이지마다 요구사항이 다를 여지가 있으면 각각 작성
const useMissionModal = () => { ... };
const useAdminModal = () => { ... };
```

> 판단 기준: 공통화된 코드를 수정할 때 의존하는 모든 코드를 일일이 확인해야 한다면 중복을 허용한다.

**Props Drilling 지우기**: 컴포넌트 깊이가 깊어지면 결합도를 낮추기 위해 패턴을 적용한다.

```tsx
// ❌ BAD: 중간 컴포넌트들이 불필요한 props를 전달
<Child user={user} /> // Child는 user를 사용하지 않음
```

```tsx
// ✅ GOOD: Composition 패턴으로 Drilling 제거
<Child>
  <UserAvatar user={user} />
</Child>
```

> 판단 기준: 컴포넌트 깊이가 깊어지면 Props Drilling 대신 조합(Composition)을 우선 시도한다.

### 원칙 간 충돌 해결

**가독성 vs 응집도**: 함께 수정하지 않으면 오류가 발생할 수 있는 경우 응집도를 우선한다. 위험성이 낮으면 가독성을 우선하여 코드 중복을 허용한다.

**응집도 vs 결합도**: 모듈 내 응집도를 높이는 과정에서 외부와의 결합도가 과하게 높아진다면, 인터페이스를 추상화하거나 책임을 재배치하여 균형을 잡는다.
