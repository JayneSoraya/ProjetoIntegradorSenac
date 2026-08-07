
import type { Project, Skill, AboutText, SocialLink, HardSkill } from '../types';

export const projects: Project[] = [
  {
    id: 1,
    title: "App PLPs",
    description: "Criei o documento de requisitos das Promotoras Legais Populares (PLPs).",
    image: "/img/mulheresFelizes.jpg",
    url: "https://github.com/JayneSoraya/projeto-plp-araraquara",
    tags: ["Full Stack", "UML", "Java"],
    category: "impactoSocial"
  },
  {
    id: 2,
    title: "Auditoria Tembici",
    description: "Automatizei o processo de IAM com JavaScript, validando prazos e gerando chamados.",
    image: "/img/logo-tembici.webp",
    url: "https://www.linkedin.com/posts/jayne-soraya_sempre-busco-um-jeito-de-inovar-para-os-clientes-activity-7288344763362168832-mMlM/?utm_source=share&utm_medium=member_desktop&rcm=ACoAACEhVZcB0j6ppdOhc_yT1YQRoSayumR8aNo",
    tags: ["Jira", "Google Sheets", "JavaScript"],
    category: "automacao" 
  },
  {
    id: 3,
    title: "Leigos e Troianos",
    description: "Desenvolvi um site no Google Sites para automatizar horários, coletar dados de NPS e enviar pesquisas por e-mail com JavaScript.",
    image: "/img/leigosetroianos.webp",
    url: "https://sites.google.com/view/leigos-e-troianos-atendimento/biografia",
    tags: ["Google Sites", "Automação", "JavaScript", "Full Stack"],
    category: "desenvolvimento"
  },
  {
    id: 4,
    title: "Comunicação em massa",
    description: "Comunicação em massa com JavaScript para ação preventiva sobre a descontinuidade do Sat e a migração para NFCe.",
    image: "/img/logocomletrinha.webp",
    url: "https://www.linkedin.com/posts/jayne-soraya_javascript-desenvolvimentoweb-aprendizadocontaednuo-activity-7405279123151187969-4oWW/?utm_source=share&utm_medium=member_desktop&rcm=ACoAACEhVZcB0j6ppdOhc_yT1YQRoSayumR8aNo",
    tags: ["JavaScript", "NFCe", "Sat"],
    category: "automacao"
  }
  ,
  {
    id: 5,
    title: "Imersões Alura",
    description: "Usado como laboratório, faço as aulas usando a plataforma da Alura, o famoso mão na massa.",
    image: "/img/alura.webp",
     url: "https://github.com/JayneSoraya/Lab-Alura/blob/main/README.md",
    tags: ["Python", "Automação", "DevOps"],
    category: "desenvolvimento"
  },
  {
    id: 6,
    title: "Empreenda Senac",
    description: "Criei o SaveMoney para a competição do empreenda Senac 18ª edição. Cheguei na semi final, foi uma experiência fascinante!",
    image: "/img/empreendasenac.webp",
     url: "https://github.com/JayneSoraya/Empreenda-Senac",
    tags: ["React", "UI/UX", "Responsive"],
    category: "desenvolvimento"
  }
  ,
  {
    id: 7,
    title: "Artes",
    description: "Aplicando teoria, técnica e prática da publicidade e propaganda.",
    image: "/img/primeiraArte.webp",
     url: "https://github.com/JayneSoraya/Empreenda-Senac",
    tags: ["React", "UI/UX", "Responsive"],
    category: "desenvolvimento"
  }

  ,
  {
    id: 8,
    title: "Jogo Vivência escolar",
    description: "Sinais que amo o mundo do desenvolvimento em 2014. Na epoca Produzi um projeto sobre um jogo que demonstrava a vivência escolar do Ensino Integral para habituar os alunos.",
    image: "/img/jogoEscolar.png",
     url: "https://github.com/JayneSoraya/Empreenda-Senac",
    tags: ["Unity", "UI/UX", "Responsive"],
    category: "desenvolvimento"
  }
];

export const skills: Skill[] = [
  { name: "React", level: 70 },
  { name: "Node.js", level: 70 },
  { name: "JavaScript", level: 85 },
  { name: "Python", level: 65 },
  { name: "PL/SQL", level: 90 },
  { name: "Java", level: 65 },
  { name: "Git", level: 95 },
  { name: "Infraestrutura", level: 90 }
];


export const hardSkills: HardSkill[] = [
  { name: "Proatividade", level: 91 },
  { name: "Liderança", level: 72 },
  { name: "Comunicação", level: 93 },
  { name: "Resolução de Problemas", level: 95 },
  { name: "Criatividade", level: 90 },
  { name: "Inovação", level: 85 },
  { name: "Inglês Reading, writing and listening", level: 50 },
  { name: "Trabalho em equipe", level: 85 }
];

export const aboutText: AboutText = {
  title: "SOBRE_MIM",
  description: "Dev que entende de gente e de máquina.",
  detailedDescription: "Do hardware ao código: construindo soluções completas. Comecei minha jornada garantindo que a infraestrutura não falhasse. Aprendi a ouvir o usuário no suporte, a debugar problemas críticos de rede e a navegar por bancos de dados complexos em ambientes Oracle Cloud. Mas percebi que eu não queria apenas consertar o que já existia; eu queria criar o novo. Hoje, como graduanda em ADS, transformo essa experiência em desenvolvimento Full Stack. Entender de máquina me faz escrever códigos mais limpos e otimizados; entender de gente me faz criar produtos que realmente resolvem problemas. Se você procura alguém que entenda desde a arquitetura do servidor até o último pixel da interface, vamos conversar!"
};

export const socialLinks: SocialLink[] = [
  { name: "GitHub", url: "https://github.com/JayneSoraya", icon: "github" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/jayne-soraya/", icon: "linkedin" },
  { name: "Behance", url: "https://www.behance.net/jaynesoraya", icon: "behance" },
  { name: "Email", url: "mailto:jayne.soraya@hotmail.com", icon: "mail" },
  { name: "WhatsApp", url: "https://wa.me/5516988209408", icon: "phone" }
];