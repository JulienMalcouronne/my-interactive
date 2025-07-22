/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.createType('score_multiplier', ['1', '2', '3', '4', '5', '10']);

  pgm.addColumn('users', {
    multiplier: {
      type: 'score_multiplier',
      notNull: true,
      default: '1',
    },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.dropColumn('users', 'multiplier');

  pgm.dropType('score_multiplier');
};
