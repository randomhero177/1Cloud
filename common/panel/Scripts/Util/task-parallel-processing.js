/*
 * This util item provides parallel task progress demonstration.
 * We get from server's many simultaniously processing tasks only one, and draw its progressbar and its description. Then we track only this task.
 * If current task has completed, we request another task from server and repeat procedure. 
 * If cbNewTaskLoaded is defined, then this function fires during drawProgressBar function
 */

/*
 * @string getTaskUrl - url to get current active task from server
 * @string progressTaskUrl - url to check status of concrete task
 * @function cbNewTaskLoaded - callback function for extra functionality, when new task is loaded. Optional parameter for cbNewTaskLoaded - taskModel.
 * @string progressBlockId - id of the element, where we will show progress. Defaults: 'event-processing-task'
 * @function cbGetHash - callback function to get hash, when all task is loaded.
 */
function initTaskParallelProgessBar(getTaskUrl, progressTaskUrl, cbNewTaskLoaded, progressBlockId, cbGetHash) {
    let blockId = (typeof progressBlockId !== 'undefined' && progressBlockId !== null) ? progressBlockId : 'event-processing-task';

    if (document.getElementById(blockId) !== null && getTaskUrl !== '' && progressTaskUrl !== '') {
        const ids = {
            bar: 'process-task-bar',
            title: 'process-task-title'
        }

        const classes = {
            container: 'progress__container',
            progress: 'progress progress-striped',
            bar: 'bar active',
            title: 'progress__title'
        };

        let currentTaskId = 0;
        let checkTaskInterval;

        /*
         * Returns filled progress element, due to passed task model
         * @obj taskModel
         */
        function getProgressElement(taskModel) {
            let progressContainer = window.util.createDOMElement('div', classes.container);
            let progressBlock = window.util.createDOMElement('div', classes.progress);
            let progressBar = window.util.createDOMElement('div', classes.bar, ids.bar);
            let progressTitle = window.util.createDOMElement('span', classes.title, ids.title);

            progressBlock.appendChild(progressBar);

            progressTitle.textContent = (typeof taskModel.TypeTitle !== 'undefined') ? taskModel.TypeTitle : taskModel.Title;

            progressContainer.appendChild(progressBlock);
            progressContainer.appendChild(progressTitle);
            return progressContainer;
        }

        /*
         * Sets progress scale to progress bar
         * @number progressPercents - progress percents of current task
         */
        function refreshProgressElement(progressPercents) {
          let progressBar = document.getElementById(ids.bar);
          if (progressBar) {
            progressBar.style.width = progressPercents + '%';
          };
        }

        /*
         * Inserts progress block to blockId Element
         * @obj taskModel
         */
        function drawProgressBar(taskModel) {
            let block = document.getElementById(blockId);

            window.util.cleanInnerHtml(block);
            block.appendChild(getProgressElement(taskModel));

            if (typeof cbNewTaskLoaded === 'function') {
                cbNewTaskLoaded(taskModel);
            }

            if (taskModel.ProgressPercent > 0) {
                setTimeout(function () { refreshProgressElement(taskModel.ProgressPercent) }, 500);
            }

            checkTaskInterval = setInterval(checkTaskProgress, 2000);
        }

        /*
         * Returns active task from server
         */
        function getCurrentTask() {
            window.util.createSimpleXHR(getTaskUrl, null, getTaskSuccess, null);
            var curHash = '';
            function getTaskSuccess(response) {
                // assuming that response will be in a JSON string format
                let taskObj = JSON.parse(response);
                if (typeof taskObj.redirectTo !== 'undefined') {
                    refreshProgressElement(100);
                    setTimeout(function () {
                      location.href = taskObj.redirectTo + curHash;
                    }, 2000);
                } else {
                    currentTaskId = (typeof taskObj.Id !== 'undefined') ? taskObj.Id : taskObj.ID;
                    curHash = (typeof cbGetHash === 'function') ? cbGetHash(taskObj.TechTitle) : '';
                    drawProgressBar(taskObj);
                }
            }
        }

        /*
         * Returns concrete task from server
         */
        function checkTaskProgress() {
            window.util.createSimpleXHR(progressTaskUrl.replace('-1', currentTaskId), null, handleTaskProgress, handleTaskError);

            function handleTaskProgress(response) {
                let taskModel = JSON.parse(response);
                if (taskModel.TaskIsComplited) {
                    clearInterval(checkTaskInterval);
                    refreshProgressElement(100);
                    setTimeout(function () {
                        getCurrentTask();
                    }, 2000);
                } else {
                    refreshProgressElement(taskModel.ProgressPercent);
                }
            }

            function handleTaskError(response) {
                clearInterval(checkTaskInterval);
                throw response;
            }
        }

        getCurrentTask();
    }
}