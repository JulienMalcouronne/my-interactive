/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  // Identity moved to the signed `visitor_id` cookie. The old `ip|user_agent`
  // fingerprint is now dead weight, and its UNIQUE constraint blocked new
  // inserts for returning visitors — drop it and stop requiring the column.
  pgm.dropConstraint('users', 'users_fingerprint_key', { ifExists: true });
  pgm.alterColumn('users', 'fingerprint', { notNull: false });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.alterColumn('users', 'fingerprint', { notNull: true });
  pgm.addConstraint('users', 'users_fingerprint_key', { unique: 'fingerprint' });
};
