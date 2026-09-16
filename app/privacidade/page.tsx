import Link from "next/link";
import { Logo } from "@/components/logo";

export default function PrivacyPage() {
  return (
    <main style={{minHeight:"100vh",background:"#fffdf8",color:"#24354d",padding:"24px"}}>
      <header style={{width:"min(960px,100%)",margin:"0 auto 32px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><Logo/><Link href="/">← Voltar</Link></header>
      <article style={{width:"min(820px,100%)",margin:"0 auto",background:"white",border:"1px solid #e8edf2",borderRadius:28,padding:"32px",boxShadow:"0 16px 50px rgba(50,73,100,.08)"}}>
        <h1>Política de Privacidade</h1>
        <p>Última atualização: 16 de setembro de 2026.</p>
        <h2>1. Dados que podemos tratar</h2><p>Quando o login Google for ativado, poderemos receber dados básicos autorizados pelo utilizador, como nome, endereço de email e imagem de perfil. Também poderemos guardar preferências da experiência, faixa etária selecionada e progresso nas atividades.</p>
        <h2>2. Dados de crianças</h2><p>A Luwipi é destinada ao uso de crianças com supervisão de um adulto. Procuramos recolher apenas os dados necessários para fornecer a experiência educativa e evitar solicitar dados pessoais desnecessários da criança.</p>
        <h2>3. Finalidade</h2><p>Os dados são utilizados para autenticação, personalização das aulas, acompanhamento de progresso, suporte e segurança da plataforma.</p>
        <h2>4. Pagamentos e WhatsApp</h2><p>Na fase inicial, pagamentos e ativações podem ser tratados por WhatsApp. As informações fornecidas nessa conversa ficam também sujeitas às práticas da plataforma de mensagens utilizada.</p>
        <h2>5. Partilha</h2><p>Não vendemos dados pessoais. Dados podem ser processados por serviços necessários à operação da plataforma, como autenticação, alojamento e infraestrutura, respeitando as permissões aplicáveis.</p>
        <h2>6. Contacto</h2><p>Para questões de privacidade, correções ou pedidos relacionados aos seus dados, contacte-nos pelo WhatsApp +244 933 400 445.</p>
      </article>
    </main>
  );
}
