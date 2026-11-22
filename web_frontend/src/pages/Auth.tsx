import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Mail,
  Lock,
  User,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';

const PERFIS_PERMITIDOS = ['ADMIN', 'MERCADO'];

function extrairPayloadToken(token: string): { tipo_conta?: string } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
}

export function Auth() {
  const navigate = useNavigate();
  const [telaAtual, setTelaAtual] = useState<'login' | 'cadastro'>('login');

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cep, setCep] = useState('');
  const [aceitaLgpd, setAceitaLgpd] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const fazerCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!aceitaLgpd) {
      setErro('Você precisa aceitar os Termos de Uso e LGPD.');
      return;
    }

    setCarregando(true);

    try {
      await api.post('/auth/register', {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
        cep,
        aceita_lgpd: aceitaLgpd,
      });

      setSucesso('Cadastro realizado! Caso seja gestor, solicite a liberação do perfil ADMIN.');
      setNome('');
      setCep('');
      setAceitaLgpd(false);
      setSenha('');
      setMostrarSenha(false);
      setTelaAtual('login');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErro(err.response?.data?.erro || 'Erro ao realizar cadastro.');
      } else {
        setErro('Falha na comunicação com o servidor.');
      }
    } finally {
      setCarregando(false);
    }
  };

  const fazerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);

    try {
      const { data } = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        senha,
      });

      const payloadToken = data.token ? extrairPayloadToken(data.token) : null;
      const tipoConta = data.usuario?.tipo_conta || payloadToken?.tipo_conta;

      if (!tipoConta || !PERFIS_PERMITIDOS.includes(tipoConta)) {
        setErro('Acesso restrito. Contas de consumidor devem utilizar o aplicativo EconoWay.');
        return;
      }

      sessionStorage.setItem('@EconoWay:token', data.token);
      sessionStorage.setItem(
        '@EconoWay:usuario',
        JSON.stringify({ ...data.usuario, tipo_conta: tipoConta })
      );

      navigate('/admin');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErro(err.response?.data?.erro || 'E-mail ou senha incorretos.');
      } else {
        setErro('Erro inesperado ao autenticar.');
      }
    } finally {
      setCarregando(false);
    }
  };

  const alternarTela = (tela: 'login' | 'cadastro') => {
    setTelaAtual(tela);
    setErro('');
    setSucesso('');
    setMostrarSenha(false);
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col justify-center items-center p-4 font-sans text-text-main transition-colors duration-300 relative overflow-hidden">
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-semibold text-text-main hover:text-econoway-green transition-colors group"
      >
        <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
        Voltar ao início
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full bg-bg-main rounded-2xl shadow-xl p-8 border border-border-main backdrop-blur-sm relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-econoway-green/10 text-econoway-green text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck size={14} />
            Portal Administrativo
          </div>
          <h1 className="text-4xl font-extrabold text-econoway-green tracking-tight m-0">
            EconoWay
          </h1>
          <p className="text-sm text-text-main mt-2 h-5">
            {telaAtual === 'cadastro'
              ? 'Solicite sua credencial de acesso ao painel.'
              : 'Gerencie produtos, mercados e inteligência de preços.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {erro && (
            <motion.div
              key="erro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="mb-4 p-3 bg-red-500/10 text-red-500 text-sm rounded-lg border border-red-500/20 flex items-center gap-2"
            >
              <AlertTriangle size={16} className="shrink-0" />
              <span>{erro}</span>
            </motion.div>
          )}
          {sucesso && (
            <motion.div
              key="sucesso"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              role="status"
              className="mb-4 p-3 bg-econoway-light/10 text-econoway-light text-sm rounded-lg border border-econoway-light/20 flex items-center gap-2"
            >
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{sucesso}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {telaAtual === 'cadastro' ? (
            <motion.form
              key="cadastro"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onSubmit={fazerCadastro}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/60"
                    size={18}
                  />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green text-text-heading outline-none transition-all text-sm"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Jayne Silva"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-2/3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/60"
                      size={18}
                    />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green text-text-heading outline-none transition-all text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
                <div className="w-1/3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1">
                    CEP
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/60"
                      size={18}
                    />
                    <input
                      type="text"
                      required
                      maxLength={8}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green text-text-heading outline-none transition-all text-sm"
                      value={cep}
                      onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
                      placeholder="00000000"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/60"
                    size={18}
                  />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green text-text-heading outline-none transition-all text-sm"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((prev) => !prev)}
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-main/60 hover:text-econoway-green transition-colors cursor-pointer"
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center pt-1">
                <input
                  type="checkbox"
                  id="lgpd"
                  required
                  checked={aceitaLgpd}
                  onChange={(e) => setAceitaLgpd(e.target.checked)}
                  className="h-4 w-4 text-econoway-green focus:ring-econoway-green border-border-main rounded bg-bg-main cursor-pointer"
                />
                <label
                  htmlFor="lgpd"
                  className="ml-2 block text-xs text-text-main font-medium select-none cursor-pointer"
                >
                  Aceito os{' '}
                  <a href="#" className="text-econoway-green font-bold hover:underline">
                    Termos de Uso
                  </a>{' '}
                  e LGPD.
                </label>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full mt-4 bg-econoway-green hover:bg-econoway-light text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-econoway-green/20 transition-all flex justify-center items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {carregando ? 'Criando conta...' : 'Cadastrar'}
              </button>

              <p className="text-center text-sm text-text-main mt-4">
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => alternarTela('login')}
                  className="text-econoway-green font-bold hover:underline cursor-pointer"
                >
                  Entrar
                </button>
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onSubmit={fazerLogin}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/60"
                    size={18}
                  />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green text-text-heading outline-none transition-all text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/60"
                    size={18}
                  />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green text-text-heading outline-none transition-all text-sm"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((prev) => !prev)}
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-main/60 hover:text-econoway-green transition-colors cursor-pointer"
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full mt-6 bg-econoway-green hover:bg-econoway-light text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-econoway-green/20 transition-all flex justify-center items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {carregando ? 'Autenticando...' : 'Entrar no Painel'}
              </button>

              <p className="text-center text-sm text-text-main mt-4">
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => alternarTela('cadastro')}
                  className="text-econoway-green font-bold hover:underline cursor-pointer"
                >
                  Cadastre-se
                </button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}