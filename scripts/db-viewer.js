const path = require('path');
const Database = require('better-sqlite3');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'pockets.db');

try {
  const db = new Database(dbPath, { readonly: true });

  const queryArg = process.argv.slice(2).join(' ').trim();

  if (queryArg) {
    console.log(`\n🔍 Ejecutando consulta: "${queryArg}" en ${dbPath}\n`);
    const results = db.prepare(queryArg).all();
    console.table(results);
  } else {
    console.log(`\n📦 Contenido de la Base de Datos SQLite (${dbPath})\n`);

    console.log('📌 Tabla: pockets');
    const pockets = db.prepare('SELECT id, name, target_amount, current_amount, progress, is_completed, created_at FROM pockets').all();
    if (pockets.length === 0) {
      console.log('  (Sin registros en pockets)');
    } else {
      console.table(pockets);
    }

    console.log('\n💳 Tabla: deposits');
    const deposits = db.prepare('SELECT id, pocket_id, amount, created_at FROM deposits').all();
    if (deposits.length === 0) {
      console.log('  (Sin registros en deposits)');
    } else {
      console.table(deposits);
    }
  }

  db.close();
} catch (error) {
  console.error('❌ Error al acceder a la base de datos:', error.message);
}
