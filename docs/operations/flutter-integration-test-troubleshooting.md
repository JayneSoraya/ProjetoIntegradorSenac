# Diagnóstico do integration_test Flutter no Windows/Android

## Sintoma

`flutter test integration_test/... -d emulator-5554` instala e inicia o APK, mas termina durante o carregamento com `VmServiceDisappearedException`.

## Reprodução mínima

Foi criado `C:\DOCS\SENAC\_flutter_integration_repro` com o mesmo Flutter 3.44.9 e o mesmo AVD API 35. O teste mínimo de contador reproduziu o mesmo erro antes da primeira asserção.

## Evidência

O logcat registra carregamento normal do `libflutter.so` e VM Service ouvindo em `127.0.0.1:40885`, sem crash fatal, SIGSEGV, SIGABRT, ANR, low-memory ou cleartext. A evidência está em `docs/roadmap/evidence/flutter-integration-verbose.log`.

## Classificação

`INTERMITTENT_HARNESS_OR_ADB_BOUNDARY`: a reprodução mínima falhou uma vez e passou em duas execuções após `gradlew --stop`/`flutter clean`; o smoke EconoWay também passou. Isso é evidência de intermitência na fronteira do runner/ADB/emulador, não autorização para trocar channel, fazer downgrade ou adicionar flags experimentais.

Durante o fluxo EconoWay, TESTE 2 revelou ainda um problema independente de UX: cards da Home estouravam verticalmente em tela estreita e os taps ficavam fora da área. O layout foi corrigido em `lib/screens/home_screen.dart`.

## Comandos de reprodução

```powershell
flutter test integration_test/smoke_test.dart -d emulator-5554
adb -s emulator-5554 logcat -d
```

## Próximo diagnóstico

Repetir a matriz com outro AVD/imagem suportada ou testar uma versão Flutter oficialmente relacionada a uma issue identificada. Até haver correção validada, o status E2E permanece `PARTIAL_ANDROID_VALIDATION`.
