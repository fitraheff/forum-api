const DetailThread = require('../DetailThread');

describe('DetailThread entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            id: 'thread-123',
            title: 'Thread Title',
            body: 'Thread Body',
            // date: '2023-10-01T00:00:00.000Z',
            username: 'user123',
            comments: [],
        };

        // Action and Assert
        expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 123,
            title: 'Thread Title',
            body: 'Thread Body',
            date: '2023-10-01T00:00:00.000Z',
            username: 'user123',
            comments: [],
        };

        // Action and Assert
        expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create detailThread object correctly', () => {
        // Arrange
        const payload = {
            id: 'thread-123',
            title: 'Thread Title',
            body: 'Thread Body',
            date: '2023-10-01T00:00:00.000Z',
            username: 'user123',
            comments: [],
        };

        // Action
        const detailThread = new DetailThread(payload);

        // Assert
        expect(detailThread.id).toEqual(payload.id);
        expect(detailThread.title).toEqual(payload.title);
        expect(detailThread.body).toEqual(payload.body);
        expect(detailThread.date).toEqual(payload.date);
        expect(detailThread.username).toEqual(payload.username);
        expect(detailThread.comments).toEqual(payload.comments);
    });
});