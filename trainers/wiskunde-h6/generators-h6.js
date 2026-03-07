// generators-h6.js — Diagnostic-level question generators for Wiskunde H6 (§6.1–6.6)
// Each function returns {q, a, t, o, h, svg?} — no level parameter, always hardest difficulty.
// Helpers expected: rand(a,b), pick(arr)

// ========== SVG PARABOLA HELPER ==========
function svgParabola(cfg) {
  var a = cfg.a, c = cfg.c || 0;
  var xMin = cfg.xMin != null ? cfg.xMin : -6, xMax = cfg.xMax != null ? cfg.xMax : 6;
  var yMin = cfg.yMin != null ? cfg.yMin : -2, yMax = cfg.yMax != null ? cfg.yMax : 10;
  var highlights = cfg.highlights || [];
  var hLine = cfg.hLine || null;
  var vLines = cfg.vLines || [];
  var rect = cfg.rect || null;
  var label = cfg.label || null;
  var color = cfg.color || "#3498db";
  var W = 400, H = 300, pad = 30;
  var plotW = W - 2 * pad, plotH = H - 2 * pad;
  // Map data coords to SVG coords
  function sx(x) { return pad + (x - xMin) / (xMax - xMin) * plotW; }
  function sy(y) { return pad + (yMax - y) / (yMax - yMin) * plotH; }

  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;background:rgba(0,0,0,0.2);border-radius:8px">';

  // Grid lines
  var gridStep = 1;
  if (xMax - xMin > 20) gridStep = 5;
  else if (xMax - xMin > 10) gridStep = 2;
  for (var gx = Math.ceil(xMin / gridStep) * gridStep; gx <= xMax; gx += gridStep) {
    if (gx === 0) continue;
    svg += '<line x1="' + sx(gx) + '" y1="' + sy(yMax) + '" x2="' + sx(gx) + '" y2="' + sy(yMin) + '" stroke="#333" stroke-width="0.5"/>';
  }
  var gyStep = gridStep;
  if (yMax - yMin > 20) gyStep = 5;
  else if (yMax - yMin > 10) gyStep = 2;
  for (var gy = Math.ceil(yMin / gyStep) * gyStep; gy <= yMax; gy += gyStep) {
    if (gy === 0) continue;
    svg += '<line x1="' + sx(xMin) + '" y1="' + sy(gy) + '" x2="' + sx(xMax) + '" y2="' + sy(gy) + '" stroke="#333" stroke-width="0.5"/>';
  }

  // Axes
  if (yMin <= 0 && yMax >= 0) {
    svg += '<line x1="' + sx(xMin) + '" y1="' + sy(0) + '" x2="' + sx(xMax) + '" y2="' + sy(0) + '" stroke="#666" stroke-width="1.5"/>';
    svg += '<polygon points="' + sx(xMax) + ',' + sy(0) + ' ' + (sx(xMax) - 6) + ',' + (sy(0) - 3) + ' ' + (sx(xMax) - 6) + ',' + (sy(0) + 3) + '" fill="#666"/>';
  }
  if (xMin <= 0 && xMax >= 0) {
    svg += '<line x1="' + sx(0) + '" y1="' + sy(yMin) + '" x2="' + sx(0) + '" y2="' + sy(yMax) + '" stroke="#666" stroke-width="1.5"/>';
    svg += '<polygon points="' + sx(0) + ',' + sy(yMax) + ' ' + (sx(0) - 3) + ',' + (sy(yMax) + 6) + ' ' + (sx(0) + 3) + ',' + (sy(yMax) + 6) + '" fill="#666"/>';
  }

  // Axis labels
  for (var lx = Math.ceil(xMin / gridStep) * gridStep; lx <= xMax; lx += gridStep) {
    if (lx === 0) continue;
    if (yMin <= 0 && yMax >= 0) {
      svg += '<text x="' + sx(lx) + '" y="' + (sy(0) + 14) + '" fill="#888" font-size="10" text-anchor="middle">' + lx + '</text>';
    }
  }
  for (var ly = Math.ceil(yMin / gyStep) * gyStep; ly <= yMax; ly += gyStep) {
    if (ly === 0) continue;
    if (xMin <= 0 && xMax >= 0) {
      svg += '<text x="' + (sx(0) - 8) + '" y="' + (sy(ly) + 3) + '" fill="#888" font-size="10" text-anchor="end">' + ly + '</text>';
    }
  }

  // Parabola polyline
  var pts = [];
  var steps = 80;
  for (var i = 0; i <= steps; i++) {
    var px = xMin + (xMax - xMin) * i / steps;
    var py = a * px * px + c;
    if (py >= yMin - 1 && py <= yMax + 1) {
      pts.push(sx(px).toFixed(1) + ',' + sy(py).toFixed(1));
    }
  }
  if (pts.length > 1) {
    svg += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round"/>';
  }

  // Optional horizontal line
  if (hLine) {
    var hc = hLine.color || "#e67e22";
    svg += '<line x1="' + sx(xMin) + '" y1="' + sy(hLine.y) + '" x2="' + sx(xMax) + '" y2="' + sy(hLine.y) + '" stroke="' + hc + '" stroke-width="1.5" stroke-dasharray="6,3"/>';
    if (hLine.label) {
      svg += '<text x="' + (sx(xMax) - 4) + '" y="' + (sy(hLine.y) - 5) + '" fill="' + hc + '" font-size="11" text-anchor="end">' + hLine.label + '</text>';
    }
  }

  // Optional vertical lines
  for (var vi = 0; vi < vLines.length; vi++) {
    var vl = vLines[vi];
    var vc = vl.color || "#27ae60";
    svg += '<line x1="' + sx(vl.x) + '" y1="' + sy(vl.y1 || yMin) + '" x2="' + sx(vl.x) + '" y2="' + sy(vl.y2 || 0) + '" stroke="' + vc + '" stroke-width="1.5" stroke-dasharray="4,3"/>';
  }

  // Optional rectangle (for "past het erin?" questions)
  if (rect) {
    var rc = rect.color || "#e74c3c";
    var rx1 = sx(-rect.halfW), rx2 = sx(rect.halfW);
    var ry1 = sy(rect.h), ry2 = sy(0);
    svg += '<rect x="' + Math.min(rx1, rx2) + '" y="' + Math.min(ry1, ry2) + '" width="' + Math.abs(rx2 - rx1) + '" height="' + Math.abs(ry2 - ry1) + '" fill="' + rc + '" fill-opacity="0.15" stroke="' + rc + '" stroke-width="1.5" stroke-dasharray="4,3"/>';
  }

  // Highlight points
  for (var hi = 0; hi < highlights.length; hi++) {
    var hp = highlights[hi];
    var hpc = hp.color || "#e74c3c";
    svg += '<circle cx="' + sx(hp.x) + '" cy="' + sy(hp.y) + '" r="5" fill="' + hpc + '" stroke="#fff" stroke-width="1.5"/>';
    if (hp.label) {
      var anchor = hp.x >= 0 ? "start" : "end";
      var dx = hp.x >= 0 ? 8 : -8;
      svg += '<text x="' + (sx(hp.x) + dx) + '" y="' + (sy(hp.y) - 8) + '" fill="' + hpc + '" font-size="11" text-anchor="' + anchor + '">' + hp.label + '</text>';
    }
  }

  // Optional main label
  if (label) {
    svg += '<text x="' + (W / 2) + '" y="20" fill="#ccc" font-size="12" text-anchor="middle">' + label + '</text>';
  }

  svg += '</svg>';
  return svg;
}

