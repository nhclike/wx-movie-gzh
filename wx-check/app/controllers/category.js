const mongoose = require('mongoose');
const Category = mongoose.model('Category');

// 0. 电影分类 Model 创建
// 1. 电影分类的录入页面
exports.show = async (ctx, next) => {
    console.log("电影分类的录入页面ctx.params");
    console.log(ctx.params);
    //修改的时候会把分类id带过来
    const { _id } = ctx.params;
    let category = {};
    //修改时通过id找到对应的分类，将分类名渲染到录入分类的页面上去
    if (_id) {
        category = await Category.findOne({
            _id: _id
        })
    }

    await ctx.render('pages/category_admin', {
        title: '后台分类录入页面',
        category
    });
};

// 2. 电影分类的创建持久化
exports.new = async (ctx, next) => {
    const { name , _id} = ctx.request.body.category;
    console.log("后台分类表单提交数据");
    console.log(ctx.request.body.category);
    let category;

    //根据分类id找到数据库里是否已经存在此数据
    if (_id) {
        category = await Category.findOne({
            _id: _id
        })
    }
    //如果分类已经存在则更新，否则新建分类
    if (category) {
        category.name = name
    } else {
        category = new Category({ name })
    }

    //保存更新到数据库
    await category.save();

    ctx.redirect('/admin/category/list')
};

// 3. 电影分类的后台列表
exports.list = async (ctx, next) => {
    //从数据库中查找到所有的分类
    const categories = await Category.find({});

    await ctx.render('pages/category_list', {
        title: '分类的列表页面',
        categories
    })
};


exports.del = async (ctx, next) => {
    const id = ctx.query.id;

    try {
        await Category.remove({ _id: id });
        await Movie.remove({
            category: id
        });
        ctx.body = { success: true }
    } catch (err) {
        ctx.body = { success: false }
    }
};