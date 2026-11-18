import type { PoolClient } from 'pg';

import {
  SupermercadoDTO,
  SupermercadoRepository,
} from '../repositories/supermercadoRepository';

export class SupermercadoService {

  static async cadastrar(
    dados: SupermercadoDTO,
    client?: PoolClient,
  ) {

    if (!dados.nome?.trim()) {
      throw new Error(
        'Nome do supermercado é obrigatório.',
      );
    }

    return SupermercadoRepository.cadastrar(
      dados,
      client,
    );
  }

  static async listarTodos(
    client?: PoolClient,
  ) {

    return SupermercadoRepository.listarTodos(
      client,
    );
  }

  static async buscarPerfil(
    idConta: number,
  ) {

    return SupermercadoRepository.buscarPorConta(
      idConta,
    );
  }

  static async atualizarPerfil(
    idSupermercado: number,
    dados: any,
  ) {

    if (
      !dados.nome_fantasia ||
      dados.nome_fantasia.trim() === ''
    ) {
      throw new Error(
        'Nome fantasia é obrigatório.',
      );
    }

    return SupermercadoRepository.atualizar(
      idSupermercado,
      dados,
    );
  }
}