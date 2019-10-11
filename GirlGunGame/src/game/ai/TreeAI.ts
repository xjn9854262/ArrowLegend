import FlowerAI from "./FlowerAI";
import Monster from "../player/Monster";
import GamePro from "../GamePro";
import GameBG from "../GameBG";
import Game from "../Game";
import GameHitBox from "../GameHitBox";
import BoomEffect from "../effect/BoomEffect";
import SysBullet from "../../main/sys/SysBullet";
import AttackType from "./AttackType";
import { GameAI } from "./GameAI";

export default class TreeAI extends FlowerAI {

    static mindex:number = 0;
    constructor(pro: Monster) {
        super(pro);
        this.pro.rotation(Math.PI * 0.5);
        if(TreeAI.mindex > 4)
        {
            TreeAI.mindex = 0;
        }
        TreeAI.mindex++;
        this.nextTime = Game.executor.getWorldNow() + this.sysEnemy.enemySpeed * TreeAI.mindex;
    }

    exeAI(pro: GamePro): boolean {
        if (!this.run_) return;
        super.exeAI(pro);
        return false;
    }

    onExe(): void {
        if(this.pro.isDie)
        {
            return;
        }
        this.checkHeroCollision();
        this.jump();
    }


    public jump(): void {
        if (this.status == 0 && this.now >= this.nextTime) {
            this.onJump();
            this.status = 1;
        }


        if (this.status == 1) {
            let isTo = this.pro.move2D(this.pro.face2d);
            if (isTo) {
                if (this.status == 1) {
                    if (this.skillISbs.length > 0) {
                        let sys: SysBullet = this.skillISbs[Math.floor(this.skillISbs.length * Math.random())];
                        if (sys && sys.bulletType == AttackType.AOE) {
                            if (this.now >= this.nextTime) {
                                //AOE伤害
                                this.onAoe(sys);
                                this.nextTime = this.now + this.sysEnemy.enemySpeed * 2;
                                this.status = 0;
                            }
                        }
                        else {
                            if (this.now >= this.nextTime) {
                                this.startAttack();
                                this.shootAc();
                                this.pro.play(GameAI.NormalAttack)
                                this.nextTime = this.now + this.shooting.shootCd * 2;
                                this.status = 0;
                            }
                        }
                    }
                    else {
                        if (this.now >= this.nextTime) {
                            this.startAttack();
                            this.shootAc();
                            this.pro.play(GameAI.NormalAttack)
                            this.nextTime = this.now + this.shooting.shootCd * 2;
                            this.status = 0;
                        }
                    }
                }
                this.status = 0;
            }
        }
    }

    startAttack(): void {
        if(this.pro.isDie)
        {
            return;
        }
        this.shooting._sysBullet = null;

        if (this.normalSb) {//普通射击
            if (this.normalSb.bulletType == AttackType.NORMAL_BULLET || this.normalSb.bulletType == AttackType.RANDOM_BULLET) {
                this.shooting._sysBullet = this.normalSb;
            }
        }
        if (!this.shooting._sysBullet) {
            if (this.skillISbs.length > 0) {//技能射击
                let rand: number = Math.floor(this.skillISbs.length * Math.random());
                let skillBullet: SysBullet = this.skillISbs[rand];
                if (skillBullet.bulletType == AttackType.NORMAL_BULLET || skillBullet.bulletType == AttackType.RANDOM_BULLET) {
                    this.shooting._sysBullet = skillBullet//子弹
                }
            }
        }
    }

    /**aoe */
    private onAoe(bullet: SysBullet): void {
        BoomEffect.getEffect(this.pro, bullet);
    }

    /**跳跃 */
    public onJump(): void {
        this.pro.sp3d.transform.localPositionY = 0;
        let toArr:number[] = Game.getRandPos(this.pro);
        if (toArr.length == 2) {
            let toX = toArr[0] * GameBG.ww;
            let toY = toArr[1] * GameBG.ww;
            // Game.bloodLayer.graphics.clear();
            // Game.bloodLayer.graphics.drawCircle(toX,toY,10,"#ff0000");
            if (toX && toY)  {
                // this.pro.setSpeed(this.sysEnemy.moveSpeed);
                
                this.pro.curLen = 0;
                this.pro.moveLen = Math.sqrt((this.pro.hbox.y - toY) * (this.pro.hbox.y - toY) + (this.pro.hbox.x - toX) * (this.pro.hbox.x - toX));
                this.pro.setSpeed(Math.ceil(this.pro.moveLen / GameBG.ww));

                var xx:number = toX -this.pro.hbox.x;
                var yy:number = this.pro.hbox.y - toY;
                this.pro.rotation(Math.atan2(yy,xx));
            }

        }
    }
}