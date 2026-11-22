import 'package:econoway_app/core/format/formatadores.dart';
import 'package:econoway_app/helpers/nivel_helper.dart';
import 'package:econoway_app/models/historico_compras.dart';
import 'package:econoway_app/models/historico_preco.dart';
import 'package:econoway_app/models/progresso_contribuicao.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('formatadores', () {
    test('formatarMoeda usa vírgula decimal e separador de milhar', () {
      expect(formatarMoeda(0), 'R\$ 0,00');
      expect(formatarMoeda(7.5), 'R\$ 7,50');
      expect(formatarMoeda(1234.5), 'R\$ 1.234,50');
      expect(formatarMoeda(1234567.891), 'R\$ 1.234.567,89');
    });

    test('formatarData aceita ISO e devolve traço quando inválida', () {
      expect(formatarData(DateTime(2026, 3, 9, 8, 5)), '09/03/2026');
      expect(
        formatarData(DateTime(2026, 3, 9, 8, 5), comHora: true),
        '09/03/2026 08:05',
      );
      expect(formatarData(null), '—');
      expect(formatarData('texto'), '—');
    });

    test('formatarQuantidade omite casas quando inteira', () {
      expect(formatarQuantidade(2), '2');
      expect(formatarQuantidade(0.355), '0,355');
      expect(formatarQuantidade(1.5), '1,5');
    });
  });

  group('CompraResumo', () {
    test('interpreta o contrato da listagem, incluindo números como texto', () {
      final compra = CompraResumo.fromJson({
        'id_nota': 12,
        'data_compra': '2026-05-01T13:00:00.000Z',
        'id_supermercado': 3,
        'supermercado': 'Mercado Central',
        'total': '45.90',
        'total_itens': 4,
      });
      expect(compra.idNota, 12);
      expect(compra.supermercado, 'Mercado Central');
      expect(compra.total, 45.9);
      expect(compra.totalItens, 4);
      expect(compra.dataCompra, isNotNull);
    });

    test('tolera data ausente', () {
      final compra = CompraResumo.fromJson({
        'id_nota': 1,
        'data_compra': null,
        'supermercado': 'X',
        'total': 0,
        'total_itens': 0,
      });
      expect(compra.dataCompra, isNull);
    });
  });

  group('CompraDetalhe', () {
    test('interpreta cabeçalho e itens, inclusive item sem produto', () {
      final detalhe = CompraDetalhe.fromJson({
        'nota': {
          'id_nota': 9,
          'data_compra': '2026-05-01T13:00:00.000Z',
          'id_supermercado': 2,
          'supermercado': 'Mercado Central',
          'endereco': 'Rua A, 10',
          'total': 21.0,
          'total_itens': 2,
        },
        'itens': [
          {
            'id_nota_item': 1,
            'id_produto': 5,
            'nome_produto': 'Arroz 5kg',
            'unidade': 'KG',
            'quantidade': 2,
            'preco_unitario': 8.5,
            'subtotal': 17,
          },
          {
            'id_nota_item': 2,
            'id_produto': null,
            'nome_produto': 'Sacola',
            'unidade': null,
            'quantidade': 1,
            'preco_unitario': 4,
            'subtotal': 4,
          },
        ],
      });
      expect(detalhe.totalItens, 2);
      expect(detalhe.itens.first.idProduto, 5);
      expect(detalhe.itens.last.idProduto, isNull);
      expect(detalhe.endereco, 'Rua A, 10');
    });

    test('rejeita resposta sem itens', () {
      expect(
        () => CompraDetalhe.fromJson({'nota': <String, dynamic>{}}),
        throwsFormatException,
      );
    });
  });

  group('HistoricoPrecoProduto', () {
    test('lê preços atuais e compras do usuário', () {
      final dados = HistoricoPrecoProduto.fromJson({
        'produto': {
          'id_produto': 5,
          'nome_produto': 'Arroz 5kg',
          'marca': 'Marca',
          'categoria': 'Alimentos',
        },
        'precos_atuais': [
          {
            'id_supermercado': 1,
            'supermercado': 'A',
            'preco_atual': 20.9,
            'preco_fidelidade': null,
            'fonte': 'NFCE',
            'data_atualizacao': '2026-05-01T10:00:00.000Z',
          },
        ],
        'minhas_compras': [
          {
            'id_nota': 3,
            'id_supermercado': 1,
            'supermercado': 'A',
            'data_compra': '2026-05-01T10:00:00.000Z',
            'quantidade': 1,
            'preco_unitario': 21.5,
          },
        ],
      });
      expect(dados.nomeProduto, 'Arroz 5kg');
      expect(dados.precosAtuais.single.precoFidelidade, isNull);
      expect(dados.minhasCompras.single.precoUnitario, 21.5);
    });

    test('rejeita resposta sem preços atuais', () {
      expect(
        () => HistoricoPrecoProduto.fromJson({'produto': <String, dynamic>{}}),
        throwsFormatException,
      );
    });
  });

  group('ProgressoContribuicao', () {
    test('limita o progresso entre 0 e 1 e aplica metas padrão', () {
      final progresso = ProgressoContribuicao.fromJson({
        'progresso': 1.7,
        'notas_importadas': 12,
        'concluido': true,
        'mensagem_progresso': 'ok',
      });
      expect(progresso.progresso, 1.0);
      expect(progresso.metaNotas, 10);
      expect(progresso.metaProdutos, 50);
      expect(progresso.concluido, isTrue);
    });
  });

  group('NivelEconoWayer', () {
    test('define níveis por número de notas importadas', () {
      expect(NivelEconoWayer.obterNivel(0).nome, 'EconoWayer Bronze');
      expect(NivelEconoWayer.obterNivel(5).nome, 'EconoWayer Bronze');
      expect(NivelEconoWayer.obterNivel(6).nome, 'EconoWayer Prata');
      expect(NivelEconoWayer.obterNivel(20).nome, 'EconoWayer Prata');
      expect(NivelEconoWayer.obterNivel(21).nome, 'EconoWayer Ouro');
    });

    test('calcula notas restantes e progresso do nível', () {
      expect(NivelEconoWayer.notasParaProximoNivel(2), 4);
      expect(NivelEconoWayer.notasParaProximoNivel(10), 11);
      expect(NivelEconoWayer.notasParaProximoNivel(30), 0);
      expect(NivelEconoWayer.progressoDoNivel(0), 0);
      expect(NivelEconoWayer.progressoDoNivel(30), 1);
    });
  });
}
