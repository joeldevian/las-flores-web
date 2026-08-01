import { useState, useEffect } from 'react';
import { Menu, X, Facebook, Instagram } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function SiteNavigationMenu({ isScrolled, isAlwaysDark = false }: { isScrolled: boolean, isAlwaysDark?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const textColor = isAlwaysDark ? "text-ink" : (isScrolled ? "text-ink" : "text-cream");

  return (
    <>
      {/* Hamburger Icon */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center p-2 rounded-md hover:bg-black/10 transition-colors pointer-events-auto"
        aria-label="Menú principal"
      >
        <Menu size={32} className={textColor} />
      </button>

      {/* Full Screen Overlay Menu */}
      <div 
        className={`fixed inset-0 z-[100] bg-[#F9F9F9] transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Close Button */}
        <div className="flex justify-end p-6 md:p-10">
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 border border-gray-400 text-gray-800 hover:bg-gray-200 transition-colors pointer-events-auto rounded-sm"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Links */}
        <div className="flex-1 flex flex-col items-start justify-center gap-8 md:gap-10 px-12 md:px-24">
          <Link to="/" onClick={() => setIsOpen(false)} className="font-sans text-2xl md:text-4xl tracking-[0.15em] text-gray-700 hover:text-[#5F8575] transition-colors font-light">INICIO</Link>
          <Link to="/restaurante" onClick={() => setIsOpen(false)} className="font-sans text-2xl md:text-4xl tracking-[0.15em] text-gray-700 hover:text-[#5F8575] transition-colors font-light">NUESTRO RESTAURANTE</Link>
          <Link to="/carta" onClick={() => setIsOpen(false)} className="font-sans text-2xl md:text-4xl tracking-[0.15em] text-gray-700 hover:text-[#5F8575] transition-colors font-light">LA CARTA</Link>
          <Link to="/eventos" onClick={() => setIsOpen(false)} className="font-sans text-2xl md:text-4xl tracking-[0.15em] text-gray-700 hover:text-[#5F8575] transition-colors font-light">EVENTOS</Link>
        </div>

        {/* Footer Info */}
        <div className="pb-10 pt-8 flex flex-col items-end gap-3 mx-12 md:mx-24 text-right">
          <a href="mailto:informes@lasflores.pe" className="text-sm md:text-base text-gray-600 font-light tracking-wide hover:text-[#5F8575] transition-colors">
            informes@lasflores.pe
          </a>
          <p className="text-sm md:text-base text-gray-600 font-light tracking-wide">
            +51 941 663 265
          </p>
          <div className="flex gap-5 mt-2 justify-end">
            <a href="#" className="text-gray-800 hover:text-[#5F8575] transition-colors"><Facebook size={20} /></a>
            <a href="#" className="text-gray-800 hover:text-[#5F8575] transition-colors"><Instagram size={20} /></a>
          </div>
        </div>
      </div>
    </>
  );
}
