// Import any other script files here, e.g.:
// import * as myModule from "./mymodule.js";
import {LevelSelectController} from "./LevelSelect/LevelSelectControl.js";
import TowerLevelControl from "./towerLevelControl.js";
import {LoadLevelDataAsync} from "./Data/levelData.js"
import EnemyControl from "./objectTypes/EnemyBehavior.js";
import TowerController from "./objectTypes/TowerController.js";
import Globals from './Globals.js';
import PointerHelper from "./helpers/PointerHelper.js";
import LevelSelectButtonInstance from "./LevelSelect/LevelSelectButtonInstance.js";


runOnStartup(async runtime =>
{
	// Code to run on the loading screen.
	// Note layouts, objects etc. are not yet available.
	await ConfigureCustomTypes(runtime);
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});



async function OnBeforeProjectStart(runtime: IRuntime)
{
	// Code to run just before 'On start of layout' on
	// the first layout. Loading has finished and initial
	// instances are created and available to use here.
	runtime.addEventListener("tick", () => Tick(runtime));
	Globals.pointerHelper = new PointerHelper(runtime, (pointerevernt: PointerEvent) => OnTap(pointerevernt, runtime));
	
	runtime.getAllLayouts().forEach(layout => {
		if(layout.name.toLowerCase().startsWith("level"))
		{
			var level = parseInt(layout.name.substring(5).trim());
			layout.addEventListener("beforelayoutstart", () => LoadLevel(runtime, layout, level));

			layout.addEventListener("afterlayoutend", TeardownLevel)
		}
	})
	
	const menuLayout = runtime.getLayout("MainMenu");
    const levelDataset = await LoadLevelDataAsync(runtime);

    Globals.levelDataset = levelDataset;
	Globals.levelSelect = new LevelSelectController(runtime, menuLayout, levelDataset, loadLevelCall);
}

const loadLevelCall = (runtime: IRuntime, l: LayoutParameter) => runtime.goToLayout(l);


async function ConfigureCustomTypes(runtime:IRuntime)
{

	const customTypeMapping = [
        {
            ObjectType: EnemyControl,
            ConstructObjectNames: [runtime.objects.BasicEnemy, runtime.objects.BasicEnemy2],
        },
        {
            ObjectType: TowerController,
            ConstructObjectNames: [runtime.objects.basicTower, runtime.objects.basicTower],
        },
        {
            ObjectType: LevelSelectButtonInstance,
            ConstructObjectNames: [runtime.objects.LevelSelectButton],
        },
    ];
	customTypeMapping.forEach(tm => {
		const type = tm.ObjectType;
		tm.ConstructObjectNames.forEach(n => {
			if(n != null)
				n.setInstanceClass(type)
		})
	})
	
}

function Tick(runtime: IRuntime)
{
	Globals.pointerHelper!.OnTick(runtime);
	if (Globals.towerLevelControl != null) {
        Globals.towerLevelControl.OnTick(runtime);
    }
}

function OnTap(pointerEvent: PointerEvent, runtime: IRuntime)
{
	if(Globals.towerLevelControl !=null)
	{
		Globals.towerLevelControl.OnTap(pointerEvent);
	}
}

const LoadLevel = (runtime: IRuntime, layout: ILayout, levelNumber: number) =>{
	const levelData = Globals.levelDataset!.levels[levelNumber]
	Globals.towerLevelControl = new TowerLevelControl(runtime, layout, levelData);
	Globals.towerLevelControl.SetupLevel();
}

function TeardownLevel()
{
	Globals.towerLevelControl!.Teardown();
}