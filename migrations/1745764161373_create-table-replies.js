/* eslint-disable camelcase */
exports.up = (pgm) => {
    pgm.createTable('replies', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        content: {
            type: 'TEXT',
            notNull: true,
        },
        owner: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'users(id)',
            onDelete: 'cascade',
        },
        comment_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'threads(id)',
            onDelete: 'cascade',
        },
        date: {
            type: 'TIMESTAMP',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP'),
        },
        is_delete: {
            type: 'BOOLEAN',
            notNull: true,
            default: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('replies');
};
