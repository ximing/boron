module.exports.wait = function (timer=3000) {
    // body...
    return new Promise((res)=>{
        setTimeout(()=>{
            res(0)
        },timer);
    })
}