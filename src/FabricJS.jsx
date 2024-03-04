import { Fragment, createElement, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import "./ui/FabricJS.scss";

import { Button, ToggleButton, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faClone, faSquare, faTrashAlt } from "@fortawesome/fontawesome-free-regular";
import {
    faArrowRight,
    faArrowsLeftRight,
    faChevronDown,
    faDiamond,
    faFont,
    faLock,
    faLockOpen,
    faSlash,
    faObjectGroup,
    faObjectUngroup,
    faPaintBrush,
    faPlay,
    faRightFromBracket,
    faRightToBracket,
    faRotateBackward,
    faRotateForward,
    faShapes
} from "@fortawesome/free-solid-svg-icons";

/*
    See the documentation here: https://www.npmjs.com/package/fabricjs-react
    and here: http://fabricjs.com/docs/

*/

function lockObject(selectedObject, isSelectable) {
    selectedObject.lockMovementX = true;
    selectedObject.lockMovementY = true;
    selectedObject.lockRotation = true;
    selectedObject.lockScalingFlip = true;
    selectedObject.lockScalingX = true;
    selectedObject.lockScalingY = true;
    selectedObject.lockSkewingX = true;
    selectedObject.lockSkewingY = true;
    selectedObject.lockUniScaling = true;
    selectedObject.selectable = isSelectable;
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

function parseAndSet(fabricCbject, valsToSet) {
    const { mxMapId, subObjects, ...rest } = valsToSet;
    if (subObjects) {
        fabricCbject.set(rest);
        subObjects.forEach(subValsToSet => {
            const { subType, ...restOfSub } = subValsToSet;
            const fabricCbjectSubType = fabricCbject
                .getObjects()
                .find(fabricSubObject => fabricSubObject.subType === subType);
            fabricCbjectSubType.set(restOfSub);
        });
    }
}

function processObject(innerObj, duplicatedDataObjectJSON) {
    if (innerObj !== null && typeof innerObj === "object") {
        if (innerObj.isDataObject) {
            const newMxMapId = uniqueId();
            const oldMxMapId = innerObj.mxMapId;

            innerObj.set("mxMapId", newMxMapId);
            duplicatedDataObjectJSON.push({
                mxMapId: newMxMapId,
                mxMapIdDup: oldMxMapId
            });
        } else if (innerObj.type === "group") {
            innerObj._objects.forEach(subObj => processObject(subObj, duplicatedDataObjectJSON));
        }
    }
}

function getAllDataObjects(object, dataObjectJSON) {
    if (object !== null && typeof object === "object") {
        if (object.isDataObject) {
            dataObjectJSON.push(object.mxMapId);
        } else if (object.type === "group") {
            object._objects.forEach(subObj => getAllDataObjects(subObj, dataObjectJSON));
        }
    }
}

const getCanvasObjectByID = (arrayOfObjects, mxID) => {
    function getNestedObject(currentObj, foundObject, mxID) {
        if (currentObj !== null && typeof currentObj === "object" && !foundObject.length) {
            if (currentObj.mxMapId === mxID) {
                foundObject.push(currentObj);
            } else if (currentObj.type === "group") {
                currentObj._objects.forEach(subObj => getNestedObject(subObj, foundObject, mxID));
            }
        }
    }

    for (let x of arrayOfObjects) {
        let myObject = [];
        getNestedObject(x, myObject, mxID);
        if (myObject.length) {
            return myObject[0];
        }
        x += 1;
    }
};

export function FabricJS({
    attrJson,
    imageToAdd,
    onSelectionChange,
    isDataObject,
    selectedJson,
    onAddDataObject,
    duplicatedJson,
    onDuplicationDataObject,
    shapeList,
    shapeJson,
    pointerYAxis,
    pointerXAxis,
    isReadOnly,
    mxMapIdToAdd
}) {
    const { editor, onReady, selectedObjects } = useFabricJSEditor();
    const hasInitialized = useRef(false);
    const history = [];
    const [color, setColor] = useState("#35363a");
    const imageSrc = useRef("");
    const imageIsDataObject = useRef(false);
    const [isLocked, setIsLocked] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingWidth, setDrawingWidth] = useState(1);

    const onDelete = () => {
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
                fill: "red",
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
        selectedObjects
            .filter(obj => !obj.isDataObject)
            .forEach(selectedObject => {
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

    const onAdjustDrawSizeSmall = () => {
        if (editor) {
            editor.canvas.freeDrawingBrush.width = 1;
            setDrawingWidth(1);
        }
    };
    const onAdjustDrawSizeMedium = () => {
        if (editor) {
            editor.canvas.freeDrawingBrush.width = 5;
            setDrawingWidth(5);
        }
    };
    const onAdjustDrawSizeLarge = () => {
        if (editor) {
            editor.canvas.freeDrawingBrush.width = 10;
            setDrawingWidth(10);
        }
    };

    const moveToFront = () => {
        if (Object.keys(selectedObjects).length !== 0) {
            selectedObjects.forEach(selectedObject => {
                selectedObject.bringToFront();
            });
            editor.canvas.discardActiveObject().renderAll();
        }
    };

    const moveToBack = () => {
        if (Object.keys(selectedObjects).length !== 0) {
            selectedObjects.forEach(selectedObject => {
                selectedObject.sendToBack();
            });
            editor.canvas.discardActiveObject().renderAll();
            //discard all and reset the ones we want
        }
    };

    const onToggleDraw = () => {
        //toggle
        editor.canvas.isDrawingMode = !editor.canvas.isDrawingMode;
        setIsDrawing(!isDrawing);
    };

    const onUndo = () => {
        if (editor.canvas._objects.length > 0) {
            history.push(editor.canvas._objects.pop());
        }
        editor.canvas.renderAll();
    };

    const onRedo = () => {
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

    const onAddText = () => {
        editor.addText("Text");
    };

    const exportSVG = () => {
        const svg = editor.canvas.toSVG();
        console.info(svg);
    };

    const onExportJSON = () => {
        attrJson.setValue(JSON.stringify(editor.canvas.toJSON(["isDataObject", "mxMapId", "subType"]).objects));
    };

    const ImportJSON = () => {
        editor.canvas.loadFromJSON({
            version: "5.3.0",
            objects: JSON.parse(attrJson.value)
        });
    };

    //onSave from widget
    // const onSave = () => {
    //     onExportJSON();
    //     onSaveAction.execute();
    // };

    const lockBackgroundShapes = () => {
        editor.canvas.discardActiveObject();
        editor.canvas
            .getObjects()
            .filter(canvasObject => !canvasObject.isDataObject)
            .forEach(obj => lockObject(obj, false));
        editor.canvas.renderAll();
        setIsLocked(!isLocked);
    };

    const lockAllObjects = () => {
        editor.canvas.discardActiveObject();
        editor.canvas.getObjects().forEach(obj => lockObject(obj, true));
        editor.canvas.renderAll();
        setIsLocked(!isLocked);
    };

    const unlockBackgroundShapes = () => {
        editor.canvas.discardActiveObject();
        editor.canvas
            .getObjects()
            .filter(canvasObject => !canvasObject.isDataObject)
            .forEach(unlockObject);
        editor.canvas.renderAll();
        setIsLocked(!isLocked);
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
        if (selectedObjects && onDuplicationDataObject.canExecute) {
            const duplicatedDataObjectJSON = [];
            //Duplicate Active Objects
            const activeObject = editor.canvas.getActiveObject();
            selectedObjects.forEach(object => {
                let duplicatedObject;
                object.clone(
                    duplicate => {
                        editor.canvas.add(
                            duplicate.set({
                                left: activeObject.left - 10,
                                top: activeObject.top - 10
                            })
                        );
                        duplicatedObject = duplicate;
                    },
                    ["isDataObject", "mxMapId", "subType"]
                );
                processObject(duplicatedObject, duplicatedDataObjectJSON);
            });
            if (duplicatedDataObjectJSON.length) {
                duplicatedJson.setValue(JSON.stringify(duplicatedDataObjectJSON));
                onDuplicationDataObject.execute();
            }
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
        editor.setFillColor(color);
    }, [color]);

    useEffect(() => {
        imageSrc.current = imageToAdd.value?.uri;
        imageIsDataObject.current = isDataObject.value;
        if (editor) {
            if (imageToAdd.value && imageToAdd.value.uri && imageToAdd.value.uri !== "") {
                editor.canvas.discardActiveObject().renderAll();
                editor.canvas.selection = false;
            } else {
                editor.canvas.selection = true;
            }
        }
    }, [imageToAdd.value?.uri]);

    useEffect(() => {
        if (
            !hasInitialized.current &&
            editor &&
            editor.canvas &&
            attrJson.status === "available" &&
            isReadOnly.status === "available" &&
            mxMapIdToAdd.status === "available"
        ) {
            ImportJSON();
            if (isReadOnly.value) {
                lockAllObjects();
                editor.canvas.selection = false;
            } else {
                editor.canvas.on("mouse:down", e => {
                    const pointer = editor.canvas.getPointer(e.e);
                    const target = editor.canvas.findTarget(e);
                    if ((target && !target.lockMovementX) || !imageSrc.current || imageSrc.current === "") {
                        return;
                    }
                    if (imageIsDataObject.current) {
                        const IdToAdd = uniqueId();
                        if (IdToAdd) {
                            pointerXAxis.setValue(pointer.x.toString());
                            pointerYAxis.setValue(pointer.y.toString());
                            mxMapIdToAdd.setValue(IdToAdd);
                            onAddDataObject.execute();
                        }
                    } else {
                        fabric.Image.fromURL(imageSrc.current, oImg => {
                            oImg.set("left", pointer.x - oImg.width / 2);
                            oImg.set("top", pointer.y - oImg.height / 2);
                            oImg.set("isDataObject", false);
                            editor.canvas.add(oImg);
                        });
                    }
                });
                window.myCanvasEditor = editor;
            }
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


    //deselect objects when selectedJson is emptied
    useEffect(() => {
        if (editor && selectedJson && selectedJson.status === "available" && selectedJson.value == "") {
            editor.canvas.discardActiveObject().renderAll();
        } 
    }, [selectedJson.value]);

    useEffect(() => {
        if (editor && shapeList && shapeList.status === "available" && !isReadOnly.value) {
            shapeList?.items?.forEach(object => {
                const objJson = shapeJson.get(object)?.displayValue;
                if (!objJson) {
                    return;
                }
                const shapeData = JSON.parse(objJson);
                if (shapeData.mxMapId) {
                    const allCanvasObjects = editor.canvas.getObjects();
                    const existingCanvasObject = getCanvasObjectByID(allCanvasObjects, shapeData.mxMapId);
                    if (existingCanvasObject) {
                        parseAndSet(existingCanvasObject, shapeData);
                    } else if (shapeData.mxMapId == mxMapIdToAdd.value && shapeData.type === "group") {
                        let childObj = [];
                        fabric.util.enlivenObjects(shapeData.objects, function (enlivenedObjects) {
                            enlivenedObjects.forEach(function (obj, index) {
                                childObj.push(obj);
                            });
                            editor.canvas.add(
                                new fabric.Group(childObj, {
                                    isDataObject: true,
                                    mxMapId: shapeData.mxMapId,
                                    left: shapeData.left,
                                    top: shapeData.top,
                                    lockScalingX: shapeData.lockScalingX,
                                    lockScalingY: shapeData.lockScalingY
                                })
                            );
                        });
                        mxMapIdToAdd.setValue("")
                    }
                    editor.canvas.renderAll();
                }
            });
        }
    }, [shapeList]);

    
    return (
        <Fragment>
            {isReadOnly.value ? null : (
                <div className="fabric-widget-button-container">
                    <div className="fabric-widget-button-wrapper">
                        <Button variant="default" onClick={onDuplicate} title="Duplicate">
                            <FontAwesomeIcon icon={faClone} />
                        </Button>
                        <Button variant="default" onClick={onDelete} title="Delete">
                            <FontAwesomeIcon icon={faTrashAlt} />
                        </Button>
                        <Button variant="default" onClick={onUndo} title="Undo">
                            <FontAwesomeIcon icon={faRotateBackward} />
                        </Button>
                        <Button variant="default" onClick={onRedo} title="Redo">
                            <FontAwesomeIcon icon={faRotateForward} />
                        </Button>
                    </div>
                    <div className="fabric-widget-button-wrapper">
                        <Button variant="default" onClick={onGroup} title="Group">
                            <FontAwesomeIcon icon={faObjectGroup} />
                        </Button>
                        <Button variant="default" onClick={onUngroup} title="Ungroup">
                            <FontAwesomeIcon icon={faObjectUngroup} />
                        </Button>
                        <Button variant="default" onClick={moveToBack} title="Move to back">
                            <FontAwesomeIcon icon={faRightToBracket} />
                        </Button>
                        <Button variant="default" onClick={moveToFront} title="Move to front">
                            <FontAwesomeIcon icon={faRightFromBracket} />
                        </Button>
                        <ToggleButton
                            id="lock-toggle-check"
                            type="checkbox"
                            variant="default"
                            checked={isLocked}
                            value="1"
                            onChange={!isLocked ? lockBackgroundShapes : unlockBackgroundShapes}
                            title={!isLocked ? "Lock background shapes" : "Unlock background shapes"}
                        >
                            <FontAwesomeIcon icon={!isLocked ? faLock : faLockOpen} />
                        </ToggleButton>
                    </div>
                    <div className="fabric-widget-button-wrapper">
                        <ToggleButton
                            id="draw-toggle-check"
                            type="checkbox"
                            variant={!isDrawing ? "default" : "primary"}
                            checked={isDrawing}
                            onChange={onToggleDraw}
                            title={"Toggle Drawing"}
                        >
                            <FontAwesomeIcon icon={faPaintBrush} />
                        </ToggleButton>
                        <Dropdown id="dropdown-size-button" title="Draw Size">
                            <Dropdown.Toggle id="dropdown-autoclose-true" variant="default">
                                Size
                                <FontAwesomeIcon icon={faChevronDown} style={{ marginLeft: "10px" }} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item>
                                    <Button className={drawingWidth === 1 ? 'active' : ''} variant="default" onClick={onAdjustDrawSizeSmall} title="Small">
                                        Small
                                    </Button>
                                </Dropdown.Item>
                                <Dropdown.Item>
                                    <Button className={drawingWidth === 5 ? 'active' : ''} variant="default" onClick={onAdjustDrawSizeMedium} title="Medium">
                                        Medium
                                    </Button>
                                </Dropdown.Item>
                                <Dropdown.Item>
                                    <Button className={drawingWidth === 10 ? 'active' : ''} variant="default" onClick={onAdjustDrawSizeLarge} title="Large">
                                        Large
                                    </Button>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <Button variant="default" onClick={onAddText} title="Add Text">
                        <FontAwesomeIcon icon={faFont} />
                    </Button>
                    <Dropdown id="dropdown-shape-button" title="Add Shape">
                        <Dropdown.Toggle id="dropdown-autoclose-true" variant="default">
                            <FontAwesomeIcon icon={faShapes} />
                            <FontAwesomeIcon icon={faChevronDown} style={{ marginLeft: "10px" }} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item>
                                <Button className="dropdown-item-shape" variant="default" onClick={onAddSquare} title="Add Square">
                                    <FontAwesomeIcon icon={faSquare} />
                                    Square
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button className="dropdown-item-shape" variant="default" onClick={onAddCircle} title="Add Circle">
                                    <FontAwesomeIcon icon={faCircle} />
                                    Circle
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button className="dropdown-item-shape" variant="default" onClick={onAddTriangle} title="Add Triangle">
                                    <FontAwesomeIcon icon={faPlay} />
                                    Triangle
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button className="dropdown-item-shape" variant="default" onClick={onAddDiamond} title="Add Diamond">
                                    <FontAwesomeIcon icon={faDiamond} />
                                    Diamond
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button className="dropdown-item-shape" variant="default" onClick={onAddArrow} title="Add Arrow">
                                    <FontAwesomeIcon icon={faArrowRight} />
                                    Right Arrow
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button className="dropdown-item-shape" variant="default" onClick={onAddDoubleArrow} title="Add Double Arrow">
                                    <FontAwesomeIcon icon={faArrowsLeftRight} />
                                    Double Arrow
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button className="dropdown-item-shape" variant="default" onClick={onAddLine} title="Add Line">
                                    <FontAwesomeIcon icon={faSlash} />
                                    Line
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button className="dropdown-item-shape" variant="default" onClick={onAddEllipse} title="Add Ellipse">
                                    Ellipse
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button variant="default" onClick={onAddRectangle} title="Add Rectangle">
                                    Rectangle
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button variant="default" onClick={onAddRightTriangle} title="Add Right Triangle">
                                    Right Triangle
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button variant="default" onClick={onAddArc} title="Add Arc">
                                    Arc
                                </Button>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <label className="color-picker-button btn btn-default">
                        <div className="color-picker-container">
                            <input type="color" value={color} onChange={e => setColor(e.target.value)} />
                        </div>
                        Color
                        <FontAwesomeIcon icon={faChevronDown} style={{ marginLeft: "10px" }} />
                    </label>
                </div>
            )}

            <div className="fabric-widget-canvas-container">
                <FabricJSCanvas className="fabric-widget-canvas-component" onReady={onReady} />
            </div>
        </Fragment>
    );
}
