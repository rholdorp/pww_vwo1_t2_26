// Shared helpers
var rand=function(a,b){return Math.floor(Math.random()*(b-a+1))+a};
var pick=function(a){return a[Math.floor(Math.random()*a.length)]};

// ========== SVG HELPER FUNCTIONS ==========

function svgClock(hours, minutes) {
  // Normalize to 12-hour
  var h = hours % 12;
  var m = minutes;
  // Angles: 12 o'clock = 0deg, clockwise
  // Minute hand: 6 deg per minute
  var minAngle = m * 6;
  // Hour hand: 30 deg per hour + 0.5 deg per minute
  var hourAngle = h * 30 + m * 0.5;

  var cx = 100, cy = 100, r = 80;
  // Convert angle (0=top, clockwise) to SVG coordinates
  function pos(angle, len) {
    var rad = (angle - 90) * Math.PI / 180;
    return { x: cx + len * Math.cos(rad), y: cy + len * Math.sin(rad) };
  }

  var hourEnd = pos(hourAngle, 50);
  var minEnd = pos(minAngle, 70);

  var ticks = "";
  for (var i = 0; i < 12; i++) {
    var a = i * 30;
    var p1 = pos(a, 72);
    var p2 = pos(a, 80);
    ticks += '<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" stroke="#888" stroke-width="2"/>';
    // Number labels
    var lp = pos(a, 63);
    var num = i === 0 ? 12 : i;
    ticks += '<text x="' + lp.x + '" y="' + (lp.y + 4) + '" fill="#aaa" font-size="12" text-anchor="middle">' + num + '</text>';
  }

  // Small minute ticks
  for (var j = 0; j < 60; j++) {
    if (j % 5 !== 0) {
      var a2 = j * 6;
      var q1 = pos(a2, 76);
      var q2 = pos(a2, 80);
      ticks += '<line x1="' + q1.x + '" y1="' + q1.y + '" x2="' + q2.x + '" y2="' + q2.y + '" stroke="#555" stroke-width="1"/>';
    }
  }

  return '<svg viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#666" stroke-width="2"/>' +
    ticks +
    '<line x1="' + cx + '" y1="' + cy + '" x2="' + hourEnd.x + '" y2="' + hourEnd.y + '" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' +
    '<line x1="' + cx + '" y1="' + cy + '" x2="' + minEnd.x + '" y2="' + minEnd.y + '" stroke="#3498db" stroke-width="2.5" stroke-linecap="round"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#fff"/>' +
    '</svg>';
}

function svgAngle(degrees, label) {
  // Draw an angle with one arm horizontal to the right, the other at `degrees`
  var cx = 40, cy = 150, armLen = 130;
  var rad = -degrees * Math.PI / 180; // negative because SVG y is inverted
  var ex = cx + armLen * Math.cos(rad);
  var ey = cy + armLen * Math.sin(rad);

  // Arc
  var arcR = 40;
  var arcEnd = { x: cx + arcR * Math.cos(rad), y: cy + arcR * Math.sin(rad) };
  var largeArc = degrees > 180 ? 1 : 0;
  var sweep = 0; // counter-clockwise in SVG = our angle direction
  var arcPath = 'M ' + (cx + arcR) + ' ' + cy + ' A ' + arcR + ' ' + arcR + ' 0 ' + largeArc + ' ' + sweep + ' ' + arcEnd.x + ' ' + arcEnd.y;

  // Label position (midpoint of arc)
  var midAngle = -degrees / 2 * Math.PI / 180;
  var lx = cx + (arcR + 15) * Math.cos(midAngle);
  var ly = cy + (arcR + 15) * Math.sin(midAngle);

  return '<svg viewBox="0 0 200 180" width="220" height="180" xmlns="http://www.w3.org/2000/svg">' +
    '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + armLen) + '" y2="' + cy + '" stroke="#aaa" stroke-width="2"/>' +
    '<line x1="' + cx + '" y1="' + cy + '" x2="' + ex + '" y2="' + ey + '" stroke="#aaa" stroke-width="2"/>' +
    '<path d="' + arcPath + '" fill="none" stroke="#3498db" stroke-width="1.5"/>' +
    '<text x="' + lx + '" y="' + ly + '" fill="#3498db" font-size="14" text-anchor="middle">' + label + '</text>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="#fff"/>' +
    '</svg>';
}

function svgIntersectingLines(angleLabels, givenAngles, pointLabel) {
  // Draw 2 or 3 lines through a central point with labeled angles
  // angleLabels: array of {name, deg} where deg is the angle from the positive x-axis (counter-clockwise)
  // givenAngles: array of {label, startDeg, endDeg, value, color} - arcs to draw
  //   label: angle name e.g. "S₁" (always shown)
  //   value: numeric angle value (shown as "75°") or null/undefined for unknown ("?")
  // pointLabel: optional label for the center point (e.g. "S")
  var cx = 150, cy = 120, armLen = 100;

  function pos(deg, len) {
    var rad = -deg * Math.PI / 180;
    return { x: cx + len * Math.cos(rad), y: cy + len * Math.sin(rad) };
  }

  var lines = "";
  if (angleLabels && angleLabels.length) {
    for (var i = 0; i < angleLabels.length; i++) {
      var p1 = pos(angleLabels[i].deg, armLen);
      var p2 = pos(angleLabels[i].deg + 180, armLen);
      lines += '<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" stroke="#aaa" stroke-width="1.5"/>';
      // Optional line label at the end
      if (angleLabels[i].name) {
        var lp = pos(angleLabels[i].deg, armLen + 12);
        lines += '<text x="' + lp.x + '" y="' + (lp.y + 4) + '" fill="#888" font-size="11" text-anchor="middle">' + angleLabels[i].name + '</text>';
      }
    }
  }

  var arcs = "";
  if (givenAngles && givenAngles.length) {
    for (var j = 0; j < givenAngles.length; j++) {
      var ga = givenAngles[j];
      var arcR = 28 + j * 6;
      var col = ga.color || "#3498db";
      var startRad = -ga.startDeg * Math.PI / 180;
      var endRad = -ga.endDeg * Math.PI / 180;
      var sx = cx + arcR * Math.cos(startRad);
      var sy = cy + arcR * Math.sin(startRad);
      var exx = cx + arcR * Math.cos(endRad);
      var eyy = cy + arcR * Math.sin(endRad);
      var span = ga.endDeg - ga.startDeg;
      if (span < 0) span += 360;
      var large = span > 180 ? 1 : 0;
      arcs += '<path d="M ' + sx + ' ' + sy + ' A ' + arcR + ' ' + arcR + ' 0 ' + large + ' 0 ' + exx + ' ' + eyy + '" fill="none" stroke="' + col + '" stroke-width="1.5"/>';

      // Always show the angle label (e.g. S₁) and value on separate lines
      var midDeg = ga.startDeg + span / 2;
      var midRad = -midDeg * Math.PI / 180;
      var labelDist = arcR + 16;
      var lxx = cx + labelDist * Math.cos(midRad);
      var lyy = cy + labelDist * Math.sin(midRad);

      // Show label name (e.g. "S₁")
      if (ga.label) {
        arcs += '<text x="' + lxx + '" y="' + (lyy - 1) + '" fill="' + col + '" font-size="11" font-weight="bold" text-anchor="middle">' + ga.label + '</text>';
      }
      // Show value underneath the label, or "?" if unknown
      var valText = (ga.value !== null && ga.value !== undefined) ? ga.value + "\u00b0" : "?";
      var valDist = labelDist + 13;
      var vxx = cx + valDist * Math.cos(midRad);
      var vyy = cy + valDist * Math.sin(midRad);
      arcs += '<text x="' + vxx + '" y="' + (vyy - 1) + '" fill="' + col + '" font-size="10" text-anchor="middle">' + valText + '</text>';
    }
  }

  // Center dot
  var center = '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="#fff"/>';
  // Point label (e.g. "S") next to center
  if (pointLabel) {
    center += '<text x="' + (cx + 10) + '" y="' + (cy - 8) + '" fill="#fff" font-size="13" font-weight="bold">' + pointLabel + '</text>';
  }

  return '<svg viewBox="0 0 300 240" width="300" height="240" xmlns="http://www.w3.org/2000/svg">' +
    lines + arcs + center + '</svg>';
}

function svgTriangle(verts, angles, labels, highlight) {
  // verts: [{x,y}, {x,y}, {x,y}]
  // angles: [val1, val2, val3] (null for unknown = show "?")
  // labels: [name1, name2, name3] vertex labels (e.g. ["D","E","F"])
  // highlight: index of the angle to highlight (optional)
  var pts = verts || [{ x: 30, y: 170 }, { x: 270, y: 170 }, { x: 150, y: 30 }];

  var path = 'M ' + pts[0].x + ' ' + pts[0].y + ' L ' + pts[1].x + ' ' + pts[1].y + ' L ' + pts[2].x + ' ' + pts[2].y + ' Z';
  var svg = '<path d="' + path + '" fill="none" stroke="#aaa" stroke-width="2"/>';

  var centX = (pts[0].x + pts[1].x + pts[2].x) / 3;
  var centY = (pts[0].y + pts[1].y + pts[2].y) / 3;

  for (var i = 0; i < 3; i++) {
    var p = pts[i];
    var dx = p.x - centX, dy = p.y - centY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var lx = p.x + (dx / dist) * 20;
    var ly = p.y + (dy / dist) * 20;

    var isHL = (highlight !== undefined && highlight === i);
    var col = isHL ? "#e74c3c" : "#fff";

    // Vertex label (e.g. "D")
    if (labels && labels[i]) {
      svg += '<text x="' + lx + '" y="' + (ly + 5) + '" fill="' + col + '" font-size="14" font-weight="bold" text-anchor="middle">' + labels[i] + '</text>';
    }

    // Angle info near the vertex (inside the triangle): show "∠D = 51°" or "∠E = ?"
    var ix = p.x + (centX - p.x) * 0.28;
    var iy = p.y + (centY - p.y) * 0.28;
    var acol = isHL ? "#e74c3c" : "#3498db";
    if (angles && angles[i] !== null && angles[i] !== undefined) {
      svg += '<text x="' + ix + '" y="' + (iy + 4) + '" fill="' + acol + '" font-size="11" font-weight="bold" text-anchor="middle">' + angles[i] + '\u00b0</text>';
    } else if (labels && labels[i]) {
      // Show "?" for unknown angle
      svg += '<text x="' + ix + '" y="' + (iy + 4) + '" fill="#e74c3c" font-size="11" font-weight="bold" text-anchor="middle">?</text>';
    }
  }

  return '<svg viewBox="0 0 300 200" width="300" height="200" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>';
}

function svgQuadrilateral(verts, angles, labels, highlight) {
  var pts = verts || [{ x: 50, y: 40 }, { x: 260, y: 30 }, { x: 280, y: 170 }, { x: 30, y: 180 }];

  var path = 'M ' + pts[0].x + ' ' + pts[0].y;
  for (var i = 1; i < 4; i++) path += ' L ' + pts[i].x + ' ' + pts[i].y;
  path += ' Z';
  var svg = '<path d="' + path + '" fill="none" stroke="#aaa" stroke-width="2"/>';

  var centX = (pts[0].x + pts[1].x + pts[2].x + pts[3].x) / 4;
  var centY = (pts[0].y + pts[1].y + pts[2].y + pts[3].y) / 4;

  for (var j = 0; j < 4; j++) {
    var p = pts[j];
    var dx = p.x - centX, dy = p.y - centY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var lx = p.x + (dx / dist) * 20;
    var ly = p.y + (dy / dist) * 20;

    var isHL = (highlight !== undefined && highlight === j);
    var col = isHL ? "#e74c3c" : "#fff";

    // Vertex label
    if (labels && labels[j]) {
      svg += '<text x="' + lx + '" y="' + (ly + 5) + '" fill="' + col + '" font-size="14" font-weight="bold" text-anchor="middle">' + labels[j] + '</text>';
    }

    // Angle value inside the shape
    var ix = p.x + (centX - p.x) * 0.24;
    var iy = p.y + (centY - p.y) * 0.24;
    var acol = isHL ? "#e74c3c" : "#3498db";
    if (angles && angles[j] !== null && angles[j] !== undefined) {
      svg += '<text x="' + ix + '" y="' + (iy + 4) + '" fill="' + acol + '" font-size="11" font-weight="bold" text-anchor="middle">' + angles[j] + '\u00b0</text>';
    } else if (labels && labels[j]) {
      svg += '<text x="' + ix + '" y="' + (iy + 4) + '" fill="#e74c3c" font-size="11" font-weight="bold" text-anchor="middle">?</text>';
    }
  }

  return '<svg viewBox="0 0 310 210" width="310" height="210" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>';
}

