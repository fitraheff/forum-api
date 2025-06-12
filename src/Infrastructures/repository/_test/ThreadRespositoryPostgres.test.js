const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
// const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NewThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
    const user = {
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
    };

    const sampleThread = {
        title: 'Thread Title',
        body: 'Thread Body',
        date: new Date('2025-06-09T12:00:00.000Z'),
        owner: user.id,
    };

    beforeEach(async () => {
        await pool.query('BEGIN'); // Mulai transaksi
        await UsersTableTestHelper.cleanTable();
        await UsersTableTestHelper.addUser(user);
        await pool.query('COMMIT'); // Komit transaksi
    });

    afterEach(async () => {
        await pool.query('BEGIN');
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
        await pool.query('COMMIT');
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('addThread function', () => {
        it('should add one thread to database', async () => {
            // Arrange
            const fakeIdGenerator = () => '123'; // Mock id generator
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

            // Action
            const addedThread = await threadRepositoryPostgres.addThread(new NewThread(sampleThread));
            expect(addedThread).toBeInstanceOf(AddedThread);

            // Assert
            expect(addedThread).toBeInstanceOf(AddedThread);
            expect(addedThread).toHaveProperty('id', 'thread-123');
            expect(addedThread).toHaveProperty('title', sampleThread.title);
            expect(addedThread).toHaveProperty('owner', sampleThread.owner);

            const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
            expect(threads).toHaveLength(1);
            expect(threads[0]).toHaveProperty('id', 'thread-123');
            expect(threads[0].title).toEqual('Thread Title');
            expect(threads[0].body).toEqual('Thread Body');
            expect(threads[0].owner).toEqual(user.id);
        });
    });


    describe('getThreadById function', () => {
        it('should retrieve one thread detail correctly', async () => {
            // Arrange
            const fakeIdGenerator = () => '123'; // Mock id generator untuk konsistensi
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
            await ThreadsTableTestHelper.addThread(sampleThread);
            // Tambahkan thread dalam transaksi
            // await pool.query('BEGIN');
            // const addedThread = await threadRepositoryPostgres.addThread(new NewThread(sampleThread));
            // await pool.query('COMMIT');

            // Act
            const thread = await threadRepositoryPostgres.getThreadById('thread-123');

            // Assert
            expect(thread).toHaveProperty('id', 'thread-123');
            expect(thread).toHaveProperty('title', sampleThread.title);
            expect(thread).toHaveProperty('body', sampleThread.body);
            expect(thread).toHaveProperty('date', new Date('2025-06-09T12:00:00.000Z'));

            expect(thread).toHaveProperty('owner', sampleThread.owner);
            expect(thread).toHaveProperty('username', user.username);
        });

        it('should throw NotFoundError when thread does not exist', async () => {
            // Arrange
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');

            // Act & Assert
            await expect(threadRepositoryPostgres.getThreadById('thread-xxx')).rejects.toThrowError(NotFoundError);
        });
    });

    describe('verifyThreadExists function', () => {
        it('should not throw NotFoundError when thread exists', async () => {
            // Arrange
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

            // Act & Assert
            await expect(threadRepositoryPostgres.verifyThreadExists('thread-123')).rejects.toThrowError(NotFoundError);
        });

        it('should throw NotFoundError when thread does not exist', async () => {
            // Arrange
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
            await ThreadsTableTestHelper.addThread({
                id: 'thread-123',
            })

            // Act & Assert
            await expect(threadRepositoryPostgres.verifyThreadExists('thread-xxx')).rejects.toThrowError(NotFoundError);
        });
    });
});
