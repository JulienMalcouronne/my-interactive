/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  // Latest carbon-footprint total in kg CO2e for the user (null until they take the test).
  pgm.addColumn('users', {
    carbon_total: { type: 'integer', notNull: false },
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.dropColumn('users', 'carbon_total');
};
