-- ============================================================================
-- 013_catalog_rebuild.sql
-- Reconstrução completa do catálogo de produtos
-- Distribuidora Cimento & Cal
-- ============================================================================
-- ATENÇÃO: Este script APAGA todos os produtos, subcategorias e categorias
-- existentes e recria um catálogo 100% correto e organizado.
-- Execute no Supabase SQL Editor.
-- ============================================================================

BEGIN;

-- ── 1. LIMPEZA (ordem respeitando FK) ────────────────────────────────────────
DELETE FROM reviews;
DELETE FROM order_items;
DELETE FROM products;
DELETE FROM subcategories;
DELETE FROM categories;

-- ── 2. CATEGORIAS ─────────────────────────────────────────────────────────────
INSERT INTO categories (id, name, slug, description, sort_order, active) VALUES
  ('cat-01', 'Cimento e Cal',               'cimento-e-cal',              'Cimentos Portland e Cal Hidratada para todas as aplicações da construção civil.',        1,  true),
  ('cat-02', 'Argamassas',                  'argamassas',                 'Argamassas industrializadas para assentamento, revestimento, chapisco e massa fina.',   2,  true),
  ('cat-03', 'Tijolos e Blocos',             'tijolos-e-blocos',           'Tijolos cerâmicos e blocos de concreto para alvenaria convencional e estrutural.',      3,  true),
  ('cat-04', 'Pisos e Revestimentos',        'pisos-e-revestimentos',      'Cerâmicas, porcelanatos, rejuntes e pisos cimentícios para ambientes internos.',         4,  true),
  ('cat-05', 'Areia e Brita',               'areia-e-brita',              'Areia lavada e britas de granulometria variada para concreto e argamassa.',              5,  true),
  ('cat-06', 'Saneamento e Hidráulica',      'saneamento-e-hidraulica',    'Tubos, conexões, ralos e caixas d`água para instalações hidrossanitárias.',              6,  true),
  ('cat-07', 'Drywall e Forro',             'drywall-e-forro',            'Chapas de drywall, perfis metálicos e forros de PVC e gesso.',                           7,  true),
  ('cat-08', 'Tintas e Impermeabilizantes',  'tintas-e-impermeabilizantes','Tintas acrílicas, impermeabilizantes, massa corrida e seladores.',                       8,  true),
  ('cat-09', 'Ferramentas e EPI',            'ferramentas-e-epi',          'Ferramentas manuais, elétricas, betoneiras e equipamentos de proteção individual.',     9,  true),
  ('cat-10', 'Aço e Estrutura',             'aco-e-estrutura',            'Vergalhões, telas soldadas e arames para estruturas de concreto armado.',               10, true);

-- ── 3. SUBCATEGORIAS ──────────────────────────────────────────────────────────

-- Cimento e Cal
INSERT INTO subcategories (id, name, slug, category_id, sort_order, active) VALUES
  ('sub-01-01', 'Cimento CP II',     'cimento-cp-ii',     'cat-01', 1, true),
  ('sub-01-02', 'Cimento CP III',    'cimento-cp-iii',    'cat-01', 2, true),
  ('sub-01-03', 'Cimento CP V ARI',  'cimento-cp-v-ari',  'cat-01', 3, true),
  ('sub-01-04', 'Cimento Branco',    'cimento-branco',    'cat-01', 4, true),
  ('sub-01-05', 'Cal Hidratada',     'cal-hidratada',     'cat-01', 5, true);

-- Argamassas
INSERT INTO subcategories (id, name, slug, category_id, sort_order, active) VALUES
  ('sub-02-01', 'Argamassa de Assentamento', 'argamassa-assentamento', 'cat-02', 1, true),
  ('sub-02-02', 'Argamassa de Revestimento', 'argamassa-revestimento', 'cat-02', 2, true),
  ('sub-02-03', 'Chapisco',                  'chapisco',                'cat-02', 3, true),
  ('sub-02-04', 'Reboco',                    'reboco',                  'cat-02', 4, true),
  ('sub-02-05', 'Massa Fina',                'massa-fina',              'cat-02', 5, true),
  ('sub-02-06', 'Graute',                    'graute',                  'cat-02', 6, true);

-- Tijolos e Blocos
INSERT INTO subcategories (id, name, slug, category_id, sort_order, active) VALUES
  ('sub-03-01', 'Tijolo Cerâmico',   'tijolo-ceramico',   'cat-03', 1, true),
  ('sub-03-02', 'Bloco de Concreto', 'bloco-de-concreto', 'cat-03', 2, true),
  ('sub-03-03', 'Bloco Estrutural',  'bloco-estrutural',  'cat-03', 3, true),
  ('sub-03-04', 'Bloco de Vedação',  'bloco-de-vedacao',  'cat-03', 4, true);

-- Pisos e Revestimentos
INSERT INTO subcategories (id, name, slug, category_id, sort_order, active) VALUES
  ('sub-04-01', 'Cerâmica',         'ceramica',         'cat-04', 1, true),
  ('sub-04-02', 'Porcelanato',      'porcelanato',      'cat-04', 2, true),
  ('sub-04-03', 'Rejunte',          'rejunte',          'cat-04', 3, true),
  ('sub-04-04', 'Piso Cimentício',  'piso-cimenticio',  'cat-04', 4, true);

-- Areia e Brita
INSERT INTO subcategories (id, name, slug, category_id, sort_order, active) VALUES
  ('sub-05-01', 'Areia Fina Lavada', 'areia-fina-lavada', 'cat-05', 1, true),
  ('sub-05-02', 'Areia Grossa',      'areia-grossa',      'cat-05', 2, true),
  ('sub-05-03', 'Brita 0',          'brita-0',           'cat-05', 3, true),
  ('sub-05-04', 'Brita 1',          'brita-1',           'cat-05', 4, true),
  ('sub-05-05', 'Pedrisco',         'pedrisco',          'cat-05', 5, true);

