/**
 * Created by Administrator on 2015/4/7.
 */
var Comment = AV.Object.extend('Comment')

function findComments(queryFn){
    var q =new AV.Query(Comment)
    queryFn.call(this,q)
    return q.find()
}

function findByPost(post){
    return findComments(function (q) {
        q.equalTo('post',post)
    })

}

exports.findByPost = findByPost