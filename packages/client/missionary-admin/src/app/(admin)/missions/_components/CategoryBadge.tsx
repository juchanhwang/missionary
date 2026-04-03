import { Badge } from '@samilhero/design-system';

type MissionCategory = 'DOMESTIC' | 'ABROAD';

interface CategoryBadgeProps {
  category: MissionCategory;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <Badge variant="outline">{category === 'ABROAD' ? '해외' : '국내'}</Badge>
  );
}
