import { Game, Move } from "./types";

export function calculateScore(
    g: Game,
    startMove: number = 0,
    endMove: number = g.moves.length
): {
    p1: number;
    p2: number;
} {
    const scores = { p1: 0, p2: 0 };
    for (let i = startMove; i < endMove; i++) {
        const move = g.moves[i];
        if (move.p1 === "cooperate" && move.p2 === "cooperate") {
            scores.p1 += 3;
            scores.p2 += 3;
        } else if (move.p1 === "defect" && move.p2 === "defect") {
            scores.p1 += 1;
            scores.p2 += 1;
        } else if (move.p1 === "defect") {
            scores.p1 += 5;
            scores.p2 += 0;
        } else {
            scores.p1 += 0;
            scores.p2 += 5;
        }
    }
    return scores;
}

interface Bot {
    makeChoice(opponentMoves: Move[], selfMoves: Move[]): Move;
}

export const botNames = [
    "alwaysCooperate",
    "alwaysDefect",
    "random",
    "titForTat",
    "joss",
    "friedman",
    "titForTwoTats",
    // "tester"
] as const;

const bots: { [id in (typeof botNames)[number]]: Bot } = {
    alwaysDefect: {
        makeChoice() {
            return "defect";
        },
    },
    alwaysCooperate: {
        makeChoice() {
            return "cooperate";
        },
    },
    random: {
        makeChoice() {
            if (Math.random() < 0.5) return "cooperate";
            return "defect";
        },
    },
    titForTat: {
        makeChoice(opponentMoves) {
            if (opponentMoves.length === 0) return "cooperate";
            return opponentMoves[opponentMoves.length - 1];
        },
    },
    joss: {
        makeChoice(opponentMoves) {
            if (opponentMoves.length === 0) return "cooperate";
            if (Math.random() < 0.1) return "defect";
            return opponentMoves[opponentMoves.length - 1];
        },
    },
    friedman: {
        makeChoice(opponentMoves) {
            if (opponentMoves.includes("defect")) return "defect";
            return "cooperate";
        },
    },
    titForTwoTats: {
        makeChoice(opponentMoves) {
            if (opponentMoves.length <= 1) return "cooperate";
            if (
                opponentMoves[opponentMoves.length - 1] === "defect" &&
                opponentMoves[opponentMoves.length - 2] === "defect"
            )
                return "defect";
            return "cooperate";
        },
    },
    // tester: {
    //     makeChoice(opponentMoves, selfMoves) {
    //         const length = opponentMoves.length;
    //         // defect every two moves
    //         // if you defect back it splits
    //         // if you do'nt it continues to defect

    //         if ()
    //     }
    // }
};

function expand(g: Game): { p1: Move[]; p2: Move[] } {
    return { p1: g.moves.map((e) => e.p1), p2: g.moves.map((e) => e.p2) };
}

export function runGame(
    p1: (typeof botNames)[number],
    p2: (typeof botNames)[number],
    length: number
): Game {
    const game: Game = {
        moves: [],
    };
    const bot1 = bots[p1];
    const bot2 = bots[p2];
    for (let i = 0; i < length; i++) {
        const moves = expand(game);
        const bot1Move = bot1.makeChoice(moves.p2, moves.p1);
        const bot2Move = bot2.makeChoice(moves.p1, moves.p2);
        game.moves.push({
            p1: bot1Move,
            p2: bot2Move,
        });
    }
    console.log(p1, p2);
    console.log(calculateScore(game))
    return game;
}
