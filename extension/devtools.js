chrome.devtools.panels.create("Tea Cup",
    "MyPanelIcon.png",
    "panel.html",
    function(panel) {
      // code invoked on panel creation

        // chrome.devtools.inspectedWindow.eval(
        //     "console.log('FFFFF');",
        //     function(result, isException) { }
        // );

    }
);