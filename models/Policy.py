import numpy as np
import pandas as pd
import scipy.optimize as sco
from sklearn.cluster import KMeans
from ..common.llm_connector import GeminiConnector

class PortfolioOptimizer:
    def __init__(self):
        self.llm_connector = GeminiConnector()
        self.risk_profiles = {
            "conservative": {"stocks": (0.2, 0.3), "bonds": (0.5, 0.7), "cash": (0.1, 0.3)},
            "moderate": {"stocks": (0.4, 0.6), "bonds": (0.3, 0.5), "cash": (0.05, 0.15)},
            "aggressive": {"stocks": (0.7, 0.9), "bonds": (0.1, 0.3), "cash": (0.0, 0.1)}
        }
        
    def determine_risk_profile(self, user_data):
        """Determine user's risk profile based on financial data and questionnaire"""
        # Extract relevant features
        age = user_data.get("age", 35)
        income = user_data.get("income", 50000)
        assets = user_data.get("assets", 50000)
        debt = user_data.get("debt", 30000)
        dependents = user_data.get("dependents", 0)
        time_horizon = user_data.get("investmentTimeHorizon", "5-10 years")
        
        # Convert time horizon to years
        if time_horizon == "0-2 years":
            time_years = 1
        elif time_horizon == "2-5 years":
            time_years = 3.5
        elif time_horizon == "5-10 years":
            time_years = 7.5
        else:  # 10+ years
            time_years = 15
        
        # Calculate risk score components
        age_factor = max(0, min(100, (65 - age) * 2)) / 100  # Higher for younger
        income_stability = min(1, income / 100000)  # Higher for higher income
        debt_ratio = max(0, 1 - min(1, debt / (assets + 1)))  # Higher for lower debt
        dependent_factor = max(0, 1 - (dependents * 0.15))  # Higher for fewer dependents
        time_factor = min(1, time_years / 10)  # Higher for longer time horizons
        
        # Weighted risk score calculation
        risk_score = (
            age_factor * 0.3 +
            income_stability * 0.2 +
            debt_ratio * 0.2 +
            dependent_factor * 0.1 +
            time_factor * 0.2
        )
        
        # Map score to profile
        if risk_score < 0.4:
            return "conservative"
        elif risk_score < 0.7:
            return "moderate"
        else:
            return "aggressive"
    
    def optimize_portfolio(self, risk_profile, expected_returns, cov_matrix, assets):
        """Optimize portfolio allocation using Modern Portfolio Theory"""
        num_assets = len(assets)
        
        # Get risk profile constraints
        constraints = self.risk_profiles[risk_profile]
        
        # Define bounds for each asset class
        bounds = []
        for asset in assets:
            asset_type = self._map_asset_to_type(asset)
            if asset_type in constraints:
                bounds.append(constraints[asset_type])
            else:
                bounds.append((0, 0.2))  # Default bounds for other asset types
        
        # Function to minimize negative Sharpe ratio
        def neg_sharpe(weights):
            portfolio_return = np.sum(weights * expected_returns)
            portfolio_volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
            return -portfolio_return / portfolio_volatility
        
        # Constraints: weights sum to 1
        constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})
        
        # Initial guess
        init_guess = np.array([1/num_assets] * num_assets)
        
        # Optimize
        result = sco.minimize(neg_sharpe, init_guess, method='SLSQP', bounds=bounds, constraints=constraints)
        
        # Return optimal weights
        return {asset: weight for asset, weight in zip(assets, result['x'])}
    
    def _map_asset_to_type(self, asset):
        """Map specific assets to their asset class"""
        stocks = ["VOO", "VTI", "AAPL", "MSFT", "GOOGL", "AMZN"]
        bonds = ["BND", "VCIT", "VGIT", "MUB", "TLT"]
        cash = ["VMFXX", "SPAXX"]
        
        if asset in stocks:
            return "stocks"
        elif asset in bonds:
            return "bonds"
        elif asset in cash:
            return "cash"
        else:
            return "alternative"
    
    def generate_policy_recommendations(self, user_data, optimized_allocation=None):
        """Generate personalized policy recommendations using both ML and LLM"""
        # Determine risk profile using ML
        risk_profile = self.determine_risk_profile(user_data)
        
        # Extract key financial metrics
        age = user_data.get("age", 35)
        income = user_data.get("income", 50000)
        debt = user_data.get("debt", 30000)
        assets = user_data.get("assets", 50000)
        retirement_savings = user_data.get("currentRetirementSavings", 0)
        
        # Calculate key ratios
        debt_to_income = debt / income if income > 0 else float('inf')
        retirement_gap = max(0, 10 * income - retirement_savings)
        
        # Use LLM to generate personalized recommendations
        prompt = f"""
        Generate personalized financial policy recommendations based on this analysis:
        
        Risk Profile: {risk_profile.capitalize()}
        Key Financial Metrics:
        - Age: {age}
        - Annual Income: ${income:,.2f}
        - Total Debt: ${debt:,.2f}
        - Debt-to-Income Ratio: {debt_to_income:.2f}
        - Total Assets: ${assets:,.2f}
        - Current Retirement Savings: ${retirement_savings:,.2f}
        - Estimated Retirement Gap: ${retirement_gap:,.2f}
        
        Optimized Portfolio Allocation:
        {optimized_allocation or self.risk_profiles[risk_profile]}
        
        Generate detailed recommendations in these areas:
        1. Retirement Strategy
        2. Tax Optimization
        3. Debt Management
        4. Investment Allocation
        5. Insurance Coverage
        
        For each recommendation, provide:
        - Specific actionable steps
        - Quantitative targets where applicable
        - Priority level (High/Medium/Low)
        - Expected financial impact
        
        Format your response as markdown.
        """
        
        recommendations = self.llm_connector.generate(prompt)
        
        return {
            "risk_profile": risk_profile,
            "financial_metrics": {
                "debt_to_income": debt_to_income,
                "retirement_gap": retirement_gap,
                "net_worth": assets - debt,
                "recommended_emergency_fund": income * 0.5,  # 6 months of expenses (estimated as 50% of income)
                "optimal_savings_rate": min(0.3, max(0.15, 0.25 - debt_to_income * 0.1))  # Dynamic based on debt load
            },
            "optimized_allocation": optimized_allocation or self.risk_profiles[risk_profile],
            "recommendations": recommendations
        }