function svgTwoTriangles(config) {
  // config: {type: "shared_vertex"|"shared_side", labels, angles, highlight}
  var type = config.type || "shared_side";

  if (type === "shared_vertex") {
    // Two triangles sharing a vertex at center (bowtie / vlinderfiguur)
    var svg = '';
    svg += '<path d="M 30 30 L 150 100 L 30 170 Z" fill="none" stroke="#aaa" stroke-width="2"/>';
    svg += '<path d="M 270 30 L 150 100 L 270 170 Z" fill="none" stroke="#aaa" stroke-width="2"/>';

    var allPts = [{ x: 30, y: 30 }, { x: 150, y: 100 }, { x: 30, y: 170 }, { x: 270, y: 30 }, { x: 270, y: 170 }];
    var allLabels = config.labels || ["A", "S", "B", "C", "D"];
    var allAngles = config.angles || [null, null, null, null, null];
    var offsets = [{ x: -16, y: -6 }, { x: 0, y: 20 }, { x: -16, y: 10 }, { x: 16, y: -6 }, { x: 16, y: 10 }];

    for (var i = 0; i < allPts.length; i++) {
      var isHL = (config.highlight !== undefined && config.highlight === i);
      var col = isHL ? "#e74c3c" : "#fff";
      if (allLabels[i]) {
        svg += '<text x="' + (allPts[i].x + offsets[i].x) + '" y="' + (allPts[i].y + offsets[i].y) + '" fill="' + col + '" font-size="13" font-weight="bold" text-anchor="middle">' + allLabels[i] + '</text>';
      }
      // Angle value or "?"
      var acol = isHL ? "#e74c3c" : "#3498db";
      var ax = allPts[i].x + (150 - allPts[i].x) * 0.24;
      var ay = allPts[i].y + (100 - allPts[i].y) * 0.24;
      if (allAngles[i] !== null && allAngles[i] !== undefined) {
        svg += '<text x="' + ax + '" y="' + (ay + 4) + '" fill="' + acol + '" font-size="11" font-weight="bold" text-anchor="middle">' + allAngles[i] + '\u00b0</text>';
      } else if (allLabels[i]) {
        svg += '<text x="' + ax + '" y="' + (ay + 4) + '" fill="#e74c3c" font-size="11" font-weight="bold" text-anchor="middle">?</text>';
      }
    }

    return '<svg viewBox="0 0 300 200" width="300" height="200" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>';
  }

  // shared_side: two triangles sharing a side
  var svg2 = '';
  svg2 += '<path d="M 50 30 L 150 170 L 50 170 Z" fill="none" stroke="#aaa" stroke-width="2"/>';
  svg2 += '<path d="M 250 50 L 150 170 L 50 30 Z" fill="none" stroke="#aaa" stroke-width="2"/>';

  var pts = [{ x: 50, y: 30 }, { x: 50, y: 170 }, { x: 150, y: 170 }, { x: 250, y: 50 }];
  var lbls = config.labels || ["A", "B", "C", "D"];
  var angs = config.angles || [null, null, null, null];
  var offs2 = [{ x: -16, y: -8 }, { x: -16, y: 14 }, { x: 8, y: 18 }, { x: 16, y: -6 }];
  var cx2 = (pts[0].x + pts[1].x + pts[2].x + pts[3].x) / 4;
  var cy2 = (pts[0].y + pts[1].y + pts[2].y + pts[3].y) / 4;

  for (var k = 0; k < pts.length; k++) {
    var isHL2 = (config.highlight !== undefined && config.highlight === k);
    var col2 = isHL2 ? "#e74c3c" : "#fff";
    if (lbls[k]) {
      svg2 += '<text x="' + (pts[k].x + offs2[k].x) + '" y="' + (pts[k].y + offs2[k].y) + '" fill="' + col2 + '" font-size="13" font-weight="bold" text-anchor="middle">' + lbls[k] + '</text>';
    }
    var acol2 = isHL2 ? "#e74c3c" : "#3498db";
    var ix2 = pts[k].x + (cx2 - pts[k].x) * 0.25;
    var iy2 = pts[k].y + (cy2 - pts[k].y) * 0.25;
    if (angs[k] !== null && angs[k] !== undefined) {
      svg2 += '<text x="' + ix2 + '" y="' + (iy2 + 4) + '" fill="' + acol2 + '" font-size="11" font-weight="bold" text-anchor="middle">' + angs[k] + '\u00b0</text>';
    } else if (lbls[k]) {
      svg2 += '<text x="' + ix2 + '" y="' + (iy2 + 4) + '" fill="#e74c3c" font-size="11" font-weight="bold" text-anchor="middle">?</text>';
    }
  }

  return '<svg viewBox="0 0 300 200" width="300" height="200" xmlns="http://www.w3.org/2000/svg">' + svg2 + '</svg>';
}

function svgParallelPerp(ln1, ln2, ln3, rel12, rel23) {
  // Draw 3 lines with relationship symbols
  // rel12/rel23: "perp" or "par"
  var svg = '';
  // Line 1: horizontal
  svg += '<line x1="20" y1="80" x2="280" y2="80" stroke="#aaa" stroke-width="2"/>';
  svg += '<text x="285" y="84" fill="#fff" font-size="13">' + ln1 + '</text>';

  if (rel12 === "perp") {
    // Line 2: vertical through middle
    svg += '<line x1="150" y1="10" x2="150" y2="190" stroke="#aaa" stroke-width="2"/>';
    svg += '<text x="155" y="15" fill="#fff" font-size="13">' + ln2 + '</text>';
    // Right angle symbol
    svg += '<path d="M 150 80 L 150 68 L 162 68" fill="none" stroke="#3498db" stroke-width="1.5"/>';
  } else {
    // Line 2: parallel, below
    svg += '<line x1="20" y1="140" x2="280" y2="140" stroke="#aaa" stroke-width="2"/>';
    svg += '<text x="285" y="144" fill="#fff" font-size="13">' + ln2 + '</text>';
    // Parallel arrows
    svg += '<text x="150" y="106" fill="#3498db" font-size="12" text-anchor="middle">//</text>';
  }

  if (rel23 === "perp") {
    if (rel12 === "perp") {
      // ln3 perpendicular to ln2 (vertical) = horizontal, shifted
      svg += '<line x1="20" y1="140" x2="280" y2="140" stroke="#ccc" stroke-width="2" stroke-dasharray="6,3"/>';
      svg += '<text x="285" y="144" fill="#fff" font-size="13">' + ln3 + '</text>';
      svg += '<path d="M 150 140 L 150 128 L 162 128" fill="none" stroke="#e74c3c" stroke-width="1.5"/>';
    } else {
      // ln3 perp to ln2 (horizontal below) = vertical
      svg += '<line x1="200" y1="10" x2="200" y2="190" stroke="#ccc" stroke-width="2" stroke-dasharray="6,3"/>';
      svg += '<text x="205" y="15" fill="#fff" font-size="13">' + ln3 + '</text>';
      svg += '<path d="M 200 140 L 200 128 L 212 128" fill="none" stroke="#e74c3c" stroke-width="1.5"/>';
    }
  } else {
    if (rel12 === "perp") {
      // ln3 parallel to ln2 (vertical) = also vertical
      svg += '<line x1="220" y1="10" x2="220" y2="190" stroke="#ccc" stroke-width="2" stroke-dasharray="6,3"/>';
      svg += '<text x="225" y="15" fill="#fff" font-size="13">' + ln3 + '</text>';
      svg += '<text x="185" y="55" fill="#e74c3c" font-size="12" text-anchor="middle">//</text>';
    } else {
      // ln3 parallel to ln2 (horizontal) = also horizontal
      svg += '<line x1="20" y1="50" x2="280" y2="50" stroke="#ccc" stroke-width="2" stroke-dasharray="6,3"/>';
      svg += '<text x="285" y="54" fill="#fff" font-size="13">' + ln3 + '</text>';
      svg += '<text x="150" y="92" fill="#e74c3c" font-size="12" text-anchor="middle">//</text>';
    }
  }

  return '<svg viewBox="0 0 310 200" width="310" height="200" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>';
}


// ========== GENERATOR g51 - Lijnen (diagnostic only) ==========

function svgParallelLines(angles, options) {
  var opt = options || {};
  var W = 300, H = 220;
  var y1 = 70, y2 = 150;
  var tiltDeg = opt.tilt || pick([55, 60, 65, 70, 75]);
  var tiltRad = tiltDeg * Math.PI / 180;

  var svg = '';
  svg += '<line x1="20" y1="' + y1 + '" x2="280" y2="' + y1 + '" stroke="#aaa" stroke-width="2"/>';
  svg += '<line x1="20" y1="' + y2 + '" x2="280" y2="' + y2 + '" stroke="#aaa" stroke-width="2"/>';
  svg += '<text x="50" y="' + (y1 - 6) + '" fill="#888" font-size="10">\u203a\u203a</text>';
  svg += '<text x="50" y="' + (y2 - 6) + '" fill="#888" font-size="10">\u203a\u203a</text>';

  if (opt.lineLabels) {
    svg += '<text x="285" y="' + (y1 + 4) + '" fill="#fff" font-size="12">' + (opt.lineLabels[0] || 'l') + '</text>';
    svg += '<text x="285" y="' + (y2 + 4) + '" fill="#fff" font-size="12">' + (opt.lineLabels[1] || 'm') + '</text>';
  }

  var ix1 = 150, iy1 = y1;
  var ix2 = ix1 + (y2 - y1) / Math.tan(tiltRad), iy2 = y2;

  var dx = ix2 - ix1, dy = iy2 - iy1;
  var len = Math.sqrt(dx * dx + dy * dy);
  var ext = 40;
  svg += '<line x1="' + (ix1 - dx / len * ext) + '" y1="' + (iy1 - dy / len * ext) + '" x2="' + (ix2 + dx / len * ext) + '" y2="' + (iy2 + dy / len * ext) + '" stroke="#aaa" stroke-width="2"/>';

  if (opt.transversalLabel) {
    svg += '<text x="' + (ix1 - dx / len * ext - 5) + '" y="' + (iy1 - dy / len * ext - 8) + '" fill="#fff" font-size="12">' + opt.transversalLabel + '</text>';
  }

  var arcR = 22;
  function drawAngleArc(cx, cy, startDeg, endDeg, color, label, value) {
    var span = endDeg - startDeg;
    if (span < 0) span += 360;
    var sRad = startDeg * Math.PI / 180;
    var eRad = endDeg * Math.PI / 180;
    var sx = cx + arcR * Math.cos(sRad);
    var sy = cy - arcR * Math.sin(sRad);
    var ex = cx + arcR * Math.cos(eRad);
    var ey = cy - arcR * Math.sin(eRad);
    var large = span > 180 ? 1 : 0;
    var result = '<path d="M ' + sx + ' ' + sy + ' A ' + arcR + ' ' + arcR + ' 0 ' + large + ' 0 ' + ex + ' ' + ey + '" fill="none" stroke="' + color + '" stroke-width="2"/>';
    var midDeg = startDeg + span / 2;
    var midRad = midDeg * Math.PI / 180;
    var lx = cx + (arcR + 14) * Math.cos(midRad);
    var ly = cy - (arcR + 14) * Math.sin(midRad);
    if (label) {
      result += '<text x="' + lx + '" y="' + (ly + 4) + '" fill="' + color + '" font-size="10" font-weight="bold" text-anchor="middle">' + label + '</text>';
    }
    if (value !== undefined && value !== null) {
      var vx = cx + (arcR + 24) * Math.cos(midRad);
      var vy = cy - (arcR + 24) * Math.sin(midRad);
      result += '<text x="' + vx + '" y="' + (vy + 4) + '" fill="' + color + '" font-size="9" text-anchor="middle">' + value + '\u00b0</text>';
    }
    return result;
  }

  var transUp = 180 - tiltDeg;
  var transDown = 360 - tiltDeg;

  var posMap = {
    1: {cx: ix1, cy: iy1, start: transUp, end: 180},
    2: {cx: ix1, cy: iy1, start: 0, end: transUp},
    3: {cx: ix1, cy: iy1, start: transDown, end: 360},
    4: {cx: ix1, cy: iy1, start: 180, end: transDown},
    5: {cx: ix2, cy: iy2, start: transUp, end: 180},
    6: {cx: ix2, cy: iy2, start: 0, end: transUp},
    7: {cx: ix2, cy: iy2, start: transDown, end: 360},
    8: {cx: ix2, cy: iy2, start: 180, end: transDown}
  };

  if (angles) {
    for (var i = 0; i < angles.length; i++) {
      var ai = angles[i];
      var pm = posMap[ai.pos];
      if (pm) {
        svg += drawAngleArc(pm.cx, pm.cy, pm.start, pm.end, ai.color || "#3498db", ai.label, ai.value);
      }
    }
  }

  svg += '<circle cx="' + ix1 + '" cy="' + iy1 + '" r="3" fill="#fff"/>';
  svg += '<circle cx="' + ix2 + '" cy="' + iy2 + '" r="3" fill="#fff"/>';

  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>';
}

function svgDak(dakHoek, nokHoek) {
  var W = 280, H = 160;
  var baseY = 130, peakY = 30;
  var leftX = 40, rightX = 240, peakX = 140;

  var svg = '';
  svg += '<line x1="' + leftX + '" y1="' + baseY + '" x2="' + rightX + '" y2="' + baseY + '" stroke="#666" stroke-width="1.5" stroke-dasharray="4,3"/>';
  svg += '<line x1="' + leftX + '" y1="' + baseY + '" x2="' + peakX + '" y2="' + peakY + '" stroke="#aaa" stroke-width="2.5"/>';
  svg += '<line x1="' + rightX + '" y1="' + baseY + '" x2="' + peakX + '" y2="' + peakY + '" stroke="#aaa" stroke-width="2.5"/>';
  svg += '<path d="M ' + (leftX + 30) + ' ' + baseY + ' A 30 30 0 0 0 ' + (leftX + 20) + ' ' + (baseY - 22) + '" fill="none" stroke="#3498db" stroke-width="2"/>';
  svg += '<text x="' + (leftX + 38) + '" y="' + (baseY - 12) + '" fill="#3498db" font-size="11" font-weight="bold">' + dakHoek + '\u00b0</text>';
  svg += '<path d="M ' + (peakX - 16) + ' ' + (peakY + 20) + ' A 20 20 0 0 1 ' + (peakX + 16) + ' ' + (peakY + 20) + '" fill="none" stroke="#e74c3c" stroke-width="2"/>';
  svg += '<text x="' + peakX + '" y="' + (peakY + 38) + '" fill="#e74c3c" font-size="11" font-weight="bold" text-anchor="middle">' + nokHoek + '\u00b0</text>';
  svg += '<text x="' + leftX + '" y="' + (baseY + 16) + '" fill="#888" font-size="10" text-anchor="middle">A</text>';
  svg += '<text x="' + rightX + '" y="' + (baseY + 16) + '" fill="#888" font-size="10" text-anchor="middle">B</text>';
  svg += '<text x="' + peakX + '" y="' + (peakY - 8) + '" fill="#888" font-size="10" text-anchor="middle">nok</text>';

  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>';
}

