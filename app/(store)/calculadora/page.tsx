"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, BrickWall, Box, Ruler, Layers, Percent } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const BRICK_PRESETS: { label: string; perM2: number }[] = [
  { label: "Cerâmico 6 furos (referência ~45 un./m²)", perM2: 45 },
  { label: "Cerâmico 9 furos (referência ~33 un./m²)", perM2: 33 },
  { label: "Bloco de concreto 14×19×39 cm (referência ~13 un./m²)", perM2: 13 },
  { label: "Bloco estrutural 19×19×39 cm (referência ~12,5 un./m²)", perM2: 12.5 },
]

function num(v: string): number {
  const n = parseFloat(v.replace(",", "."))
  return Number.isFinite(n) ? n : 0
}

export default function CalculadoraPage() {
  const [brickArea, setBrickArea] = useState("10")
  const [brickPreset, setBrickPreset] = useState(0)
  const [brickCustom, setBrickCustom] = useState("")

  const bricks = useMemo(() => {
    const area = num(brickArea)
    const per =
      brickCustom.trim() !== ""
        ? num(brickCustom)
        : BRICK_PRESETS[brickPreset]?.perM2 ?? 45
    if (area <= 0 || per <= 0) return { qty: 0, per }
    return { qty: Math.ceil(area * per), per }
  }, [brickArea, brickPreset, brickCustom])

  const [cementVol, setCementVol] = useState("1")
  const [cementYield, setCementYield] = useState("7")
  const cementBags = useMemo(() => {
    const v = num(cementVol)
    const y = num(cementYield)
    if (v <= 0 || y <= 0) return 0
    return Math.ceil(v * y)
  }, [cementVol, cementYield])

  const [woodL, setWoodL] = useState("3")
  const [woodWcm, setWoodWcm] = useState("10")
  const [woodHcm, setWoodHcm] = useState("5")
  const woodM3 = useMemo(() => {
    const L = num(woodL)
    const w = num(woodWcm) / 100
    const h = num(woodHcm) / 100
    if (L <= 0 || w <= 0 || h <= 0) return 0
    return L * w * h
  }, [woodL, woodWcm, woodHcm])

  const [rectA, setRectA] = useState("4")
  const [rectB, setRectB] = useState("5")
  const rectM2 = useMemo(() => {
    const a = num(rectA)
    const b = num(rectB)
    return a > 0 && b > 0 ? a * b : 0
  }, [rectA, rectB])

  const [boxL, setBoxL] = useState("2")
  const [boxW, setBoxW] = useState("3")
  const [boxH, setBoxH] = useState("2.5")
  const boxM3 = useMemo(() => {
    const l = num(boxL)
    const w = num(boxW)
    const h = num(boxH)
    return l > 0 && w > 0 && h > 0 ? l * w * h : 0
  }, [boxL, boxW, boxH])

  const [mixVol, setMixVol] = useState("1")
  const [mixCem, setMixCem] = useState("1")
  const [mixSand, setMixSand] = useState("3")
  const [mixStone, setMixStone] = useState("4")
  const mixParts = useMemo(() => {
    const v = num(mixVol)
    const c = num(mixCem)
    const s = num(mixSand)
    const st = num(mixStone)
    if (v <= 0 || c <= 0 || s <= 0 || st <= 0) return null
    const total = c + s + st
    return {
      cement: (v * c) / total,
      sand: (v * s) / total,
      stone: (v * st) / total,
      bags: Math.ceil(((v * c) / total) * 7),
    }
  }, [mixVol, mixCem, mixSand, mixStone])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="mb-10">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Calculadora de materiais
        </h1>
        <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed max-w-2xl">
          Estimativas em tempo real para orçamentos rápidos. Ajuste os valores conforme a especificação técnica da
          sua obra; os resultados são orientativos.
        </p>
      </div>

      <div className="grid gap-6 md:gap-8">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-heading">
              <BrickWall className="w-5 h-5 text-primary" />
              Tijolos e blocos (unidades por m²)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brick-area">Área da parede (m²)</Label>
                <Input
                  id="brick-area"
                  inputMode="decimal"
                  value={brickArea}
                  onChange={(e) => setBrickArea(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brick-preset">Tipo de referência</Label>
                <select
                  id="brick-preset"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={brickPreset}
                  onChange={(e) => setBrickPreset(Number(e.target.value))}
                  disabled={brickCustom.trim() !== ""}
                >
                  {BRICK_PRESETS.map((p, i) => (
                    <option key={p.label} value={i}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brick-custom">Unidades por m² (opcional — sobrescreve o preset)</Label>
              <Input
                id="brick-custom"
                inputMode="decimal"
                placeholder="Ex.: 46"
                value={brickCustom}
                onChange={(e) => setBrickCustom(e.target.value)}
              />
            </div>
            <p className="rounded-xl bg-muted/50 px-4 py-3 text-sm font-medium text-foreground">
              Quantidade estimada:{" "}
              <span className="text-primary tabular-nums">{bricks.qty.toLocaleString("pt-BR")}</span> unidades
              {bricks.per > 0 && (
                <span className="text-muted-foreground font-normal"> ({bricks.per} un./m²)</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-heading">
              <Box className="w-5 h-5 text-primary" />
              Cimento (sacos por volume de concreto)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Informe o volume de concreto em m³ e o consumo médio de sacos de 50 kg por m³ (típico entre 6 e 8,
              conforme traço e região).
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cement-vol">Volume de concreto (m³)</Label>
                <Input
                  id="cement-vol"
                  inputMode="decimal"
                  value={cementVol}
                  onChange={(e) => setCementVol(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cement-yield">Sacos de 50 kg por m³</Label>
                <Input
                  id="cement-yield"
                  inputMode="decimal"
                  value={cementYield}
                  onChange={(e) => setCementYield(e.target.value)}
                />
              </div>
            </div>
            <p className="rounded-xl bg-muted/50 px-4 py-3 text-sm font-medium text-foreground">
              Saco de cimento (50 kg):{" "}
              <span className="text-primary tabular-nums">{cementBags.toLocaleString("pt-BR")}</span> un.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-heading">
              <Ruler className="w-5 h-5 text-primary" />
              Madeira (volume a partir de medidas lineares)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wood-l">Comprimento (m)</Label>
                <Input id="wood-l" inputMode="decimal" value={woodL} onChange={(e) => setWoodL(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wood-w">Largura (cm)</Label>
                <Input id="wood-w" inputMode="decimal" value={woodWcm} onChange={(e) => setWoodWcm(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wood-h">Espessura (cm)</Label>
                <Input id="wood-h" inputMode="decimal" value={woodHcm} onChange={(e) => setWoodHcm(e.target.value)} />
              </div>
            </div>
            <p className="rounded-xl bg-muted/50 px-4 py-3 text-sm font-medium text-foreground">
              Volume: <span className="text-primary tabular-nums">{woodM3.toFixed(4)}</span> m³
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-heading">
                <Layers className="w-5 h-5 text-primary" />
                Área (m²)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="rect-a">Lado A (m)</Label>
                  <Input id="rect-a" inputMode="decimal" value={rectA} onChange={(e) => setRectA(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rect-b">Lado B (m)</Label>
                  <Input id="rect-b" inputMode="decimal" value={rectB} onChange={(e) => setRectB(e.target.value)} />
                </div>
              </div>
              <p className="rounded-xl bg-muted/50 px-4 py-3 text-sm font-medium">
                Área total:{" "}
                <span className="text-primary tabular-nums">{rectM2.toFixed(2)}</span> m²
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-heading">
                <Box className="w-5 h-5 text-primary" />
                Volume (m³)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="box-l">L (m)</Label>
                  <Input id="box-l" inputMode="decimal" value={boxL} onChange={(e) => setBoxL(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="box-w">W (m)</Label>
                  <Input id="box-w" inputMode="decimal" value={boxW} onChange={(e) => setBoxW(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="box-h">H (m)</Label>
                  <Input id="box-h" inputMode="decimal" value={boxH} onChange={(e) => setBoxH(e.target.value)} />
                </div>
              </div>
              <p className="rounded-xl bg-muted/50 px-4 py-3 text-sm font-medium">
                Volume: <span className="text-primary tabular-nums">{boxM3.toFixed(3)}</span> m³
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-heading">
              <Percent className="w-5 h-5 text-primary" />
              Traço de concreto (proporções em volume)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Informe o volume desejado de concreto e o traço em partes (cimento : areia : brita). O resultado
              estima a fração de cimento no volume e sugere sacos de 50 kg usando ~7 sacos/m³ de concreto como
              referência média.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label htmlFor="mix-vol">Volume (m³)</Label>
                <Input id="mix-vol" inputMode="decimal" value={mixVol} onChange={(e) => setMixVol(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mix-c">Cimento</Label>
                <Input id="mix-c" inputMode="decimal" value={mixCem} onChange={(e) => setMixCem(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mix-s">Areia</Label>
                <Input id="mix-s" inputMode="decimal" value={mixSand} onChange={(e) => setMixSand(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mix-st">Brita</Label>
                <Input id="mix-st" inputMode="decimal" value={mixStone} onChange={(e) => setMixStone(e.target.value)} />
              </div>
            </div>
            {mixParts && (
              <div className="rounded-xl bg-muted/50 px-4 py-3 text-sm space-y-1">
                <p>
                  Fração estimada de cimento no volume:{" "}
                  <span className="font-semibold text-primary tabular-nums">
                    {(mixParts.cement * 100).toFixed(1)}%
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Volume aproximado de cimento:{" "}
                  <span className="text-foreground tabular-nums">{mixParts.cement.toFixed(3)}</span> m³ · Areia:{" "}
                  <span className="tabular-nums">{mixParts.sand.toFixed(3)}</span> m³ · Brita:{" "}
                  <span className="tabular-nums">{mixParts.stone.toFixed(3)}</span> m³
                </p>
                <p>
                  Referência de sacos de cimento (50 kg):{" "}
                  <span className="font-semibold text-primary tabular-nums">{mixParts.bags}</span> un. (aprox.)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
