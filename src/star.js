import { settings } from "./config";

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
    const state = {...arguments[0], t:0, physform: false};

    const step = (game) => {
        //star grav effects
        game.actors.forEach((o, i, a) => {
            //debugger;
            if (o.state.id != state.id && o.state.physform) {
                const xdelta = state.x - o.state.x;
                const ydelta = state.y - o.state.y;
                const distance = Math.sqrt(Math.pow(xdelta, 2) + Math.pow(ydelta, 2));
                const fadeCoefficent = 200 / (distance < 0.2 ? 0.2 : distance)
                const dc = fadeCoefficent;
                const starAngle = Math.atan2(ydelta, xdelta);
                o.state.xv += Math.cos(starAngle) * (settings.star.grav * dc);
                o.state.yv += Math.sin(starAngle) * (settings.star.grav * dc);
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