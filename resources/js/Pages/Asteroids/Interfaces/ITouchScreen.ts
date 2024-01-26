import {JoystickManager} from "nipplejs";

export interface ITouchScreen {
    enabled: boolean,
    element1: string,
    joystick1: JoystickManager | null,
    angle1: number,
    force1: number,
    element2: string,
    joystick2: JoystickManager | null,
    angle2: number,
    force2: number,
}
