const AddThread = require('../../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
    it('should orchestrating the add thread action correctly', async () => {
        // Arrange
        const useCasePayload = {
            title: 'Thread Title',
            body: 'Thread Body',
            owner: 'user-123',
        };

        const mockAddedThread = new AddedThread({
            id: 'thread-123',
            title: useCasePayload.title,
            body: useCasePayload.body,
            date: new Date().toISOString(),
            owner: useCasePayload.owner,
        });

        // Mocking
        const mockThreadRepository = new ThreadRepository();

        mockThreadRepository.addThread = jest.fn()
            .mockImplementation(() => Promise.resolve(mockAddedThread));

        const addThreadUseCase = new AddThreadUseCase({
            threadRepository: mockThreadRepository,
        });

        // Action
        const addedThread = await addThreadUseCase.execute(useCasePayload);

        // Assert
        expect(addedThread).toStrictEqual(new AddedThread({
            id: 'thread-123',
            title: useCasePayload.title,
            body: useCasePayload.body,
            date: expect.any(String), // Menggunakan expect.any karena date bersifat dinamis
            owner: useCasePayload.owner,
        }));
        expect(mockThreadRepository.addThread).toBeCalledWith(new AddThread(useCasePayload));
    });
});