#!/usr/bin/env python3

import json
import os
from tinytroupe_mock import TinyPerson, setup_config
from dotenv import load_dotenv

def load_environment():
    """Load environment variables from .env file"""
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), '.env')
    print(f"\nLooking for .env file at: {env_path}")
    if os.path.exists(env_path):
        print("✓ Found .env file")
        load_dotenv(env_path)
        return True
    else:
        print("❌ .env file not found")
        return False

def test_openai_integration():
    print("\n=== Testing OpenAI Integration ===")
    
    # Step 1: Load Environment
    print("\n1. Loading environment variables...")
    if not load_environment():
        print("❌ Failed to load environment variables")
        return False
    
    # Step 2: Setup Configuration
    print("\n2. Setting up configuration...")
    config = {
        "api_key": os.environ.get("OPENAI_API_KEY")
    }
    
    if not config["api_key"]:
        print("❌ Error: OPENAI_API_KEY not found in environment variables")
        return False
    
    print(f"✓ Found API key: {config['api_key'][:10]}...")
    
    try:
        # Step 3: Initialize Configuration
        print("\n3. Initializing configuration...")
        setup_config(json.dumps(config))
        print("✓ Configuration initialized")
        
        # Step 4: Create Test Persona
        print("\n4. Creating test persona...")
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
        print("✓ Test persona created")
        
        # Step 5: Test Simple Interaction
        print("\n5. Testing simple interaction...")
        scenarios = [
            "How would you approach learning a new programming language?",
            "What's your opinion on using AI in software development?"
        ]
        
        for scenario in scenarios:
            print(f"\nScenario: {scenario}")
            response = test_person.listen_and_act(scenario)
            print(f"\nResponse from AI:\n{response}")
            print("✓ Interaction completed")
        
        print("✓ All interaction tests completed")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error during test: {str(e)}")
        return False

def main():
    print("\nStarting TinyTroupe Integration Test")
    print("====================================")
    
    success = test_openai_integration()
    
    print("\n====================================")
    print(f"Test {'succeeded ✓' if success else 'failed ❌'}")

if __name__ == "__main__":
    main()
