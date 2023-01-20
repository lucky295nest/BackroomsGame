let canvas = document.getElementById("renderCanvas");
let engine = new BABYLON.Engine(canvas, true);

class Orb {
    constructor(width, height) {
        let xPos = Math.floor(Math.random() * width) - width * 0.5;
        let zPos = Math.floor(Math.random() * height) - height * 0.5;

        this.light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(xPos, 5, zPos));
        this.light.intensity = 0.05;
        this.mesh = BABYLON.MeshBuilder.CreateSphere("orb", { diameter: 5 });
        const material = new BABYLON.StandardMaterial("material");
        material.diffuseColor = new BABYLON.Color3(0, 0, 0);
        this.mesh.material = material;
        this.mesh.position = new BABYLON.Vector3(xPos, 5, zPos);
    }
}

class Map {
    constructor(width, height, boxInt) {
        this.ground = new BABYLON.MeshBuilder.CreateGround("ground", { width: width, height: height });
        this.roof = new BABYLON.MeshBuilder.CreateBox("roof", { width: width, depth: height });
        this.roof.position.y = 15;

        this.ground.PhysicsImpostor = new BABYLON.PhysicsImpostor(this.ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0 });

        const AlphaMaterial = new BABYLON.StandardMaterial("AlphaMaterial");
        AlphaMaterial.WireFrames = true;

        this.wall1 = new BABYLON.MeshBuilder.CreateBox("wall1", { width: width, height: 50, depth: 1 });
        this.wall1.position = new BABYLON.Vector3(0, 5, width / 2);
        this.wall2 = new BABYLON.MeshBuilder.CreateBox("wall1", { width: width, height: 50, depth: 1 });
        this.wall2.position = new BABYLON.Vector3(0, 5, -width / 2);
        this.wall3 = new BABYLON.MeshBuilder.CreateBox("wall1", { width: 1, height: 50, depth: height });
        this.wall3.position = new BABYLON.Vector3(width / 2, 5, 0);
        this.wall4 = new BABYLON.MeshBuilder.CreateBox("wall1", { width: 1, height: 50, depth: height });
        this.wall4.position = new BABYLON.Vector3(-width / 2, 5, 0);

        const wallMat = new BABYLON.StandardMaterial("wallMat");
        const ceilingMat = new BABYLON.StandardMaterial("ceilingMat");
        const floorMat = new BABYLON.StandardMaterial("floorMat");

        wallMat.diffuseColor = new BABYLON.Color3(1, 1, 0.2);
        //wallMat.diffuseTexture = new BABYLON.Texture("https://static.wikia.nocookie.net/backrooms/images/d/d5/Wallpaper.png/revision/latest?cb=20220801114912");
        ceilingMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        floorMat.diffuseColor = new BABYLON.Color3(0.588, 0.294, 0);

        this.wall1.material = wallMat;
        this.wall2.material = wallMat;
        this.wall3.material = wallMat;
        this.wall4.material = wallMat;

        this.ground.material = floorMat;

        this.roof.material = ceilingMat;

        for (let i = boxInt; i > 0; i--) {
            let xPos = Math.floor(Math.random() * width) - width * 0.5;
            let zPos = Math.floor(Math.random() * height) - height * 0.5;

            let leftOrRight = Math.floor(Math.random() * 100);

            let box = new BABYLON.MeshBuilder.CreateBox("box" + i, { width: 20, height: 25, depth: 5 });

            if (leftOrRight > 50) {
                box.rotation.y += 1.59;
            }

            box.material = wallMat;
            box.position = new BABYLON.Vector3(xPos, 5, zPos);
            box = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0 });
        }

        this.wall1.PhysicsImpostor = new BABYLON.PhysicsImpostor(this.wall1, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0 });
        this.wall2.PhysicsImpostor = new BABYLON.PhysicsImpostor(this.wall2, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0 });
        this.wall3.PhysicsImpostor = new BABYLON.PhysicsImpostor(this.wall3, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0 });
        this.wall4.PhysicsImpostor = new BABYLON.PhysicsImpostor(this.wall4, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0 });
    }
}

