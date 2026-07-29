import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface SidebarGroup {
  label: string;
  items: { id: string; title: string; disabled?: boolean }[];
}

export function Sidebar({ groups }: { groups: SidebarGroup[] }) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const ids = groups.flatMap((g) => g.items.map((i) => i.id));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [groups]);

  return (
    <nav className="scrollbar-none sticky top-24 flex max-h-[calc(100svh-7rem)] flex-col gap-6 overflow-y-auto pr-2">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-xs font-medium tracking-wide text-ink-faint uppercase">{group.label}</p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  item.disabled ? "text-ink-faint/50" : active === item.id ? "bg-violet-500/10 text-violet-300" : "text-ink-muted hover:bg-white/5 hover:text-ink",
                )}
              >
                {item.title}
              </a>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
