import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { api } from "@/infrastructure/http/apiClient"
import { resources } from "@/infrastructure/http/resourceGateway"
import {
  Car,
  Laptop,
  Package,
  Wrench,
  Shield,
  Calendar,
  Plus,
  Trash2,
} from "lucide-react"
import { nextId, today, useData } from "@/application/state/DataContext"

const typeIcon: Record<string, typeof Car> = {
  Veículo: Car,
  Eletrônico: Laptop,
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default function Assets() {
  const location = useLocation()
  const { data, setData, reload } = useData()
  const assets = data.assets
  const [selected, setSelected] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState("")
  const [assetType, setAssetType] = useState("Eletrônico")
  const [estimatedValue, setEstimatedValue] = useState("")
  const [maintenanceDescription, setMaintenanceDescription] = useState("")
  const [maintenanceCost, setMaintenanceCost] = useState("")
  const [maintenanceDate, setMaintenanceDate] = useState(today())
  const selectedAsset = assets.find((a) => a.id === selected)
  const totalValue = assets.reduce((s, a) => s + a.value, 0)
  useEffect(() => {
    const id = location.pathname.split("/")[2]
    const asset = assets.find((item) => item.serverId === id)
    if (asset) setSelected(asset.id)
  }, [assets, location.pathname])

  return (
    <div className="p-6" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--foreground)]">
            Patrimônio
          </h1>
          <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">
            Valor estimado total:{" "}
            <span
              className="font-semibold text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-mono-family)" }}
            >
              {fmt(totalValue)}
            </span>
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] bg-[var(--primary)] text-white rounded-lg"
        >
          <Plus size={14} /> Novo item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-5xl">
        {assets.map((asset) => {
          const Icon = typeIcon[asset.type] || Package
          return (
            <div
              key={asset.id}
              onClick={() =>
                setSelected(selected === asset.id ? null : asset.id)
              }
              className="bg-white rounded-xl border border-[var(--border)] p-5 cursor-pointer hover:border-[var(--primary)]/40 transition-all"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--secondary)] flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-[var(--muted-foreground)]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--foreground)]">
                    {asset.name}
                  </p>
                  <p className="text-[11.5px] text-[var(--muted-foreground)]">
                    {asset.type}
                  </p>
                </div>
              </div>

              <p
                className="text-[20px] font-bold text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-mono-family)" }}
              >
                {fmt(asset.value)}
              </p>

              {asset.type === "Veículo" && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11.5px]">
                    <span className="text-[var(--muted-foreground)]">
                      Quilometragem
                    </span>
                    <span className="font-medium text-[var(--foreground)]">
                      {(asset.details as any).km?.toLocaleString("pt-BR")} km
                    </span>
                  </div>
                  <div className="flex justify-between text-[11.5px]">
                    <span className="text-[var(--muted-foreground)]">
                      Próx. manutenção
                    </span>
                    <span className="font-medium text-[var(--foreground)]">
                      {(asset as any).next_maintenance}
                    </span>
                  </div>
                </div>
              )}

              {asset.type === "Eletrônico" && (
                <div className="mt-3">
                  <div className="flex justify-between text-[11.5px]">
                    <span className="text-[var(--muted-foreground)]">
                      Garantia até
                    </span>
                    <span className="font-medium text-[var(--foreground)]">
                      {(asset as any).warranty}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Detail panel */}
      {selectedAsset && (
        <div
          className="fixed inset-y-0 right-0 w-96 bg-white border-l border-[var(--border)] shadow-xl z-40 overflow-y-auto"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
            <input
              aria-label="Nome do patrimônio"
              value={selectedAsset.name}
              onChange={(event) =>
                setData((current) => ({
                  ...current,
                  assets: current.assets.map((asset) =>
                    asset.id === selectedAsset.id
                      ? { ...asset, name: event.target.value }
                      : asset,
                  ),
                }))
              }
              className="text-[15px] font-semibold bg-transparent flex-1"
            />
            <button
              onClick={() => setSelected(null)}
              className="text-[var(--muted-foreground)]"
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-5">
            <label className="field-label">
              Valor estimado
              <input
                type="number"
                min="0"
                step="0.01"
                value={selectedAsset.value}
                onChange={(event) =>
                  setData((current) => ({
                    ...current,
                    assets: current.assets.map((asset) =>
                      asset.id === selectedAsset.id
                        ? {
                            ...asset,
                            value: Math.max(0, Number(event.target.value)),
                          }
                        : asset,
                    ),
                  }))
                }
                className="field-input"
              />
            </label>
            {/* Details */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
                Detalhes
              </p>
              <div className="space-y-2">
                {Object.entries(selectedAsset.details).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between px-3 py-2 rounded-lg bg-[var(--secondary)]"
                  >
                    <span className="text-[12px] text-[var(--muted-foreground)] capitalize">
                      {k.replace(/_/g, " ")}
                    </span>
                    {selectedAsset.type === "Veículo" ? (
                      <input
                        aria-label={`Editar ${k}`}
                        value={String(v)}
                        onChange={(event) =>
                          setData((current) => ({
                            ...current,
                            assets: current.assets.map((asset) =>
                              asset.id === selectedAsset.id
                                ? {
                                    ...asset,
                                    details: {
                                      ...asset.details,
                                      [k]: event.target.value,
                                    },
                                  } as typeof asset
                                : asset,
                            ),
                          }))
                        }
                        className="text-[12px] text-right bg-transparent min-w-0 w-36"
                      />
                    ) : (
                      <span className="text-[12px] font-medium text-[var(--foreground)]">
                        {String(v)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Insurance for vehicle */}
            {(selectedAsset as any).insurance && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3 flex items-center gap-1.5">
                  <Shield size={11} /> Seguro
                </p>
                <div className="p-4 rounded-xl bg-[var(--secondary)] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[12px] text-[var(--muted-foreground)]">
                      Seguradora
                    </span>
                    <span className="text-[12px] font-medium">
                      {(selectedAsset as any).insurance.company}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[12px] text-[var(--muted-foreground)]">
                      Vencimento
                    </span>
                    <span className="text-[12px] font-medium">
                      {(selectedAsset as any).insurance.expiry}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[12px] text-[var(--muted-foreground)]">
                      Valor
                    </span>
                    <span
                      className="text-[12px] font-medium"
                      style={{ fontFamily: "var(--font-mono-family)" }}
                    >
                      {fmt((selectedAsset as any).insurance.value)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Maintenance history */}
            {(selectedAsset as any).maintenance && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3 flex items-center gap-1.5">
                  <Wrench size={11} /> Manutenções
                </p>
                <div className="space-y-2">
                  {((selectedAsset as any).maintenance as any[]).map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[var(--secondary)]"
                    >
                      <Calendar
                        size={12}
                        className="text-[var(--muted-foreground)]"
                      />
                      <div className="flex-1">
                        <p className="text-[12.5px] font-medium text-[var(--foreground)]">
                          {m.desc}
                        </p>
                        <p className="text-[11px] text-[var(--muted-foreground)]">
                          {m.date}
                        </p>
                      </div>
                      <span
                        className="text-[12px] font-semibold"
                        style={{ fontFamily: "var(--font-mono-family)" }}
                      >
                        {fmt(m.cost)}
                      </span>
                      {m.serverId && (
                        <button
                          aria-label="Excluir manutenção"
                          onClick={async () => {
                            await resources.remove(
                              "assets/maintenances",
                              m.serverId,
                            )
                            await reload()
                          }}
                          className="text-red-500"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {selectedAsset.serverId && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <input
                      value={maintenanceDescription}
                      onChange={(event) =>
                        setMaintenanceDescription(event.target.value)
                      }
                      placeholder="Manutenção"
                      className="field-input col-span-2"
                    />
                    <input
                      type="date"
                      value={maintenanceDate}
                      onChange={(event) =>
                        setMaintenanceDate(event.target.value)
                      }
                      className="field-input"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={maintenanceCost}
                      onChange={(event) =>
                        setMaintenanceCost(event.target.value)
                      }
                      placeholder="Custo"
                      className="field-input"
                    />
                    <button
                      onClick={async () => {
                        if (!maintenanceDescription.trim()) return
                        await resources.create("assets/maintenances", {
                          assetId: selectedAsset.serverId,
                          description: maintenanceDescription,
                          maintenanceDate,
                          cost: Number(maintenanceCost) || 0,
                        })
                        setMaintenanceDescription("")
                        setMaintenanceCost("")
                        await reload()
                      }}
                      className="col-span-2 py-2 bg-[var(--primary)] text-white rounded-lg text-xs"
                    >
                      Registrar manutenção
                    </button>
                  </div>
                )}
              </div>
            )}
            {selectedAsset.type === "Veículo" && selectedAsset.serverId && (
              <button
                onClick={async () => {
                  const details = selectedAsset.details as any
                  await api.put(
                    `/api/v1/assets/${selectedAsset.serverId}/vehicle`,
                    {
                      brand: details.marca || "",
                      model: details.modelo || selectedAsset.name,
                      year: Number(details.ano) || null,
                      licensePlate: details.placa || null,
                      mileage: Number(details.km) || null,
                    },
                  )
                  await reload()
                }}
                className="text-xs text-[var(--primary)]"
              >
                Salvar dados do veículo
              </button>
            )}
            <button
              onClick={() => {
                setData((current) => ({
                  ...current,
                  assets: current.assets.filter(
                    (asset) => asset.id !== selectedAsset.id,
                  ),
                }))
                setSelected(null)
              }}
              className="flex items-center gap-1.5 text-[12px] text-red-500 hover:underline"
            >
              <Trash2 size={12} /> Excluir patrimônio
            </button>
          </div>
        </div>
      )}
      {adding && (
        <div
          className="fixed inset-0 z-50 bg-black/30 grid place-items-center p-4"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setAdding(false)
          }
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="asset-dialog-title"
            onSubmit={(event) => {
              event.preventDefault()
              if (!name.trim()) return
              const value = Math.max(
                0,
                Number(estimatedValue.replace(",", ".")) || 0,
              )
              setData((current) => ({
                ...current,
                assets: [
                  ...current.assets,
                  {
                    id: nextId(current.assets),
                    type: assetType,
                    name: name.trim(),
                    details: {
                      modelo: name.trim(),
                      compra: today(),
                      valor: value,
                      serie: "",
                    },
                    warranty: "",
                    value,
                  } as typeof current.assets[number],
                ],
              }))
              setName("")
              setEstimatedValue("")
              setAdding(false)
            }}
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl"
          >
            <h2 id="asset-dialog-title" className="text-lg font-semibold mb-5">
              Novo patrimônio
            </h2>
            <div className="space-y-4">
              <label className="field-label">
                Nome
                <input
                  autoFocus
                  required
                  maxLength={200}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="field-input"
                />
              </label>
              <label className="field-label">
                Tipo
                <select
                  value={assetType}
                  onChange={(event) => setAssetType(event.target.value)}
                  className="field-input"
                >
                  <option>Veículo</option>
                  <option>Eletrônico</option>
                  <option>Imóvel</option>
                  <option>Investimento</option>
                  <option>Outro</option>
                </select>
              </label>
              <label className="field-label">
                Valor estimado
                <input
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  value={estimatedValue}
                  onChange={(event) => setEstimatedValue(event.target.value)}
                  className="field-input"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm">
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
