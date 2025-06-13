const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NewComment = require('../../../Domains/comments/entities/NewComments');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
    const user = {
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
    };

    const thread = {
        id: 'thread-123',
        title: 'Thread Title',
        body: 'Thread Body',
        owner: user.id,
    };

    beforeEach(async () => {
        await pool.query('BEGIN');
        await UsersTableTestHelper.addUser(user);
        await ThreadsTableTestHelper.addThread(thread);
    });

    afterEach(async () => {
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
        await pool.query('ROLLBACK');
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('addComment function', () => {
        it('should add a comment to the database', async () => {
            // Arrange
            const newComment = new NewComment({
                content: 'Comment Content',
                threadId: thread.id,
                owner: user.id,
            });
            const fakeIdGenerator = () => '456';
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

            // Act
            const addedComment = await commentRepositoryPostgres.addComment(newComment);

            // Assert
            expect(addedComment).toHaveProperty('id', 'comment-456');
            expect(addedComment).toHaveProperty('content', 'Comment Content');
            expect(addedComment).toHaveProperty('threadId', thread.id);
            expect(addedComment).toHaveProperty('owner', user.id);

            const comments = await CommentsTableTestHelper.findCommentById('comment-456');
            expect(comments).toHaveLength(1);
            expect(comments[0]).toHaveProperty('id', 'comment-456');
            expect(comments[0]).toHaveProperty('content', 'Comment Content');
            expect(comments[0]).toHaveProperty('thread_id', thread.id);
            expect(comments[0]).toHaveProperty('owner', user.id);
        });
    });

    describe('verifyAvailabilityComment function', () => {
        it('should not throw NotFoundError when comment is available', async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: thread.id });
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Act & Assert
            await expect(commentRepositoryPostgres.verifyAvailabilityComment('comment-123')).resolves.toBeUndefined();
        });

        it('should throw NotFoundError when comment is not available', async () => {
            // Arrange
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Act & Assert
            await expect(commentRepositoryPostgres.verifyAvailabilityComment('comment-999'))
                .rejects.toThrow(NotFoundError);
        });
    });

    describe('deleteComment function', () => {
        it('should soft delete a comment', async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: thread.id });
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Act
            await commentRepositoryPostgres.deleteCommentById('comment-123');

            // Assert
            const comments = await CommentsTableTestHelper.findCommentById('comment-123');
            expect(comments).toHaveLength(1);
            expect(comments[0].is_delete).toEqual(true);
        });

        it('should throw NotFoundError when comment does not exist', async () => {
            // Arrange
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Act & Assert
            await expect(commentRepositoryPostgres.deleteCommentById('comment-999'))
                .rejects.toThrow(NotFoundError);
        });
    });

    describe('verifyCommentOwner function', () => {
        it('should not throw error when owner matches', async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: user.id, threadId: thread.id });
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Act & Assert
            await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', user.id))
                .resolves.toBeUndefined();
        });

        it('should throw AuthorizationError when owner does not match', async () => {
            // Arrange
            await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: user.id, threadId: thread.id });
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Act & Assert
            await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-999'))
                .rejects.toThrow(AuthorizationError);
        });

        it('should throw NotFoundError when comment does not exist', async () => {
            // Arrange
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Act & Assert
            await expect(commentRepositoryPostgres.verifyCommentOwner('comment-999', user.id))
                .rejects.toThrow(NotFoundError);
        });
    });

    describe('getCommentsByThreadId function', () => {
        it('should retrieve comments by thread id with is_delete', async () => {
            // Arrange
            // const date = new Date('2025-06-09T12:00:00.000Z');
            const comment1 = {

                id: 'comment-123',
                content: 'Comment Content',
                owner: user.id,
                threadId: thread.id,
                date: new Date('2025-06-09T05:00:00.000Z'), // '2025-06-09T05:00:00.000Z',
                is_delete: false,
            }
            const comment2 = {
                id: 'comment-456',
                content: 'Deleted Comment',
                owner: user.id,
                threadId: thread.id,
                date:new Date('2025-06-09T05:01:00.000Z'),
                is_delete: true,
            }
            await CommentsTableTestHelper.addComment(comment1);
            await CommentsTableTestHelper.addComment(comment2);
            await CommentsTableTestHelper.softDeleteComment('comment-456');
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

            // Act
            const comments = await commentRepositoryPostgres.getCommentsByThreadId(thread.id);

            // Assert
            expect(comments).toHaveLength(2);

            // const sorted = comments.sort((a, b) => a.date.localeCompare(b.date));

            expect(comments[0]).toMatchObject({
                id: 'comment-123',
                content: 'Comment Content',
                username: user.username,
                owner: user.id,
                threadId: thread.id,
                is_delete: false,
                date: new Date('2025-06-09T05:00:00.000Z') // '2025-06-09T12:00:00.000Z'
            });
            // expect(sorted[0].date.toISOString()).toBe('2025-06-09T05:00:00.000Z');

            expect(comments[1]).toMatchObject({
                id: 'comment-456',
                content: 'Deleted Comment',
                username: user.username,
                owner: user.id,
                threadId: thread.id,
                is_delete: true,
                date: new Date('2025-06-09T05:01:00.000Z') // '2025-06-09T05:01:00.000Z'
            });
            // expect(sorted[1].date.toISOString()).toBe('2025-06-09T05:01:00.000Z');

            
        });
    });
});