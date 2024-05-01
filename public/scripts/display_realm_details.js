document.addEventListener('DOMContentLoaded', function () {

    const rightUpperDiv = document.querySelector('.right_upper');
    const dropdownContainer = document.querySelector('.realme_container');

    function displayContests(realmName) {
        fetch('/fetch-contests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ realmName })
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to fetch contests');
                }
            })
            .then(data => {
                // Clear the right-upper section
                clearRightUpper();

                if (data.success) {
                    // Create a container for the realm
                    const realmContainer = document.createElement('div');
                    realmContainer.classList.add('realm-container');

                    // Display realm name
                    const realmNameElement = document.createElement('h2');
                    realmNameElement.textContent = `Realm Name: ${realmName}`;
                    realmContainer.appendChild(realmNameElement);

                    const deleteRealmButton = document.createElement('button');
                    deleteRealmButton.textContent = 'Delete Realm';
                    deleteRealmButton.classList.add('delete-realm-button');
                    realmContainer.appendChild(deleteRealmButton);

                    // Add event listener to delete button
                    deleteRealmButton.addEventListener('click', function () {
                        // Call a function to handle deleting the realm
                        deleteRealm(realmName);
                    });

                    // Create a container for contests
                    const contestContainer = document.createElement('div');
                    contestContainer.classList.add('contest-container');

                    // Check if contests are available
                    if (data.contests && data.contests.length > 0) {
                        // Iterate over fetched contest names and create elements to display them
                        data.contests.forEach(contest => {
                            const contestElement = document.createElement('div');
                            const addButton = document.createElement('button'); // Create the "Add Problem" button
                            addButton.textContent = 'Add Problem'; // Set button text
                            addButton.classList.add('add-problem-button'); // Add a class to style the button if needed
                            addButton.setAttribute('value', contest.name); // Set the contest name as the value attribute

                            // Convert startdate and enddate to Date objects
                            const startDate = new Date(contest.startdate);
                            const endDate = new Date(contest.enddate);

                            // Format dates as desired (e.g., 'MM/DD/YYYY HH:MM')
                            const startDateString = startDate.toLocaleString(); // Adjust format as needed
                            const endDateString = endDate.toLocaleString(); // Adjust format as needed

                            contestElement.textContent = `- ${contest.name} (Start: ${startDateString}, End: ${endDateString})`;
                            contestElement.appendChild(addButton); // Append the button to the contest element
                            contestContainer.appendChild(contestElement); // Append the contest element to the container

                            // Add event listener to the "Add Problem" button
                            addButton.addEventListener('click', function () {
                                const contestName = addButton.getAttribute('value'); // Retrieve the contest name from the button
                                createProblemForm(rightUpperDiv, realmName, contestName);
                            });
                        });


                    } else {
                        const noContestsElement = document.createElement('p');
                        noContestsElement.textContent = 'No contests found for this realm.';
                        contestContainer.appendChild(noContestsElement);
                    }

                    // Append the contest container to the realm container
                    realmContainer.appendChild(contestContainer);

                    // Append the realm container to the right-upper section
                    rightUpperDiv.appendChild(realmContainer);

                    // Create and append "Add New Contest" button
                    const addNewContestButton = document.createElement('button');
                    addNewContestButton.textContent = 'Add New Contest';
                    addNewContestButton.classList.add('add-new-contest-button');
                    realmContainer.appendChild(addNewContestButton);

                    // Add event listener to "Add New Contest" button
                    addNewContestButton.addEventListener('click', function () {
                        // Clear the right-upper section
                        clearRightUpper();

                        // Display form for creating a new contest
                        const createContestForm = document.createElement('form');
                        createContestForm.classList.add('create-contest-form');

                        // Create inputs for contest details
                        const nameLabel = document.createElement('label');
                        nameLabel.textContent = 'Contest Name:';
                        const nameInput = document.createElement('input');
                        nameInput.setAttribute('type', 'text');
                        nameInput.setAttribute('placeholder', 'Enter contest name');
                        nameInput.setAttribute('required', '');

                        // Create inputs for startdate and enddate
                        const startDateLabel = document.createElement('label');
                        startDateLabel.textContent = 'Start Date:';
                        const startDateInput = document.createElement('input');
                        startDateInput.setAttribute('type', 'Date');
                        startDateInput.setAttribute('required', '');

                        const endDateLabel = document.createElement('label');
                        endDateLabel.textContent = 'End Date:';
                        const endDateInput = document.createElement('input');
                        endDateInput.setAttribute('type', 'Date');
                        endDateInput.setAttribute('required', '');

                        // Create a button to submit the form
                        const submitButton = document.createElement('button');
                        submitButton.setAttribute('type', 'submit');
                        submitButton.textContent = 'Create Contest';

                        // Inside the createContestForm.addEventListener('submit') event listener
                        createContestForm.addEventListener('submit', function (event) {
                            event.preventDefault();

                            // Retrieve contest details from the form
                            const contestName = nameInput.value;
                            const startdate = startDateInput.value;
                            const enddate = endDateInput.value;

                            // Send contest data to the server to create a new contest
                            fetch('/create-contest', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ realmName, contestName, startdate, enddate })
                            })
                                .then(response => {
                                    if (response.ok) {
                                        // Contest created successfully, reload the page
                                        window.location.reload();
                                    } else {
                                        throw new Error('Failed to Create Contest');
                                    }
                                })
                                .catch(error => {
                                    console.error(error); // Handle error
                                    // Show error message
                                });
                        });

                        // Append inputs and submit button to the form
                        createContestForm.appendChild(nameLabel);
                        createContestForm.appendChild(nameInput);
                        createContestForm.appendChild(startDateLabel);
                        createContestForm.appendChild(startDateInput);
                        createContestForm.appendChild(endDateLabel);
                        createContestForm.appendChild(endDateInput);
                        createContestForm.appendChild(submitButton);

                        // Append the form to the right-upper section
                        rightUpperDiv.appendChild(createContestForm);
                    });

                } else {
                    throw new Error(data.message || 'Failed to fetch contests');
                }
            })
            .catch(error => {
                console.error(error); // Handle error
                // Show error message
            });
    }

    // Add event listener to dropdown buttons to display contests when clicked
    dropdownContainer.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('dropdown-btn')) {
            const realmName = event.target.textContent;
            displayContests(realmName);
        }
    });

    function deleteRealm(realmName) {
        fetch('/delete-realm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ realmName })
        })
            .then(response => {
                if (response.ok) {
                    // Realm deleted successfully, refresh the page
                    window.location.reload();
                } else {
                    throw new Error('Failed to delete realm');
                }
            })
            .catch(error => {
                console.error(error); // Handle error
                // Show error message
            });
    }


    function clearRightUpper() {
        rightUpperDiv.innerHTML = '';
    }


    // Inside the createProblemForm function
    function createProblemForm(container, realmName, contestName) {

        console.log('Realm Name:', realmName);
        console.log('Contest Name:', contestName);
        // Clear the container first
        container.innerHTML = '';

        // Create the form element
        const problemForm = document.createElement('form');
        problemForm.classList.add('problem-form');

        // Create inputs for problem details
        const problemInputs = [
            'text',
            'difficulty',
            { name: 'QuestionScore', type: 'number' }, // Specify type as 'number' for numeric input
            'QuestionId',
            'QuestionInputFormat',
            'QuestionOutputFormat',
            'QuestionTestInput01',
            'QuestionTestInput02',
            'QuestionTestInput03',
            'QuestionTestOutput01',
            'QuestionTestOutput02',
            'QuestionTestOutput03',
            'QuestionTitle',
            'runMemoryLimit',
            { name: 'runTimeout', type: 'number' } // Specify type as 'number' for numeric input
        ];

        problemInputs.forEach(input => {
            const label = document.createElement('label');
            label.textContent = input.name ? input.name + ':' : input + ':';
            const inputElement = document.createElement('input');
            inputElement.setAttribute('type', input.type || 'text'); // Set input type
            inputElement.setAttribute('placeholder', 'Enter ' + (input.name || input));
            inputElement.setAttribute('required', '');
            inputElement.setAttribute('name', input.name || input);
            problemForm.appendChild(label);
            problemForm.appendChild(inputElement);
        });

        // Create a submit button
        const submitButton = document.createElement('button');
        submitButton.setAttribute('type', 'submit');
        submitButton.textContent = 'Submit';

        // Add event listener to form submission
        problemForm.addEventListener('submit', function (event) {
            event.preventDefault();

            // Retrieve problem details from the form
            const formData = new FormData(problemForm);
            const problemDetails = {};
            for (let [key, value] of formData.entries()) {
                problemDetails[key] = value;
            }

            // Send problem data to the server to create a new problem
            fetch('/create-problem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(problemDetails)
            })
                .then(response => {
                    if (response.ok) {

                        return response.json();
                    } else {
                        throw new Error('Failed to create problem');
                    }
                })
                .then(createdProblem => {
                    // Update contest and realm with the newly created problem's ID
                    updateContestAndRealm(createdProblem, realmName, contestName);

                })
                .catch(error => {
                    console.error(error); // Handle error
                    // Show error message
                });
        });

        // Append the submit button to the form
        problemForm.appendChild(submitButton);

        // Append the form to the container
        container.appendChild(problemForm);
    }


    // Inside the updateContestAndRealm function
    function updateContestAndRealm(createdProblem, realmName, contestName) {
        // Update contest with the new problem ID
        fetch('/update-contest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contestName, problemId: createdProblem._id })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update contest with problem ID');
                }
            })
            .catch(error => {
                console.error(error); // Handle error
                // Show error message
            });

        // Update realm with the new problem ID
        fetch('/update-realm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ realmName, problemId: createdProblem._id })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update realm with problem ID');
                }
            })
            .catch(error => {
                console.error(error); // Handle error
                // Show error message
            });
    }

    dropdownContainer.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('add-problem-button')) {
            // Clear the right-upper section
            clearRightUpper();

            // Get the realm name from the clicked button
            const realmName = event.target.value;

            // Create problem form with the obtained realmName
            createProblemForm(rightUpperDiv, realmName);
        }
    });




});
