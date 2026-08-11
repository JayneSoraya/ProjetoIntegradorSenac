import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../models/supermercado_dto.dart';
import '../services/supermercado_service.dart';
import '../theme/app_theme.dart';
import 'comparacao_screen.dart';
import '../widgets/cart_scope.dart';

class SupermercadosScreen extends StatefulWidget {
  final bool selecionarParaComparacao;
  const SupermercadosScreen({super.key, this.selecionarParaComparacao = false});

  @override
  State<SupermercadosScreen> createState() => _SupermercadosScreenState();
}

class _SupermercadosScreenState extends State<SupermercadosScreen> {
  List<SupermercadoDTO> _mercados = [];
  final Set<int> _selecionados = {};
  bool _carregando = true;
  bool _localizacaoAtiva = false;
  String _busca = '';
  String _filtro = 'Todos';

  @override
  void initState() {
    super.initState();
    _carregar();
  }

  Future<void> _carregar() async {
    try {
      final position = await _obterLocalizacao();
      final result = await SupermercadoService.listar(
        latitude: position?.latitude,
        longitude: position?.longitude,
      );
      if (!mounted) return;
      setState(() {
        _mercados = result;
        _carregando = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _carregando = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Não foi possível carregar os supermercados.'),
        ),
      );
    }
  }

  Future<Position?> _obterLocalizacao() async {
    try {
      if (!await Geolocator.isLocationServiceEnabled()) {
        return null;
      }
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return null;
      }
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
        ),
      );
      if (mounted) setState(() => _localizacaoAtiva = true);
      return position;
    } catch (_) {
      return null;
    }
  }

  Future<void> _toggleFavorite(SupermercadoDTO market) async {
    final next = !market.favorito;
    try {
      await SupermercadoService.favoritar(market.id, next);
      await _carregar();
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Não foi possível atualizar o favorito.')),
      );
    }
  }

  List<SupermercadoDTO> get _visiveis {
    final term = _busca.trim().toLowerCase();
    final list = _mercados.where((market) {
      final searchOk = term.isEmpty || market.nome.toLowerCase().contains(term);
      final filterOk = switch (_filtro) {
        'Favoritos' => market.favorito,
        'Aberto' => market.aberto,
        _ => true,
      };
      return searchOk && filterOk;
    }).toList();

    if (_filtro == 'Distância') {
      list.sort((a, b) {
        if (a.distanciaKm == null && b.distanciaKm == null) {
          return a.nome.compareTo(b.nome);
        }
        if (a.distanciaKm == null) return 1;
        if (b.distanciaKm == null) return -1;
        return a.distanciaKm!.compareTo(b.distanciaKm!);
      });
    } else if (_filtro == 'Avaliação') {
      list.sort((a, b) => b.avaliacao.compareTo(a.avaliacao));
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final visible = _visiveis;
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.selecionarParaComparacao
              ? 'Escolher supermercados'
              : 'Supermercados',
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: TextField(
                onChanged: (value) => setState(() => _busca = value),
                decoration: InputDecoration(
                  hintText: 'Procure por um mercado',
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: Colors.grey.shade100,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(28),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            SizedBox(
              height: 44,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children:
                    ['Todos', 'Distância', 'Avaliação', 'Aberto', 'Favoritos']
                        .map(
                          (filter) => Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: ChoiceChip(
                              label: Text(filter),
                              selected: _filtro == filter,
                              onSelected: (_) =>
                                  setState(() => _filtro = filter),
                            ),
                          ),
                        )
                        .toList(),
              ),
            ),
            const SizedBox(height: 8),
            if (!_carregando)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    _localizacaoAtiva
                        ? 'Distâncias calculadas pela sua localização atual.'
                        : 'Ative a localização para ordenar por proximidade.',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
              ),
            Expanded(
              child: _carregando
                  ? const Center(child: CircularProgressIndicator())
                  : visible.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Text(
                          _filtro == 'Distância'
                              ? 'Nenhum supermercado com localização disponível.'
                              : 'Nenhum supermercado encontrado.',
                          textAlign: TextAlign.center,
                        ),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: visible.length,
                      itemBuilder: (_, index) {
                        final market = visible[index];
                        final selected = _selecionados.contains(market.id);
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: ListTile(
                            contentPadding: const EdgeInsets.all(14),
                            onTap: widget.selecionarParaComparacao
                                ? () => setState(
                                    () => selected
                                        ? _selecionados.remove(market.id)
                                        : _selecionados.add(market.id),
                                  )
                                : null,
                            leading: CircleAvatar(
                              backgroundColor: AppColors.primary.withValues(
                                alpha: 0.1,
                              ),
                              child: const Icon(
                                Icons.storefront,
                                color: AppColors.primary,
                              ),
                            ),
                            title: Text(
                              market.nome,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            subtitle: Padding(
                              padding: const EdgeInsets.only(top: 6),
                              child: Wrap(
                                spacing: 12,
                                runSpacing: 4,
                                children: [
                                  Text(
                                    market.distanciaKm == null
                                        ? 'Distância indisponível'
                                        : '${market.distanciaKm!.toStringAsFixed(1)} km',
                                  ),
                                  Text(
                                    '★ ${market.avaliacao.toStringAsFixed(1)}',
                                  ),
                                  Text(market.aberto ? 'Aberto' : 'Fechado'),
                                ],
                              ),
                            ),
                            trailing: widget.selecionarParaComparacao
                                ? Checkbox(
                                    value: selected,
                                    onChanged: (_) => setState(
                                      () => selected
                                          ? _selecionados.remove(market.id)
                                          : _selecionados.add(market.id),
                                    ),
                                  )
                                : IconButton(
                                    tooltip: market.favorito
                                        ? 'Remover dos favoritos'
                                        : 'Adicionar aos favoritos',
                                    icon: Icon(
                                      market.favorito
                                          ? Icons.favorite
                                          : Icons.favorite_border,
                                      color: market.favorito
                                          ? AppColors.primary
                                          : null,
                                    ),
                                    onPressed: () => _toggleFavorite(market),
                                  ),
                          ),
                        );
                      },
                    ),
            ),
            if (widget.selecionarParaComparacao)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (visible.isNotEmpty)
                      TextButton(
                        onPressed: () => setState(() {
                          final visibleIds = visible
                              .map((item) => item.id)
                              .toSet();
                          final allSelected = visibleIds.every(
                            _selecionados.contains,
                          );
                          if (allSelected) {
                            _selecionados.removeAll(visibleIds);
                          } else {
                            _selecionados.addAll(visibleIds);
                          }
                        }),
                        child: const Text(
                          'Selecionar ou limpar mercados visíveis',
                        ),
                      ),
                    SizedBox(
                      height: 54,
                      child: ElevatedButton(
                        onPressed: _selecionados.isEmpty
                            ? null
                            : () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ComparacaoScreen(
                                    cart: CartScope.of(context),
                                    supermercadosSelecionados: _selecionados
                                        .toList(),
                                  ),
                                ),
                              ),
                        child: Text(
                          'Comparar ${_selecionados.length} mercado(s)',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
