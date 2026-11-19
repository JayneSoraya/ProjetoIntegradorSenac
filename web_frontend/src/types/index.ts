export interface AboutText {
  title: string;
  description: string;
  detailedDescription: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: 'github' | 'linkedin' | 'mail' | 'phone' | 'behance';
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  name: string;
}

export interface FeatureItem {
  id: string;
  name: string;
  category: string;
  completionRate: number;
  description: string;
  highlight: string;
}

export interface BenefitItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  progressLabel: string;
  progressValue: number;
  metric: string;
}

export type TipoConta = 'CONSUMIDOR' | 'MERCADO' | 'ADMIN';

export type StatusEnriquecimento = 'PENDENTE' | 'ENRIQUECIDO' | 'CONCLUIDO';

export interface Produto {
  id_produto: number;
  nome_produto: string;
  nome_original?: string;
  marca?: string;
  peso?: string | number | null;
  unidade_medida?: string;
  categoria?: string;
  codigo_barras?: string;
  imagem_url?: string | null;
  status_enriquecimento?: StatusEnriquecimento;
  total_mercados?: number;
  total_notas?: number;
  menor_preco?: string | number;
  ultima_chave_nfce?: string | null;
}

export interface Supermercado {
  id_supermercado: number;
  nome: string;
  cnpj?: string;
  endereco?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
}

export interface UsuarioAdmin {
  id_usuario: number;
  id_conta: number;
  nome: string;
  email: string;
  tipo_conta: TipoConta;
  ativo?: boolean;
  criado_em?: string;
}

export interface NotaFiscal {
  id_nota: number;
  chave_acesso: string;
  status: 'PROCESSADA' | 'CONTINGENCIA' | 'ERRO';
  valor_total: number;
  data_emissao: string;
  supermercado_nome?: string;
}