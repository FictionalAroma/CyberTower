export default class PanelMenuButton extends ISpriteInstance
{
    constructor(enabledTest)
    {
        this.enabledTest = enabledTest;
        super();

    }

    updateEnabed()
    {
        const enable = this.isVisible && this.enabledTest();
        this.
    }
}