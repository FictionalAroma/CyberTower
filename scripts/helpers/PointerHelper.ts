export type onTapCallback = (name: PointerEvent) => void;

export default class PointerHelper {
    public tapDelay = 0.25;
    public OnTap: onTapCallback;
    currentTapDelay: number | null = null;

    constructor(runtime: IRuntime, onTapCallback: onTapCallback) {
        runtime.addEventListener("pointerdown", this.OnPointerDown);
        runtime.addEventListener("pointerup", this.OnPointerUp);
        this.OnTap = onTapCallback;
    }
    OnPointerDown = (pointerEvent: PointerEvent) => {
        this.currentTapDelay = this.tapDelay;
    };

    OnTick = (runtime:IRuntime) => {
        if (this.currentTapDelay != null) 
            this.currentTapDelay -= runtime.dt;
    };

    OnPointerUp = (pointerEvent: PointerEvent) => {
        if (this.currentTapDelay != null) 
        {
            if (this.currentTapDelay > 0) {
                this.OnTap(pointerEvent);
            }
        }
    };
}
