// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";
import {LevelSelect} from "./LevelSelect.js";
import TowerLevelControl from "./towerLevelControl.js";
import {LoadLevelData} from "./Data/levelData.js"
import EnemyBehaviour from "./objectTypes/EnemyBehavior.js";
import PointerHelper from "./helpers/pointerhelper.js";
import TowerController from "./objectTypes/TowerController.js";

runOnStartup(async runtime =>
{
	// Code to run on the loading screen.
	// Note layouts, objects etc. are not yet available.
	await ConfigureCustomTypes(runtime);
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));

});


async function OnBeforeProjectStart(runtime)
{
	// Code to run just before 'On start of layout' on
	// the first layout. Loading has finished and initial
	// instances are created and available to use here.
	runtime.addEventListener("tick", () => Tick(runtime));
	runtime.PointerHelper = new PointerHelper(runtime, (pointerevernt) => OnTap(pointerevernt, runtime));
	
	runtime.getAllLayouts().forEach(layout => {
		if(layout.name.toLowerCase().startsWith("level"))
		{
			layout.levelIndex = parseInt(layout.name.substring(5).trim());
			layout.addEventListener("beforelayoutstart", () => LoadLevel(runtime, layout));

			layout.addEventListener("afterlayoutend", ()=> TeardownLevel(runtime, layout))
		}
	})
	
	var menuLayout = runtime.getLayout("MainMenu");
	runtime.levelSelect = new LevelSelect(runtime, menuLayout, (l) => runtime.goToLayout(l));
	runtime.dataset = await LoadLevelData(runtime);
	await runtime.levelSelect.SetLevelData(runtime.dataset);

}

async function ConfigureCustomTypes(runtime)
{

	const customTypeMapping = [{
		ObjectType: EnemyBehaviour,
		ConstructObjectNames: ["BasicEnemy", "BasicEnemy2"] 
	},
	{
		ObjectType: TowerController,
		ConstructObjectNames: ["BasicTower1", "BasicTower2"]
	}]
	customTypeMapping.forEach(tm => {
		const type = tm.ObjectType;
		tm.ConstructObjectNames.forEach(n => {
			const objType = runtime.objects[n]
			if(objType != null)
				objType.setInstanceClass(type)
		})
	})
	
}

function Tick(runtime)
{
	runtime.PointerHelper.OnTick(runtime);
	if(runtime.towerLevelControl !=null)
	{
		runtime.towerLevelControl.OnTick(runtime);
	}
}

function OnTap(pointerEvent, runtime)
{
	if(runtime.towerLevelControl !=null)
	{
		runtime.towerLevelControl.OnTap(pointerEvent);
	}
}

function LoadLevel(runtime, layout)
{
	const levelData = runtime.dataset.levels[layout.levelIndex]
	runtime.towerLevelControl = new TowerLevelControl(runtime, layout, levelData);
	runtime.towerLevelControl.SetupLevel();
}

function TeardownLevel(runtime, layout)
{
	runtime.towerLevelControl.Teardown();
}