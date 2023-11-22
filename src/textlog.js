import { settings } from "./config";
import { core } from "./core";
import ReactDOMServer from 'react-dom/server';

const size = 20.0;

// should textlog function be more like following?
// 
// function textlog2(input) {
//     const state = { ...input, physform: false, effectedImune: true, type: 'textlog' };
//     let textlogCOntainer = null;
//     ...
//     ...
// }

function textlog({ id, name, x, y, text }) {
    const state = { ...arguments[0],  physform: false, effectedImune: true };
    state.type = 'textlog';
    let textlogContainer = null;

    const step = (game) => {
    }

    const TextTemplate = () => {
        
        //NOTE: lambdas to not have implicit 'arguments' prop available, 
        //so following would reference 'arguments' prop from parent 'textlog' function call
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

    const getRootTemplate = (id) => {
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
        getRootTemplate
    }
}

export default textlog;