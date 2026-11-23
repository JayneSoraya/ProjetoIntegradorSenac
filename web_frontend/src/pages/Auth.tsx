import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, ShieldCheck } from 'lucide-react';
import { ApiError, apiFetch, logout, type PortalUser } from '../lib/api';

interface LoginResponse {
  usuario: PortalUser;
}

export function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const fazerLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const data = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), senha }),
      });

      if (data.usuario.tipo_conta === 'ADMIN') {
        navigate('/admin', { replace: true });
        return;
      }

      if (data.usuario.tipo_conta === 'SUPERMERCADO') {
        navigate('/supermercado', { replace: true });
        return;
      }

      await logout();
      setErro('O portal web é destinado a administradores e responsáveis por supermercados. O aplicativo do consumidor será Android.');
    } catch (error: unknown) {
      setErro(error instanceof ApiError ? error.message : 'Não foi possível entrar no portal.');
    } finally {
      setCarregando(false);
    }
  };

  const from = (location.state as { from?: string } | null)?.from;

  return (
    <main className="min-h-screen bg-bg-main text-text-main flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-text-main hover:text-econoway-green mb-8">
          <ArrowLeft size={18} /> Voltar ao site
        </Link>

        <section className="rounded-3xl border border-border-main bg-bg-main p-8 shadow-xl">
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-econoway-green/10 text-econoway-green grid place-items-center mb-5">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-text-heading">Portal EconoWay</h1>
            <p className="mt-2 text-sm leading-relaxed text-text-main">
              Acesso exclusivo para responsáveis de supermercados e administradores.
            </p>
            {from && <p className="mt-2 text-xs text-text-main/70">Autentique-se para acessar {from}.</p>}
          </div>

          <form onSubmit={fazerLogin} className="space-y-5">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-text-heading">E-mail</span>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/50" size={18} />
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border-main bg-bg-main py-3 pl-10 pr-4 text-text-heading outline-none focus:ring-2 focus:ring-econoway-green"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-text-heading">Senha</span>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/50" size={18} />
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full rounded-xl border border-border-main bg-bg-main py-3 pl-10 pr-4 text-text-heading outline-none focus:ring-2 focus:ring-econoway-green"
                />
              </div>
            </label>

            {erro && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-xl bg-econoway-green px-4 py-3.5 font-bold text-white transition hover:bg-econoway-light disabled:opacity-60"
            >
              {carregando ? 'Entrando...' : 'Entrar no portal'}
            </button>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-text-main/70">
            Cadastro de consumidor e recuperação de senha permanecem no roadmap do aplicativo Android.
          </p>
        </section>
      </div>
    </main>
  );
}
