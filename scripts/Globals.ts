import type { LevelData } from "./Data/levelData";
import type { LevelSelectController } from "./LevelSelect/LevelSelectControl";
import PointerHelper from "./helpers/PointerHelper";
import TowerLevelControl from "./towerLevelControl";

const Globals = {
    pointerHelper: <PointerHelper | null>null,
    levelSelect: <LevelSelectController | null>null,
    levelDataset: <LevelData | null> null,
    towerLevelControl: <TowerLevelControl| null> null
    
};

export default Globals;
