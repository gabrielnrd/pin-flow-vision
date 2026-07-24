import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import { useFinanceStore } from "@/stores/financeStore";
import { toast } from "@/hooks/use-toast";

export function ExportXlsxButton({ compact = false }: { compact?: boolean }) {
  const store = useFinanceStore();

  const handleExport = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Resumo
      const resumo = [
        ["Métrica", "Valor"],
        ["Dívida Total", store.totalDebt],
        ["Saldo em Conta", store.savedBalance],
        ["Renda (mês atual)", store.totalIncome],
        ["Despesas (mês atual)", store.totalExpense],
        ["Saldo Projetado", store.projectedTotalBalance],
        ["Meta Economia Mês", store.savingsGoalMonth],
        ["Credores - Total Devido", store.totalCreditorsDebt],
        ["Credores - Total Pago", store.totalCreditorsPaid],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumo), "Resumo");

      // Bancos
      const bancos = store.banks.map((b) => ({
        Banco: b.name,
        "Limite Total": b.limitTotal,
        "Limite Usado": b.limitUsed,
        "Dívida Final": b.debtFinal,
        Status: b.status,
        Parcelas: b.installments.length,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bancos), "Bancos");

      // Parcelas
      const parcelas = store.banks.flatMap((b) =>
        b.installments.map((i) => ({
          Banco: b.name,
          Descrição: i.description,
          "Valor Parcela": i.installmentAmount,
          "Valor Total": i.totalAmount,
          Parcela: `${i.currentInstallment}/${i.totalInstallments}`,
          Vencimento: i.dueDate,
          Status: i.status,
          Categoria: i.category ?? "",
        })),
      );
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(parcelas), "Parcelas");

      // Fluxo de Caixa
      const fluxo = store.cashflowMonths.flatMap((m) => [
        ...m.incomes.map((i) => ({
          Mês: m.month, Ano: m.year, Tipo: "Receita",
          Descrição: i.label, Valor: i.amount, Pago: i.paid ? "Sim" : "Não",
          Categoria: i.category ?? "", Fixo: i.fixed ? "Sim" : "Não",
        })),
        ...m.expenses.map((e) => ({
          Mês: m.month, Ano: m.year, Tipo: "Despesa",
          Descrição: e.label, Valor: e.amount, Pago: e.paid ? "Sim" : "Não",
          Categoria: e.category ?? "", Fixo: e.fixed ? "Sim" : "Não",
        })),
      ]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fluxo), "Fluxo de Caixa");

      // Credores
      const credores = store.creditors.map((c) => ({
        Nome: c.name,
        "Dívida Total": c.totalDebt,
        "Valor Pago": c.amountPaid,
        Restante: c.totalDebt - c.amountPaid,
        "Juros (% a.m.)": c.interestRate ?? 0,
        Vencimento: c.dueDate ?? "",
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(credores), "Credores");

      // Metas
      const metas = store.goals.map((g) => ({
        Meta: g.title,
        Alvo: g.targetAmount,
        Guardado: g.savedAmount,
        "% Concluída": g.targetAmount > 0 ? ((g.savedAmount / g.targetAmount) * 100).toFixed(1) + "%" : "-",
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(metas), "Metas");

      const today = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `financas_${today}.xlsx`);
      toast({ title: "Exportado com sucesso", description: "Planilha .xlsx baixada." });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao exportar", description: String(e), variant: "destructive" });
    }
  };

  return (
    <button
      onClick={handleExport}
      className={`inline-flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm hover:bg-secondary/60 transition-all text-xs font-medium text-foreground ${
        compact ? "px-2.5 py-1.5" : "px-3 py-2"
      }`}
      title="Exportar todos os dados em .xlsx"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Exportar XLSX</span>
    </button>
  );
}
