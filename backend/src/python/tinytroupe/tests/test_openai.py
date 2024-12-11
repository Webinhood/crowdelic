#!/usr/bin/env python3

import os
import json
from tinytroupe_mock import TinyPerson, setup_config

def test_openai_integration():
    # Test configuration
    test_config = {
        "api_key": os.environ.get("OPENAI_API_KEY")
    }
    
    if not test_config["api_key"]:
        print("Error: OPENAI_API_KEY not found in environment variables")
        return False
    
    try:
        # Setup configuration
        setup_config(json.dumps(test_config))
        
        # Create a test persona
        test_person = TinyPerson(
            name="Test User",
            age=25,
            occupation="Software Developer",
            interests=["coding", "AI", "technology"],
            traits=["curious", "analytical"],
            skills=["Python", "Problem Solving"],
            background="Experienced in software development",
            goals=["Learn new technologies", "Build useful tools"]
        )
        
        # Test listen_and_act
        print("\nTesting listen_and_act...")
        response = test_person.listen_and_act("How would you approach learning a new programming language?")
        print(f"Response: {response}")
        
        # Test generate_traits
        print("\nTesting generate_traits...")
        new_traits = test_person.generate_traits()
        print(f"Generated traits: {new_traits}")
        
        return True
        
    except Exception as e:
        print(f"Error during test: {str(e)}")
        return False

if __name__ == "__main__":
    print("Starting OpenAI integration test...")
    success = test_openai_integration()
    print(f"\nTest {'succeeded' if success else 'failed'}")
