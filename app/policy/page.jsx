"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, Shield, Coins, Receipt, Home, HeartPulse, Lightbulb, CheckCircle, AlertTriangle, FileText, ArrowUpRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Mock portfolio data - replace with real data from your backend
const mockPortfolioData = {
  income: 75000,
  assets: 120000,
  debt: 35000,
  age: 32,
  hasMortgage: true,
  hasHealthInsurance: true,
  dependents: 1,
  savingsRate: 15,
  taxBracket: "22%",
  investmentAllocation: {
    stocks: 60,
    bonds: 20,
    cash: 15,
    other: 5
  }
};

export default function PolicySuggestions() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState('');
  const router = useRouter();

  const categories = [
    { id: 'health', label: 'Health Insurance', icon: <HeartPulse className="h-5 w-5" /> },
    { id: 'loan', label: 'Loan Options', icon: <Home className="h-5 w-5" /> },
    { id: 'tax', label: 'Tax Saving', icon: <Coins className="h-5 w-5" /> },
    { id: 'retirement', label: 'Retirement Planning', icon: <Shield className="h-5 w-5" /> },
    { id: 'investment', label: 'Investment Strategy', icon: <Receipt className="h-5 w-5" /> },
    { id: 'general', label: 'General Advice', icon: <Lightbulb className="h-5 w-5" /> }
  ];

  useEffect(() => {
    if (selectedCategory) {
      generatePrompt(selectedCategory);
    }
  }, [selectedCategory]);

  const generatePrompt = (category) => {
    // Create tailored prompt based on category and portfolio data
    let basePrompt = `Based on a user with an annual income of $${mockPortfolioData.income}, assets worth $${mockPortfolioData.assets}, debts of $${mockPortfolioData.debt}, age ${mockPortfolioData.age} with ${mockPortfolioData.dependents} dependent(s), a savings rate of ${mockPortfolioData.savingsRate}%, and in the ${mockPortfolioData.taxBracket} tax bracket, please provide detailed, actionable `;
    
    let categorySpecificPrompt = '';
    switch(category) {
      case 'health':
        categorySpecificPrompt = `health insurance policy recommendations. The user ${mockPortfolioData.hasHealthInsurance ? 'already has some health insurance' : 'does not have health insurance'}. Include specific types of coverage they should consider, estimated costs, and potential tax implications.`;
        break;
      case 'loan':
        categorySpecificPrompt = `loan refinancing or new loan recommendations. The user ${mockPortfolioData.hasMortgage ? 'has a mortgage' : 'does not have a mortgage'}. Suggest optimal loan structures, interest rates to target, and strategies for debt consolidation if applicable.`;
        break;
      case 'tax':
        categorySpecificPrompt = `tax saving strategies for the coming year. Include specific deductions they might qualify for, tax-advantaged accounts they should utilize, and long-term tax planning considerations.`;
        break;
      case 'retirement':
        categorySpecificPrompt = `retirement planning advice. Analyze if their current savings rate of ${mockPortfolioData.savingsRate}% is adequate, what accounts they should prioritize, and how their allocation might need to shift over time.`;
        break;
      case 'investment':
        categorySpecificPrompt = `investment strategy recommendations. Their current allocation is ${mockPortfolioData.investmentAllocation.stocks}% stocks, ${mockPortfolioData.investmentAllocation.bonds}% bonds, ${mockPortfolioData.investmentAllocation.cash}% cash, and ${mockPortfolioData.investmentAllocation.other}% in other investments. Suggest potential adjustments and specific investment vehicles.`;
        break;
      case 'general':
        categorySpecificPrompt = `financial wellness advice that covers multiple aspects of their financial situation. Provide a holistic review with 3-5 key action items they should prioritize.`;
        break;
    }
    
    const finalPrompt = basePrompt + categorySpecificPrompt + " Format your response with clear markdown headings (## for main headings, ### for subheadings), bullet points for key recommendations, and include a brief explanation for each suggestion. Make sure to include actionable steps the user can take.";
    setPrompt(finalPrompt);
    fetchSuggestions(finalPrompt, category);
  };

  const fetchSuggestions = async (promptText, category) => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from Gemini API
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptText }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      if (data.success && data.text) {
        setSuggestions(data.text);
      } else {
        // If Gemini fails, fall back to mock data
        console.log("Falling back to mock data due to Gemini API issue");
        setSuggestions(getMockResponse(category));
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Fall back to mock data if API call fails
      setSuggestions(getMockResponse(category));
      setError("We encountered an issue with our AI service, showing cached recommendations instead.");
    } finally {
      setLoading(false);
    }
  };

  // Keep mock responses as fallback
  const getMockResponse = (category) => {
    // Mock responses are still available as before
    const responses = {
      health: `## Health Insurance Recommendations

### Key Recommendations:
* **Upgrade to a PPO Plan** - With your income level and dependent, a PPO offers better flexibility
  * Expected monthly premium: $450-550 for family coverage
  * Look for plans with lower deductibles even if premiums are slightly higher
* **Add Health Savings Account (HSA)**
  * Contribute the family maximum of $7,750 annually (2024 limits)
  * Triple tax advantage: tax-deductible contributions, tax-free growth, tax-free withdrawals for medical expenses
* **Consider supplemental coverage**
  * Critical illness insurance: ~$30/month
  * Accident insurance: ~$25/month
* **Dental and Vision**
  * Family dental plan: ~$50-70/month
  * Family vision plan: ~$20-30/month

### Tax Implications:
Premium payments through employer plans are typically pre-tax, reducing your taxable income. HSA contributions further reduce your tax burden by approximately $1,700 annually in your tax bracket.

### Action Steps:
1. Review your employer's open enrollment options
2. Compare PPO vs. HDHP+HSA scenarios for your specific healthcare needs
3. Calculate total out-of-pocket maximums for each option
4. Ensure your preferred providers are in-network for any new plan`,
      // other mock responses remain the same
      tax: `## Tax Saving Strategies

### Key Deductions to Maximize:
* **Retirement Account Contributions**
  * Increase 401(k) contributions to the maximum $23,000 (2024)
  * Potential tax savings: ~$5,060 in your current bracket
* **HSA Contributions**
  * Family contribution limit: $7,750
  * Tax savings: ~$1,705
* **Mortgage Interest Deduction**
  * Ensure you're itemizing if your mortgage interest exceeds standard deduction
* **Dependent Care FSA**
  * Contribute up to $5,000 for dependent care
  * Estimated tax savings: $1,100

### Tax-Advantaged Accounts:
* **Roth IRA** - Consider backdoor Roth contributions
* **529 College Savings Plan** - State tax deductions available in many states
* **I Bonds** - Tax-deferred federal and tax-free state interest

### Long-Term Strategies:
* **Tax-Loss Harvesting** - Strategically realize investment losses to offset gains
* **Charitable Giving** - Bunch donations every other year to exceed standard deduction
* **Municipal Bonds** - Consider tax-exempt interest for higher after-tax returns

### Action Steps:
1. Increase retirement contributions immediately
2. Set up an HSA if eligible
3. Review itemized deductions with a tax professional
4. Create a tax projection for next year to identify additional opportunities`,
      // Include other mock responses as before
    };

    return responses[category] || "No specific recommendations available for this category. Please try another category.";
  };

  // Style components for ReactMarkdown to make the content more attractive
  const MarkdownComponents = {
    h2: (props) => <h2 className="text-2xl font-bold text-blue-700 border-b pb-2 mb-4 mt-6" {...props} />,
    h3: (props) => <h3 className="text-xl font-semibold text-blue-600 mt-5 mb-2" {...props} />,
    ul: (props) => <ul className="list-disc pl-6 my-4 space-y-2" {...props} />,
    ol: (props) => <ol className="list-decimal pl-6 my-4 space-y-1" {...props} />,
    li: (props) => <li className="mb-1" {...props} />,
    p: (props) => <p className="my-3 text-gray-700" {...props} />,
    strong: (props) => <strong className="font-bold text-gray-900" {...props} />,
    a: (props) => <a className="text-blue-600 hover:underline hover:text-blue-800 inline-flex items-center" target="_blank" rel="noopener noreferrer" {...props}><span>{props.children}</span><ArrowUpRight className="h-3 w-3 ml-1" /></a>
  };

  const getSectionIcon = (title) => {
    title = title.toLowerCase();
    if (title.includes('recommend') || title.includes('key')) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (title.includes('action') || title.includes('step')) return <ArrowRight className="h-5 w-5 text-blue-500" />;
    if (title.includes('risk') || title.includes('caution') || title.includes('avoid')) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    if (title.includes('tax') || title.includes('consider') || title.includes('strategy')) return <FileText className="h-5 w-5 text-purple-500" />;
    return <BookOpen className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Financial Policy Suggestions</h1>
      <p className="text-gray-600 mb-8">
        Get personalized policy and financial advice based on your portfolio details. Select a category below to see recommendations.
      </p>

      {!selectedCategory ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Select a category:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md hover:border-blue-500 flex flex-col items-center text-center"
              >
                <div className="bg-blue-100 p-4 rounded-full mb-3 text-blue-600">
                  {category.icon}
                </div>
                <h3 className="font-medium mb-2">{category.label}</h3>
                <p className="text-sm text-gray-500 mb-4">Get advice on {category.label.toLowerCase()}</p>
                <button className="mt-auto text-blue-600 hover:text-blue-800 flex items-center text-sm">
                  View Suggestions <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {categories.find(c => c.id === selectedCategory)?.label} Suggestions
            </h2>
            <button 
              onClick={() => setSelectedCategory('')} 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Back to categories
            </button>
          </div>

          <div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="bg-blue-50 border-b p-4">
              <h3 className="font-medium">Your Portfolio Summary</h3>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Annual Income</p>
                <p className="font-semibold">${mockPortfolioData.income.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Assets</p>
                <p className="font-semibold">${mockPortfolioData.assets.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Debt</p>
                <p className="font-semibold">${mockPortfolioData.debt.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Savings Rate</p>
                <p className="font-semibold">{mockPortfolioData.savingsRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="border-b p-4 flex justify-between items-center">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="font-medium">Personalized Suggestions</h3>
              </div>
              {loading && <p className="text-sm text-gray-500">Generating suggestions...</p>}
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center py-12">
                  <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500">Analyzing your portfolio and generating personalized suggestions...</p>
                </div>
              ) : (
                <div>
                  {error && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6 text-sm flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      {error}
                    </div>
                  )}
                  <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]}>
                    {suggestions || ''}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}