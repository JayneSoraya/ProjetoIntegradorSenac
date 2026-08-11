[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateSet('smoke', 'auth', 'cart', 'comparison', 'history', 'partial')]
    [string]$Scenario,
    [switch]$KeepInstall
)

$ErrorActionPreference = 'Stop'
$adb = 'C:\Android\Sdk\platform-tools\adb.exe'
$flutter = 'C:\src\flutter\bin\flutter.bat'
$package = 'app.econoway.mobile'

if (-not (Test-Path -LiteralPath $adb) -or -not (Test-Path -LiteralPath $flutter)) {
    throw 'ADB ou Flutter não encontrado nos caminhos locais esperados.'
}

$devices = & $adb devices | Select-Object -Skip 1 | Where-Object {
    $_ -match '^([^\s]+)\s+device$' -and $_ -notmatch '^emulator-'
}
if ($devices.Count -ne 1) {
    throw "Esperado exatamente um dispositivo físico autorizado; encontrados $($devices.Count)."
}
$serial = ($devices[0] -split '\s+')[0]

& $adb -s $serial shell am force-stop $package
if (-not $KeepInstall) {
    & $adb -s $serial uninstall $package | Out-Null
}
& $adb -s $serial reverse tcp:3333 tcp:3333 | Out-Null

foreach ($path in @('/api/health', '/api/ready')) {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:3333$path"
    if ($response.StatusCode -ne 200) { throw "API não está saudável em $path." }
}

$testFile = switch ($Scenario) {
    'smoke' { 'integration_test/smoke_test.dart' }
    'auth' { 'integration_test/auth_flow_test.dart' }
    'history' { 'integration_test/history_flow_test.dart' }
    'partial' { 'integration_test/partial_comparison_flow_test.dart' }
    default { 'integration_test/app_test.dart' }
}
$dartDefine = 'API_BASE_URL=http://127.0.0.1:3333/api'
$flutterArgs = @('test', $testFile, '-d', $serial, "--dart-define=$dartDefine")
if ($Scenario -eq 'cart') {
    $flutterArgs += @('--plain-name', 'produto entra no carrinho')
}
if ($Scenario -eq 'comparison') {
    $flutterArgs += @('--plain-name', 'compara')
}
& $flutter @flutterArgs
exit $LASTEXITCODE
