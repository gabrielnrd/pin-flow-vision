Vou adicionar 4 novos componentes de análise no dashboard, todos usando os dados já existentes no `financeStore` (cashflowMonths, banks, creditors, categorias).

## Componentes a criar

### 1. `FinancialHealthDashboard.tsx`
Expansão visual do `FinancialHealthScore` atual:
- Score 0–100 grande (ring já existente, reaproveitado)
- 3 mini-indicadores horizontais (barras de progresso): **Poupança** (% renda sobrando), **Dívida** (DTI invertido), **Gastos Fixos** (% renda comprometida com moradia/assinaturas)
- Cada indicador com cor semântica (verde/amarelo/vermelho) e label curto

### 2. `BalanceProjectionChart.tsx`
- LineChart (Recharts) com 6 meses à frente
- Calcula tendência usando média móvel dos últimos 3 meses de saldo (receita − despesa − cartão)
- 2 linhas: **Saldo Real** (passado/atual) sólida, **Projeção** (futuro) tracejada
- Banda de confiança (Area) mostrando otimista/pessimista (±15%)
- Marca zero como referência

### 3. `MonthCategoryHeatmap.tsx`
- Grid: linhas = categorias (de `src/data/categories.ts`), colunas = meses de `cashflowMonths`
- Cor da célula proporcional ao gasto (escala de opacidade do `--primary`)
- Tooltip mostrando valor exato ao hover
- Mostra emoji da categoria na primeira coluna

### 4. `CashflowSankey.tsx`
- Recharts não tem Sankey nativo robusto → vou usar uma **representação visual customizada em SVG simples** (sem dependência extra): 3 colunas (Fontes → Hub central → Destinos), com fluxos proporcionais usando paths SVG curvos e espessura proporcional ao valor
- Fontes: itens de receita do mês
- Destinos: agrupado por categoria + "Cartão"
- Tooltip ao hover em cada fluxo

## Integração no `Index.tsx`

Nova seção "Análise & Visualização" logo após `IncomeCoverageAI`, contendo os 4 widgets em grid responsivo:

```
[FinancialHealthDashboard (2 cols)] [BalanceProjectionChart (2 cols)]
[MonthCategoryHeatmap (full width)]
[CashflowSankey (full width)]
```

O `FinancialHealthScore` simples atual permanece onde está (perto do hero), o novo `FinancialHealthDashboard` é mais detalhado.

## Sem mudanças

- Sem novas dependências (uso Recharts + SVG nativo)
- Sem mudanças no store ou no schema
- Sem mudanças de backend