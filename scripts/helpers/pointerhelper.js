export default class PointerHelper
{
    tapDelay = 0.25;

    constructor(runtime, onTapCallback)
    {
        runtime.addEventListener("pointerdown", this.OnPointerDown);
        runtime.addEventListener("pointerup", this.OnPointerUp);
        this.OnTap = onTapCallback;
    } 
    OnPointerDown = (pointerEvent) =>
    {
        this.currentTapDelay = this.tapDelay;
    }

    OnTick = (runtime) =>
    {
        this.currentTapDelay -= runtime.dt;
    }

    OnPointerUp = (pointerEvent) =>
    {
        if(this.currentTapDelay > 0) 
        {
            this.OnTap(pointerEvent);
        }
    }
}
