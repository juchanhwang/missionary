---
name: client-component-architecture
description: React 컴포넌트 아키텍처 가이드라인을 제공한다. Page는 레이아웃 셸(Compositor), 자식은 자기 완결적(Self-Contained) Feature 컴포넌트, Hook은 로직 추상화 레이어로 구성하는 3계층 구조를 따른다. 페이지/컴포넌트 설계, 책임 분리, 코드 리뷰 시 사용한다.
---

## Compositional Page Architecture

Page를 레이아웃 셸(Compositor)로, 자식을 자기 완결적(Self-Contained) Feature 컴포넌트로 구성하는 3계층 아키텍처.

> 핵심 원리: Page는 "무엇을 배치할지"만 결정하고, 각 Feature 컴포넌트가 "어떻게 동작할지"를 스스로 소유한다.

### 3계층 구조

| 레이어 | 역할 | 규칙 |
|--------|------|------|
| **Page (Compositor)** | 레이아웃 셸, Suspense/ErrorBoundary 경계 | 데이터 패칭·상태·비즈니스 로직 금지 |
| **Feature Component** | 자기 완결적 UI 단위 | Hook을 통해 자체 데이터·상태·액션 소유 |
| **Hook Layer** | 로직 추상화 | `useGet*` (읽기), `use*` (상태), `use*Action` (쓰기) |

---

### 1. Page는 Compositor다

Page 컴포넌트는 레이아웃 구조와 비동기 경계만 정의한다. 데이터 패칭, 상태 관리, 이벤트 핸들러를 직접 갖지 않는다.

```tsx
// ❌ BAD: Page가 데이터 패칭과 상태를 직접 관리
function MenuPage() {
  const { data: categories } = useSuspenseQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: items } = useSuspenseQuery({
    queryKey: ['items', selectedCategory],
    queryFn: () => fetchItems(selectedCategory),
  });

  return (
    <>
      <Top title="커피 사일로" />
      <Tab
        categories={categories}
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />
      <ItemList items={items} />
      <CartCTA />
    </>
  );
}
```

```tsx
// ✅ GOOD: Page는 레이아웃만, 각 자식이 자기 데이터를 소유
function MenuPage() {
  return (
    <>
      <Top title="커피 사일로" />
      <Suspense>
        <TabNavigation />
      </Suspense>
      <Suspense>
        <CatalogItemList />
      </Suspense>
      <CartCTA />
    </>
  );
}
```

> 판단 기준: Page에서 `useState`, `useSuspenseQuery`, 이벤트 핸들러가 보이면 Feature 컴포넌트로 위임을 검토한다.

**예외**: 다음 경우 Page에 로직을 직접 둘 수 있다.

1. **자식이 하나뿐일 때** — 분리하면 Page가 의미 없는 패스스루가 된다.
2. **데이터와 렌더링이 1:1 결합일 때** — 하나의 API 응답으로 하나의 UI만 그리는 경우.

> 판단 기준: 페이지 내에 **독립적인 관심사가 2개 이상**이면 분리한다. 1개뿐이면 Page에 직접 작성해도 된다.

---

### 2. Feature 컴포넌트는 자기 완결적이다

각 Feature 컴포넌트는 Hook을 통해 필요한 데이터, 상태, 액션을 직접 소유한다. 부모로부터 데이터를 props로 받지 않는다.

```tsx
// ❌ BAD: 부모가 데이터를 패칭하여 props로 전달
function MenuPage() {
  const { data: categories } = useGetCategories();
  return <TabNavigation categories={categories} />;
}

function TabNavigation({ categories }: { categories: Category[] }) {
  return <Tab>{categories.map(...)}</Tab>;
}
```

```tsx
// ✅ GOOD: Feature 컴포넌트가 자체 Hook으로 데이터 소유
function TabNavigation() {
  const { data: categories } = useGetCategories();
  const { selectedCategory, handleCategoryChange } = useCategorySearchParam();

  return (
    <Tab>
      {categories.map((category) => (
        <Tab.Item
          key={category.id}
          selected={category.id === selectedCategory}
          onClick={() => handleCategoryChange(category.id)}
        />
      ))}
    </Tab>
  );
}
```

