let players = []
const playersMax = 8

let leaderscore = []


const addPlayer = (playerContainer) => {
    if (players.length >= playersMax) return

    const player = {
        name: 'player' + (players.length + 1),
        score: 0,
        pushOut: false,
        fouls: 0,
        index: players.length + 1
    }

    players.push(player)

    removeClassPrefix(playerContainer, 'players--')
    playerContainer.classList.add('players--'+players.length)

    // add DOM
    const playerDOM = document.querySelector('.player')
    const newPlayerDOM = playerDOM.cloneNode(true)
    newPlayerDOM.classList.remove('player--template')
    newPlayerDOM.setAttribute('data-player-id', players.length)
    newPlayerDOM.querySelector('.player__name__label').innerText = player.name
    newPlayerDOM.querySelector('.player__score').innerText = player.score

    document.querySelector('.players').appendChild(newPlayerDOM)

    console.log(players)
}

// function tools
const removeClassPrefix = (node, prefix) => {
    const regx = new RegExp('\\b' + prefix + '[^ ]*[ ]?\\b', 'g')
    node.className = node.className.replace(regx, '')
}

const calculateGame = (playersInGame) => {
    const allPlayer = {}
    for (let j = 0; j < playersInGame.length; j++) {
        const player = playersInGame[j]
        if (!allPlayer[player.name]) {
            allPlayer[player.name] = player.score 
        } else {
            allPlayer[player.name] += player.score
        }
    }
    let sortable = [];
    for (var playerName in allPlayer) {
        sortable.push([playerName, allPlayer[playerName]])
    }
    return sortable
        .sort((a, b) => b[1] - a[1])
        .map((player) => ({ name: player[0], score: player[1] }))
}

const generatePlayerInLeaderboard = () => {
    const allPlayer = {}
    for (let i = 0; i < leaderscore.length; i++) {
        const playersInGame = leaderscore[i]
        for (let j = 0; j < playersInGame.length; j++) {
            const player = playersInGame[j]
            if (!allPlayer[player.name]) {
                allPlayer[player.name] = 0 
            }
        }
    }
    return allPlayer
}

const calculateLeaderboard = (setEmpty=false) => {
    let playersInLeaderboard = generatePlayerInLeaderboard()
    console.log('playersInLeaderboard', playersInLeaderboard)
    if (setEmpty) {
        playersInLeaderboard = {}
        return playersInLeaderboard
    }
    for (let i = 0; i < leaderscore.length; i++) {
        const playersInGame = leaderscore[i]
        const winnerInGame = calculateGame(playersInGame)
        playersInLeaderboard[winnerInGame[0].name] += 1 
    }
    return playersInLeaderboard
}

const clearGame = (removeScore=false) => {
    if (removeScore) {
        return
    } else {
        const elPlayers = document.querySelectorAll('.player')

        elPlayers.forEach(elp => {
            elp.classList.remove('player--disqualified')
            elp.querySelector('.player__fouls').setAttribute('data-fouls', 0)
            elp.querySelectorAll('.player__foul').forEach(_ => _.classList.remove('player__foul--on'))
            elp.querySelector('[data-tool="pushout"]').setAttribute('data-pushout', 'false')
            elp.querySelector('[data-tool="pushout"]').classList.remove('player__toolbar__item--disabled')
        })
        players.forEach(player => {
            player.score = 0
            player.fouls = 0
            player.pushOut = 0
        })

        // clear the leaderboard from previous game
        calculateLeaderboard(true)
    }
}

