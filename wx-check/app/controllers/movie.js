
const mongoose = require('mongoose');
const Movie = mongoose.model('Movie');
const Category = mongoose.model('Category');
const _ = require('lodash');

// 0. 电影 Model 创建
// 1. 电影的录入页面
exports.show = async (ctx, next) => {
    const { _id } = ctx.params;
    let movie = {};

    //修改movie时传过来movie的id,则找到数据库对应的电影数据然后渲染上去
    if (_id) {
        movie = await Movie.findOne({
            _id: _id
        });
    }
    let categories =await Category.find({});
    await ctx.render('pages/movie_admin', {
        title: '后台分类录入页面',
        movie,
        categories
    })
};

// 2. 电影的创建持久化
exports.new = async (ctx, next) => {
    let movieData = ctx.request.body;
    let movie;
    console.log("电影录入后台接收到的数据");
    console.log(movieData);

    //如果接收到的数据有_id，尝试根据_id查找数据库中对应的电影数据
    if (movieData._id) {
        movie = await Movie.findOne({
            _id: movieData._id
        });
    }
    //将电影分类和电影信息建立关联关系
    const categoryId = movieData.categoryId;
    const categoryName = movieData.categoryName;
    let category;

    //如果从电影信息提交的表单中拿到分类id就尝试拿到分类对象
    if (categoryId) {
        category = await await Category.findOne({
            _id: categoryId
        })
    } else if (categoryName) {  //否则新增一个分类
        category = new Category({ name: categoryName });

        await category.save()
    }


    //如果此电影数据已经存在 （分类挂载到电影上）
    if (movie) {
        //更新movie的数据
        movie = _.extend(movie, movieData);
        //设置电影的分类
        movie.category=category._id ;
    } else {
        //新创建一条电影数据
        delete movieData._id;
        //设置电影的分类
        movieData.category = category._id;
        movie = new Movie(movieData)
    }

    //此时不论是新增的还是之前的就有的，与此电影相关的一定有个分类
    category = await Category.findOne({
        _id: category._id
    });

    //将此电影的_id塞入到分类的movies中，将分类数据更新(电影挂载到分类上)
    if (category) {
        category.movies = category.movies || [];
        category.movies.push(movie._id);

        await category.save()
    }

    await movie.save();

    ctx.redirect('/admin/movie/list')
};

// 3. 电影的后台列表
exports.list = async (ctx, next) => {
    //获取所有电影数据
    const movies = await Movie.find({
    });

    await ctx.render('pages/movie_list', {
        title: '分类的列表页面',
        movies
    })
};

// 删除电影数据
exports.del = async (ctx, next) => {
    const id = ctx.query.id
    const cat = await Category.findOne({
        movies: {
            $in: [id]
        }
    })

    if (cat && cat.movies.length) {
        const index = cat.movies.indexOf(id)
        cat.movies.splice(index, 1)
        await cat.save()
    }

    try {
        await Movie.remove({ _id: id })
        ctx.body = { success: true }
    } catch (err) {
        ctx.body = { success: false }
    }
}