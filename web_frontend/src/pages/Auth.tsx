import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, MapPin, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';

export function Auth() {
  const navigate = useNavigate();
  const [telaAtual, setTelaAtual] = useState<'login' | 'cadastro'>('login');
  
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cep, setCep] = useState('');
  const [aceitaLgpd, setAceitaLgpd] = useState(false);
  
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const fazerCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);

    if (!aceitaLgpd) {
      setErro('Você precisa aceitar os Termos de Uso e LGPD.');
      setCarregando(false);
      return;
    }

    try {
      const resposta = await fetch('http://localhost:3333/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          senha,
          cep,
          aceita_lgpd: aceitaLgpd
        }),
      });

      if (resposta.headers.get('content-type')?.includes('text/html')) {
        throw new Error('O servidor respondeu com HTML. Verifique se o Back-end está ligado na porta 3333.');
      }

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao realizar cadastro.');
      }

      setSucesso('Conta criada com sucesso! Faça seu login.');
      setNome('');
      setCep('');
      setAceitaLgpd(false);
      setSenha('');
      setTelaAtual('login'); 

    } catch (err: any) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const fazerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const resposta = await fetch('http://localhost:3333/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      if (resposta.headers.get('content-type')?.includes('text/html')) {
        throw new Error('O servidor respondeu com HTML. Verifique as rotas do seu Back-end.');
      }

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || 'E-mail ou senha incorretos.');
      }

      localStorage.setItem('@EconoWay:token', dados.token);
      localStorage.setItem('@EconoWay:usuario', JSON.stringify(dados.usuario));
      
      navigate('/dashboard');

    } catch (err: any) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const alternarTela = (tela: 'login' | 'cadastro') => {
    setTelaAtual(tela);
    setErro('');
    setSucesso('');
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col justify-center items-center p-4 font-sans text-text-main transition-colors duration-300 relative overflow-hidden">
      
      {/* Botão Flutuante para voltar para a Landing Page */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-semibold text-text-main hover:text-econoway-green transition-colors group"
      >
        <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
        Voltar ao início
      </Link>

      {/* Card Principal Animado */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full bg-bg-main rounded-2xl shadow-xl p-8 border border-border-main backdrop-blur-sm relative z-10"
      >
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-econoway-green tracking-tight m-0">
            EconoWay
          </h1>
          <p className="text-sm text-text-main mt-2 h-5">
            {telaAtual === 'cadastro' 
              ? 'Crie sua conta para começar a economizar.' 
              : 'Compare preços e economize nas suas compras.'}
          </p>
        </div>

        {/* Alertas Inteligentes ) */}
        <AnimatePresence mode="wait">
          {erro && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-red-500/10 text-red-500 text-sm rounded-lg border border-red-500/20 flex items-center gap-2"
            >
              <AlertTriangle size={16} className="shrink-0" />
              <span>{erro}</span>
            </motion.div>
          )}
          {sucesso && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-econoway-light/10 text-econoway-light text-sm rounded-lg border border-econoway-light/20 flex items-center gap-2"
            >
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{sucesso}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulários com transição suave de opacidade */}
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
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/60" size={18} />
                  <input type="text" required className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green text-text-heading outline-none transition-all text-sm" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Jayne Silva" />
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-2/3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/60" size={18} />
                    <input type="email" required className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green text-text-heading outline-none transition-all text-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
                  </div>
                </div>
                <div className="w-1/3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1">CEP</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/60" size={18} />
                    <input type="text" required maxLength={8} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green text-text-heading outline-none transition-all text-sm" value={cep} onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))} placeholder="00000000" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/60" size={18} />
                  <input type="password" required minLength={6} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green text-text-heading outline-none transition-all text-sm" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
                </div>
              </div>

              <div className="flex items-center pt-1">
                <input type="checkbox" id="lgpd" required checked={aceitaLgpd} onChange={(e) => setAceitaLgpd(e.target.checked)} className="h-4 w-4 text-econoway-green focus:ring-econoway-green border-border-main rounded bg-bg-main cursor-pointer" />
                <label htmlFor="lgpd" className="ml-2 block text-xs text-text-main font-medium select-none cursor-pointer">
                  Aceito os <a href="#" className="text-econoway-green font-bold hover:underline">Termos de Uso</a> e LGPD.
                </label>
              </div>

              <button type="submit" disabled={carregando} className="w-full mt-4 bg-econoway-green hover:bg-econoway-light text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-econoway-green/20 transition-all flex justify-center items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                {carregando ? 'Criando conta...' : 'Cadastrar'}
              </button>

              <p className="text-center text-sm text-text-main mt-4">
                Já tem uma conta?{' '}
                <button type="button" onClick={() => alternarTela('login')} className="text-econoway-green font-bold hover:underline cursor-pointer">Entrar</button>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/60" size={18} />
                  <input type="email" required className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green text-text-heading outline-none transition-all text-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/60" size={18} />
                  <input type="password" required className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-main border border-border-main focus:ring-2 focus:ring-econoway-green focus:border-econoway-green text-text-heading outline-none transition-all text-sm" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
                </div>
              </div>

              <button type="submit" disabled={carregando} className="w-full mt-6 bg-econoway-green hover:bg-econoway-light text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-econoway-green/20 transition-all flex justify-center items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                {carregando ? 'Entrando...' : 'Entrar'}
              </button>

              <p className="text-center text-sm text-text-main mt-4">
                Ainda não tem conta?{' '}
                <button type="button" onClick={() => alternarTela('cadastro')} className="text-econoway-green font-bold hover:underline cursor-pointer">Cadastre-se</button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}