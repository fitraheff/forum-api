class NewComments {
    constructor(payload) {
        this._verifyPayload(payload);

        this.content = payload.content;
        this.threadId = payload.threadId;
        this.owner = payload.owner;
    }

    _verifyPayload({ content, threadId, owner }) {
        if (!content || !threadId || !owner) {
            throw new Error('NEW_COMMENTS.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof content !== 'string' || typeof threadId !== 'string' || typeof owner !== 'string') {
            throw new Error('NEW_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = NewComments;