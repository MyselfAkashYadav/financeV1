import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import GridSearchCV
import joblib
from ..common.llm_connector import GeminiConnector

class TransactionCategorizer:
    def __init__(self, use_llm_fallback=True):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=5000,
            min_df=5
        )
        self.classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=20,
            n_jobs=-1,
            class_weight='balanced'
        )
        self.model_pipeline = None
        self.category_mapping = None
        self.confidence_threshold = 0.6
        self.use_llm_fallback = use_llm_fallback
        self.llm_connector = GeminiConnector() if use_llm_fallback else None
        self.categories = [
            "housing", "transportation", "groceries", "utilities", 
            "entertainment", "food", "shopping", "healthcare", "education",
            "personal", "travel", "insurance", "gifts", "bills"
        ]
        
    def train(self, X_train, y_train):
        """Train the transaction categorization model"""
        # Create category mapping
        self.category_mapping = {i: cat for i, cat in enumerate(np.unique(y_train))}
        self.inverse_mapping = {v: k for k, v in self.category_mapping.items()}
        
        # Set up training pipeline
        self.model_pipeline = Pipeline([
            ('vectorizer', self.vectorizer),
            ('classifier', self.classifier)
        ])
        
        # Train the model
        self.model_pipeline.fit(X_train, y_train)
        return self
    
    def optimize_hyperparameters(self, X_train, y_train, cv=5):
        """Optimize model hyperparameters using grid search"""
        param_grid = {
            'vectorizer__max_features': [3000, 5000, 10000],
            'vectorizer__ngram_range': [(1, 2), (1, 3)],
            'classifier__n_estimators': [50, 100, 200],
            'classifier__max_depth': [10, 20, 30]
        }
        
        grid = GridSearchCV(
            self.model_pipeline, 
            param_grid=param_grid,
            cv=cv,
            n_jobs=-1,
            scoring='f1_weighted'
        )
        
        grid.fit(X_train, y_train)
        self.model_pipeline = grid.best_estimator_
        print(f"Best parameters: {grid.best_params_}")
        return self
    
    def predict(self, transaction_descriptions):
        """Predict categories for transaction descriptions"""
        # Get ML model predictions and probabilities
        if not isinstance(transaction_descriptions, list):
            transaction_descriptions = [transaction_descriptions]
            
        predicted_labels = self.model_pipeline.predict(transaction_descriptions)
        predicted_probs = self.model_pipeline.predict_proba(transaction_descriptions)
        
        # For each prediction, get highest probability
        confidence_scores = np.max(predicted_probs, axis=1)
        
        results = []
        # For low confidence predictions, use LLM if enabled
        for i, (desc, label, confidence) in enumerate(zip(transaction_descriptions, predicted_labels, confidence_scores)):
            category = self.category_mapping[label] if isinstance(label, (int, np.integer)) else label
            
            # If confidence is low and LLM fallback is enabled, use LLM
            if confidence < self.confidence_threshold and self.use_llm_fallback:
                llm_category = self._get_llm_classification(desc, amount=None, date=None)
                results.append({
                    "description": desc,
                    "category": llm_category,
                    "confidence": 0.85,  # Arbitrary confidence for LLM
                    "method": "hybrid"
                })
            else:
                results.append({
                    "description": desc,
                    "category": category,
                    "confidence": float(confidence),
                    "method": "ml"
                })
                
        return results[0] if len(results) == 1 else results
    
    def _get_llm_classification(self, description, amount=None, date=None):
        """Use LLM for classification when ML model confidence is low"""
        context = f"""Transaction description: "{description}"\n"""
        if amount:
            context += f"Amount: ${amount:.2f}\n"
        if date:
            context += f"Date: {date}\n"
            
        prompt = f"""{context}
        Based on this transaction information, classify it into exactly one of these categories:
        {', '.join(self.categories)}
        
        Respond ONLY with the category name, nothing else.
        """
        
        llm_category = self.llm_connector.generate(prompt).strip().lower()
        
        # Ensure the returned category is valid
        if llm_category not in self.categories:
            # Find closest match
            return min(self.categories, key=lambda x: self._levenshtein(x, llm_category))
        return llm_category
    
    def _levenshtein(self, s1, s2):
        """Calculate the Levenshtein distance between two strings"""
        if len(s1) < len(s2):
            return self._levenshtein(s2, s1)
        if not s1:
            return len(s2)
        
        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        return previous_row[-1]
    
    def save(self, path):
        """Save the model to disk"""
        joblib.dump({
            "pipeline": self.model_pipeline,
            "category_mapping": self.category_mapping,
            "confidence_threshold": self.confidence_threshold
        }, path)
    
    @classmethod
    def load(cls, path, use_llm_fallback=True):
        """Load the model from disk"""
        model_data = joblib.load(path)
        instance = cls(use_llm_fallback=use_llm_fallback)
        instance.model_pipeline = model_data["pipeline"]
        instance.category_mapping = model_data["category_mapping"]
        instance.confidence_threshold = model_data["confidence_threshold"]
        return instance