function svgVerkeersbord(angles, labels) {
  var W = 200, H = 200;
  var svg = '';
  svg += '<path d="M 100 20 L 30 170 L 170 170 Z" fill="none" stroke="#e74c3c" stroke-width="3"/>';
  var positions = [{x: 100, y: 52}, {x: 55, y: 152}, {x: 145, y: 152}];
  for (var i = 0; i < 3; i++) {
    var text = angles[i] !== null ? angles[i] + "\u00b0" : "?";
    var col = angles[i] !== null ? "#3498db" : "#e74c3c";
    svg += '<text x="' + positions[i].x + '" y="' + positions[i].y + '" fill="' + col + '" font-size="12" font-weight="bold" text-anchor="middle">' + text + '</text>';
  }
  if (labels) {
    var labelPos = [{x: 100, y: 14}, {x: 20, y: 180}, {x: 180, y: 180}];
    for (var j = 0; j < labels.length; j++) {
      svg += '<text x="' + labelPos[j].x + '" y="' + labelPos[j].y + '" fill="#fff" font-size="11" text-anchor="middle">' + labels[j] + '</text>';
    }
  }
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" xmlns="http://www.w3.org/2000/svg">' + svg + '</svg>';
}

function g51() {
  var ln = pick(["k", "l", "m", "n", "p", "q", "r", "s"]);
  var ln2; do { ln2 = pick(["k", "l", "m", "n", "p", "q", "r", "s"]); } while (ln2 === ln);
  var ln3; do { ln3 = pick(["k", "l", "m", "n", "p", "q", "r", "s"]); } while (ln3 === ln || ln3 === ln2);
  var pt1 = pick(["A", "B", "C", "D", "E", "P", "Q", "R"]);
  var pt2; do { pt2 = pick(["A", "B", "C", "D", "E", "P", "Q", "R"]); } while (pt2 === pt1);

  var t = rand(1, 10);

  if (t === 1) {
    // Transitive: a perp b, c par a => c perp b
    var img = svgParallelPerp(ln, ln2, ln3, "perp", "par");
    return {
      q: "Gegeven: " + ln + " \u22a5 " + ln2 + " en " + ln3 + " // " + ln + ".\nWat geldt voor " + ln3 + " en " + ln2 + "?",
      a: ln3 + " \u22a5 " + ln2,
      t: "choice",
      o: [ln3 + " \u22a5 " + ln2, ln3 + " // " + ln2, ln3 + " snijdt " + ln2 + " schuin", "Niets te zeggen"].sort(function () { return Math.random() - 0.5; }),
      h: "Als " + ln + " \u22a5 " + ln2 + " en " + ln3 + " // " + ln + ", dan " + ln3 + " \u22a5 " + ln2,
      svg: img
    };
  }
  if (t === 2) {
    // Transitive: a par b, c par a => c par b
    var img = svgParallelPerp(ln, ln2, ln3, "par", "par");
    return {
      q: "Gegeven: " + ln + " // " + ln2 + " en " + ln3 + " // " + ln + ".\nWat geldt voor " + ln3 + " en " + ln2 + "?",
      a: ln3 + " // " + ln2,
      t: "choice",
      o: [ln3 + " // " + ln2, ln3 + " \u22a5 " + ln2, ln3 + " snijdt " + ln2, "Niets te zeggen"].sort(function () { return Math.random() - 0.5; }),
      h: "Als " + ln + " // " + ln2 + " en " + ln3 + " // " + ln + ", dan " + ln3 + " // " + ln2,
      svg: img
    };
  }
  if (t === 3) {
    // Transitive: a perp b, c perp b => a par c
    var img = svgParallelPerp(ln2, ln, ln3, "perp", "perp");
    return {
      q: "Gegeven: " + ln + " \u22a5 " + ln2 + " en " + ln3 + " \u22a5 " + ln2 + ".\nWat geldt voor " + ln + " en " + ln3 + "?",
      a: ln + " // " + ln3,
      t: "choice",
      o: [ln + " // " + ln3, ln + " \u22a5 " + ln3, ln + " snijdt " + ln3 + " schuin", "Niets te zeggen"].sort(function () { return Math.random() - 0.5; }),
      h: "Beide loodrecht op " + ln2 + " \u2192 " + ln + " // " + ln3,
      svg: img
    };
  }
  if (t === 4) {
    // Given perp+par chain, determine final relation
    var ln4; do { ln4 = pick(["k", "l", "m", "n", "p", "q", "r", "s"]); } while (ln4 === ln || ln4 === ln2 || ln4 === ln3);
    return {
      q: ln + " \u22a5 " + ln2 + ", " + ln2 + " // " + ln3 + " en " + ln3 + " \u22a5 " + ln4 + ".\nWat geldt voor " + ln + " en " + ln4 + "?",
      a: ln + " // " + ln4,
      t: "choice",
      o: [ln + " // " + ln4, ln + " \u22a5 " + ln4, "Ze snijden schuin", "Niets te zeggen"].sort(function () { return Math.random() - 0.5; }),
      h: ln + " \u22a5 " + ln2 + " en " + ln2 + " // " + ln3 + " \u2192 " + ln + " \u22a5 " + ln3 + ".\n" + ln + " \u22a5 " + ln3 + " en " + ln3 + " \u22a5 " + ln4 + " \u2192 " + ln + " // " + ln4
    };
  }
  if (t === 5) {
    var c3 = pick(["lijnstuk", "lijn", "halve lijn"]);
    var ep = c3 === "lijnstuk" ? 2 : c3 === "lijn" ? 0 : 1;
    var stated = pick([0, 1, 2]);
    return {
      q: "Waar of niet waar: een " + c3 + " heeft " + stated + " eindpunt(en).",
      a: stated === ep ? "Waar" : "Niet waar",
      t: "choice",
      o: ["Waar", "Niet waar"].sort(function () { return Math.random() - 0.5; }),
      h: c3 + " heeft " + ep + " eindpunt(en)"
    };
  }
  if (t === 6) {
    return {
      q: ln + " \u22a5 " + ln2 + " en " + ln + " // " + ln3 + ".\n" + ln3 + " staat op " + ln2 + "...",
      a: "Loodrecht (90\u00b0)",
      t: "choice",
      o: ["Loodrecht (90\u00b0)", "Evenwijdig", "Schuin (45\u00b0)", "Dat kun je niet weten"].sort(function () { return Math.random() - 0.5; }),
      h: ln + " \u22a5 " + ln2 + " en " + ln3 + " // " + ln + " \u2192 " + ln3 + " \u22a5 " + ln2,
      svg: svgParallelPerp(ln, ln2, ln3, "perp", "par")
    };
  }
  if (t === 7) {
    // 4 lines, chain of relations
    var ln4b; do { ln4b = pick(["k", "l", "m", "n", "p", "q", "r", "s"]); } while (ln4b === ln || ln4b === ln2 || ln4b === ln3);
    return {
      q: ln + " // " + ln2 + ", " + ln2 + " \u22a5 " + ln3 + " en " + ln3 + " // " + ln4b + ".\nWat geldt voor " + ln + " en " + ln4b + "?",
      a: ln + " \u22a5 " + ln4b,
      t: "choice",
      o: [ln + " \u22a5 " + ln4b, ln + " // " + ln4b, "Ze snijden schuin", "Niets te zeggen"].sort(function () { return Math.random() - 0.5; }),
      h: ln + " // " + ln2 + " en " + ln2 + " \u22a5 " + ln3 + " \u2192 " + ln + " \u22a5 " + ln3 + ".\n" + ln + " \u22a5 " + ln3 + " en " + ln3 + " // " + ln4b + " \u2192 " + ln + " \u22a5 " + ln4b
    };
  }
  if (t === 8) {
    // Both perpendicular to the same line → parallel
    return {
      q: ln + " \u22a5 " + ln2 + " en " + ln3 + " \u22a5 " + ln + ".\nWat geldt voor " + ln2 + " en " + ln3 + "?",
      a: ln2 + " // " + ln3,
      t: "choice",
      o: [ln2 + " // " + ln3, ln2 + " \u22a5 " + ln3, "Niets te zeggen", "Ze zijn gelijk"].sort(function () { return Math.random() - 0.5; }),
      h: "Beide loodrecht op dezelfde lijn " + ln + " \u2192 " + ln2 + " // " + ln3,
      svg: svgParallelPerp(ln, ln2, ln3, "perp", "perp")
    };
  }
  if (t === 9) {
    return {
      q: "Lijn " + ln + " \u22a5 lijn " + ln2 + ". Hoeveel graden is de hoek tussen " + ln + " en " + ln2 + "?",
      a: "90\u00b0",
      t: "choice",
      o: ["90\u00b0", "180\u00b0", "45\u00b0", "0\u00b0"].sort(function () { return Math.random() - 0.5; }),
      h: "Loodrecht = 90\u00b0"
    };
  }
  // t === 10
  // Reverse reasoning
  return {
    q: "Twee lijnen snijden elkaar in een hoek van 90\u00b0.\nWelk symbool hoort daarbij?",
    a: "\u22a5",
    t: "choice",
    o: ["\u22a5", "//", "=", "\u2248"].sort(function () { return Math.random() - 0.5; }),
    h: "90\u00b0 = loodrecht = \u22a5"
  };
}


// ========== GENERATOR g52 - Hoeken en graden (diagnostic only) ==========

function g52() {
  var t = rand(1, 12);

  // Helper: compute clock angle given hours (12h) and minutes
  function clockAngle(h, m) {
    var minA = m * 6; // minute hand angle from 12
    var hourA = (h % 12) * 30 + m * 0.5; // hour hand angle from 12
    var diff = Math.abs(hourA - minA);
    if (diff > 180) diff = 360 - diff;
    return diff;
  }

  if (t === 1) {
    // "half elf" = 10:30 -> small hand between 10 and 11
    var h = 10, m = 30;
    var angle = clockAngle(h, m);
    return {
      q: "Bereken de hoek tussen de wijzers van de klok om half elf.",
      a: angle,
      h: "Kleine wijzer: 10\u00d730\u00b0 + 30\u00d70,5\u00b0 = 315\u00b0.\nGrote wijzer: 30\u00d76\u00b0 = 180\u00b0.\nVerschil: |315\u00b0 \u2212 180\u00b0| = " + angle + "\u00b0",
      svg: svgClock(h, m)
    };
  }
  if (t === 2) {
    // 21:45 = 9:45
    var h = 9, m = 45;
    var angle = clockAngle(h, m);
    return {
      q: "Bereken de hoek tussen de wijzers van de klok om 21:45.",
      a: angle,
      h: "Kleine wijzer: 9\u00d730\u00b0 + 45\u00d70,5\u00b0 = 292,5\u00b0.\nGrote wijzer: 45\u00d76\u00b0 = 270\u00b0.\nVerschil: |292,5 \u2212 270| = " + angle + "\u00b0",
      svg: svgClock(h, m)
    };
  }
  if (t === 3) {
    // "half negen" = 8:30
    var h = 8, m = 30;
    var angle = clockAngle(h, m);
    return {
      q: "Bereken de hoek tussen de wijzers van de klok om half negen.",
      a: angle,
      h: "Kleine wijzer: 8\u00d730\u00b0 + 30\u00d70,5\u00b0 = 255\u00b0.\nGrote wijzer: 30\u00d76\u00b0 = 180\u00b0.\nVerschil: |255 \u2212 180| = " + angle + "\u00b0",
      svg: svgClock(h, m)
    };
  }
  if (t === 4) {
    // Angle classification: which is scherp/stomp/recht?
    var angles = [pick([10, 25, 35, 45, 55, 65, 75, 89]), pick([91, 100, 120, 135, 150, 170, 179]), 180, 90];
    var askType = pick(["scherp", "stomp"]);
    var correctIdx = askType === "scherp" ? 0 : 1;
    var opts = [angles[0] + "\u00b0", angles[1] + "\u00b0", angles[2] + "\u00b0", angles[3] + "\u00b0"].sort(function () { return Math.random() - 0.5; });
    return {
      q: "Welke hoek is " + askType + "?",
      a: angles[correctIdx] + "\u00b0",
      t: "choice",
      o: opts,
      h: askType === "scherp" ? "Scherp = tussen 0\u00b0 en 90\u00b0 \u2192 " + angles[0] + "\u00b0" : "Stomp = tussen 90\u00b0 en 180\u00b0 \u2192 " + angles[1] + "\u00b0",
      svg: svgAngle(angles[correctIdx], angles[correctIdx] + "\u00b0")
    };
  }
  if (t === 5) {
    // Give an example of a stompe hoek → numeric, check 90 < answer < 180
    return {
      q: "Geef een voorbeeld van een stompe hoek (vul een getal in graden in).",
      a: "stomp_check",
      t: "stomp_check",
      h: "Een stompe hoek is groter dan 90\u00b0 en kleiner dan 180\u00b0."
    };
  }
  if (t === 6) {
    // Complementary angles: ∠A + ∠B = 90°
    var compA = pick([15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75]);
    var compB = 90 - compA;
    return {
      q: "Twee complementaire hoeken tellen op tot 90\u00b0.\nAls \u2220A = " + compA + "\u00b0, hoeveel is \u2220B?",
      a: compB,
      h: "Complementair: \u2220B = 90\u00b0 \u2212 " + compA + "\u00b0 = " + compB + "\u00b0"
    };
  }
  if (t === 7) {
    // Classify the clock angle
    var h = pick([1, 2, 3, 4, 5, 7, 8, 10, 11]);
    var m = pick([0, 15, 30, 45]);
    var angle = clockAngle(h, m);
    var soort = angle < 90 ? "scherp" : angle === 90 ? "recht" : angle === 180 ? "gestrekt" : "stomp";
    var timeStr = h + ":" + (m < 10 ? "0" + m : m);
    return {
      q: "De hoek tussen de wijzers om " + timeStr + " is " + angle + "\u00b0.\nIs deze hoek scherp, recht, stomp of gestrekt?",
      a: soort,
      t: "choice",
      o: ["scherp", "recht", "stomp", "gestrekt"].sort(function () { return Math.random() - 0.5; }),
      h: angle + "\u00b0 \u2192 " + soort,
      svg: svgClock(h, m)
    };
  }
  if (t === 8) {
    // How many degrees does the big hand rotate in N minutes?
    var min = pick([7, 12, 17, 23, 35, 42, 48]);
    var graden = min * 6;
    return {
      q: "Over hoeveel graden draait de grote wijzer in " + min + " minuten?",
      a: graden,
      h: "Grote wijzer: 6\u00b0 per minuut.\n" + min + " \u00d7 6\u00b0 = " + graden + "\u00b0"
    };
  }
  if (t === 9) {
    // How many degrees does the small hand rotate in N minutes?
    var min = pick([12, 20, 24, 36, 40, 48, 54, 60, 90, 120]);
    var graden = min * 0.5;
    return {
      q: "Over hoeveel graden draait de kleine wijzer in " + min + " minuten?",
      a: graden,
      h: "Kleine wijzer: 0,5\u00b0 per minuut.\n" + min + " \u00d7 0,5\u00b0 = " + graden + "\u00b0"
    };
  }
  if (t === 10) {
    // Angle classification edge cases
    var angle = pick([89, 91, 1, 179, 90, 180]);
    var naam;
    if (angle < 90) naam = "scherp";
    else if (angle === 90) naam = "recht";
    else if (angle < 180) naam = "stomp";
    else naam = "gestrekt";
    return {
      q: "Een hoek van " + angle + "\u00b0 is een ... hoek.",
      a: naam,
      t: "choice",
      o: ["scherp", "recht", "stomp", "gestrekt"].sort(function () { return Math.random() - 0.5; }),
      h: angle + "\u00b0 \u2192 " + naam,
      svg: (angle < 180) ? svgAngle(angle, angle + "\u00b0") : ""
    };
  }
  if (t === 11) {
    // Reverse: given angle type and approximate position, what's the time?
    var h = pick([1, 2, 4, 5, 7, 8, 10, 11]);
    var angle = clockAngle(h, 0);
    return {
      q: "Om " + h + " uur (precies) is de hoek tussen de wijzers " + angle + "\u00b0.\nDe kleine wijzer draait dan in 20 minuten nog ... graden extra.",
      a: 10,
      h: "Kleine wijzer: 0,5\u00b0/min \u00d7 20 min = 10\u00b0",
      svg: svgClock(h, 0)
    };
  }
  // t === 12
  // Combined: compute angle at a non-standard time (only even minutes for whole-number angles)
  var h = pick([2, 3, 5, 7, 10, 11]);
  var m = pick([4, 8, 10, 14, 16, 20, 22, 26, 34, 38, 40, 44, 46, 50, 52, 56]);
  var angle = clockAngle(h, m);
  var timeStr = h + ":" + (m < 10 ? "0" + m : m);
  return {
    q: "Om " + timeStr + " staat de kleine wijzer op " + (h * 30 + m * 0.5) + "\u00b0 en de grote wijzer op " + (m * 6) + "\u00b0 (gemeten vanaf 12).\nBereken de hoek tussen de wijzers.",
    a: angle,
    h: "Verschil: |" + (h * 30 + m * 0.5) + "\u00b0 \u2212 " + (m * 6) + "\u00b0| = " + Math.abs(h * 30 + m * 0.5 - m * 6) + "\u00b0" + (Math.abs(h * 30 + m * 0.5 - m * 6) > 180 ? "\n> 180\u00b0, dus 360\u00b0 \u2212 " + Math.abs(h * 30 + m * 0.5 - m * 6) + "\u00b0 = " + angle + "\u00b0" : ""),
    svg: svgClock(h, m)
  };
}


