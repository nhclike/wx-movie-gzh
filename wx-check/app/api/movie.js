
const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const Movie = mongoose.model('Movie');

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
