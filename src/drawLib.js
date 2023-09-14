
const drawLib = (rects, svg, svgRoot) => {
    const dtor = Math.PI / 180.0;
    const rtod = 1.0 / dtor;
    return {
        createLine: function (target, x1, y1, x2, y2, sw, sc) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', sc);
            line.setAttribute('stroke-width', sw);
            if (target) target.appendChild(line);
            return line;
        },
        createCircle: function (target, x, y, r, sw, sc, fill) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', r);
            circle.setAttribute('stroke', sc);
            circle.setAttribute('fill', fill ?? 'transparent');
            circle.setAttribute('stroke-width', sw);
            if (target) target.appendChild(circle);
            return circle;
        },
        createPolygon: function( target, id, points, sw, sc, fill) {
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            let pnts = '';
            points.forEach((point) => { 
                pnts += pnts == '' ? '' : ' ';
                pnts += ` ${point.x},${point.y}`;
            });
            polygon.setAttribute('points',pnts);
            polygon.setAttribute('stroke',sc);
            polygon.setAttribute('strokeWidth', sw);
            polygon.setAttribute('fill', fill ?? 'transparent');

            if(id) polygon.setAttribute('id', id);
            if(target) target.appendChild(polygon);
            return polygon;
        },
        addChildGroup: function (target, newId) {
            const newGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            newGroup.setAttribute('id', newId);
            if (target) target.appendChild(newGroup);
            return newGroup;
        },
        deleteGroup: function (grouping) {
            const parentElement = grouping.parentElement;
            let cousins = parentElement?.children;
            if (cousins) {
                let a = Array.from(parentElement.children);
                (a?.length) && a.forEach(child => { if (child == grouping) parentElement.removeChild(child) });
            }
            //parentElement.removeChild(grouping);
            //window.cntx = window.cntx ? window.cntx + 1 : 0;
            //if (window.cntx < 4) {
            //    console.log(parentElement);
            //}
            //window.cntx++;
            //if (window.cntx < 10) {
            //    console.log('PARENT', parent);
            //}
            //parent.removeChild(grouping);
            // const childElements = parent.getElementsByTagName('*');
            // const childElementsArray = Array.from(childElements);
            // childElementsArray.forEach(child => {
            //     window.cntx = window.cntx ? window.cnt+1 : 0;
            //     if(window.cntx < 10) {
            //     (window.cntx < 10) {
            //         console.log('i');
            // `   }
            // })
        },
        clearGroup: function (grouping) {
            const childElements = grouping.getElementsByTagName('*');
            // Convert the child elements to an array (to avoid a live NodeList)
            const childElementsArray = Array.from(childElements);
            // Remove each child element from the SVG
            childElementsArray.forEach(child => {
                grouping.removeChild(child);
            });
        },
        drawline: function (id, cords, sw, c, tx, ty, rot) {
            var line = rects
                .append('line')
                .attr('id', id)
                .attr('x1', cords.x1)
                .attr('y1', cords.y1)
                .attr('x2', cords.x2)
                .attr('y2', cords.y2)
                .attr('stroke-width', sw)
                .attr('stroke', c);

            if (arguments.length === 6) {
                line.attr('transform', 'translate(' + tx + ',' + ty + ')');
            } else if (arguments.length === 7) {
                line.attr('transform', 'translate(' + tx + ',' + ty + ') rotate(' + rot + ')');
            }
        },
        moveline: function (id, tx, ty, rot) {
            let l = rects.select(`#${id}`);
            window.l = l;
            //console.log(l);
            l.attr('transform', `translate(${tx}, ${ty}) rotate(${rot})`);
        },
        drawCircle: function (id, coords, r, sw, c) {
            var planet = rects
                .append('circle')
                .attr('id', id)
                .attr('r', r)
                .attr('cx', coords.x)
                .attr('cy', coords.y)
                .attr('stroke', c)
                .attr('stroke-width', sw)
                .attr('fill', 'transparent');
        },
        svg: svg,
        dtor: dtor,
        rtod: rtod,
        rects: rects,
        svgRoot
    }
}

export default drawLib