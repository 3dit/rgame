import { settings } from "./config";
import { core } from "./core";


const dtor = Math.PI / 180.0;

const size = 15;


function planet({ id, name, x, y, xv, yv, a, av }) {
    console.log('ship', arguments);
    this.x = x;
    this.y = y;
    const state = {...arguments[0], t:0, tv:0, physform: true};
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

        //for now this can be handled generically by Game
        // if (game.ship.x > settings.display.width) game.ship.x -= settings.display.width;
        // if (game.ship.x < 0) game.ship.x += settings.display.width;
        // if (game.ship.y > settings.display.height) game.ship.y -= settings.display.height;
        // if (game.ship.y < 0) game.ship.y += settings.display.height;
    }
    const preInteraction = (actor) => {
        if(actor.state.name === "ship") {
            let gvec = core.gravityVector( { x: state.x, y: state.y}, { x:actor.state.x, y:actor.state.y }, settings.planet.grav);
            actor.state.xv += gvec.x;
            actor.state.yv += gvec.y;
            // console.log('shgi');
            // const xdelta = state.x - actor.state.x;
            // const ydelta = state.y - actor.state.y;
            // const distance = Math.sqrt(Math.pow(xdelta, 2) + Math.pow(ydelta, 2));
            // const ga = Math.atan2( ydelta, xdelta );
            // const dc = 900 / (distance < 0.4 ? 0.4 : distance);
            // actor.state.xv += Math.cos(ga) * (settings.planet.grav * dc);
            // actor.state.yv += Math.cos(ga) * (settings.planet.grav * dc);
        }
    }
    const render = (draw) => {
        draw.svg.select('#pl1').remove();
        draw.drawCircle('pl1', { x: state.x, y: state.y}, 15.0,2.0, '#d33');
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