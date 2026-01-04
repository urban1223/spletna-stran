import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="relative flex flex-col min-h-screen"> 
      
      {/* 1. OZADNA SLIKA: Ostra (brez blur razreda) */}
      <div className="fixed inset-0 overflow-hidden z-0">
        <img 
          src="/images/ozadje.jpg" 
          alt="Globalno ozadje" 
          className="w-full h-full object-cover" 
          style={{ position: 'fixed', top: 0, left: 0 }} 
        />
      </div>
      
      {/* 2. ZATEMNITVENI SLOJ (opacity-85 -> Tailwind compatible: 0.85) */}
      <div className="fixed inset-0 bg-black opacity-[0.85] z-0"></div>
      
      {/* 3. GLAVNA VSEBINA APLIKACIJE - z-10 za vidnost nad ozadjem */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
      
    </div>
  );
};

export default MainLayout;
