const NewComments = require('../NewComments');

describe('NewComments entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            content: 'This is a comment',
        };

        // Action & Assert
        expect(() => new NewComments(payload)).toThrowError('NEW_COMMENTS.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            content: 123,
            threadId: 'thread-123',
            owner: 'user-123',
        };

        // Action & Assert
        expect(() => new NewComments(payload)).toThrowError('NEW_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create NewComments entities correctly', () => {
        // Arrange
        const payload = {
            content: 'This is a comment',
            threadId: 'thread-123',
            owner: 'user-123',
        };

        // Action
        const newComment = new NewComments(payload);

        // Assert
        expect(newComment.content).toEqual(payload.content);
        expect(newComment.threadId).toEqual(payload.threadId);
        expect(newComment.owner).toEqual(payload.owner);
    });
});