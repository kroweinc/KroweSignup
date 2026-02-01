type SignupAnswer = {
    step_key: string;
    final_answer: string | null;
};

export function buildInputsFromAnswers(
    answers: SignupAnswer[]
) {
    const inputs: Record<string, string | null> = {};

    for (const answer of answers) {
        inputs[answer.step_key] = answer.final_answer ?? null;
    }

    return inputs;
}