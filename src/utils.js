
const utils = {
    isPointInsidePolygon(point, polygon, state) {
        const x = point.x;
        const y = point.y;

        let isInside = false;

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x + state.x;
            const yi = polygon[i].y + state.y;
            const xj = polygon[j].x + state.x;
            const yj = polygon[j].y + state.y;

            const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

            if (intersect) {
                isInside = !isInside;
            }
        }

        return isInside;
    }
}

export { utils };