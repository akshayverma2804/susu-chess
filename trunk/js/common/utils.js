define(function(require, exports, module)
{
    module.exports.times = function (num, callback)
    {
        for (var i = 0; i < num; i++)
            callback();
    };

    module.exports.bind = function(body, context)
    {
        return body.bind(context);
    };
});