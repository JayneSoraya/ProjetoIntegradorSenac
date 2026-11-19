import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface RotaProtegidaProps {
  children: ReactNode;
  perfisAceitos?: string[];
}

export function RotaProtegida({
  children,
  perfisAceitos = ['ADMIN', 'MERCADO'],
}: RotaProtegidaProps) {
  const token = localStorage.getItem('@EconoWay:token');
  const usuarioRaw = localStorage.getItem('@EconoWay:usuario');

  if (!token || !usuarioRaw) {
    return <Navigate to="/" replace />;
  }

  try {
    const usuario = JSON.parse(usuarioRaw);
    const perfil = String(usuario.tipo_conta || '').toUpperCase();

    if (!perfisAceitos.includes(perfil)) {
      return <Navigate to="/" replace />;
    }
  } catch {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}