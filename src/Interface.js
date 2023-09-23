import { useState } from "react";

const Interface = ({ addPlanetHandler, addAsteroidHandler, starToggleHandler, stopToggleHandler }) => {

    const [stopState, setStopState] = useState(false);

    let baseStyling = "border-2 border-gray-500 rounded p-2 m-2 mr-4";
    let class1 = `${baseStyling} bg-white text-black`;
    let class2 = `${baseStyling} ${stopState ? 'bg-red-500 text-white' : 'bg-white text-black'}`;

    const toggleStopState = () => {
        stopToggleHandler();
        setStopState(!stopState);
    }

    return (
        
        <div id="interface">
            <div className="flex row">
                <div className="flex col">
                    <button className={class1} onClick={addAsteroidHandler}>Asteroid</button>
                    <button className={class1} onClick={starToggleHandler}>Star</button>
                    <button className={class2} onClick={toggleStopState}>Stop</button>
                </div>
            </div> 
        </div>
    )

}

export default Interface