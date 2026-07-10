/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  // Stable anonymous identity carried in a signed httpOnly cookie, replacing the
  // spoofable `ip|user_agent` fingerprint. Nullable so existing rows keep working;
  // the unique index allows multiple NULLs in Postgres.
  pgm.addColumn('users', {
    visitor_id: { type: 'text', notNull: false },
  });
  pgm.createIndex('users', 'visitor_id', { unique: true, name: 'users_visitor_id_unique' });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.dropIndex('users', 'visitor_id', { name: 'users_visitor_id_unique' });
  pgm.dropColumn('users', 'visitor_id');
};
