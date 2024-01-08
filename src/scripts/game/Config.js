import { Game } from "./Game";
import { Tools } from "../system/Tools";

export const Config = {
    loader: Tools.massiveRequire(require["context"]('./../../sprites/', true, /\.(mp3|png|jpe?g)$/)),
    scenes: {
        "Game": Game
    },
    puzzleCoordinates: [
        {x:383,y:294},
        {x:825,y:263 },
        {x:286,y:551 },
        {x:885,y:565 },
        {x:900,y:790 },
        {x:350,y:790 },
    ],
    cellsPlacement :
        {
            0: {
                row: 0,
                col: 2,
            },
            1: {
                row:5,
                col:0
            },
            2: {
                row: 1,
                col: 3
            },
            3: {
                row: 2,
                col: 0
            },
            4:{
                row: 2,
                col: 2
            },
            5: {
                row:5,
                col:3
            }
        },
    piecesPivots: [
        {x: 38, y: 20},
        {x: 0, y: 0},
        {x: -25, y: 0},
        {x: -10, y: 0},
        {x: -25, y: 0},
        {x: 0, y: 0}
    ]
};