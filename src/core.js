import { settings } from "./config";

const core = {
    gravityVector(sourceCoords, targetCoords, grav) {
        const xdelta = sourceCoords.x - targetCoords.x;
        const ydelta = sourceCoords.y - targetCoords.y;
        const set = settings;
        const min_distance = set.physics.gravMinDistance;
        const max_force = set.physics.gravMaxForce;
        const dc = set.physics.gravDistanceCoef;
        const distance = Math.sqrt((Math.pow(xdelta, 2)) + (Math.pow(ydelta, 2))) * dc;
        let adjusted_distance = distance < min_distance ? min_distance : distance;
        const starAngle = Math.atan2(ydelta, xdelta);
        let gravForce = grav / Math.pow(adjusted_distance, 2);
        //console.log(gravForce);
        gravForce = gravForce > max_force ? max_force : gravForce;
        return { x: Math.cos(starAngle) * gravForce, y: Math.sin(starAngle) * gravForce };
    },
    dtor: Math.PI / 180.0,
    rtod: 180.0 / Math.PI
}

export { core };