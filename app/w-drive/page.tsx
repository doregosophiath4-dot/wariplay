// @ts-nocheck
"use client";

// Ce fichier contient l'intégralité du jeu (logique Three.js + markup +
// styles) dans un seul composant, sans rien changer au comportement
// d'origine. @ts-nocheck est utilisé car le moteur de jeu est du
// JavaScript impératif porté tel quel (aucune règle, aucune formule,
// aucun texte n'a été modifié) ; le retyper entièrement en TypeScript
// n'a pas été demandé et sortirait du périmètre "reproduire exactement".
//
// SEULE MODIFICATION PAR RAPPORT À LA VERSION PRÉCÉDENTE :
// tout le CSS "brut" (le bloc <style jsx global> plein d'ids/classes)
// a été remplacé par des classes Tailwind directement sur les éléments.
// Aucune règle de jeu, aucune valeur numérique du gameplay, aucun texte
// affiché n'a été modifié. Les valeurs visuelles (couleurs, tailles,
// espacements) ont été reportées à l'identique en Tailwind (via des
// classes arbitraires quand nécessaire) pour que le rendu reste
// strictement le même qu'avant.
//
// Le seul point d'attention technique : certains éléments (rulesModal,
// objectiveModal, resultScreen, betModal, loading) sont montrés/masqués
// par le script via `element.style.display = "flex" / "none"`. Un style
// inline posé par le DOM a toujours la priorité sur une classe Tailwind,
// donc le fait de leur donner une classe Tailwind `hidden` (ou `flex`)
// par défaut ne change rien à ce mécanisme : dès que le script touche
// `.style.display`, c'est cette valeur inline qui prend le dessus, comme
// avant.
//
// CORRECTIFS DE CETTE VERSION (2 changements, rien d'autre) :
//
// 1) TROU ENTRE LES SEGMENTS DE ROUTE (sol bleu du skybox visible) :
//    la bounding box du modèle road.glb donne, une fois mise à l'échelle,
//    une longueur qui tombe exactement sur ROAD_TARGET_LENGTH (40) : le
//    chevauchement de 1.5 aurait donc dû suffire en pure géométrie. Le
//    trou observé vient en réalité d'une fine marge non texturée sur les
//    bords du mesh (la route "visible" est un peu plus courte que la
//    bounding box). Comme c'est un écart empirique et non calculable, on
//    augmente franchement ROAD_OVERLAP, avec une marge supplémentaire sur
//    mobile car l'anti-aliasing y est désactivé (antialias: !isMobile) et
//    rend donc le moindre interstice bien plus visible/net que sur PC.
//
// 2) MODALE DES RÈGLES SUR MOBILE :
//    rulesModal avait deux classes Tailwind `max-w-` en conflit
//    (`max-w-[90vw]` ET `max-w-[420px]`), ce qui ne garantit pas quelle
//    règle gagne selon l'ordre de génération du CSS — sur un petit écran,
//    la modale pouvait donc potentiellement déborder si 420px l'emportait.
//    Remplacé par une seule contrainte `max-w-[min(420px,90vw)]` qui
//    garantit à la fois la limite desktop (420px) et la limite mobile
//    (90% de la largeur d'écran), sans ambiguïté.

import { useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export default function Game() {

    useEffect(() => {



        /*
           =========================================================
           DRAPEAUX DE CYCLE DE VIE (spécifiques à l'intégration
           React/Next.js)

           `disposed` empêche tout code asynchrone (chargements GLB,
           boucle d'animation) de continuer à agir après le démontage
           du composant. `animationFrameId` permet d'arrêter proprement
           la boucle requestAnimationFrame au nettoyage. Aucune des
           deux ne change quoi que ce soit au comportement du jeu.
        */

        let disposed = false;

        let animationFrameId = null;


        /*
           =========================================================
           DÉTECTION MOBILE (performance)

           Les téléphones ont un GPU beaucoup moins puissant qu'un PC.
           Ce qui coûte le plus cher ici : les ombres portées (shadow
           maps), l'anti-aliasing, un pixelRatio élevé, et la grande
           quantité de décor (trottoir/herbe/arbres/lampadaires/
           bâtiments). On détecte donc un appareil mobile/tactile pour
           réduire UNIQUEMENT ces réglages sur mobile, sans rien
           changer pour le PC.
        */

        const isMobile =
            (
                typeof navigator !== "undefined" &&
                /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
            ) ||
            (
                typeof window !== "undefined" &&
                window.matchMedia &&
                window.matchMedia("(pointer: coarse)").matches
            );


        /* =====================================================
           SCÈNE
        ===================================================== */

        const scene =
            new THREE.Scene();


        scene.background =
            new THREE.Color(
                0x72c9ff
            );


        scene.fog =
            new THREE.Fog(

                0x72c9ff,

                50,

                220

            );


        /* =====================================================
           CAMÉRA
        ===================================================== */

        const camera =
            new THREE.PerspectiveCamera(

                65,

                window.innerWidth /
                window.innerHeight,

                0.1,

                500

            );


        camera.position.set(

            0,
            6,
            12

        );


        camera.lookAt(

            0,
            1,
            -30

        );


        /* =====================================================
           RENDERER
        ===================================================== */

        const renderer =
            new THREE.WebGLRenderer({

                antialias: !isMobile

            });


        renderer.setPixelRatio(

            Math.min(

                window.devicePixelRatio,

                isMobile ? 1 : 2

            )

        );


        renderer.setSize(

            window.innerWidth,

            window.innerHeight

        );


        /*
           Les ombres portées (shadow map 2048x2048 + PCF soft shadows)
           sont ce qui coûte le plus cher sur un GPU mobile. On les
           désactive entièrement sur mobile ; le PC garde exactement
           le même rendu qu'avant.
        */

        renderer.shadowMap.enabled =
            !isMobile;


        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;


        document.body.appendChild(
            renderer.domElement
        );


        /* =====================================================
           LUMIÈRES
        ===================================================== */

        const hemisphereLight =
            new THREE.HemisphereLight(

                0xffffff,

                0x5f8c3a,

                2.5

            );


        scene.add(
            hemisphereLight
        );


        const sun =
            new THREE.DirectionalLight(

                0xffffff,

                3

            );


        sun.position.set(

            20,
            35,
            10

        );


        sun.castShadow =
            true;


        sun.shadow.mapSize.width =
            2048;


        sun.shadow.mapSize.height =
            2048;


        scene.add(
            sun
        );


        /* =====================================================
           SKYBOX
        ===================================================== */

        const sky =
            new THREE.Mesh(

                new THREE.SphereGeometry(

                    250,
                    32,
                    32

                ),

                new THREE.MeshBasicMaterial({

                    color:
                        0x72c9ff,

                    side:
                        THREE.BackSide

                })

            );


        scene.add(
            sky
        );


        /* =====================================================
           NUAGES
        ===================================================== */

        const clouds = [];


        function createCloud(
            x,
            y,
            z,
            scale
        ) {

            const cloud =
                new THREE.Group();


            const material =
                new THREE.MeshStandardMaterial({

                    color:
                        0xffffff,

                    roughness:
                        1

                });


            const parts = [

                [-2.0, 0.0, 0.0, 1.2],

                [-1.0, 0.4, 0.0, 1.5],

                [0.2, 0.7, 0.0, 1.8],

                [1.5, 0.3, 0.0, 1.4],

                [2.3, 0.0, 0.0, 1.0],

                [-0.8,-0.2, 0.5, 1.2],

                [0.8,-0.2, 0.4, 1.3]

            ];


            for (
                const p of parts
            ) {

                const part =
                    new THREE.Mesh(

                        new THREE.SphereGeometry(

                            p[3],
                            16,
                            16

                        ),

                        material

                    );


                part.position.set(

                    p[0],
                    p[1],
                    p[2]

                );


                cloud.add(
                    part
                );

            }


            cloud.position.set(

                x,
                y,
                z

            );


            cloud.scale.set(

                scale,
                scale,
                scale

            );


            scene.add(
                cloud
            );


            clouds.push({

                object:
                    cloud,

                factor:
                    0.12 +
                    Math.random() * 0.3

            });

        }


        createCloud(
            -30,
            18,
            -50,
            2
        );

        createCloud(
            25,
            23,
            -80,
            2.5
        );

        createCloud(
            -40,
            27,
            -110,
            3
        );

        createCloud(
            40,
            20,
            -145,
            2
        );

        createCloud(
            0,
            30,
            -180,
            3
        );

        createCloud(
            -55,
            22,
            -220,
            2.5
        );

        createCloud(
            50,
            26,
            -260,
            3
        );


        function updateClouds(frameFactor) {

            for (
                const cloud of clouds
            ) {

                cloud.object.position.z +=

                    speed *
                    cloud.factor *
                    frameFactor;


                if (
                    cloud.object.position.z > 35
                ) {

                    cloud.object.position.z =

                        -260 -
                        Math.random() * 100;


                    cloud.object.position.x =

                        -80 +
                        Math.random() * 160;

                }

            }

        }


        /* =====================================================
           LOADER
        ===================================================== */

        const loader =
            new GLTFLoader();


        /* =====================================================
           ROAD
        ===================================================== */

        const roadParts = [];


        const ROAD_COUNT = 7;


        /*
           On conserve la longueur
           du road utilisée actuellement.
        */

        const ROAD_TARGET_LENGTH = 40;

        const ROAD_SPACING = 40;

        /*
           =========================================================
           CHEVAUCHEMENT ROAD (fix "sol bleu du skybox" visible entre
           deux segments)

           En théorie, roadScale est calculé pour que la longueur
           réelle d'un segment (roadLength) soit exactement égale à
           ROAD_SPACING, donc les segments devraient se toucher pile
           bord à bord. En pratique, un modèle .glb n'occupe presque
           jamais la totalité de sa bounding box (marge interne,
           légère troncature du mesh, arrondis d'export…) : la surface
           réellement visible est donc un peu plus courte que la
           longueur calculée, ce qui laisse un interstice où l'on voit
           le fond (skybox) entre deux segments consécutifs.

           Vérification faite sur le modèle road.glb utilisé ici : sa
           bounding box mise à l'échelle tombe pile sur
           ROAD_TARGET_LENGTH (40), donc l'écart ne vient pas d'une
           erreur de calcul de roadScale/roadLength — il vient d'une
           fine marge non texturée sur les bords du mesh, invisible
           depuis la bounding box mais visible à l'écran. C'est donc un
           réglage empirique, pas calculable à l'avance.

           On applique le même principe que pour le grass plus bas
           (grassOverlap) : on rapproche légèrement les segments les uns
           des autres pour garantir un chevauchement. La marge est plus
           grande sur mobile car l'anti-aliasing y est désactivé
           (voir `antialias: !isMobile` plus haut), ce qui rend le moindre
           interstice beaucoup plus visible/net que sur PC. Augmente ces
           valeurs si un interstice est encore visible, ou réduis-les si
           des artefacts de scintillement (z-fighting) apparaissent aux
           jonctions.
        */

        const ROAD_OVERLAP =
            isMobile ? 4 : 2.5;

        const ROAD_STEP =
            ROAD_SPACING -
            ROAD_OVERLAP;


        /*
           Dimensions réelles du road
           après scaling.
        */

        let roadWidth = 0;

        let roadLength = 0;


        /* =====================================================
           CHARGEMENT ROAD
        ===================================================== */

        loader.load(

            "/Models/road.glb",

            function(gltf) {

                if (
                    disposed
                ) {
                    return;
                }

                const originalRoad =
                    gltf.scene;


                const originalBox =
                    new THREE.Box3()
                        .setFromObject(
                            originalRoad
                        );


                const originalSize =
                    new THREE.Vector3();


                originalBox.getSize(
                    originalSize
                );


                /*
                   Scaling du road.
                */

                const roadScale =

                    ROAD_TARGET_LENGTH /
                    Math.max(

                        originalSize.z,

                        0.001

                    );


                roadWidth =

                    originalSize.x *
                    roadScale;


                roadLength =

                    originalSize.z *
                    roadScale;


                console.log(
                    "ROAD largeur :",
                    roadWidth
                );


                console.log(
                    "ROAD longueur :",
                    roadLength
                );


                /*
                   Création des morceaux
                   du road.
                */

                for (
                    let i = 0;
                    i < ROAD_COUNT;
                    i++
                ) {

                    const road =
                        originalRoad.clone(
                            true
                        );


                    road.scale.set(

                        roadScale,
                        roadScale,
                        roadScale

                    );


                    road.position.set(

                        0,
                        0,
                        -i *
                        ROAD_STEP

                    );


                    road.traverse(
                        child => {

                            if (
                                child.isMesh
                            ) {

                                child.castShadow =
                                    true;

                                child.receiveShadow =
                                    true;

                            }

                        }
                    );


                    scene.add(
                        road
                    );


                    roadParts.push(
                        road
                    );

                }


                /*
                   =========================================================
                   FIX VOIES / TROTTOIR

                   Les voies (lanes) étaient fixées en dur à -5/0/5, sans
                   lien avec la largeur réelle du road mesurée ci-dessus.
                   Résultat : sur le road actuel (~10.67 de large, donc un
                   bord à ±5.33), il ne restait qu'une marge de ~0.33 pour
                   les voies extérieures — alors que même la voiture du
                   joueur a besoin d'environ 0.95 de demi-largeur, et le
                   plus large des véhicules de trafic (tractor.glb) d'environ
                   1.28. Les voitures débordaient donc sur le trottoir dès
                   qu'elles étaient dans une voie latérale.

                   On recalcule maintenant les voies extérieures à partir de
                   la largeur RÉELLE du road, moins une marge de sécurité
                   couvrant le véhicule le plus large. Ainsi le calcul reste
                   correct même si le modèle du road ou ROAD_TARGET_LENGTH
                   changent plus tard.
                */

                const CAR_HALF_WIDTH_MARGIN = 1.35;

                const maxLaneOffset =

                    (
                        roadWidth / 2
                    ) -
                    CAR_HALF_WIDTH_MARGIN;


                lanes[0] =
                    -maxLaneOffset;

                lanes[2] =
                    maxLaneOffset;


                console.log(
                    "Voies recalculées :",
                    lanes
                );


                /*
                   IMPORTANT :

                   Le décor est chargé
                   seulement après que
                   le road a été mesuré.
                */

                loadEnvironment();


                document.getElementById(
                    "loading"
                ).style.display =
                    "none";

            },


            undefined,


            function(error) {

                if (
                    disposed
                ) {
                    return;
                }

                console.error(
                    "Erreur road.glb :",
                    error
                );


                document.getElementById(
                    "loading"
                ).textContent =

                    "Erreur : Models/road.glb introuvable";

            }

        );


        /* =====================================================
           OUTILS GLB
        ===================================================== */

        function getModelSize(
            model
        ) {

            const box =
                new THREE.Box3()
                    .setFromObject(
                        model
                    );


            const size =
                new THREE.Vector3();


            box.getSize(
                size
            );


            return {

                box:
                    box,

                size:
                    size

            };

        }


        /* =====================================================
           CLONAGE MODÈLE
        ===================================================== */

        function cloneModel(
            model,
            scale
        ) {

            const clone =
                model.clone(
                    true
                );


            clone.scale.set(

                scale,
                scale,
                scale

            );


            clone.traverse(
                child => {

                    if (
                        child.isMesh
                    ) {

                        child.castShadow =
                            true;

                        child.receiveShadow =
                            true;

                    }

                }
            );


            return clone;

        }


        /* =====================================================
           COLLECTIONS
        ===================================================== */

        const pavementLeft = [];

        const pavementRight = [];

        const grassLeft = [];

        const grassRight = [];

        const treesLeft = [];

        const treesRight = [];

        const lampsLeft = [];

        const lampsRight = [];

        const buildingsLeft = [];

        const buildingsRight = [];


        /* =====================================================
           PARAMÈTRES
        ===================================================== */

        const PAVEMENT_SCALE =
            2.5;

        const GRASS_SCALE =
            5;

        const TREE_SCALE =
            5;

        /*
           LAMPADAIRES
           Le modèle est redimensionné automatiquement
           pour conserver sa taille naturelle.
        */

        const LAMP_SPACING =
            22;

        const LAMP_ROWS =
            isMobile ? 40 : 100;

        const LAMP_INNER_OFFSET =
            0.35;

        /*
           BÂTIMENTS
           Les bâtiments sont placés plus loin que les
           lampadaires, sur le grass, afin de garder
           le trottoir libre.
        */

        const BUILDING_SPAWN_START = 30;

        const BUILDING_MIN_SPACING = 52;

        const BUILDING_SIDE_OFFSET = 20;

        const BUILDING_ROWS = isMobile ? 35 : 90;


        /*
           On couvre énormément
           de largeur pour éviter
           de voir le skybox.
        */

        const TERRAIN_LIMIT =
            120;


        /*
           Nombre de rangées.
        */

        const DECOR_ROWS =
            isMobile ? 45 : 100;

        /*
           Nombre de rangées pour les arbres (utilisé par
           createTreesLine, qui tirait auparavant en dur sur 100).
        */

        const TREE_ROWS =
            isMobile ? 45 : 100;


        /* =====================================================
           INFORMATION PAVEMENT
        ===================================================== */

        let pavementWidth = 0;

        let pavementLength = 0;


        /* =====================================================
           CALCUL EXACT DU PAVEMENT
        ===================================================== */

        function calculatePavementPosition(
            side
        ) {

            /*
               Bord du road.

               DROITE :
               +roadWidth / 2

               GAUCHE :
               -roadWidth / 2
            */

            const roadEdge =

                (
                    roadWidth / 2
                ) * side;


            /*
               Centre du pavement.

               La moitié du pavement
               est placée vers l'extérieur.

               Donc son bord intérieur
               touche exactement
               le road.
            */

            const pavementCenter =

                roadEdge +

                (
                    pavementWidth / 2
                ) * side;


            return pavementCenter;

        }


        /* =====================================================
           CRÉATION PAVEMENT
        ===================================================== */

        function createPavementLine(
            model,
            side,
            array
        ) {

            const information =
                getModelSize(
                    model
                );


            /*
               Dimensions après scaling.
            */

            pavementWidth =

                information.size.x *
                PAVEMENT_SCALE;


            pavementLength =

                Math.max(

                    information.size.z *
                    PAVEMENT_SCALE,

                    0.001

                );


            const pavementX =

                calculatePavementPosition(
                    side
                );


            console.log(
                "PAVEMENT X :",
                pavementX
            );


            console.log(
                "PAVEMENT WIDTH :",
                pavementWidth
            );


            let z = 30;


            for (
                let i = 0;
                i < DECOR_ROWS;
                i++
            ) {

                const pavement =
                    cloneModel(

                        model,

                        PAVEMENT_SCALE

                    );


                pavement.position.set(

                    pavementX,
                    0,
                    z

                );

                pavement.userData.decorStripX =
                    Math.round(pavementX * 1000) / 1000;

                scene.add(
                    pavement
                );


                array.push({

                    object:
                        pavement,

                    length:
                        pavementLength

                });


                /*
                   Aucun espace en profondeur.
                */

                z -=
                    pavementLength;

            }

        }


        /* =====================================================
           CALCUL BORD EXTÉRIEUR PAVEMENT
        ===================================================== */

        function getPavementOuterEdge(
            side
        ) {

            /*
               Bord du road.
            */

            const roadEdge =

                (
                    roadWidth / 2
                ) * side;


            /*
               Centre pavement.
            */

            const pavementCenter =

                roadEdge +

                (
                    pavementWidth / 2
                ) * side;


            /*
               Bord extérieur.

               DROITE :
               centre + moitié

               GAUCHE :
               centre - moitié
            */

            const outerEdge =

                pavementCenter +

                (
                    pavementWidth / 2
                ) * side;


            return outerEdge;

        }


        /* =====================================================
           GRASS
        ===================================================== */

        function createGrassLine(
            model,
            side,
            array
        ) {

            const information =
                getModelSize(
                    model
                );


            const grassWidth =

                Math.max(

                    information.size.x *
                    GRASS_SCALE,

                    0.001

                );


            const grassLength =

                Math.max(

                    information.size.z *
                    GRASS_SCALE,

                    0.001

                );


            /*
               C'EST ICI QUE LE PROBLÈME
               EST CORRIGÉ.

               On prend le vrai bord
               extérieur du pavement.
            */

            const pavementOuterEdge =

                getPavementOuterEdge(
                    side
                );


            /*
               Le premier grass est
               placé de manière à ce que
               son bord intérieur touche
               EXACTEMENT le bord
               extérieur du pavement.
            */

            const firstGrassCenter =

                pavementOuterEdge +

                (
                    grassWidth / 2
                ) * side;


            /*
               Largeur disponible.
            */

            const distanceToLimit =

                Math.abs(

                    TERRAIN_LIMIT -
                    firstGrassCenter

                );


            /*
               Nombre de colonnes.
            */

            const columns =

                Math.ceil(

                    distanceToLimit /
                    grassWidth

                ) + 3;


            /*
               Petit chevauchement entre
               les grass.

               Cela évite les lignes
               visibles entre deux GLB.

               IMPORTANT :

               ce chevauchement est
               uniquement ENTRE les
               grass.

               Il n'y a PAS de trou
               entre pavement et grass.
            */

            const grassOverlap =
                0.05;


            for (
                let column = 0;
                column < columns;
                column++
            ) {

                /*
                   Position X du centre
                   de cette colonne.
                */

                const grassX =

                    firstGrassCenter +

                    (
                        column *
                        (
                            grassWidth -
                            grassOverlap
                        )
                    ) * side;


                let z = 30;


                for (
                    let row = 0;
                    row < DECOR_ROWS;
                    row++
                ) {

                    const grass =
                        cloneModel(

                            model,

                            GRASS_SCALE

                        );


                    grass.position.set(

                        grassX,
                        0,
                        z

                    );

                    grass.userData.decorStripX =
                        Math.round(grassX * 1000) / 1000;

                    scene.add(
                        grass
                    );


                    array.push({

                        object:
                            grass,

                        length:
                            grassLength -
                            grassOverlap

                    });


                    /*
                       Aucun espace entre
                       les morceaux de grass.
                    */

                    z -=

                        grassLength -
                        grassOverlap;

                }

            }


            console.log(
                "GRASS commence à :",
                firstGrassCenter
            );


            console.log(
                "Colonnes grass :",
                columns
            );

        }


        /* =====================================================
           ARBRES
        ===================================================== */

        function createTreesLine(
            model,
            side,
            array
        ) {

            const information =
                getModelSize(
                    model
                );


            const length =

                Math.max(

                    information.size.z *
                    TREE_SCALE,

                    0.001

                );


            /*
               Les arbres sont placés
               sur le grass.

               Ils ne touchent jamais
               le road.
            */

            const grassOuterStart =

                getPavementOuterEdge(
                    side
                );


            const treeStart =

                Math.abs(
                    grassOuterStart
                ) + 18;


            let z = 20;


            for (
                let i = 0;
                i < TREE_ROWS;
                i++
            ) {

                if (
                    Math.random() < 0.5
                ) {

                    const tree =
                        cloneModel(

                            model,

                            TREE_SCALE

                        );


                    const randomX =

                        Math.random() * 15;


                    tree.position.set(

                        (
                            treeStart +
                            randomX
                        ) * side,

                        0,

                        z

                    );

                    tree.userData.decorStripX =
                        side < 0 ? "TREE_LEFT" : "TREE_RIGHT";

                    tree.rotation.y =

                        Math.random() *
                        Math.PI *
                        2;


                    scene.add(
                        tree
                    );


                    array.push({

                        object:
                            tree,

                        length:
                            length

                    });

                }


                z -= length;

            }

        }


        /* =====================================================
           CHARGEMENT ENVIRONNEMENT
        ===================================================== */

        function loadEnvironment() {


            /*
               PAVEMENT
            */

            loader.load(

                "/Models/pavement.glb",

                function(gltf) {

                    const model =
                        gltf.scene;


                    /*
                       IMPORTANT :

                       On crée d'abord
                       le pavement afin de
                       connaître ses dimensions
                       réelles.
                    */

                    createPavementLine(

                        model,
                        -1,
                        pavementLeft

                    );


                    createPavementLine(

                        model,
                        1,
                        pavementRight

                    );


                    /*
                       Ensuite seulement
                       on charge le grass.

                       Ainsi le grass connaît
                       la vraie largeur du
                       pavement.
                    */

                    loadGrass(
                        model
                    );

                },

                undefined,

                function(error) {

                    console.error(
                        "Erreur pavement.glb :",
                        error
                    );

                }

            );

        }


        /* =====================================================
           CHARGEMENT GRASS
        ===================================================== */

        function loadGrass(
            pavementModel
        ) {

            loader.load(

                "/Models/grass.glb",

                function(gltf) {

                    const grassModel =
                        gltf.scene;


                    /*
                       GAUCHE
                    */

                    createGrassLine(

                        grassModel,

                        -1,

                        grassLeft

                    );


                    /*
                       DROITE
                    */

                    createGrassLine(

                        grassModel,

                        1,

                        grassRight

                    );


                    /*
                       Ensuite les arbres.
                    */

                    loadTrees();

                },

                undefined,

                function(error) {

                    console.error(
                        "Erreur grass.glb :",
                        error
                    );

                }

            );

        }


        /* =====================================================
           LAMPADAIRES
        ===================================================== */

        function createLampLine(
            model,
            side,
            array
        ) {

            const information =
                getModelSize(model);

            /*
               On utilise la largeur réelle du lampadaire
               pour éviter qu'il déborde du trottoir.
            */

            const lampWidth =
                Math.max(information.size.x, 0.001);

            const lampLength =
                Math.max(information.size.z, 0.001);

            const lampHeight =
                Math.max(information.size.y, 0.001);

            /*
               Le lampadaire est posé SUR le trottoir,
               entre le bord de la route et le bord extérieur.
               Il reste donc toujours indépendant du grass.
            */

            const pavementCenter =
                calculatePavementPosition(side);

            const lampX =
                pavementCenter +
                side * (
                    pavementWidth * 0.30
                );

            /*
               Espacement régulier en profondeur.
               On garde suffisamment de lampadaires devant
               et derrière la caméra pour qu'il n'y ait jamais
               de rupture visuelle.
            */

            const spacing =
                Math.max(
                    LAMP_SPACING,
                    lampLength + 1
                );

            let z = 30;

            for (
                let i = 0;
                i < LAMP_ROWS;
                i++
            ) {

                const lamp =
                    cloneModel(
                        model,
                        1
                    );

                /*
                   Le modèle est remis à sa taille d'origine.
                   Sa base est alignée sur le sol.
                */

                lamp.position.set(
                    lampX,
                    -information.box.min.y,
                    z
                );

                /*
                   IMPORTANT :

                   Le GLB du lampadaire n'est PAS symétrique.
                   Son bras / sa lampe est orienté vers +X.

                   Côté GAUCHE du road (-1) :
                   orientation d'origine = correcte.

                   Côté DROIT du road (+1) :
                   on retourne le lampadaire de 180° sur Y
                   afin que la lampe regarde vers l'intérieur,
                   comme celle du côté gauche.

                   Ainsi les deux lampadaires ont exactement
                   la même orientation fonctionnelle par rapport
                   à la route.
                */

                lamp.rotation.y =
                    side === 1
                        ? Math.PI
                        : 0;

                lamp.userData.decorStripX =
                    lampX;

                scene.add(lamp);

                array.push({
                    object: lamp,
                    length: spacing
                });

                z -= spacing;
            }
        }


        /* =====================================================
           CHARGEMENT ARBRES
        ===================================================== */

        function loadTrees() {

            loader.load(

                "/Models/grass-trees.glb",

                function(gltf) {

                    const model =
                        gltf.scene;


                    createTreesLine(

                        model,

                        -1,

                        treesLeft

                    );


                    createTreesLine(

                        model,

                        1,

                        treesRight

                    );

                    /*
                       Les lampadaires sont chargés après les arbres.
                       Leur position dépend de la largeur réelle
                       du trottoir déjà calculée.
                    */

                    loadLamps();

                },

                undefined,

                function(error) {

                    console.error(
                        "Erreur grass-trees.glb :",
                        error
                    );

                }

            );

        }


        /* =====================================================
           CHARGEMENT LAMPADAIRES
        ===================================================== */

        function loadLamps() {

            loader.load(

                "/Models/low_poly_psx_street_lamp.glb",

                function(gltf) {

                    const model =
                        gltf.scene;

                    createLampLine(
                        model,
                        -1,
                        lampsLeft
                    );

                    createLampLine(
                        model,
                        1,
                        lampsRight
                    );

                    console.log(
                        "Lampadaires chargés :",
                        lampsLeft.length,
                        lampsRight.length
                    );

                    loadBuildings();
                },

                undefined,

                function(error) {

                    console.error(
                        "Erreur low_poly_psx_street_lamp.glb :",
                        error
                    );

                }

            );

        }


        /* =====================================================
           BÂTIMENTS
        ===================================================== */

        function createBuildingLine(
            models,
            side,
            array
        ) {

            /*
               Chaque côté reçoit ses propres bâtiments.
               On les place sur le grass, suffisamment loin
               du trottoir pour ne jamais empiéter sur la route.
            */

            let z = BUILDING_SPAWN_START;

            for (
                let i = 0;
                i < BUILDING_ROWS;
                i++
            ) {

                /*
                   On alterne les trois modèles pour éviter
                   une répétition trop visible.
                */

                const model =
                    models[
                        Math.floor(
                            Math.random() *
                            models.length
                        )
                    ];

                const information =
                    getModelSize(model);

                /*
                   Taille aléatoire légère :
                   les bâtiments gardent leur style low-poly
                   sans devenir disproportionnés.
                */

                /*
                   Les GLB représentent de vrais bâtiments / immeubles.
                   On les agrandit nettement par rapport à la première
                   version, mais sans les rendre disproportionnés.

                   La base est volontairement assez grande pour que les
                   bâtiments dominent clairement les arbres et le décor.
                */

                /*
                   Nouvelle échelle : les bâtiments doivent vraiment
                   dominer l'environnement comme de vrais immeubles,
                   sans devenir gigantesques.
                */

                const scale =
                    3.0 +
                    Math.random() * 0.9;

                const building =
                    cloneModel(
                        model,
                        scale
                    );

                /*
                   Position X :
                   au-delà de la zone des arbres,
                   avec une variation contrôlée.
                */

                const randomOffset =
                    BUILDING_SIDE_OFFSET +
                    Math.random() * 18;

                const buildingX =
                    (
                        Math.abs(
                            getPavementOuterEdge(side)
                        ) +
                        randomOffset
                    ) * side;

                /*
                   On pose précisément le bâtiment sur le sol.
                */

                const scaledMinY =
                    information.box.min.y *
                    scale;

                building.position.set(
                    buildingX,
                    -scaledMinY,
                    z
                );

                /*
                   Variations uniquement autour de l'axe vertical.
                   Aucun tilt : les bâtiments restent droits.
                */

                building.rotation.y =
                    Math.random() *
                    Math.PI *
                    2;

                scene.add(building);

                array.push({
                    object: building,
                    length: Math.max(
                        information.size.z * scale,
                        0.001
                    ) + 4
                });

                /*
                   Espacement suffisamment important pour éviter
                   que deux bâtiments se chevauchent.
                */

                z -=
                    BUILDING_MIN_SPACING +
                    Math.random() * 25;
            }
        }


        function loadBuildings() {

            const buildingModels = [];

            const files = [
                "/Models/building-small-a.glb",
                "/Models/building-small-c.glb",
                "/Models/building-small-d.glb"
            ];

            let loaded = 0;

            files.forEach(function(path) {

                loader.load(
                    path,
                    function(gltf) {

                        buildingModels.push(
                            gltf.scene
                        );

                        loaded++;

                        if (
                            loaded === files.length
                        ) {

                            createBuildingLine(
                                buildingModels,
                                -1,
                                buildingsLeft
                            );

                            createBuildingLine(
                                buildingModels,
                                1,
                                buildingsRight
                            );

                            console.log(
                                "Bâtiments chargés :",
                                buildingModels.length
                            );
                        }
                    },

                    undefined,

                    function(error) {

                        console.error(
                            "Erreur bâtiment :",
                            path,
                            error
                        );
                    }
                );

            });
        }


        /* =====================================================
           RECYCLAGE
        ===================================================== */

        function moveDecor(
            array,
            frameFactor
        ) {

            /*
               IMPORTANT : chaque bande longitudinale est
               recyclée indépendamment. Le recyclage global
               mélangeait les colonnes de grass/pavement et
               créait des décalages après un certain temps.
            */

            const groups = new Map();

            for (const data of array) {

                const key =
                    data.object.userData.decorStripX !== undefined
                        ? data.object.userData.decorStripX
                        : Math.round(data.object.position.x * 1000) / 1000;

                if (!groups.has(key)) groups.set(key, []);
                groups.get(key).push(data);
            }

            for (const strip of groups.values()) {

                for (const data of strip) {
                    data.object.position.z += speed * frameFactor;
                }

                for (const data of strip) {

                    if (data.object.position.z > 35) {

                        let farthest = Infinity;

                        for (const other of strip) {
                            if (other !== data) {
                                farthest = Math.min(
                                    farthest,
                                    other.object.position.z
                                );
                            }
                        }

                        data.object.position.z =
                            farthest - data.length;
                    }
                }
            }

        }

        /* =====================================================
           JOUEUR
        ===================================================== */

        const player =
            new THREE.Group();


        scene.add(
            player
        );


        player.position.set(

            0,
            1.2,
            3

        );


        /* =====================================================
           MODÈLE 3D DU JOUEUR (race-future.glb)
        ===================================================== */

        const playerWheels = [];

        let playerModelReady = false;

        loader.load(

            "/Models/Vehicles/race-future.glb",

            function(gltf) {

                const carModel =
                    prepareVehicleModel(
                        gltf.scene
                    );

                /*
                   Les véhicules de ce pack ont tous le même
                   axe avant/arrière : la même rotation que
                   les voitures de circulation (Math.PI) les
                   fait regarder dans le même sens que la route.
                */

                carModel.rotation.y =
                    Math.PI;

                carModel.position.y =
                    carModel.userData.groundY || 0;

                player.add(
                    carModel
                );

                /*
                   On repère les 4 roues par leur nom
                   (défini dans le fichier .glb) pour
                   pouvoir les faire tourner pendant
                   que le joueur avance.
                */

                carModel.traverse(
                    child => {

                        if (
                            child.name &&
                            child.name.indexOf("wheel") !== -1
                        ) {

                            playerWheels.push(
                                child
                            );

                        }

                    }
                );

                playerModelReady =
                    true;

            },

            undefined,

            function(error) {

                console.error(
                    "Erreur : Models/Vehicles/race-future.glb introuvable",
                    error
                );

            }

        );



        /* =====================================================
           VOIES
        ===================================================== */

        const lanes = [

            -5,
            0,
            5

        ];


        let targetLane = 1;


        /* =====================================================
           VÉHICULES GLB
        ===================================================== */

        const obstacles = [];

        const vehicleModels = [];

        const vehicleFiles = [
            "/Models/Vehicles/tractor.glb",
            "/Models/Vehicles/taxi.glb",
            "/Models/Vehicles/suv-luxury.glb",
            "/Models/Vehicles/hatchback-sports.glb"
        ];

        let loadedVehicleCount = 0;


        /*
           =========================================================
           ISOLATION DES VÉHICULES
           =========================================================

           IMPORTANT :
           Les véhicules et l'environnement peuvent utiliser la
           même colormap.png. On ne doit donc JAMAIS laisser un
           véhicule partager directement ses matériaux/textures
           avec un autre objet.

           On clone :
           - les matériaux
           - les textures
           - les textures de chaque canal PBR

           Ainsi, le chargement des véhicules ne peut pas modifier
           l'apparence du grass, des bâtiments ou du pavement.
        */

        const VEHICLE_TEXTURE_PROPERTIES = [

            "map",
            "normalMap",
            "roughnessMap",
            "metalnessMap",
            "aoMap",
            "emissiveMap",
            "alphaMap",
            "bumpMap",
            "displacementMap",
            "lightMap",
            "clearcoatMap",
            "clearcoatNormalMap",
            "clearcoatRoughnessMap",
            "sheenColorMap",
            "sheenRoughnessMap",
            "specularMap",
            "specularColorMap",
            "specularIntensityMap",
            "transmissionMap",
            "thicknessMap",
            "iridescenceMap",
            "iridescenceThicknessMap"
        ];


        function isolateVehicleMaterials(
            object
        ) {

            object.traverse(
                child => {

                    if (
                        !child.isMesh
                    ) {
                        return;
                    }

                    /*
                       On clone le tableau de matériaux si le mesh
                       utilise plusieurs matériaux.
                    */

                    if (
                        Array.isArray(
                            child.material
                        )
                    ) {

                        child.material =
                            child.material.map(
                                material =>
                                    cloneVehicleMaterial(
                                        material
                                    )
                            );

                    } else {

                        child.material =
                            cloneVehicleMaterial(
                                child.material
                            );

                    }

                    child.castShadow =
                        true;

                    child.receiveShadow =
                        true;
                }
            );
        }


        function cloneVehicleMaterial(
            material
        ) {

            if (
                !material
            ) {
                return material;
            }

            const cloned =
                material.clone();

            /*
               Un matériau cloné n'est pas suffisant :
               les textures sont encore des objets partagés.
               On clone donc chaque texture utilisée.
            */

            VEHICLE_TEXTURE_PROPERTIES.forEach(
                property => {

                    const texture =
                        cloned[property];

                    if (
                        texture &&
                        texture.isTexture
                    ) {

                        cloned[property] =
                            texture.clone();

                        /*
                           Force Three.js à considérer cette texture
                           comme une ressource indépendante.
                        */

                        cloned[property].needsUpdate =
                            true;
                    }
                }
            );

            cloned.needsUpdate =
                true;

            return cloned;
        }


        function prepareVehicleModel(
            model
        ) {

            const prepared =
                model.clone(true);

            /*
               IMPORTANT :

               On NE clone PAS les matériaux/textures ici.
               Le clonage par instance de véhicule créait une
               fuite mémoire GPU (une nouvelle copie de
               colormap.png à chaque voiture générée, jamais
               libérée), ce qui finissait par corrompre le rendu
               de toute la scène (grass/pavement virant au noir).

               Le partage de matériaux entre plusieurs instances
               du même modèle est sûr (c'est déjà ce que fait le
               reste du décor : grass, pavement, buildings...).
            */

            prepared.traverse(
                child => {

                    if (
                        child.isMesh
                    ) {

                        child.castShadow =
                            true;

                        child.receiveShadow =
                            true;

                    }

                }
            );

            /*
               Mise à l'échelle automatique :
               on vise une longueur raisonnable
               pour un véhicule sur les voies.
            */

            const box =
                new THREE.Box3()
                    .setFromObject(
                        prepared
                    );

            const size =
                new THREE.Vector3();

            box.getSize(
                size
            );

            const targetLength =
                4.2;

            const largestHorizontal =
                Math.max(
                    size.x,
                    size.z,
                    0.001
                );

            const scale =
                targetLength /
                largestHorizontal;

            prepared.scale.set(
                scale,
                scale,
                scale
            );

            /*
               Après scaling, on recalcule la base
               pour poser le véhicule exactement au sol.
            */

            const scaledBox =
                new THREE.Box3()
                    .setFromObject(
                        prepared
                    );

            prepared.userData.groundY =
                -scaledBox.min.y;

            return prepared;
        }


        function loadVehicleModels() {

            vehicleFiles.forEach(
                function(path) {

                    loader.load(

                        path,

                        function(gltf) {

                            const vehicle =
                                prepareVehicleModel(
                                    gltf.scene
                                );

                            vehicleModels.push(
                                vehicle
                            );

                            loadedVehicleCount++;

                            console.log(
                                "Véhicule chargé et isolé :",
                                path
                            );

                        },

                        undefined,

                        function(error) {

                            console.error(
                                "Erreur véhicule :",
                                path,
                                error
                            );

                        }

                    );

                }
            );
        }


        function cloneVehicle(
            model
        ) {

            const vehicle =
                model.clone(true);

            /*
               On partage les matériaux/textures entre toutes les
               voitures du même modèle (comme pour le reste du
               décor). Voir prepareVehicleModel() pour l'explication :
               cloner une texture par voiture apparue, sans jamais la
               libérer, provoquait une fuite mémoire GPU qui finissait
               par corrompre le rendu (grass/pavement noirs).
            */

            vehicle.userData.groundY =
                model.userData.groundY;

            return vehicle;
        }


        /* =====================================================
           CHARGEMENT DES VÉHICULES
        ===================================================== */

        loadVehicleModels();


        /* =====================================================
           OBSTACLES / VÉHICULES
        ===================================================== */




        function createObstacle() {

            /*
               Les anciens carrés rouges sont remplacés par
               de vrais véhicules GLB.

               Le choix du modèle est aléatoire pour varier
               le trafic : tracteur, taxi, SUV et sportive.
            */

            if (
                vehicleModels.length === 0
            ) {
                return;
            }

            const model =
                vehicleModels[
                    Math.floor(
                        Math.random() *
                        vehicleModels.length
                    )
                ];

            const vehicle =
                cloneVehicle(
                    model
                );

            const lane =
                Math.floor(
                    Math.random() *
                    lanes.length
                );

            /*
               Le véhicule est placé au centre de sa voie.
               Son orientation est corrigée pour regarder
               dans le même sens que la circulation.
            */

            vehicle.position.set(
                lanes[lane],
                vehicle.userData.groundY || 0,
                -120
            );

            vehicle.rotation.y =
                Math.PI;

            /*
               Certaines voitures (pas toutes) vont changer
               de voie toutes seules pendant la course, pour
               gêner le joueur. On garde en mémoire la voie
               actuelle et un minuteur avant le prochain
               changement.
            */

            const isLaneChanger =
                Math.random() < 0.55;

            vehicle.userData.lane =
                lane;

            vehicle.userData.isLaneChanger =
                isLaneChanger;

            vehicle.userData.laneChangeTimer =
                isLaneChanger ?
                    0.8 + Math.random() * 1.2 :
                    Infinity;

            scene.add(
                vehicle
            );

            obstacles.push(
                vehicle
            );
        }

        /* =====================================================
           PIÈCES
        ===================================================== */

        const coinObjects = [];


        function createCoin() {

            const coin =
                new THREE.Mesh(

                    new THREE.TorusGeometry(

                        0.45,
                        0.13,
                        12,
                        24

                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            0xffd900,

                        emissive:
                            0x553300

                    })

                );


            const lane =
                Math.floor(

                    Math.random() *
                    lanes.length

                );


            coin.position.set(

                lanes[lane],
                1.5,
                -120

            );


            coin.rotation.x =
                Math.PI / 2;


            scene.add(
                coin
            );


            coinObjects.push(
                coin
            );

        }


        /* =====================================================
           CONTRÔLES
        ===================================================== */

        function handleKeyDown(event) {


                if (

                    event.key ===
                    "ArrowLeft" ||

                    event.key.toLowerCase() ===
                    "a"

                ) {

                    if (
                        targetLane > 0
                    ) {

                        targetLane--;

                    }

                }


                if (

                    event.key ===
                    "ArrowRight" ||

                    event.key.toLowerCase() ===
                    "d"

                ) {

                    if (
                        targetLane < 2
                    ) {

                        targetLane++;

                    }

                }

        }

        document.addEventListener(
            "keydown",
            handleKeyDown
        );


        /*
           =========================================================
           CONTRÔLES TACTILES / SOURIS

           Pour jouer sans bouton visible (notamment sur mobile) :
           un appui sur la moitié GAUCHE de l'écran déplace la
           voiture à gauche, un appui sur la moitié DROITE la
           déplace à droite. On ignore ces appuis tant qu'une
           manche n'est pas en cours (menus/popups affichés), pour
           ne jamais interférer avec les boutons des popups.
        */

        function handlePointerDown(event) {

                if (
                    !gameRunning
                ) {
                    return;
                }

                const isLeftSide =
                    event.clientX <
                    window.innerWidth / 2;

                if (
                    isLeftSide
                ) {

                    if (
                        targetLane > 0
                    ) {

                        targetLane--;

                    }

                } else {

                    if (
                        targetLane < 2
                    ) {

                        targetLane++;

                    }

                }

        }

        document.addEventListener(
            "pointerdown",
            handlePointerDown
        );


        /* =====================================================
           VARIABLES JEU
        ===================================================== */

        const BASE_SPEED =
            1.3;

        let speed =
            BASE_SPEED;


        let score =
            0;


        let coinCount =
            0;


        let gameRunning =
            false;


        let obstacleTimer =
            0.6;


        let coinTimer =
            0.3;


        let elapsedTime =
            0;


        /*
           =========================================================
           MISE / SOLDE

           Le joueur doit miser entre MIN_BET et MAX_BET XOF avant
           de pouvoir jouer. Le solde de départ est STARTING_BALANCE
           XOF et il est conservé dans localStorage pour survivre
           à un rechargement de page (le bouton REJOUER recharge
           la page).
        */

        const STARTING_BALANCE =
            10000;

        const MIN_BET =
            100;

        const MAX_BET =
            500;

        const BALANCE_STORAGE_KEY =
            "endlessRoadBalance";

        let balance =
            (
                function() {

                    const stored =
                        localStorage.getItem(
                            BALANCE_STORAGE_KEY
                        );

                    const parsed =
                        stored !== null ?
                            parseInt(stored, 10) :
                            NaN;

                    return Number.isFinite(parsed) ?
                        parsed :
                        STARTING_BALANCE;

                }
            )();

        let currentBet =
            0;


        function saveBalance() {

            localStorage.setItem(
                BALANCE_STORAGE_KEY,
                String(balance)
            );

        }


        function formatXOF(
            amount
        ) {

            return (
                Math.max(
                    0,
                    Math.floor(amount)
                ) +
                " XOF"
            );

        }


        function formatTime(
            seconds
        ) {

            const totalSeconds =
                Math.floor(seconds);

            const minutes =
                Math.floor(
                    totalSeconds / 60
                );

            const secs =
                totalSeconds % 60;

            return (

                String(minutes).padStart(2, "0") +
                ":" +
                String(secs).padStart(2, "0")

            );

        }


        /* =====================================================
           POPUP DE MISE
        ===================================================== */

        const betModal =
            document.getElementById("betModal");

        const betInput =
            document.getElementById("betInput");

        const betError =
            document.getElementById("betError");

        const betConfirmButton =
            document.getElementById("betConfirm");

        const modalBalanceEl =
            document.getElementById("modalBalance");

        function refreshBalanceDisplays() {

            modalBalanceEl.textContent =
                Math.floor(balance);

            document.getElementById(
                "balance"
            ).textContent =
                formatXOF(balance);

        }


        function openBetModal() {

            refreshBalanceDisplays();

            betError.textContent =
                "";

            betModal.style.display =
                "flex";

        }


        /* =====================================================
           POPUP DES RÈGLES

           Accessible uniquement depuis le popup de mise, jamais
           depuis le HUD pendant la partie.
        ===================================================== */

        const rulesModal =
            document.getElementById("rulesModal");

        const rulesButton =
            document.getElementById("rulesButton");

        const rulesCloseButton =
            document.getElementById("rulesClose");


        rulesButton.addEventListener(

            "click",

            function() {

                rulesModal.style.display =
                    "flex";

            }

        );


        rulesCloseButton.addEventListener(

            "click",

            function() {

                rulesModal.style.display =
                    "none";

            }

        );


        /*
           =========================================================
           OBJECTIF

           Une fois la mise validée, un objectif aléatoire est tiré
           au sort parmi 5 types. Le joueur double sa mise s'il
           atteint l'objectif, et la perd s'il s'écrase avant ou si
           le temps imparti s'épuise sans que l'objectif soit atteint.
           Dès que l'objectif est atteint, la partie s'arrête
           automatiquement (le joueur gagne).
        */

        let currentObjective = null;


        function randomInt(
            min,
            max
        ) {

            return (

                min +

                Math.floor(
                    Math.random() *
                    (
                        max -
                        min +
                        1
                    )
                )

            );

        }


        function generateObjective() {

            const types = [

                "COINS",
                "TIME",
                "SCORE",
                "SCORE_TIME",
                "COINS_TIME"

            ];

            const type =
                types[
                    randomInt(
                        0,
                        types.length - 1
                    )
                ];

            if (
                type === "COINS"
            ) {

                const coinsTarget =
                    randomInt(
                        10,
                        25
                    );

                return {

                    type:
                        type,

                    coinsTarget:
                        coinsTarget,

                    label:
                        "Collecte " +
                        coinsTarget +
                        " pièces"

                };

            }

            if (
                type === "TIME"
            ) {

                const timeTarget =
                    randomInt(
                        20,
                        45
                    );

                return {

                    type:
                        type,

                    timeTarget:
                        timeTarget,

                    label:
                        "Joue " +
                        timeTarget +
                        " secondes"

                };

            }

            if (
                type === "SCORE"
            ) {

                const scoreTarget =
                    randomInt(
                        20,
                        60
                    );

                return {

                    type:
                        type,

                    scoreTarget:
                        scoreTarget,

                    label:
                        "Atteins " +
                        scoreTarget +
                        " points de score"

                };

            }

            if (
                type === "SCORE_TIME"
            ) {

                const scoreTarget =
                    randomInt(
                        20,
                        50
                    );

                const timeTarget =
                    randomInt(
                        25,
                        50
                    );

                return {

                    type:
                        type,

                    scoreTarget:
                        scoreTarget,

                    timeTarget:
                        timeTarget,

                    label:
                        "Atteins " +
                        scoreTarget +
                        " points en " +
                        timeTarget +
                        " secondes"

                };

            }

            /*
               COINS_TIME
            */

            const coinsTarget =
                randomInt(
                    8,
                    20
                );

            const timeTarget =
                randomInt(
                    20,
                    40
                );

            return {

                type:
                    "COINS_TIME",

                coinsTarget:
                    coinsTarget,

                timeTarget:
                    timeTarget,

                label:
                    "Collecte " +
                    coinsTarget +
                    " pièces en " +
                    timeTarget +
                    " secondes"

            };

        }


        function objectiveProgressText() {

            if (
                !currentObjective
            ) {
                return "-";
            }

            if (
                currentObjective.type === "COINS"
            ) {

                return (
                    coinCount +
                    "/" +
                    currentObjective.coinsTarget +
                    " pièces"
                );

            }

            if (
                currentObjective.type === "TIME"
            ) {

                return (
                    formatTime(elapsedTime) +
                    "/" +
                    formatTime(currentObjective.timeTarget)
                );

            }

            if (
                currentObjective.type === "SCORE"
            ) {

                return (
                    Math.floor(score) +
                    "/" +
                    currentObjective.scoreTarget +
                    " pts"
                );

            }

            if (
                currentObjective.type === "SCORE_TIME"
            ) {

                return (
                    Math.floor(score) +
                    "/" +
                    currentObjective.scoreTarget +
                    " pts (" +
                    formatTime(elapsedTime) +
                    "/" +
                    formatTime(currentObjective.timeTarget) +
                    ")"
                );

            }

            /*
               COINS_TIME
            */

            return (
                coinCount +
                "/" +
                currentObjective.coinsTarget +
                " pièces (" +
                formatTime(elapsedTime) +
                "/" +
                formatTime(currentObjective.timeTarget) +
                ")"
            );

        }


        function checkObjective() {

            if (
                !currentObjective ||
                !gameRunning
            ) {
                return;
            }

            const objective =
                currentObjective;

            let won =
                false;

            let timedOut =
                false;

            if (
                objective.type === "COINS"
            ) {

                won =
                    coinCount >= objective.coinsTarget;

            } else if (
                objective.type === "TIME"
            ) {

                won =
                    elapsedTime >= objective.timeTarget;

            } else if (
                objective.type === "SCORE"
            ) {

                won =
                    score >= objective.scoreTarget;

            } else if (
                objective.type === "SCORE_TIME"
            ) {

                won =
                    score >= objective.scoreTarget;

                timedOut =

                    !won &&
                    elapsedTime >= objective.timeTarget;

            } else if (
                objective.type === "COINS_TIME"
            ) {

                won =
                    coinCount >= objective.coinsTarget;

                timedOut =

                    !won &&
                    elapsedTime >= objective.timeTarget;

            }

            if (
                won
            ) {

                endRound(
                    true
                );

            } else if (
                timedOut
            ) {

                endRound(
                    false,
                    true
                );

            }

        }


        /* =====================================================
           POPUP OBJECTIF
        ===================================================== */

        const objectiveModal =
            document.getElementById("objectiveModal");

        const objectiveText =
            document.getElementById("objectiveText");

        const objectiveBetAmountEl =
            document.getElementById("objectiveBetAmount");

        const objectiveWinAmountEl =
            document.getElementById("objectiveWinAmount");

        const objectiveStartButton =
            document.getElementById("objectiveStart");

        const objectiveProgressEl =
            document.getElementById("objectiveProgress");


        function openObjectiveModal() {

            currentObjective =
                generateObjective();

            objectiveText.textContent =
                currentObjective.label;

            objectiveBetAmountEl.textContent =
                Math.floor(currentBet);

            objectiveWinAmountEl.textContent =
                Math.floor(currentBet * 2);

            objectiveProgressEl.textContent =
                objectiveProgressText();

            objectiveModal.style.display =
                "flex";

        }


        objectiveStartButton.addEventListener(

            "click",

            function() {

                objectiveModal.style.display =
                    "none";

                /*
                   On "vide" le chrono interne de THREE.Clock pour
                   que le temps passé sur les popups ne soit pas
                   compté comme un delta géant à la première frame
                   de jeu (ce qui ferait apparaître d'un coup tout
                   un tas d'obstacles/pièces).
                */

                clock.start();

                elapsedTime =
                    0;

                gameRunning =
                    true;

            }

        );


        betConfirmButton.addEventListener(

            "click",

            function() {

                const amount =
                    parseInt(
                        betInput.value,
                        10
                    );

                if (
                    !Number.isFinite(amount) ||
                    amount < MIN_BET ||
                    amount > MAX_BET
                ) {

                    betError.textContent =

                        "La mise doit être comprise entre " +
                        MIN_BET +
                        " et " +
                        MAX_BET +
                        " XOF.";

                    return;

                }

                if (
                    amount > balance
                ) {

                    betError.textContent =

                        "Solde insuffisant pour cette mise.";

                    return;

                }

                /*
                   Mise validée : on débite le solde,
                   on referme le popup de mise et on
                   affiche l'objectif à atteindre. La
                   partie ne démarre qu'après validation
                   du popup d'objectif.
                */

                balance -=
                    amount;

                currentBet =
                    amount;

                saveBalance();

                document.getElementById(
                    "currentBet"
                ).textContent =
                    formatXOF(currentBet);

                refreshBalanceDisplays();

                betModal.style.display =
                    "none";

                openObjectiveModal();

            }

        );


        openBetModal();


        /*
           =========================================================
           PROGRESSION DE VITESSE

           Le score n'augmente plus tout seul avec le temps : il
           n'augmente désormais que quand on ramasse une pièce
           (+2 points). Toutes les 10 points, la vitesse augmente
           d'un cran, sans limite maximale : plus on joue longtemps
           et plus on ramasse de pièces, plus la course s'accélère.
        */

        const SCORE_PER_COIN =
            2;

        const SPEED_UP_EVERY_SCORE =
            10;

        const SPEED_INCREMENT =
            0.06;

        let speedLevel =
            0;


        /* =====================================================
           COLLISION
        ===================================================== */

        function collision(
            a,
            b
        ) {

            const boxA =
                new THREE.Box3()
                    .setFromObject(a);

            const boxB =
                new THREE.Box3()
                    .setFromObject(b);

            /*
               Petite marge de sécurité : on évite que
               les parties non essentielles du GLB rendent
               la collision trop agressive.
            */

            boxA.expandByScalar(-0.15);
            boxB.expandByScalar(-0.12);

            return boxA.intersectsBox(
                boxB
            );

        }


        /* =====================================================
           FIN DE PARTIE (VICTOIRE / DÉFAITE)
        ===================================================== */

        const resultScreen =
            document.getElementById("resultScreen");

        const resultTitleEl =
            document.getElementById("resultTitle");

        const resultMessageEl =
            document.getElementById("resultMessage");


        function endRound(
            won,
            timedOut
        ) {

            /*
               On arrête immédiatement la partie, que ce soit
               une victoire (objectif atteint) ou une défaite
               (collision ou temps écoulé sans objectif rempli).
            */

            gameRunning =
                false;

            if (
                won
            ) {

                const winnings =
                    currentBet * 2;

                balance +=
                    winnings;

                saveBalance();

                refreshBalanceDisplays();

                resultTitleEl.textContent =
                    "OBJECTIF ATTEINT !";

                resultMessageEl.textContent =

                    "Score : " +
                    Math.floor(score) +
                    " — Vous gagnez " +
                    formatXOF(winnings);

            } else {

                resultTitleEl.textContent =
                    "GAME OVER";

                resultMessageEl.textContent =

                    "Score : " +
                    Math.floor(score) +
                    (
                        timedOut ?
                            " — Temps écoulé, objectif non atteint." :
                            " — Mise perdue."
                    );

            }

            resultScreen.style.display =
                "flex";

        }


        function resetRound() {

            /*
               On retire du décor tous les obstacles et pièces
               encore présents (une manche peut se terminer avec
               du trafic ou des pièces encore à l'écran).
            */

            for (
                let i = obstacles.length - 1;
                i >= 0;
                i--
            ) {

                scene.remove(
                    obstacles[i]
                );

            }

            obstacles.length =
                0;

            for (
                let i = coinObjects.length - 1;
                i >= 0;
                i--
            ) {

                scene.remove(
                    coinObjects[i]
                );

            }

            coinObjects.length =
                0;

            /*
               Réinitialisation des variables de jeu.
            */

            score =
                0;

            coinCount =
                0;

            elapsedTime =
                0;

            speed =
                BASE_SPEED;

            speedLevel =
                0;

            obstacleTimer =
                0.6;

            coinTimer =
                0.3;

            currentObjective =
                null;

            /*
               Le joueur revient au centre de la route.
            */

            targetLane =
                1;

            player.position.x =
                lanes[targetLane];

            /*
               Réinitialisation de l'affichage.
            */

            document.getElementById(
                "score"
            ).textContent =
                "0";

            document.getElementById(
                "coins"
            ).textContent =
                "0";

            document.getElementById(
                "time"
            ).textContent =
                "00:00";

            objectiveProgressEl.textContent =
                "-";

            resultScreen.style.display =
                "none";

            /*
               On propose une nouvelle mise pour la manche
               suivante, sans jamais recharger la page.
            */

            openBetModal();

        }


        window.restartGame =
            function() {

                resetRound();

            };


        /* =====================================================
           CLOCK
        ===================================================== */

        const clock =
            new THREE.Clock();


        /*
           Clock séparé, uniquement utilisé pour mesurer le temps
           réel entre deux frames rendues (voir frameFactor plus bas).
           On ne réutilise pas `clock` ci-dessus car celui-ci est
           volontairement redémarré (clock.start()) à chaque début de
           manche pour le chrono de jeu ; frameClock, lui, tourne en
           continu, y compris pendant les popups.
        */

        const frameClock =
            new THREE.Clock();


        /* =====================================================
           ANIMATION
        ===================================================== */

        function animate() {

            if (
                disposed
            ) {
                return;
            }

            animationFrameId =
                requestAnimationFrame(
                    animate
                );


            /*
               =========================================================
               FACTEUR INDÉPENDANT DE LA FRAMERATE (fix mobile)

               Avant, chaque déplacement (route, décor, véhicules,
               nuages...) avançait d'une quantité FIXE à chaque image
               rendue, sans tenir compte du temps réel écoulé. Sur PC à
               ~60 images/seconde ça ne se voyait pas, mais sur un
               téléphone qui rame et tombe à 15-20 images/seconde, tout
               se déplaçait 3-4x plus lentement à l'écran... alors que
               le minuteur d'apparition des véhicules, lui, est basé sur
               le temps réel écoulé (clock.getDelta()) et continuait
               donc à un rythme normal. Résultat : les voitures
               s'accumulaient sans avoir le temps de s'éloigner.

               `frameFactor` vaut 1 à 60 images/seconde (comportement
               strictement identique à avant sur PC) et augmente
               automatiquement quand la framerate baisse, pour que tout
               avance à la même vitesse RÉELLE quel que soit le nombre
               d'images par seconde. On plafonne l'écart mesuré à 0.1s
               (soit un facteur max de 6) pour éviter un bond énorme
               après une grosse coupure (ex. onglet en arrière-plan).
            */

            const frameDelta =
                Math.min(
                    frameClock.getDelta(),
                    0.1
                );

            const frameFactor =
                frameDelta * 60;


            updateClouds(
                frameFactor
            );


            if (
                !gameRunning
            ) {

                renderer.render(
                    scene,
                    camera
                );

                return;

            }


            const delta =
                clock.getDelta();


            /* =================================================
               CHRONO
            ================================================= */

            elapsedTime +=
                delta;

            document.getElementById(
                "time"
            ).textContent =

                formatTime(
                    elapsedTime
                );

            objectiveProgressEl.textContent =
                objectiveProgressText();


            /* =================================================
               JOUEUR
            ================================================= */

            const targetX =
                lanes[targetLane];


            player.position.x +=

                (
                    targetX -
                    player.position.x

                ) * 0.15 * frameFactor;


            /* =================================================
               CAMÉRA (suit le joueur sur le côté)
            ================================================= */

            camera.position.x +=

                (
                    player.position.x -
                    camera.position.x

                ) * 0.08 * frameFactor;


            camera.lookAt(

                camera.position.x,
                1,
                -30

            );


            /* =================================================
               ROUES
            ================================================= */

            if (
                playerModelReady
            ) {

                playerWheels.forEach(
                    wheel => {

                        wheel.rotation.x -=
                            speed *
                            2.2 *
                            frameFactor;

                    }
                );

            }


            /* =================================================
               ROAD
            ================================================= */

            for (
                const road
                of roadParts
            ) {

                road.position.z +=
                    speed *
                    frameFactor;


                if (
                    road.position.z >
                    ROAD_SPACING
                ) {

                    let farthest =
                        Infinity;


                    for (
                        const other
                        of roadParts
                    ) {

                        if (
                            other !== road
                        ) {

                            farthest =

                                Math.min(

                                    farthest,

                                    other.position.z

                                );

                        }

                    }


                    road.position.z =

                        farthest -
                        ROAD_STEP;

                }

            }


            /* =================================================
               PAVEMENT
            ================================================= */

            moveDecor(
                pavementLeft,
                frameFactor
            );

            moveDecor(
                pavementRight,
                frameFactor
            );


            /* =================================================
               GRASS
            ================================================= */

            moveDecor(
                grassLeft,
                frameFactor
            );

            moveDecor(
                grassRight,
                frameFactor
            );


            /* =================================================
               ARBRES
            ================================================= */

            moveDecor(
                treesLeft,
                frameFactor
            );

            moveDecor(
                treesRight,
                frameFactor
            );


            /* =================================================
               LAMPADAIRES
            ================================================= */

            moveDecor(
                lampsLeft,
                frameFactor
            );

            moveDecor(
                lampsRight,
                frameFactor
            );


            /* =================================================
               BÂTIMENTS
            ================================================= */

            moveDecor(
                buildingsLeft,
                frameFactor
            );

            moveDecor(
                buildingsRight,
                frameFactor
            );


            /* =================================================
               OBSTACLES
            ================================================= */

            obstacleTimer -=
                delta;


            if (
                obstacleTimer <= 0
            ) {

                createObstacle();


                /*
                   IMPORTANT :

                   On calibre l'intervalle d'apparition sur la
                   vitesse ACTUELLE plutôt que sur une constante
                   fixe. Sans ça, plus le jeu accélère, plus les
                   véhicules parcourent la distance road->caméra
                   rapidement et moins longtemps ils restent
                   visibles à l'écran : à intervalle de temps fixe,
                   la route semble de plus en plus vide au fil de
                   la partie.

                   En multipliant par (BASE_SPEED / speed), l'écart
                   EN DISTANCE entre deux véhicules reste à peu près
                   constant, donc la densité de circulation visible
                   ne diminue plus quand ça accélère.
                */

                obstacleTimer =

                    (
                        0.5 +
                        Math.random() *
                        0.5
                    ) *
                    (
                        BASE_SPEED /
                        speed
                    );

            }


            for (

                let i =
                    obstacles.length - 1;

                i >= 0;

                i--

            ) {

                const obstacle =
                    obstacles[i];


                obstacle.position.z +=
                    speed *
                    frameFactor;


                /* =============================================
                   CHANGEMENT DE VOIE (voitures gênantes)
                ============================================= */

                if (
                    obstacle.userData.isLaneChanger
                ) {

                    obstacle.userData.laneChangeTimer -=
                        delta;


                    if (
                        obstacle.userData.laneChangeTimer <= 0
                    ) {

                        let newLane;

                        do {

                            newLane =
                                Math.floor(
                                    Math.random() *
                                    lanes.length
                                );

                        } while (
                            newLane === obstacle.userData.lane
                        );

                        obstacle.userData.lane =
                            newLane;

                        obstacle.userData.laneChangeTimer =
                            0.8 + Math.random() * 1.2;

                    }


                    const obstacleTargetX =
                        lanes[
                            obstacle.userData.lane
                        ];

                    obstacle.position.x +=

                        (
                            obstacleTargetX -
                            obstacle.position.x

                        ) * 0.06 * frameFactor;

                }


                if (
                    collision(
                        player,
                        obstacle
                    )
                ) {

                    endRound(
                        false
                    );

                    return;

                }


                if (
                    obstacle.position.z > 15
                ) {

                    scene.remove(
                        obstacle
                    );


                    obstacles.splice(
                        i,
                        1
                    );

                }

            }


            /* =================================================
               PIÈCES
            ================================================= */

            coinTimer -=
                delta;


            if (
                coinTimer <= 0
            ) {

                createCoin();


                /*
                   Même logique que pour les obstacles : on calibre
                   l'intervalle sur la vitesse actuelle pour que les
                   pièces restent aussi denses à l'écran, même quand
                   le jeu s'accélère.
                */

                coinTimer =

                    (
                        0.2 +
                        Math.random() *
                        0.3
                    ) *
                    (
                        BASE_SPEED /
                        speed
                    );

            }


            for (

                let i =
                    coinObjects.length - 1;

                i >= 0;

                i--

            ) {

                const coin =
                    coinObjects[i];


                coin.position.z +=
                    speed *
                    frameFactor;


                coin.rotation.y +=
                    0.08 *
                    frameFactor;


                if (
                    collision(
                        player,
                        coin
                    )
                ) {

                    coinCount++;


                    document.getElementById(
                        "coins"
                    ).textContent =
                        coinCount;


                    /*
                       Chaque pièce rapporte 2 points.
                    */

                    score +=
                        SCORE_PER_COIN;

                    document.getElementById(
                        "score"
                    ).textContent =

                        Math.floor(
                            score
                        );


                    /*
                       Toutes les SPEED_UP_EVERY_SCORE points,
                       la vitesse augmente d'un cran. On compare
                       un "palier" plutôt que le score brut pour
                       ne déclencher l'accélération qu'une seule
                       fois par palier franchi, même si plusieurs
                       pièces sont ramassées rapidement.
                    */

                    const newSpeedLevel =
                        Math.floor(
                            score /
                            SPEED_UP_EVERY_SCORE
                        );

                    if (
                        newSpeedLevel > speedLevel
                    ) {

                        speed +=

                            SPEED_INCREMENT *
                            (
                                newSpeedLevel -
                                speedLevel
                            );

                        speedLevel =
                            newSpeedLevel;

                    }


                    scene.remove(
                        coin
                    );


                    coinObjects.splice(
                        i,
                        1
                    );


                    continue;

                }


                if (
                    coin.position.z > 15
                ) {

                    scene.remove(
                        coin
                    );


                    coinObjects.splice(
                        i,
                        1
                    );

                }

            }


            /*
               Le score et la vitesse ne progressent plus tout
               seuls à chaque frame : voir le bloc "PIÈCES"
               ci-dessus, où la collecte d'une pièce augmente
               le score de SCORE_PER_COIN et déclenche un cran
               de vitesse supplémentaire tous les
               SPEED_UP_EVERY_SCORE points.
            */


            /* =================================================
               OBJECTIF

               On vérifie à chaque frame si l'objectif est atteint
               (victoire, mise doublée) ou si le temps imparti est
               écoulé sans que l'objectif soit rempli (défaite). La
               partie s'arrête automatiquement dans les deux cas.
            ================================================= */

            checkObjective();

            if (
                !gameRunning
            ) {

                renderer.render(
                    scene,
                    camera
                );

                return;

            }


            /* =================================================
               RENDU
            ================================================= */

            renderer.render(

                scene,
                camera

            );

        }


        /* =====================================================
           DÉMARRAGE
        ===================================================== */

        animate();


        /* =====================================================
           RESIZE
        ===================================================== */

        function handleResize() {

            camera.aspect =

                window.innerWidth /
                window.innerHeight;


            camera.updateProjectionMatrix();


            renderer.setSize(

                window.innerWidth,
                window.innerHeight

            );

        }

        window.addEventListener(
            "resize",
            handleResize
        );


        /*
           =========================================================
           NETTOYAGE (spécifique à l'intégration React/Next.js)

           Le jeu original était un simple <script type="module">
           exécuté une seule fois pour toute la durée de vie de la
           page HTML. En React, ce même code tourne dans un
           useEffect() qui peut être démonté (changement de page,
           Fast Refresh en dev, etc.). On restitue donc une fonction
           de nettoyage qui arrête la boucle d'animation, retire les
           écouteurs et libère le renderer, sans changer la moindre
           règle de jeu.
        */

        return function cleanup() {

            disposed =
                true;

            if (
                animationFrameId !== null
            ) {

                cancelAnimationFrame(
                    animationFrameId
                );

            }

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

            document.removeEventListener(
                "pointerdown",
                handlePointerDown
            );

            window.removeEventListener(
                "resize",
                handleResize
            );

            if (
                renderer.domElement &&
                renderer.domElement.parentNode
            ) {

                renderer.domElement.parentNode.removeChild(
                    renderer.domElement
                );

            }

            renderer.dispose();

        };



    }, []);

    return (
        <>
             <div id="loading" className="fixed inset-0 flex items-center justify-center bg-[#72c9ff] text-white text-2xl font-bold z-[100]">
                Chargement du jeu...
            </div>

            <div id="hud-left" className="fixed top-5 left-5 z-20 flex flex-col gap-2">
                <div className="hud-item flex items-baseline gap-2.5 px-4 py-2 rounded-[10px] bg-black/45 backdrop-blur-[3px] text-white [text-shadow:0_2px_5px_rgba(0,0,0,0.8)]">
                    <span className="text-sm font-bold uppercase tracking-[0.5px] opacity-80">Score</span>
                    <span className="text-[22px] font-bold" id="score">0</span>
                </div>

                <div className="hud-item flex items-baseline gap-2.5 px-4 py-2 rounded-[10px] bg-black/45 backdrop-blur-[3px] text-white [text-shadow:0_2px_5px_rgba(0,0,0,0.8)]">
                    <span className="text-sm font-bold uppercase tracking-[0.5px] opacity-80">Pièces</span>
                    <span className="text-[22px] font-bold" id="coins">0</span>
                </div>
            </div>

            <div id="hud-right" className="fixed top-5 right-5 z-20 flex flex-col gap-2 items-end">
                <div className="hud-item flex items-baseline gap-2.5 px-4 py-2 rounded-[10px] bg-black/45 backdrop-blur-[3px] text-white [text-shadow:0_2px_5px_rgba(0,0,0,0.8)]">
                    <span className="text-sm font-bold uppercase tracking-[0.5px] opacity-80">Temps</span>
                    <span className="text-[22px] font-bold" id="time">00:00</span>
                </div>

                <span id="objectiveProgress" className="hidden">-</span>
                <span id="balance" className="hidden">0 XOF</span>
                <span id="currentBet" className="hidden">0 XOF</span>
            </div>

            <div id="betModal" className="fixed inset-0 flex items-center justify-center bg-black/75 text-white z-[200]">
                <div className="bet-box bg-[#0b1620] border border-white/10 rounded-2xl p-8 w-80 max-w-[90vw] text-center shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                    <h2 className="text-2xl mb-1.5">Placez votre mise</h2>

                    <p className="text-base opacity-80 mb-5">
                        Solde disponible :{" "}
                        <span id="modalBalance" className="text-[#00d4ff] font-bold">0</span>{" "}
                        XOF
                    </p>

                    <label htmlFor="betInput" className="block text-left text-[13px] opacity-75 mb-1.5">
                        Montant de la mise (100 - 500 XOF)
                    </label>

                    <input
                        type="number"
                        id="betInput"
                        min="100"
                        max="500"
                        step="10"
                        defaultValue="100"
                        className="w-full px-3 py-3 rounded-lg border border-white/20 bg-white/5 text-white text-lg text-center mb-2"
                    />

                    <p id="betError" className="min-h-[18px] text-[13px] text-[#ff6b6b] mb-3.5"></p>

                    <button type="button" id="betConfirm" className="w-full border-none px-9 py-[15px] rounded-[10px] bg-[#00d4ff] text-[#001018] text-xl font-bold cursor-pointer">
                        JOUER
                    </button>

                    <button type="button" id="rulesButton" className="btn-secondary w-full mt-3 bg-transparent text-white border border-white/30 text-base px-5 py-3 cursor-pointer rounded-[10px] font-bold">
                        RÈGLES
                    </button>
                </div>
            </div>

            <div
                id="rulesModal"
                className="fixed inset-0 hidden items-center justify-center bg-black/80 text-white z-[300]"
            >
                <div className="bet-box rules-box bg-[#0b1620] border border-white/10 rounded-2xl p-8 w-80 max-w-[min(420px,90vw)] text-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-h-[80vh] overflow-y-auto text-left">
                    <h2 className="text-2xl mb-1.5 text-center mb-4">Règles du jeu</h2>

                    <h3 className="text-base my-4 text-[#00d4ff] font-bold">Comment jouer</h3>

                    <ul className="pl-5 mb-1.5">
                        <li className="text-sm leading-relaxed opacity-90">Touchez ou cliquez sur la moitié GAUCHE de l&apos;écran pour changer de voie vers la gauche.</li>
                        <li className="text-sm leading-relaxed opacity-90">Touchez ou cliquez sur la moitié DROITE de l&apos;écran pour changer de voie vers la droite.</li>
                        <li className="text-sm leading-relaxed opacity-90">Sur ordinateur, les flèches gauche/droite (ou A/D) fonctionnent aussi.</li>
                        <li className="text-sm leading-relaxed opacity-90">Évitez les véhicules en circulation : toute collision met fin à la manche.</li>
                        <li className="text-sm leading-relaxed opacity-90">Ramassez les pièces pour augmenter votre score et faire progresser votre objectif.</li>
                    </ul>

                    <h3 className="text-base my-4 text-[#00d4ff] font-bold">Règles de gains</h3>

                    <ul className="pl-5 mb-1.5">
                        <li className="text-sm leading-relaxed opacity-90">Avant chaque manche, placez une mise entre 100 et 500 XOF.</li>
                        <li className="text-sm leading-relaxed opacity-90">Un objectif aléatoire vous est ensuite donné (nombre de pièces, temps de jeu, score, ou une combinaison score/temps ou pièces/temps).</li>
                        <li className="text-sm leading-relaxed opacity-90">Si vous atteignez l&apos;objectif, la manche s&apos;arrête automatiquement et votre mise est doublée.</li>
                        <li className="text-sm leading-relaxed opacity-90">Si vous vous écrasez, ou si le temps imparti s&apos;épuise sans que l&apos;objectif soit rempli, vous perdez votre mise.</li>
                    </ul>

                    <button type="button" id="rulesClose" className="w-full border-none px-9 py-[15px] rounded-[10px] bg-[#00d4ff] text-[#001018] text-xl font-bold cursor-pointer mt-5">
                        FERMER
                    </button>
                </div>
            </div>

            <div
                id="objectiveModal"
                className="fixed inset-0 hidden items-center justify-center bg-black/75 text-white z-[200]"
            >
                <div className="bet-box bg-[#0b1620] border border-white/10 rounded-2xl p-8 w-80 max-w-[90vw] text-center shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                    <h2 className="text-2xl mb-1.5">Objectif</h2>

                    <p className="text-base opacity-80 mb-5" id="objectiveText">
                        -
                    </p>

                    <p className="text-base opacity-80 mb-5">
                        Mise :{" "}
                        <span id="objectiveBetAmount" className="text-[#00d4ff] font-bold">0</span>{" "}
                        XOF —{" "}
                        Gain si réussi :{" "}
                        <span id="objectiveWinAmount" className="text-[#3fe27a] font-bold">0</span>{" "}
                        XOF
                    </p>

                    <button type="button" id="objectiveStart" className="w-full border-none px-9 py-[15px] rounded-[10px] bg-[#00d4ff] text-[#001018] text-xl font-bold cursor-pointer">
                        C&apos;EST PARTI
                    </button>
                </div>
            </div>

            <div
                id="resultScreen"
                className="fixed inset-0 hidden items-center justify-center flex-col bg-black/65 text-white z-50 text-center"
            >
                <h1 id="resultTitle" className="text-6xl mb-4">GAME OVER</h1>

                <p id="resultMessage" className="text-2xl mb-6">Score : 0</p>

                <button onClick={() => window.restartGame()} className="border-none px-9 py-[15px] rounded-[10px] bg-[#00d4ff] text-[#001018] text-xl font-bold cursor-pointer">
                    REJOUER
                </button>
            </div>
        </>
    );
}