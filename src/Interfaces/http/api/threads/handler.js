const AddThreadUseCase = require('../../../../Applications/use_case/threads/AddThreadUseCase');
const GetThreadUseCase = require('../../../../Applications/use_case/threads/GetThreadUseCase');

class ThreadsHandler {
    constructor(container) {
        this._container = container;

        this.postThreadHandler = this.postThreadHandler.bind(this);
        this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
    }

    async postThreadHandler(request, h) {

        const { id: userId } = request.auth.credentials;
        const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
        const addedThread = await addThreadUseCase.execute({
            ...request.payload,
            owner: userId,
        });

        const response = h.response({
            status: 'success',
            data: {
                addedThread: {
                    id: addedThread.id,
                    title: addedThread.title,
                    owner: addedThread.owner,
                },
            },
        });
        response.code(201);
        return response;

    }

    async getThreadByIdHandler(request, h) {

        const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);
        const result = await getThreadUseCase.execute({ threadId: request.params.threadId });
        return h.response({
            status: 'success',
            data: result,
        }).code(200);
    }
}

module.exports = ThreadsHandler;