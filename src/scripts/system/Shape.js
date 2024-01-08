import {Sprite} from "pixi.js";
import {App} from "./App";
import {Config} from "../game/Config";
import * as PIXI from "pixi.js";

export class Shape extends Sprite {
    constructor(id, pivot, arrayOfCorrectShapes,callback,userFailed) {
        super();
        this.create(id, pivot);
        this.dragging = false;
        this.inPlace = false;
        this.type = id;
        this.callBack = callback;
        this.userFailed = userFailed
        this.arrayOfCorrectShapes = arrayOfCorrectShapes;
        this.on('mousedown', this.onDragStart, this);
        this.on('mouseup', this.onDragEnd, this);
        this.on('mousemove', this.onDragMove, this);

    }

    onDragMove(event) {
        if (this.dragging) {
            const newPosition = event.data.getLocalPosition(this.parent);
            this.position.x = newPosition.x;
            this.position.y = newPosition.y;
        }
    }

    getCenterAndGridCellOfClosestGridElement(sprite) {
        const spritePosition = sprite.getGlobalPosition();
        let chosenCell = null;
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 4; col++) {
                if(row === 0  && [0, 1, 3].includes(col)) {
                    continue;
                }
                const {graphics} = App.scenes.scene.gridCells[row][col] || {};
                if (graphics?.containsPoint(spritePosition)) {
                    chosenCell = graphics;
                    if(this.checkPlace({row,col,type: this.type})){
                        this.arrayOfCorrectShapes.push(this.type);
                    }else {
                        this.userFailed.push(this.type)
                    }
                    return chosenCell;
                }
            }

        }
        return chosenCell;
    }

    onDragStart(e) {
        if (!this.inPlace) {
            this.alpha = 0.5;
            this.x = e.data.global.x;
            this.y = e.data.global.y;
            this.dragging = true;
        }
    }

    onDragEnd(e) {
        if (!this.inPlace) {
            this.x = e.data.global.x;
            this.y = e.data.global.y;
            this.alpha = 1;
            this.dragging = false;
            const chosenCell = this.getCenterAndGridCellOfClosestGridElement(this);
            if (chosenCell) {
                const newPiece = new Sprite(this.texture);
                App.scenes.scene.cupcake.addChild(newPiece);
                App.scenes.scene.container.removeChild(this);
                const gContainer = App.scenes.scene.gridContainer;
                const cellCenter = gContainer.toGlobal(new PIXI.Point((chosenCell.position.x + chosenCell.width / 2),
                    (chosenCell.position.y + chosenCell.height / 2)));
                const localPosition = newPiece.parent.toLocal(cellCenter);
                newPiece.pivot.set(this.pivot.x, this.pivot.y);
                newPiece.anchor.set(.5);
                newPiece.position.set(localPosition.x,
                    localPosition.y);
            }
        }
        this.callBack();
    }

    create(id, pivot) {
        this.texture = App.sprite(`figure${id}`).texture;
        this.anchor.set(.5);
        this.pivot = {x: pivot.x, y: pivot.y};
        const newScreenWidth = window.innerWidth;
        const newScreenHeight = window.innerHeight;
        const positionRatioX = newScreenWidth / App.app.screen.width;
        const positionRatioY = newScreenHeight / App.app.screen.height;
        this.position = {x:Config.puzzleCoordinates[id].x * positionRatioX,y: Config.puzzleCoordinates[id].y * positionRatioY };
        this.interactive = true;
    }

    checkPlace(args) {
        return Config.cellsPlacement[this.type].row === args.row && Config.cellsPlacement[this.type].col === args.col;
    };

}