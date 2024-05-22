export type Move = "cooperate" | "defect";

export type Game = {
    moves: {
        p1: Move,
        p2: Move
    }[]
};
