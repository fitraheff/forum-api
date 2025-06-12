const AddedComment = require('../../../Domains/comments/entities/AddedComments');
const NewComments = require('../../../Domains/comments/entities/NewComments');

class AddCommentsUseCase {
    constructor({ commentRepository, threadRepository }) { // Ubah commentsRepository menjadi commentRepository
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload) {
        const newComments = new NewComments(useCasePayload);
        await this._threadRepository.verifyThreadExists(newComments.threadId);
        const addedComment = await this._commentRepository.addComment(newComments);
        return new AddedComment(addedComment);
    }
}

module.exports = AddCommentsUseCase;