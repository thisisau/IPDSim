import { botNames, calculateScore, runGame } from "./bot";

const players: {
    p1: (typeof botNames)[number];
    p2: (typeof botNames)[number];
} = {
    p1: "alwaysCooperate",
    p2: "alwaysCooperate",
};

function sineEase(percent: number) {
    return -(Math.cos(Math.PI * percent) - 1) / 2;
}

function inverseSineEase(percent: number) {
    return Math.asin(2 * percent - 1) / Math.PI + 0.5;
}

const setScroll = (move: number) => {
    const grid: HTMLDivElement = document.getElementById(
        "bot-moves"
    ) as HTMLDivElement;
    grid.scrollLeft =
        grid.children[0].clientWidth * move - grid.clientWidth * .65;
};

function getEasingValue(
    start: number,
    end: number,
    target: number,
    inverse: boolean = false
) {
    if (end == target) return 1;
    const zeroBasedEnd = end - start;
    const zeroBasedTarget = target - start;
    const percent = zeroBasedTarget / zeroBasedEnd;
    const easedPercent = inverse ? inverseSineEase(percent) : sineEase(percent);
    const zeroBasedEasedNum = easedPercent * zeroBasedEnd;
    return zeroBasedEasedNum + start;
}

document.getElementById("p1")?.addEventListener("change", (e: Event) => {
    players.p1 = botNames[(e.target as HTMLSelectElement).selectedIndex];
    runSimulation();
});

document.getElementById("p2")?.addEventListener("change", (e: Event) => {
    players.p2 = botNames[(e.target as HTMLSelectElement).selectedIndex];
    runSimulation();
});

document.getElementById("game-length")?.addEventListener("blur", runSimulation);

const visualName: { [key in (typeof botNames)[number]]: string } = {
    alwaysCooperate: "Always Cooperate",
    alwaysDefect: "Always Defect",
    random: "Random",
    titForTat: "Tit for Tat",
    joss: "Joss",
    friedman: "Friedman",
    titForTwoTats: "Tit for Two Tats",
};

