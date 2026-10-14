import type { ReactNode } from "react";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "./sidebar";

interface TopBarProps {
  school: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  children?: ReactNode;
}

export function TopBar({
  school,
  sidebarOpen,
  onToggleSidebar,
  children,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-2 px-3 sm:px-4">
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={onToggleSidebar}
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          title="Toggle sidebar (Ctrl+B)"
          className="hidden rounded-xl text-muted-foreground lg:inline-flex"
        >
          {sidebarOpen ? <PanelLeftCloseIcon /> : <PanelLeftOpenIcon />}
        </Button>
        <Brand school={school} />
        <div className="ml-auto flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}
