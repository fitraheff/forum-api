const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('Threads API', () => {
    let accessToken;
    let server;

    beforeAll(async () => {
        server = await createServer(container);
        const tokenData = await ServerTestHelper.getAccessToken({ server });
        accessToken = tokenData.accessToken;
    });

    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
    });

    describe('POST /threads', () => {
        it('should respond 201 and persist thread', async () => {
            const requestPayload = {
                title: 'thread title',
                body: 'thread body',
            };

            const response = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: requestPayload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toBe(201);
            expect(responseJson.status).toBe('success');
            expect(responseJson.data.addedThread).toBeDefined();
            expect(responseJson.data.addedThread.id).toBeDefined();
            expect(responseJson.data.addedThread.title).toBeDefined();
            expect(responseJson.data.addedThread.owner).toBeDefined();
        });

        it('should respond 400 when request payload is incomplete', async () => {
            const requestPayload = {
                title: 'thread title',
            };

            const response = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: requestPayload,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toBe(400);
            expect(responseJson.status).toBe('fail');
            expect(responseJson.message).toBe('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak lengkap');
        });

        it('should respond 401 when not authenticated', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: {
                    title: 'thread title',
                    body: 'thread body',
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toBe(401);
            expect(responseJson.status).toBe('fail');
            expect(responseJson.message).toBe('Missing authentication');
        });
    });

    describe('GET /threads/{threadId}', () => {
        it('should respond 200 with thread detail', async () => {
            await UsersTableTestHelper.addUser({
                id: 'user-123',
                username: 'dicoding',
                password: 'secret',
                fullname: 'Dicoding Indonesia'
            });
            await UsersTableTestHelper.addUser({
                id: 'user-456',
                username: 'johndoe',
                password: 'secret',
                fullname: 'John Doe'
            });
            await ThreadsTableTestHelper.addThread({
                id: 'thread-123',
                title: 'thread title',
                body: 'thread body',
                owner: 'user-123',
                date: '2025-06-07T05:55:30.000Z',
            });
            await CommentsTableTestHelper.addComment({
                id: 'comment-123',
                threadId: 'thread-123',
                content: 'sebuah comment',
                owner: 'user-456',
                date: '2025-06-07T05:00:00.000Z',
            });
            await new Promise(resolve => setTimeout(resolve, 100));
            await CommentsTableTestHelper.addComment({
                id: 'comment-456',
                threadId: 'thread-123',
                content: 'komentar dihapus',
                owner: 'user-123',
                date: '2025-06-07T05:55:30.000Z',
            });
            await CommentsTableTestHelper.softDeleteComment('comment-456');

            const response = await server.inject({
                method: 'GET',
                url: '/threads/thread-123',
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data).toBeDefined();
            expect(responseJson.data.thread).toBeDefined();
            expect(responseJson.data.thread.comments).toHaveLength(2);
            expect(responseJson.data.thread.comments[0].content).toEqual('sebuah comment');
            expect(responseJson.data.thread.comments[1].content).toEqual('**komentar telah dihapus**');
        });

        it('should respond 404 when thread not found', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/threads/thread-999',
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toBe(404);
            expect(responseJson.status).toBe('fail');
            expect(responseJson.message).toBe('Thread not found');
        });
    });
});