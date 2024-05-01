function filterQuestions(difficulty) {
    let questionCardsContainer = document.querySelector('.dropdown-container');
    let questionCards = document.querySelectorAll('.questionCard');
    let filteredCards = [];
    
    questionCards.forEach(card => {
        if (difficulty === 'all' || card.dataset.difficulty === difficulty) {
            filteredCards.push(card);
            card.style.visibility = 'visible'; // Show the card
        } else {
            card.style.visibility = 'hidden'; // Hide the card
        }
    });

    // Move filtered cards to the top of the container
    filteredCards.forEach(card => {
        questionCardsContainer.prepend(card);
    });
}

async function fetchRandomQuestionByDifficulty(difficulty) {
    try {
        const response = await fetch(`/randomquestion/${difficulty}`);
        const randomQuestion = await response.json();
        return randomQuestion;
    } catch (error) {
        console.error(`Error fetching random ${difficulty} question`, error);
        return null;
    }
}
async function updateQuestionInDown1(difficulty) {
    try {
        // Fetch random question title and ID
        const response = await fetch(`/randomquestion/${difficulty}`);
        const randomQuestion = await response.json();

        if (randomQuestion && randomQuestion.QuestionTitle && randomQuestion.QuestionId) {
            const down1Divs = document.querySelectorAll(`[data-difficulty="${difficulty}"] .QuestionDown .Down1`);
            down1Divs.forEach(div => {
                // Update the question title
                div.innerHTML = `<p>${randomQuestion.QuestionTitle}</p>`;

                // Store the question ID as a data attribute
                div.dataset.questionId = randomQuestion.QuestionId;

                // Attach a click event listener to redirect to the question ID route
                div.addEventListener('click', () => {
                    const questionId = div.dataset.questionId;
                    window.location.href = `/RCET/practice/${questionId}`;
                });

                // Log the question ID to the console
                console.log(`Question ID: ${randomQuestion.QuestionId}`);
            });
        } else {
            console.error(`No ${difficulty} question found`);
        }
    } catch (error) {
        console.error(`Error updating ${difficulty} question in Down1`, error);
    }
}



// Call the function for each difficulty level
updateQuestionInDown1('easy');
updateQuestionInDown1('medium');
updateQuestionInDown1('hard');


// JavaScript
// Bookmarking
document.querySelectorAll('.iconFire').forEach(icon => {
    icon.addEventListener('click', async () => {
        const questionCard = icon.closest('.questionCard');
        const questionText = questionCard.querySelector('.QuestionDown .Down1 p').innerText;
        const difficulty = questionCard.dataset.difficulty;
        const bookmarkContent = document.querySelector('.bookmarkContent');

        // Check if the question is already bookmarked
        const existingBookmark = [...bookmarkContent.querySelectorAll('.bookmarkedQuestion')]
            .find(bookmark => bookmark.dataset.question === questionText);

        if (existingBookmark) {
            // If already bookmarked, remove from display and delete from database
            bookmarkContent.removeChild(existingBookmark);
            await deleteBookmarkFromDatabase(questionText);
            console.log('Bookmark removed successfully');
        } else {
            // If not bookmarked, add to display and database
            const bookmarkedQuestionDiv = createBookmarkElement(questionText, difficulty);
            bookmarkContent.appendChild(bookmarkedQuestionDiv);
            await addBookmarkToDatabase(questionText, difficulty);
            console.log('Bookmark added successfully');
        }
    });
});

async function addBookmarkToDatabase(questionText, difficulty) {
    // Send a POST request to the server to add the bookmark
    try {
        const response = await fetch('/bookmark', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questionText, difficulty })
        });
        if (!response.ok) {
            throw new Error('Failed to add bookmark');
        }
    } catch (error) {
        console.error('Error adding bookmark:', error);
    }
}

async function deleteBookmarkFromDatabase(questionText) {
    // Send a DELETE request to the server to remove the bookmark
    try {
        const response = await fetch('/bookmark', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questionText })
        });
        if (!response.ok) {
            throw new Error('Failed to delete bookmark');
        }
    } catch (error) {
        console.error('Error deleting bookmark:', error);
    }
}

function createBookmarkElement(questionText, difficulty) {
    // Create a new div to represent the bookmarked question
    const bookmarkedQuestionDiv = document.createElement('div');
    bookmarkedQuestionDiv.classList.add('bookmarkedQuestion'); // Apply CSS class
    bookmarkedQuestionDiv.dataset.question = questionText;

    // Create level span with appropriate color based on difficulty
    const levelSpan = document.createElement('span');
    levelSpan.classList.add('level');
    levelSpan.textContent = `LEVEL ${difficulty.toUpperCase()}`;
    if (difficulty === 'easy') {
        levelSpan.style.color = 'green'; // Easy level color
    } else if (difficulty === 'medium') {
        levelSpan.style.color = 'yellow'; // Medium level color
    } else if (difficulty === 'hard') {
        levelSpan.style.color = 'red'; // Hard level color
    }

    // Append level span and question text to the bookmarked question div
    bookmarkedQuestionDiv.appendChild(levelSpan);
    bookmarkedQuestionDiv.appendChild(document.createTextNode(questionText));

    return bookmarkedQuestionDiv;
}

function redirectToPage() {
    // Logic to get the question ID and redirect to the corresponding path
    const questionID = "getQuestionIDLogicHere"; // Replace with your logic to get the question ID
    window.location.href = `/RCET/practice/${questionID}`;
}

document.addEventListener("DOMContentLoaded", function() {
    var preElements = document.querySelectorAll(".questioninfo pre");

    preElements.forEach(function(preElement) {
        if (preElement.textContent.length > 300) {
            preElement.textContent = preElement.textContent.substring(0, 300) + "...";
        }
    });
});
