
const mongoose = require('mongoose')
const Category = mongoose.model('Category')
const Movie = mongoose.model('Movie')
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

exports.searchByKeyword = async (q) => {
    const data = await Movie.find({
        title: new RegExp(q + '.*', 'i')
    });

    return data;
};
