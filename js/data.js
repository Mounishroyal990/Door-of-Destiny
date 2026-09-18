const LEVELS = [
    {
        id: 1,
        mgTime: 15,
        pool: [
            {
                question: "What is the capital of Australia?",
                answer: "canberra",
                clues: ["Not Sydney", "Starts with C"]
            },
            {
                question: "What is the largest ocean on Earth?",
                answer: "pacific",
                clues: ["Starts with P", "Ends with C"]
            },
            {
                question: "Which planet is known as the Red Planet?",
                answer: "mars",
                clues: ["4th planet from the Sun", "Named after the Roman god of war"]
            }
        ]
    },
    {
        id: 2,
        mgTime: 20,
        pool: [
            {
                question: "What is the largest mammal in the world?",
                answer: "blue whale",
                clues: ["It lives in the ocean", "Has 'blue' in its name"]
            },
            {
                question: "Who painted the Mona Lisa?",
                answer: "leonardo da vinci",
                clues: ["Italian Renaissance polymath", "Also painted The Last Supper"]
            }
        ]
    },
    {
        id: 3,
        mgTime: 20,
        pool: [
            {
                question: "What is the chemical symbol for Gold?",
                answer: "au",
                clues: ["Two letters", "From the Latin word 'aurum'"]
            },
            {
                question: "What is the hardest natural substance on Earth?",
                answer: "diamond",
                clues: ["Made of carbon", "Used in jewelry"]
            }
        ]
    },
    {
        id: 4,
        mgTime: 25,
        pool: [
            {
                question: "In what year did the Titanic sink?",
                answer: "1912",
                clues: ["Early 20th century", "Before World War I"]
            },
            {
                question: "What is the longest river in the world?",
                answer: "nile",
                clues: ["Located in Africa", "Flows through Egypt"]
            }
        ]
    },
    {
        id: 5,
        mgTime: 30,
        pool: [
            {
                question: "How many bones are in the adult human body?",
                answer: "206",
                clues: ["More than 200", "Less than 210"]
            },
            {
                question: "Who wrote 'Romeo and Juliet'?",
                answer: "william shakespeare",
                clues: ["English playwright", "The Bard of Avon"]
            }
        ]
    }
];

const MINI_GAMES = [
    'math',
    'word_search',
    'sliding_puzzle',
    'memory'
];