function g61() {
  var t = rand(1, 10);

  // 1: Combined expression −a² + c·b²
  if (t === 1) {
    var a = pick([3, 4, 5, 6]), b = pick([2, 3, 4]), c = pick([2, 3, 4]);
    var r = -(a * a) + c * b * b;
    return {q: "Bereken: \u2212" + a + "\u00b2 + " + c + "\u00b7" + b + "\u00b2", a: r,
      h: "\u2212" + (a * a) + " + " + c + "\u00b7" + (b * b) + " = \u2212" + (a * a) + " + " + (c * b * b) + " = " + r};
  }

  // 2: a² − √b
  if (t === 2) {
    var a2 = pick([5, 6, 7, 8, 9]), sq = pick([4, 9, 16, 25, 36, 49]);
    var rt = Math.round(Math.sqrt(sq));
    return {q: "Bereken: " + a2 + "\u00b2 \u2212 \u221a" + sq, a: a2 * a2 - rt,
      h: a2 * a2 + " \u2212 " + rt + " = " + (a2 * a2 - rt)};
  }

  // 3: (−n)² vs −n² confusion
  if (t === 3) {
    var n = pick([3, 4, 5, 6, 7, 8]);
    var isParens = rand(0, 1);
    if (isParens) {
      return {q: "Bereken: (\u2212" + n + ")\u00b2", a: n * n,
        h: "(\u2212" + n + ")\u00b2 = " + n * n + "\nHaakjes: min \u00d7 min = plus!"};
    }
    return {q: "Bereken: \u2212" + n + "\u00b2", a: -(n * n),
      h: "\u2212" + n + "\u00b2 = \u2212" + (n * n) + "\nGeen haakjes: min gaat NIET mee!"};
  }

  // 4: Multi-step √(a² + b²) — Pythagoras-achtige berekening
  if (t === 4) {
    var pairs = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15]];
    var p = pick(pairs);
    return {q: "Bereken: \u221a(" + p[0] + "\u00b2 + " + p[1] + "\u00b2)", a: p[2],
      h: p[0] + "\u00b2 + " + p[1] + "\u00b2 = " + (p[0] * p[0]) + " + " + (p[1] * p[1]) + " = " + (p[0] * p[0] + p[1] * p[1]) + "\n\u221a" + (p[0] * p[0] + p[1] * p[1]) + " = " + p[2]};
  }

  // 5: Ordering/ranking expressions (multiple choice)
  if (t === 5) {
    var sets = [
      [{v: 9, s: "3\u00b2"}, {v: 8, s: "\u221a64"}, {v: 4, s: "(\u22122)\u00b2"}],
      [{v: 16, s: "4\u00b2"}, {v: 5, s: "\u221a25"}, {v: 25, s: "(\u22125)\u00b2"}],
      [{v: -9, s: "\u22123\u00b2"}, {v: 9, s: "(\u22123)\u00b2"}, {v: 3, s: "\u221a9"}],
      [{v: 7, s: "\u221a49"}, {v: 36, s: "6\u00b2"}, {v: -4, s: "\u22122\u00b2"}]
    ];
    var vals = pick(sets);
    var sorted = vals.slice().sort(function(a, b) { return a.v - b.v; });
    var correctOrder = sorted.map(function(v) { return v.s; }).join(", ");
    // Generate wrong orderings
    var wrongOrders = [];
    var reversed = vals.slice().sort(function(a, b) { return b.v - a.v; });
    wrongOrders.push(reversed.map(function(v) { return v.s; }).join(", "));
    var shuffled1 = [vals[1], vals[0], vals[2]];
    wrongOrders.push(shuffled1.map(function(v) { return v.s; }).join(", "));
    var shuffled2 = [vals[2], vals[1], vals[0]];
    wrongOrders.push(shuffled2.map(function(v) { return v.s; }).join(", "));
    // Remove duplicates of correct answer
    var opts = [correctOrder];
    for (var wi = 0; wi < wrongOrders.length; wi++) {
      if (wrongOrders[wi] !== correctOrder && opts.indexOf(wrongOrders[wi]) === -1) opts.push(wrongOrders[wi]);
    }
    while (opts.length < 4) opts.push(vals.map(function(v) { return v.s; }).join(", "));
    opts = opts.slice(0, 4).sort(function () { return Math.random() - 0.5; });
    return {q: "Rangschik van klein naar groot:\n" + vals.map(function(v) { return v.s; }).join(", "),
      a: correctOrder, t: "choice", o: opts,
      h: vals.map(function(v) { return v.s + " = " + v.v; }).join(", ")};
  }

  // 6: Application — oppervlakte vierkant
  if (t === 6) {
    var z = pick([5, 6, 7, 8, 9, 11, 12, 13]);
    return {q: "Een vierkant heeft zijde " + z + " cm.\nBereken de oppervlakte.", a: z * z,
      h: z + "\u00b2 = " + (z * z) + " cm\u00b2"};
  }

  // 7: Reverse — welke kwadraat geeft dit getal?
  if (t === 7) {
    var n7 = pick([144, 169, 196, 225, 256]);
    var r7 = Math.round(Math.sqrt(n7));
    return {q: "Welk getal geeft als kwadraat " + n7 + "?\n(Dus: ?\u00b2 = " + n7 + ")", a: r7,
      h: r7 + "\u00b2 = " + n7};
  }

  // 8: Mixed kwadraat + wortel + vermenigvuldiging
  if (t === 8) {
    var a8 = pick([2, 3, 4]), sq8 = pick([4, 9, 16, 25]);
    var rt8 = Math.round(Math.sqrt(sq8));
    var r8 = a8 * a8 + rt8;
    return {q: "Bereken: " + a8 + "\u00b2 + \u221a" + sq8, a: r8,
      h: (a8 * a8) + " + " + rt8 + " = " + r8};
  }

  // 9: (√n)² = n concept check
  if (t === 9) {
    var n9 = pick([36, 49, 64, 81, 100, 121, 144]);
    return {q: "Bereken: (\u221a" + n9 + ")\u00b2", a: n9,
      h: "(\u221a" + n9 + ")\u00b2 = " + n9 + "\nWortel en kwadraat heffen elkaar op!"};
  }

  // 10: Complex combo: c·a² − d·√e
  var a10 = pick([2, 3]), b10 = pick([3, 4, 5]), sq10 = pick([4, 9, 16, 25]);
  var rt10 = Math.round(Math.sqrt(sq10)), d10 = pick([2, 3]);
  var r10 = a10 * b10 * b10 - d10 * rt10;
  return {q: "Bereken: " + a10 + "\u00b7" + b10 + "\u00b2 \u2212 " + d10 + "\u00b7\u221a" + sq10, a: r10,
    h: a10 + "\u00b7" + (b10 * b10) + " \u2212 " + d10 + "\u00b7" + rt10 + " = " + (a10 * b10 * b10) + " \u2212 " + (d10 * rt10) + " = " + r10};
}

