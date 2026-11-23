# EconoWay Android

Aplicativo Flutter do consumidor.

## Papel no produto

- buscar produtos;
- montar/sincronizar carrinho;
- favoritar/selecionar supermercados;
- comparar a mesma cesta;
- distinguir comparação completa/parcial e preço desatualizado;
- salvar/consultar histórico;
- contribuir com NFC-e válida;
- consultar EconoCoins/perfil.

Supermercado e administração **não** são operados neste app; usam `web_frontend`.

## Executar

```bash
flutter pub get
dart format lib test
flutter analyze
flutter test
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3333/api
```

`10.0.2.2` vale para Android Emulator. Builds de produção exigem HTTPS.

## Segurança

- JWT em secure storage;
- nenhum token em log;
- cleartext desabilitado no manifest principal;
- URLs passam por `AppConfig`/`ApiClient`.

## Arquitetura

A estrutura atual está em transição para feature-first/MVVM. Não adicionar HTTP diretamente em screens. A direção canônica está em `../docs/architecture/mobile-architecture.md`.
