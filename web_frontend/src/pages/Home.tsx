import { ArrowRight, BarChart3, MapPin, ReceiptText, ShoppingCart, Store, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

export function Home() {
  const consumerFeatures = [
    { icon: ShoppingCart, title: 'Monte sua cesta', text: 'Pesquise produtos, ajuste quantidades e continue navegando sem perder o carrinho.' },
    { icon: BarChart3, title: 'Compare de verdade', text: 'Veja a mesma cesta em vários supermercados, com cobertura e itens faltantes explícitos.' },
    { icon: MapPin, title: 'Escolha mercados relevantes', text: 'Use favoritos, proximidade e seleção manual como escopo da comparação.' },
    { icon: ReceiptText, title: 'Contribua com preços', text: 'Escaneie NFC-e válida para ajudar a manter o mapa de preços atualizado.' },
  ];

  return (
    <div className="min-h-screen bg-bg-main text-text-main">
      <Header />

      <main>
        <section id="inicio" className="mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 pb-16 pt-32 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="inline-flex rounded-full bg-econoway-green/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-econoway-green">
              Comparação de preços de supermercado
            </span>
            <h1 className="mt-6 max-w-4xl text-5xl font-extrabold tracking-tight text-text-heading md:text-7xl">
              Sua lista. Vários mercados. Uma decisão mais econômica.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed">
              O EconoWay compara a mesma cesta entre supermercados selecionados, favoritos ou próximos e deixa claro quando algum preço está faltando.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#android" className="inline-flex items-center gap-2 rounded-xl bg-econoway-green px-6 py-3 font-bold text-white hover:bg-econoway-light">
                Conhecer o app Android <ArrowRight size={18} />
              </a>
              <Link to="/portal" className="inline-flex items-center gap-2 rounded-xl border border-border-main px-6 py-3 font-bold text-text-heading hover:border-econoway-green">
                <Store size={18} /> Portal do supermercado
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border-main bg-econoway-green p-7 text-white shadow-2xl">
            <p className="text-sm text-white/70">Exemplo de decisão</p>
            <strong className="mt-2 block text-3xl">Cesta com 10 itens</strong>
            <div className="mt-7 space-y-3">
              {[
                ['Assaí Atacadista', '10/10', 'R$ 189,89'],
                ['Carrefour', '10/10', 'R$ 201,14'],
                ['Pão de Açúcar', '9/10', 'Parcial'],
              ].map(([market, coverage, total]) => (
                <div key={market} className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                  <div><strong>{market}</strong><p className="text-xs text-white/65">Cobertura {coverage}</p></div>
                  <span className="font-bold">{total}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-white/70">Valores meramente ilustrativos. A aplicação deve sempre mostrar recência e cobertura dos dados reais.</p>
          </div>
        </section>

        <section id="como-funciona" className="border-y border-border-main bg-econoway-green/5 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-3xl font-extrabold text-text-heading md:text-4xl">Como o consumidor usa</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {consumerFeatures.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-2xl border border-border-main bg-bg-main p-6">
                  <Icon className="text-econoway-green" size={24} />
                  <h3 className="mt-5 font-bold text-text-heading">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="supermercados" className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-econoway-green">Responsável do supermercado</span>
              <h2 className="mt-3 text-4xl font-extrabold text-text-heading">Preço atualizado precisa de operação simples.</h2>
              <p className="mt-5 max-w-xl leading-relaxed">O portal web será dedicado à manutenção de preços, importações, inconsistências e histórico. A experiência administrativa não será misturada com o app do consumidor.</p>
              <Link to="/portal" className="mt-7 inline-flex items-center gap-2 font-bold text-econoway-green">Acessar portal <ArrowRight size={18} /></Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Upload, title: 'Importação validada', text: 'CSV ou JSON com preview, erros por linha e confirmação antes de publicar.' },
                { icon: Store, title: 'Gestão por vínculo', text: 'Cada responsável só opera supermercados vinculados à própria conta.' },
                { icon: BarChart3, title: 'Histórico', text: 'Mudanças e importações precisam ser rastreáveis e auditáveis.' },
                { icon: ReceiptText, title: 'Múltiplas fontes', text: 'Preços podem vir de NFC-e, importação, atualização manual ou futura API oficial.' },
              ].map(({ icon: FeatureIcon, title, text }) => (
                <article key={title} className="rounded-2xl border border-border-main p-5">
                  <FeatureIcon className="text-econoway-green"/>
                  <h3 className="mt-4 font-bold text-text-heading">{title}</h3>
                  <p className="mt-2 text-sm">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="android" className="bg-econoway-green py-20 text-white">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-6 md:flex-row md:items-center">
            <div><p className="text-sm font-bold uppercase tracking-widest text-white/70">MVP</p><h2 className="mt-2 text-4xl font-extrabold">Android primeiro.</h2><p className="mt-3 max-w-2xl text-white/75">O aplicativo está em desenvolvimento. iOS ficará para uma fase posterior, depois da estabilização funcional, de segurança e UX no Android.</p></div>
            <span className="rounded-xl bg-white/10 px-5 py-3 font-bold">Em desenvolvimento</span>
          </div>
        </section>
      </main>

      <footer id="contato" className="border-t border-border-main py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-6 text-sm md:flex-row">
          <strong className="text-text-heading">EconoWay</strong>
          <span>Projeto Integrador - Centro Universitário Senac</span>
        </div>
      </footer>
    </div>
  );
}
