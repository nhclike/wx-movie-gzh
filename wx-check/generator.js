//迭代器对象
var gen=function *(n) {
  for (var i=0;i<3;i++){
      n++;
      yield n;
  }
};

var genObj=gen(2);
console.log(genObj.next());
console.log(genObj.next());
console.log(genObj.next());
console.log(genObj.next());
//打印结果
/*
{ value: 3, done: false }
{ value: 4, done: false }
{ value: 5, done: false }
{ value: undefined, done: true }*/
