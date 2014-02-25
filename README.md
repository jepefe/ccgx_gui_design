ccgx_gui_design
==============

This library contains files to visualize the GUI (Graphical User Interface) from the Color Control CCGX. 

With FreeMind (http://freemind.sourceforge.net/) you can edit the XML file (MenuStructure_CCGX.mm) which is located in the map_files. This XML file contains all the information which is needed to build the GUI. 
When loading the website, JavaScript/jQuery will parse the XML into a readable format and build the interface.

Two types of interfaces
--------------
- index.html (This contains the interface)
- manual.html (This contains the interface, plus an ability to search trough it and see descriptions of menu items)

Important things to note when editing the XML file
--------------
** I'll add images soon to further explain how to edit the file **

Before you start editing the file, please look at the existing file and how it's build (How the selects and toggles are build and how the navigation is build).

- When an item in the navigation is a parent, this should always be made bold. 
- When you want to create a select option, add (Select) behind your option.
- When you want to create a toggle option, add (Toggle) behind your option.
- If you want to add a description to a specific menu item for the manual, you have to click on the menu item and type something in the layout view.