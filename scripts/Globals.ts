import type { LevelData } from "./Data/levelData.js";
import type { LevelSelectController } from "./LevelSelect/LevelSelectControl.js";
import PointerHelper from "./helpers/PointerHelper.js";
import TowerLevelControl from "./towerLevelControl.js";

const Globals = {
    pointerHelper: <PointerHelper | null>null,
    levelSelect: <LevelSelectController | null>null,
    levelDataset: <LevelData | null> null,
    towerLevelControl: <TowerLevelControl| null> null
    
};

export default Globals;
