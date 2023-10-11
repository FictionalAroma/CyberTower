
// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";
import {LevelSelect} from "./LevelSelect.js";
import TowerLevelControl from "./towerLevelControl.js";
import {LoadLevelData} from "./Data/levelData.js"

runOnStartup(async runtime =>
{
	// Code to run on the loading screen.
	// Note layouts, objects etc. are not yet available.
	
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime)
{
	// Code to run just before 'On start of layout' on
	// the first layout. Loading has finished and initial
	// instances are created and available to use here.
	
	runtime.addEventListener("tick", () => Tick(runtime));

	
	
	var menuLayout = runtime.getLayout("MainMenu");
	runtime.levelSelect = new LevelSelect(runtime, menuLayout, (l) => LoadLevel(runtime, l));
	runtime.dataset = await LoadLevelData(runtime);
	await runtime.levelSelect.SetLevelData(runtime.dataset);

}

function Tick(runtime)
{
	if(runtime.towerLevelControl !=null)
	{
		runtime.towerLevelControl.OnTick(runtime);
	}
}

function LoadLevel(runtime, levelIndex)
{
	const levelToLoad = runtime.getLayout("Level0");
	const levelData = runtime.dataset.levels[levelIndex]
	if(levelToLoad != null)
	{
		runtime.towerLevelControl = new TowerLevelControl(runtime, levelToLoad, levelData);
		runtime.goToLayout(levelToLoad.name);
	}
}