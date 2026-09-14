# Guia Completo de Marketing Digital — Distribuidora de Cimento
## Google Ads, SEO, Conversões e Compliance

---

## Sumário

1. [Configuração do Google Ads](#1-configuração-do-google-ads)
2. [Tag Manager e Conversões](#2-tag-manager-e-conversões)
3. [SEO On-Page e Off-Page](#3-seo-on-page-e-off-page)
4. [Structured Data (JSON-LD)](#4-structured-data-jsonld)
5. [Compliance do Google Ads](#5-compliance-do-google-ads)
6. [Redução de Custo por Lead](#6-redução-de-custo-por-lead)
7. [Conversions API (CAPI)](#7-conversions-api-capi)
8. [Checklist Final](#8-checklist-final)

---

## 1. Configuração do Google Ads

### 1.1 Criar Conta e Campanha

1. Acesse [Google Ads](https://ads.google.com)
2. Crie uma nova conta ou entre na existente
3. Crie uma campanha do tipo **"Vendas na web"**
4. Defina o objetivo: **"Receber mais ligações"** ou **"Gerar mais leads"**

### 1.2 Criar Tags de Conversão

No menu **Ferramentas e configurações > Medição > Conversões**, clique em **"+ Nova conversão"** e crie as seguintes:

| Nome da Conversão | Categoria | Valor | ID esperado |
|---|---|---|---|
| WhatsApp Click | Telefone | R$ 1,50 | `AW-XXX/XXX_XXXXXXXX` |
| Lead Form | Lead | R$ 10,00 | `AW-XXX/XXX_XXXXXXXX` |
| Add to Cart | Adicionar ao carrinho | R$ valor do produto | `AW-XXX/XXX_XXXXXXXX` |
| Purchase | Venda | Valor total | `AW-XXX/XXX_XXXXXXXX` |
| View Item | Visualização | R$ 0 | `AW-XXX/XXX_XXXXXXXX` |

### 1.3 Configurar Tag de Conversão do WhatsApp

Para cada botão de WhatsApp no site, adicione o atributo `onClick`:

```javascript
// No botão de WhatsApp
onClick={() => {
  trackWhatsAppClick("home_cta")
  fireWhatsappConversion("home_cta", window.location.pathname, 1.5)
}}
```

### 1.4 Adicionar Variáveis de Ambiente

Copie as variáveis do `.env.example` para o `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_ID=AW-XXXXXXXXXX/XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_LEAD_FORM_ID=AW-XXXXXXXXXX/XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_ID=AW-XXXXXXXXXX/XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_ADD_TO_CART_ID=AW-XXXXXXXXXX/XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_CUSTOMER_ID=XXX-XXX-XXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=SEU_PIXEL_ID_AQUI
GOOGLE_ADS_CAPI_API_KEY=sua_api_key
GOOGLE_ADS_CAPI_ACCOUNT_ID=seu_account_id
GOOGLE_ADS_CAPI_ACTION=sua_conversion_action
NEXT_PUBLIC_SITE_URL=https://seusite.com
```

---

## 2. Tag Manager e Conversões

### 2.1 Configurar Google Tag Manager

1. Acesse [Tag Manager](https://tagmanager.google.com)
2. Crie um contêiner (se ainda não existir)
3. Instale o snippet no site (já configurado no `layout.tsx`)

### 2.2 Criar Tags no GTM

**Tag 1: Google Ads Conversão - WhatsApp**
- Tipo: Google Ads
- ID de conversão: `AW-XXX/XXX`
- Label: `{{Click Text}}`
- Valor: `{{Click Value}}`
- Não deve repetir contagem: **SIM**

**Tag 2: Google Ads Conversão - Lead**
- Mesmo processo acima, mas com o ID de lead form
- Acionada ao submeter o formulário de contato

**Tag 3: Google Ads Conversão - Compra**
- Acionada após finalização de pedido
- Inclui valor da transação e itens

**Tag 4: Remarketing - WhatsApp Click**
- Tipo: Audience event
- Evento: `whatsapp_remarketing`
- Usado para criar audiência de remarketing

### 2.3 Criar Acionadores (Triggers)

- **WhatsApp Click**: `Click - Todos os elementos` > `Click ID contém "whatsapp"`
- **Lead Form Submit**: `Form Submission` > `Form ID contém "lead-form"`
- **Purchase**: `Page View` > `URL contém "/compra/sucesso"`
- **View Item**: `Page View` > `URL contém "/produto/"`
- **Add to Cart**: `Click` > `Botão "Adicionar ao orçamento"`

### 2.4 Criar Variáveis no GTM

- `click_id`: ID do elemento clicado
- `click_text`: Texto do botão clicado
- `click_url`: URL do botão
- `page_path`: Caminho da página atual
- `form_data`: Dados do formulário

---

## 3. SEO On-Page e Off-Page

### 3.1 SEO On-Page

#### Meta Tags Otimizadas

```tsx
// Cada página deve ter:
export async function generateMetadata() {
  return {
    title: "Nome da Página | Distribuidora de Cimento",
    description: "Descrição única de até 160 caracteres",
    keywords: "cimento, argamassa, materiais de construção",
    metadataBase: new URL("https://seusite.com"),
    openGraph: {
      title: "Título OG",
      description: "Descrição OG",
      type: "website",
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Título Twitter",
      description: "Descrição Twitter",
    },
  }
}
```

#### Sitemap XML

O `app/sitemap.ts` gera automaticamente o sitemap com todas as páginas importantes. Verifique em `https://seusite.com/sitemap.xml`.

#### Robots.txt

O `app/robots.ts` configura o robots.txt. Verifique em `https://seusite.com/robots.txt`.

#### URLs Amigáveis (SLUGs)

Todas as páginas de produto usam slug no URL: `/produto/nome-do-produto`

#### Velocidade do Site

- Use `next/image` para todas as imagens (lazy loading automático)
- Minifique CSS/JS
- Use `strategy="afterInteractive"` para scripts de terceiros
- Habilite compressão no servidor

### 3.2 SEO Off-Page

#### Google Business Profile

1. Crie o perfil em [Google Business](https://business.google.com)
2. Adicione fotos, horários, endereço
3. Peça avaliações de clientes
4. Publique atualizações semanais
5. Responda todas as avaliações

#### Diretórios Locais

Cadastre o site nos seguintes diretórios:
- Google Meu Negócio (já feito acima)
- Hotfrog Brasil
- Páginas Amarelas
- Buscapé (se aplicável)
- Zoom (se aplicável)

#### Backlinks

- Publique artigos em blogs de construção civil
- Participe de fóruns de construtores
- Faça parcerias com construtoras locais
- Crie conteúdo que outras empresas queiram linkar

---

## 4. Structured Data (JSON-LD)

### 4.1 O que é e por que usar

O JSON-LD é código que diz ao Google exatamente o que sua empresa e produtos são. Isso gera **Rich Snippets** nos resultados de busca, aumentando o CTR.

### 4.2 Implementação

O componente `components/store/seo-structured-data.tsx` já implementa:

- **LocalBusiness** — mostra sua empresa no Google Maps com telefone, endereço, horários
- **Product** — mostra preço, disponibilidade, avaliação para cada produto
- **FAQPage** — mostra perguntas frequentes expandidas nos resultados
- **BreadcrumbList** — mostra o caminho de navegação nos resultados

### 4.3 Como verificar

1. Teste no [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Teste no [Schema Markup Validator](https://validator.schema.org/)
3. Verifique no Google Search Console > Experiência de pesquisa

---

## 5. Compliance do Google Ads

### 5.1 Por que Importa

O Google Ads tem políticas rígidas que, se violadas, podem resultar em:
- Suspensão da conta
- Rejeição de anúncios
- Bloqueio permanente

### 5.2 Políticas Principais

#### 5.2.1 Política de Privacidade Obrigatória

- **Obrigatório ter página de privacidade visível** (link no rodapé)
- Deve conter: tipos de dados coletados, finalidade, direitos do usuário
- URL deve estar nos Termos de Serviço do Google Ads
- Link no site: `/politica-de-privacidade`

#### 5.2.2 Consentimento de Cookies

- Implemente banner de cookies (consentimento antes de carregar scripts)
- Use a biblioteca do Google Consent Mode v2
- O site deve ter cookie consent antes de disparar tags de conversão

**Implementação recomendada:**
```tsx
// Adicione no layout.tsx após o GTM
// Use um cookie consent banner antes de carregar scripts de marketing
```

#### 5.2.3 Política de Destino (Landing Page)

O site de destino deve ter:
- ✅ Informações de contato claras (telefone, e-mail, WhatsApp)
- ✅ Política de privacidade acessível
- ✅ Termos de uso acessíveis
- ✅ Endereço físico ou link para Google Maps
- ✅ Informações de preços transparentes
- ✅ Método de pagamento identificável
- ❌ Sem conteúdo enganoso ou enganoso
- ❌ Sem downloads forçados
- ❌ Sem pop-ups enganosos

#### 5.2.4 Política de Preços

- O preço exato deve estar visível na landing page
- Não pode haver preços ocultos
- Custos adicionais (frete, taxas) devem ser informados

#### 5.2.5 Política de Produtos Restritos

- **Cimento e produtos de construção**: geralmente permitidos
- Produtos químicos perigosos: podem ter restrições
- Produtos inflamáveis: requerem certificação especial

### 5.3 Checklist de Compliance

```
□ Página de privacidade publicada e linkada no rodapé
□ Termos de uso publicados e linkados
□ Informações de contato visíveis em todo o site
□ Política de preços transparente
□ Cookie consent implementado
□ Google Business Profile completo e verificado
□ Structured data validado no Google
□ Sitemap submetido no Google Search Console
□ Sem conteúdo enganoso ou spam
□ Site funciona corretamente em dispositivos móveis
□ Tempo de carregamento < 3 segundos
□ SSL (HTTPS) ativo
```

---

## 6. Redução de Custo por Lead

### 6.1 Estratégias para Reduzir o CPC

#### 6.1.1 Qualidade do Score

O **Quality Score** é o fator mais importante para reduzir o CPC:

- **CTR esperado**: Anúncios com melhor taxa de clique têm custo menor
- **Relevância do anúncio**: Texto de anúncio deve corresponder ao que o usuário busca
- **Experiência da landing page**: Site rápido, relevante, com call-to-action claro

**Para melhorar o Quality Score:**
1. Agrupe palavras-chave relacionadas em ad groups separados
2. Escreva anúncios específicos para cada grupo
3. Use extensões de anúncio (sitelinks, callouts, structured snippets)
4. Otimize a landing page para velocidade e relevância

#### 6.1.2 Extensões de Anúncio (Gratuitas e Aumentam CTR)

Adicione estas extensões aos seus anúncios:

| Extensão | Descrição |
|---|---|
| **Sitelinks** | Links para páginas específicas (Cimento, Argamassa, Tijolos, etc.) |
| **Callouts** | "Entrega Rápida", "Preço de Atacado", "Atendimento WhatsApp" |
| **Structured Snippets** | "Categorias: Cimento, Argamassa, Hidráulica, Elétrica" |
| **Call Extensions** | Mostra o telefone diretamente no anúncio |
| **Location Extensions** | Mostra endereço no mapa |
| **Lead Form Extensions** | Formulário embutido no anúncio para capturar leads |

#### 6.1.3 Remarketing para Reduzir Custo

O remarketing é **50-70% mais barato** que aquisição nova:

1. Crie audiências no Google Ads:
   - Visitantes do site (cookie de 30 dias)
   - Quem clicou no WhatsApp mas não comprou
   - Quem visualizou produtos mas não adicionou ao carrinho

2. Crie campanhas de remarketing com lances menores (50-70% do CPC original)

3. Crie anúncios específicos para cada audiência

#### 6.1.4 Otimização de Landing Page para WhatsApp

O WhatsApp é o principal conversor para materiais de construção. Otimize:

```tsx
// Na landing page do anúncio:
// 1. O primeiro viewport deve ter o botão de WhatsApp visível
// 2. Use CTA direto: "Fale com um vendedor agora"
// 3. Mostre preços iniciais para criar urgência
// 4. Use depoimentos de clientes
// 5. Adicione selos de confiança (ABNT, garantia, etc.)
```

### 6.2 Rastreamento de ROI

Monitore estas métricas:

| Métrica | Meta | Como calcular |
|---|---|---|
| **CPL (Custo por Lead)** | < R$ 15,00 | Gasto total / Nº de leads |
| **CTR (Taxa de Clique)** | > 3% | Cliques / Impressões |
| **Taxa de Conversão** | > 5% | Conversões / Cliques |
| **ROAS (Retorno)** | > 300% | Receita / Gasto |
| **CPA (Custo por Aquisição)** | < R$ 50,00 | Gasto / Nº de clientes |

---

## 7. Conversions API (CAPI)

### 7.1 O que é

O Conversions API (CAPI) envia dados de conversão **diretamente do servidor para o Google**, sem depender de cookies ou pixels no navegador. Isso:

- ✅ Funciona com bloqueadores de anúncios
- ✅ Mais preciso que o pixel tracking
- ✅ Protege a privacidade do usuário
- ✅ Melhora o Quality Score (dados mais precisos)

### 7.2 Como Implementar

O arquivo `lib/google-ads.ts` contém a função `sendCapiEvent()`.

**Fluxo recomendado:**

1. O usuário clica no WhatsApp (frontend)
2. O frontend dispara o evento de conversão normal
3. O backend envia o evento CAPI direto para o Google
4. O Google recebe e atribui a conversão

```typescript
// Exemplo de uso:
const event = createWhatsappCapiEvent("home_cta", "16999999999", "usuario@email.com")
await sendCapiEvent(event)
```

### 7.3 Configuração no Google Ads

1. Vá em **Ferramentas > Conversões**
2. Selecione a conversão desejada
3. Clique em **"Editar configuração"**
4. Ative **"Conversions API"**
5. Selecione **"Google Tag Manager"** ou **"Implementação manual"**
6. Copie o API key e conversion action

---

## 8. Checklist Final

### Antes de Lançar Campanhas

```
□ Site funcionando sem erros
□ pnpm install concluído
□ pnpm build compila sem erros
□ .env.local configurado com todas as variáveis
□ Google Ads conta criada e campaign ativa
□ Tags de conversão criadas no Google Ads
□ GTM contêiner instalado e tags configuradas
□ Consent Mode v2 implementado
□ Página de privacidade publicada
□ Termos de uso publicados
□ Google Business Profile configurado
□ Sitemap gerado e submetido
□ robots.txt configurado
□ Structured data validado
□ Todas as páginas com meta tags SEO
□ Imagens otimizadas (next/image)
□ Site funciona em mobile
□ Velocidade < 3 segundos
□ Sem conteúdo enganoso
□ SSL ativo (HTTPS)
□ Botões de WhatsApp rastreando conversões
□ CAPI configurado
□ Remarketing configurado
□ Extensões de anúncio adicionadas
```

### Após Lançamento (Otimização Contínua)

```
□ Monitorar CPC, CTR, CPA diariamente
□ Otimizar grupos de anúncios com baixo desempenho
□ Adicionar novas palavras-chave negativas
□ Testar novos textos de anúncio
□ A/B testar landing pages
□ Atualizar produtos com preços competitivos
□ Monitorar avaliações e responder
□ Ajustar lances com base em conversões
□ Expandir para novos horários/regiões
□ Criar campanhas sazonais (Carnaval, volta às aulas, fim de ano)
```

---

## Arquivos Criados/Modificados

| Arquivo | Descrição |
|---|---|
| `lib/google-ads.ts` | Sistema completo de conversão Google Ads |
| `lib/track-whatsapp.ts` | Rastreamento de WhatsApp com integração Google Ads |
| `lib/seo.ts` | Utilitários de SEO (canonical, OG, structured data) |
| `components/store/seo-structured-data.tsx` | Componentes JSON-LD para Next.js |
| `app/sitemap.ts` | Sitemap XML dinâmico |
| `app/robots.ts` | Robots.txt dinâmico |
| `app/privacy/page.tsx` | Página de privacidade para compliance |
| `.env.example` | Variáveis de ambiente para Google Ads e GTM |
| `marketing-guide.md` | Este guia completo |

---

## Links Úteis

- [Google Ads](https://ads.google.com)
- [Tag Manager](https://tagmanager.google.com)
- [Google Business Profile](https://business.google.com)
- [Google Search Console](https://search.google.com/search-console)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [Google Ads Policies](https://support.google.com/google-ads/answer/1346295)
- [Google Consent Mode v2](https://developers.google.com/tag-platform/tag-manager/consent)
- [Google Conversions API](https://developers.google.com/google-ads/conversions-api)
