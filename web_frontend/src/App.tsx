import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RoleGate } from './components/auth/RoleGate';
import type { PortalUser } from './lib/api';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { AdminDashboard } from './pages/portal/AdminDashboard';
import { SupermarketDashboard } from './pages/portal/SupermarketDashboard';
import { UsersPage } from './pages/portal/admin/UsersPage';
import { MarketsPage } from './pages/portal/admin/MarketsPage';
import { AuditPage } from './pages/portal/admin/AuditPage';
import { PricesPage } from './pages/portal/supermarket/PricesPage';
import { ImportPage } from './pages/portal/supermarket/ImportPage';
import { ImportHistoryPage } from './pages/portal/supermarket/ImportHistoryPage';
import { InconsistenciesPage } from './pages/portal/supermarket/InconsistenciesPage';

const admin = (element: (user: PortalUser) => ReactNode) => <RoleGate roles={['ADMIN']}>{element}</RoleGate>;
const supermarket = (element: (user: PortalUser) => ReactNode) => <RoleGate roles={['SUPERMERCADO']}>{element}</RoleGate>;

export default function App() {
  return <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/portal" element={<Auth />} />
    <Route path="/admin" element={admin((user) => <AdminDashboard user={user} />)} />
    <Route path="/admin/usuarios" element={admin((user) => <UsersPage user={user} />)} />
    <Route path="/admin/supermercados" element={admin((user) => <MarketsPage user={user} />)} />
    <Route path="/admin/auditoria" element={admin((user) => <AuditPage user={user} />)} />
    <Route path="/supermercado" element={supermarket((user) => <SupermarketDashboard user={user} />)} />
    <Route path="/supermercado/precos" element={supermarket((user) => <PricesPage user={user} />)} />
    <Route path="/supermercado/importar" element={supermarket((user) => <ImportPage user={user} />)} />
    <Route path="/supermercado/importacoes" element={supermarket((user) => <ImportHistoryPage user={user} />)} />
    <Route path="/supermercado/inconsistencias" element={supermarket((user) => <InconsistenciesPage user={user} />)} />
    <Route path="*" element={<Home />} />
  </Routes>;
}
