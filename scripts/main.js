
// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";
import {LevelSelect} from "./LevelSelect.js";

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
	runtime.levelSelect = new LevelSelect(runtime, menuLayout);
	await runtime.levelSelect.LoadLevelData(runtime);
	
	
}

function Tick(runtime)
{
	
}
