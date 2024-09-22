export function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function get_random_color() {
    var h = randInt(1, 360);
    var s = randInt(0, 100);
    var l = randInt(0, 100);
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}
