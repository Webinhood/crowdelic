export interface Persona {
    name: string;
    age: number;
    occupation: string;
    interests: string[];
    traits: string[];
    skills: string[];
    background: string;
    goals: string[];
}

export interface Test {
    id: string;
    scenarios: {
        description: string;
    }[];
}

export interface SimulationResult {
    test_id: string;
    summary: {
        totalParticipants: number;
        consensusScore: number;
        keyInsights: string[];
        recommendations: string[];
    };
    interactions: {
        rounds: Array<{
            roundNumber: number;
            responses: Array<{
                personaId: string;
                response: string;
                sentiment: number;
                referencedPersonas: string[];
                keyPoints: string[];
            }>;
        }>;
    };
    individualAnalysis: Array<{
        personaId: string;
        overallSentiment: number;
        consistencyScore: number;
        uniqueContributions: string[];
    }>;
}