window.onload = () => {
    
    const addPlyButton = document.querySelector('[data-config="add-player"]')
    const resetButton = document.querySelector('[data-config="reset"]')
    const nextButton = document.querySelector('[data-config="next-game"]')
    const leaderButton = document.querySelector('[data-config="leaderboard"]')
    const fullButton = document.querySelector('[data-config="fullscreen"]')

    const elPlayers = document.querySelector('.players')

    // add new player
    addPlyButton.addEventListener('click', (e) => {
        e.preventDefault()
        addPlayer(elPlayers)
        console.log('add Player')
    })


    // reset
    resetButton.addEventListener('click', () => {
        players = []
        elPlayers.querySelectorAll('.player:not(.player--template)').forEach(el => el.remove())
        leaderscore = []
    })


    // next game
    nextButton.addEventListener('click', () => {
        const result = players.map(a => ({ ...a }))
        leaderscore.push(result)

        const elPly = document.querySelectorAll('.player')
        if (elPly.length) {
            elPly.forEach(elp => {
                const pid = parseInt(elp.getAttribute('data-player-id'))

                if (pid < 1) return

                players[pid - 1].score = 0
                players[pid - 1].pushOut = false

                elp.querySelector('.player__score').innerText = 0
                clearGame(false)
            })
        }

        document.querySelector('.page').setAttribute('data-already-running', 'true')
        
    })


    // leadersboard
    const leaderPopup = document.querySelector('.leaderboard')
    if (leaderPopup !== null) {
        const leaderPopupClose = leaderPopup.querySelector('.leaderboard__container__close')

        const leaderList = document.querySelector('.leaderboard__list')
        
        leaderButton.addEventListener('click', () => {
            leaderList.innerHTML = ""
            console.log(leaderscore)
            leaderPopup.classList.add('leaderboard--open')

            console.log('players: ', players)
            const leaderboardSummary = calculateLeaderboard()
            for (const playerName in leaderboardSummary) {
                // DOM Creation
                const leaderItem = document.createElement('div')
                const leaderItemName = document.createElement('h4')
                const leaderItemScore = document.createElement('div')

                leaderItem.classList.add('leaderboard__list__item')
                leaderItemName.classList.add('leaderboard__list__name')
                leaderItemScore.classList.add('leaderboard__list__winscore')

                leaderItemName.innerText = playerName
                leaderItemScore.innerText = leaderboardSummary[playerName]

                leaderItem.appendChild(leaderItemName)
                leaderItem.appendChild(leaderItemScore)
                leaderList.appendChild(leaderItem)
            }
        })
        leaderPopupClose.addEventListener('click', () => {
            leaderPopup.classList.remove('leaderboard--open')
        })
    }


    // full screen
    const elem = document.documentElement
    fullButton.addEventListener('click', () => {
        fullButton.classList.toggle('fullscreen')
        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { /* Safari */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE11 */
                elem.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }
    })


    
    // player card listeners
    elPlayers.addEventListener('click', (e) => {
        e.preventDefault()

        let playerId = parseInt(e.target.closest('.player').getAttribute('data-player-id')) - 1

        // edit player name if the game is not running yet
        if (document.querySelector('.page').getAttribute('data-already-running') !== 'true') {
            if (e.target.matches('.player__name__edit')) {
                if (e.target.parentElement.classList.contains('player__name--editing')) {
                    if (e.target.parentElement.querySelector('input').value !== '') {
                        players[playerId].name = e.target.parentElement.querySelector('input').value
                        e.target.parentElement.querySelector('.player__name__label').innerText = players[playerId].name
                    }
                    e.target.parentElement.classList.remove('player__name--editing')
                } else {
                    e.target.parentElement.classList.add('player__name--editing')
                    e.target.parentElement.querySelector('input').focus()
                }
            }
        }

        // score
        if (e.target.matches('[data-tool="score"]')) {
            const pid = parseInt(e.target.closest('.player').getAttribute('data-player-id')) - 1
            const scoreVal = parseInt(e.target.getAttribute('data-value'))
            players[pid].score = players[pid].score + scoreVal
            console.log(players[pid].score)
            e.target.closest('.player').querySelector('.player__score').innerText = players[pid].score
        }

        // push out
        if (e.target.matches('[data-tool="pushout"]')) {
            if (e.target.classList.contains('player__toolbar__item--disabled')) return
            e.target.classList.add('player__toolbar__item--disabled')
        }

        // fouls
        if (e.target.matches('.player__fouls') || e.target.matches('.player__foul')) {
            const pid = parseInt(e.target.closest('.player').getAttribute('data-player-id'))
            players[pid - 1].fouls += 1
            e.target.setAttribute('data-fouls', players[pid - 1].fouls)
            
            e.target.querySelectorAll('.player__foul')[players[pid - 1].fouls - 1].classList.add('player__foul--on')


            if (players[pid - 1].fouls >= 3) {
                e.target.closest('.player').classList.add('player--disqualified')
                players[pid - 1].score = -9999
                return
            }
        }

        // remove
        if (e.target.matches('.player__remove')) {
            const pid = parseInt(e.target.closest('.player').getAttribute('data-player-id')) - 1
            players.splice(pid, 1)
            // re-indexing if the index of each player is not the same as the players array index + 1
            players.forEach((ply, idx) => {
                if (idx !== ply.index - 1) {
                    ply.index = idx + 1
                }
                // e.target.closest('.players').querySelector('.player[data-player-id="'+(idx+1)+"]").setAttribute('data-player-id', ply.index)
            })

            removeClassPrefix(e.target.closest('.players'), 'players--')
            e.target.closest('.players').classList.add('players--'+players.length)

            // remove element
            e.target.closest('.player').remove()
        }
        
    })


    console.log(players)



}