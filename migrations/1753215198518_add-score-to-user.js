/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.addColumn('users', {
    score: { type: 'integer', notNull: true, default: 0 },
  });

  pgm.dropTable('scores');
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.createTable('scores', {
    id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade',
    },
    score: { type: 'integer', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  });

  pgm.dropColumn('users', 'score');
};
