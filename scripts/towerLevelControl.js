export default class TowerLevelControl
{
    tapDelay = 0.25;
    constructor(runtime, layout, level)
    {
        this.runtime = runtime;
        this.layout = layout;
        this.level = level;
        this.towerLayer = layout.getLayer(2);
        this.gridLayer = layout.getLayer(0);
        layout.addEventListener("beforelayoutstart", () => this.SetupLevel());

    }

    SetupLevel()
    {
        this.tilemap = this.runtime.objects.Tilemap.getFirstInstance();
        this.spawnPoint = this.runtime.objects.SpawnPoint.getFirstInstance();
        this.TowerMap = makeArray(this.tilemap.mapDisplayWidth, this.tilemap.mapDisplayHeight, false)

        this.runtime.addEventListener("pointerdown", (pointerEvent) => this.OnPointerDown(pointerEvent));
        this.runtime.addEventListener("pointerup", (pointerEvent) => this.OnPointerUp(pointerEvent));
    }

    OnPointerDown(pointerEvent)
    {
        this.currentTapDelay = this.tapDelay;
    }

    OnPointerUp(pointerEvent)
    {
        
        if(this.currentTapDelay > 0) 
        {
            this.OnTap(pointerEvent);
        }
    
    }

    OnTap(pointerEvent)
    {

        let mouseXYAr = this.towerLayer.cssPxToLayer(pointerEvent.clientX, pointerEvent.clientY);
        const towers = this.runtime.objects.Towers.getAllInstances();
        const foundTower = towers.find(s => s.containsPoint(mouseXYAr[0], mouseXYAr[1]));
        if(foundTower == null) 
        {
            mouseXYAr = this.gridLayer.cssPxToLayer(pointerEvent.clientX, pointerEvent.clientY);
            if(this.tilemap.containsPoint(mouseXYAr[0], mouseXYAr[1]))
            {   
                const tileSizeX = this.tilemap.tileWidth;
                const tileSizeY = this.tilemap.tileHeight;
                
                const cellCoords = [Math.floor(mouseXYAr[0]/tileSizeX), Math.floor(mouseXYAr[1]/tileSizeY)]
                const towerMapResult = this.TowerMap[cellCoords[0]][cellCoords[1]];
                if(towerMapResult != true)
                {
                    this.runtime.objects.basicTower.createInstance(2, cellCoords[0]*tileSizeX + tileSizeX/2, cellCoords[1]*tileSizeY + tileSizeY/2, true, "");
                    this.TowerMap[cellCoords[0]][cellCoords[1]] = true;
                }
            }
        }
        
    }

    OnTick(runtime) {
        this.currentTapDelay -= runtime.dt;
    }

    Teardown()
    {
        layout.removeEventListener("beforelayoutstart", () => this.SetupLevel());
        this.runtime.removeEventListener("pointerdown", (pointerEvent) => this.OnPointerDown(pointerEvent));
        this.runtime.addEventListener("pointerup", (pointerEvent) => this.OnPointerUp(pointerEvent));
    }

}

function makeArray(w, h, val) {
    var arr = [];
    for(let i = 0; i < h; i++) {
        arr[i] = [];
        for(let j = 0; j < w; j++) {
            arr[i][j] = val;
        }
    }
    return arr;
}