class Player {
    constructor(scene, position) {
        this.body = new BABYLON.MeshBuilder.CreateSphere("playerBody", { diameter: 4 });
        this.body.position = position;
        this.body.visibility = 0;

        this.head = new BABYLON.MeshBuilder.CreateSphere("playerHead", { diameter: 4 });
        this.right = new BABYLON.MeshBuilder.CreateSphere("playerRight", { diameter: 1 });
        this.right.position = new BABYLON.Vector3(-1, 0, 0);
        this.right.visibility = 0;

        this.camera = new BABYLON.UniversalCamera("playerCam", new BABYLON.Vector3(0, 0, -1));

        this.light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 0, -1));
        this.light.intensity = 0.05;

        this.camera.parent = this.head;
        this.right.parent = this.head;
        this.light.parent = this.head;

        scene.registerBeforeRender(() => {
            this.head.position.x = this.body.position.x;
            this.head.position.y = this.body.position.y + 5;
            this.head.position.z = this.body.position.z;
        });

        this.body.PhysicsImpostor = new BABYLON.PhysicsImpostor(this.body, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 40, restitution: 0 });
    }

    getFront() {
        const front = this.head.absolutePosition.subtract(this.camera.globalPosition);
        front.y = 0;
        return front.normalize();
    }

    getBack() {
        const back = this.camera.globalPosition.subtract(this.head.absolutePosition);
        back.y = 0;
        return back.normalize();
    }

    getLeft() {
        const left = this.right.absolutePosition.subtract(this.head.absolutePosition);
        left.y = -0.1;
        return left.normalize();
    }

    getRight() {
        const right = this.head.absolutePosition.subtract(this.right.absolutePosition);
        right.y = 0;
        return right.normalize();
    }
}

const createScene = () => {
    const scene = new BABYLON.Scene(engine);

    //zapne physics engine
    let gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    let physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    //světla
    let hemiLight1 = new BABYLON.HemisphericLight("hemiLight1", new BABYLON.Vector3(-0.5, 1, 0), scene);
    let hemiLight2 = new BABYLON.HemisphericLight("hemiLight2", new BABYLON.Vector3(0, -1, -1), scene);
    hemiLight1.intensity = 0.15;
    hemiLight2.intensity = 0.15;

    //hudba
    let audio = new Audio('./burningMemory.mp3');
    audio.volume = 0.02;
    audio.loop = true;

    //objekty
    let player = new Player(scene, new BABYLON.Vector3(0, 30, 0));
    let orb = new Orb(1000, 1000);
    let ground = new Map(1000, 1000, 1200);

    //win
    let orbCollider = orb.mesh;
    let collider = BABYLON.MeshBuilder.CreateBox("collider", { size: 3 }, scene);
    collider.parent = player.camera;

    collider.actionManager = new BABYLON.ActionManager(scene);
    let action = new BABYLON.ExecuteCodeAction(
        {
            trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
            parameter: {
                mesh: orbCollider
            }
        },
        (evt) => {
            window.location.replace("https://backrooms.fandom.com/wiki/Level_0");
        }
    );

    collider.actionManager.registerAction(action);

    //vstup klávesnice a myši
    function mouseMove(e) {
        player.head.rotate(BABYLON.Axis.X, e.movementY / 1000, BABYLON.Space.LOCAL);
        player.head.rotate(BABYLON.Axis.Y, e.movementX / 1000, BABYLON.Space.WORLD);
    }

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            audio.play();
            document.addEventListener("mousemove", mouseMove);
        } else {
            audio.pause();
            document.removeEventListener("mousemove", mouseMove);
        }
    });

    const keys = {};
    scene.registerBeforeRender(e => {
        let velocity = new BABYLON.Vector3(0, -0.1, 0);
        const force = 2 * engine.getDeltaTime();
        if (keys[87]) {
            velocity = velocity.add(player.getFront());
        }
        if (keys[83]) {
            velocity = velocity.add(player.getBack());
        }
        if (keys[65]) {
            velocity = velocity.add(player.getLeft());
        }
        if (keys[68]) {
            velocity = velocity.add(player.getRight());
        }
        player.body.PhysicsImpostor.setLinearVelocity(velocity.normalize().multiplyByFloats(force, force, force));
    });

    window.addEventListener('keydown', e => {
        keys[e.keyCode] = true;
        if (e.keyCode === 9) e.preventDefault();
    });
    window.addEventListener('keyup', e => {
        keys[e.keyCode] = false;
        if (e.keyCode === 9) e.preventDefault();
    });

    //uzamkne myš
    scene.onPointerDown = () => canvas.requestPointerLock();

    return scene;
}

let scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", () => {
    engine.resize();
});
