"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupermercadoService = void 0;
// node_backend/src/services/supermercadoService.ts
const database_1 = require("../database");
class SupermercadoService {
    // Salva um novo supermercado no banco
    static async cadastrar(dados) {
        const { nome, url_logo, logradouro, numero, bairro, cidade, estado, cep, latitude, longitude } = dados;
        const query = `
      INSERT INTO supermercado (nome_fantasia, url_logo, logradouro, numero, bairro, cidade, estado, cep, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
        const valores = [nome, url_logo, logradouro, numero, bairro, cidade, estado, cep, latitude, longitude];
        const resultado = await database_1.pool.query(query, valores);
        return resultado.rows[0];
    }
    // Lista todos os supermercados cadastrados
    static async listarTodos() {
        const query = 'SELECT * FROM supermercado ORDER BY nome_fantasia ASC;';
        const resultado = await database_1.pool.query(query);
        return resultado.rows;
    }
    // Busca o supermercado vinculado à conta lograda
    static async buscarPorIdConta(idConta) {
        const query = `
      SELECT
        id_supermercado, nome_fantasia, telefone, email,
        cep, logradouro, numero, bairro, cidade, estado, pais,
        latitude, longitude,
        horario_semana_inicio, horario_semana_fim,
        horario_sabado_inicio, horario_sabado_fim,
        horario_domingo_inicio, horario_domingo_fim,
        horario_feriado_inicio, horario_feriado_fim,
        logo_url, capa_url
      FROM supermercado
      WHERE id_conta = $1;
    `;
        const resultado = await database_1.pool.query(query, [idConta]);
        return resultado.rows[0];
    }
    // Atualiza um supermercado existente
    static async atualizar(id, dados) {
        const { nome, logradouro, esta_aberto } = dados;
        const query = `
      UPDATE supermercado
      SET nome_fantasia = COALESCE($1, nome_fantasia),
          logradouro = COALESCE($2, logradouro),
          esta_aberto = COALESCE($3, esta_aberto)
      WHERE id_supermercado = $4
      RETURNING *;
    `;
        const resultado = await database_1.pool.query(query, [nome, logradouro, esta_aberto, id]);
        return resultado.rows[0];
    }
    // Remove um supermercado
    static async remover(id) {
        const query = 'DELETE FROM supermercado WHERE id_supermercado = $1 RETURNING *;';
        const resultado = await database_1.pool.query(query, [id]);
        return resultado.rows[0];
    }
}
exports.SupermercadoService = SupermercadoService;
