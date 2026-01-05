import { ReactNode } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
  hideNav?: boolean;
}

const AppLayout = ({ children, hideHeader = false, hideNav = false }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hideHeader && <Header />}
      
      <main className={`flex-1 ${!hideNav ? 'pb-24' : ''}`}>
        {children}
      </main>
      
      {!hideNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;
