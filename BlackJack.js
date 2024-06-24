 <script>
        class Player {
            constructor(name, password) {
                this.name = name;
                this.password = password;
                this.balance = 1000;
            }
        }

        class PlayerResult {
            constructor(name, score) {
                this.name = name;
                this.score = score;
            }
        }

        const players = JSON.parse(localStorage.getItem('players')) || [];
        let currentPlayer = null;

        document.getElementById('register-btn').addEventListener('click', () => {
            document.getElementById('register-form').classList.toggle('hidden');
            document.getElementById('login-form').classList.add('hidden');
        });

        document.getElementById('login-btn').addEventListener('click', () => {
            document.getElementById('login-form').classList.toggle('hidden');
            document.getElementById('register-form').classList.add('hidden');
        });

        document.getElementById('submit-register').addEventListener('click', () => {
            const name = document.getElementById('register-name').value;
            const password = document.getElementById('register-password').value;

            if (name && password) {
                players.push(new Player(name, password));
                localStorage.setItem('players', JSON.stringify(players));
                alert('Registro bem-sucedido!');
                document.getElementById('register-form').classList.add('hidden');
            } else {
                alert('Por favor, preencha todos os campos.');
            }
        });

        document.getElementById('submit-login').addEventListener('click', () => {
            const name = document.getElementById('login-name').value;
            const password = document.getElementById('login-password').value;

            currentPlayer = players.find(player => player.name === name && player.password === password);
            if (currentPlayer) {
                document.getElementById('login-register').classList.add('hidden');
                document.getElementById('game-interface').classList.remove('hidden');
                document.getElementById('balance-info').innerText = `Saldo: ${currentPlayer.balance}`;
            } else {
                alert('Nome ou senha incorretos!');
            }
        });

        const deck = Array.from({ length: 52 }, (_, i) => (i % 13) + 1);
        let playerHand = [];
        let dealerHand = [];
        let betAmount = 0;

        function random_number(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function calculate_hand_value(hand) {
            let value = 0;
            let num_aces = 0;

            for (let card of hand) {
                if (card === 1) {
                    num_aces++;
                    value += 11;
                } else if (card > 10) {
                    value += 10;
                } else {
                    value += card;
                }
            }

            while (value > 21 && num_aces > 0) {
                value -= 10;
                num_aces--;
            }

            return value;
        }

        function shuffle_deck(deck) {
            for (let i = 0; i < 52; i++) {
                let j = random_number(0, 51);
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
        }

        function inicializar_maos() {
            shuffle_deck(deck);
            playerHand = [deck[0], deck[2]];
            dealerHand = [deck[1], deck[3]];

            renderCards(playerHand, 'player-cards');
            renderCards([dealerHand[0]], 'dealer-cards');

            document.getElementById('player-hand-value').innerText = `Valor: ${calculate_hand_value(playerHand)}`;
            document.getElementById('dealer-hand-value').innerText = `Valor: ${calculate_hand_value([dealerHand[0]])}`;
        }

        function renderCards(hand, elementId) {
            const container = document.getElementById(elementId);
            container.innerHTML = '';
            hand.forEach(card => {
                const cardDiv = document.createElement('div');
                cardDiv.innerText = card;
                container.appendChild(cardDiv);
            });
        }

        document.getElementById('place-bet-btn').addEventListener('click', () => {
            betAmount = parseInt(document.getElementById('bet-amount').value, 10);

            if (betAmount > currentPlayer.balance) {
                alert('Saldo insuficiente!');
                return;
            }

            inicializar_maos();
            document.getElementById('hit-btn').classList.remove('hidden');
            document.getElementById('stand-btn').classList.remove('hidden');
            document.getElementById('place-bet-btn').classList.add('hidden');
        });

        document.getElementById('hit-btn').addEventListener('click', () => {
            playerHand.push(deck[playerHand.length + dealerHand.length]);
            renderCards(playerHand, 'player-cards');

            let playerValue = calculate_hand_value(playerHand);
            document.getElementById('player-hand-value').innerText = `Valor: ${playerValue}`;
            if (playerValue > 21) {
                document.getElementById('result').innerText = 'Você estourou 21! Você perdeu.';
                currentPlayer.balance -= betAmount;
                document.getElementById('balance-info').innerText = `Saldo: ${currentPlayer.balance}`;
                endRound();
            }
        });

        document.getElementById('stand-btn').addEventListener('click', () => {
            let playerValue = calculate_hand_value(playerHand);
            let dealerValue = calculate_hand_value(dealerHand);

            while (dealerValue < 17) {
                dealerHand.push(deck[playerHand.length + dealerHand.length]);
                dealerValue = calculate_hand_value(dealerHand);
            }

            renderCards(dealerHand, 'dealer-cards');
            document.getElementById('dealer-hand-value').innerText = `Valor: ${dealerValue}`;

            if (dealerValue > 21) {
                document.getElementById('result').innerText = 'O dealer estourou 21! Você ganhou!';
                currentPlayer.balance += betAmount;
            } else if (playerValue > dealerValue) {
                document.getElementById('result').innerText = 'Você ganhou!';
                currentPlayer.balance += betAmount;
            } else if (playerValue < dealerValue) {
                document.getElementById('result').innerText = 'Você perdeu.';
                currentPlayer.balance -= betAmount;
            } else {
                document.getElementById('result').innerText = 'Empate!';
            }

            document.getElementById('balance-info').innerText = `Saldo: ${currentPlayer.balance}`;
            endRound();
        });

        function endRound() {
            document.getElementById('hit-btn').classList.add('hidden');
            document.getElementById('stand-btn').classList.add('hidden');
            document.getElementById('place-bet-btn').classList.remove('hidden');

            updateResults();
            renderRanking();
        }

        function updateResults() {
            let results = JSON.parse(localStorage.getItem('results')) || [];
            const playerResult = new PlayerResult(currentPlayer.name, currentPlayer.balance);

            const index = results.findIndex(result => result.name === currentPlayer.name);
            if (index !== -1) {
                results[index].score = currentPlayer.balance;
            } else {
                results.push(playerResult);
            }

            localStorage.setItem('results', JSON.stringify(results));
        }

        document.getElementById('ranking-btn').addEventListener('click', () => {
            document.getElementById('game-interface').classList.add('hidden');
            document.getElementById('ranking').classList.remove('hidden');
            renderRanking();
        });

        document.getElementById('back-btn').addEventListener('click', () => {
            document.getElementById('ranking').classList.add('hidden');
            document.getElementById('game-interface').classList.remove('hidden');
        });

        function renderRanking() {
            const rankingList = document.getElementById('ranking-list');
            rankingList.innerHTML = '';

            const results = JSON.parse(localStorage.getItem('results')) || [];
            results.sort((a, b) => b.score - a.score);

            results.forEach(result => {
                const div = document.createElement('div');
                div.innerText = `${result.name}: ${result.score}`;
                rankingList.appendChild(div);
            });
        }

        document.getElementById('logout-btn').addEventListener('click', () => {
            if (confirm('Você tem certeza que quer sair?')) {
                document.getElementById('game-interface').classList.add('hidden');
                document.getElementById('login-register').classList.remove('hidden');
                currentPlayer = null;
            }
        });
    </script>