function runSimulation() {
    let currentMove = 0;
    const revealMove = (
        mode: "reveal" | "hide" | "toggle",
        location: { move: number; player: 0 | 1 }
    ) => {
        const botMoves = document.getElementById("bot-moves")!;
        const classList =
            botMoves.children[location.move].children[location.player + 1]
                .classList;
        switch (mode) {
            case "reveal":
                classList.add("revealed");
                break;
            case "hide":
                classList.remove("revealed");
                break;
            case "toggle":
                classList.toggle("revealed");
                break;
        }

        const score = { p1: 0, p2: 0 };
        for (let i = 0; i < gameResults.moves.length; i++) {
            if (
                botMoves.children[i].children[1].classList.contains(
                    "revealed"
                ) &&
                botMoves.children[i].children[2].classList.contains("revealed")
            ) {
                const thisMoveScore = calculateScore(gameResults, i, i + 1);
                score.p1 += thisMoveScore.p1;
                score.p2 += thisMoveScore.p2;
            }
        }

        document.getElementById("bot-scores")!.children[1].textContent =
            "" + score.p1;
        document.getElementById("bot-scores")!.children[2].textContent =
            "" + score.p2;
    };
    const revealMoves = (end: number, totalMs: number) => {
        const thisMove = currentMove;
        for (let i = thisMove; i < Math.min(end, gameResults.moves.length); i++) {
            setTimeout(() => {
                getEasingValue(thisMove, end, i);
                revealMove("reveal", { move: i, player: 0 });
                revealMove("reveal", { move: i, player: 1 });
            }, totalMs * inverseSineEase((i - thisMove) / (end - thisMove)));
        }

        // for (let i = 1; i <= 120; i++) {
        //     setTimeout(() => {
        //         setScroll(((end - thisMove) * sineEase(i / 120)) + thisMove)
        //     }, totalMs * i / 120)
        // }
        setTimeout(() => setScroll(end), totalMs / 3);
        currentMove = end;
    };
    document.getElementById("game-table")!.innerHTML = `
    <div id="bot-names">
        <div>Name</div>
        <div></div>
        <div></div>
    </div>
    <div id="bot-scores">
        <div>Score</div>
        <div></div>
        <div></div>
    </div>
    <div id="bot-moves">

    </div>`;
    const gameLength = (
        document.getElementById("game-length") as HTMLInputElement
    ).value;
    const gameResults = runGame(players.p1, players.p2, Number(gameLength));
    console.log(gameResults);

    const movesTable = document.getElementById("bot-moves")!;

    {
        const names = document.getElementById("bot-names")!;
        const p1Cell = names.children[1];
        const p2Cell = names.children[2];
        p1Cell.textContent = visualName[players.p1];
        p2Cell.textContent = visualName[players.p2];
    }

    {
        const scores = document.getElementById("bot-scores")!;
        const p1Cell = scores.children[1];
        const p2Cell = scores.children[2];
        p1Cell.textContent = "0";
        p2Cell.textContent = "0";
    }

    for (let i = 0; i < gameResults.moves.length; i++) {
        const row = document.createElement("div");
        const thisMove = gameResults.moves[i];
        const moveNumber = document.createElement("div");
        const p1Cell = document.createElement("div");
        const p2Cell = document.createElement("div");
        moveNumber.classList.add("move-number");
        moveNumber.textContent = "" + (i + 1);
        moveNumber.onclick = () => setScroll(i);
        p1Cell.classList.add(
            "game-choice",
            thisMove.p1 === "cooperate" ? "cooperate" : "defect"
        );
        p2Cell.classList.add(
            "game-choice",
            thisMove.p2 === "cooperate" ? "cooperate" : "defect"
        );
        p1Cell.appendChild(document.createElement("div"));
        p2Cell.appendChild(document.createElement("div"));
        p1Cell.children[0].addEventListener("click", () =>
            revealMove("toggle", { move: i, player: 0 })
        );
        p2Cell.children[0].addEventListener("click", () =>
            revealMove("toggle", { move: i, player: 1 })
        );
        row.appendChild(moveNumber);
        row.appendChild(p1Cell);
        row.appendChild(p2Cell);
        movesTable.appendChild(row);
    }

    document.getElementById("reveal-all")!.onclick = () => {
        revealMoves(gameResults.moves.length, 1000);
    };

    document.getElementById("reveal-one")!.onclick = () => {
        revealMoves(currentMove + 1, 200);
    };

    document.getElementById("reveal-many")!.onclick = () => {
        const numToReveal = Number(
            (document.getElementById("move-reveal-count") as HTMLInputElement)
                .value
        );
        revealMoves(currentMove + numToReveal, 1000);
    };

    document.getElementById("hide-all")!.onclick = () => {
        for (let i = 0; i < gameResults.moves.length; i++) {
            revealMove("hide", {
                move: i,
                player: 0,
            });
            revealMove("hide", {
                move: i,
                player: 1,
            });
        }
        currentMove = 0;
        setScroll(0);
    };

    document.getElementById("hide-last")!.onclick = () => {
        revealMove("hide", {
            move: currentMove - 1,
            player: 0
        })
        revealMove("hide", {
            move: currentMove - 1,
            player: 1
        })
        setScroll(currentMove - 1);
        currentMove--;
    }

    document.getElementById("reveal-until")!.onclick = () => {
        const getCurrentState = (move: number) => {
            if (move === 0) move++;
            const lastMove = gameResults.moves[move - 1];
            if (lastMove.p1 === "cooperate" && lastMove.p2 === "cooperate") return 0;
            if (lastMove.p1 !== lastMove.p2) return 1;
            return 2;
        };

        const currentState = getCurrentState(currentMove);
        let move = currentMove + 1;
        for (; move < gameResults.moves.length; move++) {
            if (getCurrentState(move) != currentState) break;
        }

        revealMoves(move, 1000)
    }
}

runSimulation();

document.getElementById("rerun")?.addEventListener("click", runSimulation);


document
    .getElementById("move-reveal-count")
    ?.addEventListener("click", (e) => e.stopPropagation());