> 판단 기준: Feature 컴포넌트가 자신의 데이터를 Hook으로 직접 가져오면 **독립적으로 테스트·이동·삭제**할 수 있다. props 의존이 많아지면 자기 완결성을 검토한다.

---

### 3. Hook은 역할별로 분리한다

하나의 Hook이 데이터 패칭 + 상태 관리 + 사이드 이펙트를 모두 담당하지 않는다.

```tsx
// ❌ BAD: 한 Hook이 모든 역할을 담당
function useDetail(itemId: string) {
  const { data: item } = useSuspenseQuery({ ... });
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const totalPrice = useMemo(() => ..., [item, quantity, selectedOptions]);
  const handleAddToCart = () => { ... };

  return { item, quantity, setQuantity, selectedOptions, setSelectedOptions, totalPrice, handleAddToCart };
}
```

```tsx
// ✅ GOOD: 역할별로 Hook 분리
// hooks/useGetItemDetail.ts — 데이터 패칭
const useGetItemDetail = (itemId: string) =>
  useSuspenseQuery({ queryKey: ['item', itemId], queryFn: () => fetchItem(itemId) });

// hooks/useItemQuantity.ts — 상태 관리
const useItemQuantity = () => {
  const [quantity, setQuantity] = useState(1);
  return { quantity, setQuantity };
};

// hooks/useAddToCartAction.ts — 사이드 이펙트
const useAddToCartAction = () => {
  const handleAddToCart = () => { ... };
  return { handleAddToCart };
};
```

| 접두사 | 역할 | 예시 |
|--------|------|------|
| `useGet*` | 데이터 패칭 (읽기) | `useGetCategories`, `useGetItemDetail` |
| `use*` | UI 상태 관리 | `useItemQuantity`, `useSelectedOptions` |
| `use*Action` | 사이드 이펙트 (쓰기) | `useAddToCartAction`, `useCartOrder` |

> 판단 기준: Hook의 반환값 중 서로 다른 역할의 값이 섞여 있으면 (data + setState + handler) 분리를 검토한다.

---

### 4. Suspense 경계는 Feature 컴포넌트 단위로 건다

독립적인 Feature 컴포넌트마다 Suspense 경계를 배치하여, 한 컴포넌트의 로딩이 다른 컴포넌트를 블로킹하지 않게 한다.

```tsx
// ❌ BAD: 전체를 하나의 Suspense로 감싸 모든 자식이 블로킹됨
function MenuPage() {
  return (
    <Suspense>
      <TabNavigation />
      <CatalogItemList />
      <CartCTA />
    </Suspense>
  );
}
```

```tsx
// ✅ GOOD: 데이터 패칭하는 Feature 컴포넌트 단위로 Suspense 분리
function MenuPage() {
  return (
    <>
      <Top title="커피 사일로" />
      <Suspense>
        <TabNavigation />
      </Suspense>
      <Suspense>
        <CatalogItemList />
      </Suspense>
      <CartCTA /> {/* 데이터 패칭 없음 — Suspense 불필요 */}
    </>
  );
}
```

> 판단 기준: `useGet*` Hook을 사용하는 Feature 컴포넌트는 각각 독립 Suspense로 감싼다. 데이터 패칭이 없는 컴포넌트는 Suspense 불필요.

---

### 체크리스트

- [ ] Page 컴포넌트에 `useState`, `useSuspenseQuery`, 이벤트 핸들러가 없는가?
- [ ] 각 Feature 컴포넌트가 자체 Hook으로 데이터를 소유하는가?
- [ ] Hook이 역할별로 분리되어 있는가? (`useGet*` / `use*` / `use*Action`)
- [ ] 데이터 패칭하는 Feature 컴포넌트마다 독립 Suspense 경계가 있는가?
- [ ] 독립적인 관심사가 2개 이상이면 컴포넌트가 분리되어 있는가?
