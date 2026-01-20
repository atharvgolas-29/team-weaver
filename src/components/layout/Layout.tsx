import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0 overflow-x-hidden">
        <div className="min-h-screen grid-pattern">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
