import IData from "./IData";
import App from "../../core/App";
import SysRoleBase from "../../main/sys/SysRolebase";
import SysRoleUp from "../../main/sys/SysRoleUp";
import Session from "../../main/Session";
import { GoldType } from "./HomeData";
import FlyUpTips from "../../main/FlyUpTips";
import GameEvent from "../../main/GameEvent";
import { GOLD_CHANGE_TYPE } from "../../UseGoldType";
import HeroBaseData from "./HeroBaseData";
import Equip from "./Equip";

/**
 * 角色类 有女海盗 有坦克车 等等
 */
export default class HeroData implements IData{
    public heroMap:any = {};
    public nowRoleId:number = 1;
    
    constructor(){
        
    }

    public setData(data:any):void{
        this.initData(null);
        let str:string = data.heroData;
        let arr = str.split(".");
        for( let v of arr ){
            let hd = new HeroBaseData();
            hd.setString( v );
            this.heroMap[hd.id] = hd;
        }
        this.nowRoleId = (data.nowRoleId?data.nowRoleId:1);
    }
    
    public saveData(data:any):void{
        let arr:Array<any> = [];
        for( let k in this.heroMap ){
            let hd:HeroBaseData = this.heroMap[k];
            arr.push( hd.getString() );
        }
        data.heroData = arr.join(".");
        data.nowRoleId = this.nowRoleId;
    }
    
    public initData(data:any):void{
        let arr:SysRoleBase[] = App.tableManager.getTable(SysRoleBase.NAME);
        for( let k of arr ){
            let hd = new HeroBaseData();
            hd.id = k.id;
            hd.initData();
            this.heroMap[hd.id] = hd;
        }
        this.nowRoleId = 1;
    }

    /**
     * @param heroId 得到英雄的等级
     * @param type 
     */
    public getHeroLv( heroId:number , type:HeroLvType ):number{
        let hd:HeroBaseData = this.heroMap[heroId];
        return hd.getLv( type );
    }

    public getHeroBaseData(heroId:number):HeroBaseData{
        return this.heroMap[heroId];
    }

    public getBaseTime( type:HeroLvType , heroId:number ):number{
        let b = this.getHeroBaseData( heroId );
        if( type == HeroLvType.ATK ){
            return b.atkTime;
        }
        return b.hpTime;
    }

    /**
     * 得到某位英雄具体的数值 给战场用的
     * @param heroId 
     */
    public getHeroData( heroId:number ):Equip{
        let e = new Equip();
        let sysRB = SysRoleBase.getSys( heroId );
        e.atk = sysRB.baseAtk + this.getValue( heroId , HeroLvType.ATK ) * (1 + Session.talentData.addCompose) + Session.talentData.equip.atk;
        e.hp  = sysRB.baseHp  + this.getValue( heroId , HeroLvType.HP )  * (1 + Session.talentData.addCompose) + Session.talentData.equip.hp;
        
        e.atk = parseInt( e.atk + "");
        e.hp  = parseInt( e.hp + "" );
        
        console.log( sysRB.baseAtk , this.getValue( heroId , HeroLvType.ATK ) , Session.talentData.addCompose , Session.talentData.equip.atk );
        console.log( sysRB.baseHp  , this.getValue( heroId , HeroLvType.HP )  , Session.talentData.addCompose , Session.talentData.equip.hp );

        e.dodge = sysRB.baseDodge;
        e.moveSpeed = sysRB.baseMove;
        e.atkSpeed = sysRB.baseSpeed;
        e.crit = sysRB.baseCrit;
        e.critEffect = sysRB.baseCritHurt;
        e.initSkillId = sysRB.baseSkill;
        
        return e;
    }

    public getValue( heroId:number, type:HeroLvType ):number{
        let lv = this.getHeroLv( heroId , type );
        //let sys = SysRoleUp.getSysRole( heroId , lv );
        return SysRoleUp.getAddValue( heroId , lv , type );
        //return sys.getValue( type );
    }


    /**
     * 能力升级 先费红蓝宝石
     * 最后费金币
     * @param heroId 
     * @param type 
     * 0是成功
     */
    public lvUp( heroId:number , type:HeroLvType ):number{
        let hd:HeroBaseData = this.heroMap[heroId];
        let lv = hd.getLv( type );
        // if( lv >= Session.homeData.playerLv ){
        //     return 1;
        // }
        let sys:SysRoleUp = SysRoleUp.getSysRole( heroId , lv );
        let cost = sys.getCost(type);
        let goldType = sys.getCostType(type);
        if( Session.homeData.getGoldByType( goldType ) < cost ){
            return 2;
        }
        let nowLv = lv + 1;
        let nowSys = SysRoleUp.getSysRole( heroId , nowLv );
        if( nowSys == null ){
            //已经到头了 无法升级
            return 3;
        }
        if( Session.homeData.getGoldByType( GoldType.GOLD ) < sys.costGold ){
            return 4;
        }
        let sysRB:SysRoleBase = App.tableManager.getDataByNameAndId( SysRoleBase.NAME , heroId );
        if( nowLv > sysRB.roleLimt ){
            return 5;
        }
        Session.homeData.changeGold( goldType ,  -cost , GOLD_CHANGE_TYPE.HERO_LV_ABILITY );
        Session.homeData.changeGold( GoldType.GOLD , -sys.costGold , GOLD_CHANGE_TYPE.AD_DIAMOND );
        hd.setLv( type , nowLv );
        Laya.stage.event( GameEvent.HERO_UPDATE );
        Session.saveData();
        return 0;
    }

    public canLvUp():boolean{
        let arr = App.tableManager.getTable(SysRoleBase.NAME);
        for( let a of arr ){    
            if( this.test( a.id , HeroLvType.HP ) ){
                return true;
            }
            if( this.test( a.id , HeroLvType.ATK ) ){
                return true;
            }
        }
        return false;
    }

    public test( heroId:number , type:HeroLvType ):boolean{
        let hd:HeroBaseData = this.heroMap[heroId];
        let lv = hd.getLv( type );
        let sys:SysRoleUp = SysRoleUp.getSysRole( heroId , lv );
        let cost = sys.getCost(type);
        let goldType = sys.getCostType(type);
        if( Session.homeData.getGoldByType( goldType ) < cost ){
            return false;
        }
        let nowLv = lv + 1;
        let nowSys = SysRoleUp.getSysRole( heroId , nowLv );
        if( nowSys == null ){
            //已经到头了 无法升级
            return false;
        }
        if( Session.homeData.getGoldByType( GoldType.GOLD ) < sys.costGold ){
            return false;
        }
        let sysRB:SysRoleBase = App.tableManager.getDataByNameAndId( SysRoleBase.NAME , heroId );
        if( nowLv > sysRB.roleLimt ){
            return false;
        }
        return true;
    }
}

export enum HeroLvType{
    ATK = 0,
    HP = 1
}