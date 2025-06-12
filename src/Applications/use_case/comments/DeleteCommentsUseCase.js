class DeleteCommentsUseCase {
    constructor({ commentRepository, threadRepository }) {
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute({ commentId, threadId, owner }) {
        // Verify if the thread exists
        await this._threadRepository.verifyThreadExists(threadId);

        // Verify if the comment belongs to the owner
        await this._commentRepository.verifyCommentOwner(commentId, owner);

        // Verify if the comment is available
        await this._commentRepository.verifyAvailabilityComment(commentId);

        // Delete the comment
        await this._commentRepository.deleteCommentById(commentId);
    }
}

module.exports = DeleteCommentsUseCase;