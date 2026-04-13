/**
 * Gera hash bcrypt para colocar em admin_users.password_hash (fora do Postgres).
 * Uso: node scripts/hash-admin-password.mjs "sua senha"
 * Cole o resultado em um UPDATE/INSERT no Supabase ou use o script 004 com crypt().
 */
import bcrypt from "bcryptjs"

const pwd = process.argv[2]
if (!pwd) {
  console.error('Uso: node scripts/hash-admin-password.mjs "sua senha"')
  process.exit(1)
}
console.log(bcrypt.hashSync(pwd, 12))