-- Saneamento e Hidráulica
INSERT INTO subcategories (id, name, slug, category_id, sort_order, active) VALUES
  ('sub-06-01', 'Tubos PVC',         'tubos-pvc',         'cat-06', 1, true),
  ('sub-06-02', 'Conexões',          'conexoes',          'cat-06', 2, true),
  ('sub-06-03', 'Ralos',             'ralos',             'cat-06', 3, true),
  ('sub-06-04', 'Caixas d''água',    'caixas-dagua',      'cat-06', 4, true),
  ('sub-06-05', 'Registros',         'registros',         'cat-06', 5, true);

-- Drywall e Forro
INSERT INTO subcategories (id, name, slug, category_id, sort_order, active) VALUES
  ('sub-07-01', 'Chapas Drywall',    'chapas-drywall',   'cat-07', 1, true),
  ('sub-07-02', 'Perfis Metálicos',  'perfis-metalicos', 'cat-07', 2, true),
  ('sub-07-03', 'Forro PVC',         'forro-pvc',        'cat-07', 3, true),
  ('sub-07-04', 'Forro de Gesso',    'forro-de-gesso',   'cat-07', 4, true);

-- Tintas e Impermeabilizantes
INSERT INTO subcategories (id, name, slug, category_id, sort_order, active) VALUES
  ('sub-08-01', 'Tintas Acrílicas',      'tintas-acrilicas',      'cat-08', 1, true),
  ('sub-08-02', 'Impermeabilizantes',    'impermeabilizantes',    'cat-08', 2, true),
  ('sub-08-03', 'Massa Corrida',         'massa-corrida',         'cat-08', 3, true),
  ('sub-08-04', 'Seladores e Primers',   'seladores-e-primers',   'cat-08', 4, true);

-- Ferramentas e EPI
INSERT INTO subcategories (id, name, slug, category_id, sort_order, active) VALUES
  ('sub-09-01', 'Ferramentas Manuais',   'ferramentas-manuais',   'cat-09', 1, true),
  ('sub-09-02', 'Ferramentas Elétricas', 'ferramentas-eletricas', 'cat-09', 2, true),
  ('sub-09-03', 'EPI',                   'epi',                   'cat-09', 3, true),
  ('sub-09-04', 'Betoneiras',            'betoneiras',            'cat-09', 4, true);

-- Aço e Estrutura
INSERT INTO subcategories (id, name, slug, category_id, sort_order, active) VALUES
  ('sub-10-01', 'Vergalhões',     'vergalhoes',     'cat-10', 1, true),
  ('sub-10-02', 'Tela Soldada',   'tela-soldada',   'cat-10', 2, true),
  ('sub-10-03', 'Arame',         'arame',          'cat-10', 3, true),
  ('sub-10-04', 'Prego',         'prego',          'cat-10', 4, true);

-- ── 4. PRODUTOS ──────────────────────────────────────────────────────────────
-- Preços: tabela de atacado (distribuidora), referência jul/2025.
-- Stock: 500 (simbólico para atacado). Ajuste conforme estoque real.

INSERT INTO products (
  name, slug, description, price, original_price,
  category_id, subcategory_id,
  unit, stock, active, featured, is_new, is_discount,
  sku, weight
) VALUES

-- ════════════════════════════════════════════════════════════════════════════
-- CIMENTO E CAL
-- ════════════════════════════════════════════════════════════════════════════

