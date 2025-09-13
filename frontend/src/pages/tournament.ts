export class TournamentPage {
    private container: HTMLDivElement;
    private participants: string[] = [];
    private readonly MAX_PARTICIPANTS = 4;

    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'tournament-container';
        this.initialize();
    }

    private initialize() {
        this.container.innerHTML = `
            <div class="tournament-page">
                <h2>Tournament Setup</h2>
                <div class="participant-form">
                    <input type="text" id="participant-input" placeholder="Enter participant username" />
                    <button id="add-participant">Add Participant</button>
                </div>
                <div class="participants-list">
                    <h3>Participants (${this.participants.length}/${this.MAX_PARTICIPANTS})</h3>
                    <ul id="participants"></ul>
                </div>
            </div>
        `;

        this.addEventListeners();
        this.updateParticipantsList();
    }

    private addEventListeners() {
        const addButton = this.container.querySelector('#add-participant');
        const input = this.container.querySelector('#participant-input') as HTMLInputElement;

        addButton?.addEventListener('click', () => {
            const username = input.value.trim();
            if (username && this.participants.length < this.MAX_PARTICIPANTS) {
                this.addParticipant(username);
                input.value = '';
            } else if (this.participants.length >= this.MAX_PARTICIPANTS) {
                alert('Tournament is full! Maximum 4 participants.');
            }
        });
    }

    private addParticipant(username: string) {
        if (!this.participants.includes(username)) {
            this.participants.push(username);
            this.updateParticipantsList();
        }
    }

    private removeParticipant(username: string) {
        const index = this.participants.indexOf(username);
        if (index > -1) {
            this.participants.splice(index, 1);
            this.updateParticipantsList();
        }
    }

    private updateParticipantsList() {
        // Mettre à jour le compteur de participants
        const participantsCounter = this.container.querySelector('h3');
        if (participantsCounter) {
            participantsCounter.textContent = `Participants (${this.participants.length}/${this.MAX_PARTICIPANTS})`;
        }

        // Mettre à jour la liste des participants
        const list = this.container.querySelector('#participants');
        if (list) {
            list.innerHTML = '';
            this.participants.forEach(username => {
                const li = document.createElement('li');
                li.className = 'participant-item';
                li.innerHTML = `
                    <span>${username}</span>
                    <button class="remove-participant">Remove</button>
                `;
                li.querySelector('.remove-participant')?.addEventListener('click', () => {
                    this.removeParticipant(username);
                });
                list.appendChild(li);
            });
        }
    }

    public getContainer(): HTMLDivElement {
        return this.container;
    }
}
