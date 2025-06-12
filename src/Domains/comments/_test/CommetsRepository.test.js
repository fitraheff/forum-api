const CommentRepository = require('../CommentsRepository');

describe('CommentRepository interface', () => {
    it('should throw error when invoke abstract behavior', async () => {
        // Arrange
        const commentRepository = new CommentRepository();

        // Action & Assert
        await expect(commentRepository.addComment({})).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
        await expect(commentRepository.getCommentsByThreadId('thread-123')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
        await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
        await expect(commentRepository.deleteCommentById('comment-123')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
        await expect(commentRepository.verifyAvailabilityComment('comment-123')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });
});