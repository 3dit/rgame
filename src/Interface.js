

const Interface = ({ addPlanetHandler, addAsteroidHandler }) => {

    return (
        <div id="interface">
            <div className="flex row">
                <div className="flex col">
                    <button className="border-2 border-gray-500 rounded p-2 m-2 mr-4 bg-white" onClick={addAsteroidHandler}>Asteroid</button>

                </div>
            </div>
        </div>
    )

}

export default Interface