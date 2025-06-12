const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../Domains/comments/CommentsRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadByIdUseCase', () => {
    it('should orchestrate the get thread by id action correctly', async () => {
        // Arrange
        const useCasePayload = {
            threadId: 'thread-123',
        };

        const expectedThread = {
            id: 'thread-123',
            title: 'Thread Title',
            body: 'Thread Body',
            date: new Date('2021-08-08T07:19:09.775Z').toISOString(),
            username: 'dicoding',
            owner: 'user-123', // Tambahkan owner sesuai concrete implementation
        };

        const expectedComments = [
            {
                id: 'comment-123',
                username: 'johndoe',
                date: new Date('2021-08-08T07:22:33.555Z').toISOString(),
                content: 'This is a comment',
                is_delete: false,
                threadId: 'thread-123', // Tambahkan threadId sesuai concrete implementation
                owner: 'user-456', // Tambahkan owner sesuai concrete implementation
            },
            {
                id: 'comment-456',
                username: 'dicoding',
                date: new Date('2021-08-08T07:26:21.338Z').toISOString(),
                content: 'Another comment',
                is_delete: true,
                threadId: 'thread-123', // Tambahkan threadId sesuai concrete implementation
                owner: 'user-123', // Tambahkan owner sesuai concrete implementation
            },
        ];

        const expectedResponse = {
            thread: {
                id: 'thread-123',
                title: 'Thread Title',
                body: 'Thread Body',
                date: new Date('2021-08-08T07:19:09.775Z').toISOString(),
                username: 'dicoding',
                comments: [
                    {
                        id: 'comment-123',
                        username: 'johndoe',
                        date: new Date('2021-08-08T07:22:33.555Z').toISOString(),
                        content: 'This is a comment',
                    },
                    {
                        id: 'comment-456',
                        username: 'dicoding',
                        date: new Date('2021-08-08T07:26:21.338Z').toISOString(),
                        content: '**komentar telah dihapus**',
                    },
                ],
            },
        };

        // Mocking
        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();

        mockThreadRepository.verifyThreadExists = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockThreadRepository.getThreadById = jest.fn()
            .mockImplementation(() => Promise.resolve(expectedThread));
        mockCommentRepository.getCommentsByThreadId = jest.fn()
            .mockImplementation(() => Promise.resolve(expectedComments));

        // Create use case instance
        const getThreadUseCase = new GetThreadUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
        });

        // Action
        const response = await getThreadUseCase.execute(useCasePayload);

        // Assert
        expect(response).toStrictEqual(expectedResponse);
        expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCasePayload.threadId);
        expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
        expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId);
    });
});