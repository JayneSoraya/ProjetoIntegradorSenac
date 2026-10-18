import { UsuarioService } from '../services/usuarioService';
const usuarioService = new UsuarioService();
export class UsuarioController {
    static async registrar(req, res) {
        try {
            const resultado = await UsuarioService.cadastrar(req.body);
            res.status(201).json({
                mensagem: 'Usuário registrado com sucesso! 🚀',
                dados: resultado
            });
        }
        catch (error) {
            if (error.code === '23505') {
                res.status(400).json({ erro: 'Este e-mail já está cadastrado no sistema.' });
                return;
            }
            res.status(500).json({ erro: 'Erro interno ao processar o cadastro.' });
        }
    }
}