(
  'Cimento CP II-F 32 - Votoran - Saco 50kg',
  'cimento-cp-ii-f-32-votoran-50kg',
  'Cimento Portland Composto com fíler — CP II-F 32 — ideal para uso geral em obras residenciais e comerciais. Excelente trabalhabilidade e boa resistência à compressão. Aprovado pelas normas ABNT NBR 11578. Fabricado pela Votorantim Cimentos, líder do setor no Brasil.',
  38.90, 42.00,
  'cat-01', 'sub-01-01',
  'saco', 500, true, true, false, true,
  'CIM-CPII-F32-VOT-50KG', 50
),
(
  'Cimento CP II-F 32 - Votoran - Saco 25kg',
  'cimento-cp-ii-f-32-votoran-25kg',
  'Cimento Portland Composto CP II-F 32 em embalagem de 25kg — ideal para pequenas obras, reformas e reparos. Mesma qualidade Votoran em formato prático. Norma ABNT NBR 11578.',
  21.90, 24.00,
  'cat-01', 'sub-01-01',
  'saco', 500, true, false, false, false,
  'CIM-CPII-F32-VOT-25KG', 25
),
(
  'Cimento CP II-Z 32 - InterCement - Saco 50kg',
  'cimento-cp-ii-z-32-intercement-50kg',
  'Cimento Portland Composto com Pozolana — CP II-Z 32 — da InterCement. Maior resistência à penetração de agentes agressivos (sulfatos e cloretos), recomendado para obras em ambientes úmidos, fundações e lajes. Norma ABNT NBR 11578.',
  39.50, null,
  'cat-01', 'sub-01-01',
  'saco', 500, true, false, false, false,
  'CIM-CPII-Z32-ICM-50KG', 50
),
(
  'Cimento CP II-E 32 - Nassau - Saco 50kg',
  'cimento-cp-ii-e-32-nassau-50kg',
  'Cimento Portland Composto com Escória de Alto Forno — CP II-E 32 — Nassau. Excelente durabilidade e resistência a meios agressivos. Indicado para concreto de pisos, fundações e obras em contato com o solo. Norma ABNT NBR 11578.',
  38.50, null,
  'cat-01', 'sub-01-01',
  'saco', 500, true, false, false, false,
  'CIM-CPII-E32-NSS-50KG', 50
),
(
  'Cimento CP III 40 RS - Votoran - Saco 50kg',
  'cimento-cp-iii-40-rs-votoran-50kg',
  'Cimento Portland de Alto-Forno — CP III 40 RS — resistente a sulfatos. Contém alto teor de escória de alto-forno, resultando em baixo calor de hidratação. Ideal para obras de grande porte (barragens, pontes, estruturas maciças) e ambientes com presença de sulfatos. Norma ABNT NBR 5735.',
  41.90, null,
  'cat-01', 'sub-01-02',
  'saco', 300, true, false, false, false,
  'CIM-CPIII-40RS-VOT-50KG', 50
),
(
  'Cimento CP V ARI - Votoran - Saco 50kg',
  'cimento-cp-v-ari-votoran-50kg',
  'Cimento Portland de Alta Resistência Inicial — CP V ARI. Atinge resistência superior logo nos primeiros dias de cura. Ideal para pré-moldados, concreto projetado, obras com alta demanda de resistência precoce e protendidos. Norma ABNT NBR 5733.',
  43.90, 46.00,
  'cat-01', 'sub-01-03',
  'saco', 300, true, true, false, false,
  'CIM-CPV-ARI-VOT-50KG', 50
),
(
  'Cimento CP V ARI RS - InterCement - Saco 50kg',
  'cimento-cp-v-ari-rs-intercement-50kg',
  'Cimento Portland de Alta Resistência Inicial Resistente a Sulfatos — CP V ARI RS. Combinação das propriedades de alta resistência inicial com resistência a meios agressivos. Indicado para pré-moldados, ambientes industriais e obras marítimas.',
  45.50, null,
  'cat-01', 'sub-01-03',
  'saco', 200, true, false, false, false,
  'CIM-CPV-ARIS-ICM-50KG', 50
),
(
  'Cimento Branco Estrutural CP II - Votoran - Saco 50kg',
  'cimento-branco-estrutural-votoran-50kg',
  'Cimento Portland Branco Estrutural CP II. Mesma resistência do cimento cinza, porém com coloração branca pura para aplicações decorativas. Ideal para argamassa de rejunte fino, pastilhas, pastilhas de vidro, concreto aparente branco e mosaicos. Norma ABNT NBR 12989.',
  59.90, 65.00,
  'cat-01', 'sub-01-04',
  'saco', 150, true, false, false, true,
  'CIM-BRAN-CPII-VOT-50KG', 50
),
(
  'Cal Hidratada CH-I - Tocantins - Saco 20kg',
  'cal-hidratada-ch-i-tocantins-20kg',
  'Cal Hidratada superior CH-I, máxima pureza e granulometria fina. Indispensável na argamassa de assentamento e revestimento de alvenaria (traço cimento:cal:areia). Melhora a plasticidade, trabalhabilidade e retenção de água das argamassas. Norma ABNT NBR 7175.',
  24.90, 27.00,
  'cat-01', 'sub-01-05',
  'saco', 500, true, true, false, true,
  'CAL-CH1-TOC-20KG', 20
),
(
  'Cal Hidratada CH-II - Cauê - Saco 20kg',
  'cal-hidratada-ch-ii-caue-20kg',
  'Cal Hidratada comum CH-II. Amplamente utilizada em argamassas de revestimento, pintura caiada e correção de pH do solo. Boa trabalhabilidade e plasticidade. Norma ABNT NBR 7175.',
  19.90, null,
  'cat-01', 'sub-01-05',
  'saco', 500, true, false, false, false,
  'CAL-CHII-CAU-20KG', 20
),
(
  'Cal Hidratada CH-II - Cauê - Saco 7kg',
  'cal-hidratada-ch-ii-caue-7kg',
  'Cal Hidratada comum CH-II em embalagem de 7kg — formato prático para pequenas obras, manutenção e reparos. Norma ABNT NBR 7175.',
  8.90, null,
  'cat-01', 'sub-01-05',
  'saco', 300, true, false, false, false,
  'CAL-CHII-CAU-7KG', 7
),

-- ════════════════════════════════════════════════════════════════════════════
-- ARGAMASSAS
-- ════════════════════════════════════════════════════════════════════════════

