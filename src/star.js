import { settings } from "./config";
import { core } from "./core";
import ReactDOMServer from 'react-dom/server';

function star({ id, name, x, y, xv, yv, a, av }) {
    const rayCnt = settings.star.rays;
    const size = settings.star.size;
    const fadeCoefficent = 0.01; //originally "2.0 * distance / .01"
    const state = { ...arguments[0], t: 0, physform: false };
    console.log(state);
    state.enabled = false;

    let starContainer = null;

    const step = (game) => {
        //star grav effects
        if(!state.enabled) return;
        game.actors.forEach((o, i, a) => {
            //debugger;
            if (o.state.id != state.id && o.state.physform) {
                let gvec = core.gravityVector({ x: state.x, y: state.y }, { x: o.state.x, y: o.state.y }, settings.star.grav);
                o.state.xv += gvec.x;
                o.state.yv += gvec.y;
            }
        });
    }

    const getRenderRoot = (id) => {
        const RenderRoot = () => {
            return (
                <g id="starContainer" style={{'display':'none'}}>
                    <defs>
                        <radialgradient id="starGradiant">
                            <stop offset="10%" stopColor="gold" />
                            <stop offset="90%" stopColor="red" />
                        </radialgradient>
                    </defs>
                    <circle 
                        cx={settings.display.width / 2.0} 
                        cy={settings.display.height / 2.0} 
                        r="10" fill="url('#starGradiant')">
                    </circle>
                </g>
            )
        }

        console.log('Rendering Star');
        return ReactDOMServer.renderToString(<RenderRoot />);
    }

    const render = (draw) => {
        if(state.enabled) {
            document.getElementById('starContainer')?.setAttribute('style','display:block');
        } else {
            document.getElementById('starContainer')?.setAttribute('style','display:none');
        }
        // for (let i = 0; i < rayCnt; i++) {
        //     let a = Math.random() / draw.dtor;
        //     let corona = Math.random() * size / 8;
        //     let red = (parseInt(Math.random() * 40 + 200)).toString(16);
        //     let green = (parseInt(Math.random() * 40)).toString(16);
        //     let blue = (parseInt(Math.random() * 20)).toString(16);
        //     let color = `#${red}${green}${blue}`;
        //     color = '#fff';
        //     const newLine = draw.createLine(starContainer, 0, 0, Math.sin(a) * (size + corona), Math.cos(a) * (size + corona), 3, color);
        //     newLine.setAttribute('transform',`translate(${settings.star.xpos},${settings.star.ypos})`);
        // }
    }
    return {
        state: state,
        handleKeyEvents: (keyEvents) => { },
        render: render,
        step: step,
        getRenderRoot: getRenderRoot
    }
}

export default star;