function g62() {
  var t = rand(1, 10);

  // 1: y = a(x−p)² + c with negative a and negative x
  if (t === 1) {
    var a = pick([-2, -3, -1]), p = pick([1, 2, 3]), c = pick([5, 7, 10, 12]);
    var x = pick([-2, -1, 4, 5]);
    var y = a * (x - p) * (x - p) + c;
    return {q: "y = " + a + "(x \u2212 " + p + ")\u00b2 + " + c + "\nBereken y voor x = " + x, a: y,
      h: a + "\u00b7(" + (x - p) + ")\u00b2 + " + c + " = " + a + "\u00b7" + ((x - p) * (x - p)) + " + " + c + " = " + (a * (x - p) * (x - p)) + " + " + c + " = " + y};
  }

  // 2: y = ax² + bx + c with substitution
  if (t === 2) {
    var a2 = pick([1, 2, -1, -2]), b2 = pick([2, 3, -2, -3]), c2 = pick([-1, 1, 4, -4]);
    var x2 = pick([2, 3, -1, -2]);
    var y2 = a2 * x2 * x2 + b2 * x2 + c2;
    var aStr = a2 === 1 ? "" : a2 === -1 ? "\u2212" : "" + a2;
    var bStr = b2 > 0 ? " + " + (b2 === 1 ? "" : b2) : " \u2212 " + (b2 === -1 ? "" : Math.abs(b2));
    var cStr = c2 > 0 ? " + " + c2 : " \u2212 " + Math.abs(c2);
    return {q: "y = " + aStr + "x\u00b2" + bStr + "x" + cStr + "\nBereken y voor x = " + x2, a: y2,
      h: "y = " + (a2 * x2 * x2) + " + " + (b2 * x2) + " + " + c2 + " = " + y2};
  }

  // 3: Finding x-as snijpunten (y=0)
  if (t === 3) {
    var c3 = pick([4, 9, 16, 25, 36]);
    var x3 = Math.round(Math.sqrt(c3));
    return {q: "y = x\u00b2 \u2212 " + c3 + "\nBereken de snijpunten met de x-as (y = 0).", a: "x = " + x3 + " en x = \u2212" + x3, t: "text",
      h: "x\u00b2 = " + c3 + " \u2192 x = \u00b1" + x3};
  }

  // 4: Finding the top of a parabola y = (x−p)² + c
  if (t === 4) {
    var p4 = pick([1, 2, 3, 4, -1, -2, -3]);
    var c4 = pick([-3, -1, 0, 2, 5]);
    return {q: "y = (x \u2212 " + p4 + ")\u00b2 + " + c4 + "\nWat is de top van deze parabool?",
      a: "(" + p4 + ", " + c4 + ")", t: "text",
      h: "Vorm y = (x\u2212p)\u00b2 + c \u2192 top = (p, c) = (" + p4 + ", " + c4 + ")"};
  }

  // 5: Multiple substitutions — compare y for two x values
  if (t === 5) {
    var a5 = pick([1, 2, -1, -2]), c5 = pick([0, 3, -2]);
    var x5a = pick([-3, -2]), x5b = pick([2, 3]);
    var y5a = a5 * x5a * x5a + c5, y5b = a5 * x5b * x5b + c5;
    var aStr5 = a5 === 1 ? "" : a5 === -1 ? "\u2212" : "" + a5;
    var cStr5 = c5 > 0 ? " + " + c5 : c5 < 0 ? " \u2212 " + Math.abs(c5) : "";
    return {q: "y = " + aStr5 + "x\u00b2" + cStr5 + "\nBereken y(" + x5a + ") \u2212 y(" + x5b + ")", a: y5a - y5b,
      h: "y(" + x5a + ") = " + y5a + ", y(" + x5b + ") = " + y5b + "\nVerschil = " + (y5a - y5b)};
  }

  // 6: y = a(x−p)² + c — bereken y voor x = p (always gives c)
  if (t === 6) {
    var a6 = pick([-3, -2, 2, 3, 4]), p6 = pick([1, 2, 3, 5]), c6 = pick([-4, -1, 3, 7]);
    return {q: "y = " + a6 + "(x \u2212 " + p6 + ")\u00b2 + " + c6 + "\nBereken y voor x = " + p6, a: c6,
      h: a6 + "\u00b7(0)\u00b2 + " + c6 + " = " + c6};
  }

  // 7: Negative x in y = ax²
  if (t === 7) {
    var a7 = pick([2, 3, 4, 5]), x7 = pick([-3, -4, -5]);
    var y7 = a7 * x7 * x7;
    return {q: "y = " + a7 + "x\u00b2\nBereken y voor x = " + x7, a: y7,
      h: a7 + " \u00b7 (" + x7 + ")\u00b2 = " + a7 + " \u00b7 " + (x7 * x7) + " = " + y7};
  }

  // 8: y = −x² + c, for which x is y = 0?
  if (t === 8) {
    var c8 = pick([1, 4, 9, 16, 25]);
    var x8 = Math.round(Math.sqrt(c8));
    return {q: "y = \u2212x\u00b2 + " + c8 + "\nVoor welke x is y = 0?", a: "x = " + x8 + " en x = \u2212" + x8, t: "text",
      h: "\u2212x\u00b2 + " + c8 + " = 0 \u2192 x\u00b2 = " + c8 + " \u2192 x = \u00b1" + x8};
  }

  // 9: Find the y-as snijpunt (x=0) for complex formula
  if (t === 9) {
    var a9 = pick([2, 3, -2, -3]), p9 = pick([1, 2, 3]), c9 = pick([1, 4, -2, 5]);
    var y9 = a9 * p9 * p9 + c9;
    return {q: "y = " + a9 + "(x \u2212 " + p9 + ")\u00b2 + " + c9 + "\nWaar snijdt de grafiek de y-as?", a: y9,
      h: "x = 0: y = " + a9 + "\u00b7(\u2212" + p9 + ")\u00b2 + " + c9 + " = " + a9 + "\u00b7" + (p9 * p9) + " + " + c9 + " = " + y9};
  }

  // 10: y = ax² + c — which gives bigger y: x=2 or x=−3?
  var a10 = pick([1, 2, -1, -2]), c10 = pick([0, 3, -5]);
  var y10a = a10 * 4 + c10, y10b = a10 * 9 + c10;
  var aS10 = a10 === 1 ? "" : a10 === -1 ? "\u2212" : "" + a10;
  var cS10 = c10 > 0 ? " + " + c10 : c10 < 0 ? " \u2212 " + Math.abs(c10) : "";
  return {q: "y = " + aS10 + "x\u00b2" + cS10 + "\nWelke x geeft de grootste y: x = 2 of x = \u22123?",
    a: y10a >= y10b ? "x = 2" : "x = \u22123", t: "choice",
    o: ["x = 2", "x = \u22123"],
    h: "y(2) = " + y10a + ", y(\u22123) = " + y10b};
}

