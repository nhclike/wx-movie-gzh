// 1. Schema Comment 设计
// 2. 实现 controller
// 3. 增加对应的路由
// 4. 增加评论的表单以及展现评论列表

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const CommentSchema = new Schema({
    movie: {               //评论的电影
        type: ObjectId,
        ref: 'Movie'
    },
    from: {
        type: ObjectId,    //评论人
        ref: 'User'
    },
    content: String,       //评论内容
    replies: [
        {
            from: {
                type: ObjectId,
                ref: 'User'
            },
            to: {
                type: ObjectId,
                ref: 'User'
            },
            content: String
        }
    ],
    meta: {
        createdAt: {
            type: Date,
            default: Date.now()
        },
        updatedAt: {
            type: Date,
            default: Date.now()
        }
    }
});

CommentSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createdAt = this.meta.updatedAt = Date.now()
    } else {
        this.meta.updatedAt = Date.now()
    }

    next()
});

const Comment = mongoose.model('Comment', CommentSchema);

