

export async function LoadPlayerData(runtime)
{
	const playerSettings = runtime.assets.getProjectFileUrl("SaveData.json");
	const response = await fetch(playerSettings);
	const fetchedText = await response.text();
		
	
	return await JSON.parse(fetchedText);
}

export default class PlayerData
{
	
}