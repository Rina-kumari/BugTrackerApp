import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useLocation, useNavigate, useSearchParams } from "react-router";

interface SidebarNavProps extends React.HtmlHTMLAttributes<HTMLElement> {
  items: {
    title: string;
    href: string;
    icon: LucideIcon;
    preserveProject?: boolean;
  }[];
  isCollapsed: boolean;
  className?: string;
}

export const SidebarNav = ({
  items,
  isCollapsed,
  className,
  ...props
}: SidebarNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const projectId = searchParams.get("projectId");

  return (
    <nav className={cn("flex flex-col gap-y-2", className)} {...props}>
      {items.map((el) => {
        const Icon = el.icon;

        const isActive = el.preserveProject
          ? location.pathname === el.href && projectId != null
          : location.pathname === el.href;

        const handleClick = () => {
          if (el.preserveProject && projectId) {
            
            navigate(`${el.href}?projectId=${projectId}`);
          } else {
            
            navigate(el.href);
          }
        };

        return (
          <Button
            key={el.href}
            variant={isActive ? "outline" : "ghost"}
            className={cn(
              "justify-start",
              isActive && "bg-blue-800/20 text-blue-600 font-medium"
            )}
            onClick={handleClick}
          >
            <Icon className="mr-2 size-4" />
            {isCollapsed ? (
              <span className="sr-only">{el.title}</span>
            ) : (
              el.title
            )}
          </Button>
        );
      })}
    </nav>
  );
};