import { settings } from "./config";
import { core } from "./core";

function star({ id, name, x, y, xv, yv, a, av }) {
    const rayCnt = settings.star.rays;
    const size = settings.star.size;
    const fadeCoefficent = 0.01; //originally "2.0 * distance / .01"
    const state = { ...arguments[0], t: 0, physform: false };

    let starContainer = null;

    const step = (game) => {
        //star grav effects
        game.actors.forEach((o, i, a) => {
            //debugger;
            if (o.state.id != state.id && o.state.physform) {
                let gvec = core.gravityVector( { x: state.x, y: state.y}, { x:o.state.x, y:o.state.y }, settings.star.grav);
                o.state.xv += gvec.x;
                o.state.yv += gvec.y;
            }
        });
    }

    const render = (draw) => {
        if(!starContainer) {
            const svg = document.getElementById('theSvg');
            starContainer = draw.addChildGroup(svg, 'starContainer');
        }

        draw.clearGroup(starContainer);

        for (let i = 0; i < rayCnt; i++) {
            let a = Math.random() / draw.dtor;
            let corona = Math.random() * size / 8;
            let red = (parseInt(Math.random() * 40 + 200)).toString(16);
            let green = (parseInt(Math.random() * 40)).toString(16);
            let blue = (parseInt(Math.random() * 20)).toString(16);
            let color = `#${red}${green}${blue}`;
            color = '#fff';
            const newLine = draw.createLine(starContainer, 0, 0, Math.sin(a) * (size + corona), Math.cos(a) * (size + corona), 3, color);
            newLine.setAttribute('transform',`translate(${settings.star.xpos},${settings.star.ypos})`);
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