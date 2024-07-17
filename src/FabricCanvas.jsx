import { Fragment, createElement, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import "fabric-history";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import "./ui/FabricCanvas.scss";

import { Button, ToggleButton, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone, faTrashAlt } from "@fortawesome/fontawesome-free-regular";
import {
    faArrowLeft,
    faArrowsLeftRight,
    faChevronDown,
    faDiamond,
    faFont,
    faLock,
    faLockOpen,
    faObjectGroup,
    faObjectUngroup,
    faPaintBrush,
    faPlay,
    faRightFromBracket,
    faRightToBracket,
    faRotateBackward,
    faRotateForward,
    faShapes,
    faSlash
} from "@fortawesome/free-solid-svg-icons";

/*
    See the documentation here: https://www.npmjs.com/package/fabricjs-react
    and here: http://fabricjs.com/docs/

*/

const uniqueId = () => {
    const dateString = Date.now().toString(36);
    const randomness = Math.random().toString(36).substring(2);
    return dateString + randomness;
};

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

// eslint-disable-next-line
const getCanvasObjectByID = (arrayOfObjects, mxid) => {
    // eslint-disable-next-line
    function getNestedObject(currentObj, foundObject, mxid) {
        if (currentObj !== null && typeof currentObj === "object" && !foundObject.length) {
            if (currentObj.mxid === mxid) {
                foundObject.push(currentObj);
            } else if (currentObj.type === "group") {
                currentObj._objects.forEach(subObj => getNestedObject(subObj, foundObject, mxid));
            }
        }
    }

    for (let x of arrayOfObjects) {
        const myObject = [];
        getNestedObject(x, myObject, mxid);
        if (myObject.length) {
            return myObject[0];
        }
        x += 1;
    }
};

function parseAndSet(canvasObject, valsToSet) {
    const { mxid, ...rest } = valsToSet;
    // if (subObjects) {
    canvasObject.set(rest);
    canvasObject.setCoords();
    //     subObjects.forEach(subValsToSet => {
    //         const { subType, ...restOfSub } = subValsToSet;
    //         const canvasObjectSubType = canvasObject
    //             .getObjects()
    //             .find(fabricSubObject => fabricSubObject.subType === subType);
    //         canvasObjectSubType.set(restOfSub);
    //     });
    // }
}

export function FabricCanvas({
    contentJSON,
    showToolBar,
    onAddImage,
    hasAddImageButton,
    imageToAdd,
    isImageClickToCanvas,
    hasSaveButton,
    onSave,
    defaultColor,
    hasClearCanvasButton,
    hasDownloadButton,
    hasKeyBoardControls,
    selectedJSON,
    onSelectionChange,
    isAdvanced,
    canvasObjectList,
    canvasObjectJson,
    onCanvasChange
}) {
    const { editor, onReady, selectedObjects } = useFabricJSEditor();
    const imageSrc = useRef("");
    const hasInitialized = useRef(false);
    const [color, setColor] = useState(defaultColor.value);
    const [isLocked, setIsLocked] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingWidth, setDrawingWidth] = useState(1);
    const [widgetId, setWidgetId] = useState("");

    const onDelete = () => {
        if (editor.canvas.getActiveObjects()) {
            if (isAdvanced) {

            } else {
                editor.canvas.getActiveObjects().forEach(obj => {
                    editor.canvas.remove(obj);
                });
            }
            editor.canvas.discardActiveObject().renderAll();
        }
    };

    const onAddText = () => {
        editor.canvas.add(
            new fabric.Textbox("Text", {
                left: 100,
                top: 100,
                fontSize: 16,
                fontFamily: "Arial",
                fill: color
            })
        );
    };

    const onAddCircle = () => {
        editor.canvas.add(
            new fabric.Circle({
                mxid: uniqueId(),
                radius: 20,
                fill: color,
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
                fill: color,
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
                fill: color,
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
                fill: color,
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
                fill: color,
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
            fill: color,
            left: 100,
            top: 100
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
            fill: color,
            left: 100,
            top: 100
        });

        editor.canvas.add(triangle);
    };

    const onAddArc = () => {
        editor.canvas.add(
            new fabric.Path("M 100 100 a 50 50 0 0 1 50 -50", {
                fill: "", // No fill for the arc
                stroke: color,
                strokeWidth: 3,
                left: 100,
                top: 100
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
            fill: color,
            left: 100,
            top: 100
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
            fill: color,
            left: 100,
            top: 100
        });

        editor.canvas.add(doubleArrow);
    };

    const onAddLine = () => {
        editor.canvas.add(
            new fabric.Line([50, 100, 200, 200], {
                left: 100,
                top: 100,
                stroke: color
            })
        );
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
        editor.canvas.undo();
        editor.canvas.renderAll();
    };

    const onRedo = () => {
        editor.canvas.redo();
    };

    const exportSVG = () => {
        const svg = editor.canvas.toSVG();
        console.info(svg);
    };

    const onDownload = () => {
        // Get the data URL of the canvas
        const dataURL = editor.canvas.toDataURL({
            format: "png", // or 'jpeg', 'webp', etc.
            quality: 1 // Quality level (0 to 1)
        });

        // Create a link element
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "canvas-image.png"; // Specify the filename

        // Trigger a click event on the link to download the image
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportCanvas = () => {
        return JSON.stringify(editor.canvas.toJSON(["mxid"]).objects);
    };

    const onExportAndSave = () => {
        if (contentJSON.status === "available" && onSave.canExecute) {
            !contentJSON.readonly ? contentJSON.setValue(exportCanvas()) : null;
            onSave.execute();
        }
    };

    const lockBackgroundShapes = () => {
        editor.canvas.discardActiveObject();
        editor.canvas.getObjects().forEach(obj => lockObject(obj, false));
        editor.canvas.renderAll();
        setIsLocked(!isLocked);
    };

    const unlockBackgroundShapes = () => {
        editor.canvas.discardActiveObject();
        editor.canvas.getObjects().forEach(unlockObject);
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
        if (editor.canvas.getActiveObject() && editor.canvas.getActiveObject().type === "group") {
            editor.canvas.getActiveObject().toActiveSelection();
            editor.canvas.requestRenderAll();
            editor.canvas.discardActiveObject();
        }
    };

    const onDuplicate = () => {
        if (selectedObjects) {
            const activeObject = editor.canvas.getActiveObject();
            selectedObjects.forEach(object => {
                object.clone(duplicate => {
                    editor.canvas.add(
                        duplicate.set({
                            left: activeObject.left - 10,
                            top: activeObject.top - 10
                        })
                    );
                });
            });
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

    const importJSON = () => {
        editor.canvas.loadFromJSON(
            {
                version: "5.3.0",
                objects: JSON.parse(contentJSON.value)
            },
            // eslint-disable-next-line
            function () {
                prepareCanvas();
            }
        );
    };

    const prepareCanvas = () => {
        function updateSize() {
            const canvasContainer = document
                .getElementsByClassName(widgetId)[0]
                ?.querySelector(".fabric-canvas-component-canvas-container");
            const canvasDimensions = {
                width: canvasContainer.clientWidth,
                height: canvasContainer.clientHeight
            };
            if (editor && editor.canvas && canvasDimensions.height && canvasDimensions.width) {
                editor.canvas.setDimensions(canvasDimensions);
            }
        }

        setTimeout(() => {
            updateSize();
        }, 5);

        const CanvasComponent = document
            .getElementsByClassName(widgetId)[0]
            ?.querySelector(".fabric-canvas-component-canvas-container");

        if (CanvasComponent) {
            const resizeObserver = new ResizeObserver(entries => {
                // We wrap it in requestAnimationFrame to avoid error - ResizeObserver loop limit exceeded
                window.requestAnimationFrame(() => {
                    if (!Array.isArray(entries) || !entries.length) {
                        return;
                    }
                    updateSize();
                });
            });
            resizeObserver.observe(CanvasComponent);

            if (isImageClickToCanvas) {
                //Mouse Click events
                editor.canvas.on("mouse:down", e => {
                    const pointer = editor.canvas.getPointer(e.e);
                    const target = editor.canvas.findTarget(e);
                    if ((target && target.selectable) || !imageSrc.current || imageSrc.current === "") {
                        return;
                    }
                    fabric.Image.fromURL(imageSrc.current, oImg => {
                        oImg.set("left", pointer.x - oImg.width / 2);
                        oImg.set("top", pointer.y - oImg.height / 2);
                        editor.canvas.add(oImg);
                    });
                });
            }
            if (hasKeyBoardControls) {
                //Keyboard event handlers
                document.getElementsByClassName(widgetId)[0].onkeydown = e => {
                    // eslint-disable-next-line
                    switch (e.key) {
                        case "ArrowUp" /* Up arrow */:
                            if (editor.canvas.getActiveObject()) {
                                e.preventDefault();
                                editor.canvas.getActiveObject().top -= 5;
                                editor.canvas.renderAll();
                            }
                            break;
                        case "ArrowDown" /* Down arrow  */:
                            if (editor.canvas.getActiveObject()) {
                                e.preventDefault();
                                editor.canvas.getActiveObject().top += 5;
                                editor.canvas.renderAll();
                            }
                            break;
                        case "ArrowLeft" /* Left arrow  */:
                            if (editor.canvas.getActiveObject()) {
                                e.preventDefault();
                                editor.canvas.getActiveObject().left -= 5;
                                editor.canvas.renderAll();
                            }
                            break;
                        case "ArrowRight" /* Right arrow  */:
                            if (editor.canvas.getActiveObject()) {
                                e.preventDefault();
                                editor.canvas.getActiveObject().left += 5;
                                editor.canvas.renderAll();
                            }
                            break;
                        case "Delete" /* delete */:
                            if (editor.canvas.getActiveObject()) {
                                e.preventDefault();
                                onDelete();
                            }
                            break;
                        case "Backspace" /* delete */:
                            if (editor.canvas.getActiveObject()) {
                                e.preventDefault();
                                onDelete();
                            }
                            break;
                        case "z" /* undo */:
                            if (e.ctrlKey) {
                                e.preventDefault();
                                onUndo();
                            }
                            break;
                        case "y" /* undo */:
                            if (e.ctrlKey) {
                                e.preventDefault();
                                onRedo();
                            }
                            break;
                    }
                };
            }
        }
    };

    //Component Will Mount
    useEffect(() => {
        setWidgetId(uniqueId());
    }, []);

    //Initialize
    useEffect(() => {
        if (!hasInitialized.current && editor && editor.canvas && contentJSON.status === "available") {
            importJSON();
            hasInitialized.current = true;
        }
    }, [editor]);

    useEffect(() => {
        imageSrc.current = imageToAdd?.value?.uri;
        if (editor) {
            if (imageToAdd.value && imageToAdd.value.uri && imageToAdd.value.uri !== "") {
                editor.canvas.discardActiveObject().renderAll();

                if (editor.canvas.isDrawingMode) {
                    editor.canvas.isDrawingMode = false;
                    setIsDrawing(false);
                }
                if (!isImageClickToCanvas) {
                    fabric.Image.fromURL(imageToAdd.value.uri, oImg => {
                        oImg.set("left", 100);
                        oImg.set("top", 100);
                        editor.canvas.add(oImg);
                    });
                } else {
                    editor.canvas.selection = false;
                }
            } else {
                editor.canvas.selection = true;
            }
        }
    }, [imageToAdd?.value]);

    useEffect(() => {
        if (!editor || !fabric) {
            return;
        }
        editor.canvas.freeDrawingBrush.color = color;
        if (editor.canvas.getActiveObjects()) {
            editor.canvas.getActiveObjects().forEach(obj => {
                if (obj.fill) {
                    obj.set("fill", color);
                }
                if (obj.stroke) {
                    obj.set("stroke", color);
                }
            });
            editor.canvas.renderAll();
        }
    }, [color]);

    //Advanced
    //Receive newly created and updated canvas objects from mendix
    useEffect(() => {
        if (editor && isAdvanced && canvasObjectList && canvasObjectList.status === "available") {
            const allCanvasObjects = editor.canvas.getObjects();

            canvasObjectList?.items?.forEach(object => {
                const objJson = canvasObjectJson.get(object)?.displayValue;
                if (!objJson) {
                    return;
                }

                let canvasObjectData;
                try {
                    canvasObjectData = JSON.parse(objJson);
                } catch {
                    console.info("Invalid Canvas Object JSON");
                }
                if (canvasObjectData?.mxid) {
                    const existingCanvasObject = getCanvasObjectByID(allCanvasObjects, canvasObjectData.mxid);
                    if (existingCanvasObject) {
                        parseAndSet(existingCanvasObject, canvasObjectData);
                    } else {
                        // eslint-disable-next-line
                        fabric.util.enlivenObjects([canvasObjectData], function (enlivenedObjects) {
                            //have to .setCoords() in order for objects to be selectable after upating
                            enlivenedObjects[0].setCoords();
                            editor.canvas.add(enlivenedObjects[0]);
                        });
                    }
                }
            });
            editor.canvas.discardActiveObject();
            editor.canvas.renderAll();
        }
    }, [canvasObjectList]);

    useEffect(() => {
        if (selectedJSON?.status === "available" && !selectedJSON.readonly) {
            if (onSelectionChange?.canExecute && selectedObjects.length > 0) {
                selectedJSON.setValue(JSON.stringify(editor.canvas.getActiveObjects()));
                onSelectionChange.execute();
            } else {
                selectedJSON.setValue("");
            }
        }
    }, [selectedObjects]);

    return (
        <div className={"fabric-canvas-widget " + widgetId} tabIndex={0}>
            {showToolBar.value ? (
                <div className="fabric-canvas-widget-button-container">
                    <Button variant="default" onClick={onDuplicate} title="Duplicate">
                        <FontAwesomeIcon icon={faClone} />
                    </Button>
                    <Button variant="default" onClick={onDelete} title="Delete">
                        <FontAwesomeIcon icon={faTrashAlt} />
                    </Button>
                    {!isAdvanced ? (
                        <Fragment>
                            <Button variant="default" onClick={onUndo} title="Undo">
                                <FontAwesomeIcon icon={faRotateBackward} />
                            </Button>
                            <Button variant="default" onClick={onRedo} title="Redo">
                                <FontAwesomeIcon icon={faRotateForward} />
                            </Button>
                            <Button variant="default" onClick={onGroup} title="Group">
                                <FontAwesomeIcon icon={faObjectGroup} />
                            </Button>
                            <Button variant="default" onClick={onUngroup} title="Ungroup">
                                <FontAwesomeIcon icon={faObjectUngroup} />
                            </Button>
                        </Fragment>
                    ) : null}
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
                        onClick={!isLocked ? lockBackgroundShapes : unlockBackgroundShapes}
                        title={!isLocked ? "Lock" : "Unlock"}
                    >
                        <FontAwesomeIcon icon={!isLocked ? faLock : faLockOpen} />
                    </ToggleButton>
                    <ToggleButton
                        id="draw-toggle-check"
                        type="checkbox"
                        variant={!isDrawing ? "default" : "primary"}
                        checked={isDrawing}
                        onClick={onToggleDraw}
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
                                <Button
                                    className={drawingWidth === 1 ? "active" : ""}
                                    variant="default"
                                    onClick={onAdjustDrawSizeSmall}
                                    title="Small"
                                >
                                    Small
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button
                                    className={drawingWidth === 5 ? "active" : ""}
                                    variant="default"
                                    onClick={onAdjustDrawSizeMedium}
                                    title="Medium"
                                >
                                    Medium
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button
                                    className={drawingWidth === 10 ? "active" : ""}
                                    variant="default"
                                    onClick={onAdjustDrawSizeLarge}
                                    title="Large"
                                >
                                    Large
                                </Button>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
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
                                <Button
                                    className="dropdown-item-shape"
                                    variant="default"
                                    onClick={onAddSquare}
                                    title="Add Square"
                                >
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 14 14"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <rect width="14" height="14" />
                                    </svg>
                                    Square
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button
                                    className="dropdown-item-shape"
                                    variant="default"
                                    onClick={onAddCircle}
                                    title="Add Circle"
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <circle cx="8" cy="8" r="8" />
                                    </svg>
                                    Circle
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button
                                    className="dropdown-item-shape"
                                    variant="default"
                                    onClick={onAddTriangle}
                                    title="Add Triangle"
                                >
                                    <FontAwesomeIcon icon={faPlay} />
                                    Triangle
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button
                                    className="dropdown-item-shape"
                                    variant="default"
                                    onClick={onAddDiamond}
                                    title="Add Diamond"
                                >
                                    <FontAwesomeIcon icon={faDiamond} />
                                    Diamond
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button
                                    className="dropdown-item-shape"
                                    variant="default"
                                    onClick={onAddArrow}
                                    title="Add Arrow"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                    Left Arrow
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button
                                    className="dropdown-item-shape"
                                    variant="default"
                                    onClick={onAddDoubleArrow}
                                    title="Add Double Arrow"
                                >
                                    <FontAwesomeIcon icon={faArrowsLeftRight} />
                                    Double Arrow
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button
                                    className="dropdown-item-shape"
                                    variant="default"
                                    onClick={onAddLine}
                                    title="Add Line"
                                >
                                    <FontAwesomeIcon icon={faSlash} />
                                    Line
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button
                                    className="dropdown-item-shape"
                                    variant="default"
                                    onClick={onAddEllipse}
                                    title="Add Ellipse"
                                >
                                    <svg
                                        width="14"
                                        height="18"
                                        viewBox="0 0 14 18"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <ellipse cx="7" cy="9" rx="7" ry="9" />
                                    </svg>
                                    Ellipse
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button
                                    className="dropdown-item-shape"
                                    variant="default"
                                    onClick={onAddRectangle}
                                    title="Add Rectangle"
                                >
                                    <svg
                                        width="14"
                                        height="18"
                                        viewBox="0 0 14 18"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <rect width="14" height="18" />
                                    </svg>
                                    Rectangle
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button
                                    className="dropdown-item-shape"
                                    variant="default"
                                    onClick={onAddRightTriangle}
                                    title="Add Right Triangle"
                                >
                                    <svg
                                        width="17"
                                        height="17"
                                        viewBox="0 0 17 17"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M4.61131e-06 1.13536C-0.00273526 0.127162 1.21612 -0.379649 1.92903 0.333259L16.0635 14.4678C16.7754 15.1796 16.2712 16.3968 15.2645 16.3968H1.16841C0.545528 16.3968 0.0401091 15.8927 0.0384164 15.2699L4.61131e-06 1.13536Z" />
                                    </svg>
                                    Right Triangle
                                </Button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Button
                                    className="dropdown-item-shape shape-arc"
                                    variant="default"
                                    onClick={onAddArc}
                                    title="Add Arc"
                                >
                                    <svg
                                        width="13"
                                        height="15"
                                        viewBox="0 0 13 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M0.500012 14.5C0.500011 2 2.5 0.500003 12 1.00001" stroke="#022A3A" />
                                    </svg>
                                    Arc
                                </Button>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <label className="color-picker-button btn btn-default" title="Color">
                        <div className="color-picker-container">
                            <input type="color" value={color} onChange={e => setColor(e.target.value)} />
                        </div>
                        Color
                        <FontAwesomeIcon icon={faChevronDown} style={{ marginLeft: "10px" }} />
                    </label>
                    {hasAddImageButton.value ? (
                        <Button
                            variant="default"
                            onClick={onAddImage?.canExecute ? onAddImage.execute : null}
                            title="Add Image"
                            className="tool-bar-add-image"
                        >
                            Add Image
                        </Button>
                    ) : null}
                    {hasDownloadButton.value ? (
                        <Button variant="default" onClick={onDownload} title="Download" className="tool-bar-download">
                            Download
                        </Button>
                    ) : null}
                    {hasSaveButton.value ? (
                        <Button variant="default" onClick={onExportAndSave} title="Save" className="tool-bar-save">
                            Save
                        </Button>
                    ) : null}
                    {hasClearCanvasButton.value ? (
                        <Button
                            variant="default"
                            onClick={onClearcanvas}
                            title="Clear Canvas"
                            className="tool-bar-clear-canvas"
                        >
                            Clear Canvas
                        </Button>
                    ) : null}
                </div>
            ) : null}
            <div className="fabric-canvas-component-canvas-container">
                <FabricJSCanvas className="fabric-canvas-widget-fabric-component" onReady={onReady} />
            </div>
        </div>
    );
}
