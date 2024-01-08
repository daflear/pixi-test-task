import {App} from "../system/App";
import {Scene} from "../system/Scene";
import {Shape} from "../system/Shape";
import gsap from 'gsap/all'
import { sound } from '@pixi/sound';
import * as PIXI from 'pixi.js';
import {Config} from "./Config";

export class Game extends Scene {
    create() {
        this.gridContainer = new PIXI.Container();
        this.shapeInPlaces = [];
        this.userFailed = [];
        this.createBackground();
        this.createRedField();
        this.createCupCake();
        this.createFigures();
        this.createPackshot();
        this.createTutorial();
        let initialScreenWidth = App.app.screen.width;
        let initialScreenHeight = App.app.screen.height;
        window.addEventListener("resize", (event) => {
            const newScreenWidth = window.innerWidth;
            const newScreenHeight = window.innerHeight;
            const positionRatioX = newScreenWidth / initialScreenWidth;
            const positionRatioY = newScreenHeight / initialScreenHeight;

            this.bg.width = window.innerWidth;
            this.bg.height = window.innerHeight;
            this.cupcake.position = {x: this.bg.width / 2, y: this.bg.height / 2};
            this.shapes.forEach((s, i) =>
                s.position = {
                    x: Config.puzzleCoordinates[i].x * positionRatioX,
                    y: Config.puzzleCoordinates[i].y * positionRatioY
                });
        });
    }
    showModal() {
        const blurFilter = new PIXI.filters.BlurFilter();
        blurFilter.blur = 5;
        this.bg.filters = [blurFilter];
        this.packshotContainer.visible = true;
    }

    createPackshot() {
        this.packshot = App.sprite('packshot');
        this.packshotContainer = new PIXI.Container();
        this.packshotContainer.position = {x: window.innerWidth / 2, y: window.innerHeight / 2};
        this.packshot.anchor.set(.5);
        this.packshotContainer.scale.set(1.5)
        this.packshotContainer.addChild(this.packshot);
        this.container.addChild(this.packshotContainer);
        this.packshotContainer.visible = false;
    }

    createTutorial() {
        this.hand = App.sprite('hand');
        this.hand.position = {x: window.innerWidth / 2, y: window.innerHeight / 2};
        this.hand.width = 60;
        this.hand.height = 150;
        this.hand.anchor.set(.5);
        this.bg.addChild(this.hand);
        const masterTimeline = gsap.timeline(
            {repeatDelay: 6,
                  onComplete: ()=>{
                this.startFlashing(this.redFill);
                this.resetShapes();
            }}
        );
        this.shapes.forEach((shape, id) => {
            const loopTimeline = gsap.timeline();
            const cellToMove = Config.cellsPlacement[id + 1] || Config.cellsPlacement[id];
            const cellCoords = this.gridCells[cellToMove.row][cellToMove.col].graphics;
            const cellCenter = this.gridContainer.toGlobal(new PIXI.Point((cellCoords.position.x + cellCoords.width / 2),
                (cellCoords.position.y + cellCoords.height / 2)));
            const globalShapeCoords = this.bg.toLocal(new PIXI.Point(shape.position.x, shape.position.y));
            const localCoords = this.bg.toLocal(new PIXI.Point(cellCenter.x, cellCenter.y));
            loopTimeline
            .to(this.hand.position, {x: globalShapeCoords.x, y: globalShapeCoords.y, duration: 1, ease: 'power1.inOut'})
            .to(this.hand.skew, {y: this.hand.skew.y - .2, duration: 1, ease: 'power1.inOut'},'-=')
            .to(shape.position, {x: cellCenter.x, y: cellCenter.y, duration: 1, ease: 'power1.inOut'},'ongoing')
            .to(this.hand.position, {x: localCoords.x, y: localCoords.y, duration: 1, ease: 'power1.inOut'}, 'ongoing')
            .to(this.hand.skew, {y: this.hand.skew.y + .2, duration: 1, ease: 'power1.inOut'});
            masterTimeline.add(loopTimeline);
        });
        masterTimeline.play();
    }


    createBackground() {
        this.bg = App.sprite("bg");
        this.bg.width = window.innerWidth;
        this.bg.height = window.innerHeight;
        this.container.addChild(this.bg);
    }

    stopFlashing(sprite) {
        setTimeout(() => {
            if (sprite) {
                sprite.alpha = 0;
            }
            this.startFlashing();
        }, .5);
    }

    startFlashing(sprite) {
        gsap.to(sprite, {
            alpha: 1,
            duration: .5,
            repeat: 2,
            yoyo: true,
            onComplete: () => this.stopFlashing(sprite),
        });
    }


    createRedField() {
        this.redFill = App.sprite('red_fill');
        this.redFill.position = {x: window.innerWidth / 2, y: window.innerHeight / 2};
        this.redFill.scale = {x: 0.95, y: 0.95};
        this.redFill.anchor.set(.5);
        this.redFill.alpha = 0;
        this.container.addChild(this.redFill);

    }

    createCupCake() {
        const grid = 61;
        this.grid = [];
        this.gridCells = [];
        this.cupcake = App.sprite('cupcake');
        this.cupcake.position = {x: window.innerWidth / 2, y: window.innerHeight / 2};
        this.cupcake.interactive = true;
        for (let row = 0; row < 7; row++) {
            this.gridCells[row] = [];
            for (let col = 0; col < 4; col++) {
                if (row === 0 && [0, 1, 3].includes(col)) {
                    continue;
                }
                const graphics = new PIXI.Graphics();
                graphics.beginFill(0xe9962b);
                graphics.alpha = 0;
                graphics.interactive = true;
                graphics.drawRect(0, 0, 60, 60);
                graphics.position.set((grid * col),
                    (grid * row));
                this.gridCells[row][col] = {
                    graphics: graphics,
                    position: new PIXI.Point(graphics.position.x, graphics.position.y)
                };
                graphics.endFill();
                this.gridContainer.addChild(graphics);
                this.cupcake.addChild(this.gridContainer);
                this.container.addChild(this.cupcake);
                this.cupcake.anchor.set(.5);
                this.grid.push(graphics);
            }
        }
        this.gridContainer.pivot.set(136, 190);
    };


    userWon() {
        if (App.scenes.scene.shapeInPlaces.length === 6) {
            App.scenes.scene.showModal();
        } else {
            if ((App.scenes.scene.shapeInPlaces.length + App.scenes.scene.userFailed.length) === 6) {
                App.scenes.scene.startFlashing(App.scenes.scene.redFill);
                App.scenes.scene.resetShapes();
            }
        }
    }

    resetShapes() {
        setTimeout(() => {
            this.shapes.map(s=> {
                s.parent?.removeChild(s)
                s.destroy();
            });
            this.shapes = [];
            this.shapeInPlaces = [];
            this.userFailed = [];
            const sprites = this.cupcake.children.filter(child => child instanceof PIXI.Sprite);
            sprites.forEach(sprite => this.cupcake.removeChild(sprite));
            this.createFigures();
        }, 1000);
    }

    createFigures() {
        const pivots = Config.piecesPivots;
        this.shapes = [];
        for (let i = 0; i <= 5; i++) {
            const a = new Shape(i, pivots[i], this.shapeInPlaces, this.userWon, this.userFailed);
            this.shapes.push(a);
        }
        this.shapes.map(f => {
            this.container.addChild(f);
        })
    }
}