// ========== GENERATOR g53 - Hoeken meten (diagnostic only) ==========

function g53() {
  var t = rand(1, 10);

  if (t <= 3) {
    // Read from geodriehoek: two possible values, decide based on angle type
    var scherp = rand(15, 85);
    var stomp = 180 - scherp;
    var isStomp = rand(0, 1);
    var type = isStomp ? "stomp" : "scherp";
    var ans = isStomp ? stomp : scherp;
    return {
      q: "Je leest " + scherp + "\u00b0 en " + stomp + "\u00b0 af op de geodriehoek.\nJe ziet dat de hoek " + type + " is.\nWat is de juiste maat?",
      a: ans + "\u00b0",
      t: "choice",
      o: [scherp + "\u00b0", stomp + "\u00b0", "90\u00b0", "180\u00b0"].sort(function () { return Math.random() - 0.5; }),
      h: type + " \u2192 " + (isStomp ? "grotere" : "kleinere") + " getal = " + ans + "\u00b0",
      svg: svgAngle(ans, ans + "\u00b0")
    };
  }
  if (t === 4) {
    // Given one reading, calculate the other
    var s = rand(10, 80);
    var st = 180 - s;
    return {
      q: "Je leest " + s + "\u00b0 af op de geodriehoek.\nWat is het andere getal bij hetzelfde streepje?",
      a: st,
      h: "De twee getallen tellen op tot 180\u00b0: 180\u00b0 \u2212 " + s + "\u00b0 = " + st + "\u00b0"
    };
  }
  if (t === 5) {
    // Overstrekte hoek
    var binnenhoek = rand(20, 160);
    var overstrekt = 360 - binnenhoek;
    return {
      q: "De binnenhoek is " + binnenhoek + "\u00b0.\nHoe groot is de overstrekte hoek (de buitenboog)?",
      a: overstrekt,
      h: "Overstrekte hoek = 360\u00b0 \u2212 " + binnenhoek + "\u00b0 = " + overstrekt + "\u00b0",
      svg: svgAngle(binnenhoek, binnenhoek + "\u00b0")
    };
  }
  if (t === 6) {
    return {
      q: "Kun je met een geodriehoek een hoek van 200\u00b0 rechtstreeks meten?",
      a: "Nee, de gradenboog gaat tot 180\u00b0",
      t: "choice",
      o: ["Nee, de gradenboog gaat tot 180\u00b0", "Ja, met de buitenschaal", "Ja, door twee keer te meten", "Ja, met de 0 aan de andere kant"].sort(function () { return Math.random() - 0.5; }),
      h: "Geodriehoek: 0\u00b0 \u2013 180\u00b0. Voor hoeken > 180\u00b0: meet de binnenhoek en trek af van 360\u00b0."
    };
  }
  if (t === 7) {
    // Measure overstrekte hoek indirectly
    var overstrekt = rand(190, 340);
    var binnenhoek = 360 - overstrekt;
    return {
      q: "Je wilt een hoek van " + overstrekt + "\u00b0 meten.\nJe meet de binnenhoek en trekt af van 360\u00b0.\nDe binnenhoek is...",
      a: binnenhoek,
      h: "Binnenhoek = 360\u00b0 \u2212 " + overstrekt + "\u00b0 = " + binnenhoek + "\u00b0"
    };
  }
  if (t === 8) {
    // Determine what kind of angle from the reading
    var scherp = rand(15, 85);
    var stomp = 180 - scherp;
    var letter = pick(["A", "B", "C", "D", "P", "Q"]);
    var isStomp = rand(0, 1);
    var ans = isStomp ? stomp : scherp;
    var soort = ans < 90 ? "scherp" : ans === 90 ? "recht" : "stomp";
    return {
      q: "\u2220" + letter + " is " + soort + ". Je leest af: " + scherp + "\u00b0 en " + stomp + "\u00b0.\nHoe groot is \u2220" + letter + "?",
      a: ans + "\u00b0",
      t: "choice",
      o: [scherp + "\u00b0", stomp + "\u00b0", "90\u00b0", "180\u00b0"].sort(function () { return Math.random() - 0.5; }),
      h: soort + " \u2192 " + ans + "\u00b0",
      svg: svgAngle(ans, "\u2220" + letter + " = ?")
    };
  }
  if (t === 9) {
    // Combined: measure angle, then compute supplement
    var angle = rand(30, 150);
    var supp = 180 - angle;
    var letter = pick(["X", "Y", "Z", "P"]);
    return {
      q: "\u2220" + letter + " = " + angle + "\u00b0.\n\u2220" + letter + " en \u2220" + letter + "' samen vormen een gestrekte hoek.\nHoe groot is \u2220" + letter + "'?",
      a: supp,
      h: "Gestrekte hoek = 180\u00b0.\n\u2220" + letter + "' = 180\u00b0 \u2212 " + angle + "\u00b0 = " + supp + "\u00b0",
      svg: svgAngle(angle, angle + "\u00b0")
    };
  }
  // t === 10
  // Tricky: two adjacent angles, measure one, calculate the other
  var a1 = rand(20, 70);
  var a2 = rand(20, 70);
  var total = a1 + a2;
  return {
    q: "Twee hoeken liggen naast elkaar. De totale hoek is " + total + "\u00b0.\nDe eerste hoek meet " + a1 + "\u00b0.\nHoe groot is de tweede hoek?",
    a: a2,
    h: total + "\u00b0 \u2212 " + a1 + "\u00b0 = " + a2 + "\u00b0",
    svg: svgAngle(total, total + "\u00b0")
  };
}


// ========== GENERATOR g54 - Hoeken tekenen (diagnostic only) ==========

function g54() {
  var pts = pick([["A", "B", "C"], ["D", "E", "F"], ["P", "Q", "R"], ["K", "L", "M"]]);
  var t = rand(1, 10);

  if (t === 1) {
    // Calculate third angle of a triangle
    var a1 = rand(30, 80);
    var a2 = rand(30, 80);
    var a3 = 180 - a1 - a2;
    if (a3 <= 0) return g54();
    return {
      q: "Je tekent \u25b3" + pts.join("") + " met \u2220" + pts[0] + " = " + a1 + "\u00b0 en \u2220" + pts[1] + " = " + a2 + "\u00b0.\nHoe groot wordt \u2220" + pts[2] + "?",
      a: a3,
      h: "180\u00b0 \u2212 " + a1 + "\u00b0 \u2212 " + a2 + "\u00b0 = " + a3 + "\u00b0",
      svg: svgTriangle(null, [a1, a2, a3], pts, 2)
    };
  }
  if (t === 2) {
    // Impossible triangle: angles sum >= 180
    var a1 = rand(90, 140);
    var a2 = rand(90, 140);
    return {
      q: "Kun je een driehoek tekenen met \u2220" + pts[0] + " = " + a1 + "\u00b0 en \u2220" + pts[1] + " = " + a2 + "\u00b0?",
      a: "Nee, samen al \u2265 180\u00b0",
      t: "choice",
      o: ["Nee, samen al \u2265 180\u00b0", "Ja, altijd mogelijk", "Ja, als je een passer gebruikt", "Alleen als \u2220" + pts[2] + " = 0\u00b0"].sort(function () { return Math.random() - 0.5; }),
      h: a1 + "\u00b0 + " + a2 + "\u00b0 = " + (a1 + a2) + "\u00b0 \u2265 180\u00b0 \u2192 niet mogelijk"
    };
  }
  if (t === 3) {
    // Valid triangle check
    var a1 = rand(30, 80);
    var a2 = rand(30, 80);
    var a3 = 180 - a1 - a2;
    if (a3 <= 0) return g54();
    return {
      q: "Een driehoek heeft hoeken van " + a1 + "\u00b0, " + a2 + "\u00b0 en " + a3 + "\u00b0.\nIs dat een geldige driehoek?",
      a: "Ja (som = 180\u00b0)",
      t: "choice",
      o: ["Ja (som = 180\u00b0)", "Nee (som \u2260 180\u00b0)", "Alleen als alle hoeken scherp", "Dat hangt af van de zijden"].sort(function () { return Math.random() - 0.5; }),
      h: a1 + "\u00b0 + " + a2 + "\u00b0 + " + a3 + "\u00b0 = 180\u00b0 \u2713",
      svg: svgTriangle(null, [a1, a2, a3], pts)
    };
  }
  if (t === 4) {
    // Invalid triangle (bad sum)
    var bad1 = rand(50, 100);
    var bad2 = rand(50, 100);
    var bad3 = rand(50, 100);
    if (bad1 + bad2 + bad3 === 180) return g54();
    return {
      q: "Een driehoek heeft hoeken van " + bad1 + "\u00b0, " + bad2 + "\u00b0 en " + bad3 + "\u00b0.\nIs dat een geldige driehoek?",
      a: "Nee (som \u2260 180\u00b0)",
      t: "choice",
      o: ["Ja (som = 180\u00b0)", "Nee (som \u2260 180\u00b0)"].sort(function () { return Math.random() - 0.5; }),
      h: bad1 + "\u00b0 + " + bad2 + "\u00b0 + " + bad3 + "\u00b0 = " + (bad1 + bad2 + bad3) + "\u00b0 \u2260 180\u00b0"
    };
  }
  if (t === 5) {
    // Scherp or stomp triangle?
    var a1 = rand(20, 70);
    var a2 = rand(20, 70);
    var a3 = 180 - a1 - a2;
    if (a3 <= 0) return g54();
    var soort = (a3 > 90 || a2 > 90 || a1 > 90) ? "stomp" : (a1 === 90 || a2 === 90 || a3 === 90) ? "recht" : "scherp";
    return {
      q: "Je tekent een driehoek met hoeken " + a1 + "\u00b0, " + a2 + "\u00b0 en " + a3 + "\u00b0.\nDit is een ... driehoek.",
      a: soort,
      t: "choice",
      o: ["scherp", "stomp", "recht", "gelijkzijdig"].sort(function () { return Math.random() - 0.5; }),
      h: "Alle hoeken < 90\u00b0 \u2192 scherp. E\u00e9n hoek > 90\u00b0 \u2192 stomp. E\u00e9n hoek = 90\u00b0 \u2192 recht.",
      svg: svgTriangle(null, [a1, a2, a3], pts)
    };
  }
  if (t === 6) {
    // Can you draw a triangle with two obtuse angles?
    return {
      q: "Kun je een driehoek tekenen met twee stompe hoeken?",
      a: "Nee, twee stompe hoeken > 180\u00b0",
      t: "choice",
      o: ["Nee, twee stompe hoeken > 180\u00b0", "Ja, als de derde scherp is", "Ja, altijd", "Alleen bij een gelijkbenige driehoek"].sort(function () { return Math.random() - 0.5; }),
      h: "Twee hoeken > 90\u00b0 geven samen > 180\u00b0. Onmogelijk!"
    };
  }
  if (t === 7) {
    // Can you draw with 2 right angles?
    return {
      q: "Kun je een driehoek tekenen met twee rechte hoeken (90\u00b0)?",
      a: "Nee, samen al 180\u00b0",
      t: "choice",
      o: ["Nee, samen al 180\u00b0", "Ja, de derde is 0\u00b0", "Ja, altijd", "Alleen met een passer"].sort(function () { return Math.random() - 0.5; }),
      h: "90\u00b0 + 90\u00b0 = 180\u00b0, geen ruimte voor derde hoek."
    };
  }
  if (t === 8) {
    // Which step has the trap?
    var angle = rand(95, 165);
    return {
      q: "Je wilt \u2220" + pick(["D", "E", "F", "G"]) + " = " + angle + "\u00b0 tekenen.\nWaar moet je extra opletten bij het aflezen?",
      a: "Kies de stompe kant (> 90\u00b0)",
      t: "choice",
      o: ["Kies de stompe kant (> 90\u00b0)", "Kies de scherpe kant (< 90\u00b0)", "Het maakt niet uit", "Lees altijd het kleinste getal"].sort(function () { return Math.random() - 0.5; }),
      h: angle + "\u00b0 > 90\u00b0 \u2192 stompe kant kiezen"
    };
  }
  if (t === 9) {
    // Triangle: given constraints, find if it's possible and what angles
    var a1 = rand(50, 80);
    // second angle is exactly equal to first (isoceles triangle)
    var a2 = a1;
    var a3 = 180 - 2 * a1;
    if (a3 <= 0) return g54();
    return {
      q: "\u25b3" + pts.join("") + " is gelijkbenig met \u2220" + pts[0] + " = \u2220" + pts[1] + " = " + a1 + "\u00b0.\nBereken \u2220" + pts[2] + ".",
      a: a3,
      h: "180\u00b0 \u2212 2\u00d7" + a1 + "\u00b0 = " + a3 + "\u00b0",
      svg: svgTriangle(null, [a1, a1, a3], pts, 2)
    };
  }
  // t === 10
  // Given top angle of isoceles, find base angles
  var top = rand(20, 120);
  if (top % 2 !== 0) top++;
  var basis = (180 - top) / 2;
  return {
    q: "\u25b3" + pts.join("") + " is gelijkbenig met tophoek \u2220" + pts[2] + " = " + top + "\u00b0.\nBereken de basishoeken.",
    a: basis,
    h: "(180\u00b0 \u2212 " + top + "\u00b0) \u00f7 2 = " + basis + "\u00b0",
    svg: svgTriangle(null, [basis, basis, top], pts)
  };
}


