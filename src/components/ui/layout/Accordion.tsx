import React, { useState } from "react";
import { cn } from "../../../lib/utils";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpenId,
  className,
}) => {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId || items[0]?.id || null);

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden transition-colors">
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-foreground hover:bg-white/5 transition-colors"
            >
              <span>{item.title}</span>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
            </button>
            {isOpen && <div className="p-4 pt-2 border-t border-white/5 text-xs text-muted-foreground">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
};
