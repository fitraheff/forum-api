const AddCommentsUseCase = require('../../../../Applications/use_case/comments/AddCommentsUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/comments/DeleteCommentsUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {


    const { content } = request.payload;
    const { threadId } = request.params;
    const { id: owner } = request.auth.credentials;

    const addCommentsUseCase = this._container.getInstance(AddCommentsUseCase.name);
    const addedComment = await addCommentsUseCase.execute({ content, threadId, owner });

    const response = h.response({
      status: 'success',
      data: { addedComment },
    });
    response.code(201); // Perbaikan: Ubah dari 400 ke 201
    return response;

  }

  async deleteCommentHandler(request, h) {

    const { commentId, threadId } = request.params;
    const { id: owner } = request.auth.credentials;

    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    await deleteCommentUseCase.execute({ commentId, threadId, owner });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;

  }
}

module.exports = CommentsHandler;