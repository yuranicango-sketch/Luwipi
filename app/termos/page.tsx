import Link from "next/link";
import { Logo } from "@/components/logo";

export default function TermsPage() {
  return (
    <main style={{minHeight:"100vh",background:"#fffdf8",color:"#24354d",padding:"24px"}}>
      <header style={{width:"min(960px,100%)",margin:"0 auto 32px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><Logo/><Link href="/">← Voltar</Link></header>
      <article style={{width:"min(820px,100%)",margin:"0 auto",background:"white",border:"1px solid #e8edf2",borderRadius:28,padding:"32px",boxShadow:"0 16px 50px rgba(50,73,100,.08)"}}>
        <h1>Termos de Uso</h1>
        <p>Última atualização: 16 de setembro de 2026.</p>
        <h2>1. Sobre a Luwipi</h2><p>A Luwipi é uma experiência digital de iniciação musical e aprendizagem de piano para crianças, utilizada sob supervisão de pais, responsáveis ou educadores.</p>
        <h2>2. Teste gratuito</h2><p>O acesso inicial pode incluir um período gratuito de 24 horas. Após esse período, a continuidade poderá depender da ativação do plano através dos canais disponibilizados pela Luwipi.</p>
        <h2>3. Uso por crianças</h2><p>A conta e as decisões de pagamento devem ser geridas por um adulto responsável. O conteúdo infantil foi concebido como apoio educativo e não substitui acompanhamento pedagógico quando necessário.</p>
        <h2>4. Pagamentos</h2><p>Na fase inicial, a ativação e o pagamento são tratados por contacto direto via WhatsApp. A Luwipi não realiza cobrança automática sem autorização explícita.</p>
        <h2>5. Conteúdo e disponibilidade</h2><p>Atividades, currículos e funcionalidades podem ser atualizados à medida que o produto evolui.</p>
        <h2>6. Contacto</h2><p>Para suporte ou questões sobre estes termos, contacte-nos pelo WhatsApp +244 933 400 445.</p>
      </article>
    </main>
  );
}
