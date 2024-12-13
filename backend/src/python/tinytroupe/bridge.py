#!/usr/bin/env python3

import argparse
import json
import os
import sys
from typing import Dict, List, Any
from datetime import datetime

from mock import TinyPerson, TinyWorld

def setup_config(config_json: str) -> Dict[str, Any]:
    config = json.loads(config_json)
    api_key = config.get("api_key", "").strip()
    if not api_key:
        raise ValueError("API key não fornecida ou inválida")
    
    print("[DEBUG] Configurando API key (primeiros 4 caracteres: {}...)".format(api_key[:4]), file=sys.stderr)
    os.environ["OPENAI_API_KEY"] = api_key
    return config

def create_tiny_person(persona_json: str, config: Dict[str, Any]) -> TinyPerson:
    persona = json.loads(persona_json)
    return TinyPerson(
        name=persona.get("name", "Anonymous"),
        age=persona.get("age", 30),
        occupation=persona.get("occupation", "Unknown"),
        interests=persona.get("interests", []),
        traits=persona.get("traits", []),
        skills=persona.get("skills", []),
        background=persona.get("background", ""),
        goals=persona.get("goals", [])
    )

def run_simulation(test_json: str, personas_json: str, config: Dict[str, Any]) -> Dict[str, Any]:
    """Run a simulation with the given test and personas."""
    print("[DEBUG] Iniciando simulação", file=sys.stderr)
    
    test = json.loads(test_json)
    print(f"[DEBUG] Teste carregado: {test.get('id', 'unknown')}", file=sys.stderr)
    
    personas = personas_json if isinstance(personas_json, list) else json.loads(personas_json)
    print(f"[DEBUG] {len(personas)} personas carregadas", file=sys.stderr)
    
    tiny_people = []
    results = []
    iteration_count = 0
    scenarios = test.get("scenarios", [])
    total_iterations = len(scenarios)
    
    print(f"[DEBUG] Total de cenários: {total_iterations}", file=sys.stderr)
    
    # Initialize progress tracking
    progress = {
        "status": "initializing",
        "current_iteration": 0,
        "total_iterations": total_iterations,
        "current_persona": "",
        "completed_interactions": 0,
        "total_interactions": total_iterations * len(personas)
    }
    
    print(f"[DEBUG] Progresso inicial configurado: {json.dumps(progress)}", file=sys.stderr)
    
    # Enviar progresso inicial
    print("__RESULT_START__" + json.dumps({
        "type": "test_update",
        "data": progress
    }) + "__RESULT_END__")
    sys.stdout.flush()

    # Create tiny people instances
    for persona_id in personas:
        print(f"[DEBUG] Criando TinyPerson para persona {persona_id}", file=sys.stderr)
        try:
            persona = {
                "name": f"Persona_{persona_id}",
                "age": 30,
                "occupation": "Unknown",
                "interests": [],
                "traits": [],
                "skills": [],
                "background": "",
                "goals": []
            }
            tiny_person = create_tiny_person(json.dumps(persona), config)
            tiny_people.append(tiny_person)
            print(f"[DEBUG] TinyPerson criada com sucesso: {tiny_person.name}", file=sys.stderr)
        except Exception as e:
            print(f"[ERROR] Erro ao criar TinyPerson: {str(e)}", file=sys.stderr)
            raise
    
    progress["status"] = "running"
    # socketio.emit('testProgress', {"type": "progress", "data": progress}, room=test["test_id"])
    
    # Run scenarios
    for scenario in scenarios:
        iteration_count += 1
        progress["current_iteration"] = iteration_count
        
        scenario_results = []
        for person in tiny_people:
            progress["current_persona"] = person.name
            progress["completed_interactions"] += 1
            
            try:
                result = person.interact_with_scenario(scenario)
                print(json.dumps(result))
                sys.stdout.flush()
                
                # Add to scenario results
                scenario_results.append(result)
            except Exception as e:
                error = {
                    "type": "error",
                    "data": {"error": str(e)}
                }
                print(json.dumps(error))
                sys.stdout.flush()
        
        results.append({
            "scenario": scenario,
            "responses": scenario_results
        })
    
    progress["status"] = "completed"
    final_result = {
        "results": results,
        "progress": progress
    }
    
    # Retornar resultado final
    print("__RESULT_START__" + json.dumps(final_result) + "__RESULT_END__")
    return final_result

def save_intermediate_results(test_id: str, result: Dict[str, Any]):
    """Save intermediate results to a temporary file or database."""
    results_dir = os.path.join(os.path.dirname(__file__), "temp_results")
    os.makedirs(results_dir, exist_ok=True)
    
    result_file = os.path.join(results_dir, f"test_{test_id}_results.json")
    
    try:
        # Load existing results
        if os.path.exists(result_file):
            with open(result_file, 'r') as f:
                existing_results = json.load(f)
        else:
            existing_results = {"results": []}
        
        # Append new result
        existing_results["results"].append(result)
        
        # Save updated results
        with open(result_file, 'w') as f:
            json.dump(existing_results, f)
    except Exception as e:
        print(f"Error saving intermediate results: {str(e)}", file=sys.stderr)

def format_response(response, format_type):
    """Format the response according to the specified format type."""
    if format_type == "summary":
        # Create a concise summary
        return summarize_response(response)
    elif format_type == "structured":
        # Return a structured format (e.g., JSON)
        return structure_response(response)
    else:  # "detailed"
        # Return the full detailed response
        return response

def summarize_response(response):
    """Create a concise summary of the response."""
    # Implementation of summary logic
    return response[:200] + "..." if len(response) > 200 else response

def structure_response(response):
    """Convert the response to a structured format."""
    return {
        "content": response,
        "length": len(response),
        "timestamp": datetime.now().isoformat()
    }

def generate_traits(base_persona_json: str, config: Dict[str, Any]) -> List[str]:
    base_persona = json.loads(base_persona_json)
    
    # Use TinyPerson to generate complementary traits
    person = TinyPerson(
        name=base_persona.get("name", "Anonymous"),
        age=base_persona.get("age", 30),
        occupation=base_persona.get("occupation", "Unknown")
    )
    
    # Generate additional traits based on the base persona
    return person.generate_traits()

def main():
    parser = argparse.ArgumentParser(description="TinyTroupe Bridge Script")
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

if __name__ == "__main__":
    main()
