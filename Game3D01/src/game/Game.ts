import Sprite3D = Laya.Sprite3D;
import Camera = Laya.Camera;
import Vector3 = Laya.Vector3;
import Scene3D =Laya.Scene3D;
import GameBG from "./GameBG";
import Rocker from "./GameRocker";
import GameMap0 from "./GameMap0";
import GamePro from "./GamePro";

export default class Game{

    static Event_PlayStop:string = "Game.Event_PlayStop";
    static Event_Short:string = "Game.Event_Short";
    static Event_Hit:string   = "Game.Event_Hit";

    static HeroArrows:GamePro[] = [];
    //3d层
    static layer3d:Sprite3D = new Sprite3D();
    //3d摄像机
    static camera:Camera;
    //临时v3
    //static v3:Vector3 = new Vector3(0,0,0);
    //3d场景
    static scene3d:Laya.Scene3D;
    //主英雄
    //static hero:Laya.Sprite3D;
    static hero:GamePro;
    //主敌人    
    static e0:GamePro;
    //主箭    
    static a0:GamePro;

    //2d背景
    static bg:GameBG;
    //贴图材质
    static material_blinn:Laya.BlinnPhongMaterial;
    
    static box:Laya.MeshSprite3D;

    static bullet:Laya.MeshSprite3D;
    //摇杆
    static ro:Rocker;

    static cameraY:number = 10;

    static sqrt3:number = 10*Math.sqrt(3);

    static map0:GameMap0;

    //static ani:Laya.Animator;

    static updateMap():void{
        if(Game.map0){
            if(Game.bg){
                Game.map0.x = Game.bg.x;
                Game.map0.y = Game.bg.y;
            }
        }
    }

    constructor(){
        //Laya.Scene3D
    }
}