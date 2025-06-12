const CommentRepository = require('../../Domains/comments/CommentsRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addComment(newComment) {
        const id = `comment-${this._idGenerator()}`;
        const { content, threadId, owner } = newComment;
        const date = new Date().toISOString();

        const query = {
            text: 'INSERT INTO comments (id, thread_id, content, owner, date, is_delete) VALUES ($1, $2, $3, $4, $5, false) RETURNING id, content, owner, thread_id',
            values: [id, threadId, content, owner, date],
        };

        const result = await this._pool.query(query);
        // Ubah thread_id menjadi threadId
        return {
            ...result.rows[0],
            threadId: result.rows[0].thread_id,
        };
    }

    async verifyCommentOwner(commentId, owner) {
        const query = {
            text: 'SELECT owner FROM comments WHERE id = $1',
            values: [commentId],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('Comment not found');
        }
        if (result.rows[0].owner !== owner) {
            throw new AuthorizationError('You are not authorized to delete this comment');
        }
    }

    async deleteCommentById(commentId) {
        const query = {
            text: 'UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id',
            values: [commentId],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('Comment not found');
        }
    }

    async getCommentsByThreadId(threadId) {
        const query = {
            text: `
                SELECT comments.id, comments.content, comments.date, users.username, comments.is_delete, comments.thread_id, comments.owner
                FROM comments
                INNER JOIN users ON comments.owner = users.id
                WHERE comments.thread_id = $1
                ORDER BY comments.date ASC
            `,
            values: [threadId],
        };

        const result = await this._pool.query(query);
        // Ubah thread_id menjadi threadId untuk setiap komentar
        return result.rows.map(comment => ({
            ...comment,
            threadId: comment.thread_id,
            date: new Date(comment.date), // pastikan date dalam format ISO string
        }));
    }

    async verifyAvailabilityComment(commentId) {
        const query = {
            text: 'SELECT 1 FROM comments WHERE id = $1',
            values: [commentId],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('Comment not found');
        }
    }
}

module.exports = CommentRepositoryPostgres;