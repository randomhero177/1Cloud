var taskManager = {};

function VmReconnectTask(mksInstance, externalInterface, vmName, vmId, retries) {
    var count = 0;
    var aborted = false;

    var reportTimeout = function() {
        vmware.log("WARN", "task-monitor", "Timed out waiting for task to complete");
    };

    var execute = function() {
        if (++count > retries) {
            reportTimeout();
            return;
        }

      //  vmware.log("TRACE", "task-monitor", "Checking VM status, attempt {0} of {1}".format(count, retries));
        //externalInterface.getTask(vmId);
    };

    VmReconnectTask.prototype.update = function(taskDetail) {
        if (aborted) {
            vmware.log("WARN", "task-monitor", "Ignoring attempt to update aborted task");
            return;
        }

        if (taskDetail.isBusy) {
         //   vmware.log("TRACE", "task-monitor", "VM is busy");
            setTimeout(execute, 5000);
        } else if (taskDetail.status["name"] === "POWERED_ON") {
            acquireTicket(vmName, vmId);
        } else if (taskDetail.status["name"] === "POWERED_OFF") {
            setState("Powered Off".localize());
        } else if (taskDetail.status["name"] === "SUSPENDED") {
            setState("Suspended".localize());
        } else {
            vmware.log("ERROR", "task-monitor", "VM's current state is {0}".format(taskDetail.status["name"]));
        };
    };

    VmReconnectTask.prototype.abort = function() {
        aborted = true;
    };

    execute();
};

function ExternalInterface() {
    var getParentApplication = function() {
        if (!window.opener || !window.opener.document.application) {
            return undefined;
        }

        return window.opener.document.application;
    };

    ExternalInterface.prototype.acquireMksTicket = function(vmName, vmId) {
        connectControl(param.Host, param.Port, param.Vmx, param.Ticket);
    };
}

