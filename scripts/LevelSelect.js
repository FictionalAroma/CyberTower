


export class LevelSelect
{
	//loadedData = new LevelData();
	constructor(runtime, layout, loadLevelCallback)
	{
		this.runtime = runtime;
		this.layout = layout;
		this.loadLevelCallback = loadLevelCallback;
		
		layout.addEventListener("beforelayoutstart", () => this.loadMenu());
		layout.addEventListener("afterlayoutstart", () => this.setPage(0));

		layout.addEventListener("afterlayoutend", () => this.cleanup());
		
		this.currentPage = 0;
		this.buttonArray = [];
		this.levelPageSize = 10;

		
	}

	cleanup()
	{
		this.buttonArray.splice(0, this.buttonArray.length);
	}
	
	loadMenu()
	{
		if(this.buttonArray.length == 0)
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
	}
	
	
	async SetLevelData(dataset)
	{
		 this.loadedData = dataset;
		
		this.maxPages = Math.floor(this.loadedData.levels.length / this.levelPageSize);
	}
	
	setPage(pageIndex)
	{
		this.currentPage = pageIndex;
		const minIndex = pageIndex * this.levelPageSize;
		const maxIndex = minIndex + this.levelPageSize;
		
		this.prevButton.isEnabled = (pageIndex > 0);
		this.nextButton.isEnabled = (pageIndex < this.maxPages);
		
		const toShow = this.loadedData.levels.slice(minIndex, maxIndex);

		for(let index = 0; index < this.levelPageSize; index++)
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
	
	loadLevel(levelNumber)
	{
		this.loadLevelCallback(0);
	}
}