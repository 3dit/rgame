import { settings } from "./config";
import { core } from "./core";


const dtor = Math.PI / 180.0;

const size = 15;


function planet({ id, name, x, y, xv, yv, a, av }) {
    const state = {...arguments[0], t:0, tv:0, physform: true};
    let planetContainer = null;
    const step = (game) => {
        state.a += state.av;
        state.t += state.tv;
        if (state.t > settings.ship.thrust) {
            state.t = settings.ship.thrust;
            state.tv = 0;
        }
        state.xv += Math.sin(state.a * dtor) * state.t;
        state.yv -= Math.cos(state.a * dtor) * state.t;
        state.x += state.xv;
        state.y += state.yv;
    }
    const preInteraction = (actor) => {
        if(actor.state.name === "ship") {
            let gvec = core.gravityVector( { x: state.x, y: state.y}, { x:actor.state.x, y:actor.state.y }, settings.planet.grav);
            actor.state.xv += gvec.x;
            actor.state.yv += gvec.y;
        }
    }

    const render = (draw) => {
        if(!planetContainer) {
            const svg = document.getElementById('theSvg');
            planetContainer = draw.addChildGroup(svg, 'planetContainer');
        }
        //draw.svg.select('#pl1').remove();
        draw.clearGroup(planetContainer);//doesn't NEED to be redrawn at this point
        //draw.drawCircle('pl1', { x: state.x, y: state.y}, 15.0,2.0, '#d33');
        let circle = draw.createCircle(planetContainer, state.x, state.y, 15.0, 2.0, '#d33');
    }
    return {
        state: state,
        handleKeyEvents: (keyEvents) => {
        },
        render: render,
        step: step,
        preInteraction: preInteraction
    }
}

export default planet;