(
  'Argamassa de Assentamento AC I - Quartzolit - Saco 20kg',
  'argamassa-assentamento-ac-i-quartzolit-20kg',
  'Argamassa colante AC I para assentamento de revestimentos cerâmicos em pisos e paredes internas de baixa absorção de água (até 3mm). Aplicação em fachadas simples e pisos de baixo tráfego. Fabricação Quartzolit — Saint-Gobain. Norma ABNT NBR 14081.',
  18.90, 21.00,
  'cat-02', 'sub-02-01',
  'saco', 500, true, true, false, true,
  'ARG-ACI-QZL-20KG', 20
),
(
  'Argamassa de Assentamento AC II - Weber - Saco 20kg',
  'argamassa-assentamento-ac-ii-weber-20kg',
  'Argamassa colante AC II com aditivos melhorados para assentamento de cerâmicas, porcelanatos e pedras naturais. Maior aderência e tempo aberto de trabalho. Ideal para piscinas, fachadas externas e pisos de alto tráfego. Norma ABNT NBR 14081.',
  22.90, 25.00,
  'cat-02', 'sub-02-01',
  'saco', 500, true, false, false, false,
  'ARG-ACII-WBR-20KG', 20
),
(
  'Argamassa de Assentamento AC III - Quartzolit - Saco 20kg',
  'argamassa-assentamento-ac-iii-quartzolit-20kg',
  'Argamassa colante AC III com propriedades melhoradas e alta aderência para substratos difíceis. Indicada para grandes formatos (pedras, mármores, porcelanatos 60x60 ou maiores), assentamento de pastilhas e superfícies de baixa aderência. Norma ABNT NBR 14081.',
  28.90, 31.00,
  'cat-02', 'sub-02-01',
  'saco', 300, true, false, false, false,
  'ARG-ACIII-QZL-20KG', 20
),
(
  'Argamassa de Assentamento para Bloco - Nacional - Saco 20kg',
  'argamassa-assentamento-bloco-nacional-20kg',
  'Argamassa industrializada para assentamento de alvenaria de blocos cerâmicos e de concreto. Preparo rápido — basta adicionar água. Elimina o traço manual e garante espessura de junta uniforme de 10mm. Produção até 2x mais rápida que a argamassa convencional.',
  16.90, null,
  'cat-02', 'sub-02-01',
  'saco', 500, true, false, false, false,
  'ARG-BLK-NAC-20KG', 20
),
(
  'Argamassa de Revestimento Interno - Proquil - Saco 20kg',
  'argamassa-revestimento-interno-proquil-20kg',
  'Argamassa industrializada para revestimento de paredes e tetos internos. Substitui o traço manual cimento:cal:areia. Excelente trabalhabilidade, aderência e acabamento. Espessura de aplicação de 10 a 30mm por camada.',
  17.50, null,
  'cat-02', 'sub-02-02',
  'saco', 500, true, false, false, false,
  'ARG-REV-INT-PRQ-20KG', 20
),
(
  'Chapisco Rolado - Votorantim - Saco 20kg',
  'chapisco-rolado-votorantim-20kg',
  'Chapisco industrializado para preparo de base em paredes e lajes antes do reboco. Aplicação por rolo de espuma — processo limpo, rápido e uniforme. Excelente aderência ao concreto, blocos de concreto e alvenaria cerâmica. Elimina a mistura manual com cimento puro.',
  15.90, 17.50,
  'cat-02', 'sub-02-03',
  'saco', 400, true, true, false, true,
  'CHP-ROL-VOT-20KG', 20
),
(
  'Chapisco Convencional - Nacional - Saco 20kg',
  'chapisco-convencional-nacional-20kg',
  'Chapisco industrializado tradicional para aplicação com colher de pedreiro (lance). Prepara a base para recebimento do reboco e massa. Alta aderência e resistência. Aplicado em espessura fina de 5 a 8mm.',
  13.90, null,
  'cat-02', 'sub-02-03',
  'saco', 300, true, false, false, false,
  'CHP-CON-NAC-20KG', 20
),
(
  'Reboco Industrializado - Proquil - Saco 20kg',
  'reboco-industrializado-proquil-20kg',
  'Reboco industrializado (emboço) para regularização de paredes externas e internas antes do acabamento final. Alta resistência e aderência. Aplicação manual ou projetada. Espessura de 15 a 25mm. Reduz o tempo de obra e o desperdício de material.',
  17.90, null,
  'cat-02', 'sub-02-04',
  'saco', 400, true, false, false, false,
  'RBC-IND-PRQ-20KG', 20
),
(
  'Massa Fina Interna - Quartzolit - Saco 20kg',
  'massa-fina-interna-quartzolit-20kg',
  'Massa fina industrializada para acabamento interno de alta qualidade. Garante superfície lisa e pronta para pintura. Aplicação sobre reboco ou concreto regularizado. Excelente trabalhabilidade, sem fissuração. Espessura máxima de 5mm.',
  24.90, 27.00,
  'cat-02', 'sub-02-05',
  'saco', 400, true, true, false, true,
  'MSF-INT-QZL-20KG', 20
),
(
  'Graute Estrutural - Proquil - Saco 25kg',
  'graute-estrutural-proquil-25kg',
  'Graute de alta resistência para preenchimento de alvéolos de blocos estruturais, fixação de pinos, chumbamento de ferragens e nivelamento de equipamentos. Consistência fluida sem segregação. Resistência mínima 20 MPa aos 28 dias. Norma ABNT NBR 15270.',
  32.90, null,
  'cat-02', 'sub-02-06',
  'saco', 200, true, false, false, false,
  'GRA-EST-PRQ-25KG', 25
),

-- ════════════════════════════════════════════════════════════════════════════
-- TIJOLOS E BLOCOS
-- ════════════════════════════════════════════════════════════════════════════

