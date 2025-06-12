const NewComments = require('../../../../Domains/comments/entities/NewComments');
const AddedComment = require('../../../../Domains/comments/entities/AddedComments');
const AddCommentsUseCase = require('../AddCommentsUseCase');
const CommentsRepository = require('../../../../Domains/comments/CommentsRepository');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');

describe('AddCommentsUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'This is a comment',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockAddedComment = {
      id: 'comment-123',
      content: useCasePayload.content,
      threadId: useCasePayload.threadId,
      owner: useCasePayload.owner,
    };

    // Mocking
    const mockCommentsRepository = new CommentsRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentsRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    // Create use case instance
    const addCommentsUseCase = new AddCommentsUseCase({
      commentRepository: mockCommentsRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentsUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      threadId: useCasePayload.threadId,
      owner: useCasePayload.owner,
    }));
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentsRepository.addComment).toBeCalledWith(new NewComments(useCasePayload));
  });
});