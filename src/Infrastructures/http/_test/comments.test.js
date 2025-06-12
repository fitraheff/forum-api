/* eslint-disable no-unused-vars */
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const injections = require('../../container');
const createServer = require('../createServer');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('Comments API', () => {
    afterEach(async () => {
        await CommentsTableTestHelper.cleanTable();
        await ThreadableTestHelper.cleanTable();
        await AuthenticationsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('POST /threads/{threadId}/comments', () => {
        it('should respond 201 and persist comment', async () => {
            const requestPayload = { content: 'a comment' };
            const server = await createServer(injections);
            const { accessToken, userId } = await ServerTestHelper.getAccessToken({ server });
            const threadId = 'thread-123';
            await ThreadableTestHelper.addThread({ id: threadId, owner: userId });

            const response = await server.inject({
                method: 'POST',
                url: `/threads/${threadId}/comments`,
                payload: requestPayload,
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(201);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.addedComment).toBeDefined();
            expect(responseJson.data.addedComment.id).toBeDefined();
            expect(responseJson.data.addedComment.content).toEqual(requestPayload.content);
            expect(responseJson.data.addedComment.owner).toEqual(userId);
        });

        it('should respond 400 when payload is incomplete', async () => {
            const requestPayload = {};
            const server = await createServer(injections);
            const { accessToken, userId } = await ServerTestHelper.getAccessToken({ server });
            const threadId = 'thread-123';
            await ThreadableTestHelper.addThread({ id: threadId, owner: userId });

            const response = await server.inject({
                method: 'POST',
                url: `/threads/${threadId}/comments`,
                payload: requestPayload,
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('NEW_COMMENTS.NOT_CONTAIN_NEEDED_PROPERTY');
        });

        it('should respond 400 when payload has wrong data type', async () => {
            const requestPayload = { content: 123 };
            const server = await createServer(injections);
            const { accessToken, userId } = await ServerTestHelper.getAccessToken({ server });
            const threadId = 'thread-123';
            await ThreadableTestHelper.addThread({ id: threadId, owner: userId });

            const response = await server.inject({
                method: 'POST',
                url: `/threads/${threadId}/comments`,
                payload: requestPayload,
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('NEW_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION');
        });

        it('should respond 404 when thread does not exist', async () => {
            const requestPayload = { content: 'a comment' };
            const server = await createServer(injections);
            const { accessToken } = await ServerTestHelper.getAccessToken({ server });
            const threadId = 'thread-xxx';

            const response = await server.inject({
                method: 'POST',
                url: `/threads/${threadId}/comments`,
                payload: requestPayload,
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toBeDefined();
        });
    });

    describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
        it('should respond 200 and delete comment', async () => {
            const server = await createServer(injections);
            const { userId, accessToken } = await ServerTestHelper.getAccessToken({ server });
            const threadId = 'thread-123';
            const commentId = 'comment-123';
            await ThreadableTestHelper.addThread({ id: threadId, owner: userId });
            await CommentsTableTestHelper.addComment({ id: commentId, owner: userId, threadId });

            const response = await server.inject({
                method: 'DELETE',
                url: `/threads/${threadId}/comments/${commentId}`,
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');
        });

        it('should respond 403 when user is not comment owner', async () => {
            const server = await createServer(injections);
            const { accessToken: firstAccessToken, userId: firstUserId } = await ServerTestHelper.getAccessToken({ server, username: 'JohnDoe' });
            const threadId = 'thread-123';
            const commentId = 'comment-123';
            await ThreadableTestHelper.addThread({ id: threadId, owner: firstUserId });
            await CommentsTableTestHelper.addComment({ id: commentId, owner: firstUserId, threadId });

            const { accessToken: secondAccessToken } = await ServerTestHelper.getAccessToken({ server, username: 'JaneDoe' });

            const response = await server.inject({
                method: 'DELETE',
                url: `/threads/${threadId}/comments/${commentId}`,
                headers: { Authorization: `Bearer ${secondAccessToken}` },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(403);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toBeDefined();
        });

        it('should respond 404 when comment or thread does not exist', async () => {
            const server = await createServer(injections);
            const { accessToken } = await ServerTestHelper.getAccessToken({ server });
            const threadId = 'thread-123';
            const commentId = 'comment-xxx';

            const response = await server.inject({
                method: 'DELETE',
                url: `/threads/${threadId}/comments/${commentId}`,
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toBeDefined();
        });
    });
});