(
  'Tijolo Cerâmico 6 Furos 9x19x19cm - Unidade',
  'tijolo-ceramico-6-furos-9x19x19',
  'Tijolo cerâmico de 6 furos, dimensões 9x19x19cm — o mais utilizado na construção civil brasileira para alvenaria de vedação. Baixo peso, boa resistência à compressão e excelente isolamento térmico e acústico. Fabricado em conformidade com a norma ABNT NBR 15270.',
  0.65, null,
  'cat-03', 'sub-03-01',
  'un', 50000, true, false, false, false,
  'TJL-CER-6F-9X19X19', 2.2
),
(
  'Tijolo Cerâmico 8 Furos 9x19x19cm - Unidade',
  'tijolo-ceramico-8-furos-9x19x19',
  'Tijolo cerâmico de 8 furos — maior resistência à compressão que o de 6 furos. Indicado para paredes que receberão cargas maiores ou onde se exige maior rigidez estrutural. Dimensões 9x19x19cm. Norma ABNT NBR 15270.',
  0.75, null,
  'cat-03', 'sub-03-01',
  'un', 30000, true, false, false, false,
  'TJL-CER-8F-9X19X19', 2.5
),
(
  'Bloco de Concreto de Vedação 9x19x39cm - Unidade',
  'bloco-concreto-vedacao-9x19x39',
  'Bloco de concreto de vedação (não estrutural) — largura 9cm, espessura 19cm, comprimento 39cm. Ideal para divisórias, paredes internas e fechamentos de vãos. Superfície texturizada para excelente aderência de reboco. Produzido com concreto de alta resistência. Norma ABNT NBR 6136.',
  2.80, null,
  'cat-03', 'sub-03-04',
  'un', 20000, true, false, false, false,
  'BLC-CNT-VED-9X19X39', 11.5
),
(
  'Bloco de Concreto de Vedação 14x19x39cm - Unidade',
  'bloco-concreto-vedacao-14x19x39',
  'Bloco de concreto de vedação — largura 14cm, espessura 19cm, comprimento 39cm. Para paredes externas com maior espessura, melhor isolamento térmico e acústico. Excelente resistência e durabilidade. Norma ABNT NBR 6136.',
  3.50, null,
  'cat-03', 'sub-03-04',
  'un', 15000, true, false, false, false,
  'BLC-CNT-VED-14X19X39', 16.0
),
(
  'Bloco Estrutural de Concreto 14x19x39cm - Unidade',
  'bloco-estrutural-concreto-14x19x39',
  'Bloco de concreto estrutural — utilizado em sistemas de alvenaria estrutural que dispensam pilares e vigas convencionais. Resistência mínima de 8 MPa. Dimensões 14x19x39cm. Ideal para prédios de até 5 pavimentos. Norma ABNT NBR 6136 classe A.',
  4.90, null,
  'cat-03', 'sub-03-03',
  'un', 10000, true, true, false, false,
  'BLC-EST-CNT-14X19X39', 17.5
),
(
  'Bloco Estrutural de Concreto 19x19x39cm - Unidade',
  'bloco-estrutural-concreto-19x19x39',
  'Bloco de concreto estrutural de maior espessura (19cm). Maior resistência à compressão — mínimo 10 MPa. Para paredes estruturais externas de edifícios de médio e grande porte. Norma ABNT NBR 6136 classe A.',
  5.90, null,
  'cat-03', 'sub-03-03',
  'un', 8000, true, false, false, false,
  'BLC-EST-CNT-19X19X39', 23.0
),

-- ════════════════════════════════════════════════════════════════════════════
-- AREIA E BRITA
-- ════════════════════════════════════════════════════════════════════════════

(
  'Areia Fina Lavada - Metro Cúbico (m³)',
  'areia-fina-lavada-m3',
  'Areia fina lavada e peneirada, granulometria de 0,1 a 0,5mm. Indicada para massa fina, argamassa de revestimento, reboco e fabricação de argamassas industrializadas. Produto certificado, sem impurezas orgânicas ou torrões de argila.',
  95.00, null,
  'cat-05', 'sub-05-01',
  'm³', 999, true, false, false, false,
  'ARE-FIN-LAV-M3', null
),
(
  'Areia Grossa Lavada - Metro Cúbico (m³)',
  'areia-grossa-lavada-m3',
  'Areia grossa lavada, granulometria de 1 a 2,5mm. Ideal para concreto estrutural (traço cimento:areia:brita), argamassa de assentamento e contrapiso. Alta resistência mecânica ao concreto. Produto limpo e certificado.',
  89.00, null,
  'cat-05', 'sub-05-02',
  'm³', 999, true, false, false, false,
  'ARE-GRS-LAV-M3', null
),
(
  'Brita 0 (Pedrisco) - Metro Cúbico (m³)',
  'brita-0-pedrisco-m3',
  'Brita 0 (pedrisco), diâmetro máx. 9,5mm. Utilizada em concreto para pequenas peças, argamassas especiais, aterros e drenagens. Excelente trabalhabilidade no concreto magro e em pisos. Material britado de granito/gnaisse de alta resistência.',
  120.00, null,
  'cat-05', 'sub-05-03',
  'm³', 999, true, false, false, false,
  'BRT-0-M3', null
),
(
  'Brita 1 - Metro Cúbico (m³)',
  'brita-1-m3',
  'Brita 1, diâmetro entre 9,5 e 25mm — o agregado graúdo mais utilizado no Brasil para concreto estrutural. Resistência à compressão e abrasão superiores. Ideal para vigas, pilares, lajes e fundações. Material britado de granito.',
  115.00, null,
  'cat-05', 'sub-05-04',
  'm³', 999, true, false, false, false,
  'BRT-1-M3', null
),
(
  'Pedrisco Fino - Metro Cúbico (m³)',
  'pedrisco-fino-m3',
  'Pedrisco fino (Brita 0 fina), diâmetro máx. 6,3mm. Utilizado em concreto de alta resistência, pisos intertravados e drenagem de fundações. Excelente encaixe entre os grãos, resultando em menor consumo de cimento.',
  125.00, null,
  'cat-05', 'sub-05-05',
  'm³', 999, true, false, false, false,
  'PED-FIN-M3', null
),

-- ════════════════════════════════════════════════════════════════════════════
-- SANEAMENTO E HIDRÁULICA
-- ════════════════════════════════════════════════════════════════════════════

