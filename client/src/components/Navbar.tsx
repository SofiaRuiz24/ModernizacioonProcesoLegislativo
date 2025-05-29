import React from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, LogIn } from 'lucide-react';
export function Navbar() {
  return <nav className="bg-[#1D2B3E] text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-semibold text-xl">
            Poder Legislativo
          </Link>
          <div className="flex space-x-8">
            <Link to="/archive-search" className="flex items-center space-x-2 hover:text-[#A7D3D4] transition-colors">
              <Search size={20} />
              <span>Búsqueda de Archivo</span>
            </Link>
            <Link to="/submit-project" className="flex items-center space-x-2 hover:text-[#A7D3D4] transition-colors">
              <FileText size={20} />
              <span>Presentar Proyecto</span>
            </Link>
            <Link to="/login" className="flex items-center space-x-2 hover:text-[#A7D3D4] transition-colors">
              <LogIn size={20} />
              <span>Iniciar Sesión</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>;
}