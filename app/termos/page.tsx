import Link from "next/link";

export default function TermosPage() {
  return <main className="container" style={{maxWidth:860,padding:"48px 20px 80px"}}>
    <h1>Termos de Serviço — Luwipi</h1>
    <p><strong>Última atualização:</strong> 23 de setembro de 2026</p>
    <p>Estes Termos regulam o uso do Luwipi, uma plataforma de apoio a aulas de piano infantil conduzidas por um professor. O Luwipi apoia a preparação, a condução da aula e o registo pedagógico; não substitui o julgamento profissional do professor.</p>
    <h2>1. Uso do serviço</h2>
    <p>O Luwipi disponibiliza Aulas Prontas, currículo em espiral, blocos pedagógicos, piano virtual, registo manual de competências e materiais de prática para a família.</p>
    <h2>2. Contas do professor</h2>
    <p>Áreas reservadas exigem autenticação. O login com Google é usado para autenticar o professor e não concede ao Luwipi acesso ao Google Drive no fluxo normal de login.</p>
    <h2>3. Dados de crianças</h2>
    <p>Perfis locais de alunos, fotografias opcionais, competências, notas e histórico de aula ficam guardados no dispositivo por padrão. O professor é responsável por inserir apenas informação necessária à finalidade pedagógica e por proteger o dispositivo e eventuais cópias exportadas.</p>
    <h2>4. Pais e encarregados de educação</h2>
    <p>O professor pode copiar e partilhar um resumo curto da aula e uma prática para casa. A criança não precisa criar uma conta para participar numa aula conduzida pelo professor.</p>
    <h2>5. Conteúdo e propriedade intelectual</h2>
    <p>A interface, materiais originais e conteúdos próprios do Luwipi são protegidos pelos direitos aplicáveis. Obras de domínio público podem ser utilizadas em experiências pedagógicas próprias. Referências a métodos publicados não significam licença para copiar partituras, gravações ou materiais protegidos.</p>
    <h2>6. Disponibilidade e offline</h2>
    <p>O Luwipi procura manter o núcleo da aula utilizável depois do carregamento inicial, incluindo dados locais e áudio sintetizado no dispositivo. Algumas funções de conta, pagamento e atualização do produto continuam a depender de internet.</p>
    <h2>7. Pagamentos e acesso</h2>
    <p>O acesso pode incluir um período gratuito e, depois, uma subscrição ativa. Quando aplicável, as condições apresentadas no momento da ativação determinam o período de acesso.</p>
    <h2>8. Conduta</h2>
    <p>É proibido tentar obter acesso não autorizado, interferir no serviço ou utilizar a plataforma para fins ilegais.</p>
    <h2>9. Limitação</h2>
    <p>O Luwipi é uma ferramenta educacional de apoio. Postura, técnica, dedilhação, regulação emocional e decisões de progressão dependem da observação do professor.</p>
    <h2>10. Alterações e contacto</h2>
    <p>Estes Termos podem ser atualizados quando o produto ou requisitos legais mudarem. Questões podem ser enviadas através dos canais disponibilizados no Luwipi.</p>
    <p><Link href="/privacidade">Política de Privacidade</Link> · <Link href="/">Voltar ao Luwipi</Link></p>
  </main>;
}
