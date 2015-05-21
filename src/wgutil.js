/**
 * Created by ukrispel on 21.05.2015.
 */
function removeArrObj(array, object) {
    var index = array.indexOf(object);
    if (index > -1) { array.splice(index, 1); }
}

module.exports =
{
    removeArrObj : removeArrObj
}