(
  'Tubo PVC Esgoto 100mm (4") Série Normal - Tigre - Barra 6m',
  'tubo-pvc-esgoto-100mm-tigre-6m',
  'Tubo PVC rígido para esgoto sanitário, diâmetro 100mm (4") — o mais utilizado para ramais de banheiros, vasos sanitários e pias. Série normal, cor alaranjada, espessura parede 3,0mm. Fabricante Tigre S/A, referência nacional. Norma NBR 5688.',
  45.90, null,
  'cat-06', 'sub-06-01',
  'barra', 200, true, true, false, false,
  'TBO-PVC-ESG-100-TGR-6M', null
),
(
  'Tubo PVC Esgoto 150mm (6") Série Normal - Tigre - Barra 6m',
  'tubo-pvc-esgoto-150mm-tigre-6m',
  'Tubo PVC rígido para esgoto sanitário, diâmetro 150mm (6") para colunas principais, coletores prediais e redes externas. Série normal, cor alaranjada. Alta resistência ao impacto e aos produtos químicos do esgoto. Norma NBR 5688.',
  72.00, null,
  'cat-06', 'sub-06-01',
  'barra', 150, true, false, false, false,
  'TBO-PVC-ESG-150-TGR-6M', null
),
(
  'Tubo PVC Esgoto 50mm (2") Série Normal - Tigre - Barra 6m',
  'tubo-pvc-esgoto-50mm-tigre-6m',
  'Tubo PVC rígido para esgoto, diâmetro 50mm (2") para ramais de pias de cozinha, máquinas de lavar, lavatórios e ralos. Série normal. Alta resistência e baixo custo. Norma NBR 5688.',
  24.90, null,
  'cat-06', 'sub-06-01',
  'barra', 200, true, false, false, false,
  'TBO-PVC-ESG-50-TGR-6M', null
),
(
  'Caixa d''água 500L - Fortlev - Polietileno',
  'caixa-dagua-500l-fortlev',
  'Caixa d''água 500 litros em polietileno de alta densidade, tampa rosca, proteção UV. Resistente ao calor, raios ultravioleta e agentes químicos presentes na água tratada. Inclui tampão. Fabricante Fortlev, empresa referência no segmento. Norma ABNT NBR 14799.',
  189.00, 219.00,
  'cat-06', 'sub-06-04',
  'un', 50, true, true, false, true,
  'CXA-500L-FLV-POLI', null
),
(
  'Caixa d''água 1000L - Fortlev - Polietileno',
  'caixa-dagua-1000l-fortlev',
  'Caixa d''água 1000 litros em polietileno de alta densidade. Para residências maiores, sobrados ou uso comercial. Tampa com rosca, 4 orifícios (entrada, saída, ladrão e limpeza). Proteção UV garantida. Norma ABNT NBR 14799.',
  329.00, 369.00,
  'cat-06', 'sub-06-04',
  'un', 30, true, true, false, true,
  'CXA-1000L-FLV-POLI', null
),
(
  'Caixa d''água 2000L - Fortlev - Polietileno',
  'caixa-dagua-2000l-fortlev',
  'Caixa d''água 2000 litros em polietileno de alta densidade. Para residências grandes, estabelecimentos comerciais ou uso em obras. Ideal para locais com abastecimento irregular. Proteção UV e 4 orifícios. Norma ABNT NBR 14799.',
  589.00, null,
  'cat-06', 'sub-06-04',
  'un', 15, true, false, false, false,
  'CXA-2000L-FLV-POLI', null
),
(
  'Ralo Quadrado PVC 100x100mm - Tigre - Unidade',
  'ralo-quadrado-pvc-100mm-tigre',
  'Ralo quadrado em PVC 100x100mm com cesto coletador e grelha removível. Para banheiros, áreas de serviço e varandas. Conexão para tubo de 50mm. Resistente a impactos, fácil instalação e manutenção. Fabricante Tigre.',
  8.90, null,
  'cat-06', 'sub-06-03',
  'un', 200, true, false, false, false,
  'RAL-QUA-PVC-100-TGR', null
),
(
  'Ralo Linear PVC 15cm - Tigre - Unidade',
  'ralo-linear-pvc-15cm-tigre',
  'Ralo linear (canaleta) PVC com grelha 15cm. Design moderno para box de banheiro, área gourmet e lavanderias. Permite saída da água ao longo de toda a extensão. Conexão para tubo 40mm. Fácil instalação e limpeza.',
  15.90, null,
  'cat-06', 'sub-06-03',
  'un', 150, true, false, false, false,
  'RAL-LIN-PVC-15-TGR', null
),
(
  'Ralo Linear PVC 30cm - Tigre - Unidade',
  'ralo-linear-pvc-30cm-tigre',
  'Ralo linear (canaleta) PVC 30cm com grelha removível. Para box de banheiro amplo, áreas externas e piscinas. Conexão para tubo 50mm. Alta capacidade de escoamento, resistente à água quente. Design clean e discreto.',
  22.90, null,
  'cat-06', 'sub-06-03',
  'un', 100, true, false, false, false,
  'RAL-LIN-PVC-30-TGR', null
),

-- ════════════════════════════════════════════════════════════════════════════
-- TINTAS E IMPERMEABILIZANTES
-- ════════════════════════════════════════════════════════════════════════════

