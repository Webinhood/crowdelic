import json
import os
from typing import Dict, List, Any
import openai
from datetime import datetime

class TinyPerson:
    def __init__(self, name: str, age: int, occupation: str, interests: List[str] = None,
                 traits: List[str] = None, skills: List[str] = None,
                 background: str = "", goals: List[str] = None):
        self.name = name
        self.age = age
        self.occupation = occupation
        self.interests = interests or []
        self.traits = traits or []
        self.skills = skills or []
        self.background = background
        self.goals = goals or []

    def listen_and_act(self, message: str) -> str:
        client = openai.OpenAI()
        prompt = f"""
        You are {self.name}, a {self.age}-year-old {self.occupation}.
        Your interests are: {', '.join(self.interests)}
        Your traits are: {', '.join(self.traits)}
        Your skills are: {', '.join(self.skills)}
        Your background: {self.background}
        Your goals are: {', '.join(self.goals)}

        Given this scenario: {message}
        
        How would you respond? Please provide your thoughts and reactions in character.
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=4000
        )
        
        return response.choices[0].message.content

    def generate_traits(self) -> List[str]:
        client = openai.OpenAI()
        prompt = f"""
        Given a person with the following characteristics:
        - Name: {self.name}
        - Age: {self.age}
        - Occupation: {self.occupation}
        - Current traits: {', '.join(self.traits)}

        Generate 5 additional personality traits that would be realistic and complementary 
        to their existing characteristics. Return only the traits as a comma-separated list.
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100
        )
        
        traits = response.choices[0].message.content.split(',')
        return [trait.strip() for trait in traits]

    def interact_with_scenario(self, scenario: Dict[str, Any]) -> Dict[str, Any]:
        """Interact with a given scenario and return the response."""
        # Extract scenario details
        description = scenario.get("description", "")
        steps = scenario.get("steps", [])
        
        # Generate response using OpenAI
        client = openai.OpenAI()
        prompt = f"""
        You are {self.name}, a {self.age}-year-old {self.occupation}.
        Your interests are: {', '.join(self.interests)}
        Your traits are: {', '.join(self.traits)}
        Your skills are: {', '.join(self.skills)}
        Your background: {self.background}
        Your goals are: {', '.join(self.goals)}

        Given this scenario:
        {description}

        Steps:
        {chr(10).join(f'- {step}' for step in steps)}

        Please provide your response in the following format:
        1. Your direct response to the scenario
        2. A list of key points from your response
        3. Any personas you are referencing in your response
        4. Relevant tags or topics from your response

        Make sure to stay in character and consider your personality traits and background.
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000
        )
        
        raw_response = response.choices[0].message.content
        
        # Analisar a resposta para extrair metadados
        try:
            # Tentar extrair partes da resposta formatada
            parts = raw_response.split("\n\n")
            main_response = parts[0].strip()
            key_points = []
            referenced_personas = []
            tags = []
            
            for part in parts[1:]:
                if "key points" in part.lower():
                    key_points = [point.strip("- ").strip() for point in part.split("\n")[1:] if point.strip()]
                elif "personas" in part.lower():
                    referenced_personas = [persona.strip("- ").strip() for persona in part.split("\n")[1:] if persona.strip()]
                elif "tags" in part.lower() or "topics" in part.lower():
                    tags = [tag.strip("- ").strip() for tag in part.split("\n")[1:] if tag.strip()]
        except Exception as e:
            print(f"Error parsing response: {str(e)}")
            main_response = raw_response
            key_points = []
            referenced_personas = []
            tags = []
        
        # Calcular sentimento
        sentiment = self._analyze_sentiment(main_response)
        
        return {
            "type": "message",
            "content": main_response,
            "personaId": self.name,
            "personaName": self.name,
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "sentiment": sentiment,
                "keyPoints": key_points,
                "referencedPersonas": referenced_personas,
                "tags": tags
            }
        }
        
    def _analyze_sentiment(self, text: str) -> float:
        """Simple sentiment analysis based on keyword matching."""
        positive_words = ['great', 'excellent', 'good', 'like', 'love', 'useful', 
                         'helpful', 'amazing', 'fantastic', 'positive']
        negative_words = ['bad', 'poor', 'dislike', 'hate', 'useless', 
                         'unhelpful', 'terrible', 'negative', 'awful', 'confusing']
        
        text = text.lower()
        positive_count = sum(1 for word in positive_words if word in text)
        negative_count = sum(1 for word in negative_words if word in text)
        
        if positive_count == 0 and negative_count == 0:
            return 0.0  # neutral
            
        total = positive_count + negative_count
        sentiment = (positive_count - negative_count) / total
        return max(-1.0, min(1.0, sentiment))  # normalize to [-1.0, 1.0]

class TinyWorld:
    def __init__(self):
        self.people = []

    def add_person(self, person: TinyPerson):
        self.people.append(person)

def setup_config(config_json: str) -> Dict[str, Any]:
    config = json.loads(config_json)
    os.environ["OPENAI_API_KEY"] = config["api_key"]
    return config

def create_tiny_person(persona_json: str, config: Dict[str, Any]) -> Dict[str, Any]:
    persona = json.loads(persona_json)
    person = TinyPerson(
        name=persona.get("name", "Anonymous"),
        age=persona.get("age", 30),
        occupation=persona.get("occupation", "Unknown"),
        interests=persona.get("interests", []),
        traits=persona.get("traits", []),
        skills=persona.get("skills", []),
        background=persona.get("background", ""),
        goals=persona.get("goals", [])
    )
    return {
        "name": person.name,
        "age": person.age,
        "occupation": person.occupation,
        "interests": person.interests,
        "traits": person.traits,
        "skills": person.skills,
        "background": person.background,
        "goals": person.goals
    }

def generate_traits(base_persona_json: str, config: Dict[str, Any]) -> List[str]:
    base_persona = json.loads(base_persona_json)
    person = TinyPerson(
        name=base_persona.get("name", "Anonymous"),
        age=base_persona.get("age", 30),
        occupation=base_persona.get("occupation", "Unknown"),
        traits=base_persona.get("traits", [])
    )
    return person.generate_traits()

def run_simulation(test_json: str, personas_json: str, config: Dict[str, Any]) -> Dict[str, Any]:
    test = json.loads(test_json)
    personas = json.loads(personas_json)
    
    world = TinyWorld()
    results = []
    
    for persona_data in personas:
        person = TinyPerson(
            name=persona_data.get("name", "Anonymous"),
            age=persona_data.get("age", 30),
            occupation=persona_data.get("occupation", "Unknown"),
            interests=persona_data.get("interests", []),
            traits=persona_data.get("traits", []),
            skills=persona_data.get("skills", []),
            background=persona_data.get("background", ""),
            goals=persona_data.get("goals", [])
        )
        world.add_person(person)
        
        for scenario in test.get("scenarios", []):
            result = person.interact_with_scenario(scenario)
            results.append(result)
            # Imprimir a mensagem para o Node.js capturar
            print(json.dumps(result))
            import sys
            sys.stdout.flush()
    
    return {
        "test_id": test.get("id"),
        "results": results
    }

if __name__ == "__main__":
    import argparse
    import sys

    parser = argparse.ArgumentParser(description="TinyTroupe Mock Implementation")
    parser.add_argument("--test", type=str, help="Test JSON")
    parser.add_argument("--personas", type=str, help="Personas JSON")
    parser.add_argument("--generate-traits", action="store_true", help="Generate traits mode")
    parser.add_argument("--base-persona", type=str, help="Base persona for trait generation")
    parser.add_argument("--create-person", action="store_true", help="Create person mode")
    parser.add_argument("--persona", type=str, help="Persona JSON for creation")
    parser.add_argument("--config", type=str, required=True, help="Configuration JSON")
    
    args = parser.parse_args()
    config = setup_config(args.config)
    
    try:
        if args.test and args.personas:
            result = run_simulation(args.test, args.personas, config)
        elif args.generate_traits and args.base_persona:
            result = generate_traits(args.base_persona, config)
        elif args.create_person and args.persona:
            result = create_tiny_person(args.persona, config)
        else:
            raise ValueError("Invalid combination of arguments")
        
        print(json.dumps(result))
        sys.exit(0)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
