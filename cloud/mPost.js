var Post = AV.Object.extend('Post')

    function findPost(queryFn){
        var q =new AV.Query(Post)
        queryFn.call(this,q)
        return q.find()
    }
   function findByAuthor(username){
       return findPost(function (q) {
           q.equalTo('author',username)
       })

   }
function findByUser(user){
    return findPost(function (q) {
        q.equalTo('user',user)
    })

}

exports.findByAuthor = findByAuthor
exports.findByUser = findByUser