function MksConsole(vmName, vmId) {
    var busyArea = document.getElementById("busyArea");
    var wmks = null;

    var setStatus = function(message) {
        busyArea.innerHTML = message;
    };

    setStatus("Loading...".localize());

    var connected = false;
    wmks = $("#console").wmks().bind("wmksconnected", function() {
    //    vmware.log("TRACE", "mks-connection", "Connected");
        $("#console > canvas").css("opacity", "");
        wmks.wmks('option', 'allowMobileKeyboardInput', false);
        wmks.wmks('option', 'fitToParent', false);

        connected = true;
        setStatus("");

        pluginButtonManager.setState("fullscreen", "connected");
        pluginButtonManager.setState("ctrl-alt-del", "connected");
        pluginButtonManager.setState("fit-to-guest", "connected");
        fitToGuest();
    }).bind("wmksconnecting", function() {
     //   vmware.log("TRACE", "mks-connection", "Connecting...");
        setStatus("Connecting...".localize());

        // changing canvas position to be relative to containing div
        $("#console > canvas").css('position', 'relative');
    }).bind("wmksdisconnected", function(event) {
  //      vmware.log("TRACE", "mks-connection", "Disconnected {0}".format(event));
        connected = false;
        setStatus("Disconnected".localize());
        $("#console > canvas").fadeTo("slow", 0.5);
        $("#console > canvas").css("cursor", "default");
        taskManager[vmId] = new VmReconnectTask(this, ei, vmName, vmId, 50);
    }).bind("wmksresolutionchanged", function() {
  //      vmware.log("TRACE", "mks-console", "Resolution changed");
        fitToGuest();
    }).bind("wmkserror", function(event, error) {
        vmware.log("ERROR", "mks-console", "Error occurred: {0}".format(error));
    }).bind("wmksprotocolError", function(event) {
        vmware.log("ERROR", "mks-console", "Protocol error occurred: {0}".format(event));
    }).bind("wmksauthenticationFailed", function(event) {
        vmware.log("ERROR", "mks-console", "Authentication failure: {0}".format(event));
    });

    $(window).resize(function() {
        // resetting overflow handling (set during resize to prevent errant scrollbars in Chrome)
        $(document.body).css("overflow", "");
    });

    var fitToGuest = function() {
        var canvas = $("#console > canvas");

        // width and height of console
        var guestWidth = canvas.width();
        var guestHeight = canvas.height();

        // estimated width and height consumed by other elements
        var cssWidth = 0;
        var cssHeight = 40;

        // guess of width and height used by browser
        var guessedBrowserWidth = 20;
        var guessedBrowserHeight = 60;

        // values to pass to resize
        var computedWidth = guestWidth + cssWidth + guessedBrowserWidth;
        var computedHeight = guestHeight + cssHeight + guessedBrowserHeight;
     //   vmware.log("TRACE", "wrapper", "Attempting to resize to {0}x{1} for guest size {2}x{3}" .format(computedWidth, computedHeight, guestWidth, guestHeight));
        $("#console").removeClass("full");
        $("#console").addClass("standard");
        $("#console").width($("#console > canvas").width());
        $("#console").height($("#console > canvas").height());
        // $(document.body).css("overflow", "hidden");
        window.resizeTo(computedWidth, computedHeight);
    };

    var getFullScreenElement = function() {
        if (document.fullscreenElement) {
            return document.fullscreenElement;
        } else if (document.mozFullScreenElement) {
            return document.mozFullScreenElement;
        } else if (document.webkitFullscreenElement) {
            return document.webkitFullscreenElement;
        }

        return null;
    };

    var onFullScreenChange = function() {
        var element = getFullScreenElement();
        if (element) {
            return;
        }

    //    vmware.log("TRACE", "fullscreen", "Exiting fullscreen mode");
        fitToGuest();
    };

    $("#console").bind("webkitfullscreenchange mozfullscreenchange fullscreenchange", onFullScreenChange);
    $(document).bind("mozfullscreenchange", onFullScreenChange);

    MksConsole.prototype.setState = function(state) {
        setStatus(state);
    };

    MksConsole.prototype.isConnected = function() {
        return connected;
    };

    MksConsole.prototype.fitToGuest = function() {
        fitToGuest();
    };

    MksConsole.prototype.fullScreen = function() {
        var containerElement = document.getElementById("console");
        $("#console").removeClass("standard");
        $("#console").addClass("full");
        if(containerElement.requestFullScreen) {
            containerElement.requestFullScreen();
        } else if(containerElement.mozRequestFullScreen) {
            containerElement.mozRequestFullScreen();
        } else if(containerElement.webkitRequestFullScreen) {
            containerElement.webkitRequestFullScreen();
        }
    };

    MksConsole.prototype.sendCtrlAltDelete = function() {
        // There is a sendKeyCodes method, but it is causing an infinite trigger loop
        // for some reason
        wmks.wmks("sendKeyCode", 17, "keydown");
        wmks.wmks("sendKeyCode", 18, "keydown");
        wmks.wmks("sendKeyCode", 46, "keydown");
        wmks.wmks("sendKeyCode", 46, "keyup");
        wmks.wmks("sendKeyCode", 18, "keyup");
        wmks.wmks("sendKeyCode", 17, "keyup");
    };

    MksConsole.prototype.connect = function(host, port, vmx, ticket) {
        var url = "wss://{0}/{1};{2}".format(host, port, ticket);
      //  vmware.log("TRACE", "mks-connection", "Connecting to {0}".format(url));
        wmks.wmks("connect", url, vmx);
    };
}


var mks = null;
var ei = null;

function initializeI18n(buttonLabels, miscLabels, confirmationLabels) {
    i18n.add("Send Ctrl-Alt-Del", buttonLabels[0]);
    i18n.add("Send Ctrl-Alt-Del (disabled)", buttonLabels[1]);
    i18n.add("Full Screen", buttonLabels[2]);
    i18n.add("Full Screen (disabled)", buttonLabels[3]);
    i18n.add("Fit Window to Guest", buttonLabels[8]);
    i18n.add("Fit Window to Guest (disabled)", buttonLabels[9]);

    i18n.add("Connecting...", miscLabels[0]);
    i18n.add("Disconnected", miscLabels[1]);
    i18n.add("Failed to connect", miscLabels[2]);   // currently unused
    i18n.add("None", miscLabels[3]);
    i18n.add("Ok", miscLabels[4]);
    i18n.add("Cancel", miscLabels[5]);
    i18n.add("Device", miscLabels[15]);
    i18n.add("Error", miscLabels[16]);
    i18n.add("Operation failed. Please verify the vCD session is still active.", miscLabels[17]);
    i18n.add("Connect {0}", miscLabels[19]);
    i18n.add("Disconnect {0}", miscLabels[20]);

}

