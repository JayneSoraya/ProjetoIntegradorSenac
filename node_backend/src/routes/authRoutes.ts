import { Router } from 'express';
import { cadastrarUsuario, loginUsuario } from '../controllers/Authcontroller'

const router = Router();

router.post('/cadastro', cadastrarUsuario);
router.post('/login', loginUsuario);


export default router;

