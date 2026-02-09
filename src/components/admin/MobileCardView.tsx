import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileCardViewProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => ReactNode;
  renderTable: () => ReactNode;
}

export function MobileCardView<T>({ items, renderCard, renderTable }: MobileCardViewProps<T>) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-4">
            {renderCard(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return <>{renderTable()}</>;
}

export default MobileCardView;
