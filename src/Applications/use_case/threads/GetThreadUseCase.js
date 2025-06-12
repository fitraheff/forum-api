class GetThreadUseCase {
    constructor({ threadRepository, commentRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
    }

    async execute({ threadId }) {
        // Verifikasi keberadaan thread
        await this._threadRepository.verifyThreadExists(threadId);

        // Ambil detail thread
        const thread = await this._threadRepository.getThreadById(threadId);

        // Ambil komentar untuk thread
        let comments = await this._commentRepository.getCommentsByThreadId(threadId);

        // Proses komentar untuk soft delete
        comments = this._checkIsDeletedComments(comments);

        // Urutkan komentar berdasarkan tanggal secara ascending
        comments.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Format tanggal ke ISO penuh
        const formatDate = (date) => new Date(date).toISOString();

        // Bentuk respons sesuai spesifikasi
        return {
            thread: {
                id: thread.id,
                title: thread.title,
                body: thread.body,
                date: formatDate(thread.date),
                username: thread.username,
                comments: comments.map(comment => ({
                    id: comment.id,
                    username: comment.username,
                    date: formatDate(comment.date),
                    content: comment.content,
                })),
            },
        }
    }

    _checkIsDeletedComments(comments) {
        return comments.map(comment => {
            const newComment = { ...comment };
            newComment.content = newComment.is_delete ? '**komentar telah dihapus**' : newComment.content;
            delete newComment.is_delete;
            return newComment;
        });
    }
}

module.exports = GetThreadUseCase;