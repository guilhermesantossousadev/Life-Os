import { useState } from "react";
import { Car, Laptop, Smartphone, Package, Wrench, Shield, Calendar } from "lucide-react";
import { mockAssets } from "../data/mock";

const typeIcon: Record<string, typeof Car> = {
  Veículo: Car, Eletrônico: Laptop,
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Assets() {
  const [selected, setSelected] = useState<number | null>(null);
  const selectedAsset = mockAssets.find(a => a.id === selected);
  const totalValue = mockAssets.reduce((s, a) => s + a.value, 0);

  return (
    <div className="p-6" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--foreground)]">Patrimônio</h1>
          <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">Valor estimado total: <span className="font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-mono-family)" }}>{fmt(totalValue)}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-5xl">
        {mockAssets.map(asset => {
          const Icon = typeIcon[asset.type] || Package;
          return (
            <div
              key={asset.id}
              onClick={() => setSelected(selected === asset.id ? null : asset.id)}
              className="bg-white rounded-xl border border-[var(--border)] p-5 cursor-pointer hover:border-[var(--primary)]/40 transition-all"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--secondary)] flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-[var(--muted-foreground)]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--foreground)]">{asset.name}</p>
                  <p className="text-[11.5px] text-[var(--muted-foreground)]">{asset.type}</p>
                </div>
              </div>

              <p className="text-[20px] font-bold text-[var(--foreground)]" style={{ fontFamily: "var(--font-mono-family)" }}>{fmt(asset.value)}</p>

              {asset.type === "Veículo" && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11.5px]">
                    <span className="text-[var(--muted-foreground)]">Quilometragem</span>
                    <span className="font-medium text-[var(--foreground)]">{(asset.details as any).km?.toLocaleString("pt-BR")} km</span>
                  </div>
                  <div className="flex justify-between text-[11.5px]">
                    <span className="text-[var(--muted-foreground)]">Próx. manutenção</span>
                    <span className="font-medium text-[var(--foreground)]">{(asset as any).next_maintenance}</span>
                  </div>
                </div>
              )}

              {asset.type === "Eletrônico" && (
                <div className="mt-3">
                  <div className="flex justify-between text-[11.5px]">
                    <span className="text-[var(--muted-foreground)]">Garantia até</span>
                    <span className="font-medium text-[var(--foreground)]">{(asset as any).warranty}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {selectedAsset && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-[var(--border)] shadow-xl z-40 overflow-y-auto" style={{ fontFamily: "var(--font-ui)" }}>
          <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[var(--foreground)]">{selectedAsset.name}</h2>
            <button onClick={() => setSelected(null)} className="text-[var(--muted-foreground)]">✕</button>
          </div>

          <div className="p-5 space-y-5">
            {/* Details */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">Detalhes</p>
              <div className="space-y-2">
                {Object.entries(selectedAsset.details).map(([k, v]) => (
                  <div key={k} className="flex justify-between px-3 py-2 rounded-lg bg-[var(--secondary)]">
                    <span className="text-[12px] text-[var(--muted-foreground)] capitalize">{k.replace(/_/g, " ")}</span>
                    <span className="text-[12px] font-medium text-[var(--foreground)]">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Insurance for vehicle */}
            {(selectedAsset as any).insurance && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3 flex items-center gap-1.5"><Shield size={11} /> Seguro</p>
                <div className="p-4 rounded-xl bg-[var(--secondary)] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[12px] text-[var(--muted-foreground)]">Seguradora</span>
                    <span className="text-[12px] font-medium">{(selectedAsset as any).insurance.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[12px] text-[var(--muted-foreground)]">Vencimento</span>
                    <span className="text-[12px] font-medium">{(selectedAsset as any).insurance.expiry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[12px] text-[var(--muted-foreground)]">Valor</span>
                    <span className="text-[12px] font-medium" style={{ fontFamily: "var(--font-mono-family)" }}>{fmt((selectedAsset as any).insurance.value)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Maintenance history */}
            {(selectedAsset as any).maintenance && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3 flex items-center gap-1.5"><Wrench size={11} /> Manutenções</p>
                <div className="space-y-2">
                  {((selectedAsset as any).maintenance as any[]).map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--secondary)]">
                      <Calendar size={12} className="text-[var(--muted-foreground)]" />
                      <div className="flex-1">
                        <p className="text-[12.5px] font-medium text-[var(--foreground)]">{m.desc}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)]">{m.date}</p>
                      </div>
                      <span className="text-[12px] font-semibold" style={{ fontFamily: "var(--font-mono-family)" }}>{fmt(m.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
