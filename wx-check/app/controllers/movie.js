const { readFile, writeFile } = require('fs');
const { resolve } = require('path');
const api = require('../api');

const mongoose = require('mongoose');
const Movie = mongoose.model('Movie');
const Category = mongoose.model('Category');
const Comment = mongoose.model('Comment');

const _ = require('lodash');
const util = require('util');
const readFileAsync = util.promisify(readFile);  //让一个遵循异常优先的回调风格的函数， 即 (err, value) => ... 回调函数是最后一个参数, 返回一个返回值是一个 promise 版本的函数。
const writeFileAsync = util.promisify(writeFile);
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

//电影的详情页
exports.detail = async (ctx, next) => {
    const _id = ctx.params._id;
    const movie =await Movie.findOne({
        _id: _id
    });

    await Movie.update({ _id }, { $inc: { pv: 1 } });

    const comments = await Comment.find({
        movie: _id
    })
        .populate('from', '_id nickname')
        .populate('replies.from replies.to', '_id nickname');
    console.log("评论对象");
    console.log(comments);

    await ctx.render('pages/detail', {
        title: '电影详情页面',
        movie,
        comments
    })
};

//保存文件
exports.savePoster = async (ctx, next) => {
    const posterData = ctx.request.body.files.uploadPoster;
    const filePath = posterData.path;
    const fileName = posterData.name;

    if (fileName) {
        const data = await readFileAsync(filePath); //读取上传的文件
        const timestamp = Date.now();
        const type = posterData.type.split('/')[1];
        const poster = timestamp + '.' + type;  //保存文件的文件名
        const newPath = resolve(__dirname, '../../../', 'public/upload/' + poster); //文件保存的路径

        await writeFileAsync(newPath, data);  //将文件写入到新的路径

        ctx.poster = poster
    }

    await next()
};

// 2. 电影的创建持久化
exports.new = async (ctx, next) => {
    let movieData = ctx.request.body.fields;
    let movie;
    console.log("电影录入后台接收到的数据");
    console.log(movieData);

    //如果接收到的数据有_id，尝试根据_id查找数据库中对应的电影数据
    if (movieData._id) {
        movie = await Movie.findOne({
            _id: movieData._id
        });
    }

    //如果有上传的文件就用上传的文件做封面
    if (ctx.poster) {
        movieData.poster = ctx.poster
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
    }).populate('category', 'name');  //关联查询出分类的名字
    console.log(movies);

    await ctx.render('pages/movie_list', {
        title: '分类的列表页面',
        movies
    })
};

// 删除电影数据
exports.del = async (ctx, next) => {
    const id = ctx.query.id;
    //找到分类里的这个电影
    const cat = await Category.findOne({
        movies: {
            $in: [id]
        }
    });

    //删除电影的同时，将此电影所属分类中的电影的电影id也删除，这样下回通过分类查询该电影时也被删除掉了
    if (cat && cat.movies.length) {
        const index = cat.movies.indexOf(id);
        cat.movies.splice(index, 1);
        await cat.save()
    }

    //电影文档中删除此条数据
    try {
        await Movie.remove({ _id: id });
        ctx.body = { success: true }
    } catch (err) {
        ctx.body = { success: false }
    }
};

// 电影搜索功能
exports.search=async (ctx,next)=>{
    const {cat,q,p}=ctx.query;  //p为必传，cat和q二选一
    const page = parseInt(p, 10) || 0;
    const count = 2;
    const index = page * count;

    if (cat){ //进入分类的页面
        const categories = await api.movie.searchByCategroy(cat);
        const category = categories[0];
        let movies = category.movies || [];
        let results = movies.slice(index, index + count);
        await ctx.render('pages/results', {
            title: '分类搜索结果页面',
            keyword: category.name,
            currentPage: (page + 1),
            query: 'cat=' + cat, //分类+分页
            totalPage: Math.ceil(movies.length / count),
            movies: results
        });
    }else { //全局按照关键词搜索
        let movies = await api.movie.searchByKeyword(q);
        let results = movies.slice(index, index + count);
        await ctx.render('pages/results', {
            title: '关键词搜索结果页面',
            keyword: q,
            currentPage: (page + 1),
            query: 'q=' + q, //模糊搜索+分页
            totalPage: Math.ceil(movies.length / count),
            movies: results
        })
    }
};