import "./styles.css";
import { settings } from "./config";
import Game from "./Game";
import Interface from "./Interface";

export default function App() {
  return (
    <div className="App">
      <Game/>
      <Interface/>
    </div>
  );
}
