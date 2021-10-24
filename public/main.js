
function js_number() {
    const num81 = Math.random();
    console.log(num81);
    var useLv = 0;
    if (num81 < .8) {
        useLv = 1;
    } else {
        useLv = 100;
    }
    const g = document.getElementById('num54');
    g.setAttribute('value', useLv);
}
