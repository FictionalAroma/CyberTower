import type IPanelMenu from "./IPanelMenu.js";
import TowerController from "./TowerController.js";
import PanelMenuButton from './PanelMenuButton.js';
import type IMoneySubscriber from "../Interfaces/IMoneySubscriber.js";

export default class TowerUpgradePanel extends InstanceType.TowerUpgradePanel implements IPanelMenu, IMoneySubscriber {
    public selectedItem: TowerController | null = null;
    panelButtons: PanelMenuButton[] | null = null;
    upgradeAction: ((tower: TowerController) => void) | null = null;
    sellAction: ((tower: TowerController) => void) | null = null;
    constructor() {
        super();
    }
    currentMoney: number = 0;
    onMoneyUpdated(updated: number): void {
        this.currentMoney = updated;
        if (this.isVisible) {
            this.updateButtonsEnabled();
        }
    }

    onClickHandler(point: number[]): void {
        this.panelButtons?.forEach((button) => {
            if (button.isCollisionEnabled && button.containsPoint(point[0], point[1]) && button.onClick != undefined) {
                button.onClick();
            }
        });
    }

    show = (tower: TowerController) => {
        this.instVars.TowerUID = tower.uid;
        this.selectedItem = tower;
        this.setPosition(tower.x, tower.y);
        this.isVisible = true;
        this.updateButtonsEnabled();
    };

    updateButtonsEnabled = () => this.panelButtons?.forEach((button) => button.updateEnabed());

    hide = () => {
        this.isVisible = false;
        this.selectedItem = null;
    };

    upgradeEnabledTest = () =>
        this.selectedItem != null && this.selectedItem?.instVars?.UpgradeCost <= this.currentMoney;

    setup = (upgradeAction: (tower: TowerController) => void, sellAction: (tower: TowerController) => void) => {
        this.upgradeAction = upgradeAction;
        this.sellAction = sellAction;

        const upgradeButton = this.runtime.objects.TowerUpgradeButton.getFirstInstance() as PanelMenuButton;
        upgradeButton.setup(this.upgradeEnabledTest, this.upgradeButtonOnClick);
        const sellButton = this.runtime.objects.TowerSellButton.getFirstInstance() as PanelMenuButton;
        sellButton.onClick = this.sellButtonOnClick;

        this.panelButtons = [upgradeButton, sellButton];
    };

    upgradeButtonOnClick = () => {
        if (this.upgradeAction != null && this.selectedItem != null) this.upgradeAction(this.selectedItem);
    };
    sellButtonOnClick = () => {
        if (this.sellAction != null && this.selectedItem != null) this.sellAction(this.selectedItem);
    };
}
