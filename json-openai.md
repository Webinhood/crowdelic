# Structured Outputs Overview with Practical Applications

Structured Outputs ensure that model responses adhere to a specified JSON Schema, enabling reliable and consistent formatting. This feature is particularly useful for applications requiring structured data exchange, validation, and integration.

## Key Benefits
- **Type-Safety**: Eliminates the need for validation or retries due to formatting issues.
- **Explicit Refusals**: Programmatically detectable refusals for safety or content restrictions.
- **Simplified Prompting**: Avoids overly complex prompts to achieve structured output.

## Supported Models
Structured Outputs are available for models like **GPT-4o-mini** (2024-07-18 and later) and **GPT-4o** (2024-08-06 and later).

---

## Practical Applications for GPT-4o-mini

### 1. **Customer Support Chatbots**
- **Scenario**: A chatbot that collects user details to create support tickets.
- **Schema**:
    ```json
    {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" },
        "issue": { "type": "string" }
      },
      "required": ["name", "email", "issue"]
    }
    ```
- **Example Input**:
    *"Hi, I'm Alex. My email is alex@example.com, and I need help with my account password."*
- **Structured Output**:
    ```json
    {
      "name": "Alex",
      "email": "alex@example.com",
      "issue": "Help with account password"
    }
    ```

---

### 2. **Calendar Event Creation**
- **Scenario**: Extract event details from user input to add to a calendar.
- **Schema**:
    ```json
    {
      "type": "object",
      "properties": {
        "event_name": { "type": "string" },
        "date": { "type": "string", "format": "date" },
        "participants": { "type": "array", "items": { "type": "string" } }
      },
      "required": ["event_name", "date", "participants"]
    }
    ```
- **Example Input**:
    *"There's a meeting called Team Sync on 2024-12-10 with Alice and Bob."*
- **Structured Output**:
    ```json
    {
      "event_name": "Team Sync",
      "date": "2024-12-10",
      "participants": ["Alice", "Bob"]
    }
    ```

---

### 3. **E-Commerce Product Filters**
- **Scenario**: Parse user preferences for product filtering in an e-commerce app.
- **Schema**:
    ```json
    {
      "type": "object",
      "properties": {
        "category": { "type": "string" },
        "price_range": { 
          "type": "object",
          "properties": {
            "min": { "type": "number" },
            "max": { "type": "number" }
          },
          "required": ["min", "max"]
        },
        "brand": { "type": "string" }
      },
      "required": ["category", "price_range"]
    }
    ```
- **Example Input**:
    *"I want a smartphone under $800 from Samsung."*
- **Structured Output**:
    ```json
    {
      "category": "smartphone",
      "price_range": { "min": 0, "max": 800 },
      "brand": "Samsung"
    }
    ```

---

### 4. **Health Monitoring System**
- **Scenario**: Collect patient symptoms and vital signs for a health report.
- **Schema**:
    ```json
    {
      "type": "object",
      "properties": {
        "patient_name": { "type": "string" },
        "symptoms": { "type": "array", "items": { "type": "string" } },
        "vitals": {
          "type": "object",
          "properties": {
            "temperature": { "type": "number" },
            "blood_pressure": { "type": "string" }
          },
          "required": ["temperature", "blood_pressure"]
        }
      },
      "required": ["patient_name", "symptoms", "vitals"]
    }
    ```
- **Example Input**:
    *"John has a fever and cough. His temperature is 38.5°C and blood pressure is 120/80."*
- **Structured Output**:
    ```json
    {
      "patient_name": "John",
      "symptoms": ["fever", "cough"],
      "vitals": {
        "temperature": 38.5,
        "blood_pressure": "120/80"
      }
    }
    ```

---

## Best Practices
1. **Edge Case Handling**: Define fallbacks for invalid or incomplete inputs.
2. **Avoid Schema Divergence**: Use tools like Pydantic (Python) or Zod (JavaScript) for consistent schema definitions.
3. **Use Explicit Prompts**: Include clear instructions for generating structured data.

## Resources
- [Structured Outputs Cookbook](https://example.com)
- [Prompt Engineering Guide](https://example.com)
