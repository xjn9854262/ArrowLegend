import Game from "../Game";
import GamePro from "../GamePro";
import GameProType from "../GameProType";

export default class HitEffect {
    static TAG: string = "HitEffect";

    public player: GamePro;
    public sp3d: Laya.Sprite3D;
    constructor() {
        let ss: Laya.Sprite3D = Laya.loader.getRes("h5/bulletsEffect/20000/monster.lh");
        this.sp3d = Laya.Sprite3D.instantiate(ss);
    }
    
    static addEffect(player: GamePro): HitEffect  {
        let effect: HitEffect = Laya.Pool.getItemByClass(HitEffect.TAG, HitEffect);
        effect.player = player;
        if (effect.player && effect.player.sp3d && effect.sp3d && effect.sp3d.transform)  {
            effect.player.sp3d.addChild(effect.sp3d);
        }

        Laya.timer.once(500, this, () => {
            effect.recover();
        })
        return effect;
    }

    recover(): void  {
        this.sp3d && this.sp3d.removeSelf();
        this.player = null;
        Laya.Pool.recover(HitEffect.TAG, this);
    }
}