var User = AV.Object.extend('_User')

    function findUsers(queryFn){
        var q =new AV.Query(User)
        queryFn.call(this,q)
        return q.find()
    }

function findSomeOne(num){
    return findUsers(function (q) {
        q.limit(num)
        q.ascending('createdAt')
    })
}
exports.findSomeOne = findSomeOne
