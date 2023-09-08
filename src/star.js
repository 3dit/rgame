import { settings } from "./config";
import { core } from "./core";

const size = 15;
// const lineData = [
//     { x1: 0, y1: -size, x2: -size / 2, y2: size / 2 },
//     { x1: -size / 2, y1: size / 2, x2: size / 2, y2: size / 2 },
//     { x1: size / 2, y1: size / 2, x2: 0, y2: -size }
// ];

function star({ id, name, x, y, xv, yv, a, av }) {
    console.log(arguments);
    const rayCnt = settings.star.rays;
    const size = settings.star.size;
    const fadeCoefficent = 0.01; //originally "2.0 * distance / .01"
    const state = { ...arguments[0], t: 0, physform: false };

    const step = (game) => {
        //star grav effects
        game.actors.forEach((o, i, a) => {
            //debugger;
            if (o.state.id != state.id && o.state.physform) {
                let gvec = core.gravityVector( { x: state.x, y: state.y}, { x:o.state.x, y:o.state.y }, settings.star.grav);
                o.state.xv += gvec.x;
                o.state.yv += gvec.y;
                // const xdelta = state.x - o.state.x;
                // const ydelta = state.y - o.state.y;
                // let grav = settings.star.grav;
                // grav = 2500;
                // const min_distance = 100;
                // const max_force = .005;
                // const dc = 5;
                // const distance = Math.sqrt((Math.pow(xdelta, 2)) + (Math.pow(ydelta, 2))) * dc;
                // let adjusted_distance = distance < min_distance ? min_distance : distance;
                // const starAngle = Math.atan2(ydelta, xdelta);
                // let gravForce = grav / Math.pow(adjusted_distance, 2);
                // //console.log(gravForce);
                // gravForce = gravForce > max_force ? max_force : gravForce;
                // o.state.xv += Math.cos(starAngle) * gravForce;
                // o.state.yv += Math.sin(starAngle) * gravForce;
            }
        });
    }

    const render = (draw) => {
        for (let i = 0; i < rayCnt; i++) {
            draw.svg.select(`#ray${i}`).remove();
        }
        for (let i = 0; i < rayCnt; i++) {
            let a = Math.random() / draw.dtor;
            let corona = Math.random() * size / 8;
            let red = (parseInt(Math.random() * 40 + 200)).toString(16);
            let green = (parseInt(Math.random() * 40)).toString(16);
            let blue = (parseInt(Math.random() * 20)).toString(16);
            let color = `#${red}${green}${blue}`;
            color = '#fff';
            draw.drawline(`ray${i}`, {
                x1: settings.star.xpos,
                y1: settings.star.ypos,
                x2: settings.star.xpos + Math.sin(a) * (size + corona),
                y2: settings.star.ypos + Math.cos(a) * (size + corona)
            }, 3, color, 0, 0, 0);
        }
    }
    return {
        state: state,
        handleKeyEvents: (keyEvents) => { },
        render: render,
        step: step
    }
}

export default star;