import { settings } from "./config";
import { core } from "./core";
import ReactDOMServer from 'react-dom/server';

const size = 20.0;


function textlog({ id, name, x, y, text }) {
    const state = { ...arguments[0],  physform: false, effectedImune: true };
    state.type = 'textlog';
    let textlogContainer = null;

    const step = (game) => {
    }

    const TextTemplate = () => {
        
        //NOTE: lambdas to not get 'arguments' filled out, so following shows the arguments for parent 'textlog' function call
        //console.log('ARGS', arguments);//lambda
        
        
        // let s = () => `transform(${x},${y})`;
        // let s2 = s();
        // let theText = () => text;
        console.log('text', state.text);
        return ( 
            <g id="textlogContainer">
                <text id="textlog" className="textlog">{state.text}</text>
            </g>
        )
    }

    const getRenderRoot = (id) => {
        return ReactDOMServer.renderToString(<TextTemplate />);
    }

    const render = ( {svgRoot}) => {
        //return ReactDOMServer.renderToString(<TextTemplate id={id} />);
        if (!textlogContainer) {
            textlogContainer = svgRoot.getElementById('textlogContainer');
        }

        textlogContainer.setAttribute('transform', `translate(${state.x},${state.y})`);
    }

    return {
        state,
        handleKeyEvents: (keyEvents) => {},
        render,
        step,
        getRenderRoot
    }
}

export default textlog;