document.addEventListener('DOMContentLoaded', function () {
    const createRealmeButton = document.querySelector('.make_realme_button_org');
    const rightUpperDiv = document.querySelector('.right_upper');
    const dropdownContainer = document.querySelector('.realme_container');

    let formCreated = false;

    createRealmeButton.addEventListener('click', function () {
        createForm();
    });

    function createForm() {
        clearRightUpper();

        if (!formCreated) {
            const form = document.createElement('form');
            form.classList.add('realme-form');

            const nameLabel = document.createElement('label');
            nameLabel.textContent = 'Name of Realm:';
            const nameInput = document.createElement('input');
            nameInput.setAttribute('type', 'text');
            nameInput.setAttribute('placeholder', 'Enter name of Realm');
            nameInput.setAttribute('required', '');
            nameInput.setAttribute('name', 'realmName');

            const contestsLabel = document.createElement('label');
            contestsLabel.textContent = 'Contests:';
            const contestsContainer = document.createElement('div');
            contestsContainer.classList.add('contest-container');

            const addContestButton = document.createElement('button');
            addContestButton.textContent = 'Add Contest';
            addContestButton.addEventListener('click', function () {
                createContestInput(contestsContainer);
            });

            const submitButton = document.createElement('button');
            submitButton.setAttribute('type', 'submit');
            submitButton.textContent = 'Create Realm';

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                const formData = new FormData(form);
                const realmName = formData.get('realmName');
                const contestInputs = contestsContainer.querySelectorAll('.contest-input');
                const contests = [];
                const problems = [];

                contestInputs.forEach(input => {
                    const contestName = input.querySelector('input[name="contestName"]').value;
                    const problemInputs = input.querySelectorAll('.problem-input');
                    const startDate = input.querySelector('input[name="startDate"]').value;
                    const endDate = input.querySelector('input[name="endDate"]').value;
                    const contestProblems = [];

                    problemInputs.forEach(problemInput => {
                        const problem = {
                            text: problemInput.querySelector('input[name="problemText"]').value,
                            difficulty: problemInput.querySelector('input[name="problemDifficulty"]').value,
                            QuestionScore: problemInput.querySelector('input[name="questionScore"]').value,
                            QuestionId: problemInput.querySelector('input[name="questionId"]').value,
                            QuestionInputFormat: problemInput.querySelector('input[name="questionInputFormat"]').value,
                            QuestionOutputFormat: problemInput.querySelector('input[name="questionOutputFormat"]').value,
                            QuestionTestInput01: problemInput.querySelector('input[name="testInput01"]').value,
                            QuestionTestInput02: problemInput.querySelector('input[name="testInput02"]').value,
                            QuestionTestInput03: problemInput.querySelector('input[name="testInput03"]').value,
                            QuestionTestOutput01: problemInput.querySelector('input[name="testOutput01"]').value,
                            QuestionTestOutput02: problemInput.querySelector('input[name="testOutput02"]').value,
                            QuestionTestOutput03: problemInput.querySelector('input[name="testOutput03"]').value,
                            QuestionTitle: problemInput.querySelector('input[name="questionTitle"]').value,
                            runMemoryLimit: problemInput.querySelector('input[name="runMemoryLimit"]').value,
                            runTimeout: problemInput.querySelector('input[name="runTimeout"]').value
                        };
                        contestProblems.push(problem);
                        problems.push(problem); 
                    });


                    const contest = {
                        name: contestName,
                        problems: contestProblems,
                        startdate : startDate,
                        enddate : endDate
                    };
                    contests.push(contest);
                });

                const realmData = {
                    name: realmName,
                    contests: contests,
                    problems: problems
                };

                // Send realmData to the server to save in the database
                fetch('/create-realm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(realmData)
                })
                    // After realm creation success
                    .then(response => {
                        if (response.ok) {
                            console.log('Realm created successfully');
                            // Reload the page after successful creation
                            location.reload("/organisation_page");
                        } else {
                            throw new Error('Failed to create realm');
                        }
                    })
                    .catch(error => {
                        console.error(error); // Handle error

                    });
            });

            form.appendChild(nameLabel);
            form.appendChild(nameInput);
            form.appendChild(contestsLabel);
            form.appendChild(contestsContainer);
            form.appendChild(addContestButton);
            form.appendChild(submitButton);

            rightUpperDiv.appendChild(form);

            formCreated = true;
        }
    }

    function createContestInput(container) {
        const contestDiv = document.createElement('div');
        contestDiv.classList.add('contest-input');
    
        const contestLabel = document.createElement('label');
        contestLabel.textContent = 'Contest Name:';
        const contestNameInput = document.createElement('input');
        contestNameInput.setAttribute('type', 'text');
        contestNameInput.setAttribute('placeholder', 'Enter contest name');
        contestNameInput.setAttribute('required', '');
        contestNameInput.setAttribute('name', 'contestName');
    
        // Start Date input
        const startDateLabel = document.createElement('label');
        startDateLabel.textContent = 'Start Date:';
        const startDateInput = document.createElement('input');
        startDateInput.setAttribute('type', 'date');
        startDateInput.setAttribute('required', '');
        startDateInput.setAttribute('name', 'startDate');
    
        // End Date input
        const endDateLabel = document.createElement('label');
        endDateLabel.textContent = 'End Date:';
        const endDateInput = document.createElement('input');
        endDateInput.setAttribute('type', 'date');
        endDateInput.setAttribute('required', '');
        endDateInput.setAttribute('name', 'endDate');
    
        const addProblemButton = document.createElement('button');
        addProblemButton.textContent = 'Add Problem';
        addProblemButton.addEventListener('click', function () {
            createProblemInput(contestDiv);
        });
    
        contestDiv.appendChild(contestLabel);
        contestDiv.appendChild(contestNameInput);
        contestDiv.appendChild(startDateLabel);
        contestDiv.appendChild(startDateInput);
        contestDiv.appendChild(endDateLabel);
        contestDiv.appendChild(endDateInput);
        contestDiv.appendChild(addProblemButton);
    
        container.appendChild(contestDiv);
    }
    

    function createProblemInput(container) {
        const problemDiv = document.createElement('div');
        problemDiv.classList.add('problem-input');

        const problemLabel = document.createElement('label');
        problemLabel.textContent = 'Problem Details:';

        const textLabel = document.createElement('label');
        textLabel.textContent = 'Text:';
        const textInput = document.createElement('input');
        textInput.setAttribute('type', 'text');
        textInput.setAttribute('placeholder', 'Enter problem text');
        textInput.setAttribute('required', '');
        textInput.setAttribute('name', 'problemText');

        const difficultyLabel = document.createElement('label');
        difficultyLabel.textContent = 'Difficulty:';
        const difficultyInput = document.createElement('input');
        difficultyInput.setAttribute('type', 'text');
        difficultyInput.setAttribute('placeholder', 'Enter problem difficulty');
        difficultyInput.setAttribute('required', '');
        difficultyInput.setAttribute('name', 'problemDifficulty');

        const scoreLabel = document.createElement('label');
        scoreLabel.textContent = 'Question Score:';
        const scoreInput = document.createElement('input');
        scoreInput.setAttribute('type', 'number');
        scoreInput.setAttribute('placeholder', 'Enter question score');
        scoreInput.setAttribute('required', '');
        scoreInput.setAttribute('name', 'questionScore');

        const idLabel = document.createElement('label');
        idLabel.textContent = 'Question ID:';
        const idInput = document.createElement('input');
        idInput.setAttribute('type', 'number');
        idInput.setAttribute('placeholder', 'Enter question ID');
        idInput.setAttribute('required', '');
        idInput.setAttribute('name', 'questionId');

        const inputFormatLabel = document.createElement('label');
        inputFormatLabel.textContent = 'Question Input Format:';
        const inputFormatInput = document.createElement('input');
        inputFormatInput.setAttribute('type', 'text');
        inputFormatInput.setAttribute('placeholder', 'Enter question input format');
        inputFormatInput.setAttribute('required', '');
        inputFormatInput.setAttribute('name', 'questionInputFormat');

        const outputFormatLabel = document.createElement('label');
        outputFormatLabel.textContent = 'Question Output Format:';
        const outputFormatInput = document.createElement('input');
        outputFormatInput.setAttribute('type', 'text');
        outputFormatInput.setAttribute('placeholder', 'Enter question output format');
        outputFormatInput.setAttribute('required', '');
        outputFormatInput.setAttribute('name', 'questionOutputFormat');

        const testInput01Label = document.createElement('label');
        testInput01Label.textContent = 'Test Input 01:';
        const testInput01Input = document.createElement('input');
        testInput01Input.setAttribute('type', 'text');
        testInput01Input.setAttribute('placeholder', 'Enter test input 01');
        testInput01Input.setAttribute('required', '');
        testInput01Input.setAttribute('name', 'testInput01');

        const testInput02Label = document.createElement('label');
        testInput02Label.textContent = 'Test Input 02:';
        const testInput02Input = document.createElement('input');
        testInput02Input.setAttribute('type', 'text');
        testInput02Input.setAttribute('placeholder', 'Enter test input 02');
        testInput02Input.setAttribute('required', '');
        testInput02Input.setAttribute('name', 'testInput02');

        const testInput03Label = document.createElement('label');
        testInput03Label.textContent = 'Test Input 03:';
        const testInput03Input = document.createElement('input');
        testInput03Input.setAttribute('type', 'text');
        testInput03Input.setAttribute('placeholder', 'Enter test input 03');
        testInput03Input.setAttribute('required', '');
        testInput03Input.setAttribute('name', 'testInput03');

        const testOutput01Label = document.createElement('label');
        testOutput01Label.textContent = 'Test Output 01:';
        const testOutput01Input = document.createElement('input');
        testOutput01Input.setAttribute('type', 'text');
        testOutput01Input.setAttribute('placeholder', 'Enter test output 01');
        testOutput01Input.setAttribute('required', '');
        testOutput01Input.setAttribute('name', 'testOutput01');

        const testOutput02Label = document.createElement('label');
        testOutput02Label.textContent = 'Test Output 02:';
        const testOutput02Input = document.createElement('input');
        testOutput02Input.setAttribute('type', 'text');
        testOutput02Input.setAttribute('placeholder', 'Enter test output 02');
        testOutput02Input.setAttribute('required', '');
        testOutput02Input.setAttribute('name', 'testOutput02');

        const testOutput03Label = document.createElement('label');
        testOutput03Label.textContent = 'Test Output 03:';
        const testOutput03Input = document.createElement('input');
        testOutput03Input.setAttribute('type', 'text');
        testOutput03Input.setAttribute('placeholder', 'Enter test output 03');
        testOutput03Input.setAttribute('required', '');
        testOutput03Input.setAttribute('name', 'testOutput03');

        const titleLabel = document.createElement('label');
        titleLabel.textContent = 'Question Title:';
        const titleInput = document.createElement('input');
        titleInput.setAttribute('type', 'text');
        titleInput.setAttribute('placeholder', 'Enter question title');
        titleInput.setAttribute('required', '');
        titleInput.setAttribute('name', 'questionTitle');

        const memoryLimitLabel = document.createElement('label');
        memoryLimitLabel.textContent = 'Run Memory Limit:';
        const memoryLimitInput = document.createElement('input');
        memoryLimitInput.setAttribute('type', 'text');
        memoryLimitInput.setAttribute('placeholder', 'Enter run memory limit');
        memoryLimitInput.setAttribute('required', '');
        memoryLimitInput.setAttribute('name', 'runMemoryLimit');

        const timeoutLabel = document.createElement('label');
        timeoutLabel.textContent = 'Run Timeout:';
        const timeoutInput = document.createElement('input');
        timeoutInput.setAttribute('type', 'number');
        timeoutInput.setAttribute('placeholder', 'Enter run timeout');
        timeoutInput.setAttribute('required', '');
        timeoutInput.setAttribute('name', 'runTimeout');

        problemDiv.appendChild(problemLabel);
        problemDiv.appendChild(textLabel);
        problemDiv.appendChild(textInput);
        problemDiv.appendChild(difficultyLabel);
        problemDiv.appendChild(difficultyInput);
        problemDiv.appendChild(scoreLabel);
        problemDiv.appendChild(scoreInput);
        problemDiv.appendChild(idLabel);
        problemDiv.appendChild(idInput);
        problemDiv.appendChild(inputFormatLabel);
        problemDiv.appendChild(inputFormatInput);
        problemDiv.appendChild(outputFormatLabel);
        problemDiv.appendChild(outputFormatInput);
        problemDiv.appendChild(testInput01Label);
        problemDiv.appendChild(testInput01Input);
        problemDiv.appendChild(testInput02Label);
        problemDiv.appendChild(testInput02Input);
        problemDiv.appendChild(testInput03Label);
        problemDiv.appendChild(testInput03Input);
        problemDiv.appendChild(testOutput01Label);
        problemDiv.appendChild(testOutput01Input);
        problemDiv.appendChild(testOutput02Label);
        problemDiv.appendChild(testOutput02Input);
        problemDiv.appendChild(testOutput03Label);
        problemDiv.appendChild(testOutput03Input);
        problemDiv.appendChild(titleLabel);
        problemDiv.appendChild(titleInput);
        problemDiv.appendChild(memoryLimitLabel);
        problemDiv.appendChild(memoryLimitInput);
        problemDiv.appendChild(timeoutLabel);
        problemDiv.appendChild(timeoutInput);

        container.appendChild(problemDiv);
    }


    function clearRightUpper() {
        rightUpperDiv.innerHTML = '';
    }




});
