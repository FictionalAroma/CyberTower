import {LoadLevelData} from "./Data/levelData.js"

const levelPageSize = 10;

export class LevelSelect
{
	//loadedData = new LevelData();
	constructor(runtime, layout)
	{
		this.runtime = runtime;
		this.layout = layout;
		
		
		layout.addEventListener("beforelayoutstart", () => this.loadMenu());
		
		this.currentPage = 0;

		
	}
	
	loadMenu()
	{
		if(this.buttonArray == null)
		{
			this.buttonArray = this.runtime.objects.LevelSelectButton.getAllInstances();
			this.buttonArray.forEach(button => 
			{
				button.addEventListener("click", () => this.loadLevel(this.runtime, button.levelToLoad))				
			});
			
			this.prevButton = this.runtime.objects.LevelSelectPrev.getFirstInstance();
			if(this.prevButton != null)
			{
				this.prevButton.addEventListener("click", () => {
					const newPage = Math.max(this.currentPage - 1, 0)
					if(newPage != this.currentPage)
					{
						this.setPage(newPage);
					}
				});
			}
			this.nextButton = this.runtime.objects.LevelSelectNext.getFirstInstance();
			if(this.nextButton != null)
			{
				this.nextButton.addEventListener("click", () => {
					const newPage = Math.min(this.currentPage + 1, this.maxPages)
					if(newPage != this.currentPage)
					{
						this.setPage(newPage);
					}
				});
			}
		}
		
		this.setPage(0);
	}
	
	
	async LoadLevelData(runtime)
	{
		 this.loadedData = await LoadLevelData(runtime);
		
		this.maxPages = Math.floor(this.loadedData.levels.length / levelPageSize);
	}
	
	setPage(pageIndex)
	{
		this.currentPage = pageIndex;
		const minIndex = pageIndex * levelPageSize;
		const maxIndex = minIndex + levelPageSize;
		
		this.prevButton.isEnabled = (pageIndex > 0);
		this.nextButton.isEnabled = (pageIndex < this.maxPages);
		
		const toShow = this.loadedData.levels.slice(minIndex, maxIndex);

		for(let index = 0; index < levelPageSize; index++)
		{
			const button = this.buttonArray[index];
			if(index < toShow.length)
			{
				var levelToShow = toShow[index];

				button.text = "Level " + levelToShow.index;
				button.levelToLoad = levelToShow.index;
				button.isEnabled = levelToShow.unlocked;
				button.isVisible = true;
			}
			else
			{
				button.isVisible = false;
			}
		}

	}
	
	loadLevel(runtime, levelNumber)
	{
		runtime.goToLayout("Level0");
	}
}