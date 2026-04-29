'use server';

const BASE_URL = "http://localhost:5000";

export async function getProgramData(programId) {

    let input = {};

    // 🔥 Dynamic input per program
    if (programId === "factorial_iterative" || programId === "factorial_recursive") {
        input = { n: 5 };
    }

    else if (programId === "linear_search") {
        input = {
            n: 4,
            arr: [1, 3, 5, 7],
            target: 5
        };
    }

    else if (programId === "binary_search") {
        input = {
            n: 5,
            arr: [1, 3, 5, 7, 9],
            target: 7
        };
    }

    else if (programId === "bubble_sort") {
        input = {
            n: 5,
            arr: [5, 2, 4, 1, 3]
        };
    }
    else if (programId === "fibonacci_recursive") {
        input = { n: 6 }; // small value (important!)
    }

    const res = await fetch(`${BASE_URL}/program/${programId}/execute`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch program: ${programId}`);
    }

    return res.json();
}