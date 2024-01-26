import {IShipType} from "../Interfaces/IShipType";

export class ShipType implements IShipType {

    name: string;
    shieldRadius: number;
    speed: number;
    life: number;
    radius: number;

    constructor(name: string, radius: number, shieldRadius: number, speed: number, life: number) {
        this.name = name
        this.radius = radius
        this.shieldRadius = shieldRadius
        this.speed = speed
        this.life = life
    }

}
