import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { X, Mail, Lock, User, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import type { AuthFormData } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewType = 'login' | 'register' | 'forgot-password' | 'reset-sent';

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // URL base do seu backend Node.js
  const API_URL = 'http://localhost:3333/api/auth';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (currentView === 'login') {
        const response = await axios.post(`${API_URL}/login`, {
          email: formData.email,
          password: formData.password
        });
        setMessage('Login realizado com sucesso!');
        localStorage.setItem('@EconoWay:token', response.data.token);
        localStorage.setItem('@EconoWay:usuario', JSON.stringify(response.data.usuario));
        
        setTimeout(() => {
          window.location.href = '/dashboard'; 
        }, 1500);
      } else if (currentView === 'register') {
        await axios.post(`${API_URL}/register`, {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        setMessage('Cadastro realizado com sucesso! Faça login.');
        setTimeout(() => {
          setCurrentView('login');
          setMessage('');
        }, 2000);
      } else if (currentView === 'forgot-password') {
        await axios.post(`${API_URL}/forgot-password`, {
          email: formData.email
        });
        setCurrentView('reset-sent');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.erro || error.response?.data?.message || 'Erro ao processar solicitação');
      } else {
        setMessage('Ocorreu um erro inesperado');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '' });
    setMessage('');
  };

  const switchView = (view: ViewType) => {
    setCurrentView(view);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-bg-main p-8 md:p-10 rounded-3xl border border-border-main w-full max-w-md relative overflow-hidden text-text-main shadow-2xl transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🌟 Sintaxe atualizada para o Tailwind v4: bg-linear-to-br */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-linear-to-br from-econoway-green to-transparent" />
        </div>

        {/* Botão de Fechar */}
        <button
          className="absolute top-6 right-6 text-text-main/60 hover:text-econoway-green transition-colors z-10 cursor-pointer"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        {/* Botão de Voltar */}
        {(currentView === 'register' || currentView === 'forgot-password') && (
          <button
            className="absolute top-6 left-6 text-text-main/60 hover:text-econoway-green transition-colors z-10 cursor-pointer"
            onClick={() => switchView('login')}
          >
            <ArrowLeft size={22} />
          </button>
        )}

        <div className="relative z-10">
          {currentView === 'reset-sent' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 mx-auto bg-econoway-light/10 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} className="text-econoway-light" />
              </div>
              <h2 className="text-2xl font-extrabold text-econoway-green tracking-tight">
                E-mail Enviado
              </h2>
              <p className="text-sm leading-relaxed text-text-main">
                Enviamos um link de recuperação para <span className="text-text-heading font-bold">{formData.email}</span>
              </p>
              <p className="text-text-main/60 text-xs">
                Verifique sua caixa de entrada e a pasta de spam. O link expira em 1 hora.
              </p>
              <button
                onClick={() => switchView('login')}
                className="w-full bg-econoway-green py-3.5 rounded-xl font-bold text-white shadow-md hover:bg-econoway-light transition-colors cursor-pointer text-xs uppercase tracking-widest"
              >
                Voltar ao Login
              </button>
            </motion.div>
          ) : (
            <>
              <h2 className="text-3xl font-extrabold mb-8 text-center text-econoway-green tracking-tight uppercase font-mono">
                {currentView === 'login' && 'LOGIN_'}
                {currentView === 'register' && 'CADASTRO_'}
                {currentView === 'forgot-password' && 'RECUPERAR_'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {currentView === 'register' && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-main/50" size={18} />
                    <input
                      type="text"
                      name="name"
                      placeholder="Nome Completo"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-bg-main pl-12 pr-4 py-3 rounded-xl border border-border-main outline-none focus:ring-2 focus:ring-econoway-green focus:border-econoway-green text-text-heading text-sm transition-all placeholder:text-text-main/40"
                    />
                  </div>
                )}
                
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-main/50" size={18} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Seu e-mail"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-bg-main pl-12 pr-4 py-3 rounded-xl border border-border-main outline-none focus:ring-2 focus:ring-econoway-green focus:border-econoway-green text-text-heading text-sm transition-all placeholder:text-text-main/40"
                  />
                </div>

                {currentView !== 'forgot-password' && (
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-main/50" size={18} />
                    <input
                      type="password"
                      name="password"
                      placeholder="Sua senha"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full bg-bg-main pl-12 pr-4 py-3 rounded-xl border border-border-main outline-none focus:ring-2 focus:ring-econoway-green focus:border-econoway-green text-text-heading text-sm transition-all placeholder:text-text-main/40"
                    />
                  </div>
                )}

                {currentView === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => switchView('forgot-password')}
                      className="text-xs font-semibold text-econoway-green hover:underline hover:text-econoway-light transition-colors cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-econoway-green py-3.5 rounded-xl font-bold text-white shadow-md hover:bg-econoway-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs uppercase tracking-widest"
                >
                  {isLoading ? 'PROCESSANDO...' : 
                    currentView === 'login' ? 'Entrar' : 
                    currentView === 'register' ? 'Cadastrar' :
                    'Enviar Link'}
                </button>
              </form>

              <AnimatePresence>
                {message && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-4 text-center text-sm font-semibold ${
                      message.includes('sucesso') ? 'text-econoway-light' : 'text-red-500'
                    }`}
                  >
                    {message}
                  </motion.p>
                )}
              </AnimatePresence>

              {currentView === 'login' && (
                <p className="mt-6 text-center text-xs text-text-main/60">
                  Não possui cadastro?{' '}
                  <button
                    onClick={() => switchView('register')}
                    className="text-econoway-green font-bold hover:underline cursor-pointer"
                  >
                    Criar nova conta
                  </button>
                </p>
              )}

              {currentView === 'register' && (
                <p className="mt-6 text-center text-xs text-text-main/60">
                  Já possui credenciais?{' '}
                  <button
                    onClick={() => switchView('login')}
                    className="text-econoway-green font-bold hover:underline cursor-pointer"
                  >
                    Fazer Login
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginModal;