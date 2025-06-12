const DeleteCommentUseCase = require('../DeleteCommentsUseCase');
const CommentRepository = require('../../../../Domains/comments/CommentsRepository');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');

describe('DeleteCommentsUseCase', () => {
    it('should orchestrating the delete comment action correctly', async () => {
        // Arrange
        const useCasePayload = {
            commentId: 'comment-123',
            threadId: 'thread-123',
            owner: 'user-123',
        };

        // Mocking
        const mockCommentRepository = new CommentRepository();
        const mockThreadRepository = new ThreadRepository();

        mockThreadRepository.verifyThreadExists = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.verifyCommentOwner = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.verifyAvailabilityComment = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.deleteCommentById = jest.fn() // Ubah dari deleteComment menjadi deleteCommentById
            .mockImplementation(() => Promise.resolve());

        // Create use case instance
        const deleteCommentUseCase = new DeleteCommentUseCase({
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
        });

        // Action
        await deleteCommentUseCase.execute(useCasePayload);

        // Assert
        expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCasePayload.threadId);
        expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(useCasePayload.commentId, useCasePayload.owner);
        expect(mockCommentRepository.verifyAvailabilityComment).toBeCalledWith(useCasePayload.commentId);
        expect(mockCommentRepository.deleteCommentById).toBeCalledWith(useCasePayload.commentId); // Ubah ke deleteCommentById
    });
});