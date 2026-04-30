# Script para salvar as imagens no local correto
# Execute este arquivo no terminal ou clicando com botão direito > Executar com o PowerShell

$logoSrc = "C:\Users\Windows 10 Pro\.gemini\antigravity\brain\f7c2a815-14f7-40ac-999d-802034d46d4d\media__1777521043543.png"
$atendenteSrc = "C:\Users\Windows 10 Pro\.gemini\antigravity\brain\f7c2a815-14f7-40ac-999d-802034d46d4d\media__1777521057011.jpg"

$publicDir = Join-Path $PSScriptRoot "public"

if (!(Test-Path $publicDir)) {
    New-Item -ItemType Directory -Path $publicDir
}

Copy-Item -Path $logoSrc -Destination (Join-Path $publicDir "logo-oficial.png") -Force
Copy-Item -Path $atendenteSrc -Destination (Join-Path $publicDir "atendente-vendas.jpg") -Force

Write-Host "✅ Imagens salvas com sucesso na pasta public!" -ForegroundColor Green
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
