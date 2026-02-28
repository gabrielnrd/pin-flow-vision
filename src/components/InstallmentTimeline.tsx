import { Calendar } from "lucide-react";

interface InstallmentItem {
  id: string;
  description: string;
  installmentAmount: number;
  currentInstallment: number;
  totalInstallments: number;
  dueDate: string;
  status: string;
  bankName: string;
  bankColor: string;
}

interface InstallmentTimelineProps {
  installments: InstallmentItem[];
}

const bankDotColor: Record<string, string> = {
  "bank-nubank": "bg-bank-nubank",
  "bank-inter": "bg-bank-inter",
  "bank-c6": "bg-muted-foreground",
  "bank-itau": "bg-bank-itau",
  "bank-bb": "bg-bank-bb",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function groupByMonth(items: InstallmentItem[]) {
  const groups: Record<string, InstallmentItem[]> = {};
  items.forEach((item) => {
    const d = new Date(item.dueDate + "T00:00:00");
    const key = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
}

export function InstallmentTimeline({ installments }: InstallmentTimelineProps) {
  const grouped = groupByMonth(installments);

  return (
    <div className="masonry-item glass-card rounded-2xl p-5 animate-float-in" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cronograma de Parcelas</h3>
      </div>

      <div className="space-y-5">
        {Object.entries(grouped).map(([month, items]) => (
          <div key={month}>
            <p className="text-xs font-semibold text-foreground uppercase mb-3 capitalize">{month}</p>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors"
                >
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${bankDotColor[item.bankColor] || "bg-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.bankName} · {item.currentInstallment}/{item.totalInstallments} · {formatDate(item.dueDate)}
                    </p>
                  </div>
                  <span className="text-sm text-money text-foreground shrink-0">
                    R$ {item.installmentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