function buildConsoleChrome(data) {
 //   vmware.log("TRACE", "layout", "Adding/configuring console UI controls");
	buttonLabels = ["Send Ctrl-Alt-Del","Send Ctrl-Alt-Del (disabled)", "Full Screen", "Full Screen (disabled)", "CD/DVD", "CD/DVD (disabled)", "Floppy", "Floppy (disabled)", "Fit Window to Guest", "Fit Window to Guest (disabled)", "USB", "USB (disabled)"];
	miscLabels = ["Connecting...", "Disconnected", "Failed to connect", "Failed to connect", "OK", "Cancel", "Browse", "Manage CDs/DVDs", "Choose the CD or DVD to attach to this VM. Only one device can be attached at a time.", "Manage Floppys", "Choose the Floppy drive to attach to this VM. Only one device can be attached at a time.", "Manage USBs", "Choose the USB drive(s) to connect to or disconnect this VM. One or more devices can be selected at a time.", "Copy and paste the full path to the device you want to attach.", "Client device access is disabled.", "Device", "Error", "Operation failed. Please verify the vCD session is still active.", "No client devices are available.", "Connect {0}", "Disconnect {0}", "No virtual CD/DVD device found", "No virtual floppy device found"];
	vmName = param.VmName;
    vmId = param.VmId;

  //  $(document).attr("title",  vappName + " - " + vmName);
  //  $("#vmName").text(vmName);

    initializeI18n(buttonLabels, miscLabels);

    mks = new MksConsole(vmName, vmId);

    span = $('#plugin-buttons');
    pluginButtonManager = vmware.buttonManager({container: span})
        .createButton("ctrl-alt-del", { defaultState: { image: "/Content/webconsolehtml5/ctrl-alt-del-16x16-disabled.png", style: "cursor:auto", text: "Send Ctrl-Alt-Del (disabled)".localize() }, connected: { image: "/Content/webconsolehtml5/ctrl-alt-del-16x16.png", style: "cursor:pointer", text: "Send Ctrl-Alt-Del".localize() } })
        .registerHandler("ctrl-alt-del", function(event) {
            if (mks.isConnected()) {
                mks.sendCtrlAltDelete();
            }
        })
        .createButton("fullscreen", { defaultState: { image: "/Content/webconsolehtml5/full-screen-16x16-disabled.png", style: "cursor:auto", text: "Full Screen (disabled)".localize() }, connected: { image: "/Content/webconsolehtml5/full-screen-16x16.png", style: "cursor:pointer", text: "Full Screen".localize() } })
        .registerHandler("fullscreen", function(event) {
            if (mks.isConnected()) {
                mks.fullScreen();
            }
        })
        .createButton("fit-to-guest", { defaultState: { image: "/Content/webconsolehtml5/fit-to-guest-16x16-disabled.png", style: "cursor:auto", text: "Fit Window to Guest (disabled)".localize() }, connected: { image: "/Content/webconsolehtml5/fit-to-guest-16x16.png", style: "cursor:pointer", text: "Fit Window to Guest".localize() } })
        .registerHandler("fit-to-guest", function(event) {
            if (mks.isConnected()) {
                mks.fitToGuest();
            }
        });
}

function acquireTicket(vmName, vmId) {
    if (ei === null) {
        ei = new ExternalInterface();
    }

  //  vmware.log("TRACE", "init", "attempting ticket acquisition for vm {0}".format(vmName));
    ei.acquireMksTicket(vmName, vmId);
};

function connectControl(host, port, vmx, ticket) {
  //  vmware.log("TRACE", "plugin", "Connecting vm");
    mks.connect(host, port, vmx, ticket);
};

function doPowerOperation(powerOperation) {
    if (powerOperation === 'reset') {
        mks.reset();
    } else if (powerOperation === 'start') {
        mks.start();
    } else if (powerOperation === 'stop') {
        mks.stop();
    } else if (powerOperation === 'suspend') {
        mks.suspend();
    }
};

function updateTask(vmId, taskDetail) {
    if (taskManager[vmId] !== undefined) {
        taskManager[vmId].update(taskDetail);
    }
};

function setState(state) {
    mks.setState(state);
}