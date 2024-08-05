## FabricCanvas
The Fabric Canvas widget provides an interactive canvas to the Mendix UI while also allowing canvas data to be read and manipulated from an object oriented perspective within Mendix.

## Typcial Usage Scenario
The Fabric Canvas module and widget allows users the ability to create diagrams, drawings or layouts within the Mendix UI. A common use case for this module would be allowing a technician to add data points and mark ups to a blue print or floor plan.

## Links
[Demo](https://fabriccanvas-sandbox.mxapps.io/).
[FabricJS](http://fabricjs.com/docs/).
[FabricJS-React](https://www.npmjs.com/package/fabricjs-react).

## Features
# Nav Bar
Duplicate: Clone selected canvas content
Delete: Delete selected canvas content
Undo: Undo the last change made on the canvas
Redo: Redo the last change undone on the canvas
Group: Group selected canvas content together
Ungroup: Ungroup any selected canvas content
Move To Back: Move any selected canvas content to the back of any other canvas content
Move To Front: Move any selected canvas content to the front of any other canvas content
Lock: Lock all canvas content currently on canvas
Toggle Drawing: This allows for drawing on the canvas
Draw Size: This changes the size of the drawing stencil
Add Text: This allows for adding a textbox to the canvas
Add Shape: This allows for adding shapes (Square, Circle, Triangle, Diamond, Left Arrow, Double Arrow, Line, Ellipse, Rectangle, Right Triangle, Arc) to the canvas.

# Keyboard Shortcuts
Arrow keys: move selected objects around canvas
Delete/Backspace: delete selected objects
Ctrl + z: Undo
Ctrl + y: redo

## Configuration
The Fabric Canvas widget has a Basic and Advanced configurations.

# Basic
Data Sources
Canvas JSON: Attribute to store the JSON of the canvas contents (no string limit)
Selected Content JSON (Optional): Attribute to store the JSON of the selected canvas contents (no string limit)
Image to Add (Optional): Association to system.image to allow for adding mendix images to canvas

Events
On Save (Optional): Action to be performed when Save Button is clicked
On Selection (Optional): Action to be performed when canvas objects are selected
On Add Image (Optional): Action to be performed when Add Image Button is clicked
Click to Canvas: When the Image to Add association is set, this will allow you to click on the canvas to add the image. When false, images will be positioned automatically when Image to Add association is set.
Has Keyboard Controls: Available Keyboard controls consist of:
    - Arrow keys (move selected objects around canvas)
    - Delete/Backspace (delete selected objects)
    - Ctrl + z (Undo)  
    - Ctrl + y (Redo)

Appearance
Show Toolbar: Setting this to false will hide the toolbar
Show Add Image Btn: Will perform On Add Image action
Show Save Btn: Will export the JSON of the current canvas to the Canvas JSON attribute and perform the On Save action
Show Clear Canvas Btn: Will clear all contents of the canvas
Show Download Btn: Will download canvas as a png
Default Color: Default CSS color for canvas, this includes shapes, text and drawing stencil

# Advanced
Using the advanced configuration of the application allows for canvas objects to be mapped to mendix objects. See data flow diagram screenshot for more in depth description.

Canvas Object DS: Canvas Objects list
Canvas Object JSON: JSON of canvas object
On Canvas Change: Action to be performed when a canvas actions occurs such as duplicate, delete, undo, redo, canvas object moves or changes color. Prior to this action being called, the canvas JSON will be exported to the 'Canvas JSON' attribute



## Limitations
# Images
When adding images, SVGs must have specified height and width, otherwise the SVG will use the entire screen as the parent container.
When images are added to the canvas they use the mendix file folder path. If the images are deleted form mendix then they will not be able to be referenced and shown on the canvas.

# Nav Bar
Advanced has all of the basic nav bar abilities with the exception of group and ungroup

## Development and contribution
1. Install NPM package dependencies by using: `npm install`. If you use NPM v7.x.x, which can be checked by executing `npm -v`, execute: `npm install --legacy-peer-deps`.
1. Run `npm start` to watch for code changes. On every change:
    - the widget will be bundled;
    - the bundle will be included in a `dist` folder in the root directory of the project;
    - the bundle will be included in the `deployment` and `widgets` folder of the Mendix test project.

## Contributors
Luke Karlovich, Sam Egan, Tom Slesinger, Kyle Ward, Brett Kolinek, Ashley Cheung, Conner Charlebois