/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
    async addComment({
        id = 'comment-123', 
        content = 'Comment Content', 
        owner = 'user-123', 
        threadId = 'thread-123', 
        date = '2025-06-09T05:00:00.000Z',
        is_delete = false,
    }) {
        const query = {
            text: 'INSERT INTO comments(id, content, owner, thread_id, date, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
            values: [id, content, owner, threadId, date, is_delete],
        };

        await pool.query(query);
    },

    async findCommentById(id) {
        const query = {
            text: 'SELECT * FROM comments WHERE id = $1',
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows;
    },

    async findCommentByThreadId(threadId) {
        const query = {
            text: 'SELECT * FROM comments WHERE thread_id = $1',
            values: [threadId],
        };

        const result = await pool.query(query);
        return result.rows;
    },

    async softDeleteComment(id) {
        const query = {
            text: 'UPDATE comments SET is_delete = true WHERE id = $1',
            values: [id],
        }

        await pool.query(query);
    },

    async cleanTable() {
        await pool.query('DELETE FROM comments WHERE 1=1');
    },
};

module.exports = CommentsTableTestHelper;