// ========== GENERATOR g55 - Hoeken berekenen (diagnostic only) ==========

function g55() {
  var letters = pick([["A", "B", "C"], ["P", "Q", "R"], ["S", "T", "U"], ["D", "E", "F"]]);
  var t = rand(1, 22);

  if (t === 1) {
    // Two lines intersect at S. Four angles formed. Given one, find others via overstaande + gestrekte hoek.
    var s = pick(["S", "P", "A", "M"]);
    var a1 = rand(25, 155);
    var a2 = 180 - a1;
    var imgLines = [{ deg: 0, name: "" }, { deg: a1, name: "" }];
    var imgAngles = [
      { label: s + "\u2081", startDeg: 0, endDeg: a1, value: a1, color: "#3498db" },
      { label: s + "\u2082 = ?", startDeg: a1, endDeg: 180, value: null, color: "#e74c3c" }
    ];
    return {
      q: "Twee lijnen snijden in punt " + s + ".\n\u2220" + s + "\u2081 = " + a1 + "\u00b0.\nBereken \u2220" + s + "\u2082 (naastliggend).",
      a: a2,
      h: "Gestrekte hoek: \u2220" + s + "\u2082 = 180\u00b0 \u2212 " + a1 + "\u00b0 = " + a2 + "\u00b0",
      svg: svgIntersectingLines(imgLines, imgAngles, s)
    };
  }
  if (t === 2) {
    // Overstaande hoeken: given one angle, find the opposite
    var s = pick(["S", "P", "A", "M"]);
    var a1 = rand(20, 160);
    var imgLines = [{ deg: 0, name: "" }, { deg: a1, name: "" }];
    var imgAngles = [
      { label: s + "\u2081", startDeg: 0, endDeg: a1, value: a1, color: "#3498db" },
      { label: s + "\u2083 = ?", startDeg: 180, endDeg: 180 + a1, value: null, color: "#e74c3c" }
    ];
    return {
      q: "Twee lijnen snijden in punt " + s + ".\n\u2220" + s + "\u2081 = " + a1 + "\u00b0.\n\u2220" + s + "\u2083 is de overstaande hoek.\nBereken \u2220" + s + "\u2083.",
      a: a1,
      h: "Overstaande hoeken zijn even groot: \u2220" + s + "\u2083 = " + a1 + "\u00b0",
      svg: svgIntersectingLines(imgLines, imgAngles, s)
    };
  }
  if (t === 3) {
    // Multi-step: given angle, find adjacent via gestrekte hoek, then confirm overstaande
    var s = pick(["S", "P", "A"]);
    var a1 = rand(30, 150);
    var a2 = 180 - a1;
    var imgLines = [{ deg: 0, name: "" }, { deg: a1, name: "" }];
    var imgAngles = [
      { label: s + "\u2081", startDeg: 0, endDeg: a1, value: a1, color: "#3498db" },
      { label: s + "\u2082", startDeg: a1, endDeg: 180, value: null, color: "#888" },
      { label: s + "\u2084 = ?", startDeg: 180 + a1, endDeg: 360, value: null, color: "#e74c3c" }
    ];
    return {
      q: "Twee lijnen snijden in punt " + s + ".\n\u2220" + s + "\u2081 = " + a1 + "\u00b0.\nBereken \u2220" + s + "\u2084 (overstaand aan \u2220" + s + "\u2082).",
      a: a1,
      h: "\u2220" + s + "\u2082 = 180\u00b0 \u2212 " + a1 + "\u00b0 = " + a2 + "\u00b0.\n\u2220" + s + "\u2084 is overstaand aan \u2220" + s + "\u2082, maar ook: \u2220" + s + "\u2084 = 180\u00b0 \u2212 \u2220" + s + "\u2082 = 180\u00b0 \u2212 " + a2 + "\u00b0 = " + a1 + "\u00b0.\nOf: \u2220" + s + "\u2084 is overstaand aan \u2220" + s + "\u2081 = " + a1 + "\u00b0.",
      svg: svgIntersectingLines(imgLines, imgAngles, s)
    };
  }
  if (t === 4) {
    // Three lines through a point, 6 angles. Given 2 angles, find a third.
    // Lines at 0, a, b degrees. Angles between consecutive lines.
    var s = pick(["S", "A", "P"]);
    var seg1 = rand(25, 65); // angle between line1 and line2
    var seg2 = rand(25, 65); // angle between line2 and line3
    var seg3 = 180 - seg1 - seg2; // remaining angle to complete 180 (half circle)
    if (seg3 <= 5) return g55();
    // The 6 angles going around: seg1, seg2, seg3, seg1, seg2, seg3 (opposite pairs)
    var imgLines = [{ deg: 0, name: "" }, { deg: seg1, name: "" }, { deg: seg1 + seg2, name: "" }];
    var imgAngles = [
      { label: s + "\u2081=" + seg1 + "\u00b0", startDeg: 0, endDeg: seg1, value: seg1, color: "#3498db" },
      { label: s + "\u2082=" + seg2 + "\u00b0", startDeg: seg1, endDeg: seg1 + seg2, value: seg2, color: "#27ae60" },
      { label: s + "\u2083=?", startDeg: seg1 + seg2, endDeg: 180, value: null, color: "#e74c3c" }
    ];
    return {
      q: "Drie lijnen snijden in punt " + s + ".\n\u2220" + s + "\u2081 = " + seg1 + "\u00b0 en \u2220" + s + "\u2082 = " + seg2 + "\u00b0.\n\u2220" + s + "\u2081, \u2220" + s + "\u2082 en \u2220" + s + "\u2083 vormen samen een gestrekte hoek.\nBereken \u2220" + s + "\u2083.",
      a: seg3,
      h: "\u2220" + s + "\u2083 = 180\u00b0 \u2212 " + seg1 + "\u00b0 \u2212 " + seg2 + "\u00b0 = " + seg3 + "\u00b0",
      svg: svgIntersectingLines(imgLines, imgAngles, s)
    };
  }
  if (t === 5) {
    // Diagnostic test style: S1=90, two more angles given, find S5=S6
    var s = pick(["S", "A", "P"]);
    var a1 = 90;
    var a2 = rand(20, 70);
    var a3 = 180 - a1 - a2; // this completes the gestrekte hoek on one side
    if (a3 <= 0) return g55();
    // Now on the other side (overstaande): seg4=a1=90, seg5=a2, seg6=a3
    // But the question says S5=S6, so we need a different setup.
    // Setup: two lines cross at S with a right angle. A third line bisects one of the other angles.
    var halfAngle = rand(20, 70);
    var otherAngle = 90 - halfAngle; // not used directly
    // S1 = 90, S2 = halfAngle, S3 = 90 - halfAngle forms gestrekte hoek: 90 + halfAngle + (90-halfAngle) = 180. OK.
    // S4 (overstaand S1) = 90, S5 (overstaand S2) = halfAngle, S6 (overstaand S3) = 90 - halfAngle
    var target = halfAngle;
    var imgLines = [{ deg: 0, name: "" }, { deg: 90, name: "" }, { deg: 90 + halfAngle, name: "" }];
    var imgAngles = [
      { label: s + "\u2081=90\u00b0", startDeg: 0, endDeg: 90, value: 90, color: "#3498db" },
      { label: s + "\u2082=" + halfAngle + "\u00b0", startDeg: 90, endDeg: 90 + halfAngle, value: halfAngle, color: "#27ae60" },
      { label: s + "\u2083=?", startDeg: 90 + halfAngle, endDeg: 180, value: null, color: "#e74c3c" }
    ];
    return {
      q: "Drie lijnen snijden in punt " + s + ".\n\u2220" + s + "\u2081 = 90\u00b0, \u2220" + s + "\u2082 = " + halfAngle + "\u00b0.\n\u2220" + s + "\u2081, \u2220" + s + "\u2082 en \u2220" + s + "\u2083 vormen een gestrekte hoek.\nBereken \u2220" + s + "\u2083.",
      a: 90 - halfAngle,
      h: "\u2220" + s + "\u2083 = 180\u00b0 \u2212 90\u00b0 \u2212 " + halfAngle + "\u00b0 = " + (90 - halfAngle) + "\u00b0",
      svg: svgIntersectingLines(imgLines, imgAngles, s)
    };
  }
  if (t === 6) {
    // Given two angles at an intersection of 3 lines, find overstaande hoek then use gestrekte hoek
    var s = pick(["A", "S", "P"]);
    var a2 = rand(100, 155); // one of the larger angles
    var a5 = rand(80, 130);
    // a2 and a5 are known. Find a1 via gestrekte hoek: a1 = 180 - a2
    var a1 = 180 - a2;
    // a3 = overstaand aan a1, but we need a setup that makes sense.
    // Let's say 3 lines cross at point. Consecutive angles: a1, a2, a3, a4, a5, a6 around the point = 360
    // With overstaande pairs: a1=a4, a2=a5, a3=a6
    // a1+a2+a3 = 180 (gestrekte hoek)
    var a3 = 180 - a2 - a1; // This is 0 by definition - that's wrong.
    // Let me reconsider. With 3 lines: 6 angles summing to 360.
    // a1+a2+a3 = 180 (one side), a4+a5+a6 = 180 (other side), a1=a4, a2=a5, a3=a6.
    // So a1+a2+a3=180. Given a2, I need a1 and a3 such that a1+a3 = 180-a2.
    var a2val = rand(40, 80);
    var a1val = rand(30, 180 - a2val - 10);
    var a3val = 180 - a2val - a1val;
    if (a3val <= 5) return g55();
    // overstaande: a4=a1, a5=a2, a6=a3
    // Question: given a2 and a5 (which equals a2 - but that's trivial)
    // Better: given a2 and a1, find a6 (=a3)
    var imgLines = [{ deg: 0, name: "" }, { deg: a1val, name: "" }, { deg: a1val + a2val, name: "" }];
    var imgAngles = [
      { label: s + "\u2081=" + a1val + "\u00b0", startDeg: 0, endDeg: a1val, value: a1val, color: "#3498db" },
      { label: s + "\u2082=" + a2val + "\u00b0", startDeg: a1val, endDeg: a1val + a2val, value: a2val, color: "#27ae60" },
      { label: s + "\u2083=?", startDeg: a1val + a2val, endDeg: 180, value: null, color: "#e74c3c" },
      { label: s + "\u2086=?", startDeg: 180 + a1val + a2val, endDeg: 360, value: null, color: "#f39c12" }
    ];
    return {
      q: "Drie lijnen snijden in punt " + s + ".\n\u2220" + s + "\u2081 = " + a1val + "\u00b0 en \u2220" + s + "\u2082 = " + a2val + "\u00b0.\nBereken \u2220" + s + "\u2083.\n(Hint: \u2220" + s + "\u2081 + \u2220" + s + "\u2082 + \u2220" + s + "\u2083 = 180\u00b0)",
      a: a3val,
      h: "\u2220" + s + "\u2083 = 180\u00b0 \u2212 " + a1val + "\u00b0 \u2212 " + a2val + "\u00b0 = " + a3val + "\u00b0",
      svg: svgIntersectingLines(imgLines, imgAngles, s)
    };
  }
  if (t === 7) {
    // Multi-step: find overstaande hoek first, then use gestrekte hoek
    var s = pick(["A", "S", "P", "M"]);
    var a2 = rand(100, 160);
    var a5 = a2; // overstaande
    var a1 = 180 - a2;
    var imgLines = [{ deg: 0, name: "" }, { deg: a1, name: "" }];
    var imgAngles = [
      { label: s + "\u2082=" + a2 + "\u00b0", startDeg: a1, endDeg: 180, value: a2, color: "#3498db" },
      { label: s + "\u2081=?", startDeg: 0, endDeg: a1, value: null, color: "#e74c3c" }
    ];
    return {
      q: "Twee lijnen snijden in punt " + s + ".\n\u2220" + s + "\u2082 = " + a2 + "\u00b0.\nBereken \u2220" + s + "\u2081 (naastliggend aan \u2220" + s + "\u2082).",
      a: a1,
      h: "\u2220" + s + "\u2081 + \u2220" + s + "\u2082 = 180\u00b0 (gestrekte hoek).\n\u2220" + s + "\u2081 = 180\u00b0 \u2212 " + a2 + "\u00b0 = " + a1 + "\u00b0",
      svg: svgIntersectingLines(imgLines, imgAngles, s)
    };
  }
  if (t === 8) {
    // Diagnostic style: ∠A₂ = 144°, find ∠A₁ (gestrekte hoek), then find overstaande
    var s = pick(["A", "S", "P"]);
    var a2 = rand(100, 165);
    var a1 = 180 - a2;
    var a3 = a1; // overstaande aan a1 (wait, that depends on the layout)
    // Two lines: angles are a1, a2, a1, a2 going around (since a2 = 180-a1)
    // a1 and a3 are overstaande, a2 and a4 are overstaande
    var imgLines = [{ deg: 0, name: "" }, { deg: a1, name: "" }];
    var imgAngles = [
      { label: s + "\u2081=?", startDeg: 0, endDeg: a1, value: null, color: "#e74c3c" },
      { label: s + "\u2082=" + a2 + "\u00b0", startDeg: a1, endDeg: 180, value: a2, color: "#3498db" },
      { label: s + "\u2083=?", startDeg: 180, endDeg: 180 + a1, value: null, color: "#f39c12" }
    ];
    return {
      q: "Twee lijnen snijden in punt " + s + ".\n\u2220" + s + "\u2082 = " + a2 + "\u00b0.\n\nStap 1: Bereken \u2220" + s + "\u2081 (gestrekte hoek).\nStap 2: \u2220" + s + "\u2083 is overstaand aan \u2220" + s + "\u2081.\n\nHoe groot is \u2220" + s + "\u2083?",
      a: a1,
      h: "Stap 1: \u2220" + s + "\u2081 = 180\u00b0 \u2212 " + a2 + "\u00b0 = " + a1 + "\u00b0.\nStap 2: \u2220" + s + "\u2083 (overstaand) = \u2220" + s + "\u2081 = " + a1 + "\u00b0",
      svg: svgIntersectingLines(imgLines, imgAngles, s)
    };
  }
  if (t === 9) {
    // Three lines, find multiple unknowns (ask for one specific)
    var s = pick(["S", "A", "P"]);
    var a1 = rand(20, 55);
    var a2 = rand(40, 80);
    var a3 = 180 - a1 - a2;
    if (a3 <= 5) return g55();
    // a4 = a1 (overstaand), a5 = a2 (overstaand), a6 = a3 (overstaand)
    // Ask for a5 (overstaand aan a2)
    var imgLines = [{ deg: 0, name: "" }, { deg: a1, name: "" }, { deg: a1 + a2, name: "" }];
    var imgAngles = [
      { label: s + "\u2081=" + a1 + "\u00b0", startDeg: 0, endDeg: a1, value: a1, color: "#3498db" },
      { label: s + "\u2082=" + a2 + "\u00b0", startDeg: a1, endDeg: a1 + a2, value: a2, color: "#27ae60" },
      { label: s + "\u2083=" + a3 + "\u00b0", startDeg: a1 + a2, endDeg: 180, value: a3, color: "#9b59b6" },
      { label: s + "\u2085=?", startDeg: 180 + a1, endDeg: 180 + a1 + a2, value: null, color: "#e74c3c" }
    ];
    return {
      q: "Drie lijnen snijden in punt " + s + ".\n\u2220" + s + "\u2081 = " + a1 + "\u00b0, \u2220" + s + "\u2082 = " + a2 + "\u00b0, \u2220" + s + "\u2083 = " + a3 + "\u00b0.\nBereken \u2220" + s + "\u2085 (overstaand aan \u2220" + s + "\u2082).",
      a: a2,
      h: "Overstaande hoeken zijn gelijk.\n\u2220" + s + "\u2085 = \u2220" + s + "\u2082 = " + a2 + "\u00b0",
      svg: svgIntersectingLines(imgLines, imgAngles, s)
    };
  }
  if (t === 10) {
    // Given angles around a full point
    var s = pick(["S", "A", "P"]);
    var a1 = rand(30, 60);
    var a2 = rand(30, 60);
    var a3 = rand(30, 60);
    var a4 = 360 - a1 - a2 - a3 - a1 - a2; // Wait, need to be more careful
    // 4 angles on one side of two intersecting lines don't sum to 360.
    // Let's keep it simpler: three angles on a straight line
    var a1v = rand(20, 60);
    var a2v = rand(20, 60);
    var a3v = rand(20, 60);
    var a4v = 180 - a1v - a2v - a3v;
    if (a4v <= 5) return g55();
    var imgLines10 = [{ deg: 0, name: "" }, { deg: a1v, name: "" }, { deg: a1v + a2v, name: "" }, { deg: a1v + a2v + a3v, name: "" }];
    var imgAngles10 = [
      { label: s + "\u2081", startDeg: 0, endDeg: a1v, value: a1v, color: "#3498db" },
      { label: s + "\u2082", startDeg: a1v, endDeg: a1v + a2v, value: a2v, color: "#27ae60" },
      { label: s + "\u2083", startDeg: a1v + a2v, endDeg: a1v + a2v + a3v, value: a3v, color: "#9b59b6" },
      { label: s + "\u2084=?", startDeg: a1v + a2v + a3v, endDeg: 180, value: null, color: "#e74c3c" }
    ];
    return {
      q: "Vier hoeken vormen samen een gestrekte hoek (180\u00b0).\n\u2220" + s + "\u2081 = " + a1v + "\u00b0, \u2220" + s + "\u2082 = " + a2v + "\u00b0, \u2220" + s + "\u2083 = " + a3v + "\u00b0.\nBereken \u2220" + s + "\u2084.",
      a: a4v,
      h: "180\u00b0 \u2212 " + a1v + "\u00b0 \u2212 " + a2v + "\u00b0 \u2212 " + a3v + "\u00b0 = " + a4v + "\u00b0",
      svg: svgIntersectingLines(imgLines10, imgAngles10, s)
    };
  }
  if (t === 11) {
    // Combined: gestrekte hoek + rechte hoek in one problem
    var s = pick(["A", "S", "P"]);
    var a1 = rand(20, 70);
    var a2rest = 90 - a1; // a2 forms a right angle with a1
    var a3 = 180 - a1 - a2rest; // =90, the remaining part of the gestrekte hoek
    var imgLines11 = [{ deg: 0, name: "" }, { deg: a1, name: "" }, { deg: 90, name: "" }];
    var imgAngles11 = [
      { label: s + "\u2081", startDeg: 0, endDeg: a1, value: a1, color: "#3498db" },
      { label: s + "\u2082=?", startDeg: a1, endDeg: 90, value: null, color: "#e74c3c" },
      { label: s + "\u2083=?", startDeg: 90, endDeg: 180, value: null, color: "#f39c12" }
    ];
    return {
      q: "\u2220" + s + "\u2081 = " + a1 + "\u00b0.\n\u2220" + s + "\u2081 en \u2220" + s + "\u2082 vormen een rechte hoek (90\u00b0).\n\u2220" + s + "\u2081, \u2220" + s + "\u2082 en \u2220" + s + "\u2083 vormen een gestrekte hoek (180\u00b0).\nBereken \u2220" + s + "\u2082 + \u2220" + s + "\u2083.",
      a: a2rest + a3,
      h: "\u2220" + s + "\u2082 = 90\u00b0 \u2212 " + a1 + "\u00b0 = " + a2rest + "\u00b0.\n\u2220" + s + "\u2083 = 180\u00b0 \u2212 " + a1 + "\u00b0 \u2212 " + a2rest + "\u00b0 = " + a3 + "\u00b0.\nSom = " + a2rest + "\u00b0 + " + a3 + "\u00b0 = " + (a2rest + a3) + "\u00b0",
      svg: svgIntersectingLines(imgLines11, imgAngles11, s)
    };
  }
  if (t === 12) {
    // Hard multi-step: three lines at a point, given 2 angles on one side, find an angle on the other side
    var s = pick(["S", "A", "P"]);
    var seg1 = rand(25, 55);
    var seg2 = rand(25, 55);
    var seg3 = 180 - seg1 - seg2;
    if (seg3 <= 10) return g55();
    var imgLines = [{ deg: 0, name: "" }, { deg: seg1, name: "" }, { deg: seg1 + seg2, name: "" }];
    var imgAngles = [
      { label: s + "\u2081=" + seg1 + "\u00b0", startDeg: 0, endDeg: seg1, value: seg1, color: "#3498db" },
      { label: s + "\u2082=?", startDeg: seg1, endDeg: seg1 + seg2, value: null, color: "#888" },
      { label: s + "\u2083=" + seg3 + "\u00b0", startDeg: seg1 + seg2, endDeg: 180, value: seg3, color: "#27ae60" },
      { label: s + "\u2085=?", startDeg: 180 + seg1, endDeg: 180 + seg1 + seg2, value: null, color: "#e74c3c" }
    ];
    return {
      q: "Drie lijnen snijden in punt " + s + ".\n\u2220" + s + "\u2081 = " + seg1 + "\u00b0, \u2220" + s + "\u2083 = " + seg3 + "\u00b0.\n\u2220" + s + "\u2081, \u2220" + s + "\u2082 en \u2220" + s + "\u2083 vormen een gestrekte hoek.\nBereken \u2220" + s + "\u2085 (overstaand aan \u2220" + s + "\u2082).",
      a: seg2,
      h: "Stap 1: \u2220" + s + "\u2082 = 180\u00b0 \u2212 " + seg1 + "\u00b0 \u2212 " + seg3 + "\u00b0 = " + seg2 + "\u00b0.\nStap 2: \u2220" + s + "\u2085 (overstaand) = \u2220" + s + "\u2082 = " + seg2 + "\u00b0",
      svg: svgIntersectingLines(imgLines, imgAngles, s)
    };
  }

  // ===== F/Z-HOEKEN (types 13-22) =====
  var alpha = rand(35, 145);
  var beta = 180 - alpha;

  if (t === 13) {
    // F-hoek basis: gegeven hoek 1, bereken hoek 5
    return {
      q: "Lijnen l en m zijn evenwijdig. Een snijlijn kruist beide.\n\u2220\u2081 = " + alpha + "\u00b0\n\nBereken \u2220\u2085 (F-hoek van \u2220\u2081).",
      a: alpha,
      h: "F-hoeken bij evenwijdige lijnen zijn gelijk.\n\u2220\u2085 = \u2220\u2081 = " + alpha + "\u00b0",
      svg: svgParallelLines([
        {pos: 1, value: alpha, color: "#3498db", label: "\u22201"},
        {pos: 5, value: null, color: "#e74c3c", label: "\u22205=?"}
      ], {lineLabels: ["l", "m"], transversalLabel: "k"})
    };
  }
  if (t === 14) {
    // Z-hoek basis: gegeven hoek 2, bereken hoek 8
    return {
      q: "Lijnen l en m zijn evenwijdig. Een snijlijn kruist beide.\n\u2220\u2082 = " + alpha + "\u00b0\n\nBereken \u2220\u2088 (Z-hoek van \u2220\u2082).",
      a: alpha,
      h: "Z-hoeken bij evenwijdige lijnen zijn gelijk.\n\u2220\u2088 = \u2220\u2082 = " + alpha + "\u00b0",
      svg: svgParallelLines([
        {pos: 2, value: alpha, color: "#3498db", label: "\u22202"},
        {pos: 8, value: null, color: "#e74c3c", label: "\u22208=?"}
      ], {lineLabels: ["l", "m"], transversalLabel: "k"})
    };
  }
  if (t === 15) {
    // Gestrekte hoek + F-hoek combo: gegeven hoek 1, bereken hoek 6
    return {
      q: "l // m, snijlijn k kruist beide.\n\u2220\u2081 = " + alpha + "\u00b0\n\nBereken \u2220\u2086.",
      a: beta,
      h: "\u2220\u2085 = \u2220\u2081 = " + alpha + "\u00b0 (F-hoeken)\n\u2220\u2086 = 180\u00b0 \u2212 \u2220\u2085 = 180\u00b0 \u2212 " + alpha + "\u00b0 = " + beta + "\u00b0 (gestrekte hoek)",
      svg: svgParallelLines([
        {pos: 1, value: alpha, color: "#3498db", label: "\u22201"},
        {pos: 6, value: null, color: "#e74c3c", label: "\u22206=?"}
      ], {lineLabels: ["l", "m"], transversalLabel: "k"})
    };
  }
  if (t === 16) {
    // Alle 8 hoeken: gegeven 1 hoek, bereken willekeurige andere
    var askPos = pick([3, 4, 6, 7, 8]);
    var expectedAngles = {1: alpha, 2: beta, 3: alpha, 4: beta, 5: alpha, 6: beta, 7: alpha, 8: beta};
    return {
      q: "l // m, snijlijn k.\n\u2220\u2081 = " + alpha + "\u00b0\n\nBereken \u2220" + String.fromCharCode(8320 + askPos) + ".",
      a: expectedAngles[askPos],
      h: "Hoeken 1, 3, 5, 7 = " + alpha + "\u00b0 (overstaand/F-hoeken)\nHoeken 2, 4, 6, 8 = " + beta + "\u00b0 (gestrekte hoek)\n\u2220" + String.fromCharCode(8320 + askPos) + " = " + expectedAngles[askPos] + "\u00b0",
      svg: svgParallelLines([
        {pos: 1, value: alpha, color: "#3498db", label: "\u22201"},
        {pos: askPos, value: null, color: "#e74c3c", label: "\u2220" + String.fromCharCode(8320 + askPos) + "=?"}
      ], {lineLabels: ["l", "m"], transversalLabel: "k"})
    };
  }
  if (t === 17) {
    // Herkenningsvraag: welk type hoek? (multiple choice)
    var types = [
      {pair: "1 en 5", type: "F-hoeken", h: "Zelfde positie bij de twee snijpunten \u2192 F-hoeken"},
      {pair: "2 en 8", type: "Z-hoeken", h: "Kruislings aan verschillende kanten \u2192 Z-hoeken"},
      {pair: "1 en 3", type: "overstaande hoeken", h: "Tegenover elkaar bij \u00e9\u00e9n snijpunt \u2192 overstaand"},
      {pair: "1 en 2", type: "nevenhoeken", h: "Naast elkaar bij \u00e9\u00e9n snijpunt \u2192 nevenhoeken (samen 180\u00b0)"},
      {pair: "3 en 5", type: "Z-hoeken", h: "Kruislings \u2192 Z-hoeken"},
      {pair: "4 en 6", type: "Z-hoeken", h: "Kruislings \u2192 Z-hoeken"},
      {pair: "2 en 6", type: "F-hoeken", h: "Zelfde positie \u2192 F-hoeken"}
    ];
    var ch = pick(types);
    return {
      q: "l // m met snijlijn k.\n\u2220" + ch.pair.split(" en ")[0] + " en \u2220" + ch.pair.split(" en ")[1] + " zijn:",
      a: ch.type,
      t: "choice",
      o: ["F-hoeken", "Z-hoeken", "overstaande hoeken", "nevenhoeken"],
      h: ch.h
    };
  }
  if (t === 18) {
    // Driehoek met evenwijdige lijn
    var angB = rand(30, 70);
    var angC = rand(30, 70);
    var angA = 180 - angB - angC;
    if (angA <= 10) return g55();
    return {
      q: "In \u25b3ABC loopt door A een lijn l evenwijdig aan BC.\n\u2220B = " + angB + "\u00b0 en \u2220C = " + angC + "\u00b0.\n\nBereken \u2220A.",
      a: angA,
      h: "Hoekensom driehoek:\n\u2220A = 180\u00b0 \u2212 " + angB + "\u00b0 \u2212 " + angC + "\u00b0 = " + angA + "\u00b0\n\n(Check via Z-hoeken bij de evenwijdige lijn:\nLinks van A bij l = " + angB + "\u00b0 (Z-hoek met \u2220B)\nRechts van A bij l = " + angC + "\u00b0 (Z-hoek met \u2220C))"
    };
  }
  if (t === 19) {
    // Twee snijlijnen + driehoek
    var ang1 = rand(40, 75);
    var ang2 = rand(40, 75);
    var angBetween = 180 - ang1 - ang2;
    if (angBetween <= 10 || angBetween >= 170) return g55();
    return {
      q: "Lijnen l en m zijn evenwijdig.\nSnijlijn k\u2081 maakt een hoek van " + ang1 + "\u00b0 met l.\nSnijlijn k\u2082 maakt een hoek van " + ang2 + "\u00b0 met l.\nk\u2081 en k\u2082 snijden elkaar tussen l en m.\n\nHoe groot is de hoek tussen k\u2081 en k\u2082 bij het snijpunt?",
      a: angBetween,
      h: "Bij het snijpunt vormen k\u2081 en k\u2082 een driehoek met lijn l.\nDe hoeken bij l zijn " + ang1 + "\u00b0 en " + ang2 + "\u00b0 (F-hoeken).\nDe hoek bij het snijpunt = 180\u00b0 \u2212 " + ang1 + "\u00b0 \u2212 " + ang2 + "\u00b0 = " + angBetween + "\u00b0"
    };
  }
  if (t === 20) {
    // Parallellogram
    var angP = rand(40, 140);
    var angQ = 180 - angP;
    return {
      q: "ABCD is een parallellogram (AB // DC en AD // BC).\n\u2220A = " + angP + "\u00b0\n\nBereken \u2220B.",
      a: angQ,
      h: "In een parallellogram zijn naastliggende hoeken samen 180\u00b0.\n\u2220B = 180\u00b0 \u2212 " + angP + "\u00b0 = " + angQ + "\u00b0"
    };
  }
  if (t === 21) {
    // Spoorwegovergang
    var railAngle = rand(50, 80);
    var complement = 180 - railAngle;
    return {
      q: "Bij een spoorwegovergang kruist een weg de rails.\nDe rails zijn evenwijdig. De weg maakt een hoek van " + railAngle + "\u00b0 met de linkse rail.\n\nWelke hoek maakt de weg met de rechtse rail aan dezelfde kant?",
      a: complement,
      h: "De hoeken aan dezelfde kant van de snijlijn tussen evenwijdige lijnen zijn samen 180\u00b0.\n" + railAngle + "\u00b0 + ? = 180\u00b0\n? = " + complement + "\u00b0"
    };
  }
  // t === 22: Hulplijn evenwijdig aan basis
  var angBase1 = rand(35, 65);
  var angBase2 = rand(35, 65);
  var angTop = 180 - angBase1 - angBase2;
  if (angTop <= 10) return g55();
  return {
    q: "In \u25b3PQR is PQ de basis. Door R loopt lijn s // PQ.\n\u2220P = " + angBase1 + "\u00b0.\n\nDe hoek die PR maakt met lijn s is gelijk aan \u2220P (Z-hoeken).\nBereken \u2220Q als je weet dat \u2220R = " + angTop + "\u00b0.",
    a: angBase2,
    h: "\u2220Q = 180\u00b0 \u2212 \u2220P \u2212 \u2220R = 180\u00b0 \u2212 " + angBase1 + "\u00b0 \u2212 " + angTop + "\u00b0 = " + angBase2 + "\u00b0\n\n(Check via Z-hoeken bij s//PQ:\nLinks van R bij s: Z-hoek met \u2220P = " + angBase1 + "\u00b0\nRechts van R bij s: Z-hoek met \u2220Q = " + angBase2 + "\u00b0)"
  };
}


