/*

This is a trivial repro of optimized code getting garbage collected and
causing spurious recompilations. You should run this with --trace-opt and --trace-deopt

We have a temporary object representing each unit of work. It processes it
and we save the results. However at the end of the request, no longer have
any live references to a Processing object so all if its Maps/hidden classes
are up for GC and that also means we lose the optimized version of Processing.process.
*/
var Processing = /** @class */ (function () {
    function Processing(data) {
        this.data = data;
    }
    Processing.prototype.process = function () {
        return "".concat(this.data);
    };
    return Processing;
}());

// If you uncomment this line you'll see that the amount of opt/deopts
// goes down dramatically. What I'm trying to avoid with gc_keeps_optimized_code is having
// to make a bunch of this static const references to force a stong reference to maps
// which will keep the optimized code around
//const forceReference = new Processing(0);

function runJob() {
    var results = new Array();
    for (var i = 0; i < 1000; ++i) {
        var processor = new Processing(i);
        results.push(processor.process());
    }
    return results;
}
function main() {
    for (var j = 0; j < 1000; ++j) {
        runJob();
        global.gc();
    }
}
main();
