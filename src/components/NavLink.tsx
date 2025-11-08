import { Link, useLocation, LinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps extends Omit<LinkProps, "className"> {
  to: string;
  className?: string;
  activeClassName?: string;
  end?: boolean;
  children: React.ReactNode;
}

export function NavLink({
  to,
  className,
  activeClassName = "bg-muted text-primary font-medium",
  end = false,
  children,
  ...props
}: NavLinkProps) {
  const location = useLocation();
  const isActive = end
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={cn(className, isActive && activeClassName)}
      {...props}
    >
      {children}
    </Link>
  );
}