(
  'Impermeabilizante Manta Líquida - Vedacit - 18kg',
  'impermeabilizante-manta-liquida-vedacit-18kg',
  'Manta líquida impermeabilizante à base de polímeros e fibras de poliéster. Aplicação simples com rolo ou trincha — sem necessidade de maçarico ou cola. Ideal para lajes, calhas, terraços, caixas d''água e sacadas. Cura em 24h. Cobertura aproximada: 1kg/m² por demão. Fabricante Vedacit.',
  289.00, 319.00,
  'cat-08', 'sub-08-02',
  'un', 80, true, true, false, true,
  'IMP-MAN-LIQ-VDC-18KG', 18
),
(
  'Impermeabilizante Cimentício Bicomponente - Vedacit - 18kg',
  'impermeabilizante-cimenticio-vedacit-18kg',
  'Impermeabilizante cimentício bicomponente (pó + líquido). Excelente aderência ao concreto e alvenaria, sem necessidade de primer. Indicado para piscinas, reservatórios, caixas d''água (interior), fundações e porões. Resistente à pressão d''água positiva e negativa.',
  149.00, null,
  'cat-08', 'sub-08-02',
  'un', 100, true, false, false, false,
  'IMP-CIM-BIC-VDC-18KG', 18
),
(
  'Tinta Acrílica Premium Fosca - Suvinil - 18L',
  'tinta-acrilica-premium-fosca-suvinil-18l',
  'Tinta acrílica premium para paredes e tetos internos e externos. Fórmula resistente à lavagem (mais de 4000 esfregações). Excelente cobertura e poder de cobrimento. Acabamento fosco, sem reflexo. Rendimento aproximado 200m² por demão. Disponível em todas as tonalidades Suvinil.',
  189.00, 219.00,
  'cat-08', 'sub-08-01',
  'un', 60, true, true, false, true,
  'TNT-ACR-PRE-SUV-18L', 22
),
(
  'Massa Corrida PVA - Suvinil - 25kg',
  'massa-corrida-pva-suvinil-25kg',
  'Massa corrida PVA para preparação de superfícies internas antes da pintura. Preenche imperfeições e microporos, resultando em acabamento mais liso e consumo reduzido de tinta. Ideal para paredes rebocadas e drywall. Não indicada para áreas úmidas ou externas.',
  49.90, 54.00,
  'cat-08', 'sub-08-03',
  'un', 100, true, false, false, false,
  'MCS-PVA-SUV-25KG', 25
),
(
  'Selador Acrílico - Coral - 18L',
  'selador-acrilico-coral-18l',
  'Selador acrílico para preparação de superfícies porosas (reboco, concreto, blocos) antes da massa corrida ou tinta. Penetra nos poros, uniformiza a absorção e melhora a aderência. Essencial em obras novas. Rendimento 100–150m² por lata.',
  119.00, null,
  'cat-08', 'sub-08-04',
  'un', 60, true, false, false, false,
  'SEL-ACR-CRL-18L', 22
),

-- ════════════════════════════════════════════════════════════════════════════
-- DRYWALL E FORRO
-- ════════════════════════════════════════════════════════════════════════════

(
  'Chapa Drywall Standard ST (Branca) - 1,20x1,80m - Knauf',
  'chapa-drywall-st-1200x1800-knauf',
  'Chapa de gesso acartonado Drywall Standard (ST) — 1,20m x 1,80m x 12,5mm — para paredes e forros em áreas secas. Sistema construtivo leve, rápido e econômico. Superfície branca pronta para pintura. Norma ABNT NBR 14715. Fabricante Knauf.',
  39.90, 43.00,
  'cat-07', 'sub-07-01',
  'un', 300, true, true, false, true,
  'DRY-ST-1200X1800-KNF', 12
),
(
  'Chapa Drywall Resistente à Umidade (RU) Verde - 1,20x1,80m - Knauf',
  'chapa-drywall-ru-1200x1800-knauf',
  'Chapa de gesso acartonado resistente à umidade (RU) — identificada pela coloração verde. Indicada para banheiros, cozinhas, lavanderias e áreas úmidas. Tratamento hidrofugante no núcleo e nas faces. Deve ser combinada com impermeabilizante nas áreas molhadas. Norma ABNT NBR 14715.',
  49.90, 54.00,
  'cat-07', 'sub-07-01',
  'un', 200, true, false, false, false,
  'DRY-RU-1200X1800-KNF', 12
),
(
  'Perfil Guia 70mm - Drywall - Barra 3m - Placo',
  'perfil-guia-70mm-drywall-3m-placo',
  'Perfil U (guia) em aço galvanizado 70mm para sistemas Drywall. Fixado em piso e teto para delimitar e guiar a montagem das paredes. Espessura 0,5mm. Barra com 3m. Fabricante Placo — referência em sistemas Drywall.',
  12.90, null,
  'cat-07', 'sub-07-02',
  'barra', 300, true, false, false, false,
  'PRF-GUI-70-DRY-3M-PLC', 1.8
),
(
  'Forro PVC Branco Liso - Placa 0,20x6m - 7mm',
  'forro-pvc-branco-liso-020x6m-7mm',
  'Forro PVC rígido branco liso, largura 20cm, comprimento 6m, espessura 7mm. Fácil instalação com clipes e tabicas. Resistente à umidade, mofo e cupins. Ideal para banheiros, cozinhas, varandas e ambientes comerciais. Encaixe macho-fêmea. Acabamento de primeira qualidade.',
  24.90, null,
  'cat-07', 'sub-07-03',
  'un', 200, true, false, false, false,
  'FRO-PVC-BRC-020X6-7MM', null
),

-- ════════════════════════════════════════════════════════════════════════════
-- AÇO E ESTRUTURA
-- ════════════════════════════════════════════════════════════════════════════

