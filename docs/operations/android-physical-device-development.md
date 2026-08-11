# Desenvolvimento Android em dispositivo físico

## Pré-requisitos

- Ativar USB debugging no aparelho e aceitar a chave RSA.
- Confirmar `adb devices -l` e escolher o serial exibido; não fixar serial em scripts.
- Stack local saudável em `http://127.0.0.1:3333`.

## API sem expor a LAN

O app usa `API_BASE_URL` centralizado em `lib/core/config/app_config.dart`.

```powershell
adb -s <SERIAL> reverse tcp:3333 tcp:3333
adb -s <SERIAL> reverse --list
flutter run -d <SERIAL> --dart-define=API_BASE_URL=http://127.0.0.1:3333/api
```

Para o emulador, mantenha `http://10.0.2.2:3333/api`. Builds release exigem HTTPS.

## APK debug

```powershell
flutter build apk --debug --dart-define=API_BASE_URL=http://127.0.0.1:3333/api
adb -s <SERIAL> install -r build/app/outputs/flutter-apk/app-debug.apk
```

## E2E

```powershell
flutter test integration_test/smoke_test.dart -d <SERIAL>
flutter test integration_test/auth_flow_test.dart -d <SERIAL>
flutter test integration_test/app_test.dart -d <SERIAL> --plain-name 'TESTE 2'
```

O `integration_test` não controla diálogos nativos de permissão; conceder localização somente em cenários controlados ou testar a camada Dart com mock.

## Troubleshooting

- `unauthorized`: desbloquear o aparelho e aceitar a chave RSA.
- Sem rota reverse: repetir `adb reverse` após reconectar o USB.
- API inacessível: confirmar `/api/health`, `/api/ready` e `adb reverse --list`.
- Não registrar serial pessoal, senha, token ou logs contendo credenciais.
