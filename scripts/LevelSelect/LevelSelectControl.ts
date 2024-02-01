import type { LevelData } from "../Data/levelData.js";
import type LevelSelectButtonInstance from "./LevelSelectButtonInstance.js";

export type LoadLevelCallback = (runtime: IRuntime, lp: LayoutParameter) => void

export class LevelSelectController {
    runtime: IRuntime;
    layout: ILayout;
    loadLevelCallback: LoadLevelCallback;
    currentPage: number;
    buttonArray: LevelSelectButtonInstance[] = [];
    levelPageSize: number;
    prevButton: InstanceType.LevelSelectPrev | null = null;
    nextButton: InstanceType.LevelSelectNext | null = null;
    loadedData: any;
    maxPages: number;

    //loadedData = new LevelData();
    constructor(runtime: IRuntime, layout: ILayout, levelDataset: LevelData, loadLevelCallback: LoadLevelCallback) {
        this.runtime = runtime;
        this.layout = layout;
        this.loadLevelCallback = loadLevelCallback;
        this.loadedData = levelDataset;
        layout.addEventListener("beforelayoutstart", () => this.loadMenu());
        layout.addEventListener("afterlayoutstart", () => this.setPage(0));

        layout.addEventListener("afterlayoutend", () => this.cleanup());

        this.currentPage = 0;
        this.levelPageSize = 10;

        this.maxPages = Math.floor(this.loadedData.levels.length / this.levelPageSize);

    }

    cleanup() {
        this.buttonArray.splice(0, this.buttonArray.length);
    }

    loadMenu() {
        if (this.buttonArray.length == 0) {
            this.buttonArray = this.runtime.objects.LevelSelectButton.getAllInstances<LevelSelectButtonInstance>();
            this.buttonArray.forEach((button: LevelSelectButtonInstance) => {
                button.addEventListener("click", () => this.loadLevel(button.levelToLoad));
            });

            this.prevButton = this.runtime.objects.LevelSelectPrev.getFirstInstance();
            if (this.prevButton != null) {
                this.prevButton.addEventListener("click", () => {
                    const newPage = Math.max(this.currentPage - 1, 0);
                    if (newPage != this.currentPage) {
                        this.setPage(newPage);
                    }
                });
            }
            this.nextButton = this.runtime.objects.LevelSelectNext.getFirstInstance();
            if (this.nextButton != null) {
                this.nextButton.addEventListener("click", () => {
                    const newPage = Math.min(this.currentPage + 1, this.maxPages);
                    if (newPage != this.currentPage) {
                        this.setPage(newPage);
                    }
                });
            }
        }
    }

    setPage(pageIndex: number) {
        this.currentPage = pageIndex;
        const minIndex = pageIndex * this.levelPageSize;
        const maxIndex = minIndex + this.levelPageSize;

        this.prevButton!.isEnabled = pageIndex > 0;
        this.nextButton!.isEnabled = pageIndex < this.maxPages;

        const toShow = this.loadedData.levels.slice(minIndex, maxIndex);

        for (let index = 0; index < this.levelPageSize; index++) {
            const button = this.buttonArray[index];
            if (index < toShow.length) {
                var levelToShow = toShow[index];

                button.text = "Level " + levelToShow.index;
                button.levelToLoad = levelToShow.index;
                button.isEnabled = levelToShow.unlocked;
                button.isVisible = true;
            } else {
                button.isVisible = false;
            }
        }
    }

    loadLevel(levelNumber: number) {
        this.loadLevelCallback(this.runtime, "level0");
    }
}