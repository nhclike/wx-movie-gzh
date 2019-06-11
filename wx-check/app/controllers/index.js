const mongoose = require('mongoose');
const Category = mongoose.model('Category');
exports.homePage = async (ctx, next) => {
    const categories = await Category.find({}).populate({
        path: 'movies',
        select: '_id title poster',
        options: { limit: 8 }
    });  //关联查询出电影的海报的标题

    await ctx.render('pages/index', {
        title: '首页',
        categories
    })
}