// ========== GENERATOR g56 - Hoeken in vlakke figuren (diagnostic only) ==========

function g56() {
  var triNames = pick([["D", "E", "F"], ["A", "B", "C"], ["P", "Q", "R"], ["K", "L", "M"]]);
  var quadNames = pick([["P", "Q", "R", "S"], ["A", "B", "C", "D"], ["K", "L", "M", "N"]]);
  var t = rand(1, 20);

  if (t === 1) {
    // Simple: hoekensom driehoek
    var a = rand(25, 70);
    var b = rand(25, 70);
    var c = 180 - a - b;
    if (c <= 0) return g56();
    return {
      q: "In \u25b3" + triNames.join("") + ": \u2220" + triNames[0] + " = " + a + "\u00b0 en \u2220" + triNames[2] + " = " + b + "\u00b0.\nBereken \u2220" + triNames[1] + ".",
      a: c,
      h: "180\u00b0 \u2212 " + a + "\u00b0 \u2212 " + b + "\u00b0 = " + c + "\u00b0 (hoekensom driehoek)",
      svg: svgTriangle(null, [a, c, b], triNames, 1)
    };
  }
  if (t === 2) {
    // Vierhoek: given 3 angles, find 4th (hoekensom 360)
    var a = rand(50, 120);
    var b = rand(50, 120);
    var c = rand(50, 120);
    var d = 360 - a - b - c;
    if (d < 10 || d > 170) return g56();
    return {
      q: "In vierhoek " + quadNames.join("") + ": \u2220" + quadNames[0] + " = " + a + "\u00b0, \u2220" + quadNames[1] + " = " + b + "\u00b0, \u2220" + quadNames[3] + " = " + c + "\u00b0.\nBereken \u2220" + quadNames[2] + ".",
      a: d,
      h: "360\u00b0 \u2212 " + a + "\u00b0 \u2212 " + b + "\u00b0 \u2212 " + c + "\u00b0 = " + d + "\u00b0 (hoekensom vierhoek)",
      svg: svgQuadrilateral(null, [a, b, d, c], quadNames, 2)
    };
  }
  if (t === 3) {
    // Hard: vierhoek met gelijke hoeken en verhoudingen (algebra)
    // ∠Q = 92°, ∠P = ∠R, ∠Q = 2 × ∠S → find ∠P
    var qAngle = pick([84, 88, 92, 96, 100, 104]);
    var sAngle = qAngle / 2;
    var prSum = 360 - qAngle - sAngle;
    var pAngle = prSum / 2;
    if (pAngle !== Math.floor(pAngle)) return g56();
    return {
      q: "In vierhoek " + quadNames.join("") + ":\n\u2220" + quadNames[1] + " = " + qAngle + "\u00b0\n\u2220" + quadNames[0] + " = \u2220" + quadNames[2] + "\n\u2220" + quadNames[1] + " is twee keer zo groot als \u2220" + quadNames[3] + ".\nBereken \u2220" + quadNames[0] + ".",
      a: pAngle,
      h: "\u2220" + quadNames[3] + " = " + qAngle + "\u00b0 \u00f7 2 = " + sAngle + "\u00b0\nHoekensom: \u2220" + quadNames[0] + " + " + qAngle + "\u00b0 + \u2220" + quadNames[2] + " + " + sAngle + "\u00b0 = 360\u00b0\n2\u00d7\u2220" + quadNames[0] + " = 360\u00b0 \u2212 " + qAngle + "\u00b0 \u2212 " + sAngle + "\u00b0 = " + prSum + "\u00b0\n\u2220" + quadNames[0] + " = " + pAngle + "\u00b0",
      svg: svgQuadrilateral(null, [pAngle, qAngle, pAngle, sAngle], quadNames, 0)
    };
  }
  if (t === 4) {
    // Driehoek met gestrekte hoek ernaast (buitenhoek)
    var a = rand(30, 70);
    var b = rand(30, 70);
    var c = 180 - a - b;
    if (c <= 0) return g56();
    var buitenhoek = 180 - c;
    return {
      q: "In \u25b3" + triNames.join("") + ": \u2220" + triNames[0] + " = " + a + "\u00b0 en \u2220" + triNames[1] + " = " + b + "\u00b0.\nZijde " + triNames[1] + triNames[2] + " wordt verlengd.\nBereken de buitenhoek bij " + triNames[2] + ".",
      a: buitenhoek,
      h: "\u2220" + triNames[2] + " = 180\u00b0 \u2212 " + a + "\u00b0 \u2212 " + b + "\u00b0 = " + c + "\u00b0.\nBuitenhoek = 180\u00b0 \u2212 " + c + "\u00b0 = " + buitenhoek + "\u00b0\n(Of: buitenhoek = " + a + "\u00b0 + " + b + "\u00b0 = " + buitenhoek + "\u00b0)",
      svg: svgTriangle(null, [a, b, c], triNames, 2)
    };
  }
  if (t === 5) {
    // Gelijkbenige driehoek: hoek verdeeld, multi-step
    var a = rand(25, 70);
    var b = rand(25, 70);
    var c = 180 - a - b;
    if (c <= 0 || c % 2 !== 0) return g56();
    return {
      q: "In \u25b3" + triNames.join("") + ": \u2220" + triNames[1] + " = " + a + "\u00b0 en \u2220" + triNames[2] + " = " + b + "\u00b0.\n\u2220" + triNames[0] + " is verdeeld in twee gelijke delen.\nBereken elk deel.",
      a: Math.round(c / 2),
      h: "\u2220" + triNames[0] + " = 180\u00b0 \u2212 " + a + "\u00b0 \u2212 " + b + "\u00b0 = " + c + "\u00b0.\nElk deel = " + c + "\u00b0 \u00f7 2 = " + Math.round(c / 2) + "\u00b0",
      svg: svgTriangle(null, [c, a, b], triNames, 0)
    };
  }
  if (t === 6) {
    // Vierhoek with two equal angles (algebra)
    var a = rand(60, 120);
    var b = rand(60, 120);
    var rest = 360 - a - b;
    var half = Math.round(rest / 2);
    if (rest <= 0 || rest % 2 !== 0) return g56();
    return {
      q: "In vierhoek " + quadNames.join("") + ": \u2220" + quadNames[0] + " = " + a + "\u00b0 en \u2220" + quadNames[1] + " = " + b + "\u00b0.\n\u2220" + quadNames[2] + " = \u2220" + quadNames[3] + ".\nBereken \u2220" + quadNames[2] + ".",
      a: half,
      h: "\u2220" + quadNames[2] + " + \u2220" + quadNames[3] + " = 360\u00b0 \u2212 " + a + "\u00b0 \u2212 " + b + "\u00b0 = " + rest + "\u00b0.\n\u2220" + quadNames[2] + " = " + rest + "\u00b0 \u00f7 2 = " + half + "\u00b0",
      svg: svgQuadrilateral(null, [a, b, half, half], quadNames, 2)
    };
  }
  if (t === 7) {
    // Two triangles sharing a vertex (overstaande hoeken + hoekensom)
    // Triangle 1: angles a1, b1, c1 at vertices A, S, B
    // Triangle 2: angles a2, S_angle2, d2 at vertices C, S, D
    // The angle at S in triangle 2 is overstaand aan the angle at S in triangle 1
    var s_angle = rand(30, 80);
    var a1 = rand(30, 80);
    var b1 = 180 - s_angle - a1;
    if (b1 <= 5) return g56();
    var c2 = rand(40, 80);
    var d2 = 180 - s_angle - c2; // S_angle2 = s_angle (overstaand)
    if (d2 <= 5) return g56();

    return {
      q: "Twee driehoeken delen punt S (overstaande hoeken).\nIn \u25b3ABS: \u2220A = " + a1 + "\u00b0 en \u2220S = " + s_angle + "\u00b0.\nIn \u25b3CSD: \u2220C = " + c2 + "\u00b0 en de hoek bij S is overstaand.\nBereken \u2220D.",
      a: d2,
      h: "\u2220S in \u25b3CSD = \u2220S in \u25b3ABS = " + s_angle + "\u00b0 (overstaande hoeken).\n\u2220D = 180\u00b0 \u2212 " + c2 + "\u00b0 \u2212 " + s_angle + "\u00b0 = " + d2 + "\u00b0",
      svg: svgTwoTriangles({
        type: "shared_vertex",
        labels: ["A", "S", "B", "C", "D"],
        angles: [a1, s_angle, b1, c2, d2],
        highlight: 4
      })
    };
  }
  if (t === 8) {
    // Gelijkzijdige driehoek
    return {
      q: "Een gelijkzijdige driehoek heeft drie gelijke hoeken.\nHoe groot is elke hoek?",
      a: 60,
      h: "180\u00b0 \u00f7 3 = 60\u00b0 (hoekensom driehoek)",
      svg: svgTriangle(null, [60, 60, 60], triNames)
    };
  }
  if (t === 9) {
    // Gelijkbenige driehoek: given top, find base
    var top = rand(20, 120);
    if (top % 2 !== 0) top++;
    var basis = (180 - top) / 2;
    return {
      q: "In een gelijkbenige \u25b3" + triNames.join("") + " is de tophoek \u2220" + triNames[2] + " = " + top + "\u00b0.\nBereken de basishoeken.",
      a: basis,
      h: "(180\u00b0 \u2212 " + top + "\u00b0) \u00f7 2 = " + basis + "\u00b0",
      svg: svgTriangle(null, [basis, basis, top], triNames)
    };
  }
  if (t === 10) {
    // Driehoek + overstaande hoek + tweede driehoek, multi-step
    var a1 = rand(40, 70);
    var b1 = rand(40, 70);
    var c1 = 180 - a1 - b1;
    if (c1 <= 10) return g56();
    // The buitenhoek at C1 = 180 - c1, which is an angle in triangle 2
    var buitenhoek = 180 - c1;
    var d2 = rand(30, 70);
    var e2 = 180 - buitenhoek - d2;
    if (e2 <= 5) return g56();
    return {
      q: "In \u25b3" + triNames.join("") + ": \u2220" + triNames[0] + " = " + a1 + "\u00b0 en \u2220" + triNames[1] + " = " + b1 + "\u00b0.\nZijde " + triNames[0] + triNames[2] + " wordt verlengd voorbij " + triNames[2] + " naar punt G.\n\u25b3" + triNames[2] + "GH heeft \u2220G = " + d2 + "\u00b0.\n\u2220" + triNames[2] + " in \u25b3" + triNames[2] + "GH is de buitenhoek van \u25b3" + triNames.join("") + " bij " + triNames[2] + ".\nBereken \u2220H.",
      a: e2,
      h: "\u2220" + triNames[2] + " in \u25b3" + triNames.join("") + " = 180\u00b0 \u2212 " + a1 + "\u00b0 \u2212 " + b1 + "\u00b0 = " + c1 + "\u00b0.\nBuitenhoek bij " + triNames[2] + " = 180\u00b0 \u2212 " + c1 + "\u00b0 = " + buitenhoek + "\u00b0.\n\u2220H = 180\u00b0 \u2212 " + buitenhoek + "\u00b0 \u2212 " + d2 + "\u00b0 = " + e2 + "\u00b0",
      svg: svgTriangle(null, [a1, b1, c1], triNames, 2)
    };
  }
  if (t === 11) {
    // Hard: Vierhoek met verhouding
    // ∠A : ∠B : ∠C : ∠D = given, sum = 360
    var r1 = rand(1, 4);
    var r2 = rand(1, 4);
    var r3 = rand(1, 4);
    var r4 = rand(1, 4);
    // Avoid trivial all-equal ratios (e.g. 1:1:1:1 or 2:2:2:2)
    if (r1 === r2 && r2 === r3 && r3 === r4) return g56();
    var sum = r1 + r2 + r3 + r4;
    if (360 % sum !== 0) return g56();
    var unit = 360 / sum;
    var a = r1 * unit;
    var b = r2 * unit;
    var c = r3 * unit;
    var d = r4 * unit;
    // Ask for one specific angle
    var askIdx = rand(0, 3);
    var angles = [a, b, c, d];
    var ratios = [r1, r2, r3, r4];
    return {
      q: "In vierhoek " + quadNames.join("") + " geldt:\n\u2220" + quadNames[0] + " : \u2220" + quadNames[1] + " : \u2220" + quadNames[2] + " : \u2220" + quadNames[3] + " = " + r1 + " : " + r2 + " : " + r3 + " : " + r4 + ".\nBereken \u2220" + quadNames[askIdx] + ".",
      a: angles[askIdx],
      h: "Hoekensom = 360\u00b0.\nVerhouding: " + r1 + " + " + r2 + " + " + r3 + " + " + r4 + " = " + sum + " delen.\n1 deel = 360\u00b0 \u00f7 " + sum + " = " + unit + "\u00b0.\n\u2220" + quadNames[askIdx] + " = " + ratios[askIdx] + " \u00d7 " + unit + "\u00b0 = " + angles[askIdx] + "\u00b0",
      svg: svgQuadrilateral(null, [a, b, c, d], quadNames, askIdx)
    };
  }
  if (t === 12) {
    // Rechthoekige driehoek with follow-up
    var a = rand(15, 75);
    var c = 90 - a;
    return {
      q: "In rechthoekige \u25b3" + triNames.join("") + ": \u2220" + triNames[1] + " = 90\u00b0 en \u2220" + triNames[0] + " = " + a + "\u00b0.\nBereken \u2220" + triNames[2] + ".\nIs \u2220" + triNames[2] + " scherp of stomp?",
      a: c,
      h: "\u2220" + triNames[2] + " = 180\u00b0 \u2212 90\u00b0 \u2212 " + a + "\u00b0 = " + c + "\u00b0.\n" + c + "\u00b0 < 90\u00b0 \u2192 scherp.\n(In een rechthoekige driehoek zijn de twee andere hoeken altijd scherp.)",
      svg: svgTriangle(
        [{ x: 30, y: 170 }, { x: 30, y: 30 }, { x: 250, y: 170 }],
        [a, 90, c],
        triNames,
        2
      )
    };
  }

  // ===== VERHAALSOMMEN (types 13-20) =====

  if (t === 13) {
    // Dakconstructie: gelijkbenig dak, bereken nokhoek
    var dakHoek = pick([30, 35, 40, 45, 50, 55, 60]);
    var nokHoek = 180 - 2 * dakHoek;
    if (nokHoek <= 0) return g56();
    return {
      q: "Een dak is gelijkbenig (linker- en rechterkant even lang).\nDe hoek die het dak maakt met het plafond is " + dakHoek + "\u00b0.\n\nHoe groot is de nokhoek (de hoek bovenaan)?",
      a: nokHoek,
      h: "Gelijkbenig dak: beide basishoeken = " + dakHoek + "\u00b0\nNokhoek = 180\u00b0 \u2212 2 \u00d7 " + dakHoek + "\u00b0 = 180\u00b0 \u2212 " + (2 * dakHoek) + "\u00b0 = " + nokHoek + "\u00b0",
      svg: svgDak(dakHoek, nokHoek)
    };
  }
  if (t === 14) {
    // Dakconstructie omgekeerd: gegeven nokhoek, bereken dakhoek
    var nok = pick([40, 50, 60, 70, 80, 90, 100]);
    var dak = (180 - nok) / 2;
    if (dak !== Math.floor(dak)) return g56();
    return {
      q: "Een gelijkbenig dak heeft een nokhoek van " + nok + "\u00b0.\n\nHoe groot is de hoek die het dak maakt met het plafond?",
      a: dak,
      h: "Basishoek = (180\u00b0 \u2212 " + nok + "\u00b0) \u00f7 2 = " + (180 - nok) + "\u00b0 \u00f7 2 = " + dak + "\u00b0",
      svg: svgDak(dak, nok)
    };
  }
  if (t === 15) {
    // Verkeersbord: gelijkbenig driehoekig waarschuwingsbord
    var topHoek = pick([50, 55, 60, 65, 70]);
    var basisHoek = (180 - topHoek) / 2;
    if (basisHoek !== Math.floor(basisHoek)) return g56();
    return {
      q: "Een driehoekig verkeersbord is gelijkbenig.\nDe tophoek is " + topHoek + "\u00b0.\n\nHoe groot zijn de basishoeken?",
      a: basisHoek,
      h: "Basishoek = (180\u00b0 \u2212 " + topHoek + "\u00b0) \u00f7 2 = " + basisHoek + "\u00b0",
      svg: svgVerkeersbord([topHoek, null, null], ["A", "B", "C"])
    };
  }
  if (t === 16) {
    // Klok: hoek tussen wijzers
    var uur = pick([1, 2, 3, 4, 5, 7, 8, 10, 11]);
    var minuut = pick([0, 15, 30]);
    var urenPos = uur * 30 + minuut * 0.5;
    var minPos = minuut * 6;
    var hoek = Math.abs(urenPos - minPos);
    if (hoek > 180) hoek = 360 - hoek;
    if (hoek !== Math.round(hoek)) return g56();
    var tijdStr = uur + ":" + (minuut < 10 ? "0" : "") + minuut;
    return {
      q: "Hoe groot is de hoek tussen de uren- en minutenwijzer om " + tijdStr + " uur?\n\n(De urenwijzer draait 0,5\u00b0 per minuut.\nDe minutenwijzer draait 6\u00b0 per minuut.)",
      a: hoek,
      h: "Urenwijzer: " + uur + " \u00d7 30\u00b0 + " + minuut + " \u00d7 0,5\u00b0 = " + urenPos + "\u00b0\nMinutenwijzer: " + minuut + " \u00d7 6\u00b0 = " + minPos + "\u00b0\nVerschil: |" + urenPos + " \u2212 " + minPos + "| = " + hoek + "\u00b0",
      svg: svgClock(uur, minuut)
    };
  }
  if (t === 17) {
    // Vlaggemast: hoek touw-mast
    var touwHoek = pick([25, 30, 35, 40, 45, 50, 55, 60]);
    var derdeHoek = 90 - touwHoek;
    return {
      q: "Een vlaggemast staat loodrecht op de grond.\nEen touw loopt van de top van de mast naar de grond.\nHet touw maakt een hoek van " + touwHoek + "\u00b0 met de grond.\n\nHoe groot is de hoek tussen het touw en de mast?",
      a: derdeHoek,
      h: "Driehoek: mast \u22a5 grond = 90\u00b0\nTouw-grond = " + touwHoek + "\u00b0\nTouw-mast = 90\u00b0 \u2212 " + touwHoek + "\u00b0 = " + derdeHoek + "\u00b0"
    };
  }
  if (t === 18) {
    // Taartpunten
    var aantalPunten = pick([5, 6, 8, 9, 10, 12]);
    var puntHoek = 360 / aantalPunten;
    if (puntHoek !== Math.round(puntHoek)) return g56();
    return {
      q: "Een taart wordt in " + aantalPunten + " gelijke punten gesneden.\n\nHoe groot is de hoek van elke taartpunt (bij het middelpunt)?",
      a: puntHoek,
      h: "360\u00b0 \u00f7 " + aantalPunten + " = " + puntHoek + "\u00b0"
    };
  }
  if (t === 19) {
    // Scherp/stomp herkennen in context
    var hoek19 = pick([35, 45, 55, 72, 90, 105, 120, 135, 150]);
    var soort = hoek19 < 90 ? "scherp" : hoek19 === 90 ? "recht" : "stomp";
    return {
      q: "Een speler staat bij de hoekschop. De hoek tussen de twee zijlijnen is " + hoek19 + "\u00b0.\n\nIs dit een scherpe, rechte of stompe hoek?",
      a: soort,
      t: "choice",
      o: ["scherp", "recht", "stomp"],
      h: hoek19 + "\u00b0 " + (hoek19 < 90 ? "< 90\u00b0 \u2192 scherp" : hoek19 === 90 ? "= 90\u00b0 \u2192 recht" : "> 90\u00b0 \u2192 stomp")
    };
  }
  // t === 20: Trap-trede hoek
  var trapHoek = pick([30, 35, 40, 45]);
  var derdeH = 90 - trapHoek;
  return {
    q: "Een trap maakt een hoek van " + trapHoek + "\u00b0 met de vloer.\nElke trede is horizontaal (loodrecht op de stijl).\n\nHoe groot is de hoek tussen de trap en de trede?",
    a: derdeH,
    h: "De trede is horizontaal, de vloer ook \u2192 trede // vloer.\nDe trap is de snijlijn.\nHoek trap-trede = 90\u00b0 \u2212 " + trapHoek + "\u00b0 = " + derdeH + "\u00b0"
  };
}
