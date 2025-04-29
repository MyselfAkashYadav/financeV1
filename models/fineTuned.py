import os
import json
import google.generativeai as genai
import openai
import time
from typing import Dict, Any, Optional, List, Union

class LLMConnector:
    """Base class for LLM connectors"""
    def __init__(self):
        self.model_name = None
        
    def generate(self, prompt: str) -> str:
        """Generate text from prompt"""
        raise NotImplementedError("Subclasses must implement this method")
    
    def generate_structured(self, prompt: str, output_schema: Dict) -> Dict:
        """Generate structured output based on schema"""
        raise NotImplementedError("Subclasses must implement this method")

class GeminiConnector(LLMConnector):
    """Connector for Google Gemini API"""
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-1.5-flash"):
        super().__init__()
        self.model_name = model
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        
        if not self.api_key:
            raise ValueError("Gemini API key not found. Please provide it or set GEMINI_API_KEY environment variable.")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(self.model_name)
        
    def generate(self, prompt: str) -> str:
        """Generate text from prompt using Gemini"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Error generating content with Gemini: {str(e)}")
            return ""
    
    def generate_structured(self, prompt: str, output_schema: Dict) -> Dict:
        """Generate structured output based on schema using Gemini"""
        schema_prompt = f"""
        {prompt}
        
        Format your response as a valid JSON object with these keys:
        {json.dumps(output_schema, indent=2)}
        
        Important: Return ONLY the JSON object, nothing else.
        """
        
        try:
            response = self.model.generate_content(schema_prompt)
            # Extract JSON from response
            text = response.text
            
            # Remove markdown code block formatting if present
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
                
            return json.loads(text)
        except Exception as e:
            print(f"Error generating structured content with Gemini: {str(e)}")
            # Return empty schema
            return {k: None for k in output_schema.keys()}

class OpenAIConnector(LLMConnector):
    """Connector for OpenAI API"""
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-3.5-turbo"):
        super().__init__()
        self.model_name = model
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        
        if not self.api_key:
            raise ValueError("OpenAI API key not found. Please provide it or set OPENAI_API_KEY environment variable.")
        
        openai.api_key = self.api_key
        
    def generate(self, prompt: str) -> str:
        """Generate text from prompt using OpenAI"""
        try:
            response = openai.ChatCompletion.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1024
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating content with OpenAI: {str(e)}")
            return ""
    
    def generate_structured(self, prompt: str, output_schema: Dict) -> Dict:
        """Generate structured output based on schema using OpenAI"""
        schema_prompt = f"""
        {prompt}
        
        Format your response as a valid JSON object with these keys:
        {json.dumps(output_schema, indent=2)}
        
        Important: Return ONLY the JSON object, nothing else.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model=self.model_name,
                messages=[{"role": "user", "content": schema_prompt}],
                temperature=0.7,
                max_tokens=1024
            )
            text = response.choices[0].message.content
            
            # Remove markdown code block formatting if present
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
                
            return json.loads(text)
        except Exception as e:
            print(f"Error generating structured content with OpenAI: {str(e)}")
            # Return empty schema
            return {k: None for k in output_schema.keys()}