(
  'Vergalhão CA-50 10mm - Barra 12m',
  'vergalhao-ca-50-10mm-12m',
  'Vergalhão de aço CA-50 com diâmetro de 10mm, barra com 12m. Utilizado em pilares, vigas, fundações e lajes — elementos estruturais de concreto armado. Alta resistência à tração (500 MPa). Conformidade com as normas ABNT NBR 7480 e NBR 6118.',
  89.00, null,
  'cat-10', 'sub-10-01',
  'barra', 500, true, false, false, false,
  'VRG-CA50-10MM-12M', 9.2
),
(
  'Vergalhão CA-50 8mm - Barra 12m',
  'vergalhao-ca-50-8mm-12m',
  'Vergalhão de aço CA-50 diâmetro 8mm, barra 12m. Para armação de lajes, vigas-calha, fundações e estruturas menores. Resistência 500 MPa. Norma ABNT NBR 7480.',
  59.00, null,
  'cat-10', 'sub-10-01',
  'barra', 500, true, false, false, false,
  'VRG-CA50-8MM-12M', 6.0
),
(
  'Vergalhão CA-60 5mm - Barra 12m',
  'vergalhao-ca-60-5mm-12m',
  'Vergalhão CA-60 diâmetro 5mm (fio), barra 12m. Utilizado em estribos de vigas e pilares, armadura de lajes nervuradas e protendidas. Aço de alta resistência (600 MPa). Norma ABNT NBR 7480.',
  28.50, null,
  'cat-10', 'sub-10-01',
  'barra', 500, true, false, false, false,
  'VRG-CA60-5MM-12M', 2.3
),
(
  'Tela Soldada Q-92 - 2,45x6m - Rede',
  'tela-soldada-q-92-245x6m',
  'Tela soldada eletrosoldada Q-92, malha 10x10cm, fio 4,9mm, dimensões 2,45x6m. Para armação de lajes planas e nervuradas, pisos industriais e calçadas. Substitui a armação manual com arame, reduzindo mão de obra em até 50%. Norma ABNT NBR 7480.',
  145.00, null,
  'cat-10', 'sub-10-02',
  'un', 100, true, true, false, false,
  'TEL-SOL-Q92-245X6M', 14.2
),
(
  'Arame Recozido 18 BWG - Rolo 1kg',
  'arame-recozido-18bwg-rolo-1kg',
  'Arame recozido calibre 18 BWG (1,2mm), rolo com 1kg. Essencial para amarração de ferragens em pilares, vigas e lajes. Alta maleabilidade, não parte ao dobrar. Produto indispensável no canteiro de obras.',
  12.90, null,
  'cat-10', 'sub-10-03',
  'un', 300, true, false, false, false,
  'ARM-REC-18BWG-1KG', 1
),

-- ════════════════════════════════════════════════════════════════════════════
-- FERRAMENTAS E EPI
-- ════════════════════════════════════════════════════════════════════════════

(
  'Capacete de Segurança Classe A - Branco - Plastcor',
  'capacete-seguranca-classe-a-branco-plastcor',
  'Capacete de segurança Classe A, para ambientes sem riscos elétricos. Fabricado em polietileno de alta densidade, com suspensão tipo boné de 6 pontos. Cor branca (identifica engenheiros e encarregados). Norma ABNT NBR 8221 e NR-6. Fabricante Plastcor.',
  14.90, null,
  'cat-09', 'sub-09-03',
  'un', 200, true, false, false, false,
  'CAP-SEG-A-BRC-PLC', 0.4
),
(
  'Luva de Látex Reforçada - Par - Danny',
  'luva-latex-reforçada-par-danny',
  'Luva de látex natural reforçada para proteção das mãos em obras. Resistente a produtos químicos, argamassas, cimentos e graxas. Palma antiderrapante. Tamanhos P, M e G. Par embalado individualmente. Norma NR-6.',
  7.90, null,
  'cat-09', 'sub-09-03',
  'un', 200, true, false, false, false,
  'LUV-LAT-REF-DAN-PAR', null
),
(
  'Betoneira 400L - Motor 2CV - CSM',
  'betoneira-400l-2cv-csm',
  'Betoneira elétrica 400 litros, motor 2CV bivolt (110/220V), tambor basculante com estrelas de argamassa. Capacidade de produção: 300L de concreto por carga. Estrutura metálica reforçada, rodas para mobilidade. Indispensável para obras médias. Fabricante CSM.',
  1890.00, 2100.00,
  'cat-09', 'sub-09-04',
  'un', 10, true, true, false, true,
  'BTN-400L-2CV-CSM', null
),
(
  'Enxada Larga - Haste de Madeira - Tramontina',
  'enxada-larga-madeira-tramontina',
  'Enxada larga com lâmina em aço forjado temperado e haste de madeira de eucalipto. Para movimentação de terra, argamassa e concreto no canteiro de obras. Peso da lâmina: 1,5kg. Haste 1,30m. Fabricante Tramontina — líder em ferramentas no Brasil.',
  42.90, null,
  'cat-09', 'sub-09-01',
  'un', 100, true, false, false, false,
  'ENX-LAR-MAD-TRM', null
),

-- ════════════════════════════════════════════════════════════════════════════
-- PISOS E REVESTIMENTOS
-- ════════════════════════════════════════════════════════════════════════════

(
  'Rejunte Acetinado Branco - Quartzolit - 5kg',
  'rejunte-acetinado-branco-quartzolit-5kg',
  'Rejunte cimentício acetinado para juntas de 1 a 8mm em pisos e paredes. Cor branco neve. Alta resistência à penetração de sujeira e manchas. Uso em pisos cerâmicos, porcelanatos e pedras naturais em ambientes internos e externos. Norma ABNT NBR 14992.',
  18.90, 21.00,
  'cat-04', 'sub-04-03',
  'un', 200, true, false, false, false,
  'REJ-ACT-BRC-QZL-5KG', 5
),
(
  'Rejunte Flexível Cinza - Weber - 5kg',
  'rejunte-flexivel-cinza-weber-5kg',
  'Rejunte flexível para juntas de 2 a 12mm. Cor cinza cimento. Formulação com polímeros flexíveis que acompanham movimentações estruturais sem fissuras. Indicado para áreas externas, piscinas, juntas de grande largura e locais sujeitos a variações térmicas.',
  22.90, null,
  'cat-04', 'sub-04-03',
  'un', 150, true, false, false, false,
  'REJ-FLX-CZA-WBR-5KG', 5
);

-- ── 5. COMMIT ────────────────────────────────────────────────────────────────
COMMIT;

-- Verificação final
SELECT
  c.name AS categoria,
  COUNT(DISTINCT s.id) AS subcategorias,
  COUNT(p.id) AS produtos
FROM categories c
LEFT JOIN subcategories s ON s.category_id = c.id
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.name, c.sort_order
ORDER BY c.sort_order;