function g63() {
  var t = rand(1, 20);

  // Helper: format formula string for y = ax² + c
  function fmtAC(a, c) {
    var s = "y = ";
    s += a === 1 ? "" : a === -1 ? "\u2212" : "" + a;
    s += "x\u00b2";
    if (c > 0) s += " + " + c;
    else if (c < 0) s += " \u2212 " + Math.abs(c);
    return s;
  }

  // Helper: nice number formatting (up to 2 decimals)
  function nf(v) {
    if (Math.abs(v - Math.round(v)) < 0.001) return "" + Math.round(v);
    var r2 = Math.round(v * 100) / 100;
    if (Math.abs(r2 - Math.round(r2 * 10) / 10) < 0.001) return "" + (Math.round(v * 10) / 10);
    return "" + r2;
  }

  // ===== TYPES 1-10: Classic graph questions with SVG =====

  // 1: Identify formula from table of values + SVG
  if (t === 1) {
    var a1 = pick([1, 2, 3]), c1 = pick([0, 1, -2, 3]);
    var xs = [-2, -1, 0, 1, 2];
    var ys = xs.map(function(x) { return a1 * x * x + c1; });
    var yMx = Math.max.apply(null, ys);
    var yMn = Math.min.apply(null, ys);
    var hl = [];
    for (var i = 0; i < xs.length; i++) hl.push({x: xs[i], y: ys[i], label: "(" + xs[i] + "," + ys[i] + ")"});
    return {q: "Welke formule past bij deze tabel?\nx: " + xs.join(", ") + "\ny: " + ys.join(", "),
      a: fmtAC(a1, c1), t: "text",
      h: "Patroon is kwadratisch: " + fmtAC(a1, c1),
      svg: svgParabola({a: a1, c: c1, xMin: -4, xMax: 4, yMin: Math.min(yMn, -1), yMax: Math.max(yMx + 2, 5), highlights: hl})};
  }

  // 2: dal/bergparabool + y-as snijpunt + SVG
  if (t === 2) {
    var a2 = pick([-3, -2, -1, 1, 2, 3]), c2 = pick([-2, 0, 3, 5]);
    var soort = a2 > 0 ? "dalparabool" : "bergparabool";
    var topY = c2;
    var lo = a2 > 0 ? Math.min(-1, c2 - 1) : Math.min(-1, c2 - 12);
    var hi2 = a2 > 0 ? Math.max(c2 + 12, 5) : Math.max(c2 + 1, 5);
    return {q: fmtAC(a2, c2) + "\nIs dit een dal- of bergparabool en waar snijdt de grafiek de y-as?",
      a: soort + ", y-as bij y = " + c2, t: "text",
      h: (a2 > 0 ? "a > 0 \u2192 dal" : "a < 0 \u2192 berg") + "; x=0 \u2192 y = " + c2,
      svg: svgParabola({a: a2, c: c2, xMin: -4, xMax: 4, yMin: lo, yMax: hi2,
        highlights: [{x: 0, y: c2, label: "(0, " + c2 + ")"}]})};
  }

  // 3: Compare linear vs kwadratisch at specific x + SVG
  if (t === 3) {
    var m = pick([2, 3, 4]), b3 = pick([0, 1, 3]);
    var xv = pick([4, 5, 6]);
    var yLin = m * xv + b3, yKw = xv * xv;
    return {q: "Bij x = " + xv + ": y = x\u00b2 geeft " + yKw + ", y = " + m + "x" + (b3 > 0 ? " + " + b3 : "") + " geeft " + yLin + ".\nWelke is groter?",
      a: yKw > yLin ? "y = x\u00b2" : "y = " + m + "x" + (b3 > 0 ? " + " + b3 : ""),
      t: "choice", o: ["y = x\u00b2", "y = " + m + "x" + (b3 > 0 ? " + " + b3 : "")],
      h: yKw + " vs " + yLin,
      svg: svgParabola({a: 1, c: 0, xMin: -1, xMax: xv + 1, yMin: -2, yMax: Math.max(yKw, yLin) + 3,
        highlights: [{x: xv, y: yKw, label: "(" + xv + "," + yKw + ")"}, {x: xv, y: yLin, label: "(" + xv + "," + yLin + ")", color: "#e67e22"}]})};
  }

  // 4: Snijpunten parabool met x-as + SVG
  if (t === 4) {
    var c4 = pick([4, 9, 16, 25]);
    var r4 = Math.round(Math.sqrt(c4));
    return {q: "Snijdt y = x\u00b2 \u2212 " + c4 + " de x-as?\nZo ja, waar?",
      a: "x = " + r4 + " en x = \u2212" + r4, t: "text",
      h: "x\u00b2 = " + c4 + " \u2192 x = \u00b1" + r4,
      svg: svgParabola({a: 1, c: -c4, xMin: -(r4 + 2), xMax: r4 + 2, yMin: -c4 - 2, yMax: 6,
        highlights: [{x: r4, y: 0, label: "(" + r4 + ", 0)"}, {x: -r4, y: 0, label: "(\u2212" + r4 + ", 0)"}]})};
  }

  // 5: Match formula to graph description (choice) + SVG
  if (t === 5) {
    var aVals = pick([[-1, 1], [-2, 2], [-3, 3]]);
    var isBerg = rand(0, 1);
    var aCoeff = isBerg ? aVals[0] : aVals[1];
    var cVal = pick([-3, -1, 0, 2, 4, 6]);
    var soort5 = isBerg ? "bergparabool" : "dalparabool";
    var correctF = fmtAC(aCoeff, cVal);
    var desc5 = soort5 + " door (0, " + cVal + ")";
    var wrongA = isBerg ? aVals[1] : aVals[0];
    var wrongC = cVal === 0 ? 3 : -cVal;
    var opts5 = [correctF, fmtAC(wrongA, cVal), fmtAC(aCoeff, wrongC), fmtAC(wrongA, wrongC)];
    // dedupe
    var uniq = []; for (var oi = 0; oi < opts5.length; oi++) { if (uniq.indexOf(opts5[oi]) === -1) uniq.push(opts5[oi]); }
    while (uniq.length < 4) uniq.push(fmtAC(pick([-2, 2]), pick([1, 5])));
    opts5 = uniq.slice(0, 4).sort(function() { return Math.random() - 0.5; });
    var lo5 = isBerg ? cVal - 12 : Math.min(cVal - 1, -2);
    var hi5 = isBerg ? Math.max(cVal + 1, 5) : cVal + 12;
    return {q: "Welke formule hoort bij: " + desc5 + "?",
      a: correctF, t: "choice", o: opts5,
      h: (isBerg ? "Berg (min voor x\u00b2)" : "Dal (plus voor x\u00b2)") + " en y(0) = " + cVal,
      svg: svgParabola({a: aCoeff, c: cVal, xMin: -4, xMax: 4, yMin: lo5, yMax: hi5,
        highlights: [{x: 0, y: cVal, label: "(0, " + cVal + ")"}]})};
  }

  // 6: Symmetrie-eigenschap + SVG
  if (t === 6) {
    var a6 = pick([1, 2, 3]), c6 = pick([0, 2, -3]);
    var xPos = pick([2, 3, 4]);
    var yVal = a6 * xPos * xPos + c6;
    return {q: fmtAC(a6, c6) + "\ny(" + xPos + ") = " + yVal + "\nWat is y(\u2212" + xPos + ")?", a: yVal,
      h: "Symmetrie: y(" + xPos + ") = y(\u2212" + xPos + ") = " + yVal,
      svg: svgParabola({a: a6, c: c6, xMin: -(xPos + 2), xMax: xPos + 2, yMin: Math.min(c6 - 1, -1), yMax: yVal + 3,
        highlights: [{x: xPos, y: yVal, label: "(" + xPos + "," + yVal + ")"}, {x: -xPos, y: yVal, label: "(\u2212" + xPos + ",?)", color: "#e67e22"}]})};
  }

  // 7: Bereken y voor negatieve x + SVG
  if (t === 7) {
    var a7 = pick([-1, -2, 1, 2]), c7 = pick([-3, 0, 2, 5]);
    var x7 = pick([-4, -3, -2]);
    var y7 = a7 * x7 * x7 + c7;
    var lo7 = Math.min(y7 - 2, c7 - 1, -1);
    var hi7 = Math.max(y7 + 2, c7 + 1, 5);
    if (a7 < 0) { lo7 = Math.min(lo7, a7 * 16 + c7 - 2); hi7 = Math.max(hi7, c7 + 2); }
    return {q: fmtAC(a7, c7) + "\nBereken y voor x = " + x7, a: y7,
      h: "y = " + (a7 === -1 ? "\u2212" : a7 === 1 ? "" : a7 + "\u00b7") + (x7 * x7) + (c7 >= 0 ? " + " + c7 : " \u2212 " + Math.abs(c7)) + " = " + y7,
      svg: svgParabola({a: a7, c: c7, xMin: -5, xMax: 5, yMin: lo7, yMax: hi7,
        highlights: [{x: x7, y: y7, label: "(" + x7 + "," + y7 + ")"}]})};
  }

  // 8: No snijpunten met x-as + SVG
  if (t === 8) {
    var c8 = pick([1, 3, 5, 7]);
    return {q: "Snijdt y = x\u00b2 + " + c8 + " de x-as?", a: "Nee", t: "choice",
      o: ["Ja", "Nee"],
      h: "x\u00b2 + " + c8 + " = 0 \u2192 x\u00b2 = \u2212" + c8 + " \u2192 geen oplossing",
      svg: svgParabola({a: 1, c: c8, xMin: -4, xMax: 4, yMin: -1, yMax: c8 + 10,
        highlights: [{x: 0, y: c8, label: "top (0," + c8 + ")"}]})};
  }

  // 9: Determine tabel bij bergparabool + SVG
  if (t === 9) {
    var a9 = pick([-1, -2]), c9 = pick([0, 4, 8]);
    var xs9 = [-2, -1, 0, 1, 2];
    var ys9 = xs9.map(function(x) { return a9 * x * x + c9; });
    var yMn9 = Math.min.apply(null, ys9);
    return {q: "De tabel hoort bij een kwadratische formule.\nx: " + xs9.join(", ") + "\ny: " + ys9.join(", ") + "\nIs dit een dal- of bergparabool?",
      a: "bergparabool", t: "choice", o: ["dalparabool", "bergparabool"],
      h: "y-waarden worden kleiner bij groter |x| \u2192 bergparabool",
      svg: svgParabola({a: a9, c: c9, xMin: -4, xMax: 4, yMin: Math.min(yMn9 - 2, -1), yMax: c9 + 2})};
  }

  // 10: Bereken meerdere y-waarden + SVG
  if (t === 10) {
    var a10 = pick([1, 2, -1]), c10 = pick([0, 1, -1]);
    var x10 = pick([3, 4]);
    var y10 = a10 * x10 * x10 + c10;
    var lo10 = a10 < 0 ? Math.min(a10 * 16 + c10 - 2, -2) : Math.min(c10 - 1, -1);
    var hi10 = a10 > 0 ? Math.max(y10 + 3, 5) : Math.max(c10 + 2, 5);
    return {q: fmtAC(a10, c10) + "\nBereken: y(" + x10 + ") + y(\u2212" + x10 + ")",
      a: y10 + y10,
      h: "Symmetrie: y(" + x10 + ") = y(\u2212" + x10 + ") = " + y10 + "\nSom = " + (y10 + y10),
      svg: svgParabola({a: a10, c: c10, xMin: -(x10 + 2), xMax: x10 + 2, yMin: lo10, yMax: hi10,
        highlights: [{x: x10, y: y10, label: "(" + x10 + "," + y10 + ")"}, {x: -x10, y: y10, label: "(\u2212" + x10 + "," + y10 + ")", color: "#e67e22"}]})};
  }

  // ===== TYPES 11-20: Toepassingsvragen (boekstijl) =====

  // 11: Tunnel hoogte — "Hoe hoog is de tunnel?"
  if (t === 11) {
    var aT = pick([0.5, 0.25, 0.2, 0.1]);
    var cT = pick([4, 4.5, 5, 6, 8]);
    var breedteT = Math.sqrt(cT / aT);
    return {q: "De doorsnede van een tunnel wordt beschreven door:\ny = \u2212" + aT + "x\u00b2 + " + cT + "\nHoe hoog is de tunnel op het hoogste punt?",
      a: cT,
      h: "Het hoogste punt is de top: x = 0 \u2192 y = " + cT + " meter",
      svg: svgParabola({a: -aT, c: cT, xMin: -(breedteT + 1), xMax: breedteT + 1, yMin: -1, yMax: cT + 2,
        highlights: [{x: 0, y: cT, label: "top: " + cT + " m"}],
        label: "Doorsnede tunnel"})};
  }

  // 12: Tunnel/hangar breedte — "Bereken de breedte"
  if (t === 12) {
    // Choose a/c so that sqrt(c/a) is a nice number
    var combos12 = [{a: 0.5, c: 4.5, w: 3}, {a: 0.25, c: 4, w: 4}, {a: 0.5, c: 8, w: 4},
      {a: 0.2, c: 5, w: 5}, {a: 0.1, c: 6.4, w: 8}, {a: 0.25, c: 9, w: 6},
      {a: 0.5, c: 2, w: 2}, {a: 0.1, c: 10, w: 10}];
    var cb12 = pick(combos12);
    var aB = cb12.a, cB = cb12.c, wB = cb12.w;
    return {q: "Een tunnel heeft de doorsnede:\ny = \u2212" + aB + "x\u00b2 + " + cB + "\nBereken de breedte van de tunnel (op grondniveau).",
      a: 2 * wB,
      h: "y = 0: " + aB + "x\u00b2 = " + cB + " \u2192 x\u00b2 = " + nf(cB / aB) + " \u2192 x = \u00b1" + wB + "\nBreedte = 2 \u00d7 " + wB + " = " + (2 * wB) + " meter",
      svg: svgParabola({a: -aB, c: cB, xMin: -(wB + 2), xMax: wB + 2, yMin: -1, yMax: cB + 2,
        highlights: [{x: -wB, y: 0, label: "\u2212" + wB}, {x: wB, y: 0, label: "" + wB}],
        hLine: {y: 0, label: "grond", color: "#888"},
        label: "Breedte tunnel"})};
  }

  // 13: Past het erin? — vrachtwagen door tunnel
  if (t === 13) {
    var combos13 = [
      {a: 0.5, c: 4.5, vw: 3, vh: 3.5}, // y(1.5)=4.5-0.5*2.25=4.5-1.125=3.375 < 3.5 → nee
      {a: 0.5, c: 4.5, vw: 2, vh: 3},    // y(1)=4.5-0.5=4.0 > 3 → ja
      {a: 0.25, c: 5, vw: 4, vh: 3},      // y(2)=5-0.25*4=4 > 3 → ja
      {a: 0.25, c: 5, vw: 4, vh: 4.5},    // y(2)=4 < 4.5 → nee
      {a: 0.5, c: 8, vw: 3, vh: 6},       // y(1.5)=8-0.5*2.25=6.875 > 6 → ja
      {a: 0.5, c: 8, vw: 4, vh: 6}        // y(2)=8-2=6 ≥ 6 → ja (net)
    ];
    var cb13 = pick(combos13);
    var a13 = cb13.a, c13 = cb13.c, vw13 = cb13.vw, vh13 = cb13.vh;
    var halfW = vw13 / 2;
    var yAtEdge = -a13 * halfW * halfW + c13;
    var yAtEdgeR = Math.round(yAtEdge * 100) / 100;
    var past = yAtEdgeR >= vh13 ? "Ja" : "Nee";
    var breedteMax = Math.sqrt(c13 / a13);
    return {q: "Een tunnel: y = \u2212" + a13 + "x\u00b2 + " + c13 + "\nEen vrachtwagen is " + vw13 + " m breed en " + vh13 + " m hoog.\nPast de vrachtwagen door de tunnel?",
      a: past, t: "choice", o: ["Ja", "Nee"],
      h: "Op x = " + nf(halfW) + " (halve breedte): y = \u2212" + a13 + "\u00b7" + nf(halfW * halfW) + " + " + c13 + " = " + nf(yAtEdgeR) + "\n" + nf(yAtEdgeR) + (yAtEdgeR >= vh13 ? " \u2265 " : " < ") + vh13 + " \u2192 " + past,
      svg: svgParabola({a: -a13, c: c13, xMin: -(breedteMax + 1), xMax: breedteMax + 1, yMin: -1, yMax: c13 + 2,
        rect: {halfW: halfW, h: vh13, color: yAtEdgeR >= vh13 ? "#27ae60" : "#e74c3c"},
        highlights: [{x: halfW, y: yAtEdgeR, label: nf(yAtEdgeR) + " m"}],
        label: "Past de vrachtwagen?"})};
  }

  // 14: Hangbrug — hoogte op x
  if (t === 14) {
    var aBr = pick([0.002, 0.005, 0.01]);
    var cBr = pick([10, 12, 15, 20]);
    var xBr = pick([10, 20, 30, 40]);
    var yBr = aBr * xBr * xBr + cBr;
    var yBrR = Math.round(yBr * 10) / 10;
    var xRange = Math.max(xBr + 10, 50);
    return {q: "De kabels van een hangbrug volgen:\ny = " + aBr + "x\u00b2 + " + cBr + "\nBereken de hoogte van de kabel op x = " + xBr + ".",
      a: yBrR,
      h: aBr + " \u00b7 " + xBr + "\u00b2 + " + cBr + " = " + aBr + " \u00b7 " + (xBr * xBr) + " + " + cBr + " = " + nf(yBrR),
      svg: svgParabola({a: aBr, c: cBr, xMin: -xRange, xMax: xRange, yMin: 0, yMax: Math.max(yBrR + 10, cBr + 20),
        highlights: [{x: xBr, y: yBrR, label: "(" + xBr + ", " + nf(yBrR) + ")"}],
        label: "Kabels hangbrug"})};
  }

  // 15: Klifduiken hoogte — "hoogte na t seconden"
  if (t === 15) {
    var aK = 5, h0K = pick([20, 45, 80]);
    var tK = pick([1, 2, 3]);
    var hK = -aK * tK * tK + h0K;
    // Make sure height is positive
    if (hK < 0) { tK = 1; hK = -aK * tK * tK + h0K; }
    var tMax = Math.sqrt(h0K / aK);
    return {q: "Een klifduiker springt van een rots.\nDe hoogte is: h = \u22125t\u00b2 + " + h0K + "\nBereken de hoogte na " + tK + " seconde" + (tK > 1 ? "n" : "") + ".",
      a: hK,
      h: "h = \u22125 \u00b7 " + tK + "\u00b2 + " + h0K + " = \u22125 \u00b7 " + (tK * tK) + " + " + h0K + " = " + (-aK * tK * tK) + " + " + h0K + " = " + hK,
      svg: svgParabola({a: -aK, c: h0K, xMin: -0.5, xMax: Math.ceil(tMax) + 1, yMin: -5, yMax: h0K + 5,
        highlights: [{x: tK, y: hK, label: "t=" + tK + ": h=" + hK}],
        label: "Klifduiken: hoogte"})};
  }

  // 16: Klifduiken afstand — "hoeveel meter in de 2e seconde?"
  if (t === 16) {
    var aK2 = 5, h0K2 = pick([45, 80]);
    var tStart = pick([1, 2]);
    var tEnd = tStart + 1;
    var hStart = -aK2 * tStart * tStart + h0K2;
    var hEnd = -aK2 * tEnd * tEnd + h0K2;
    var afstand = hStart - hEnd;
    var tMax2 = Math.sqrt(h0K2 / aK2);
    return {q: "h = \u22125t\u00b2 + " + h0K2 + "\nHoeveel meter valt de duiker tussen t = " + tStart + " en t = " + tEnd + "?",
      a: afstand,
      h: "h(" + tStart + ") = " + hStart + ", h(" + tEnd + ") = " + hEnd + "\nVerschil: " + hStart + " \u2212 " + hEnd + " = " + afstand + " meter",
      svg: svgParabola({a: -aK2, c: h0K2, xMin: -0.5, xMax: Math.ceil(tMax2) + 1, yMin: -5, yMax: h0K2 + 5,
        highlights: [{x: tStart, y: hStart, label: "h(" + tStart + ")=" + hStart}, {x: tEnd, y: hEnd, label: "h(" + tEnd + ")=" + hEnd, color: "#e67e22"}],
        label: "Klifduiken: afstand"})};
  }

  // 17: Tabel invullen — één waarde ontbreekt
  if (t === 17) {
    var a17 = pick([1, 2, -1, -2]), c17 = pick([0, 3, -2, 5]);
    var xs17 = [-3, -2, -1, 0, 1, 2, 3];
    var ys17 = xs17.map(function(x) { return a17 * x * x + c17; });
    var misIdx = rand(0, 6);
    var misX = xs17[misIdx], misY = ys17[misIdx];
    var tabelX = "x: ", tabelY = "y: ";
    for (var ti = 0; ti < xs17.length; ti++) {
      tabelX += (ti > 0 ? ", " : "") + xs17[ti];
      tabelY += (ti > 0 ? ", " : "") + (ti === misIdx ? "?" : ys17[ti]);
    }
    return {q: fmtAC(a17, c17) + "\n" + tabelX + "\n" + tabelY + "\nWat is y voor x = " + misX + "?",
      a: misY,
      h: "y = " + (a17 === 1 ? "" : a17 === -1 ? "\u2212" : a17 + "\u00b7") + "(" + misX + ")\u00b2" + (c17 >= 0 ? " + " + c17 : " \u2212 " + Math.abs(c17)) + " = " + misY,
      svg: svgParabola({a: a17, c: c17, xMin: -5, xMax: 5,
        yMin: Math.min.apply(null, ys17) - 2, yMax: Math.max.apply(null, ys17) + 2,
        highlights: [{x: misX, y: misY, label: "(" + misX + ", ?)"}]})};
  }

  // 18: Top van parabool — coördinaten top
  if (t === 18) {
    var a18 = pick([-2, -1, -3, 2, 3]), c18 = pick([0, 4, 8, 12, 18]);
    var soort18 = a18 > 0 ? "dalparabool" : "bergparabool";
    var correct18 = "(0, " + c18 + ")";
    var wrong1 = "(" + c18 + ", 0)";
    var wrong2 = "(0, " + (-c18) + ")";
    var wrong3 = "(" + (a18 > 0 ? -2 : 2) + ", " + (a18 * 4 + c18) + ")";
    var opts18 = [correct18, wrong1, wrong2, wrong3].sort(function() { return Math.random() - 0.5; });
    var lo18 = a18 > 0 ? Math.min(c18 - 1, -1) : Math.min(c18 - 15, -2);
    var hi18 = a18 > 0 ? Math.max(c18 + 15, 5) : Math.max(c18 + 1, 5);
    return {q: fmtAC(a18, c18) + "\nWat zijn de coördinaten van de top?",
      a: correct18, t: "choice", o: opts18,
      h: "Vorm y = ax\u00b2 + c \u2192 top = (0, c) = (0, " + c18 + ")\n" + soort18 + " \u2192 top is " + (a18 > 0 ? "laagste" : "hoogste") + " punt",
      svg: svgParabola({a: a18, c: c18, xMin: -5, xMax: 5, yMin: lo18, yMax: hi18,
        highlights: [{x: 0, y: c18, label: "top " + correct18}]})};
  }

  // 19: Hoogte hangar op afstand van midden
  if (t === 19) {
    var aH = pick([0.025, 0.05, 0.02]);
    var cH = pick([6, 8, 10, 12]);
    var xH = pick([4, 6, 8, 10]);
    var yH = -aH * xH * xH + cH;
    var yHR = Math.round(yH * 100) / 100;
    var breedteH = Math.sqrt(cH / aH);
    return {q: "De doorsnede van een hangar:\ny = \u2212" + aH + "x\u00b2 + " + cH + "\nBereken de hoogte op " + xH + " meter van het midden.",
      a: yHR,
      h: "y = \u2212" + aH + " \u00b7 " + xH + "\u00b2 + " + cH + " = \u2212" + aH + " \u00b7 " + (xH * xH) + " + " + cH + " = \u2212" + nf(aH * xH * xH) + " + " + cH + " = " + nf(yHR),
      svg: svgParabola({a: -aH, c: cH, xMin: -(breedteH + 2), xMax: breedteH + 2, yMin: -1, yMax: cH + 2,
        highlights: [{x: xH, y: yHR, label: "(" + xH + ", " + nf(yHR) + ")"}],
        vLines: [{x: xH, y1: 0, y2: yHR, color: "#e67e22"}],
        label: "Doorsnede hangar"})};
  }

  // 20: Wanneer raakt het water? — t bij h = 0
  // Choose h0 and a so that t = sqrt(h0/a) is a nice integer
  var combos20 = [{a: 5, h0: 20, t: 2}, {a: 5, h0: 45, t: 3}, {a: 5, h0: 80, t: 4},
    {a: 5, h0: 125, t: 5}, {a: 4.9, h0: 44.1, t: 3}];
  var cb20 = pick(combos20);
  var a20 = cb20.a, h20 = cb20.h0, t20 = cb20.t;
  return {q: "Een duiker springt van een klif.\nh = \u2212" + a20 + "t\u00b2 + " + h20 + "\nNa hoeveel seconden raakt de duiker het water (h = 0)?",
    a: t20,
    h: "h = 0: " + a20 + "t\u00b2 = " + h20 + " \u2192 t\u00b2 = " + nf(h20 / a20) + " \u2192 t = " + t20 + " seconden",
    svg: svgParabola({a: -a20, c: h20, xMin: -0.5, xMax: t20 + 1.5, yMin: -5, yMax: h20 + 5,
      highlights: [{x: 0, y: h20, label: "start: " + nf(h20) + " m"}, {x: t20, y: 0, label: "t=" + t20 + ": water!"}],
      hLine: {y: 0, label: "water", color: "#3498db"},
      label: "Klifduiken"})};
}

