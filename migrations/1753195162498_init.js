/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createTable('users', {
    id: 'id',
    uid: { type: 'uuid', notNull: true, unique: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'text', notNull: true },
  });

  pgm.createTable('scores', {
    id: 'id',
    user_id: { type: 'integer', notNull: true, references: 'users(id)', onDelete: 'cascade' },
    score: { type: 'integer', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  });

  pgm.createTable('achievements', {
    id: 'id',
    name: { type: 'text', notNull: true, unique: true },
    description: { type: 'text' },
  });

  pgm.createTable('user_achievements', {
    user_id: { type: 'integer', notNull: true, references: 'users(id)', onDelete: 'cascade' },
    achievement_id: {
      type: 'integer',
      notNull: true,
      references: 'achievements(id)',
      onDelete: 'cascade',
    },
    unlocked_at: { type: 'timestamp', default: pgm.func('now()') },
  });

  pgm.addConstraint('user_achievements', 'pk_user_achievement', {
    primaryKey: ['user_id', 'achievement_id'],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('user_achievements');
  pgm.dropTable('achievements');
  pgm.dropTable('scores');
  pgm.dropTable('users');
  pgm.dropExtension('pgcrypto');
};
