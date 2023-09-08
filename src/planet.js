import { settings } from "./config";

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
    const render = (draw) => {
        draw.svg.select('#pl1').remove();
        draw.drawCircle('pl1', { x: state.x, y: state.y}, 15.0,2.0, '#d33');
    }
    return {
        state: state,
        handleKeyEvents: (keyEvents) => {
        },
        render: render,
        step: step
    }
}

export default planet;