const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');

class ThreadRepositoryPostgres extends ThreadRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addThread(newThread) {
        const id = `thread-${this._idGenerator()}`;
        const { title, body, owner } = newThread;
        const date = new Date().toISOString();

        const query = {
            text: 'INSERT INTO threads (id, title, body, owner, date) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, owner',
            values: [id, title, body, owner, date],
        };

        const result = await this._pool.query(query);
        return new AddedThread({ ...result.rows[0] });
    }

    async getThreadById(id) {
        const query = {
            text: `
                SELECT threads.id, threads.title, threads.body, threads.owner, threads.date, users.username 
                FROM threads 
                INNER JOIN users ON threads.owner = users.id 
                WHERE threads.id = $1
            `,
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('Thread not found');
        }
        return result.rows[0];
    }

    async verifyThreadExists(threadId) {
        const query = {
            text: 'SELECT 1 FROM threads WHERE id = $1',
            values: [threadId],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('Thread not found');
        }
    }
}

module.exports = ThreadRepositoryPostgres;