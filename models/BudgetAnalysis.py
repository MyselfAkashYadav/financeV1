import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from ..common.llm_connector import GeminiConnector

class BudgetLSTMModel:
    def __init__(self, config=None):
        self.config = config or {
            'sequence_length': 30,
            'lstm_units': 64,
            'dropout_rate': 0.2,
            'learning_rate': 0.001,
            'epochs': 100,
            'batch_size': 32
        }
        self.model = self._build_model()
        self.llm_connector = GeminiConnector()
        
    def _build_model(self):
        model = Sequential([
            LSTM(self.config['lstm_units'], return_sequences=True, 
                 input_shape=(self.config['sequence_length'], 1)),
            Dropout(self.config['dropout_rate']),
            LSTM(self.config['lstm_units'] // 2),
            Dropout(self.config['dropout_rate']),
            Dense(1)
        ])
        
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=self.config['learning_rate']),
            loss='mean_squared_error'
        )
        return model
    
    def train(self, X_train, y_train, X_val=None, y_val=None):
        """Train the LSTM model on historical transaction data"""
        callbacks = [
            tf.keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True),
            tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=5)
        ]
        
        validation_data = (X_val, y_val) if X_val is not None and y_val is not None else None
        
        self.model.fit(
            X_train, y_train,
            epochs=self.config['epochs'],
            batch_size=self.config['batch_size'],
            validation_data=validation_data,
            callbacks=callbacks
        )
        
    def predict(self, X):
        """Generate expense predictions for the upcoming month"""
        return self.model.predict(X)
    
    def generate_insights(self, predictions, historical_data, user_profile):
        """Generate budget insights using hybrid ML-LLM approach"""
        # First, analyze predictions with traditional statistical methods
        predicted_total = np.sum(predictions)
        historical_avg = np.mean([np.sum(historical_data[-i-30:-i]) for i in range(0, 90, 30)])
        trend_percentage = ((predicted_total - historical_avg) / historical_avg) * 100
        
        # Identify top spending categories from historical data
        spending_by_category = self._analyze_category_trends(historical_data)
        
        # Use LLM to generate personalized insights based on ML predictions
        prompt = f"""
        Based on machine learning predictions and historical data analysis:
        - Predicted total expenses next month: ${predicted_total:.2f}
        - This is {trend_percentage:.1f}% {'higher' if trend_percentage > 0 else 'lower'} than your 3-month average
        - Top spending categories: {', '.join(spending_by_category[:3])}
        
        The user's income is ${user_profile['income']:.2f} with a target savings rate of {user_profile['target_savings_rate']}%.
        
        Generate 3 specific and actionable budget insights focused on helping the user maintain or improve their financial health.
        Format the response as JSON with keys: "insights" (array of 3 strings), "alert_level" (string: "low", "medium", "high")
        """
        
        llm_insights = self.llm_connector.generate(prompt)
        return {
            "ml_predictions": {
                "next_month_total": predicted_total,
                "trend_percentage": trend_percentage,
                "top_categories": spending_by_category[:5]
            },
            "personalized_insights": llm_insights
        }
    
    def _analyze_category_trends(self, historical_data):
        """Analyze spending trends by category (simplified for example)"""
        # This would contain actual analysis logic
        return ["food", "utilities", "entertainment", "transportation", "shopping"]