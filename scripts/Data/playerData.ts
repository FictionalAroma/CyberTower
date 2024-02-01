import { safeGetConstructFileJson, safeJsonParse } from "../helpers/FileUtiles.js";

export function LoadPlayerDataAsync(runtime: IRuntime) : Promise<PlayerData>
{
    return safeGetConstructFileJson<PlayerData>(runtime, "PlayerData.json")	
}

export default class PlayerData
{
	
}