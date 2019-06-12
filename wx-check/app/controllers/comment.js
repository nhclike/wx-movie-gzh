const mongoose = require('mongoose');
const Comment = mongoose.model('Comment');

exports.save = async (ctx, next) => {
    const commentData = ctx.request.body.comment;

    if (commentData.cid) {  //有cid代表是对评论的回复
        //拿到要回复的那条评论对象
        let comment = await Comment.findOne({
            _id: commentData.cid
        });

        const reply = {
            from: commentData.from,
            to: commentData.tid,
            content: commentData.content
        };

        //给当前这个评论增加回复内容对象
        comment.replies.push(reply);

        await comment.save();

        ctx.body = { success: true }
    } else {  //对电影的直接评论
        let comment = new Comment({
            movie: commentData.movie,
            from: commentData.from,
            content: commentData.content
        });

        await comment.save();

        ctx.body = { success: true }
    }

};
