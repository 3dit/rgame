
const drawLib = (rects, svg) => {
    const dtor = Math.PI / 180.0;
    return {
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
        drawCircle: function(id, coords, r, sw, c) {
            var planet = rects
                .append('circle')
                .attr('id',id)
                .attr('r', r)
                .attr('cx', coords.x)
                .attr('cy', coords.y)
                .attr('stroke', c)
                .attr('stroke-width', sw)
                .attr('fill', 'transparent');
        },
        svg: svg,
        dtor: dtor,
        rects: rects
    }
}

export default drawLib