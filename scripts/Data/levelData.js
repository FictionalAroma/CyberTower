export async function LoadLevelData(runtime)
{
	const playerSettings = await runtime.assets.getProjectFileUrl("LevelData.json");
	const response = await fetch(playerSettings);
	const fetchedText = await response.text();
		
	
	return await JSON.parse(fetchedText);
}

export class LevelData
{
		
	constructor()
	{
		this.Levels = new Level[10];
	}
}

export class Level
{
	Index = 0;
	Score = 0;
	Unlocked = false;

	constructor()
	{

	}
}

