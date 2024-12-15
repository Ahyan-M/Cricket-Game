document.addEventListener('DOMContentLoaded', () => {
    const totalBudget = 33;
    let remainingBudget = totalBudget;
    let selectedPlayers = [];
    const categories = document.querySelectorAll('.category');
    let currentCategoryIndex = 0;
    const maxSelections = [4, 1, 3, 3]; // Max selections for batsmen, wicketkeepers, all-rounders, bowlers
    let captain = null;
    let viceCaptain = null;

    const remainingBudgetElement = document.getElementById('remaining-budget');
    const selectedList = document.getElementById('selected-list');
    const playAgainButton = document.getElementById('play-again');
    const selectionContainer = document.getElementById('selection-container');
    const finalScreen = document.getElementById('final-screen');

    function updateRemainingBudget() {
        remainingBudgetElement.textContent = `Remaining Budget: $${remainingBudget}`;
    }

    function showCategory(index) {
        categories.forEach((category, i) => {
            category.style.display = i === index ? 'block' : 'none';
        });
    }

    function moveToNextCategory() {
        if (currentCategoryIndex + 1 < categories.length) {
            currentCategoryIndex++;
            showCategory(currentCategoryIndex);
        } else {
            showFinalScreen();
        }
    }

    function getSelectedCount(category) {
        return category.querySelectorAll('.player.selected').length;
    }

    function updateSelectedList() {
        selectedList.innerHTML = selectedPlayers.map((player, index) => 
            `<li>${index + 1}. ${player.querySelector('.player-name').textContent}</li>`
        ).join('');
    }

    function showFinalScreen() {
        // Hide the main content
        document.body.innerHTML = '';

        // Create and append the final screen
        const finalScreenHTML = `
            <div id="final-screen" class="final-screen">
                <h2>Your Selected Team</h2>
                <div class="final-content">
                    <ul id="final-selected-list"></ul>
                    <div class="captain-selection">
                        <h3>Select Captain and Vice Captain</h3>
                        <select id="captain-select">
                            <option value="">Select Captain</option>
                        </select>
                        <select id="vice-captain-select">
                            <option value="">Select Vice Captain</option>
                        </select>
                    </div>
                </div>
                <button id="play-again">Play Again</button>
            </div>
        `;
        document.body.innerHTML = finalScreenHTML;

        // Re-assign DOM elements after innerHTML change
        const finalSelectedListElement = document.getElementById('final-selected-list');
        const playAgainButton = document.getElementById('play-again');
        const captainSelect = document.getElementById('captain-select');
        const viceCaptainSelect = document.getElementById('vice-captain-select');

        updateFinalPlayerList();

        setupDragAndDrop(finalSelectedListElement);
        playAgainButton.addEventListener('click', resetGame);

        // Populate captain and vice-captain dropdowns
        selectedPlayers.forEach((player, index) => {
            const playerName = player.querySelector('.player-name').textContent;
            captainSelect.innerHTML += `<option value="${index}">${playerName}</option>`;
            viceCaptainSelect.innerHTML += `<option value="${index}">${playerName}</option>`;
        });

        captainSelect.addEventListener('change', updateCaptain);
        viceCaptainSelect.addEventListener('change', updateViceCaptain);
    }

    function updateCaptain() {
        const captainIndex = document.getElementById('captain-select').value;
        captain = captainIndex !== '' ? parseInt(captainIndex) : null;
        updateFinalPlayerList();
    }

    function updateViceCaptain() {
        const viceCaptainIndex = document.getElementById('vice-captain-select').value;
        viceCaptain = viceCaptainIndex !== '' ? parseInt(viceCaptainIndex) : null;
        updateFinalPlayerList();
    }

    function updateFinalPlayerList() {
        const finalSelectedListElement = document.getElementById('final-selected-list');
        finalSelectedListElement.innerHTML = selectedPlayers.map((player, index) => {
            const playerName = player.querySelector('.player-name').textContent;
            const playerImage = player.querySelector('.player-pic').src;
            return `
                <li draggable="true" data-index="${index}">
                    <span class="player-number">${index + 1}.</span>
                    <span class="player-name">${playerName}</span>
                    <img src="${playerImage}" alt="${playerName}" class="player-image">
                    <span class="player-role">${index === captain ? '(C)' : index === viceCaptain ? '(VC)' : ''}</span>
                </li>
            `;
        }).join('');
    }

    function setupDragAndDrop(list) {
        let draggedItem = null;

        list.addEventListener('dragstart', (e) => {
            draggedItem = e.target;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', draggedItem.innerHTML);
            draggedItem.classList.add('dragging');
        });

        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(list, e.clientY);
            const currentItem = document.querySelector('.dragging');
            if (afterElement == null) {
                list.appendChild(currentItem);
            } else {
                list.insertBefore(currentItem, afterElement);
            }
        });

        list.addEventListener('dragend', () => {
            draggedItem.classList.remove('dragging');
            updatePlayerOrder();
        });
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function updatePlayerOrder() {
        const listItems = document.querySelectorAll('#final-selected-list li');
        selectedPlayers = Array.from(listItems).map(item => {
            const playerName = item.querySelector('.player-name').textContent;
            return selectedPlayers.find(player => player.querySelector('.player-name').textContent === playerName);
        });

        // Update captain and vice-captain indices if they exist
        if (captain !== null) {
            captain = selectedPlayers.findIndex(player => player.querySelector('.player-name').textContent === listItems[captain].querySelector('.player-name').textContent);
        }
        if (viceCaptain !== null) {
            viceCaptain = selectedPlayers.findIndex(player => player.querySelector('.player-name').textContent === listItems[viceCaptain].querySelector('.player-name').textContent);
        }

        updateFinalPlayerList();
        updateCaptainDropdowns();
    }

    function resetGame() {
        window.location.reload();
    }

    function addPlayerClickListeners() {
        categories.forEach((category) => {
            const players = category.querySelectorAll('.player');
            players.forEach(player => {
                player.addEventListener('click', () => {
                    const price = parseInt(player.getAttribute('data-price'));

                    if (player.classList.contains('selected')) {
                        // Deselect player
                        player.classList.remove('selected');
                        selectedPlayers = selectedPlayers.filter(p => p !== player);
                        remainingBudget += price;
                    } else {
                        // Select player
                        if (remainingBudget >= price && getSelectedCount(category) < maxSelections[currentCategoryIndex]) {
                            player.classList.add('selected');
                            selectedPlayers.push(player);
                            remainingBudget -= price;

                            // Check if the max selection for the category is reached
                            if (getSelectedCount(category) === maxSelections[currentCategoryIndex]) {
                                moveToNextCategory();
                            }
                        } else {
                            alert('Cannot add player. Either budget is insufficient or you have reached the maximum number of selections for this category.');
                        }
                    }

                    updateRemainingBudget();
                    updateSelectedList();

                    // Check if all 11 players are selected
                    if (selectedPlayers.length === 11) {
                        showFinalScreen();
                    }
                });
            });
        });
    }

    // Initialize the game
    showCategory(currentCategoryIndex);
    updateRemainingBudget();
    addPlayerClickListeners();
});