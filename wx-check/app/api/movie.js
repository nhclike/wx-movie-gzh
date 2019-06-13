
const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const Movie = mongoose.model('Movie');
const Config=require("./../../config/config");
const rp = require('request-promise');//发出请求并且验证api的有效性
const _ = require('lodash');

//根据豆瓣详情结果扩展电影数据并且给电影添加分类
const updateMovies = async (movie) => {
    const options = {
        uri: `${Config.doubanUrl}/v2/movie/subject/${movie.doubanId}`,
        json: true
    };

    const data = await rp(options);
    console.log("api.movie.updateMovies中根据豆瓣id拿到的电影详情数据");
    console.log(data);

    _.extend(movie, {
        country: data.countries[0],
        language: data.languages[0],
        summary: data.summary
    });

    console.log("api.movie.updateMovies中更新后的电影数据");
    console.log(movie);

    //拿到豆瓣中查出来的此电影的分类
    const genres = movie.genres;

    if (genres && genres.length>0) {
        await Promise.all(genres.forEach(async genre => {
            //先查询此分类是否已经在数据库中存在
            let cat = await Category.findOne({
                name: genre
            });
            //如果原本就有此分类，将电影id到此分类中就好
            if (cat) {
                cat.movies.push(movie._id);

                await cat.save();
                //如果没有此分类就要先增加分类
            } else {
                cat = new Category({
                    name: genre,
                    movies: [movie._id]
                });

                cat = await cat.save();
                movie.category = cat._id;
                await movie.save()
            }

        }))
    } else {
        movie.save()
    }
};
//根据用户输入进行豆瓣查询
exports.searchByDouban = async (q) => {
    //搜索结构挂了只能搜最近将上映的电影
    // const options = {
    //     uri: `${Config.doubanUrl}/v2/movie/search?q=${encodeURIComponent(q)}`,
    //     json: true
    // };
    const options = {
        uri: `${Config.doubanUrl}/v2/movie/coming_soon`,
        json: true
    };
    const data = await rp(options);
    let subjects = [];
    let movies = [];
    //获取豆瓣查询结果
    if (data && data.subjects) {
        subjects = data.subjects
    }

    if (subjects.length) {
        //将豆瓣查询结果格式化存入数据库
        await Promise.all(subjects.map(async item => {
            //根据豆瓣id在数据库中查询
            let movie = await Movie.findOne({
                doubanId: item.id
            });
            //如果豆瓣查询结果中的电影在数据库中已经存在，只需要将数据塞入返回给前台的数据中
            if (movie) {
                movies.push(movie)
            } else {
                //否则将豆瓣结果存入数据库，并且返回前台
                const directors = item.directors || [];
                const director = directors[0] || {};

                movie = new Movie({
                    title: item.title,
                    director: directors[0].name,
                    doubanId: item.id,
                    year: item.year,
                    genres: item.genres || [],
                    poster: item.images.large
                });

                movie = await movie.save();

                movies.push(movie)
            }
        }));

        movies.forEach(movie => {
            updateMovies(movie)
        })
    }

    return movies
};

//公众号中搜索热门电影
exports.findHotMovies = async (hot, count) => {
    const data = await Movie.find({}).sort({
        pv: hot
    }).limit(count);

    return data
};

//公众号中根据分类查找电影
exports.findMoviesByCat = async (cat) => {
    const data = await Category.findOne({
        name: cat
    }).populate({
            path: 'movies',
            select: '_id title poster summary'
    });

    return data
};

//网页中根据分类搜索电影
exports.searchByCategroy = async (catId) => {
    const data = await Category.find({
        _id: catId
    }).populate({
        path: 'movies',
        select: '_id title poster',
        options: { limit: 8 }
    });

    return data
};

//网页中根据关键字模糊搜索电影
exports.searchByKeyword = async (q) => {
    const data = await Movie.find({
        title: new RegExp(q + '.*', 'i')
    });

    return data;
};
