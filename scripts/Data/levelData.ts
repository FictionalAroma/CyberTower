import { safeGetConstructFileJson } from "../helpers/FileUtiles.js";

export async function LoadLevelDataAsync(runtime: IRuntime)
{
    return safeGetConstructFileJson<LevelData>(runtime, "LevelData.json");	
}

export class LevelData
{
	public levels: Level[] = []
}

export class Level {
    Index: number = 0;
    startMoney: number = 0;
    startLives: number = 0;
}


export class TowerList
{

}

export class Tower
{
	TemplateName = "";
}

