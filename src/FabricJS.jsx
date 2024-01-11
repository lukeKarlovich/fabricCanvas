import { createElement, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import "./ui/FabricJS.css";

/*
    See the documentation here: https://www.npmjs.com/package/fabricjs-react
    and here: http://fabricjs.com/docs/

*/

function lockObject(selectedObject) {
    selectedObject.lockMovementX = true;
    selectedObject.lockMovementY = true;
    selectedObject.lockRotation = true;
    selectedObject.lockScalingFlip = true;
    selectedObject.lockScalingX = true;
    selectedObject.lockScalingY = true;
    selectedObject.lockSkewingX = true;
    selectedObject.lockSkewingY = true;
    selectedObject.lockUniScaling = true;
    selectedObject.selectable = false;
}

function unlockObject(selectedObject) {
    Object.keys(selectedObject)
        .filter(key => key.startsWith("lock"))
        .forEach(key => {
            delete selectedObject[key];
        });
    selectedObject.selectable = true;
}

const uniqueId = () => {
    const dateString = Date.now().toString(36);
    const randomness = Math.random().toString(36).substring(2);
    return dateString + randomness;
};

export function FabricJS({
    attrJson,
    onSaveAction,
    imageToAdd,
    onSelectionChange,
    isDataObject,
    selectedJson,
    onAddDataObject,
    pointerXAxis,
    pointerYAxis,
    clonedJson,
    onCloneDataObject
}) {
    const { editor, onReady, selectedObjects } = useFabricJSEditor();

    const hasInitialized = useRef(false);
    /*
    const selectionChangeRef = useRef();
    */
    const history = [];
    const [color, setColor] = useState("#35363a");

    const imageSrc = useRef("");
    const imageIsDataObject = useRef(false);

    const removeSelectedObject = () => {
        if (editor.canvas.getActiveObjects()) {
            editor.canvas.getActiveObjects().forEach(obj => {
                editor.canvas.remove(obj);
            });
            editor.canvas.discardActiveObject().renderAll();
        }
    };

    const onAddCircle = () => {
        editor.canvas.add(
            new fabric.Circle({
                radius: 20,
                fill: "green",
                left: 100,
                top: 100
            })
        );
    };

    const onAddEllipse = () => {
        editor.canvas.add(
            new fabric.Ellipse({
                ry: 10,
                rx: 20,
                fill: "green",
                left: 100,
                top: 100
            })
        );
    };

    const onAddRectangle = () => {
        editor.canvas.add(
            new fabric.Rect({
                width: 20,
                height: 10,
                fill: "green",
                left: 100,
                top: 100
            })
        );
    };

    const onAddSquare = () => {
        editor.canvas.add(
            new fabric.Rect({
                width: 20,
                height: 20,
                fill: "green",
                left: 100,
                top: 100
            })
        );
    };

    const onAddTriangle = () => {
        editor.canvas.add(
            new fabric.Triangle({
                width: 20,
                height: 20,
                fill: "green",
                left: 100,
                top: 100
            })
        );
    };

    const onAddDiamond = () => {
        var points = [
            { x: 25, y: 25 },
            { x: 35, y: 50 },
            { x: 25, y: 75 },
            { x: 15, y: 50 }
        ];

        var diamond = new fabric.Polygon(points, {
            fill: "green"
        });

        editor.canvas.add(diamond);
    };

    const onAddRightTriangle = () => {
        var points = [
            { x: 25, y: 25 },
            { x: 25, y: 100 },
            { x: 100, y: 100 }
        ];

        var triangle = new fabric.Polygon(points, {
            fill: "green"
        });

        editor.canvas.add(triangle);
    };

    const onAddArc = () => {
        editor.canvas.add(
            new fabric.Path("M 100 100 a 50 50 0 0 1 50 -50", {
                fill: "", // No fill for the arc
                stroke: "green",
                strokeWidth: 3
            })
        );
    };

    const onAddArrow = () => {
        var points = [
            { x: 100, y: 50 },
            { x: 50, y: 100 },
            { x: 100, y: 150 },
            { x: 100, y: 125 },
            { x: 150, y: 125 },
            { x: 150, y: 75 },
            { x: 100, y: 75 }
        ];

        var arrow = new fabric.Polygon(points, {
            fill: "green"
        });

        editor.canvas.add(arrow);
    };

    const onAddDoubleArrow = () => {
        var points = [
            { x: 50, y: 100 },
            { x: 100, y: 75 },
            { x: 100, y: 90 },
            { x: 150, y: 90 },
            { x: 150, y: 75 },
            { x: 200, y: 100 },
            { x: 150, y: 125 },
            { x: 150, y: 110 },
            { x: 100, y: 110 },
            { x: 100, y: 125 }
        ];

        var doubleArrow = new fabric.Polygon(points, {
            fill: "green"
        });

        editor.canvas.add(doubleArrow);
    };

    const onToggleVisibility = () => {
        selectedObjects.forEach(selectedObject => {
            selectedObject.set("visible", !selectedObject.visible);
        });
        editor.canvas.discardActiveObject();
        editor.canvas.renderAll();
    };

    const onToggleColor = () => {
        //detect group and change sub objects
        selectedObjects.forEach(selectedObject => {
            selectedObject.set("fill", selectedObject.fill === "green" ? "red" : "green");
        });
        editor.canvas.renderAll();
    };

    const onSetAllVisible = () => {
        editor.canvas.getObjects().forEach(obj => {
            obj.set("visible", true);
        });
        editor.canvas.renderAll();
    };

    const toggleSize = () => {
        editor.canvas.freeDrawingBrush.width === 12
            ? (editor.canvas.freeDrawingBrush.width = 5)
            : (editor.canvas.freeDrawingBrush.width = 12);
    };

    const bringToFront = () => {
        if (Object.keys(selectedObjects).length !== 0) {
            selectedObjects.forEach(selectedObject => {
                selectedObject.bringToFront();
            });
            editor.canvas.discardActiveObject().renderAll();
        }
    };

    const sendToBack = () => {
        if (Object.keys(selectedObjects).length !== 0) {
            selectedObjects.forEach(selectedObject => {
                selectedObject.sendToBack();
            });
            editor.canvas.discardActiveObject().renderAll();
            //discard all and reset the ones we want
        }
    };

    const toggleDraw = () => {
        //toggle
        editor.canvas.isDrawingMode = !editor.canvas.isDrawingMode;
    };

    const undo = () => {
        if (editor.canvas._objects.length > 0) {
            history.push(editor.canvas._objects.pop());
        }
        editor.canvas.renderAll();
    };

    const redo = () => {
        if (history.length > 0) {
            editor.canvas.add(history.pop());
        }
    };

    const onAddLine = () => {
        editor.canvas.add(
            new fabric.Line([50, 100, 200, 200], {
                left: 100,
                top: 100,
                stroke: "red"
            })
        );
    };

    const addText = () => {
        editor.addText("inset text");
    };

    const exportSVG = () => {
        const svg = editor.canvas.toSVG();
        console.info(svg);
    };

    const onExportJSON = () => {
        attrJson.setValue(JSON.stringify(editor.canvas.toJSON(["isDataObject", "mxMapId"]).objects));
    };

    const ImportJSON = () => {
        editor.canvas.loadFromJSON({
            version: "5.3.0",
            objects: JSON.parse(attrJson.value)
        });
    };

    const onSave = () => {
        onExportJSON();
        onSaveAction.execute();
    };

    const lockBackgroundShapes = () => {
        editor.canvas.discardActiveObject();
        editor.canvas
            .getObjects()
            .filter(canvasObject => !canvasObject.isDataObject)
            .forEach(lockObject);
        editor.canvas.renderAll();
    };

    const unlockBackgroundShapes = () => {
        editor.canvas.discardActiveObject();
        editor.canvas
            .getObjects()
            .filter(canvasObject => !canvasObject.isDataObject) //need to add isDataObject property to objects
            .forEach(unlockObject);
        editor.canvas.renderAll();
    };

    const onGroup = () => {
        if (editor.canvas.getActiveObject() && editor.canvas.getActiveObject().type === "activeSelection") {
            editor.canvas.getActiveObject().toGroup();
            editor.canvas.discardActiveObject();
        }
    };

    const onUngroup = () => {
        if (
            editor.canvas.getActiveObject() &&
            editor.canvas.getActiveObject().type === "group" &&
            !editor.canvas.getActiveObject().isDataObject
        ) {
            editor.canvas.getActiveObject().toActiveSelection();
            editor.canvas.requestRenderAll();
            editor.canvas.discardActiveObject();
        }
    };

    const onDuplicate = () => {
        if (selectedObjects && onCloneDataObject.canExecute) {
            let clonedDataObjectJSON = [];

            function processObject(innerObj) {
                if (innerObj !== null && typeof innerObj === "object") {
                    if (innerObj.isDataObject) {
                        const newMxMapId = uniqueId();
                        const oldMxMapId = innerObj.mxMapId;

                        innerObj.set("mxMapId", newMxMapId);
                        clonedDataObjectJSON.push({
                            mxMapId: newMxMapId,
                            mxMapIdDup: oldMxMapId
                        });
                    } else if (innerObj.type === "group") {
                        innerObj._objects.forEach(subObj => processObject(subObj));
                    }
                }
            }

            //Clone Active Objects
            selectedObjects.forEach(function (object) {
                let clonedObject;
                object.clone(
                    function (clone) {
                        editor.canvas.add(
                            clone.set({
                                left: 100,
                                top: 100
                            })
                        );
                        clonedObject = clone;
                    },
                    ['isDataObject', 'mxMapId']
                );
                processObject(clonedObject);
            });
            clonedJson.setValue(JSON.stringify(clonedDataObjectJSON));
            onCloneDataObject.execute();
        }
    };

    const onClearcanvas = () => {
        editor.canvas.clear();
    };

    // const addBackground = () => {
    //     if (!editor || !fabric) {
    //         return;
    //     }

    //     fabric.Image.fromURL(
    //         "https://thegraphicsfairy.com/wp-content/uploads/2019/02/Anatomical-Heart-Illustration-Black-GraphicsFairy.jpg",
    //         image => {
    //             editor.canvas.setBackgroundImage(image, editor.canvas.renderAll.bind(editor.canvas));
    //         }
    //     );
    // };

    useEffect(() => {
        if (!editor || !fabric) {
            return;
        }
        editor.canvas.freeDrawingBrush.color = color;
        editor.setStrokeColor(color);
    }, [color]);

    useEffect(() => {
        imageSrc.current = imageToAdd.value?.uri;
        imageIsDataObject.current = isDataObject.value;
        if (imageToAdd.value && imageToAdd.value.uri && imageToAdd.value.uri !== "" && editor) {
            editor.canvas.discardActiveObject().renderAll();
        }
    }, [imageToAdd.value?.uri]);

    useEffect(() => {
        if (!hasInitialized.current && editor && editor.canvas && attrJson.status === "available") {
            editor.canvas.on("mouse:down", function (e) {
                const pointer = editor.canvas.getPointer(e.e);
                const target = editor.canvas.findTarget(e);
                if ((target && !target.lockMovementX) || !imageSrc.current || imageSrc.current === "") {
                    return;
                }
                if (imageIsDataObject.current) {
                    pointerXAxis.setValue(pointer.x.toString());
                    pointerYAxis.setValue(pointer.y.toString());
                    onAddDataObject.execute();
                } else {
                    fabric.Image.fromURL(imageSrc.current, function (oImg) {
                        oImg.set("left", pointer.x - oImg.width / 2);
                        oImg.set("top", pointer.y - oImg.height / 2);
                        oImg.set("isDataObject", false);
                        editor.canvas.add(oImg);
                    });
                }
            });
            ImportJSON();
            window.myCanvasEditor = editor;
            window.myCanvasSelectedObjects = selectedObjects;
            hasInitialized.current = true;
        }
    }, [editor]);

    useEffect(() => {
        if (onSelectionChange.canExecute && selectedObjects.length > 0) {
            selectedJson.setValue(
                selectedObjects
                    .filter(obj => obj.isDataObject)
                    .map(obj => obj.mxMapId)
                    .join(",")
            );
            onSelectionChange.execute();
        } else {
            selectedJson.setValue("");
        }
    }, [selectedObjects]);

    return (
        <div>
            {/* <button onClick={addBackground}>Add Background</button> */}
            <button onClick={onAddCircle}>Add Circle</button>
            <button onClick={onAddEllipse}>Add Ellipse</button>
            <button onClick={onAddRectangle}>Add Rectangle</button>
            <button onClick={onAddSquare}>Add Square</button>
            <button onClick={onAddTriangle}>Add Triangle</button>
            <button onClick={onAddRightTriangle}>Add Right Triangle</button>
            <button onClick={onAddDiamond}>Add Diamond</button>
            <button onClick={onAddArc}>Add Arc</button>
            <button onClick={onAddArrow}>Add Arrow</button>
            <button onClick={onAddDoubleArrow}>Add Double Arrow</button>
            <button onClick={onAddLine}>Add Line</button>
            <button onClick={addText}>Add Text</button>
            <button onClick={onToggleVisibility}>Toggle Visible</button>
            <button onClick={onSetAllVisible}>Set All Visible</button>
            <button onClick={onToggleColor}>Toggle Color</button>
            <button onClick={toggleDraw}>Toggle Draw</button>
            <button onClick={toggleSize}>Toggle Draw Size</button>
            <button onClick={undo}>Undo</button>
            <button onClick={redo}>Redo</button>
            <button onClick={bringToFront}>To Front</button>
            <button onClick={sendToBack}>To Back</button>
            <button onClick={lockBackgroundShapes}>Lock Background Shapes</button>
            <button onClick={unlockBackgroundShapes}>Unlock Background Shapes</button>
            <button onClick={onGroup}>Group</button>
            <button onClick={onUngroup}>Ungroup</button>
            <button onClick={onDuplicate}>Duplicate</button>
            <label>
                <input type="color" value={color} onChange={e => setColor(e.target.value)} />
            </label>
            <button onClick={removeSelectedObject}>Delete</button>
            <button onClick={onExportJSON}>Export JSON</button>
            <button onClick={ImportJSON}>Import JSON</button>
            {/* <button onClick={exportSVG}>Export SVG</button> */}
            <button onClick={onSave}>Save Canvas</button>
            <button onClick={onClearcanvas}>Clear Canvas</button>
            <div className="fabric-canvas-container">
                <FabricJSCanvas className="fabric-canvas" onReady={onReady} />
            </div>
        </div>
    );
}
