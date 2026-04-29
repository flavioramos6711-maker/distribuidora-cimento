"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Code2, Loader2, Save, CheckCircle2, XCircle, ExternalLink, Copy, AlertTriangle } from "lucide-react"

const supabase = createClient()

type TagSettings = {
  gtm_id: string
  google_ads_id: string
  gtm_enabled: boolean
  google_ads_enabled: boolean
}

const defaultSettings: TagSettings = {
  gtm_id: "GTM-MLK62TBK",
  google_ads_id: "AW-16526087847",
  gtm_enabled: true,
  google_ads_enabled: true,
}

export default function TagsPage() {
  const [settings, setSettings] = useState<TagSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("gtm_id, google_ads_id, gtm_enabled, google_ads_enabled")
        .eq("id", "default")
        .maybeSingle()

      if (cancelled) return

      if (error) {
        console.error("Erro ao carregar tags:", error)
        setLoading(false)
        return
      }

      if (data) {
        setSettings({
          gtm_id: data.gtm_id || defaultSettings.gtm_id,
          google_ads_id: data.google_ads_id || defaultSettings.google_ads_id,
          gtm_enabled: data.gtm_enabled ?? true,
          google_ads_enabled: data.google_ads_enabled ?? true,
        })
      }
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          id: "default",
          gtm_id: settings.gtm_id || null,
          google_ads_id: settings.google_ads_id || null,
          gtm_enabled: settings.gtm_enabled,
          google_ads_enabled: settings.google_ads_enabled,
        })

      if (error) throw error
      toast.success("Tags salvas com sucesso! Recarregue o site para aplicar.")
    } catch (err) {
      console.error(err)
      toast.error("Erro ao salvar tags")
    }
    setSaving(false)
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast.success("Copiado para a área de transferência")
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tags de Marketing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as tags do Google Tag Manager e Google Ads instaladas no site.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar alterações
        </button>
      </div>

      {/* Google Tag Manager */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Code2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">Google Tag Manager</h2>
              <p className="text-sm text-muted-foreground">Gerenciador de tags unificado do Google</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {settings.gtm_enabled ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Ativo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                <XCircle className="h-3.5 w-3.5" />
                Desativado
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">ID do Container (GTM-XXXXXXX)</label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                value={settings.gtm_id}
                onChange={(e) => setSettings((s) => ({ ...s, gtm_id: e.target.value }))}
                placeholder="GTM-XXXXXXX"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(settings.gtm_id)}
                className="rounded-xl border border-border bg-background px-3 py-2.5 text-muted-foreground transition hover:bg-muted/50"
                title="Copiar ID"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.gtm_enabled}
                onChange={(e) => setSettings((s) => ({ ...s, gtm_enabled: e.target.checked }))}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-muted peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
            </label>
            <span className="text-sm text-foreground">Habilitar Google Tag Manager</span>
          </div>

          <a
            href="https://tagmanager.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Acessar Google Tag Manager
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Google Ads */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">Google Ads</h2>
              <p className="text-sm text-muted-foreground">Tag de conversao e remarketing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {settings.google_ads_enabled ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Ativo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                <XCircle className="h-3.5 w-3.5" />
                Desativado
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">ID de Conversao (AW-XXXXXXXXXXX)</label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                value={settings.google_ads_id}
                onChange={(e) => setSettings((s) => ({ ...s, google_ads_id: e.target.value }))}
                placeholder="AW-XXXXXXXXXXX"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(settings.google_ads_id)}
                className="rounded-xl border border-border bg-background px-3 py-2.5 text-muted-foreground transition hover:bg-muted/50"
                title="Copiar ID"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.google_ads_enabled}
                onChange={(e) => setSettings((s) => ({ ...s, google_ads_enabled: e.target.checked }))}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-muted peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
            </label>
            <span className="text-sm text-foreground">Habilitar Google Ads</span>
          </div>

          <a
            href="https://ads.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Acessar Google Ads
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <h3 className="font-medium text-amber-800">Importante</h3>
            <p className="mt-1 text-sm text-amber-700">
              As tags estao instaladas no codigo do site. Para alterar os IDs ou desativar as tags, 
              sera necessario atualizar o arquivo <code className="rounded bg-amber-200/50 px-1 text-xs">app/layout.tsx</code>. 
              Esta pagina serve como referencia e documentacao das tags ativas.
            </p>
          </div>
        </div>
      </div>

      {/* Code Preview */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground">Codigo instalado</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Visualize o codigo das tags atualmente instaladas no site.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Google Tag Manager (Head)</p>
            <pre className="overflow-x-auto rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
{`<Script id="gtm" strategy="afterInteractive">
  {(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${settings.gtm_id}')}
</Script>`}
            </pre>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Google Tag Manager (Body - noscript)</p>
            <pre className="overflow-x-auto rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
{`<noscript>
  <iframe
    src="https://www.googletagmanager.com/ns.html?id=${settings.gtm_id}"
    height="0"
    width="0"
    style={{ display: 'none', visibility: 'hidden' }}
  />
</noscript>`}
            </pre>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Google Ads (gtag.js)</p>
            <pre className="overflow-x-auto rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground">
{`<Script src="https://www.googletagmanager.com/gtag/js?id=${settings.google_ads_id}" />
<Script id="google-ads">
  {window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${settings.google_ads_id}')}
</Script>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