function g64() {
  var t = rand(1, 10);

  // 1: Multi-term herleiden: 3a + 5b + 2a + 7b + 4c − 2c
  if (t === 1) {
    var a1 = rand(2, 6), b1 = rand(3, 8), a2 = rand(1, 5), b2 = rand(2, 7), c1 = rand(2, 6), c2 = rand(1, 4);
    return {q: "Herleid: " + a1 + "a + " + b1 + "b + " + a2 + "a + " + b2 + "b + " + c1 + "c \u2212 " + c2 + "c",
      a: (a1 + a2) + "a + " + (b1 + b2) + "b + " + (c1 - c2) + "c", t: "text",
      h: "a: " + a1 + "+" + a2 + "=" + (a1 + a2) + ", b: " + b1 + "+" + b2 + "=" + (b1 + b2) + ", c: " + c1 + "\u2212" + c2 + "=" + (c1 - c2)};
  }

  // 2: Products with multiple variables and negatives: −4p · −2q · 3r
  if (t === 2) {
    var f1 = pick([-4, -3, -2, 3, 4]), f2 = pick([-2, -3, 2, 3]), f3 = pick([2, 3, 4, 5]);
    var prod = f1 * f2 * f3;
    return {q: "Herleid: " + f1 + "p \u00b7 " + f2 + "q \u00b7 " + f3 + "r",
      a: prod + "pqr", t: "text",
      h: f1 + " \u00d7 " + f2 + " \u00d7 " + f3 + " = " + prod + " \u2192 " + prod + "pqr"};
  }

  // 3: Identify gelijksoortige termen
  if (t === 3) {
    var termSets = [
      {terms: ["3a", "5b", "2a", "7b", "4a"], ans: "3a, 2a, 4a en 5b, 7b"},
      {terms: ["6x", "2y", "x", "3y", "5z"], ans: "6x, x en 2y, 3y"},
      {terms: ["4p", "2q", "7p", "q", "3r"], ans: "4p, 7p en 2q, q"},
      {terms: ["5m", "3n", "2m", "8n", "m"], ans: "5m, 2m, m en 3n, 8n"}
    ];
    var chosen = pick(termSets);
    return {q: "Welke zijn gelijksoortige termen?\n" + chosen.terms.join(", "),
      a: chosen.ans, t: "text",
      h: "Gelijksoortig = zelfde letter"};
  }

  // 4: Products resulting in squared terms: 5x · −3x = −15x²
  if (t === 4) {
    var f4a = pick([2, 3, 4, 5, -2, -3, -4, -5]), f4b = pick([2, 3, -2, -3, -4]);
    var v = pick(["x", "a", "p"]);
    var prod4 = f4a * f4b;
    return {q: "Herleid: " + f4a + v + " \u00b7 " + f4b + v,
      a: prod4 + v + "\u00b2", t: "text",
      h: f4a + " \u00d7 " + f4b + " = " + prod4 + ", " + v + " \u00d7 " + v + " = " + v + "\u00b2 \u2192 " + prod4 + v + "\u00b2"};
  }

  // 5: Mixed operations — add + multiply in one problem
  if (t === 5) {
    var a5 = rand(2, 5), b5 = rand(3, 7), c5 = rand(1, 4);
    var v5 = pick(["a", "x"]);
    return {q: "Herleid: " + a5 + v5 + " + " + b5 + v5 + " + " + c5,
      a: (a5 + b5) + v5 + " + " + c5, t: "text",
      h: v5 + ": " + a5 + "+" + b5 + "=" + (a5 + b5) + ", getal " + c5 + " apart"};
  }

  // 6: Multiply variable by number
  if (t === 6) {
    var f6 = pick([3, 4, 5, 6, 7]), g6 = pick([2, 3, 4, 5]);
    var v6a = pick(["a", "x", "p"]), v6b = pick(["b", "y", "q"]);
    return {q: "Herleid: " + f6 + v6a + " \u00b7 " + g6 + v6b,
      a: (f6 * g6) + v6a + v6b, t: "text",
      h: f6 + " \u00d7 " + g6 + " = " + (f6 * g6) + " \u2192 " + (f6 * g6) + v6a + v6b};
  }

  // 7: Subtract like terms with negatives
  if (t === 7) {
    var a7 = rand(3, 9), b7 = rand(2, 8), c7 = rand(1, 5);
    var v7 = pick(["x", "a", "n"]);
    return {q: "Herleid: " + a7 + v7 + " \u2212 " + b7 + v7 + " \u2212 " + c7 + v7,
      a: (a7 - b7 - c7) + v7, t: "text",
      h: a7 + " \u2212 " + b7 + " \u2212 " + c7 + " = " + (a7 - b7 - c7)};
  }

  // 8: v · v = v²
  if (t === 8) {
    var v8 = pick(["a", "x", "p", "n", "m"]);
    var f8 = pick([2, 3, 4, 5]);
    return {q: "Herleid: " + f8 + " \u00b7 " + v8 + " \u00b7 " + v8,
      a: f8 + v8 + "\u00b2", t: "text",
      h: f8 + " \u00b7 " + v8 + "\u00b7" + v8 + " = " + f8 + v8 + "\u00b2"};
  }

  // 9: Two products added: 3a · 2b + 4a · b
  if (t === 9) {
    var f9a = pick([2, 3, 4]), f9b = pick([2, 3]), f9c = pick([1, 2, 3]);
    var v9a = pick(["a", "x"]), v9b = pick(["b", "y"]);
    var p1 = f9a * f9b, p2 = f9c;
    return {q: "Herleid: " + f9a + v9a + " \u00b7 " + f9b + v9b + " + " + f9c + v9a + v9b,
      a: (p1 + p2) + v9a + v9b, t: "text",
      h: f9a + "\u00b7" + f9b + "=" + p1 + " \u2192 " + p1 + v9a + v9b + " + " + p2 + v9a + v9b + " = " + (p1 + p2) + v9a + v9b};
  }

  // 10: Complex three-variable with subtraction
  var a10 = rand(5, 9), b10 = rand(3, 7), c10 = rand(2, 6), a102 = rand(1, 4), b102 = rand(1, 3);
  return {q: "Herleid: " + a10 + "a + " + b10 + "b + " + c10 + "c \u2212 " + a102 + "a \u2212 " + b102 + "b",
    a: (a10 - a102) + "a + " + (b10 - b102) + "b + " + c10 + "c", t: "text",
    h: "a: " + (a10 - a102) + ", b: " + (b10 - b102) + ", c: " + c10};
}

