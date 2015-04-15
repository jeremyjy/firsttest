var Post = AV.Object.extend('Post')

    function findPosts(queryFn){
        var q =new AV.Query(Post)
        queryFn.call(this,q)
        return q.find()
    }
    function findPost(queryFn){
         var q =new AV.Query(Post)
         queryFn.call(this,q)
         return q.first()
    }

   function findByAuthor(username){
       return findPosts(function (q) {
           q.equalTo('author',username)
       })

   }
function findNewest(num){
    return findPosts(function (q) {
        q.limit(num)
        q.descending('createdAt')
    })
}
function findByUser(user){
        return findPosts(function (q) {
            q.equalTo('user',user)
        })

}
function findById(postId){
    return findPost(function (q) {
        q.equalTo('objectId',postId)
    })

}
exports.findByAuthor = findByAuthor
exports.findByUser = findByUser
exports.findById = findById
exports.findNewest=findNewest