const scn = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
cam.position.set(0, 2, 10);

const plyr = {
    pos: new THREE.Vector3(0, 2, 10),
    vel: new THREE.Vector3(0, 0, 0),
    acc: new THREE.Vector3(0, 0, 0),
    hit: false,
    wantX: 0,
    jumping: false
};

let panSpd = 0.4;
const grav = new THREE.Vector3(0, -0.1, 0);
const rndr = new THREE.WebGLRenderer({ antialias: true });
scn.background = new THREE.Color('#001d45');
rndr.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(rndr.domElement);

window.addEventListener("resize", () => {
    rndr.setSize(window.innerWidth, window.innerHeight);
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
});

const flrGeo = new THREE.BoxGeometry(30, 0.5, 500);
const flrMat = new THREE.MeshLambertMaterial({ color: 0x0000aa });
const flrMesh = new THREE.Mesh(flrGeo, flrMat);
scn.add(flrMesh);

const ceilGeo = new THREE.BoxGeometry(30, 0.5, 500);
const ceilMat = new THREE.MeshLambertMaterial({ color: 0x0000aa });
const ceilMesh = new THREE.Mesh(ceilGeo, ceilMat);
scn.add(ceilMesh);
ceilMesh.position.y = 15;

scn.fog = new THREE.Fog('#001d45', 10, 300);

const cones = [];
for (let i = 0; i < 1000; i++) {
    let h = Math.random() <= 0.33 ? 10 : 5;
    const geo = new THREE.ConeGeometry(3, h, 10);
    const mat = new THREE.MeshBasicMaterial({ color: '#fcba03' });
    const cone = new THREE.Mesh(geo, mat);
    cones.push(cone);
    scn.add(cone);
    cone.position.z = -i * 30 - 30;
    cone.originalZ = -i * 30 - 30;
    cone.h = h;
    if (Math.random() <= 0.5) {
        cone.position.y = 15;
        cone.rotation.z = Math.PI;
    }
    cone.position.x = Math.random() <= 0.33 ? -7.5 : (Math.random() >= 0.66 ? 7.5 : cone.position.x);
}

const light1 = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scn.add(light1);

const light2 = new THREE.PointLight(0xff0000, 1, 100);
light2.position.set(10, 7.5, plyr.pos.z);
scn.add(light2);

const render = () => {
    requestAnimationFrame(render);
    let dead = false;

    cones.forEach((cone, i) => {
        cone.position.z += panSpd;
        const dist = plyr.pos.distanceTo(cone.position);
        const size = cone.h > 5 ? 5 : 3;

        if (Math.floor(dist) < size && !plyr.hit) {
            dead = true;
            panSpd = 0.399;
            $(".lastScore").html("Last score: " + Math.floor(cones[0].position.z + 30));
            $(".lose").addClass("show");
            setTimeout(() => { $(".lose").removeClass("show"); }, 1000);
        }
    });

    panSpd += 0.001;

    if (dead) {
        plyr.hit = true;
        setTimeout(() => { plyr.hit = false; }, 1000);
        cones.forEach(cone => {
            const tl = new TimelineMax();
            tl.to(cone.position, 1, { z: cone.originalZ });
        });
    }

    plyr.acc.add(grav);
    plyr.vel.add(plyr.acc);
    plyr.pos.add(plyr.vel);
    plyr.acc.set(0, 0, 0);

    if (plyr.wantX > plyr.pos.x) plyr.pos.x++;
    if (plyr.wantX < plyr.pos.x) plyr.pos.x--;

    if ((plyr.pos.y >= 13 && cam.rotation.z !== 0) || (plyr.pos.y <= 2 && cam.rotation.z == 0)) {
        plyr.jumping = false;
        plyr.vel.y = 0;
    }

    plyr.pos.clamp(new THREE.Vector3(-7.5, 2, 10), new THREE.Vector3(7.5, 13, 10));
    light2.position.set(10, 7.5, plyr.pos.z);
    cam.position.set(plyr.pos.x, plyr.pos.y, plyr.pos.z);
    $(".score").html("Score: " + Math.floor(cones[0].position.z + 30));
    rndr.render(scn, cam);
};

render();

document.addEventListener('keyup', (e) => {
    if (e.code === "ArrowUp") {
        grav.y *= -1;
        plyr.vel.y = 0;
        const tl = new TimelineMax();
        if (cam.rotation.z == 0) {
            tl.to(cam.rotation, .2, { z: Math.PI });
        } else {
            tl.to(cam.rotation, .2, { z: Math.PI * 2 });
            tl.to(cam.rotation, 0, { z: 0 });
        }
    }
    if (cam.rotation.z == 0) {
        if (e.code === "Space" && !plyr.jumping) {
            plyr.jumping = true;
            plyr.acc.y += 1.2;
        }
        if (e.code === "ArrowLeft" && plyr.wantX >= 0) plyr.wantX -= 7.5;
        if (e.code === "ArrowRight" && plyr.wantX <= 0) plyr.wantX += 7.5;
    } else {
        if (e.code === "Space" && !plyr.jumping) {
            plyr.jumping = true;
            plyr.acc.y -= 1.2;
        }
        if (e.code === "ArrowRight" && plyr.wantX >= 0) plyr.wantX -= 7.5;
        if (e.code === "ArrowLeft" && plyr.wantX <= 0) plyr.wantX += 7.5;
    }
}); 