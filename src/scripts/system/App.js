import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { Loader } from "./Loader";
import { ScenesManager } from "./ScenesManager";

class Application {
    run(config) {
        gsap.registerPlugin(PixiPlugin);
        PixiPlugin.registerPIXI(PIXI);

        this.config = config;

        this.app = new PIXI.Application({
            // resolution: devicePixelRatio,
            resizeTo: window
        });
        globalThis.__PIXI_APP__ = this.app;
        document.body.appendChild(this.app.view);

        this.scenes = new ScenesManager();
        this.app.stage.addChild(this.scenes.container);

        this.loader = new Loader(this.app.loader, this.config);
        this.loader.preload().then(() => this.start());
        window.addEventListener("resize", (event) =>{
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
        });

    }

    res(key) {
        return this.loader.resources[key].texture;
    }

    sprite(key) {
        return new PIXI.Sprite(this.res(key));
    }

    music(key) {
        return this.loader.resources[key];
    }

    start() {
        this.scenes.start("Game");
    }
}

export const App = new Application();