function g65() {
  var t = rand(1, 10);

  // 1: Complex expression: 2a + 3b − 5a − 7b + 4
  if (t === 1) {
    var a1 = rand(2, 6), b1 = rand(3, 8), a2 = rand(3, 8), b2 = rand(2, 7), k = rand(2, 9);
    var ra = a1 - a2, rb = b1 - b2;
    var raStr = ra + "a";
    var rbStr = rb >= 0 ? " + " + rb + "b" : " \u2212 " + Math.abs(rb) + "b";
    return {q: "Herleid: " + a1 + "a + " + b1 + "b \u2212 " + a2 + "a \u2212 " + b2 + "b + " + k,
      a: raStr + rbStr + " + " + k, t: "text",
      h: "a: " + a1 + "\u2212" + a2 + "=" + ra + ", b: " + b1 + "\u2212" + b2 + "=" + rb + ", getal: " + k};
  }

  // 2: Double negatives and mixed signs
  if (t === 2) {
    var a2a = pick([-3, -2, 4, 5]), b2a = pick([6, 7, -4, -5]), c2a = pick([-2, 3, -4]);
    var a2b = pick([-1, -3, 2, 4]), b2b = pick([-2, 3, -3]);
    var v = pick(["x", "a"]), w = pick(["y", "b"]);
    var rv = a2a + a2b, rw = b2a + b2b;
    var qStr = a2a + v + (b2a >= 0 ? " + " + b2a : " \u2212 " + Math.abs(b2a)) + w + (c2a >= 0 ? " + " + c2a : " \u2212 " + Math.abs(c2a)) + (a2b >= 0 ? " + " + a2b : " \u2212 " + Math.abs(a2b)) + v + (b2b >= 0 ? " + " + b2b : " \u2212 " + Math.abs(b2b)) + w;
    var rvStr = rv + v;
    var rwStr = rw >= 0 ? " + " + rw + w : " \u2212 " + Math.abs(rw) + w;
    var rcStr = c2a >= 0 ? " + " + c2a : " \u2212 " + Math.abs(c2a);
    return {q: "Herleid: " + qStr,
      a: rvStr + rwStr + rcStr, t: "text",
      h: v + ": " + a2a + "+" + a2b + "=" + rv + ", " + w + ": " + b2a + "+" + b2b + "=" + rw + ", getal: " + c2a};
  }

  // 3: Three or more variables
  if (t === 3) {
    var ax = rand(3, 7), bx = rand(2, 5), cx = rand(1, 4);
    var ay = rand(2, 6), by = rand(1, 3);
    var az = rand(2, 5), bz = rand(1, 3);
    return {q: "Herleid: " + ax + "x + " + ay + "y + " + az + "z \u2212 " + bx + "x \u2212 " + by + "y + " + bz + "z",
      a: (ax - bx) + "x + " + (ay - by) + "y + " + (az + bz) + "z", t: "text",
      h: "x: " + (ax - bx) + ", y: " + (ay - by) + ", z: " + (az + bz)};
  }

  // 4: Expressions with constants mixed in
  if (t === 4) {
    var a4 = rand(5, 10), b4 = rand(3, 8), k4a = rand(2, 7), k4b = rand(1, 5);
    var v4 = pick(["a", "x", "p"]);
    return {q: "Herleid: " + a4 + v4 + " + " + k4a + " \u2212 " + b4 + v4 + " \u2212 " + k4b,
      a: (a4 - b4) + v4 + " + " + (k4a - k4b), t: "text",
      h: v4 + ": " + (a4 - b4) + ", getallen: " + k4a + "\u2212" + k4b + "=" + (k4a - k4b)};
  }

  // 5: Checking correctness of given simplification
  if (t === 5) {
    var isCorrect = rand(0, 1);
    if (isCorrect) {
      var ca = rand(3, 8), cb = rand(2, 5);
      var v5 = pick(["a", "x"]);
      return {q: (ca + cb) + v5 + " = " + ca + v5 + " + " + cb + v5 + "\nIs dit waar of niet waar?",
        a: "Waar", t: "choice", o: ["Waar", "Niet waar"],
        h: ca + " + " + cb + " = " + (ca + cb) + " \u2192 klopt!"};
    }
    var ca2 = rand(3, 8), cb2 = rand(2, 5), wrong = ca2 + cb2 + 1;
    var v5b = pick(["a", "x"]);
    return {q: wrong + v5b + " = " + ca2 + v5b + " + " + cb2 + v5b + "\nIs dit waar of niet waar?",
      a: "Niet waar", t: "choice", o: ["Waar", "Niet waar"],
      h: ca2 + " + " + cb2 + " = " + (ca2 + cb2) + " \u2260 " + wrong};
  }

  // 6: Negative starting term
  if (t === 6) {
    var a6 = rand(3, 7), b6 = rand(5, 10), c6 = rand(1, 4);
    var v6 = pick(["a", "x", "n"]);
    return {q: "Herleid: \u2212" + a6 + v6 + " + " + b6 + v6 + " \u2212 " + c6 + v6,
      a: (-a6 + b6 - c6) + v6, t: "text",
      h: "\u2212" + a6 + " + " + b6 + " \u2212 " + c6 + " = " + (-a6 + b6 - c6)};
  }

  // 7: All negative terms
  if (t === 7) {
    var a7 = rand(2, 6), b7 = rand(3, 7), c7 = rand(1, 4);
    var v7 = pick(["x", "a", "p"]);
    return {q: "Herleid: \u2212" + a7 + v7 + " \u2212 " + b7 + v7 + " \u2212 " + c7 + v7,
      a: "\u2212" + (a7 + b7 + c7) + v7, t: "text",
      h: "\u2212(" + a7 + "+" + b7 + "+" + c7 + ") = \u2212" + (a7 + b7 + c7)};
  }

  // 8: Mixed with two variables and a constant
  if (t === 8) {
    var a8 = rand(4, 9), b8 = rand(3, 7), c8 = rand(2, 6), d8 = rand(1, 4), k8 = rand(1, 8);
    return {q: "Herleid: " + a8 + "a \u2212 " + b8 + "b + " + k8 + " + " + c8 + "b \u2212 " + d8 + "a",
      a: (a8 - d8) + "a + " + (c8 - b8) + "b + " + k8, t: "text",
      h: "a: " + (a8 - d8) + ", b: " + (c8 - b8) + ", getal: " + k8};
  }

  // 9: Simplify and compare
  if (t === 9) {
    var a9 = rand(3, 7), b9 = rand(2, 5);
    var v9 = pick(["x", "a"]);
    return {q: "Welke is groter als " + v9 + " = 3?\n" + a9 + v9 + " + " + b9 + v9 + " of " + (a9 + b9 + 1) + v9,
      a: (a9 + b9 + 1) + v9, t: "choice",
      o: [(a9 + b9) + v9, (a9 + b9 + 1) + v9],
      h: a9 + "+" + b9 + "=" + (a9 + b9) + " < " + (a9 + b9 + 1)};
  }

  // 10: Large expression with 5+ terms
  var a10 = rand(2, 5), b10 = rand(3, 6), c10 = rand(1, 4), d10 = rand(2, 5), e10 = rand(1, 3);
  var v10 = pick(["x", "a"]);
  var result10 = a10 - c10 + e10;
  var result10b = b10 - d10;
  return {q: "Herleid: " + a10 + v10 + " + " + b10 + " \u2212 " + c10 + v10 + " \u2212 " + d10 + " + " + e10 + v10,
    a: result10 + v10 + (result10b >= 0 ? " + " + result10b : " \u2212 " + Math.abs(result10b)), t: "text",
    h: v10 + ": " + a10 + "\u2212" + c10 + "+" + e10 + "=" + result10 + ", getallen: " + b10 + "\u2212" + d10 + "=" + result10b};
}

