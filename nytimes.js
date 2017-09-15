window.nytg || (window.nytg = {});
var USE_CANVAS = !0;
if ("trydom" == window.location.hash || "#trydom" == window.location.hash) USE_CANVAS = !1;
nytg.Chart = function() {
    function P(a) { o.fillStyle = a.color;
        o.beginPath();
        o.arc(a.x, a.y, a.r, 0, 2 * Math.PI);
        o.closePath();
        o.fill();
        a.selected && o.stroke() }
    var m = jQuery,
        x = m.browser.msie && 9 > parseInt(m.browser.version, 10),
        g = nytg.ipoData;
    if (x) m("#nytg-wrapper").hide(), m("#nytg-ie8-wrapper").show();
    else {
        _.forEach(g, function(a) { var b = ("" + a.fulldate).substr(0, 4),
                c = ("" + a.fulldate).substr(4, 2),
                d = ("" + a.fulldate).substr(6, 2);
            a.date = new Date(b, c, d);
            a.threeYear = a.rMVMP * (a.BHRET3 / 100 + 1);
            a.NAME = a.NAME.toUpperCase() });
        for (var B =
                new Date(1975, 1, 0), J = d3.max(g, function(a) { return a.date }), r = d3.max(g, function(a) { return a.rMVOP }), Q = d3.time.scale().domain([B, J]).range([0, 825]), t = d3.scale.linear().domain([0, 5E3]).range([480, 0]), C = d3.scale.log().domain([20, 8E5]).range([480, 0]), D = d3.scale.pow().exponent(0.5).clamp(!0).domain([0, r]).range([0, 80]), E = d3.scale.linear().domain([B, J]).rangeRound(["rgba(255,0,0,0.4)", "rgba(0,66,118,0.4)"]), K = [
                    [255, 0, 0],
                    [0, 66, 118]
                ], E = function(a, b) {
                    for (var c = (a - B) / (J - B), d = [], e = 0; 3 > e; e++) d.push(Math.round(K[0][e] +
                        c * (K[1][e] - K[0][e])));
                    d.push(b || 0.7);
                    return "rgba(" + d.join(",") + ")"
                }, p = USE_CANVAS ? 0 : "px", h = function(a) { a = D(a); return isNaN(a) || null === a ? 0 + p : Math.ceil(a) + p }, q = function(a, b) { return isNaN(a[b]) ? 0 + p : Math.round(Q(a.date) - D(a[b]) / 2) + p }, y = function(a, b) { var c = t(a[b]) - D(a[b]) / 2; return isNaN(c) ? 0 + p : Math.round(c) + p }, F = function(a, b) { var c = a[b]; return null === c || isNaN(c) ? 0 + p : Math.round(C(a[b]) - D(a[b]) / 2) + p }, r = 0, U = g.length; r < U; r++) {
            var i = g[r];
            i.r = h(i.rMVOP) / 2;
            i.x = q(i, "rMVOP") + i.r;
            i.y = y(i, "rMVOP") + i.r;
            i.a = 0.7;
            i.color =
                E(i.date)
        }
        if (!x) var u = d3.select("#nytg-canvas").append("div").attr("class", "nytg-stage").style("width", "950px").style("height", "500px").style("left", "75px").style("top", "0px"),
            V = u.append("div").attr("class", "nytg-circleContainer").style("width", "875px").style("height", "480px"),
            L = d3.select("#nytg-canvas").append("svg").attr("width", 950).attr("height", 500).style("position", "absolute").append("g").attr("transform", "translate(75,0)");
        if (USE_CANVAS) {
            var R = 875,
                M = 480;
            m("#nytg-canvas").append('<canvas width="' +
                R + '" height="' + M + '" style="margin-left: 75px;"></canvas>');
            var v = m("#nytg-canvas canvas")[0];
            window.CanvasSwf && CanvasSwf.initElement(v);
            var o = v.getContext("2d");
            o.lineWidth = 2
        }
        if (!x) { var j = d3.svg.axis().scale(t).tickFormat(function(a) { return a / 1E3 }).tickSize(15).orient("left");
            L.append("g").attr("class", "y axis").call(j);
            r = d3.svg.axis().scale(Q).tickFormat(function(a) { return (new Date(a)).getFullYear() }).orient("bottom");
            L.append("g").attr("class", "x axis").attr("transform", "translate(0, 480)").call(r) }
        if (USE_CANVAS) {
            var z =
                m(v).offset(),
                k = -1,
                w = !1;
            m(window).mousemove(function(a) { var b = a.pageX - z.left,
                    c = a.pageY - z.top,
                    d = 0,
                    e = -1; if (c <= M && 0 < c)
                    for (var h = 0, f = g.length; h < f; h++) { var l, i = g[h];
                        l = b - i.x; var n = c - i.y;
                        l = Math.sqrt(l * l + n * n);
                        n = i = i.r;
                        3 > n && (n = 3); var j = 0;
                        l < n ? (n += 1 * l, j = 1E3 - n) : l < i + 10 && (j = 10 + i - l);
                        l = j;
                        l > d && (d = l, e = h) }
                if (!w && k != e || w && -1 < e) - 1 < k && delete g[k].selected, -1 < e ? (g[e].selected = !0, S(g[e])) : w || s.hide(), k = e, w = !1, G();
                w || s.css({ top: a.pageY - N - 18, left: a.pageX - 0.5 * O }) });
            m(window).mouseenter(function() { s.hide() });
            nytg.selectBubbleById =
                function(a) { if (a != k) {-1 < k && (console.log("clearSelectedBubble()"), console.log(g[k]), delete g[k].selected, k = -1);
                        k = a;
                        a = g[k];
                        a.selected = !0;
                        G(); var b = a.x + z.left,
                            c = a.y + z.top;
                        S(a);
                        s.css({ top: c - N - 18, left: b - 0.5 * O });
                        w = !0 } };
            var s = $jq("<div>").addClass("nytg-popup").hide().appendTo("body"),
                O = 0,
                N = 0,
                S = function(a) { z = m(v).offset();
                    s.html(W(a)).show();
                    N = s.outerHeight();
                    O = s.outerWidth() },
                T = d3.format("+,.0f"),
                X = d3.format(",.0f"),
                Y = d3.format(",.1f"),
                W = function(a) {
                    var b = a.rMVOP,
                        c = a.BHRET3,
                        d = 100 * (a.rMVMP / b - 1),
                        e = a.fulldate,
                        g = 20080101 > e ? "Three years<br>later" : "Return<br>to date",
                        f = " million";
                    1E3 < b && (f = " billion", b /= 1E3);
                    var b = "$" + (10 > b ? Y(b) : X(b)),
                        d = T(d) + "%",
                        c = T(c) + "%",
                        e = ("" + e).substr(0, 4),
                        h = a.NAME,
                        a = "facebook" == h.toLowerCase(),
                        e = "<div class='nytg-popup-label'>" + e + "</div>" + ("<div class='nytg-popup-title'>" + h + "</div>");
                    return e = a ? e + "<div class='nytg-popup-line'><span class='nytg-popup-label'>Value at I.P.O.</span><br/><span class='nytg-popup-value'>$104 billion</span></div>" : e + ("<div class='nytg-popup-line'><span class='nytg-popup-label'>Value at I.P.O.</span><span class='nytg-popup-value'>" +
                        b + f + "</span></div>") + "<table>" + ("<tr><td class='row1'>" + d + "</td><td class='row1 col2'>" + c + "</td></tr>") + ("<tr><td class='row2'>First day<br>change</td><td class='row2 col2'>" + g + "</td></tr></table>")
                };
            _.forEach(nytg.ipoLabels, function(a) { var b = { width: a.width + "px", left: a.xpos + "px", top: a.ypos + "px" },
                    b = $jq("<div>").addClass("nytg-ipo-label").css(b).html(a.sentence).hide().appendTo("#nytg-canvas");
                a.element = b[0] });
            var Z = function(a) { _.forEach(nytg.ipoLabels, function(b) { a == b.step && $jq(b.element).fadeIn(200) }) },
                $ = function() { _.forEach(nytg.ipoLabels, function(a) { $jq(a.element).fadeOut(200) }) }
        }
        var H = function(a, b, c, d) { a /= d / 2; if (1 > a) return c / 2 * a * a * a + b;
                a -= 2; return c / 2 * (a * a * a + 2) + b },
            G = function() { o.clearRect(0, 0, R, M); for (var a = null, b = 0, c = g.length; b < c; b++) { var d = g[b];
                    d.selected ? a = d : P(d) } a && P(a) },
            I = null,
            A = function(a, b) {
                I && cancelAnimationFrame(I);
                for (var c = b ? F : y, d = g[g.length - 1], e = 0, i = g.length; e < i; e++) {
                    var f = g[e];
                    f.startR = f.r;
                    f.startX = f.x;
                    f.startY = f.y;
                    f.deltaR = h(f[a]) / 2 - f.r;
                    f.deltaX = q(f, a) + (f.r + f.deltaR) - f.x;
                    f.deltaY =
                        c(f, a) + (f.r + f.deltaR) - f.y;
                    f == d && (f.startA = f.a, f.deltaA = 0.7 - f.a)
                }
                var j = Date.now(),
                    k = function() { for (var a = Math.min(Date.now() - j, 3E3), e = 0, c = g.length; e < c; e++) { var b = g[e];
                            b.r = H(a, b.startR, b.deltaR, 3E3);
                            b.x = H(a, b.startX, b.deltaX, 3E3);
                            b.y = H(a, b.startY, b.deltaY, 3E3);
                            b == d && (b.a = H(a, b.startA, b.deltaA, 3E3), b.color = E(b.date, b.a)) } G();
                        3E3 > a && (I = requestAnimationFrame(k, v)) };
                I = requestAnimationFrame(k, v)
            };
        USE_CANVAS ? G() : V.selectAll(".company").data(g).enter().append("div").attr("class", "company").style("background",
            function(a) { return E(a.date) }).style("left", function(a) { return q(a, "rMVOP") }).style("top", function(a) { return y(a, "rMVOP") }).style("width", function(a) { return h(a.rMVOP) }).style("height", function(a) { return h(a.rMVOP) });
        return {
            d: g,
            set: function(a) {
                var b = L.transition().duration(3E3).each("end", function() { Z(a) });
                $();
                if ("preFacebook" === a) {
                    var c = "rMVOP";
                    x || (j.scale(t).tickValues([0, 5E3, 1E4, 15E3, 2E4, 25E3]), t.domain([0, 34E3]), b.select(".y.axis").call(j));
                    if (USE_CANVAS) A(c);
                    else {
                        var d = u.transition().duration(2E3);
                        d.selectAll(".company").style("left", function(a) { return q(a, c) }).style("top", function(a) { return y(a, c) }).style("width", function(a) { return h(a[c]) }).style("height", function(a) { return h(a[c]) })
                    }
                } else "facebook" === a ? (c = "rMVOP", x || (j.scale(t).tickValues([2E4, 4E4, 6E4, 8E4, 1E5]), t.domain([0, 127E3]), b.select(".y.axis").call(j)), USE_CANVAS) ? A(c) : (d = u.transition().duration(2E3), d.selectAll(".company").style("left", function(a) { return q(a, c) }).style("top", function(a) { return y(a, c) }).style("width", function(a) { return h(a[c]) }).style("height",
                    function(a) { return h(a[c]) })) : "log" === a ? (c = "rMVOP", j.scale(C).tickValues([100, 1E3, 1E4, 1E5]), USE_CANVAS ? A(c, !0) : (d = u.transition().duration(2E3), d.selectAll(".company").style("left", function(a) { return q(a, c) }).style("top", function(a) { return F(a, c) }).style("width", function(a) { return h(a[c]) }).style("height", function(a) { return h(a[c]) })), b.select(".y.axis").call(j)) : "pop" === a ? (c = "rMVMP", j.scale(C).tickValues([10, 100, 1E3, 1E4, 1E5]), USE_CANVAS ? A(c, !0) : (d = u.transition().duration(2E3), d.selectAll(".company").style("left",
                    function(a) { return q(a, c) }).style("top", function(a) { return F(a, c) }).style("width", function(a) { return h(a[c]) }).style("height", function(a) { return h(a[c]) })), b.select(".y.axis").call(j)) : "threeYear" === a && (c = "threeYear", j.scale(C).tickValues([10, 100, 1E3, 1E4, 1E5]), USE_CANVAS ? A(c, !0) : (d = u.transition().duration(2E3), d.selectAll(".company").style("left", function(a) { return q(a, c) }).style("top", function(a) { return F(a, c) }).style("width", function(a) { return h(a[c]) }).style("height", function(a) { return h(a[c]) })),
                    b.select(".y.axis").call(j))
            }
        }
    }
};