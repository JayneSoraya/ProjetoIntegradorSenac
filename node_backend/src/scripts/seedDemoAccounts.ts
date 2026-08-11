import bcrypt from 'bcrypt';
import { pool } from '../database';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Defina ${name} para criar as contas de demonstração.`);
  return value;
}

async function upsertAccount(input: {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'SUPERMERCADO' | 'USUARIO';
}) {
  const passwordHash = await bcrypt.hash(input.password, 10);
  const result = await pool.query<{ id_conta: number }>(
    `INSERT INTO conta (tipo_conta, email, senha, nome, status_conta)
     VALUES ($1, LOWER($2), $3, $4, TRUE)
     ON CONFLICT (LOWER(email))
     DO UPDATE SET
       tipo_conta = EXCLUDED.tipo_conta,
       senha = EXCLUDED.senha,
       nome = EXCLUDED.nome,
       status_conta = TRUE
     RETURNING id_conta`,
    [input.role, input.email, passwordHash, input.name],
  );
  return result.rows[0].id_conta;
}

export async function seedDemoAccounts() {
  const userAccountId = await upsertAccount({
    name: process.env.DEMO_USER_NAME?.trim() || 'Usuário Demo',
    email: required('DEMO_USER_EMAIL'),
    password: required('DEMO_USER_PASSWORD'),
    role: 'USUARIO',
  });
  await pool.query(
    `INSERT INTO usuario (id_conta, latitude, longitude, endereco)
     VALUES ($1, -23.552000, -46.634000, 'Localização de demonstração')
     ON CONFLICT (id_conta) DO UPDATE SET
       latitude = COALESCE(usuario.latitude, EXCLUDED.latitude),
       longitude = COALESCE(usuario.longitude, EXCLUDED.longitude)`,
    [userAccountId],
  );

  const adminId = await upsertAccount({
    name: process.env.DEMO_ADMIN_NAME?.trim() || 'Administrador Demo',
    email: required('DEMO_ADMIN_EMAIL'),
    password: required('DEMO_ADMIN_PASSWORD'),
    role: 'ADMIN',
  });
  await pool.query(
    `INSERT INTO administrador (id_conta, nivel_acesso, area_responsavel)
     VALUES ($1, 'ADMIN', 'DEMO')
     ON CONFLICT (id_conta) DO UPDATE SET nivel_acesso = 'ADMIN', area_responsavel = 'DEMO'`,
    [adminId],
  );

  const marketAccountId = await upsertAccount({
    name: process.env.DEMO_MARKET_NAME?.trim() || 'Responsável Mercado Demo',
    email: required('DEMO_MARKET_EMAIL'),
    password: required('DEMO_MARKET_PASSWORD'),
    role: 'SUPERMERCADO',
  });
  const market = await pool.query<{ id_supermercado: number }>(
    `SELECT id_supermercado FROM supermercado WHERE cnpj = '11222333000181' LIMIT 1`,
  );
  if (!market.rows[0]) throw new Error('Execute o seed SQL antes de criar a conta do supermercado.');
  await pool.query(
    `INSERT INTO supermercado_responsavel (id_supermercado, id_conta, papel, status)
     VALUES ($1, $2, 'GESTOR', 'ATIVO')
     ON CONFLICT (id_supermercado, id_conta) DO UPDATE SET status = 'ATIVO'`,
    [market.rows[0].id_supermercado, marketAccountId],
  );
}

if (require.main === module) {
  seedDemoAccounts()
    .then(() => console.log('Contas demo criadas/atualizadas. Credenciais não são exibidas no log.'))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