function g66() {
  var t = rand(1, 10);

  // 1: Non-gelijknamige breuken: 2/a + 1/b (common denominator ab)
  if (t === 1) {
    var n1 = pick([1, 2, 3]), n2 = pick([1, 2, 3]);
    var v1 = pick(["a", "x", "p"]), v2 = pick(["b", "y", "q"]);
    return {q: "Herleid: " + n1 + "/" + v1 + " + " + n2 + "/" + v2,
      a: "(" + n1 + v2 + " + " + n2 + v1 + ")/" + v1 + v2, t: "text",
      h: "Gelijknamig maken met noemer " + v1 + v2 + ":\n" + n1 + v2 + "/" + v1 + v2 + " + " + n2 + v1 + "/" + v1 + v2 + " = (" + n1 + v2 + " + " + n2 + v1 + ")/" + v1 + v2};
  }

  // 2: Simplify x²/x
  if (t === 2) {
    var d2a = pick([2, 3, 5]);
    var mul2 = pick([2, 3, 4, 5]);
    var n2a = d2a * mul2;
    var v2a = pick(["x", "a", "p"]);
    return {q: "Vereenvoudig: " + n2a + v2a + "\u00b2 / " + d2a + v2a,
      a: mul2 + v2a, t: "text",
      h: n2a + "/" + d2a + " = " + mul2 + ", " + v2a + "\u00b2/" + v2a + " = " + v2a + " \u2192 " + mul2 + v2a};
  }

  // 3: Mixed operations: a/3 + 2a/6 + a/2
  if (t === 3) {
    var v3 = pick(["a", "x"]);
    return {q: "Herleid: " + v3 + "/3 + 2" + v3 + "/6 + " + v3 + "/2",
      a: "7" + v3 + "/6", t: "text",
      h: v3 + "/3 = 2" + v3 + "/6, " + v3 + "/2 = 3" + v3 + "/6\n2" + v3 + "/6 + 2" + v3 + "/6 + 3" + v3 + "/6 = 7" + v3 + "/6"};
  }

  // 4: 5/x + 4 = (5+4x)/x
  if (t === 4) {
    var n4 = pick([3, 5, 7]), k4 = pick([2, 3, 4]);
    var v4 = pick(["x", "a"]);
    return {q: "Herleid: " + n4 + "/" + v4 + " + " + k4,
      a: "(" + n4 + " + " + k4 + v4 + ")/" + v4, t: "text",
      h: k4 + " = " + k4 + v4 + "/" + v4 + "\n\u2192 (" + n4 + " + " + k4 + v4 + ")/" + v4};
  }

  // 5: Subtract breuken with same denominator
  if (t === 5) {
    var a5 = pick([8, 10, 12]), b5 = pick([3, 5, 7]);
    var v5a = "a", v5b = "b";
    return {q: "Herleid: " + a5 + v5a + "/" + v5b + " \u2212 " + b5 + v5a + "/" + v5b,
      a: (a5 - b5) + v5a + "/" + v5b, t: "text",
      h: "Zelfde noemer: " + a5 + " \u2212 " + b5 + " = " + (a5 - b5) + " \u2192 " + (a5 - b5) + v5a + "/" + v5b};
  }

  // 6: Simplify larger fraction
  if (t === 6) {
    var mul = pick([2, 3, 4, 5]), d6 = pick([2, 3, 4]);
    var v6 = pick(["a", "x"]);
    return {q: "Vereenvoudig: " + (mul * d6) + v6 + " / " + d6,
      a: mul + v6, t: "text",
      h: (mul * d6) + " / " + d6 + " = " + mul + " \u2192 " + mul + v6};
  }

  // 7: Add fractions with related denominators: v/3 + v/6
  if (t === 7) {
    var v7 = pick(["a", "x", "p"]);
    var pairs = [
      {d1: 3, d2: 6, lcd: 6, m1: 2, m2: 1, num: 3, ans: v7 + "/2"},
      {d1: 2, d2: 4, lcd: 4, m1: 2, m2: 1, num: 3, ans: "3" + v7 + "/4"},
      {d1: 4, d2: 8, lcd: 8, m1: 2, m2: 1, num: 3, ans: "3" + v7 + "/8"},
      {d1: 2, d2: 6, lcd: 6, m1: 3, m2: 1, num: 4, ans: "2" + v7 + "/3"}
    ];
    var p7 = pick(pairs);
    return {q: "Herleid: " + v7 + "/" + p7.d1 + " + " + v7 + "/" + p7.d2,
      a: p7.ans, t: "text",
      h: v7 + "/" + p7.d1 + " = " + p7.m1 + v7 + "/" + p7.lcd + "\n" + p7.m1 + v7 + "/" + p7.lcd + " + " + v7 + "/" + p7.lcd + " = " + p7.num + v7 + "/" + p7.lcd};
  }

  // 8: Simplify product of fractions
  if (t === 8) {
    var d8 = pick([2, 3, 4, 5]);
    var mul8 = pick([2, 3, 4]);
    var n8 = d8 * mul8;
    var v8a = pick(["a", "x"]), v8b = pick(["b", "y"]);
    return {q: "Vereenvoudig: " + n8 + v8a + v8b + " / " + d8 + v8b,
      a: mul8 + v8a, t: "text",
      h: n8 + "/" + d8 + " = " + mul8 + ", " + v8b + " valt weg \u2192 " + mul8 + v8a};
  }

  // 9: Subtract fractions with different denominators
  if (t === 9) {
    var v9 = pick(["a", "x"]);
    var combos = [
      {d1: 2, d2: 3, lcd: 6, n1: 3, n2: 2, num: 1, ans: v9 + "/6"},
      {d1: 3, d2: 4, lcd: 12, n1: 4, n2: 3, num: 1, ans: v9 + "/12"},
      {d1: 2, d2: 5, lcd: 10, n1: 5, n2: 2, num: 3, ans: "3" + v9 + "/10"}
    ];
    var c9 = pick(combos);
    return {q: "Herleid: " + v9 + "/" + c9.d1 + " \u2212 " + v9 + "/" + c9.d2,
      a: c9.ans, t: "text",
      h: c9.n1 + v9 + "/" + c9.lcd + " \u2212 " + c9.n2 + v9 + "/" + c9.lcd + " = " + c9.num + v9 + "/" + c9.lcd};
  }

  // 10: Combined: coefficient fraction + whole number
  var n10 = pick([2, 4, 7]), k10 = pick([1, 2, 3]), d10 = pick([3, 5]);
  var v10 = pick(["x", "a"]);
  return {q: "Herleid: " + n10 + v10 + "/" + d10 + " + " + k10 + v10,
    a: "(" + n10 + " + " + (k10 * d10) + ")" + v10 + "/" + d10, t: "text",
    h: k10 + v10 + " = " + (k10 * d10) + v10 + "/" + d10 + "\n" + n10 + v10 + "/" + d10 + " + " + (k10 * d10) + v10 + "/" + d10 + " = " + (n10 + k10 * d10) + v10 + "/" + d10};
}
